#!/usr/bin/env bash
#
# Encodes the hero background media from the studio's edited master.
#
# The master is a ~1 GB ProRes 422 HQ export and is not tracked in this
# repository; pass its path as the first argument. Re-run this whenever the
# edit changes, then commit the regenerated files in public/media/.
#
#   ./scripts/encode-hero-video.sh ~/Downloads/dobes-media-raw/0724.mov
#
# ---------------------------------------------------------------------------
# The whole master is used, start to end. It is a finished 19.2s edit made by
# the studio, so the cut is not this script's decision — do not trim, reorder,
# or crossfade it without being asked. Earlier versions of this script picked a
# window out of the raw 145s clinic promo; that is no longer how the hero is
# sourced, and the raw 4K file is no longer an input here.
#
# Frame rate: the master is exported at 60 fps, but ~40% of its frames are
# exact duplicates (689 unique of 1153, measured with mpdecimate) because the
# underlying footage is 29.97 fps. Encoding at 60 would spend bitrate on
# repeated frames for no visible gain, so the web encodes are 30 fps. Raise
# this only if a genuinely 60 fps source is ever shot.
#
# The edit runs 10 shots in 19.2s, so cuts land roughly every two seconds
# behind the headline, and two of the shots are clinical (intraoral macro at
# 12.3-14.2s, instrument tray at 14.2-16.3s). Both are deliberate choices by
# the studio and are recorded here so they are not mistaken for oversights.
# ---------------------------------------------------------------------------

set -euo pipefail

MASTER="${1:?Usage: $0 <path-to-edited-master>}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/media"
FPS=30

command -v ffmpeg >/dev/null || { echo "ffmpeg is required" >&2; exit 1; }

echo "Encoding 1080p VP9 (desktop primary)…"
ffmpeg -v error -y -i "$MASTER" \
  -an -vf "scale=1920:1080:flags=lanczos,fps=$FPS" \
  -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -cpu-used 2 -g 60 -pix_fmt yuv420p \
  "$OUT/hero-1080.webm"

echo "Encoding 1080p H.264 (desktop fallback)…"
ffmpeg -v error -y -i "$MASTER" \
  -an -vf "scale=1920:1080:flags=lanczos,fps=$FPS" \
  -c:v libx264 -preset slow -crf 25 -profile:v high -level 4.1 \
  -pix_fmt yuv420p -g 60 -movflags +faststart \
  "$OUT/hero-1080.mp4"

echo "Encoding 720p H.264 (phones)…"
ffmpeg -v error -y -i "$MASTER" \
  -an -vf "scale=1280:720:flags=lanczos,fps=$FPS" \
  -c:v libx264 -preset slow -crf 24 -profile:v high -level 4.0 \
  -pix_fmt yuv420p -g 60 -movflags +faststart \
  "$OUT/hero-720.mp4"

echo "Extracting poster (must stay the edit's first frame)…"
ffmpeg -v error -y -i "$MASTER" \
  -frames:v 1 -vf "scale=1920:1080:flags=lanczos" -q:v 4 \
  "$OUT/hero-poster.jpg"

echo "Done:"
ls -lh "$OUT"/hero-*
