#!/usr/bin/env python3
"""
assets/voz.mp3 + content/guion.json → content/timing.json, content/subtitulos.srt, assets/envelope.json

  python3 scripts/timing.py            (npm run timing)

The voice is the source of truth and is never edited: every time in timing.json is
a time in voz.mp3. No speech model is needed (the script already knows the words):
  1. find the real pauses in the take,
  2. match them, in order, to the sentence ends, ellipses and commas of the script
     (dynamic programming; sentence ends strongly prefer long pauses),
  3. spread each stretch of speech over its words by phoneme count,
  4. derive scenes, keyword triggers, word-by-word caption pages and the .srt,
  5. sample the voice envelope at 60 Hz for the audio-wave pill.
"""
import json
import re
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 24000
FPS_ENV = 60
cfg = json.loads((ROOT / "content/guion.json").read_text())
src = ROOT / cfg["audio"]

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(src), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(raw, dtype=np.float32).copy()
voice_len = len(audio) / SR
duration = voice_len + cfg.get("tail", 0)  # the video holds the end card in silence after the voice

# ── 1 · pauses ──────────────────────────────────────────────────────
hop = SR // 100
rms = np.array([np.sqrt(np.mean(audio[i * hop : (i + 1) * hop] ** 2)) for i in range(len(audio) // hop)])
thr = np.percentile(rms, 95) * 10 ** (-32 / 20)
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

# ── 2 · script → words ──────────────────────────────────────────────
def phonemes(text):
    out = subprocess.run(["espeak-ng", "-v", "es", "-q", "-x", re.sub(r"[¿¡?!.,;:…*]", "", text)], capture_output=True, text=True).stdout
    return max(1, len(re.sub(r"[^a-zA-Z@]", "", out)))


units = []  # one per word
for si, scene in enumerate(cfg["scenes"]):
    for li, line in enumerate(scene["lines"]):
        key = False
        toks = line["text"].split()
        for k, tok in enumerate(toks):
            opens, closes = tok.lstrip("¿¡").startswith("*"), bool(re.search(r"\*[.,;:!?…]*$", tok))
            if opens:
                key = True
            word = tok.replace("*", "")
            units.append({
                "text": word, "scene": scene["id"], "si": si, "line": f"{si}.{li}", "speaker": line["speaker"],
                "key": key, "w": phonemes(word) + 1.5,
                "sent_end": k == len(toks) - 1, "comma": bool(re.search(r"(,|…|;|:)$", word)),
            })
            if closes:
                key = False

total_w = sum(u["w"] for u in units)
bounds, cum = [], 0.0
speech = sp_end - sp_start - sum(e - s for s, e in pauses) * 0.6
for n, u in enumerate(units[:-1]):
    cum += u["w"]
    if u["sent_end"] or u["comma"]:
        bounds.append({"unit": n, "est": sp_start + speech * cum / total_w, "sent": u["sent_end"]})

B, P = len(bounds), len(pauses)
cost = np.full((B + 1, P + 1), 1e9)
back = {}
cost[0, 0] = 0
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

# ── 3 · word times ──────────────────────────────────────────────────
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

# ── 3b · anchor to the speech-to-text chunks when available (content/asr.json) ──
# Each chunk (between two real pauses) is matched to its script words; inside a chunk the
# words share the voiced time by phoneme count. Much more robust than step 2's estimate.
asr_path = ROOT / "content/asr.json"
anchor_mode = "pausas"
if asr_path.exists():
    import difflib
    import unicodedata
    NUM = {"20": "veinte", "6": "seis", "24": "veinticuatro"}
    def norm(w):
        w = NUM.get(re.sub(r"[^0-9]", "", w), w) if re.search(r"\d", w) else w
        w = unicodedata.normalize("NFD", w.lower())
        return re.sub(r"[^a-zñ]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))
    chunks = json.loads(asr_path.read_text())["chunks"]
    asr_words, asr_chunk = [], []
    for ci, c in enumerate(chunks):
        for w in c["text"].split():
            if norm(w):
                asr_words.append(norm(w)); asr_chunk.append(ci)
    script = [norm(u["text"]) for u in units]
    owner = [None] * len(units)
    for blk in difflib.SequenceMatcher(None, script, asr_words, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            owner[blk.a + k] = asr_chunk[blk.b + k]
    for k in range(len(owner)):  # unmatched words follow their own sentence: the previous word's chunk, or the next one at a sentence start
        if owner[k] is None:
            same_line = k > 0 and units[k - 1]["line"] == units[k]["line"] and not re.search(r"[,;:…]$", units[k - 1]["text"])
            owner[k] = owner[k - 1] if same_line else next((o for o in owner[k:] if o is not None), owner[k - 1])
    for k in range(1, len(owner)):  # keep it monotonic
        owner[k] = max(owner[k], owner[k - 1])

    def voiced_span(a, b):
        fr = np.arange(int(a * 100), min(int(b * 100), len(quiet)))
        v = fr[~quiet[fr]]
        return (v[0] * 0.01, (v[-1] + 1) * 0.01) if len(v) else (a, b)

    for ci in sorted(set(owner)):
        idx = [k for k in range(len(units)) if owner[k] == ci]
        a, b = voiced_span(chunks[ci]["start"], chunks[ci]["end"])
        w = sum(units[k]["w"] for k in idx)
        t = a
        for k in idx:
            d = (b - a) * units[k]["w"] / w
            times[k] = (t, t + d)
            t += d
    matched = sum(1 for blk in difflib.SequenceMatcher(None, script, asr_words, autojunk=False).get_matching_blocks() for _ in range(blk.size))
    anchor_mode = f"asr ({matched}/{len(script)} palabras reconocidas, {len(chunks)} tramos)"

r3 = lambda x: round(float(x), 3)
words = [{"i": n, "text": u["text"], "scene": u["scene"], "line": u["line"], "speaker": u["speaker"], "key": u["key"],
          "start": r3(a), "end": r3(b)} for n, (u, (a, b)) in enumerate(zip(units, times))]

# ── 4 · scenes, lines, keywords, captions ───────────────────────────
lines = []
for w in words:
    if not lines or lines[-1]["id"] != w["line"]:
        lines.append({"id": w["line"], "scene": w["scene"], "speaker": w["speaker"], "start": w["start"], "end": w["end"], "text": w["text"]})
    else:
        lines[-1]["end"], lines[-1]["text"] = w["end"], lines[-1]["text"] + " " + w["text"]

scenes = []
for si, scene in enumerate(cfg["scenes"]):
    ws = [w for w in words if w["scene"] == scene["id"]]
    scenes.append({"id": scene["id"], "vo_start": ws[0]["start"], "vo_end": ws[-1]["end"]})
for n, s in enumerate(scenes):  # a scene starts a beat before its first word and runs until the next one
    s["start"] = 0.0 if n == 0 else r3(max(scenes[n - 1]["vo_end"] + 0.05, s["vo_start"] - 0.3))
for n, s in enumerate(scenes):
    s["end"] = scenes[n + 1]["start"] if n + 1 < len(scenes) else r3(duration)

# keyword phrases (consecutive key words of one line) → animation triggers
keywords = []
for w in words:
    if not w["key"]:
        continue
    if keywords and keywords[-1]["words"][-1] == w["i"] - 1 and keywords[-1]["line"] == w["line"] and not re.search(r"[,.;:…]$", words[w["i"] - 1]["text"]):
        k = keywords[-1]
        k["words"].append(w["i"]); k["end"] = w["end"]; k["text"] += " " + w["text"]
    else:
        keywords.append({"text": w["text"], "line": w["line"], "scene": w["scene"], "words": [w["i"]], "start": w["start"], "end": w["end"]})
for k in keywords:
    k["text"] = re.sub(r"[.,;:!?…¿¡]", "", k["text"])

# caption pages: ≤ 2 lines of ≤ 18 characters, broken at punctuation first, never across a speaker change
MAX_LINE, MAX_LINES = 18, 2
def layout(ws):
    out, cur = [], []
    for w in ws:
        if cur and len(" ".join(x["text"] for x in cur + [w])) > MAX_LINE:
            out.append(cur); cur = []
        cur.append(w)
    if cur:
        out.append(cur)
    return out

pages, cur = [], []
for n, w in enumerate(words):
    nxt = words[n + 1] if n + 1 < len(words) else None
    cur.append(w)
    hard = nxt is None or nxt["line"] != w["line"]  # every sentence opens a new page
    punct = bool(re.search(r"[.?!…,;:]$", w["text"]))
    too_long = nxt is not None and len(layout(cur + [nxt])) > MAX_LINES
    gap = nxt is not None and nxt["start"] - w["end"] > 0.45
    if hard or too_long or gap or (punct and len(layout(cur)) >= 1 and len(" ".join(x["text"] for x in cur)) >= 12):
        pages.append(cur); cur = []
cards = []
for pg in pages:
    rows = layout(pg)
    cards.append({"start": pg[0]["start"], "end": pg[-1]["end"], "speaker": pg[0]["speaker"],
                  "rows": [[x["i"] for x in r] for r in rows], "text": " ".join(x["text"] for x in pg)})
for a, b in zip(cards, cards[1:]):
    a["end"] = r3(min(b["start"], a["end"] + 0.5))
cards[-1]["end"] = r3(min(duration, cards[-1]["end"] + 0.8))

# ── 5 · envelope (60 Hz, 0–1, smoothed with fast attack / slower release) ──
n_env = int(np.ceil(voice_len * FPS_ENV))
seg = SR // FPS_ENV
env = np.array([np.sqrt(np.mean(audio[i * seg : (i + 1) * seg] ** 2)) if i * seg < len(audio) else 0 for i in range(n_env)])
env = env / (np.percentile(env, 98) + 1e-9)
sm, out = 0.0, []
for v in np.clip(env, 0, 1.2):
    sm = v if v > sm else sm * 0.82 + v * 0.18
    out.append(round(float(min(sm, 1.0)), 3))
(ROOT / "assets/envelope.json").write_text(json.dumps({"fps": FPS_ENV, "values": out}, separators=(",", ":")))

# ── outputs ─────────────────────────────────────────────────────────
timing = {
    "_info": "Generado por scripts/timing.py a partir de assets/voz.mp3 y content/guion.json. No editar a mano.",
    "audio": cfg["audio"], "duration": r3(duration), "voice_length": r3(voice_len), "speech": [r3(sp_start), r3(sp_end)],
    "scenes": scenes, "lines": lines, "keywords": keywords, "captions": cards, "words": words,
    "envelope": "assets/envelope.json",
}
(ROOT / "content/timing.json").write_text(json.dumps(timing, ensure_ascii=False, indent=1))
# browser copy for the compositions (no fetch at render time)
(ROOT / "assets/timing.js").write_text("// Generado por scripts/timing.py — no editar a mano.\nwindow.NUVEN_TIMING = " + json.dumps(timing, ensure_ascii=False) + ";\nwindow.NUVEN_ENVELOPE = " + json.dumps({"fps": FPS_ENV, "values": out}, separators=(",", ":")) + ";\n")


def srt_time(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


(ROOT / "content/subtitulos.srt").write_text("\n".join(
    f"{n + 1}\n{srt_time(c['start'])} --> {srt_time(c['end'])}\n" + "\n".join(" ".join(words[i]["text"] for i in r) for r in c["rows"]) + "\n"
    for n, c in enumerate(cards)), encoding="utf-8")

n_sent = sum(1 for b in bounds if b["sent"]); ok_sent = sum(1 for b in bounds if b["sent"] and b["unit"] in anchors)
print(f"✓ timing.json · {duration:.2f}s · anclaje: {anchor_mode if anchor_mode != 'pausas' else f'pausas, frases {ok_sent}/{n_sent}'} · {len(cards)} páginas de subtítulos · {len(keywords)} palabras clave")
for l in lines:
    print(f"  {l['start']:6.2f}–{l['end']:6.2f}  [{l['speaker']}] {l['text']}")
