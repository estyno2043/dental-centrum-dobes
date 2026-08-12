import * as THREE from "three";
import { afterEach, describe, expect, test, vi } from "vitest";
import type { ClinicStoryMotionState } from "../clinicStoryMotion";
import { JawSceneController, type JawSceneOptions } from "./JawSceneController";
import type { JawModelNodes } from "./jawModelContract";

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

class FakeRenderer {
  outputColorSpace = THREE.LinearSRGBColorSpace;
  toneMapping = THREE.NoToneMapping;
  toneMappingExposure = 1;
  shadowMap = { enabled: false, type: THREE.BasicShadowMap };
  pixelRatios: number[] = [];
  sizes: Array<[number, number, boolean]> = [];
  renderCount = 0;
  disposeCount = 0;

  setPixelRatio(value: number): void {
    this.pixelRatios.push(value);
  }

  setSize(width: number, height: number, updateStyle: boolean): void {
    this.sizes.push([width, height, updateStyle]);
  }

  render(): void {
    this.renderCount += 1;
  }

  dispose(): void {
    this.disposeCount += 1;
  }
}

class FakeResizeObserver {
  disconnectCount = 0;
  observed: Element[] = [];
  observeError: Error | null = null;

  observe(target: Element): void {
    if (this.observeError) throw this.observeError;
    this.observed.push(target);
  }

  disconnect(): void {
    this.disconnectCount += 1;
  }
}

type InternalFactories = Readonly<{
  loadModel(url: string): Promise<THREE.Group>;
  createRenderer(parameters: THREE.WebGLRendererParameters): FakeRenderer;
  createResizeObserver(callback: ResizeObserverCallback): FakeResizeObserver;
  document: Document;
  devicePixelRatio(): number;
}>;

type InternalControllerClass = Readonly<{
  createInternal(
    canvas: HTMLCanvasElement,
    options: JawSceneOptions,
    factories: InternalFactories,
  ): Promise<JawSceneController>;
}>;

const createInternal = (
  canvas: HTMLCanvasElement,
  options: JawSceneOptions,
  factories: InternalFactories,
) =>
  (JawSceneController as unknown as InternalControllerClass).createInternal(
    canvas,
    options,
    factories,
  );

type ControllerInspection = Readonly<{
  camera: THREE.PerspectiveCamera;
  nodes: JawModelNodes;
}>;

function inspectController(controller: JawSceneController): ControllerInspection {
  return controller as unknown as ControllerInspection;
}

function expectMolarTargetsInsideFrustum(
  controller: JawSceneController,
  width: number,
  height: number,
): void {
  const inspection = inspectController(controller);
  inspection.nodes.root.updateWorldMatrix(true, true);
  inspection.camera.updateMatrixWorld();

  const right = controller.projectAnchor("molar.right");
  const left = controller.projectAnchor("molar.left");
  expect(right.visible).toBe(true);
  expect(left.visible).toBe(true);
  expect(right.x).toBeGreaterThanOrEqual(0);
  expect(right.x).toBeLessThanOrEqual(width);
  expect(left.x).toBeGreaterThanOrEqual(0);
  expect(left.x).toBeLessThanOrEqual(width);
  expect(right.y).toBeGreaterThanOrEqual(0);
  expect(right.y).toBeLessThanOrEqual(height);
  expect(left.y).toBeGreaterThanOrEqual(0);
  expect(left.y).toBeLessThanOrEqual(height);
  expect((right.x + left.x) / 2).toBeCloseTo(width / 2, 5);

  for (const id of ["molar.right", "molar.left"] as const) {
    const proxy = inspection.nodes.hitProxies.get(id)!;
    const bounds = new THREE.Box3().setFromObject(proxy, true);
    for (const x of [bounds.min.x, bounds.max.x]) {
      for (const y of [bounds.min.y, bounds.max.y]) {
        for (const z of [bounds.min.z, bounds.max.z]) {
          const projected = new THREE.Vector3(x, y, z).project(
            inspection.camera,
          );
          expect(Math.abs(projected.x)).toBeLessThanOrEqual(1);
          expect(Math.abs(projected.y)).toBeLessThanOrEqual(1);
          expect(projected.z).toBeGreaterThanOrEqual(-1);
          expect(projected.z).toBeLessThanOrEqual(1);
        }
      }
    }
  }
}

