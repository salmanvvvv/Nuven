"""Shared helpers for the narration scripts (voice.py: Kokoro TTS, align.py: recorded voice)."""
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

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



def finish_scenes(scenes, last_tail):
    """Scene windows: each starts a beat before its voice and runs until the next one starts."""
    for i, s in enumerate(scenes):
        s["start"] = 0.0 if i == 0 else round(max(scenes[i - 1]["vo_end"] + 0.15, s["vo_start"] - 0.35), 3)
    for i, s in enumerate(scenes):
        s["end"] = scenes[i + 1]["start"] if i + 1 < len(scenes) else round(s["vo_end"] + last_tail, 3)
    return scenes[-1]["end"]


def write_outputs(scenes, words, duration, voice, speed=1.0):
    """content/timings.json + content/subtitulos.srt"""
    captions = caption_cards(words)
    for a, b in zip(captions, captions[1:]):  # never overlap
        a["end"] = min(a["end"], b["start"])
    timings = {"duration": round(duration, 3), "voice": voice, "speed": speed, "scenes": scenes, "words": words, "captions": captions}
    (ROOT / "content/timings.json").write_text(json.dumps(timings, ensure_ascii=False, indent=1))
    (ROOT / "content/subtitulos.srt").write_text(
        "\n".join(f"{i + 1}\n{srt_time(c['start'])} --> {srt_time(c['end'])}\n{c['text']}\n" for i, c in enumerate(captions)), encoding="utf-8"
    )
    return captions
