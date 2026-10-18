#!/bin/sh
# assets/voz.mp3 (untouched source of truth) → assets/audio/voz-master.wav for the mix:
# gentle EQ (low cut 80 Hz, −1.5 dB at 300 Hz, +1.5 dB presence at 3.2 kHz) and
# two-pass loudness normalisation to −16 LUFS. Timing is not changed (no trims, no edits).
set -e
cd "$(dirname "$0")/.."
mkdir -p assets/audio
EQ="highpass=f=80,equalizer=f=300:t=q:w=1.0:g=-1.5,equalizer=f=3200:t=q:w=1.2:g=1.5"
M=$(ffmpeg -hide_banner -nostats -i assets/voz.mp3 -af "$EQ,loudnorm=I=-16:TP=-2:LRA=9:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
mi=$(echo "$M" | python3 -c "import json,sys; print(json.load(sys.stdin)['input_i'])")
mtp=$(echo "$M" | python3 -c "import json,sys; print(json.load(sys.stdin)['input_tp'])")
mlra=$(echo "$M" | python3 -c "import json,sys; print(json.load(sys.stdin)['input_lra'])")
mth=$(echo "$M" | python3 -c "import json,sys; print(json.load(sys.stdin)['input_thresh'])")
ffmpeg -hide_banner -v error -y -i assets/voz.mp3 -af "$EQ,loudnorm=I=-16:TP=-2:LRA=9:measured_I=$mi:measured_TP=$mtp:measured_LRA=$mlra:measured_thresh=$mth:linear=true,aresample=48000" -ac 2 -ar 48000 assets/audio/voz-master.wav
echo "✓ assets/audio/voz-master.wav (EQ suave, −16 LUFS)"
