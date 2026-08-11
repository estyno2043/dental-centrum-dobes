import { stat } from "node:fs/promises";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { getBounds, NodeIO } from "@gltf-transform/core";
import { MeshoptDecoder } from "meshoptimizer";

const REQUIRED_TEETH = [
  ...Array.from({ length: 8 }, (_, index) => `tooth.${18 - index}`),
  ...Array.from({ length: 8 }, (_, index) => `tooth.${21 + index}`),
  ...Array.from({ length: 8 }, (_, index) => `tooth.${38 - index}`),
  ...Array.from({ length: 8 }, (_, index) => `tooth.${41 + index}`),
];

const REQUIRED_ANCHORS = [
  "anchor.front", "anchor.premolar.left", "anchor.premolar.right",
  "anchor.molar.left", "anchor.molar.right", "anchor.gum.upper", "anchor.gum.lower",
];
const REQUIRED_HIT_PROXIES = [
  "hit.front", "hit.premolar.left", "hit.premolar.right",
  "hit.molar.left", "hit.molar.right", "hit.gum.upper", "hit.gum.lower",
];
const REQUIRED_NODES = ["gum.upper", "gum.lower", ...REQUIRED_ANCHORS, ...REQUIRED_HIT_PROXIES];

const ATTRIBUTION = {
  title: "Free Teeth Base Mesh",
  author: "ferrumiron6",
  source: "https://sketchfab.com/3d-models/free-teeth-base-mesh-b66fde0dc3eb44b0908096aa51b96431",
  license: "CC BY 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  modified: true,
};

const ASSETS = [
  {
    label: "desktop",
    path: "public/media/jaw/jaw-desktop.glb",
    maxBytes: 3 * 1024 * 1024,
    minTriangles: 0,
    maxTriangles: 20_000,
  },
  {
    label: "mobile",
    path: "public/media/jaw/jaw-mobile.glb",
    maxBytes: 2 * 1024 * 1024,
    minTriangles: 9_000,
    maxTriangles: 12_000,
  },
];

function fail(message) {
  throw new Error(message);
}

function countTriangles(mesh) {
  return mesh.listPrimitives().reduce((meshTotal, primitive) => {
    const indices = primitive.getIndices();
    const positions = primitive.getAttribute("POSITION");
    const elementCount = indices?.getCount() ?? positions?.getCount() ?? 0;
    return meshTotal + elementCount / 3;
  }, 0);
}

function formatBounds(bounds) {
  return `[${bounds.min.map((value) => value.toFixed(4)).join(", ")}]` +
    ` → [${bounds.max.map((value) => value.toFixed(4)).join(", ")}]`;
}

async function validateAsset(io, config) {
  const file = await stat(config.path).catch(() => null);
  if (!file) fail(`${config.label}: missing ${config.path}`);

  const document = await io.read(config.path);
  const root = document.getRoot();
  const nodes = root.listNodes();
  const nodesByName = new Map(nodes.map((node) => [node.getName(), node]));
  const toothNodes = nodes.filter((node) => node.getName().startsWith("tooth."));
  const toothNames = new Set(toothNodes.map((node) => node.getName()));
  const missingTeeth = REQUIRED_TEETH.filter((name) => !toothNames.has(name));
  const unexpectedTeeth = [...toothNames].filter((name) => !REQUIRED_TEETH.includes(name));

  if (toothNodes.length !== 32 || missingTeeth.length || unexpectedTeeth.length) {
    fail(
      `${config.label}: expected exactly 32 FDI teeth; found ${toothNodes.length}; ` +
      `missing ${missingTeeth.join(", ") || "none"}; unexpected ${unexpectedTeeth.join(", ") || "none"}`,
    );
  }
  if (new Set(toothNodes.map((node) => node.getMesh())).size !== 32 || toothNodes.some((node) => !node.getMesh())) {
    fail(`${config.label}: every tooth node must reference its own mesh`);
  }

  const gumNodes = [nodesByName.get("gum.upper"), nodesByName.get("gum.lower")];
  if (gumNodes.some((node) => !node?.getMesh()) || new Set(gumNodes.map((node) => node.getMesh())).size !== 2) {
    fail(`${config.label}: expected two distinct gum meshes`);
  }

  const missingNodes = REQUIRED_NODES.filter((name) => !nodesByName.has(name));
  if (missingNodes.length) fail(`${config.label}: missing nodes ${missingNodes.join(", ")}`);
  const duplicateNodes = REQUIRED_NODES.filter(
    (name) => nodes.filter((node) => node.getName() === name).length !== 1,
  );
  if (duplicateNodes.length) fail(`${config.label}: nodes must be unique ${duplicateNodes.join(", ")}`);

  const invalidAnchors = REQUIRED_ANCHORS.filter((name) => {
    const anchor = nodesByName.get(name);
    return anchor.getMesh() || anchor.getWorldTranslation().some((value) => !Number.isFinite(value));
  });
  if (invalidAnchors.length) fail(`${config.label}: anchors must be finite empty nodes ${invalidAnchors.join(", ")}`);

  const invalidHits = REQUIRED_HIT_PROXIES.filter((name) => {
    const hit = nodesByName.get(name);
    return !hit.getMesh() || hit.getExtras().hitProxy !== true;
  });
  if (invalidHits.length) fail(`${config.label}: hit proxies must be marked meshes ${invalidHits.join(", ")}`);

  const scene = root.getDefaultScene();
  if (!scene) fail(`${config.label}: no default scene`);
  const bounds = getBounds(scene);
  const boundValues = [...bounds.min, ...bounds.max];
  if (
    boundValues.some((value) => !Number.isFinite(value)) ||
    bounds.max.some((value, index) => value <= bounds.min[index])
  ) {
    fail(`${config.label}: bounds must be finite and non-empty`);
  }

  const triangles = root.listMeshes().reduce((total, mesh) => total + countTriangles(mesh), 0);
  if (!Number.isInteger(triangles)) fail(`${config.label}: triangle count is not integral (${triangles})`);
  if (triangles < config.minTriangles || triangles > config.maxTriangles) {
    fail(
      `${config.label}: ${triangles} triangles outside ` +
      `${config.minTriangles.toLocaleString()}-${config.maxTriangles.toLocaleString()}`,
    );
  }
  if (file.size > config.maxBytes) {
    fail(`${config.label}: ${file.size} bytes exceeds ${config.maxBytes}`);
  }

  const attribution = root.getAsset().extras;
  const invalidAttribution = Object.entries(ATTRIBUTION).filter(
    ([key, value]) => attribution?.[key] !== value,
  );
  if (invalidAttribution.length) {
    fail(`${config.label}: invalid asset attribution fields ${invalidAttribution.map(([key]) => key).join(", ")}`);
  }

  console.log(
    `${config.label}: teeth=32 gums=2 anchors=7 hits=7 triangles=${triangles} ` +
    `bytes=${file.size} bounds=${formatBounds(bounds)} attribution=${attribution.author} (${attribution.license})`,
  );
}

await MeshoptDecoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.decoder": MeshoptDecoder });

try {
  for (const asset of ASSETS) await validateAsset(io, asset);
  console.log("Jaw model validation passed.");
} catch (error) {
  console.error(`Jaw model validation failed: ${error.message}`);
  process.exitCode = 1;
}
