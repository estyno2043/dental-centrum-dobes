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
# ---------------------------------------------------------------------------
# Segment: 41.0s-45.7s of the master — the waiting room, slow dolly back.
#
# The master is a promo montage, not hero footage. A scene scan of all 145s
# found only four continuous shots longer than six seconds:
#
#   26.49s-34.90s  8.41s  reception desk, patient approaching
#   39.34s-45.75s  6.41s  waiting room, slow dolly        <- this one
#   122.02-128.53  6.51s  intraoral macro, unusable
#   135.47-145.00  9.53s  handshake, then the closing card
#
# Everything else cuts every two to three seconds, so a longer window would
# put hard cuts behind the headline. The previously shipped 15s-37s window
# contained five cuts (17.15, 21.76, 24.06, 26.49, 34.90) for that reason.
#
# The waiting room shot was chosen over the longer reception shot because it
# is the only framing in the master that carries the brand: the tooth motif on
# the wall, the sphere lamp, the leather chairs, and no clinical equipment,
# masks, or gloves in frame.
#
# Its first ~1.7s carry a burned-in Slovak title ("Aj čakanie u nás môže byť
# príjemné"), which clears between 40.6s and 41.0s — hence START=41.0. Other
# burned-in titles sit at roughly 4s, 38s, 46s, 55s, and 90s.
#
# 4.7s is short for a loop, so the clip is slowed to 85% (5.53s) and closed
# with a crossfade back to its own first frame, giving a seamless ~4.83s loop.
#
# Known limitation: the master was shot in winter and a small Christmas tree is
# visible near the reception. Replace this footage at the next shoot — a single
# locked or slow-dolly take of 20-30s would remove every constraint above.
#
# The master is 29.97 fps. There is no higher-frame-rate source, and
# interpolating one would add artifacts rather than smoothness.
# ---------------------------------------------------------------------------

set -euo pipefail

MASTER="${1:?Usage: $0 <path-to-4k-master>}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/media"
START=41.0
LENGTH=4.7
SPEED=0.85   # playback rate; below 1.0 slows the shot down
FADE=0.7     # crossfade used to close the loop

command -v ffmpeg >/dev/null || { echo "ffmpeg is required" >&2; exit 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Slowed clip length, and the point where the closing crossfade begins.
SLOWED=$(awk -v l="$LENGTH" -v s="$SPEED" 'BEGIN{printf "%.3f", l/s}')
BODY_END=$(awk -v t="$SLOWED" -v f="$FADE" 'BEGIN{printf "%.3f", t-f}')

echo "Extracting and slowing the segment (${LENGTH}s at ${SPEED}x = ${SLOWED}s)…"
ffmpeg -v error -y -ss "$START" -t "$LENGTH" -i "$MASTER" \
  -an -vf "scale=1920:1080:flags=lanczos,setpts=PTS/$SPEED" -r 30 \
  -c:v libx264 -preset veryfast -crf 12 -pix_fmt yuv420p \
  "$TMP/slowed.mp4"

echo "Closing the loop with a ${FADE}s crossfade…"
ffmpeg -v error -y -i "$TMP/slowed.mp4" -filter_complex "
  [0:v]split=3[a][b][c];
  [a]trim=start=$FADE:end=$BODY_END,setpts=PTS-STARTPTS[mid];
  [b]trim=start=$BODY_END,setpts=PTS-STARTPTS[tail];
  [c]trim=end=$FADE,setpts=PTS-STARTPTS[head];
  [tail][head]xfade=transition=fade:duration=$FADE:offset=0[blend];
  [mid][blend]concat=n=2:v=1:a=0[out]" \
  -map "[out]" -an -c:v libx264 -preset veryfast -crf 12 -pix_fmt yuv420p \
  "$TMP/loop.mp4"

echo "Encoding 1080p VP9 (desktop primary)…"
ffmpeg -v error -y -i "$TMP/loop.mp4" \
  -an -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -cpu-used 2 -g 60 -pix_fmt yuv420p \
  "$OUT/hero-1080.webm"

echo "Encoding 1080p H.264 (desktop fallback)…"
ffmpeg -v error -y -i "$TMP/loop.mp4" \
  -an -c:v libx264 -preset slow -crf 25 -profile:v high -level 4.1 \
  -pix_fmt yuv420p -g 60 -movflags +faststart \
  "$OUT/hero-1080.mp4"

echo "Encoding 720p H.264 (phones)…"
ffmpeg -v error -y -i "$TMP/loop.mp4" \
  -an -vf "scale=1280:720:flags=lanczos" \
  -c:v libx264 -preset slow -crf 24 -profile:v high -level 4.0 \
  -pix_fmt yuv420p -g 60 -movflags +faststart \
  "$OUT/hero-720.mp4"

echo "Extracting poster (must stay the loop's first frame)…"
ffmpeg -v error -y -i "$TMP/loop.mp4" \
  -frames:v 1 -q:v 4 \
  "$OUT/hero-poster.jpg"

echo "Done:"
ls -lh "$OUT"/hero-*
