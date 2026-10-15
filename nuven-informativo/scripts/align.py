#!/usr/bin/env python3
"""
Recorded voiceover (ElevenLabs, a voice actor…) → narration + timings + subtitles.

  python3 scripts/align.py assets/audio/voz-elevenlabs.mp3      (npm run align -- <file>)

The recording must read content/narracion.json in order (one take). The script:
  1. finds the real pauses in the recording,
  2. matches them to the sentence ends and commas of the script (dynamic
     programming: monotonic, sentence ends strongly prefer long pauses),
  3. spreads each stretch of speech over its words by phoneme count,
  4. lays the take into the video: lead-in, and a little extra breath at each
     scene change so the transitions have room, plus the end-card tail,
  5. writes assets/audio/narration.wav, content/timings.json and content/subtitulos.srt.
No transcription model needed — the script already knows the words.
"""
import json
import subprocess
import sys

import numpy as np

from narrlib import ROOT, finish_scenes, parse, phonemes, write_outputs

SR = 24000
cfg = json.loads((ROOT / "content/narracion.json").read_text())
src = sys.argv[1] if len(sys.argv) > 1 else str(ROOT / cfg.get("recording", ""))
if not src or not (ROOT / src).exists() and not __import__("os").path.exists(src):
    sys.exit("uso: python3 scripts/align.py <audio de la voz>  (o pon \"recording\" en content/narracion.json)")

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(raw, dtype=np.float32).copy()

