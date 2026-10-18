#!/usr/bin/env python3
"""Speech-to-text check of assets/voz.mp3, chunk by chunk between the real pauses
(sherpa-onnx + Whisper small, offline). Prints each chunk with its times, so the
script in content/guion.json can be checked against what the take really says.

  python3 scripts/asr_chunks.py <whisper model dir>
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np
import sherpa_onnx

ROOT = Path(__file__).resolve().parent.parent
mdir = Path(sys.argv[1])
SR = 16000
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ROOT / "assets/voz.mp3"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(raw, dtype=np.float32).copy()
rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=str(next(mdir.glob("*-encoder.int8.onnx"))), decoder=str(next(mdir.glob("*-decoder.int8.onnx"))),
    tokens=str(next(mdir.glob("*-tokens.txt"))), language="es", task="transcribe", num_threads=4)
hop = SR // 100
rms = np.array([np.sqrt(np.mean(audio[i * hop:(i + 1) * hop] ** 2)) for i in range(len(audio) // hop)])
quiet = rms < np.percentile(rms, 95) * 10 ** (-32 / 20)
cuts, i = [], 0
while i < len(quiet):
    if quiet[i]:
        j = i
        while j < len(quiet) and quiet[j]: j += 1
        if (j - i) >= 18: cuts.append((i + j) / 2 * 0.01)
        i = j
    else: i += 1
edges = [0.0] + [c for c in cuts if 0.3 < c < len(audio) / SR - 0.3] + [len(audio) / SR]
chunks = []
for a, b in zip(edges, edges[1:]):
    s = rec.create_stream(); s.accept_waveform(SR, audio[int(a * SR):int(b * SR)]); rec.decode_stream(s)
    chunks.append({"start": round(a, 3), "end": round(b, 3), "text": s.result.text.strip()})
    print(f"{a:6.2f}–{b:6.2f}  {chunks[-1]['text']}")
(ROOT / "content/asr.json").write_text(json.dumps({"_info": "Whisper small (sherpa-onnx) sobre assets/voz.mp3, por tramos entre pausas. Lo usa scripts/timing.py para anclar el guion.", "chunks": chunks}, ensure_ascii=False, indent=1))
print("✓ content/asr.json")