function createMesh(name: string, size = 1): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(size, size, size),
    new THREE.MeshStandardMaterial(),
  );
  mesh.name = name;
  return mesh;
}

function createJawRoot(): THREE.Group {
  const root = new THREE.Group();
  root.userData.license = "CC BY 4.0";

  REQUIRED_FDI_TEETH.forEach((fdi) => {
    const tooth = createMesh(`tooth.${fdi}`);
    const quadrant = Math.floor(fdi / 10);
    const patientSide = quadrant === 1 || quadrant === 4 ? -1 : 1;
    tooth.position.set(
      patientSide * ((fdi % 10) - 0.5) * 0.5,
      fdi < 30 ? 1 : -1,
      0,
    );
    root.add(tooth);
  });

  const upper = createMesh("gum.upper");
  upper.scale.set(8, 0.5, 1);
  upper.position.y = 1.3;
  root.add(upper);

  const lower = createMesh("gum.lower");
  lower.scale.set(8, 0.5, 1);
  lower.position.y = -1.3;
  root.add(lower);

  for (const id of JAW_HIT_IDS) {
    const x = id.endsWith(".right") ? -3 : id.endsWith(".left") ? 3 : 0;
    const y = id === "gum.upper" ? 4 : id === "gum.lower" ? -4 : 0;
    const anchor = new THREE.Object3D();
    anchor.name = `anchor.${id}`;
    anchor.position.set(x, y, 0);
    root.add(anchor);

    const proxy = createMesh(`hit.${id}`, 2);
    proxy.position.set(x, y, 0);
    root.add(proxy);
  }

  const decoy = createMesh("visual.decoy", 3);
  decoy.position.z = 2;
  root.add(decoy);
  return root;
}

function createCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.getBoundingClientRect = () =>
    ({
      x: 100,
      y: 200,
      left: 100,
      top: 200,
      right: 420,
      bottom: 380,
      width: 320,
      height: 180,
      toJSON: () => ({}),
    }) as DOMRect;
  return canvas;
}

function createOptions(profile: "desktop" | "mobile" = "desktop") {
  return {
    profile,
    modelUrl: `/jaw-${profile}.glb`,
    onFirstFrame: vi.fn(),
    onFatalError: vi.fn(),
    onContextLost: vi.fn(),
    onContextRestored: vi.fn(),
    requestRender: vi.fn(),
  } satisfies JawSceneOptions;
}

function createFactories(root = createJawRoot(), dpr = 3) {
  const renderer = new FakeRenderer();
  const observer = new FakeResizeObserver();
  const parameters: THREE.WebGLRendererParameters[] = [];
  const loadedUrls: string[] = [];
  const factories: InternalFactories = {
    async loadModel(url) {
      loadedUrls.push(url);
      return root;
    },
    createRenderer(nextParameters) {
      parameters.push(nextParameters);
      return renderer;
    },
    createResizeObserver() {
      return observer;
    },
    document,
    devicePixelRatio: () => dpr,
  };
  return { factories, renderer, observer, parameters, loadedUrls };
}

function trackListenerBalance(
  target: EventTarget,
  type: string,
): { active(): number; restore(): void } {
  const originalAdd = target.addEventListener.bind(target);
  const originalRemove = target.removeEventListener.bind(target);
  const listeners = new Set<EventListenerOrEventListenerObject>();
  target.addEventListener = ((
    eventType: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean,
  ) => {
    if (eventType === type && listener) listeners.add(listener);
    originalAdd(eventType, listener, options);
  }) as typeof target.addEventListener;
  target.removeEventListener = ((
    eventType: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean,
  ) => {
    if (eventType === type && listener) listeners.delete(listener);
    originalRemove(eventType, listener, options);
  }) as typeof target.removeEventListener;
  return {
    active: () => listeners.size,
    restore() {
      target.addEventListener = originalAdd;
      target.removeEventListener = originalRemove;
    },
  };
}

