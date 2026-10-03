#!/bin/sh
# Build the Chrome Web Store upload: only the files the extension loads at runtime.
# Output: dist/fox-macro-recorder-<version>.zip  (dist/ is git-ignored)
set -e
cd "$(dirname "$0")"
version=$(python3 -c "import json; print(json.load(open('manifest.json'))['version'])")
out="dist/fox-macro-recorder-$version.zip"
mkdir -p dist
rm -f "$out"
zip -qr "$out" manifest.json background.js content \
  icons/icon16.png icons/icon48.png icons/icon128.png \
  assets/fonts/tiny5.woff2 assets/fonts/OFL.txt \
  assets/sprites/mascot.png assets/sprites/logo.png \
  -x '*.DS_Store'
echo "$out ($(du -h "$out" | cut -f1))"
