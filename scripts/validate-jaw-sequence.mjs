#!/usr/bin/env node

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_MEDIA_ROOT = join(REPO_ROOT, "public/media/jaw-sequence");
const DEFAULT_MANIFEST = join(
  REPO_ROOT,
  "components/home/jaw/jawSequenceManifest.generated.ts",
);
const CLOSED_SOURCE = join(
  REPO_ROOT,
  "assets/jaw-sequence/source/jaw-closed-start.png",
);
const OPEN_SOURCE = join(
  REPO_ROOT,
  "assets/jaw-sequence/source/jaw-open-end.png",
);

const PROFILES = Object.freeze({
  desktop: Object.freeze({
    profile: "desktop",
    width: 1280,
    height: 720,
    frameCount: 72,
    maxBytes: 8 * 1024 * 1024,
    quality: 76,
    endpointQuality: 90,
  }),
  mobile: Object.freeze({
    profile: "mobile",
    width: 720,
    height: 1280,
    frameCount: 60,
    maxBytes: 5 * 1024 * 1024,
    quality: 72,
    endpointQuality: 88,
  }),
});

export function validateOrderedFrames(frames, expectedCount) {
  const expected = Array.from({ length: expectedCount }, (_, index) => index + 1);
  const actual = frames.map((frame) => frame.index);
  if (actual.join(",") !== expected.join(",")) {
    throw new Error("jaw frame ordering gap");
  }
}

export function validateBudget(totalBytes, maxBytes, profile) {
  if (totalBytes > maxBytes) {
    throw new Error(`${profile} jaw sequence exceeds byte budget`);
  }
}

function runSelfTest() {
  assert.doesNotThrow(() =>
    validateOrderedFrames([{ index: 1 }, { index: 2 }, { index: 3 }], 3),
  );
  assert.throws(
    () => validateOrderedFrames([{ index: 1 }, { index: 3 }], 3),
    { message: "jaw frame ordering gap" },
  );
  assert.doesNotThrow(() => validateBudget(8, 8, "desktop"));
  assert.throws(
    () => validateBudget(9, 8, "desktop"),
    { message: "desktop jaw sequence exceeds byte budget" },
  );
  console.log("jaw validator self-test passed");
}

function parseArguments(argv) {
  const options = {
    build: false,
    selfTest: false,
    sourceRoot: undefined,
    mediaRoot: DEFAULT_MEDIA_ROOT,
    manifest: DEFAULT_MANIFEST,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--build") {
      options.build = true;
    } else if (argument === "--self-test") {
      options.selfTest = true;
    } else if (["--source-root", "--media-root", "--manifest"].includes(argument)) {
      const value = argv[index + 1];
      if (!value) throw new Error(`${argument} requires a value`);
      index += 1;
      if (argument === "--source-root") options.sourceRoot = resolve(value);
      if (argument === "--media-root") options.mediaRoot = resolve(value);
      if (argument === "--manifest") options.manifest = resolve(value);
    } else {
      throw new Error(`unknown argument: ${argument}`);
    }
  }
  if (options.build && !options.sourceRoot) {
    throw new Error("--build requires --source-root");
  }
  return options;
}

function frameFilename(index, extension) {
  return `frame-${String(index).padStart(3, "0")}.${extension}`;
}

async function listFrames(directory, extension, expectedCount) {
  const entries = await readdir(directory, { withFileTypes: true });
  const frames = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(`.${extension}`))
    .map((entry) => {
      const match = /^frame-(\d{3})\.[^.]+$/.exec(entry.name);
      if (!match) throw new Error(`invalid jaw frame name: ${entry.name}`);
      return {
        index: Number(match[1]),
        name: entry.name,
        path: join(directory, entry.name),
      };
    })
    .sort((left, right) => left.index - right.index);
  validateOrderedFrames(frames, expectedCount);
  return frames;
}

function webpOptions(quality) {
  return {
    quality,
    effort: 6,
    smartSubsample: true,
  };
}

function createFeatheredRGBA(rgb, width, height) {
  const rgba = Buffer.alloc(width * height * 4);
  const feather = 56;
  for (let y = 0; y < height; y += 1) {
    const distanceFromEdge = Math.min(y, height - 1 - y);
    const alpha = Math.round(255 * Math.min(1, distanceFromEdge / feather));
    for (let x = 0; x < width; x += 1) {
      const sourceOffset = (y * width + x) * 3;
      const destinationOffset = (y * width + x) * 4;
      rgba[destinationOffset] = rgb[sourceOffset];
      rgba[destinationOffset + 1] = rgb[sourceOffset + 1];
      rgba[destinationOffset + 2] = rgb[sourceOffset + 2];
      rgba[destinationOffset + 3] = alpha;
    }
  }
  return rgba;
}

async function renderDesktopFrame(inputPath, outputPath, quality) {
  await sharp(inputPath)
    .resize(1280, 720, { fit: "fill", kernel: sharp.kernel.lanczos3 })
    .removeAlpha()
    .webp(webpOptions(quality))
    .toFile(outputPath);
}

async function renderMobileFrame(inputPath, outputPath, quality) {
  const background = await sharp(inputPath)
    .resize(720, 1280, {
      fit: "cover",
      position: "centre",
      kernel: sharp.kernel.lanczos3,
    })
    .blur(28)
    .removeAlpha()
    .png()
    .toBuffer();
  const foreground = await sharp(inputPath)
    .resize(720, 405, { fit: "fill", kernel: sharp.kernel.lanczos3 })
    .removeAlpha()
    .raw()
    .toBuffer();
  const rgba = createFeatheredRGBA(foreground, 720, 405);
  await sharp(background)
    .composite([
      {
        input: rgba,
        raw: { width: 720, height: 405, channels: 4 },
        left: 0,
        top: Math.floor((1280 - 405) / 2),
        blend: "over",
      },
    ])
    .removeAlpha()
    .webp(webpOptions(quality))
    .toFile(outputPath);
}