function trackJawResources(root: THREE.Group) {
  const geometrySpies: Array<ReturnType<typeof vi.spyOn>> = [];
  const materialSpies: Array<ReturnType<typeof vi.spyOn>> = [];
  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    geometrySpies.push(vi.spyOn(node.geometry, "dispose"));
    const materials = Array.isArray(node.material)
      ? node.material
      : [node.material];
    for (const material of materials) {
      materialSpies.push(vi.spyOn(material, "dispose"));
    }
  });
  return {
    expectDisposedExactlyOnce() {
      for (const spy of geometrySpies) expect(spy).toHaveBeenCalledTimes(1);
      for (const spy of materialSpies) expect(spy).toHaveBeenCalledTimes(1);
    },
  };
}

function motion(
  values: Partial<ClinicStoryMotionState> = {},
): ClinicStoryMotionState {
  return {
    grow: 1,
    pan: 1,
    snap: 1,
    zoom: 1,
    blur: 1,
    jawOpacity: 1,
    jawOpen: 0,
    jawSeparation: 0,
    labelsOpacity: 0,
    interactive: false,
    ...values,
  };
}

function setVisibility(value: DocumentVisibilityState): void {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    value,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  setVisibility("visible");
});

describe("JawSceneController", () => {
  test("can be imported without evaluating browser globals", async () => {
    const documentDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      "document",
    );
    const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
    vi.resetModules();
    Reflect.deleteProperty(globalThis, "document");
    Reflect.deleteProperty(globalThis, "window");
    try {
      await expect(import("./JawSceneController")).resolves.toHaveProperty(
        "JawSceneController",
      );
    } finally {
      if (documentDescriptor) {
        Object.defineProperty(globalThis, "document", documentDescriptor);
      }
      if (windowDescriptor) {
        Object.defineProperty(globalThis, "window", windowDescriptor);
      }
    }
  });

  test("loads the requested model and initializes deterministic desktop rendering", async () => {
    const canvas = createCanvas();
    const options = createOptions("desktop");
    const setup = createFactories(createJawRoot(), 3);

    const controller = await createInternal(canvas, options, setup.factories);

    expect(setup.loadedUrls).toEqual(["/jaw-desktop.glb"]);
    expect(setup.parameters).toEqual([
      {
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      },
    ]);
    expect(setup.renderer.outputColorSpace).toBe(THREE.SRGBColorSpace);
    expect(setup.renderer.toneMapping).toBe(THREE.ACESFilmicToneMapping);
    expect(setup.renderer.shadowMap).toEqual({
      enabled: true,
      type: THREE.PCFSoftShadowMap,
    });
    expect(setup.renderer.pixelRatios.at(-1)).toBe(1.5);
    expect(setup.renderer.sizes.at(-1)).toEqual([320, 180, false]);
    expect(options.requestRender).toHaveBeenCalledTimes(1);

    controller.dispose();
  });

  test("disables antialiasing and caps device pixels more tightly on mobile", async () => {
    const canvas = createCanvas();
    const options = createOptions("mobile");
    const setup = createFactories(createJawRoot(), 3);

    const controller = await createInternal(canvas, options, setup.factories);

    expect(setup.parameters[0].antialias).toBe(false);
    expect(setup.renderer.pixelRatios.at(-1)).toBe(1.25);
    controller.dispose();
  });

  test("renders only on demand, pauses while hidden, and announces the first frame once", async () => {
    const options = createOptions();
    const setup = createFactories();
    const controller = await createInternal(
      createCanvas(),
      options,
      setup.factories,
    );

    controller.render();
    controller.render();
    expect(setup.renderer.renderCount).toBe(2);
    expect(options.onFirstFrame).toHaveBeenCalledTimes(1);

    setVisibility("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    controller.render();
    controller.setPanelOpen(true);
    expect(setup.renderer.renderCount).toBe(2);

    options.requestRender.mockClear();
    setVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(options.requestRender).toHaveBeenCalledTimes(1);

    controller.render();
    expect(setup.renderer.renderCount).toBe(3);
    expect(options.onFirstFrame).toHaveBeenCalledTimes(1);
    controller.dispose();
  });

  test("applies canonical jaw motion directly", async () => {
    const root = createJawRoot();
    const upper = root.getObjectByName("tooth.11") as THREE.Mesh;
    const premolarRight = root.getObjectByName("tooth.14") as THREE.Mesh;
    const molarLeft = root.getObjectByName("tooth.26") as THREE.Mesh;
    const rightAnchor = root.getObjectByName("anchor.molar.right")!;
    const leftProxy = root.getObjectByName("hit.molar.left")!;
    const upperStart = upper.position.clone();
    const premolarStart = premolarRight.position.clone();
    const molarStart = molarLeft.position.clone();
    const rightAnchorStart = rightAnchor.position.clone();
    const leftProxyStart = leftProxy.position.clone();
    const options = createOptions();
    const setup = createFactories(root);
    const controller = await createInternal(
      createCanvas(),
      options,
      setup.factories,
    );
    options.requestRender.mockClear();

    controller.setMotion(
      motion({ jawOpen: 1, jawSeparation: 1 }),
    );

    expect(root.scale.x).toBe(1);
    expect(root.rotation.x).toBeCloseTo(-Math.PI / 10);
    expect(upper.position.y).toBeGreaterThan(upperStart.y);
    expect(premolarRight.position.x).toBeLessThan(premolarStart.x);
    expect(molarLeft.position.x).toBeGreaterThan(molarStart.x);
    expect(Math.abs(premolarRight.position.x)).toBeGreaterThan(
      Math.abs(premolarStart.x),
    );
    expect(Math.abs(molarLeft.position.x)).toBeGreaterThan(
      Math.abs(molarStart.x),
    );
    expect(rightAnchor.position.x).toBeLessThan(rightAnchorStart.x);
    expect(leftProxy.position.x).toBeGreaterThan(leftProxyStart.x);
    expect(options.requestRender).toHaveBeenCalledTimes(1);

    const canonicalTransforms = {
      scale: root.scale.clone(),
      rotation: root.rotation.clone(),
      upper: upper.position.clone(),
      premolar: premolarRight.position.clone(),
      molar: molarLeft.position.clone(),
    };
    controller.setMotion(
      motion({ jawOpen: 1, jawSeparation: 1 }),
    );
    expect(root.scale).toEqual(canonicalTransforms.scale);
    expect(root.rotation.x).toBe(canonicalTransforms.rotation.x);
    expect(upper.position).toEqual(canonicalTransforms.upper);
    expect(premolarRight.position).toEqual(canonicalTransforms.premolar);
    expect(molarLeft.position).toEqual(canonicalTransforms.molar);
    controller.dispose();
  });

  test("emphasizes only meshes in the active zone", async () => {
    const root = createJawRoot();
    const setup = createFactories(root);
    const controller = await createInternal(
      createCanvas(),
      createOptions(),
      setup.factories,
    );
    const front = root.getObjectByName("tooth.11") as THREE.Mesh;
    const premolar = root.getObjectByName("tooth.14") as THREE.Mesh;
    const molar = root.getObjectByName("tooth.16") as THREE.Mesh;

    controller.setActiveZone("premolar");

    expect((premolar.material as THREE.MeshPhysicalMaterial).emissiveIntensity).toBeGreaterThan(
      (front.material as THREE.MeshPhysicalMaterial).emissiveIntensity,
    );
    expect(molar.material).toBe(front.material);

    controller.setActiveZone(null);
    expect(premolar.material).toBe(front.material);
    controller.dispose();
  });

  test("projects anchors into canvas-local CSS coordinates", async () => {
    const setup = createFactories();
    const controller = await createInternal(
      createCanvas(),
      createOptions(),
      setup.factories,
    );

    const point = controller.projectAnchor("front");

    expect(point.x).toBeCloseTo(160);
    expect(point.y).toBeCloseTo(90);
    expect(point.visible).toBe(true);
    controller.dispose();
  });

  test.each([
    { profile: "mobile" as const, width: 390, height: 844 },
    { profile: "desktop" as const, width: 1440, height: 900 },
  ])(
    "keeps final molar anchors and proxies framed at $width x $height",
    async ({ profile, width, height }) => {
      const canvas = createCanvas();
      canvas.getBoundingClientRect = () =>
        ({
          x: 0,
          y: 0,
          left: 0,
          top: 0,
          right: width,
          bottom: height,
          width,
          height,
          toJSON: () => ({}),
        }) as DOMRect;
      const setup = createFactories();
      const controller = await createInternal(
        canvas,
        createOptions(profile),
        setup.factories,
      );

      controller.resize(width, height, 3);
      controller.setMotion(
        motion({ jawOpen: 1, jawSeparation: 1, interactive: true }),
      );

      expectMolarTargetsInsideFrustum(controller, width, height);
      controller.dispose();
    },
  );

  test("reframes the final desktop jaw into the panel-safe composition and reverses exactly", async () => {
    const width = 1440;
    const height = 900;
    const canvas = createCanvas();
    canvas.getBoundingClientRect = () =>
      ({
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: width,
        bottom: height,
        width,
        height,
        toJSON: () => ({}),
      }) as DOMRect;
    const options = createOptions("desktop");
    const setup = createFactories();
    const controller = await createInternal(canvas, options, setup.factories);
    controller.resize(width, height, 3);
    controller.setMotion(
      motion({ jawOpen: 1, jawSeparation: 1, interactive: true }),
    );
    const closedFront = controller.projectAnchor("front");
    options.requestRender.mockClear();

    controller.setPanelOpen(true);
    const openAnchors = JAW_HIT_IDS.map((id) => controller.projectAnchor(id));
    const safeRight = width - Math.min(470, width * 0.92);
    expect(controller.projectAnchor("front").x).toBeLessThan(closedFront.x);
    expect(Math.max(...openAnchors.map((anchor) => anchor.x))).toBeLessThanOrEqual(
      safeRight,
    );
    expect(options.requestRender).toHaveBeenCalledTimes(1);

    controller.setPanelOpen(false);
    expect(controller.projectAnchor("front").x).toBeCloseTo(closedFront.x, 4);
    expect(options.requestRender).toHaveBeenCalledTimes(2);
    controller.dispose();
  });

  test("raycasts against hit proxies only after canonical motion becomes interactive", async () => {
    const setup = createFactories();
    const controller = await createInternal(
      createCanvas(),
      createOptions(),
      setup.factories,
    );

    expect(controller.hitTest(260, 290)).toBeNull();
    controller.setMotion(motion({ jawOpen: 1, jawSeparation: 1, interactive: true }));
    expect(controller.hitTest(260, 290)).toBe("front");
    expect(controller.hitTest(99, 290)).toBeNull();
    expect(controller.hitTest(421, 290)).toBeNull();
    controller.dispose();
  });

  test("delegates context recovery after preventing default rendering loss", async () => {
    const canvas = createCanvas();
    const options = createOptions();
    const setup = createFactories();
    const controller = await createInternal(canvas, options, setup.factories);
    options.requestRender.mockClear();

    const lost = new Event("webglcontextlost", { cancelable: true });
    canvas.dispatchEvent(lost);
    controller.setActiveZone("front");
    controller.render();
    expect(lost.defaultPrevented).toBe(true);
    expect(options.onContextLost).toHaveBeenCalledTimes(1);
    expect(options.requestRender).not.toHaveBeenCalled();
    expect(setup.renderer.renderCount).toBe(0);

    canvas.dispatchEvent(new Event("webglcontextrestored"));
    expect(options.onContextRestored).toHaveBeenCalledTimes(1);
    expect(options.requestRender).not.toHaveBeenCalled();
    controller.render();
    expect(setup.renderer.renderCount).toBe(1);
    controller.dispose();
  });

  test("reports load failure through the fatal boundary", async () => {
    const options = createOptions();
    const setup = createFactories();
    const failure = new Error("network unavailable");
    const factories = {
      ...setup.factories,
      loadModel: vi.fn().mockRejectedValue(failure),
    };

    await expect(
      createInternal(createCanvas(), options, factories),
    ).rejects.toBe(failure);
    expect(options.onFatalError).toHaveBeenCalledWith(failure);
    expect(setup.renderer.disposeCount).toBe(0);
  });

  test.each(["validation", "renderer creation"] as const)(
    "cleans the loaded model when %s fails before controller allocation",
    async (failurePoint) => {
      const root = createJawRoot();
      const resources = trackJawResources(root);
      const setup = createFactories(root);
      const options = createOptions();
      const failure = new Error(`${failurePoint} failed`);
      let factories: InternalFactories = setup.factories;
      if (failurePoint === "validation") {
        delete root.userData.license;
      } else {
        factories = {
          ...setup.factories,
          createRenderer: () => {
            throw failure;
          },
        };
      }

      const promise = createInternal(createCanvas(), options, factories);
      if (failurePoint === "validation") {
        await expect(promise).rejects.toThrow(
          "Jaw model missing CC BY 4.0 attribution",
        );
      } else {
        await expect(promise).rejects.toBe(failure);
      }
      expect(options.onFatalError).toHaveBeenCalledTimes(1);
      expect(setup.renderer.disposeCount).toBe(0);
      resources.expectDisposedExactlyOnce();
    },
  );

  test.each([
    "observer factory",
    "observer observe",
    "initial renderer sizing",
    "initial render request",
  ] as const)(
    "cleans every acquired resource when %s throws during construction",
    async (failurePoint) => {
      const root = createJawRoot();
      const resources = trackJawResources(root);
      const setup = createFactories(root);
      const canvas = createCanvas();
      const options = createOptions();
      const failure = new Error(`${failurePoint} failed`);
      const visibility = trackListenerBalance(document, "visibilitychange");
      const contextLost = trackListenerBalance(canvas, "webglcontextlost");
      const contextRestored = trackListenerBalance(
        canvas,
        "webglcontextrestored",
      );
      const setSize = setup.renderer.setSize.bind(setup.renderer);
      let factories: InternalFactories = setup.factories;
      if (failurePoint === "observer factory") {
        factories = {
          ...setup.factories,
          createResizeObserver: () => {
            throw failure;
          },
        };
      } else if (failurePoint === "observer observe") {
        setup.observer.observeError = failure;
      } else if (failurePoint === "initial renderer sizing") {
        setup.renderer.setSize = () => {
          throw failure;
        };
      } else {
        options.requestRender = vi.fn(() => {
          throw failure;
        });
      }

      try {
        await expect(
          createInternal(canvas, options, factories),
        ).rejects.toBe(failure);
        expect(options.onFatalError).toHaveBeenCalledTimes(1);
        expect(options.onFatalError).toHaveBeenCalledWith(failure);
        expect(setup.renderer.disposeCount).toBe(1);
        expect(setup.observer.disconnectCount).toBe(
          failurePoint === "observer factory" ? 0 : 1,
        );
        expect(visibility.active()).toBe(0);
        expect(contextLost.active()).toBe(0);
        expect(contextRestored.active()).toBe(0);
        resources.expectDisposedExactlyOnce();
      } finally {
        setup.renderer.setSize = setSize;
        visibility.restore();
        contextLost.restore();
        contextRestored.restore();
      }
    },
  );

  test("removes listeners and disposes every owned GPU resource exactly once", async () => {
    const root = createJawRoot();
    const tooth = root.getObjectByName("tooth.11") as THREE.Mesh;
    const originalMaterial = tooth.material as THREE.Material;
    const geometryDispose = vi.spyOn(tooth.geometry, "dispose");
    const materialDispose = vi.spyOn(originalMaterial, "dispose");
    const options = createOptions();
    const setup = createFactories(root);
    const canvas = createCanvas();
    const controller = await createInternal(canvas, options, setup.factories);

    controller.dispose();
    controller.dispose();

    expect(geometryDispose).toHaveBeenCalledTimes(1);
    expect(materialDispose).toHaveBeenCalledTimes(1);
    expect(setup.renderer.disposeCount).toBe(1);
    expect(setup.observer.disconnectCount).toBe(1);

    options.requestRender.mockClear();
    document.dispatchEvent(new Event("visibilitychange"));
    canvas.dispatchEvent(new Event("webglcontextrestored"));
    expect(options.requestRender).not.toHaveBeenCalled();
  });
});
