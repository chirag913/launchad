# Shared tool resolution for the scripts.
# Use a preinstalled Chromium headless shell if one exists (offline boxes);
# otherwise Remotion downloads its own on first render.
BROWSER_FLAG=""
for b in "$REMOTION_BROWSER" /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell; do
  [ -n "$b" ] && [ -x "$b" ] && BROWSER_FLAG="--browser-executable=$b" && break
done
FFMPEG=$(command -v ffmpeg || echo node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg)