async function renderProfileFrame(inputPath, outputPath, config, endpoint) {
  const quality = endpoint ? config.endpointQuality : config.quality;
  await mkdir(dirname(outputPath), { recursive: true });
  if (config.profile === "desktop") {
    await renderDesktopFrame(inputPath, outputPath, quality);
  } else {
    await renderMobileFrame(inputPath, outputPath, quality);
  }
}

async function buildSequences(sourceRoot, mediaRoot) {
  for (const config of Object.values(PROFILES)) {
    const sourceDirectory = join(sourceRoot, config.profile);
    const outputDirectory = join(mediaRoot, config.profile);
    const sources = await listFrames(sourceDirectory, "png", config.frameCount);
    await rm(outputDirectory, { recursive: true, force: true });
    await mkdir(outputDirectory, { recursive: true });
    for (const source of sources) {
      const endpoint = source.index === 1 || source.index === config.frameCount;
      const inputPath =
        source.index === 1
          ? CLOSED_SOURCE
          : source.index === config.frameCount
            ? OPEN_SOURCE
            : source.path;
      await renderProfileFrame(
        inputPath,
        join(outputDirectory, frameFilename(source.index, "webp")),
        config,
        endpoint,
      );
    }
  }
}

async function endpointSquaredError(actualPath, sourcePath, config) {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), "jaw-endpoint-"));
  const expectedPath = join(temporaryDirectory, "expected.webp");
  try {
    await renderProfileFrame(sourcePath, expectedPath, config, true);
    const actual = await sharp(actualPath).removeAlpha().raw().toBuffer();
    const expected = await sharp(expectedPath).removeAlpha().raw().toBuffer();
    if (actual.length !== expected.length) return Number.POSITIVE_INFINITY;
    const difference = Buffer.alloc(actual.length);
    for (let index = 0; index < actual.length; index += 1) {
      difference[index] = Math.abs(actual[index] - expected[index]);
    }
    const stats = await sharp(difference, {
      raw: { width: config.width, height: config.height, channels: 3 },
    }).stats();
    return stats.channels.reduce((sum, channel) => sum + channel.squaresSum, 0);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

async function validateProfile(config, mediaRoot) {
  const directory = join(mediaRoot, config.profile);
  const frameFiles = await listFrames(directory, "webp", config.frameCount);
  const frames = [];
  let totalBytes = 0;
  for (const frame of frameFiles) {
    const metadata = await sharp(frame.path).metadata();
    if (
      metadata.format !== "webp" ||
      metadata.width !== config.width ||
      metadata.height !== config.height ||
      metadata.hasAlpha
    ) {
      throw new Error(
        `${config.profile} frame ${frame.index} must be opaque ${config.width}x${config.height} WebP`,
      );
    }
    await sharp(frame.path).raw().toBuffer();
    const frameStat = await stat(frame.path);
    const bytes = frameStat.size;
    totalBytes += bytes;
    const sha256 = createHash("sha256")
      .update(await readFile(frame.path))
      .digest("hex");
    frames.push({
      index: frame.index,
      url: `/media/jaw-sequence/${config.profile}/${frame.name}`,
      bytes,
      sha256,
    });
  }
  validateBudget(totalBytes, config.maxBytes, config.profile);

  const startError = await endpointSquaredError(
    frameFiles[0].path,
    CLOSED_SOURCE,
    config,
  );
  const endError = await endpointSquaredError(
    frameFiles.at(-1).path,
    OPEN_SOURCE,
    config,
  );
  if (startError !== 0 || endError !== 0) {
    throw new Error(
      `${config.profile} jaw endpoint mismatch (start SSE ${startError}, end SSE ${endError})`,
    );
  }

  console.log(
    `${config.profile}: frames=${config.frameCount} dimensions=${config.width}x${config.height} bytes=${totalBytes} endpoint_sse=0`,
  );
  return {
    profile: config.profile,
    width: config.width,
    height: config.height,
    frameCount: config.frameCount,
    totalBytes,
    startFrame: 1,
    endFrame: config.frameCount,
    frames,
  };
}

const TYPE_DECLARATIONS = `export type JawSequenceProfile = "desktop" | "mobile";

export type JawSequenceManifest = Readonly<{
  profile: JawSequenceProfile;
  width: number;
  height: number;
  frameCount: number;
  totalBytes: number;
  startFrame: number;
  endFrame: number;
  frames: readonly Readonly<{ index: number; url: string; bytes: number; sha256: string }>[];
}>;`;

async function validateSequences(mediaRoot, manifestPath) {
  const manifests = {
    desktop: await validateProfile(PROFILES.desktop, mediaRoot),
    mobile: await validateProfile(PROFILES.mobile, mediaRoot),
  };
  const source = `${TYPE_DECLARATIONS}\n\nexport const jawSequenceManifests = ${JSON.stringify(manifests, null, 2)} as const satisfies Readonly<Record<JawSequenceProfile, JawSequenceManifest>>;\n`;
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, source, "utf8");
  return manifests;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.selfTest) {
    runSelfTest();
    return;
  }
  if (options.build) {
    await buildSequences(options.sourceRoot, options.mediaRoot);
  }
  await validateSequences(options.mediaRoot, options.manifest);
}

const isMain = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isMain) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