# ── 1 · pauses ──────────────────────────────────────────────────────
hop = SR // 100
rms = np.array([np.sqrt(np.mean(audio[i * hop : (i + 1) * hop] ** 2)) for i in range(len(audio) // hop)])
thr = np.percentile(rms, 95) * 10 ** (-32 / 20)  # 32 dB under loud speech
quiet = rms < thr
voiced = np.where(~quiet)[0]
sp_start, sp_end = voiced[0] * 0.01, (voiced[-1] + 1) * 0.01
pauses, i = [], 0
while i < len(quiet):
    if quiet[i]:
        j = i
        while j < len(quiet) and quiet[j]:
            j += 1
        if i * 0.01 > sp_start and j * 0.01 < sp_end and (j - i) * 0.01 >= 0.09:
            pauses.append((i * 0.01, j * 0.01))
        i = j
    else:
        i += 1

# ── 2 · script units and boundaries ─────────────────────────────────
units = []  # {say, show, scene, w, sent_end, comma}
for si, scene in enumerate(cfg["scenes"]):
    for sentence in scene["sentences"]:
        us = parse(sentence)
        for k, u in enumerate(us):
            u.update(scene=scene["id"], si=si, w=phonemes(u["say"]) + 1.5, sent_end=k == len(us) - 1, comma=u["say"].rstrip()[-1:] in ",;:")
            units.append(u)
total_w = sum(u["w"] for u in units)
bounds, cum = [], 0.0
for n, u in enumerate(units[:-1]):
    cum += u["w"]
    if u["sent_end"] or u["comma"]:
        speech = sp_end - sp_start - sum(e - s for s, e in pauses) * 0.6
        bounds.append({"unit": n, "est": sp_start + speech * cum / total_w, "sent": u["sent_end"]})

# DP: match boundaries to pauses in order; drift-tolerant via relative costs
B, P = len(bounds), len(pauses)
INF = 1e9
cost = np.full((B + 1, P + 1), INF)
back = {}
cost[0, :] = 0  # skipping leading pauses is free-ish (handled below)
for p in range(1, P + 1):
    cost[0, p] = cost[0, p - 1] + 0.3
for b in range(1, B + 1):
    bd = bounds[b - 1]
    skip_b = 6.0 if bd["sent"] else 0.8
    cost[b, 0] = cost[b - 1, 0] + skip_b
    back[(b, 0)] = (b - 1, 0, False)
    for p in range(1, P + 1):
        s, e = pauses[p - 1]
        L = e - s
        match = cost[b - 1, p - 1] + abs((s + e) / 2 - bd["est"]) * 0.8 - (3.0 * L if bd["sent"] else 1.2 * min(L, 0.25))
        opts = [(match, (b - 1, p - 1, True)), (cost[b - 1, p] + skip_b, (b - 1, p, False)), (cost[b, p - 1] + 0.3, (b, p - 1, None))]
        cost[b, p], back[(b, p)] = min(opts, key=lambda o: o[0])
b, p = B, int(np.argmin(cost[B]))
anchors = {}
while b > 0:
    pb, pp, matched = back[(b, p)]
    if matched:
        anchors[bounds[b - 1]["unit"]] = pauses[p - 1]
    b, p = pb, pp
n_sent = sum(1 for bd in bounds if bd["sent"])
n_sent_ok = sum(1 for bd in bounds if bd["sent"] and bd["unit"] in anchors)

# ── 3 · word times inside the take ──────────────────────────────────
times, start_i, t0 = [None] * len(units), 0, sp_start
for a in sorted(anchors) + [len(units) - 1]:
    t1 = anchors[a][0] if a in anchors else sp_end
    seg = range(start_i, a + 1)
    w = sum(units[k]["w"] for k in seg)
    t = t0
    for k in seg:
        d = (t1 - t0) * units[k]["w"] / w
        times[k] = (t, t + d)
        t += d
    start_i, t0 = a + 1, (anchors[a][1] if a in anchors else sp_end)

# ── 4 · lay the take into the video timeline ────────────────────────
# split the take at each scene change (inside its pause) and add breath there
lead = cfg["lead_in"]
min_scene_pause = cfg.get("recording_scene_pause", 0.55)
cuts = []  # (take_time, extra_seconds)
for k in range(len(units) - 1):
    if units[k]["si"] != units[k + 1]["si"]:
        s, e = anchors.get(k, (times[k][1], times[k + 1][0]))
        cuts.append(((s + e) / 2, max(0.0, min_scene_pause - (e - s))))


def to_video(t):
    return lead - sp_start + t + sum(extra for c, extra in cuts if t >= c)


words = [{"scene": u["scene"], "text": u["show"], "say": u["say"], "start": round(to_video(a), 3), "end": round(to_video(b), 3)} for u, (a, b) in zip(units, times)]
scenes = []
for si, scene in enumerate(cfg["scenes"]):
    ws = [w for w in words if w["scene"] == scene["id"]]
    scenes.append({"id": scene["id"], "vo_start": ws[0]["start"], "vo_end": ws[-1]["end"], "tail": scene["tail"]})
duration = finish_scenes(scenes, cfg["scenes"][-1]["tail"])

# render the placed take: pieces between cuts, shifted by the accumulated breath
out = np.zeros(int(np.ceil(duration * SR)) + SR, dtype=np.float32)
edges = [max(0.0, sp_start - 0.05)] + [c for c, _ in cuts] + [min(len(audio) / SR, sp_end + 0.3)]
for n in range(len(edges) - 1):
    a, b = int(edges[n] * SR), int(edges[n + 1] * SR)
    piece = audio[a:b].copy()
    fade = min(len(piece) // 2, int(0.01 * SR))
    piece[:fade] *= np.linspace(0, 1, fade)
    piece[-fade:] *= np.linspace(1, 0, fade)
    # same mapping as the word times: lead-in + breath added at every earlier scene cut
    o = int(round((lead - sp_start + edges[n] + sum(extra for c, extra in cuts if c <= edges[n])) * SR))
    out[o : o + len(piece)] += piece
out = out[: int(np.ceil(duration * SR))]
tmp = ROOT / "assets/audio/.narration-raw.f32"
out.tofile(tmp)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", str(tmp),
                "-af", "loudnorm=I=-16:TP=-2:LRA=9,aresample=48000", "-ac", "2", "-ar", "48000", str(ROOT / "assets/audio/narration.wav")], check=True)
tmp.unlink()

captions = write_outputs(scenes, words, duration, voice=f"grabación: {src.split('/')[-1]}")
print(f"✓ narration.wav · {duration:.2f}s · {len(pauses)} pausas · frases ancladas {n_sent_ok}/{n_sent} · comas {len(anchors) - n_sent_ok}/{len(bounds) - n_sent}")
for s in scenes:
    print(f"  {s['id']:<10} {s['start']:6.2f} → {s['end']:6.2f}   (voz {s['vo_start']:.2f}–{s['vo_end']:.2f})")
