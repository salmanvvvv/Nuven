#!/usr/bin/env python3
"""
Voz en off + tiempos + subtítulos para «nuven-informativo».

  python3 scripts/voice.py          (npm run voice)

Lee content/narracion.json y, con Kokoro (TTS local, sin API), genera:
  assets/audio/narration.wav   locución completa colocada en su sitio (48 kHz)
  content/timings.json         inicio/fin de cada escena, frase, palabra y subtítulo
  content/subtitulos.srt       subtítulos en español

Cada frase se sintetiza entera para conservar la entonación. Los tiempos de cada
palabra salen de la propia síntesis: las pausas reales del audio anclan las comas
y, dentro de cada tramo, el tiempo se reparte según los fonemas de cada palabra
(espeak-ng). Así los subtítulos quedan sincronizados por construcción, sin
depender de un modelo de transcripción.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

from narrlib import ROOT, finish_scenes, parse, phonemes, write_outputs

CACHE = Path.home() / ".cache/hyperframes/tts"
MODEL = CACHE / "models/kokoro-v1.0.onnx"
VOICES = CACHE / "voices/voices-v1.0.bin"
SR_OUT = 48000

cfg = json.loads((ROOT / "content/narracion.json").read_text())
if not MODEL.exists():
    sys.exit("Falta el modelo de Kokoro: ejecuta una vez `npx hyperframes tts \"hola\" --voice ef_dora` para descargarlo.")
kokoro = Kokoro(str(MODEL), str(VOICES))

def silences(audio, sr, min_len=0.07):
    """Interior silent runs as (start, end) seconds."""
    hop = int(sr * 0.01)
    frames = len(audio) // hop
    rms = np.array([np.sqrt(np.mean(audio[i * hop : (i + 1) * hop] ** 2)) for i in range(frames)])
    thr = rms.max() * 0.035
    quiet = rms < thr
    runs, i = [], 0
    while i < frames:
        if quiet[i]:
            j = i
            while j < frames and quiet[j]:
                j += 1
            if i > 0 and j < frames and (j - i) * 0.01 >= min_len:
                runs.append((i * 0.01, j * 0.01))
            i = j
        else:
            i += 1
    return runs


def time_words(units, audio, sr):
    """Start/end of every unit inside the sentence audio."""
    dur = len(audio) / sr
    weights = [phonemes(u["say"]) + 1.5 for u in units]  # +1.5: a little time for word joins
    total = sum(weights)
    # clause boundaries: units ending in , ; :
    bounds = [i for i, u in enumerate(units[:-1]) if re.search(r"[,;:]$", u["say"])]
    runs = silences(audio, sr)
    used = set()
    anchors = {}  # unit index -> (clause end, next clause start)
    for b in bounds:
        est = dur * sum(weights[: b + 1]) / total
        best = None
        for n, (s, e) in enumerate(runs):
            if n in used:
                continue
            d = abs((s + e) / 2 - est)
            if d < 0.6 and (best is None or d < best[0]):
                best = (d, n, s, e)
        if best:
            used.add(best[1])
            anchors[b] = (best[2], best[3])
    # walk clause by clause
    times = [None] * len(units)
    start_i, t0 = 0, 0.0
    for b in sorted(anchors) + [len(units) - 1]:
        t1 = anchors[b][0] if b in anchors else dur
        seg = range(start_i, b + 1)
        w = sum(weights[i] for i in seg)
        t = t0
        for i in seg:
            d = (t1 - t0) * weights[i] / w
            times[i] = (t, t + d)
            t += d
        start_i = b + 1
        t0 = anchors[b][1] if b in anchors else dur
    return times


# ── synthesize and place every sentence ─────────────────────────────
voice, speed = cfg["voice"], cfg.get("speed", 1.0)
t = cfg["lead_in"]
clips, scenes, words = [], [], []
for si, scene in enumerate(cfg["scenes"]):
    vo_start = t
    for sentence in scene["sentences"]:
        units = parse(sentence)
        say = " ".join(u["say"] for u in units)
        audio, sr = kokoro.create(say, voice=voice, speed=speed, lang="es")
        audio = np.asarray(audio, dtype=np.float32)
        times = time_words(units, audio, sr)
        clips.append((t, audio, sr))
        for u, (a, b) in zip(units, times):
            words.append({"scene": scene["id"], "text": u["show"], "say": u["say"], "start": round(t + a, 3), "end": round(t + b, 3)})
        t += len(audio) / sr + cfg["sentence_gap"]
    vo_end = t - cfg["sentence_gap"]
    scenes.append({"id": scene["id"], "vo_start": round(vo_start, 3), "vo_end": round(vo_end, 3), "tail": scene["tail"]})
    t = vo_end + max(cfg["scene_gap"], scene["tail"] if si < len(cfg["scenes"]) - 1 else 0)

duration = finish_scenes(scenes, scenes[-1]["tail"])

# ── write narration.wav (mono → stereo 48 kHz) ──────────────────────
sr = clips[0][2]
buf = np.zeros(int(np.ceil(duration * sr)) + sr, dtype=np.float32)
for start, audio, _ in clips:
    i = int(round(start * sr))
    buf[i : i + len(audio)] += audio
buf = buf[: int(np.ceil(duration * sr))]
tmp = ROOT / "assets/audio/.narration-24k.wav"
tmp.parent.mkdir(parents=True, exist_ok=True)
sf.write(tmp, buf, sr)
out = ROOT / "assets/audio/narration.wav"
# voice at -16 LUFS on its own; the final mix lands at -14 LUFS with the bed
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af", "loudnorm=I=-16:TP=-2:LRA=7,aresample=48000", "-ac", "2", "-ar", str(SR_OUT), str(out)], check=True)
tmp.unlink()

captions = write_outputs(scenes, words, duration, voice, speed)

print(f"✓ narration.wav · {duration:.2f}s · voz {voice} · {len(words)} palabras · {len(captions)} subtítulos")
for s in scenes:
    print(f"  {s['id']:<10} {s['start']:6.2f} → {s['end']:6.2f}   (voz {s['vo_start']:.2f}–{s['vo_end']:.2f})")
