import * as THREE from "three";
import { describe, expect, test } from "vitest";
import {
  validateJawModel,
  ZONE_TEETH,
} from "./jawModelContract";

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
] as const;

function createMesh(name: string, geometry = new THREE.BoxGeometry(1, 1, 1)) {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  mesh.name = name;
  return mesh;
}

function createValidJaw(): THREE.Group {
  const root = new THREE.Group();
  root.userData.license = "CC BY 4.0";

  for (const fdi of REQUIRED_FDI_TEETH) {
    const tooth = createMesh(`tooth.${fdi}`);
    tooth.position.set(fdi % 10, Math.floor(fdi / 10), 0);
    root.add(tooth);
  }

  const upperGum = createMesh("gum.upper");
  upperGum.position.set(4.5, 2, 0);
  root.add(upperGum);

  const lowerGum = createMesh("gum.lower");
  lowerGum.position.set(4.5, -2, 0);
  root.add(lowerGum);

  for (const id of JAW_HIT_IDS) {
    const anchor = new THREE.Object3D();
    anchor.name = `anchor.${id}`;
    root.add(anchor);

    const hitProxy = createMesh(`hit.${id}`, new THREE.BoxGeometry(100, 100, 100));
    hitProxy.position.set(500, 500, 500);
    root.add(hitProxy);
  }

  return root;
}

function removeNamed(root: THREE.Group, name: string): void {
  const node = root.getObjectByName(name);
  if (node) root.remove(node);
}

describe("validateJawModel", () => {
  test("returns the exact semantic nodes and excludes hit proxies from bounds", () => {
    const nodes = validateJawModel(createValidJaw());

    expect([...nodes.teeth.keys()]).toEqual(
      REQUIRED_FDI_TEETH.map((fdi) => `tooth.${fdi}`),
    );
    expect(nodes.gums.upper.name).toBe("gum.upper");
    expect(nodes.gums.lower.name).toBe("gum.lower");
    expect([...nodes.anchors.keys()]).toEqual(JAW_HIT_IDS);
    expect([...nodes.hitProxies.keys()]).toEqual(JAW_HIT_IDS);
    expect(nodes.bounds.max.x).toBeLessThan(20);
    expect(nodes.bounds.max.y).toBeLessThan(10);
  });

  test("exports the locked FDI zone memberships", () => {
    expect(ZONE_TEETH).toEqual({
      front: [11, 12, 13, 21, 22, 23, 31, 32, 33, 41, 42, 43],
      "premolar.right": [14, 15, 44, 45],
      "premolar.left": [24, 25, 34, 35],
      "molar.right": [16, 17, 18, 46, 47, 48],
      "molar.left": [26, 27, 28, 36, 37, 38],
    });
    expect(Object.isFrozen(ZONE_TEETH)).toBe(true);
    expect(Object.values(ZONE_TEETH).every(Object.isFrozen)).toBe(true);
  });

  test("reports the first missing FDI tooth explicitly", () => {
    const root = createValidJaw();
    removeNamed(root, "tooth.11");

    expect(() => validateJawModel(root)).toThrow(
      "Jaw model missing node: tooth.11",
    );
  });

  test("rejects an unexpected tooth even when the total remains 32", () => {
    const root = createValidJaw();
    removeNamed(root, "tooth.11");
    root.add(createMesh("tooth.19"));

    expect(() => validateJawModel(root)).toThrow(
      "Jaw model missing node: tooth.11",
    );
  });

  test.each(["tooth.19", "gum.middle", "anchor.extra", "hit.extra"])(
    "rejects an unexpected semantic node: %s",
    (name) => {
      const root = createValidJaw();
      root.add(createMesh(name));

      expect(() => validateJawModel(root)).toThrow(
        `Jaw model unexpected node: ${name}`,
      );
    },
  );

  test("reports duplicate semantic names explicitly", () => {
    const root = createValidJaw();
    root.add(createMesh("tooth.11"));

    expect(() => validateJawModel(root)).toThrow(
      "Jaw model duplicate node: tooth.11",
    );
  });

  test("reports a missing gum explicitly", () => {
    const root = createValidJaw();
    removeNamed(root, "gum.upper");

    expect(() => validateJawModel(root)).toThrow(
      "Jaw model missing node: gum.upper",
    );
  });

  test.each(["anchor.front", "hit.gum.lower"])(
    "reports a missing required semantic node: %s",
    (name) => {
      const root = createValidJaw();
      removeNamed(root, name);

      expect(() => validateJawModel(root)).toThrow(
        `Jaw model missing node: ${name}`,
      );
    },
  );

  test("rejects empty rendered bounds", () => {
    const root = createValidJaw();
    root.traverse((node) => {
      if (node instanceof THREE.Mesh && !node.name.startsWith("hit.")) {
        node.geometry = new THREE.BufferGeometry();
      }
    });

    expect(() => validateJawModel(root)).toThrow(
      "Jaw model rendered bounds are empty",
    );
  });

  test("requires the CC BY 4.0 attribution", () => {
    const root = createValidJaw();
    delete root.userData.license;

    expect(() => validateJawModel(root)).toThrow(
      "Jaw model missing CC BY 4.0 attribution",
    );
  });
});
