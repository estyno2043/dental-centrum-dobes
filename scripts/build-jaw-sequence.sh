#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

master="assets/jaw-sequence/source/jaw-motion-master.mp4"
closed="assets/jaw-sequence/source/jaw-closed-start.png"
open="assets/jaw-sequence/source/jaw-open-end.png"
desktop_dir="public/media/jaw-sequence/desktop"
mobile_dir="public/media/jaw-sequence/mobile"
manifest="components/home/jaw/jawSequenceManifest.generated.ts"

for source in "$master" "$closed" "$open"; do
  if [[ ! -f "$source" ]]; then
    echo "missing jaw source: $source" >&2
    exit 1
  fi
done

command -v node >/dev/null 2>&1 || {
  echo "node is required" >&2
  exit 1
}
node --input-type=module -e 'await import("sharp")' >/dev/null

ffmpeg=""
if [[ -n "${FFMPEG_BIN:-}" ]]; then
  if ! command -v "$FFMPEG_BIN" >/dev/null 2>&1; then
    echo "FFMPEG_BIN is not executable: $FFMPEG_BIN" >&2
    exit 1
  fi
  ffmpeg="$FFMPEG_BIN"
elif command -v ffmpeg >/dev/null 2>&1; then
  ffmpeg="ffmpeg"
else
  command -v xcrun >/dev/null 2>&1 || {
    echo "ffmpeg is unavailable and AVFoundation fallback requires xcrun" >&2
    exit 1
  }
  [[ -f scripts/extract-jaw-sequence.swift ]] || {
    echo "AVFoundation extractor is missing" >&2
    exit 1
  }
fi

staging_root="$(mktemp -d "${TMPDIR:-/tmp}/jaw-sequence.XXXXXX")"
trap 'rm -rf "$staging_root"' EXIT
raw_root="$staging_root/raw"
media_root="$staging_root/media"
staged_manifest="$staging_root/jawSequenceManifest.generated.ts"
mkdir -p "$raw_root/desktop" "$raw_root/mobile" "$media_root"

if [[ -n "$ffmpeg" ]]; then
  "$ffmpeg" -v error -y -i "$master" \
    -vf "tpad=stop_mode=clone:stop_duration=5,fps=72/5" \
    -frames:v 72 "$raw_root/desktop/frame-%03d.png"
  "$ffmpeg" -v error -y -i "$master" \
    -vf "tpad=stop_mode=clone:stop_duration=5,fps=12" \
    -frames:v 60 "$raw_root/mobile/frame-%03d.png"
  echo "extractor=ffmpeg"
else
  xcrun swift -warnings-as-errors scripts/extract-jaw-sequence.swift "$master" "$raw_root"
fi

node scripts/validate-jaw-sequence.mjs \
  --build \
  --source-root "$raw_root" \
  --media-root "$media_root" \
  --manifest "$staged_manifest"

mkdir -p "$desktop_dir" "$mobile_dir" "$(dirname "$manifest")"
find "$desktop_dir" "$mobile_dir" -type f -name 'frame-*.webp' -delete
cp "$media_root/desktop/"*.webp "$desktop_dir/"
cp "$media_root/mobile/"*.webp "$mobile_dir/"
cp "$staged_manifest" "$manifest"

node scripts/validate-jaw-sequence.mjs
