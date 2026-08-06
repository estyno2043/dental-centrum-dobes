#!/usr/bin/env bash
#
# Encodes the hero background media from the 4K clinic master.
#
# The master is ~633 MB and is not tracked in this repository; pass its path as
# the first argument. Re-run this whenever the master or the chosen segment
# changes, then commit the regenerated files in public/media/.
#
#   ./scripts/encode-hero-video.sh "/path/to/Zubná ambulancia Dobeš - 4K.mp4"
#
# Segment: 15s-37s of the master — reception, check-in, waiting room.
# Constraints that produced this window, so it is not widened blindly:
#   * Burned-in Slovak titles sit at roughly 4s, 38s, 46s, 55s and 90s.
#   * Treatment and intraoral close-ups run from about 75s; they contradict the
#     hero's "you no longer have to avoid the dentist" line.
#   * An end card with the logo and address closes the master at 145s.
#   * Everything before 15s is exterior: a residential block, bare winter trees,
#     and an entrance plastered with regulatory and surveillance stickers.
# Known limitation: the master was shot in winter, so a small Christmas tree is
# visible at the reception. Replace this footage at the next shoot.
#
# The master is 29.97 fps. There is no higher-frame-rate source, and
# interpolating one would add artifacts rather than smoothness.

set -euo pipefail

MASTER="${1:?Usage: $0 <path-to-4k-master>}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/media"
START=15
LENGTH=22

command -v ffmpeg >/dev/null || { echo "ffmpeg is required" >&2; exit 1; }

echo "Encoding 1080p VP9 (desktop primary)…"
ffmpeg -v error -y -ss "$START" -t "$LENGTH" -i "$MASTER" \
  -an -vf "scale=1920:1080:flags=lanczos" \
  -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -cpu-used 2 -g 60 -pix_fmt yuv420p \
  "$OUT/hero-1080.webm"

echo "Encoding 1080p H.264 (desktop fallback)…"
ffmpeg -v error -y -ss "$START" -t "$LENGTH" -i "$MASTER" \
  -an -vf "scale=1920:1080:flags=lanczos" \
  -c:v libx264 -preset slow -crf 25 -profile:v high -level 4.1 \
  -pix_fmt yuv420p -g 60 -movflags +faststart \
  "$OUT/hero-1080.mp4"

echo "Encoding 720p H.264 (phones)…"
ffmpeg -v error -y -ss "$START" -t "$LENGTH" -i "$MASTER" \
  -an -vf "scale=1280:720:flags=lanczos" \
  -c:v libx264 -preset slow -crf 24 -profile:v high -level 4.0 \
  -pix_fmt yuv420p -g 60 -movflags +faststart \
  "$OUT/hero-720.mp4"

echo "Extracting poster (must stay the clip's first frame)…"
ffmpeg -v error -y -ss "$START" -i "$MASTER" \
  -frames:v 1 -vf "scale=1920:1080:flags=lanczos" -q:v 4 \
  "$OUT/hero-poster.jpg"

echo "Done:"
ls -lh "$OUT"/hero-*
