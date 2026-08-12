import * as THREE from "three";

export type JawZoneId = "front" | "premolar" | "molar" | "gum";

export type JawHitId =
  | "front"
  | "premolar.left"
  | "premolar.right"
  | "molar.left"
  | "molar.right"
  | "gum.upper"
  | "gum.lower";

export type JawModelNodes = Readonly<{
  root: THREE.Group;
  teeth: ReadonlyMap<string, THREE.Mesh>;
  gums: Readonly<{ upper: THREE.Mesh; lower: THREE.Mesh }>;
  anchors: ReadonlyMap<JawHitId, THREE.Object3D>;
  hitProxies: ReadonlyMap<JawHitId, THREE.Object3D>;
  bounds: THREE.Box3;
}>;

export const ZONE_TEETH = Object.freeze({
  front: Object.freeze([11, 12, 13, 21, 22, 23, 31, 32, 33, 41, 42, 43]),
  "premolar.right": Object.freeze([14, 15, 44, 45]),
  "premolar.left": Object.freeze([24, 25, 34, 35]),
  "molar.right": Object.freeze([16, 17, 18, 46, 47, 48]),
  "molar.left": Object.freeze([26, 27, 28, 36, 37, 38]),
});

const REQUIRED_FDI_TEETH = [
  18, 17, 16, 15, 14, 13, 12, 11,
  21, 22, 23, 24, 25, 26, 27, 28,
  38, 37, 36, 35, 34, 33, 32, 31,
  41, 42, 43, 44, 45, 46, 47, 48,
] as const;

const JAW_HIT_IDS = [
  "front",
  "premolar.left",
  "premolar.right",
  "molar.left",
  "molar.right",
  "gum.upper",
  "gum.lower",
] as const satisfies readonly JawHitId[];

const REQUIRED_TOOTH_NAMES = REQUIRED_FDI_TEETH.map((fdi) => `tooth.${fdi}`);
const REQUIRED_GUM_NAMES = ["gum.upper", "gum.lower"] as const;
const REQUIRED_ANCHOR_NAMES = JAW_HIT_IDS.map((id) => `anchor.${id}`);
const REQUIRED_HIT_NAMES = JAW_HIT_IDS.map((id) => `hit.${id}`);
const REQUIRED_NAMES = [
  ...REQUIRED_TOOTH_NAMES,
  ...REQUIRED_GUM_NAMES,
  ...REQUIRED_ANCHOR_NAMES,
  ...REQUIRED_HIT_NAMES,
];

function isSemanticName(name: string): boolean {
  return /^(?:tooth|gum|anchor|hit)\./.test(name);
}

function requiredNode(
  nodesByName: ReadonlyMap<string, readonly THREE.Object3D[]>,
  name: string,
): THREE.Object3D {
  const matches = nodesByName.get(name);
  if (!matches?.length) throw new Error(`Jaw model missing node: ${name}`);
  if (matches.length > 1) throw new Error(`Jaw model duplicate node: ${name}`);
  return matches[0];
}

function requiredMesh(
  nodesByName: ReadonlyMap<string, readonly THREE.Object3D[]>,
  name: string,
): THREE.Mesh {
  const node = requiredNode(nodesByName, name);
  if (!(node instanceof THREE.Mesh)) {
    throw new Error(`Jaw model node is not a mesh: ${name}`);
  }
  return node;
}

export function validateJawModel(root: THREE.Group): JawModelNodes {
  const nodesByName = new Map<string, THREE.Object3D[]>();
  const semanticNames: string[] = [];

  root.traverse((node) => {
    if (!isSemanticName(node.name)) return;
    semanticNames.push(node.name);
    const matches = nodesByName.get(node.name);
    if (matches) matches.push(node);
    else nodesByName.set(node.name, [node]);
  });

  for (const name of REQUIRED_NAMES) requiredNode(nodesByName, name);

  const unexpectedName = semanticNames.find(
    (name) => !REQUIRED_NAMES.includes(name),
  );
  if (unexpectedName) {
    throw new Error(`Jaw model unexpected node: ${unexpectedName}`);
  }

  if (root.userData.license !== "CC BY 4.0") {
    throw new Error("Jaw model missing CC BY 4.0 attribution");
  }

  const teeth = new Map<string, THREE.Mesh>();
  for (const name of REQUIRED_TOOTH_NAMES) {
    teeth.set(name, requiredMesh(nodesByName, name));
  }

  const gums = Object.freeze({
    upper: requiredMesh(nodesByName, "gum.upper"),
    lower: requiredMesh(nodesByName, "gum.lower"),
  });

  const anchors = new Map<JawHitId, THREE.Object3D>();
  const hitProxies = new Map<JawHitId, THREE.Object3D>();
  for (const id of JAW_HIT_IDS) {
    anchors.set(id, requiredNode(nodesByName, `anchor.${id}`));
    hitProxies.set(id, requiredMesh(nodesByName, `hit.${id}`));
  }

  root.updateWorldMatrix(true, true);
  const bounds = new THREE.Box3();
  for (const mesh of [...teeth.values(), gums.upper, gums.lower]) {
    bounds.expandByObject(mesh, true);
  }
  const size = bounds.getSize(new THREE.Vector3());
  if (
    bounds.isEmpty() ||
    !Number.isFinite(size.x + size.y + size.z) ||
    size.x <= 0 ||
    size.y <= 0 ||
    size.z <= 0
  ) {
    throw new Error("Jaw model rendered bounds are empty");
  }

  return Object.freeze({ root, teeth, gums, anchors, hitProxies, bounds });
}
