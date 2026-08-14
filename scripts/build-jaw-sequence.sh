#!/usr/bin/env bash
set -Eeuo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

master="assets/jaw-sequence/source/jaw-motion-master.mp4"
closed="assets/jaw-sequence/source/jaw-closed-start.png"
open="assets/jaw-sequence/source/jaw-open-end.png"
live_media_root="${JAW_BUILD_MEDIA_ROOT:-public/media/jaw-sequence}"
live_manifest="${JAW_BUILD_MANIFEST:-components/home/jaw/jawSequenceManifest.generated.ts}"

fail() {
  echo "$1" >&2
  exit 1
}

inject_failure() {
  local checkpoint="$1"
  if [[ "${JAW_BUILD_TEST_FAIL_AT:-}" == "$checkpoint" ]]; then
    echo "injected jaw sequence commit failure at $checkpoint" >&2
    return 1
  fi
}

filesystem_id() {
  local path="$1"
  if stat -f '%d' "$path" >/dev/null 2>&1; then
    stat -f '%d' "$path"
  else
    stat -c '%d' "$path"
  fi
}

commit_staged_outputs() {
  local staged_media="$1"
  local staged_manifest="$2"
  local validate_live="${3:-0}"
  local token="$$-$RANDOM"
  local media_backup="${live_media_root}.jaw-backup.${token}"
  local manifest_backup="${live_manifest}.jaw-backup.${token}"
  local failed_media="${live_media_root}.jaw-failed.${token}"
  local failed_manifest="${live_manifest}.jaw-failed.${token}"
  local media_had_live=0
  local manifest_had_live=0
  local media_install_attempted=0
  local manifest_install_attempted=0

  [[ -d "$staged_media/desktop" && -d "$staged_media/mobile" ]] || \
    fail "staged jaw media is incomplete: $staged_media"
  [[ -f "$staged_manifest" ]] || fail "staged jaw manifest is missing: $staged_manifest"
  [[ "$live_media_root" != "/" && -n "$live_media_root" ]] || fail "unsafe live jaw media path"
  [[ "$live_manifest" != "/" && -n "$live_manifest" ]] || fail "unsafe live jaw manifest path"

  mkdir -p "$(dirname "$live_media_root")" "$(dirname "$live_manifest")"
  [[ "$(filesystem_id "$staged_media")" == \
     "$(filesystem_id "$(dirname "$live_media_root")")" ]] || \
    fail "staged jaw media must share the live output filesystem"
  [[ "$(filesystem_id "$staged_manifest")" == \
     "$(filesystem_id "$(dirname "$live_manifest")")" ]] || \
    fail "staged jaw manifest must share the live output filesystem"
  [[ ! -e "$media_backup" && ! -e "$manifest_backup" ]] || \
    fail "jaw build transaction backup already exists"

  rollback_transaction() {
    local status="${1:-1}"
    trap - ERR INT TERM HUP
    set +e

    if [[ $manifest_install_attempted -eq 1 && -e "$live_manifest" ]]; then
      mv "$live_manifest" "$failed_manifest" 2>/dev/null || rm -f "$live_manifest"
    fi
    if [[ $manifest_had_live -eq 1 && -e "$manifest_backup" ]]; then
      mv "$manifest_backup" "$live_manifest"
    fi

    if [[ $media_install_attempted -eq 1 && -e "$live_media_root" ]]; then
      mv "$live_media_root" "$failed_media" 2>/dev/null || rm -rf "$live_media_root"
    fi
    if [[ $media_had_live -eq 1 && -e "$media_backup" ]]; then
      mv "$media_backup" "$live_media_root"
    fi

    rm -rf "$failed_media"
    rm -f "$failed_manifest"
    exit "$status"
  }

  trap 'rollback_transaction $?' ERR
  trap 'rollback_transaction 130' INT
  trap 'rollback_transaction 143' TERM
  trap 'rollback_transaction 129' HUP

  if [[ -e "$live_media_root" ]]; then
    media_had_live=1
    mv "$live_media_root" "$media_backup"
  fi
  media_install_attempted=1
  mv "$staged_media" "$live_media_root"
  inject_failure after-media-install

  if [[ -e "$live_manifest" ]]; then
    manifest_had_live=1
    mv "$live_manifest" "$manifest_backup"
  fi
  manifest_install_attempted=1
  mv "$staged_manifest" "$live_manifest"
  inject_failure after-manifest-install

  if [[ "$validate_live" == "1" ]]; then
    node scripts/validate-jaw-sequence.mjs
  fi

  # Both new resources are now installed and validated. This is the commit
  # point: disable rollback before deleting backups so an interruption during
  # cleanup cannot restore only one half of the old output set.
  trap - ERR INT TERM HUP
  rm -rf "$media_backup"
  rm -f "$manifest_backup"
}

# The committed artifacts have one canonical source-frame extractor. Reject an
# override before source checks or staging so a machine-local ffmpeg cannot
# silently produce a different manifest and frame hash set.
if [[ -n "${FFMPEG_BIN:-}" ]]; then
  fail "FFMPEG_BIN is unsupported; jaw sequence uses the canonical AVFoundation extractor"
fi

if [[ "${1:-}" == "--commit-staged" ]]; then
  [[ $# -eq 3 ]] || fail "usage: build-jaw-sequence.sh --commit-staged MEDIA_ROOT MANIFEST"
  commit_staged_outputs "$2" "$3"
  exit 0
fi

[[ $# -eq 0 ]] || fail "unknown jaw build argument: $1"

for source in "$master" "$closed" "$open"; do
  [[ -f "$source" ]] || fail "missing jaw source: $source"
done

command -v node >/dev/null 2>&1 || fail "node is required"
node --input-type=module -e 'await import("sharp")' >/dev/null
command -v xcrun >/dev/null 2>&1 || \
  fail "canonical AVFoundation extractor requires xcrun"
[[ -f scripts/extract-jaw-sequence.swift ]] || \
  fail "canonical AVFoundation extractor is missing"

# Staging lives on the repository filesystem, so the final directory and file
# installs use atomic rename operations rather than delete-and-copy windows.
mkdir -p public/media
staging_root="$(mktemp -d "$repo_root/public/media/.jaw-sequence-build.XXXXXX")"
staged_manifest="$(mktemp "$repo_root/components/home/jaw/.jawSequenceManifest.generated.ts.stage.XXXXXX")"
cleanup_staging() {
  rm -rf "$staging_root"
  rm -f "$staged_manifest"
}
trap cleanup_staging EXIT

raw_root="$staging_root/raw"
staged_media="$staging_root/media"
mkdir -p "$raw_root/desktop" "$raw_root/mobile" "$staged_media"

xcrun swift -warnings-as-errors scripts/extract-jaw-sequence.swift "$master" "$raw_root"

node scripts/validate-jaw-sequence.mjs \
  --build \
  --source-root "$raw_root" \
  --media-root "$staged_media" \
  --manifest "$staged_manifest"

commit_staged_outputs "$staged_media" "$staged_manifest" 1
