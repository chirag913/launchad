#!/bin/bash
# Render stills at the given seconds and tile them into a contact sheet.
#   bash scripts/stills.sh 0 1.2 3.5 ...   → out/stills/sheet.png
set -e
cd "$(dirname "$0")/.."
source scripts/env.sh
mkdir -p out/stills
rm -f out/stills/*.png
TIMES=("${@:-0 1.5 3.5 5.6 8.8 11.6 14.5}")
for t in ${TIMES[@]}; do
  fr=$(awk -v t="$t" 'BEGIN{printf "%d", t*30}')
  npx remotion still BetterCallzAd "out/stills/f$(printf %04d $fr).png" --frame="$fr" $BROWSER_FLAG --log=error
done
"$FFMPEG" -loglevel error -y -pattern_type glob -i 'out/stills/f*.png' -vf "scale=540:-1,tile=${SHEET_COLS:-4}x2:padding=8:color=0x333333" -frames:v 1 out/stills/sheet.png
echo out/stills/sheet.png
