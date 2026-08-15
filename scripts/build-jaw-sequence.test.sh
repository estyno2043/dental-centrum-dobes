#!/usr/bin/env bash
set -uo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
build_script="$repo_root/scripts/build-jaw-sequence.sh"
test_root="$(mktemp -d "${TMPDIR:-/tmp}/jaw-sequence-build-test.XXXXXX")"
trap 'rm -rf "$test_root"' EXIT

failures=0

fail() {
  echo "not ok - $1" >&2
  failures=$((failures + 1))
}

pass() {
  echo "ok - $1"
}

tree_hash() {
  local root="$1"
  (
    cd "$root" || exit 1
    find . -type f -print | LC_ALL=C sort | while IFS= read -r file; do
      printf '%s  %s\n' "$(shasum -a 256 "$file" | awk '{print $1}')" "$file"
    done
  ) | shasum -a 256 | awk '{print $1}'
}

make_fixture() {
  local root="$1"
  local label="$2"

  mkdir -p "$root/media/desktop" "$root/media/mobile"
  printf '%s-desktop\n' "$label" > "$root/media/desktop/frame-001.webp"
  printf '%s-mobile\n' "$label" > "$root/media/mobile/frame-001.webp"
  printf 'export const marker = "%s";\n' "$label" > "$root/manifest.ts"
}

test_ffmpeg_override_is_rejected_before_mutation() {
  local root="$test_root/ffmpeg-contract"
  local output="$root/output.log"
  make_fixture "$root/live" "old"
  local media_before manifest_before status
  media_before="$(tree_hash "$root/live/media")"
  manifest_before="$(shasum -a 256 "$root/live/manifest.ts" | awk '{print $1}')"

  FFMPEG_BIN=/bin/true \
    JAW_BUILD_MEDIA_ROOT="$root/live/media" \
    JAW_BUILD_MANIFEST="$root/live/manifest.ts" \
    /bin/bash "$build_script" >"$output" 2>&1
  status=$?

  if [[ $status -eq 0 ]]; then
    fail "FFMPEG_BIN override is rejected"
  elif ! grep -Fq "FFMPEG_BIN is unsupported; jaw sequence uses the canonical AVFoundation extractor" "$output"; then
    fail "FFMPEG_BIN rejection names the canonical extractor"
  elif [[ "$(tree_hash "$root/live/media")" != "$media_before" ]] || \
       [[ "$(shasum -a 256 "$root/live/manifest.ts" | awk '{print $1}')" != "$manifest_before" ]]; then
    fail "FFMPEG_BIN rejection happens before output mutation"
  else
    pass "FFMPEG_BIN override is rejected before mutation"
  fi
}

test_failure_rolls_back_exact_live_outputs() {
  local checkpoint="$1"
  local root="$test_root/rollback-$checkpoint"
  local output="$root/output.log"
  make_fixture "$root/live" "old"
  make_fixture "$root/staged" "new"
  local media_before manifest_before status
  media_before="$(tree_hash "$root/live/media")"
  manifest_before="$(shasum -a 256 "$root/live/manifest.ts" | awk '{print $1}')"

  PATH=/bin:/usr/bin \
    JAW_BUILD_MEDIA_ROOT="$root/live/media" \
    JAW_BUILD_MANIFEST="$root/live/manifest.ts" \
    JAW_BUILD_TEST_FAIL_AT="$checkpoint" \
    /bin/bash "$build_script" --commit-staged \
      "$root/staged/media" "$root/staged/manifest.ts" >"$output" 2>&1
  status=$?

  if [[ $status -eq 0 ]]; then
    fail "injected commit failure exits non-zero"
  elif ! grep -Fq "injected jaw sequence commit failure at $checkpoint" "$output"; then
    fail "failure injection reached the mid-commit checkpoint"
  elif [[ "$(tree_hash "$root/live/media")" != "$media_before" ]]; then
    fail "media directories restore byte-for-byte after commit failure"
  elif [[ "$(shasum -a 256 "$root/live/manifest.ts" | awk '{print $1}')" != "$manifest_before" ]]; then
    fail "manifest restores byte-for-byte after commit failure"
  else
    pass "$checkpoint failure restores exact live media and manifest"
  fi
}

test_success_installs_complete_staged_outputs() {
  local root="$test_root/success"
  local output="$root/output.log"
  make_fixture "$root/live" "old"
  make_fixture "$root/staged" "new"
  local expected_media expected_manifest status
  expected_media="$(tree_hash "$root/staged/media")"
  expected_manifest="$(shasum -a 256 "$root/staged/manifest.ts" | awk '{print $1}')"

  PATH=/bin:/usr/bin \
    JAW_BUILD_MEDIA_ROOT="$root/live/media" \
    JAW_BUILD_MANIFEST="$root/live/manifest.ts" \
    /bin/bash "$build_script" --commit-staged \
      "$root/staged/media" "$root/staged/manifest.ts" >"$output" 2>&1
  status=$?

  if [[ $status -ne 0 ]]; then
    fail "successful staged commit exits zero"
  elif [[ "$(tree_hash "$root/live/media")" != "$expected_media" ]]; then
    fail "successful commit installs the complete staged media tree"
  elif [[ "$(shasum -a 256 "$root/live/manifest.ts" | awk '{print $1}')" != "$expected_manifest" ]]; then
    fail "successful commit installs the staged manifest"
  elif find "$root" -maxdepth 2 \( -name '*.jaw-backup.*' -o -name '*.jaw-stage.*' \) | grep -q .; then
    fail "successful commit removes transaction artifacts"
  else
    pass "successful commit atomically installs staged outputs"
  fi
}

test_ffmpeg_override_is_rejected_before_mutation
test_failure_rolls_back_exact_live_outputs after-media-install
test_failure_rolls_back_exact_live_outputs after-manifest-install
test_success_installs_complete_staged_outputs

if [[ $failures -ne 0 ]]; then
  echo "$failures jaw build transaction test(s) failed" >&2
  exit 1
fi

echo "jaw build transaction tests passed"
