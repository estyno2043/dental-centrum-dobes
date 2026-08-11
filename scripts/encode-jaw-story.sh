#!/usr/bin/env bash
#
# Post-processes the approved Higgsfield jaw animation into short, independently
# seekable clips for scroll-driven playback.
#
# Usage:
#   FFMPEG_BIN=/path/to/ffmpeg ./scripts/encode-jaw-story.sh /path/to/source.mp4
#
# `FFMPEG_BIN` is optional when `ffmpeg` is already on PATH. The generated
# assets are committed; the supplied Higgsfield master remains local.

set -euo pipefail

MASTER="${1:?Usage: $0 <path-to-approved-jaw-video>}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/media/jaw-story"
FFMPEG="${FFMPEG_BIN:-ffmpeg}"
FPS=30
GOP=1
DESKTOP_CRF="${DESKTOP_CRF:-21}"
MOBILE_CRF="${MOBILE_CRF:-22}"
DESKTOP_LIMIT=$((12 * 1024 * 1024))
MOBILE_LIMIT=$((5 * 1024 * 1024))

command -v "$FFMPEG" >/dev/null 2>&1 || {
  echo "ffmpeg is required; set FFMPEG_BIN when it is not on PATH" >&2
  exit 1
}

mkdir -p "$OUT"

# Logical boundaries are 0, 2, 4, and 6 seconds. Each clip keeps another
# 0.10s at its tail (three frames at 30fps) for decoded-frame handoff.
STARTS=(0 2 4 6)
DURATIONS=(2.10 2.10 2.10 2.05)

encode_segment() {
  local size="$1"
  local suffix="$2"
  local crf="$3"
  local index="$4"
  local number

  number="$(printf '%02d' "$((index + 1))")"

  "$FFMPEG" -hide_banner -loglevel error -y \
    -ss "${STARTS[$index]}" -i "$MASTER" -t "${DURATIONS[$index]}" \
    -map 0:v:0 -an \
    -vf "fps=$FPS,scale=$size:flags=lanczos" \
    -c:v libx264 -preset slow -crf "$crf" -profile:v high \
    -pix_fmt yuv420p -g "$GOP" -keyint_min "$GOP" -sc_threshold 0 \
    -movflags +faststart \
    "$OUT/jaw-$number-$suffix.mp4"
}

encode_mobile_segment() {
  local index="$1"
  local number

  number="$(printf '%02d' "$((index + 1))")"

  "$FFMPEG" -hide_banner -loglevel error -y \
    -ss "${STARTS[$index]}" -i "$MASTER" -t "${DURATIONS[$index]}" \
    -filter_complex \
      "[0:v]fps=$FPS,split=2[bg][fg];\
       [bg]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,gblur=sigma=28[blurred];\
       [fg]crop=1300:1080:620:0,scale=720:598:flags=lanczos,format=rgba[subject];\
       color=c=white:s=720x598:r=$FPS,format=gray,\
         geq=lum='255*min(1,min(X/60,(W-X)/60))*min(1,min(Y/90,(H-Y)/90))'[mask];\
       [subject][mask]alphamerge[feathered];\
       [blurred][feathered]overlay=(W-w)/2:(H-h)/2[out]" \
    -map "[out]" -an \
    -c:v libx264 -preset slow -crf "$MOBILE_CRF" -profile:v high \
    -pix_fmt yuv420p -g "$GOP" -keyint_min "$GOP" -sc_threshold 0 \
    -movflags +faststart \
    "$OUT/jaw-$number-720.mp4"
}

for index in 0 1 2 3; do
  encode_segment "1920:1080" "1080" "$DESKTOP_CRF" "$index"
  encode_mobile_segment "$index"
done

"$FFMPEG" -hide_banner -loglevel error -y -i "$MASTER" \
  -frames:v 1 -vf "scale=1920:1080:flags=lanczos" -q:v 3 \
  "$OUT/jaw-poster.jpg"

echo "Generated jaw story assets:"
ls -lh "$OUT"/jaw-*

desktop_total=0
mobile_total=0
for file in "$OUT"/jaw-*-1080.mp4; do
  desktop_total=$((desktop_total + $(stat -f%z "$file")))
done
for file in "$OUT"/jaw-*-720.mp4; do
  mobile_total=$((mobile_total + $(stat -f%z "$file")))
done

if ((desktop_total > DESKTOP_LIMIT)); then
  echo "Desktop assets exceed 12 MiB: $desktop_total bytes" >&2
  exit 1
fi
if ((mobile_total > MOBILE_LIMIT)); then
  echo "Mobile assets exceed 5 MiB: $mobile_total bytes" >&2
  exit 1
fi

echo "Desktop total: $desktop_total bytes; mobile total: $mobile_total bytes"
