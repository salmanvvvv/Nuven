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

ROOT = Path(__file__).resolve().parents[1]
CACHE = Path.home() / ".cache/hyperframes/tts"
MODEL = CACHE / "models/kokoro-v1.0.onnx"
VOICES = CACHE / "voices/voices-v1.0.bin"
SR_OUT = 48000

cfg = json.loads((ROOT / "content/narracion.json").read_text())
if not MODEL.exists():
    sys.exit("Falta el modelo de Kokoro: ejecuta una vez `npx hyperframes tts \"hola\" --voice ef_dora` para descargarlo.")
kokoro = Kokoro(str(MODEL), str(VOICES))

TOKEN = re.compile(r"\{([^|}]+)\|([^}]+)\}|(\S+)")
PUNCT = re.compile(r"^[,.;:!?¿¡…]+$")


def parse(sentence):
    """Units: {'say': spoken words, 'show': on-screen text}. Punctuation sticks to the previous unit."""
    units = []
    for m in TOKEN.finditer(sentence):
        if m.group(3) is not None:
            w = m.group(3)
            if PUNCT.match(w) and units:
                units[-1]["say"] += w
                units[-1]["show"] += w
                continue
            units.append({"say": w, "show": w})
        else:
            units.append({"say": m.group(1), "show": m.group(2)})
    return units


def phonemes(text):
    out = subprocess.run(["espeak-ng", "-v", "es", "-q", "-x", re.sub(r"[¿¡?!.,;:]", "", text)], capture_output=True, text=True).stdout
    return max(1, len(re.sub(r"[^a-zA-Z@]", "", out)))


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


def caption_cards(words, max_chars=44):
    """Subtitle cards (≤ 2 lines): split each sentence at its punctuation, merge short
    clauses, and cut long ones into balanced parts so no card ends on an orphan."""
    length = lambda ws: len(" ".join(w["text"] for w in ws))
    # sentences → clauses
    clauses, cur = [], []
    for w in words:
        cur.append(w)
        if re.search(r"[.?!,;:]$", w["text"]):
            clauses.append((cur, bool(re.search(r"[.?!]$", w["text"]))))
            cur = []
    if cur:
        clauses.append((cur, True))
    # merge consecutive clauses of one sentence while they fit
    merged, acc = [], []
    for ws, ends in clauses:
        if acc and length(acc + ws) <= max_chars:
            acc = acc + ws
        else:
            if acc:
                merged.append(acc)
            acc = list(ws)
        if ends:
            merged.append(acc)
            acc = []
    if acc:
        merged.append(acc)
    # balance anything still too long
    cards = []
    for ws in merged:
        n = -(-length(ws) // max_chars)
        if n <= 1:
            cards.append(ws)
            continue
        target = length(ws) / n
        part, run = [], 0
        for w in ws:
            if part and run + len(w["text"]) / 2 > target and len(cards) < 999:
                cards.append(part)
                part, run = [], 0
            part.append(w)
            run += len(w["text"]) + 1
        cards.append(part)
    return [{"start": round(c[0]["start"], 3), "end": round(c[-1]["end"] + 0.12, 3), "text": " ".join(x["text"] for x in c)} for c in cards]


def srt_time(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


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

# scene windows: each scene starts a beat before its voice and runs until the next one starts
for i, s in enumerate(scenes):
    s["start"] = 0.0 if i == 0 else round(max(scenes[i - 1]["vo_end"] + 0.15, s["vo_start"] - 0.35), 3)
for i, s in enumerate(scenes):
    s["end"] = scenes[i + 1]["start"] if i + 1 < len(scenes) else round(s["vo_end"] + s["tail"], 3)
duration = scenes[-1]["end"]

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

captions = caption_cards(words)
for a, b in zip(captions, captions[1:]):  # never overlap
    a["end"] = min(a["end"], b["start"])
timings = {"duration": round(duration, 3), "voice": voice, "speed": speed, "scenes": scenes, "words": words, "captions": captions}
(ROOT / "content/timings.json").write_text(json.dumps(timings, ensure_ascii=False, indent=1))
(ROOT / "content/subtitulos.srt").write_text(
    "\n".join(f"{i + 1}\n{srt_time(c['start'])} --> {srt_time(c['end'])}\n{c['text']}\n" for i, c in enumerate(captions)), encoding="utf-8"
)

print(f"✓ narration.wav · {duration:.2f}s · voz {voice} · {len(words)} palabras · {len(captions)} subtítulos")
for s in scenes:
    print(f"  {s['id']:<10} {s['start']:6.2f} → {s['end']:6.2f}   (voz {s['vo_start']:.2f}–{s['vo_end']:.2f})")
