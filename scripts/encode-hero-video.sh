#!/usr/bin/env bash
#
# Encodes the hero background media from the studio's edited master.
#
# The master is a ~1 GB ProRes 422 HQ export and is not tracked in this
# repository; pass its path as the first argument. Re-run this whenever the
# edit changes, then commit the regenerated files in public/media/.
#
#   ./scripts/encode-hero-video.sh "~/Downloads/dobes-media-raw/0724(1).mov"
#
# ---------------------------------------------------------------------------
# The whole master is used, start to end. It is a finished edit made by the
# studio, so the cut is not this script's decision — do not trim, reorder, or
# crossfade it without being asked. Earlier versions of this script picked a
# window out of the raw 145s clinic promo; that is no longer how the hero is
# sourced, and the raw 4K file is no longer an input here.
#
# Current master: ProRes 422 HQ, 1920x1080, 30 fps, 79.03s, ~2.0 GB.
#
# The edit runs 29 shots in 79s (2.73s average), and a good part of it is
# procedural footage, including four intraoral macro shots at roughly 43.8s,
# 60.4s, 62.7s and 69.0s. Alternatives were proposed and declined; the studio
# chose this edit deliberately. Recorded so it is not mistaken for an oversight
# and quietly "fixed" by another agent.
#
# Frame rate is 30. An earlier master was exported at 60 fps, but ~40% of its
# frames were exact duplicates (689 unique of 1153, measured with mpdecimate)
# because the footage under it is 29.97 fps. Raise this only if a genuinely
# 60 fps source is ever shot.
#
# The CRF values are higher than the usual defaults because 79s is long for a
# background loop. At the previous settings (25/34/24) the 1080p H.264 came out
# at 25.18 MiB, which is over Cloudflare's 25 MiB per-asset limit and would not
# deploy, and phones were pulling 14.4 MiB. Quality loss is not visible here:
# the video sits under a dark scrim with the headline over it. If the edit is
# ever shortened, lower these again.
# ---------------------------------------------------------------------------

set -euo pipefail

MASTER="${1:?Usage: $0 <path-to-edited-master>}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/media"
FPS=30

command -v ffmpeg >/dev/null || { echo "ffmpeg is required" >&2; exit 1; }

echo "Encoding 1080p VP9 (desktop primary)…"
ffmpeg -v error -y -i "$MASTER" \
  -an -vf "scale=1920:1080:flags=lanczos,fps=$FPS" \
  -c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 -cpu-used 2 -g 60 -pix_fmt yuv420p \
  "$OUT/hero-1080.webm"

echo "Encoding 1080p H.264 (desktop fallback)…"
ffmpeg -v error -y -i "$MASTER" \
  -an -vf "scale=1920:1080:flags=lanczos,fps=$FPS" \
  -c:v libx264 -preset slow -crf 29 -profile:v high -level 4.1 \
  -pix_fmt yuv420p -g 60 -movflags +faststart \
  "$OUT/hero-1080.mp4"

echo "Encoding 720p H.264 (phones)…"
ffmpeg -v error -y -i "$MASTER" \
  -an -vf "scale=1280:720:flags=lanczos,fps=$FPS" \
  -c:v libx264 -preset slow -crf 28 -profile:v high -level 4.0 \
  -pix_fmt yuv420p -g 60 -movflags +faststart \
  "$OUT/hero-720.mp4"

echo "Extracting poster (must stay the edit's first frame)…"
ffmpeg -v error -y -i "$MASTER" \
  -frames:v 1 -vf "scale=1920:1080:flags=lanczos" -q:v 4 \
  "$OUT/hero-poster.jpg"

echo "Done:"
ls -lh "$OUT"/hero-*
