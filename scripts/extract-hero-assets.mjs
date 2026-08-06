import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const sourcePath = path.resolve("docs/source/Hero_v7_Dobes.html");
const outputDir = path.resolve("public/media");
const html = await readFile(sourcePath, "utf8");

const assets = [
  ["dobes-logo-white.png", /data:image\/png;base64,([^"]+)/],
  ["hero-poster.jpg", /poster="data:image\/jpeg;base64,([^"]+)"/],
  ["hero-video.mp4", /data:video\/mp4;base64,([^"]+)/],
];

await mkdir(outputDir, { recursive: true });

for (const [filename, pattern] of assets) {
  const match = html.match(pattern);
  if (!match) throw new Error(`Missing embedded asset: ${filename}`);
  const buffer = Buffer.from(match[1], "base64");
  if (buffer.length === 0) throw new Error(`Empty embedded asset: ${filename}`);
  await writeFile(path.join(outputDir, filename), buffer);
}
