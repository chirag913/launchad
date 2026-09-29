#!/bin/bash
# Render the ad to out/BetterCallzAd.mp4 (1080x1920, 30fps, H.264 + AAC).
#   bash scripts/render.sh [composition-id]
set -e
cd "$(dirname "$0")/.."
source scripts/env.sh
ID="${1:-BetterCallzAd}"
[ -f public/sfx/bed.wav ] || node scripts/make-sfx.mjs
mkdir -p out
npx remotion render "$ID" "out/$ID.mp4" \
  --codec=h264 --crf=16 --pixel-format=yuv420p \
  --audio-codec=aac --audio-bitrate=256k \
  --concurrency=1 $BROWSER_FLAG --log=error
# faststart for instant playback in feeds; -c copy so the picture is untouched
# Loudness: social feeds normalise to about -14 LUFS; master there with a
# -1.5 dBTP ceiling so nothing clips after AAC. Picture is stream-copied.
"$FFMPEG" -loglevel error -y -i "out/$ID.mp4" -map 0:v -map 0:a -shortest -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 256k \
  -movflags +faststart "out/$ID.tmp.mp4" && mv "out/$ID.tmp.mp4" "out/$ID.mp4"
"$FFMPEG" -hide_banner -i "out/$ID.mp4" 2>&1 | grep -E "Duration|Stream" || true
