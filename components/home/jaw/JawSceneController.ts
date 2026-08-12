import * as THREE from "three";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { ClinicStoryMotionState } from "../clinicStoryMotion";
import { computeJawPose, type JawPose } from "./jawPose";
import {
  type JawHitId,
  type JawModelNodes,
  type JawZoneId,
  validateJawModel,
  ZONE_TEETH,
} from "./jawModelContract";

export type JawProjectedPoint = Readonly<{
  x: number;
  y: number;
  visible: boolean;
}>;

export interface JawSceneOptions {
  profile: "desktop" | "mobile";
  modelUrl: string;
  onFirstFrame(): void;
  onFatalError(error: Error): void;
  onContextLost(): void;
  onContextRestored(): void;
  requestRender(): void;
}

type RendererSurface = Pick<
  THREE.WebGLRenderer,
  | "dispose"
  | "outputColorSpace"
  | "render"
  | "setPixelRatio"
  | "setSize"
  | "shadowMap"
  | "toneMapping"
  | "toneMappingExposure"
>;

type ResizeObserverSurface = Pick<ResizeObserver, "disconnect" | "observe">;

type InternalFactories = Readonly<{
  loadModel(url: string): Promise<THREE.Group>;
  createRenderer(parameters: THREE.WebGLRendererParameters): RendererSurface;
  createResizeObserver(callback: ResizeObserverCallback): ResizeObserverSurface;
  document: Document;
  devicePixelRatio(): number;
}>;

function createDefaultFactories(): InternalFactories {
  return {
    async loadModel(url) {
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      const gltf = await loader.loadAsync(url);
      Object.assign(gltf.scene.userData, gltf.asset.extras ?? {});
      return gltf.scene;
    },
    createRenderer(parameters) {
      return new THREE.WebGLRenderer(parameters);
    },
    createResizeObserver(callback) {
      return new ResizeObserver(callback);
    },
    document,
    devicePixelRatio() {
      return window.devicePixelRatio;
    },
  };
}

const toothNamesByZone = {
  front: new Set(ZONE_TEETH.front.map((fdi) => `tooth.${fdi}`)),
  premolar: new Set(
    [...ZONE_TEETH["premolar.left"], ...ZONE_TEETH["premolar.right"]].map(
      (fdi) => `tooth.${fdi}`,
    ),
  ),
  molar: new Set(
    [...ZONE_TEETH["molar.left"], ...ZONE_TEETH["molar.right"]].map(
      (fdi) => `tooth.${fdi}`,
    ),
  ),
} as const;

function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function materialsOf(mesh: THREE.Mesh): THREE.Material[] {
  return Array.isArray(mesh.material) ? mesh.material : [mesh.material];
}

function disposeObjectResources(root: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    geometries.add(node.geometry);
    for (const material of materialsOf(node)) {
      materials.add(material);
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) textures.add(value);
      }
    }
  });
  for (const texture of textures) texture.dispose();
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
}

function zoneForTooth(name: string): Exclude<JawZoneId, "gum"> {
  if (toothNamesByZone.front.has(name)) return "front";
  if (toothNamesByZone.premolar.has(name)) return "premolar";
  return "molar";
}

function fdiFromName(name: string): number {
  return Number(name.slice("tooth.".length));
}

export class JawSceneController {
  static create(
    canvas: HTMLCanvasElement,
    options: JawSceneOptions,
  ): Promise<JawSceneController> {
    return JawSceneController.createInternal(
      canvas,
      options,
      createDefaultFactories(),
    );
  }

  /** Internal factory seam used by unit tests; not part of the public API. */
  private static async createInternal(
    canvas: HTMLCanvasElement,
    options: JawSceneOptions,
    factories: InternalFactories,
  ): Promise<JawSceneController> {
    let root: THREE.Group | undefined;
    let renderer: RendererSurface | undefined;
    let controller: JawSceneController | undefined;
    try {
      root = await factories.loadModel(options.modelUrl);
      const nodes = validateJawModel(root);
      renderer = factories.createRenderer({
        canvas,
        alpha: true,
        antialias: options.profile === "desktop",
        powerPreference: "high-performance",
      });
      controller = new JawSceneController(
        canvas,
        options,
        nodes,
        renderer,
        factories,
      );
      controller.initialize();
      return controller;
    } catch (cause) {
      const error = asError(cause);
      if (controller) controller.dispose();
      else {
        renderer?.dispose();
        if (root) disposeObjectResources(root);
      }
      options.onFatalError(error);
      throw error;
    }
  }

  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100);
  private readonly raycaster = new THREE.Raycaster();
  private readonly basePositions = new Map<THREE.Object3D, THREE.Vector3>();
  private readonly hitIdByObject = new WeakMap<THREE.Object3D, JawHitId>();
  private readonly geometries = new Set<THREE.BufferGeometry>();
  private readonly materials = new Set<THREE.Material>();
  private readonly textures = new Set<THREE.Texture>();
  private ivory!: THREE.MeshPhysicalMaterial;
  private ivoryEmphasis!: THREE.MeshPhysicalMaterial;
  private pink!: THREE.MeshPhysicalMaterial;
  private pinkEmphasis!: THREE.MeshPhysicalMaterial;
  private readonly framingEnvelope = new THREE.Vector3();
  private resizeObserver: ResizeObserverSurface | null = null;
  private activeZone: JawZoneId | null = null;
  private panelOpen = false;
  private interactive = false;
  private hidden = false;
  private contextLost = false;
  private disposed = false;
  private firstFrameSent = false;
  private fatalSent = false;

  private readonly handleVisibilityChange = (): void => {
    if (this.disposed) return;
    this.hidden = this.factories.document.visibilityState === "hidden";
    if (!this.hidden) this.requestRender();
  };

  private readonly handleContextLost = (event: Event): void => {
    event.preventDefault();
    if (this.disposed || this.contextLost) return;
    this.contextLost = true;
    this.options.onContextLost();
  };

  private readonly handleContextRestored = (): void => {
    if (this.disposed || !this.contextLost) return;
    this.contextLost = false;
    this.options.onContextRestored();
  };

  private constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly options: JawSceneOptions,
    private readonly nodes: JawModelNodes,
    private readonly renderer: RendererSurface,
    private readonly factories: InternalFactories,
  ) {}

  private initialize(): void {
    this.captureModelResources();
    this.hidden = this.factories.document.visibilityState === "hidden";
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.framingEnvelope.copy(this.computeFramingEnvelope());

    this.ivory = this.createPhysicalMaterial({
      name: "jaw.ivory",
      color: 0xf5ead5,
      emissive: 0x6a4d31,
      emissiveIntensity: 0.015,
      roughness: 0.34,
      metalness: 0,
      clearcoat: 0.3,
      clearcoatRoughness: 0.28,
    });
    this.ivoryEmphasis = this.createPhysicalMaterial({
      name: "jaw.ivory.active",
      color: 0xfff5dd,
      emissive: 0xd59b56,
      emissiveIntensity: 0.18,
      roughness: 0.29,
      metalness: 0,
      clearcoat: 0.42,
      clearcoatRoughness: 0.22,
    });
    this.pink = this.createPhysicalMaterial({
      name: "jaw.gum",
      color: 0xb76c6b,
      emissive: 0x5a2729,
      emissiveIntensity: 0.018,
      roughness: 0.52,
      metalness: 0,
      clearcoat: 0.18,
      clearcoatRoughness: 0.42,
    });
    this.pinkEmphasis = this.createPhysicalMaterial({
      name: "jaw.gum.active",
      color: 0xd78682,
      emissive: 0xb94e4b,
      emissiveIntensity: 0.16,
      roughness: 0.44,
      metalness: 0,
      clearcoat: 0.25,
      clearcoatRoughness: 0.34,
    });

    this.applyMaterials();
    this.configureLights();
    this.scene.add(this.nodes.root);
    this.addContactShadow();
    this.captureBasePositions();
    this.indexHitProxies();
    this.applyPose(computeJawPose({ jawOpen: 0, jawSeparation: 0 }, this.bounds));

    this.factories.document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange,
    );
    this.canvas.addEventListener("webglcontextlost", this.handleContextLost);
    this.canvas.addEventListener(
      "webglcontextrestored",
      this.handleContextRestored,
    );
    this.resizeObserver = this.factories.createResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || this.disposed) return;
      this.resize(
        entry.contentRect.width,
        entry.contentRect.height,
        this.factories.devicePixelRatio(),
      );
    });
    this.resizeObserver.observe(this.canvas);

    const rect = this.canvas.getBoundingClientRect();
    this.resize(
      rect.width || this.canvas.clientWidth || 1,
      rect.height || this.canvas.clientHeight || 1,
      this.factories.devicePixelRatio(),
    );
  }

  private get bounds(): { width: number; height: number; depth: number } {
    const size = this.nodes.bounds.getSize(new THREE.Vector3());
    return { width: size.x, height: size.y, depth: size.z };
  }

  private createPhysicalMaterial(
    parameters: THREE.MeshPhysicalMaterialParameters & { name: string },
  ): THREE.MeshPhysicalMaterial {
    const material = new THREE.MeshPhysicalMaterial(parameters);
    material.name = parameters.name;
    this.materials.add(material);
    return material;
  }

  private captureModelResources(): void {
    this.nodes.root.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      this.geometries.add(node.geometry);
      for (const material of materialsOf(node)) {
        this.materials.add(material);
        for (const value of Object.values(material)) {
          if (value instanceof THREE.Texture) this.textures.add(value);
        }
      }
    });
  }

  private applyMaterials(): void {
    this.nodes.root.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      if (node.name.startsWith("tooth.")) {
        node.material = this.ivory;
        node.castShadow = true;
        node.receiveShadow = true;
      } else if (node.name.startsWith("gum.")) {
        node.material = this.pink;
        node.castShadow = true;
        node.receiveShadow = true;
      } else if (node.name.startsWith("hit.")) {
        const proxyMaterial = new THREE.MeshBasicMaterial({
          colorWrite: false,
          depthWrite: false,
          transparent: true,
          opacity: 0,
        });
        proxyMaterial.name = `jaw.${node.name}`;
        this.materials.add(proxyMaterial);
        node.material = proxyMaterial;
        node.castShadow = false;
        node.receiveShadow = false;
      }
    });
  }

  private computeFramingEnvelope(): THREE.Vector3 {
    const interactiveBounds = this.nodes.bounds.clone();
    for (const proxy of this.nodes.hitProxies.values()) {
      interactiveBounds.expandByObject(proxy, true);
    }
    const base = interactiveBounds.getSize(new THREE.Vector3());
    const finalPose = computeJawPose(
      { jawOpen: 1, jawSeparation: 1 },
      this.bounds,
    );
    const arrivalPose = computeJawPose(
      { jawOpen: 0, jawSeparation: 0 },
      this.bounds,
    );
    const scale = Math.max(finalPose.rootScale, arrivalPose.rootScale);
    const width = (base.x + 2 * finalPose.molarOffset) * scale;
    const height = (base.y + 2 * Math.abs(finalPose.upperY)) * scale;
    const depth = (base.z + 2 * finalPose.gumDepth) * scale;
    const yaw = Math.max(
      Math.abs(finalPose.rootYaw),
      Math.abs(arrivalPose.rootYaw),
    );
    const pitch = Math.max(
      Math.abs(finalPose.rootPitch),
      Math.abs(arrivalPose.rootPitch),
    );
    const yawWidth = width * Math.cos(yaw) + depth * Math.sin(yaw);
    const yawDepth = width * Math.sin(yaw) + depth * Math.cos(yaw);
    const pitchHeight = height * Math.cos(pitch) + yawDepth * Math.sin(pitch);
    const pitchDepth = height * Math.sin(pitch) + yawDepth * Math.cos(pitch);
    return new THREE.Vector3(yawWidth, pitchHeight, pitchDepth).multiplyScalar(
      1.12,
    );
  }

  private currentRenderedCenter(): THREE.Vector3 {
    this.nodes.root.updateWorldMatrix(true, true);
    const bounds = new THREE.Box3();
    for (const mesh of [
      ...this.nodes.teeth.values(),
      this.nodes.gums.upper,
      this.nodes.gums.lower,
    ]) {
      bounds.expandByObject(mesh, true);
    }
    return bounds.getCenter(new THREE.Vector3());
  }

  private frameCamera(): void {
    const verticalHalfFov = THREE.MathUtils.degToRad(this.camera.fov / 2);
    const horizontalHalfFov = Math.atan(
      Math.tan(verticalHalfFov) * Math.max(this.camera.aspect, 0.01),
    );
    const distance =
      Math.max(
        this.framingEnvelope.x / 2 / Math.tan(horizontalHalfFov),
        this.framingEnvelope.y / 2 / Math.tan(verticalHalfFov),
      ) +
      this.framingEnvelope.z / 2;
    const center = this.currentRenderedCenter();
    const panelWidth = Math.min(470, this.canvas.getBoundingClientRect().width * 0.92);
    const panelFraction =
      this.panelOpen && this.options.profile === "desktop"
        ? panelWidth / Math.max(1, this.canvas.getBoundingClientRect().width)
        : 0;
    const focusX =
      center.x + distance * Math.tan(horizontalHalfFov) * panelFraction;
    this.camera.near = Math.max(
      0.01,
      (distance - this.framingEnvelope.z / 2) * 0.25,
    );
    this.camera.far = distance + this.framingEnvelope.z * 2;
    this.camera.position.set(focusX, center.y, center.z + distance);
    this.camera.lookAt(focusX, center.y, center.z);
    this.camera.updateProjectionMatrix();
  }

  private configureLights(): void {
    const size = this.nodes.bounds.getSize(new THREE.Vector3());
    const center = this.nodes.bounds.getCenter(new THREE.Vector3());
    const distance = Math.max(size.x, size.y, size.z) * 2;

    const key = new THREE.DirectionalLight(0xffd4b2, 3.1);
    key.name = "jaw.light.key";
    key.position.set(
      center.x + size.x * 0.65,
      center.y + size.y * 0.9,
      center.z + distance * 0.35,
    );
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.radius = 4;
    key.shadow.bias = -0.0004;

    const rim = new THREE.DirectionalLight(0xb8d8ff, 1.65);
    rim.name = "jaw.light.rim";
    rim.position.set(
      center.x - size.x * 0.75,
      center.y + size.y * 0.35,
      center.z - Math.max(size.z, 1) * 2,
    );

    const fill = new THREE.DirectionalLight(0xf2eee8, 1.15);
    fill.name = "jaw.light.fill";
    fill.position.set(
      center.x - size.x * 0.15,
      center.y - size.y * 0.65,
      center.z + distance * 0.25,
    );

    const ambient = new THREE.HemisphereLight(0xe7edf5, 0x4b3028, 0.65);
    ambient.name = "jaw.light.ambient";
    this.scene.add(key, rim, fill, ambient);
  }

  private addContactShadow(): void {
    const size = this.nodes.bounds.getSize(new THREE.Vector3());
    const center = this.nodes.bounds.getCenter(new THREE.Vector3());
    const geometry = new THREE.PlaneGeometry(size.x * 1.35, size.z * 2.1);
    const material = new THREE.ShadowMaterial({
      color: 0x231713,
      opacity: 0.2,
      transparent: true,
      depthWrite: false,
    });
    geometry.name = "jaw.contact-shadow.geometry";
    material.name = "jaw.contact-shadow.material";
    this.geometries.add(geometry);
    this.materials.add(material);

    const shadow = new THREE.Mesh(geometry, material);
    shadow.name = "jaw.contact-shadow";
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(
      center.x,
      this.nodes.bounds.min.y - size.y * 0.07,
      center.z,
    );
    shadow.receiveShadow = true;
    this.scene.add(shadow);
  }

  private captureBasePositions(): void {
    for (const node of [
      ...this.nodes.teeth.values(),
      this.nodes.gums.upper,
      this.nodes.gums.lower,
      ...this.nodes.anchors.values(),
      ...this.nodes.hitProxies.values(),
    ]) {
      this.basePositions.set(node, node.position.clone());
    }
  }

  private indexHitProxies(): void {
    for (const [id, proxy] of this.nodes.hitProxies) {
      proxy.traverse((node) => this.hitIdByObject.set(node, id));
    }
  }

  private resetPosition(node: THREE.Object3D): THREE.Vector3 {
    const base = this.basePositions.get(node);
    if (!base) throw new Error(`Jaw model transform was not captured: ${node.name}`);
    node.position.copy(base);
    return node.position;
  }

  private applyPose(pose: JawPose): void {
    this.nodes.root.scale.setScalar(pose.rootScale);
    this.nodes.root.rotation.set(pose.rootPitch, pose.rootYaw, 0);

    for (const [name, tooth] of this.nodes.teeth) {
      const fdi = fdiFromName(name);
      const quadrant = Math.floor(fdi / 10);
      const kind = fdi % 10;
      const position = this.resetPosition(tooth);
      position.y += quadrant < 3 ? pose.upperY : pose.lowerY;
      const side = quadrant === 1 || quadrant === 4 ? -1 : 1;
      if (kind === 4 || kind === 5) position.x += side * pose.premolarOffset;
      else if (kind >= 6) position.x += side * pose.molarOffset;
    }

    const upperGum = this.resetPosition(this.nodes.gums.upper);
    upperGum.y += pose.upperY;
    upperGum.z += pose.gumDepth;
    const lowerGum = this.resetPosition(this.nodes.gums.lower);
    lowerGum.y += pose.lowerY;
    lowerGum.z -= pose.gumDepth;

    for (const collection of [this.nodes.anchors, this.nodes.hitProxies]) {
      for (const [id, node] of collection) {
        const position = this.resetPosition(node);
        if (id === "premolar.right") position.x -= pose.premolarOffset;
        else if (id === "premolar.left") position.x += pose.premolarOffset;
        else if (id === "molar.right") position.x -= pose.molarOffset;
        else if (id === "molar.left") position.x += pose.molarOffset;
        else if (id === "gum.upper") {
          position.y += pose.upperY;
          position.z += pose.gumDepth;
        } else if (id === "gum.lower") {
          position.y += pose.lowerY;
          position.z -= pose.gumDepth;
        }
      }
    }
  }

  private requestRender(): void {
    if (this.disposed || this.hidden || this.contextLost) return;
    this.options.requestRender();
  }

  private reportFatal(cause: unknown): void {
    if (this.fatalSent || this.disposed) return;
    this.fatalSent = true;
    this.options.onFatalError(asError(cause));
  }

  setMotion(state: ClinicStoryMotionState): void {
    if (this.disposed) return;
    this.interactive = state.interactive;
    this.applyPose(
      computeJawPose(
        { jawOpen: state.jawOpen, jawSeparation: state.jawSeparation },
        this.bounds,
      ),
    );
    this.frameCamera();
    this.requestRender();
  }

  setActiveZone(zone: JawZoneId | null): void {
    if (this.disposed || zone === this.activeZone) return;
    this.activeZone = zone;
    for (const [name, tooth] of this.nodes.teeth) {
      tooth.material = zone === zoneForTooth(name) ? this.ivoryEmphasis : this.ivory;
    }
    const gumMaterial = zone === "gum" ? this.pinkEmphasis : this.pink;
    this.nodes.gums.upper.material = gumMaterial;
    this.nodes.gums.lower.material = gumMaterial;
    this.requestRender();
  }

  setPanelOpen(open: boolean): void {
    if (this.disposed || this.panelOpen === open) return;
    this.panelOpen = open;
    this.frameCamera();
    this.requestRender();
  }

  projectAnchor(hit: JawHitId): JawProjectedPoint {
    const anchor = this.nodes.anchors.get(hit);
    if (!anchor || this.disposed) return { x: 0, y: 0, visible: false };
    this.nodes.root.updateWorldMatrix(true, true);
    this.camera.updateMatrixWorld();
    const ndc = anchor.getWorldPosition(new THREE.Vector3()).project(this.camera);
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((ndc.x + 1) / 2) * rect.width,
      y: ((1 - ndc.y) / 2) * rect.height,
      visible:
        Math.abs(ndc.x) <= 1 &&
        Math.abs(ndc.y) <= 1 &&
        ndc.z >= -1 &&
        ndc.z <= 1,
    };
  }

  hitTest(clientX: number, clientY: number): JawHitId | null {
    if (
      this.disposed ||
      !this.interactive ||
      this.hidden ||
      this.contextLost
    ) {
      return null;
    }
    const rect = this.canvas.getBoundingClientRect();
    if (
      rect.width <= 0 ||
      rect.height <= 0 ||
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return null;
    }
    const pointer = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.nodes.root.updateWorldMatrix(true, true);
    this.camera.updateMatrixWorld();
    this.raycaster.setFromCamera(pointer, this.camera);
    const intersections = this.raycaster.intersectObjects(
      [...this.nodes.hitProxies.values()],
      true,
    );
    for (const intersection of intersections) {
      let node: THREE.Object3D | null = intersection.object;
      while (node) {
        const id = this.hitIdByObject.get(node);
        if (id) return id;
        node = node.parent;
      }
    }
    return null;
  }

  resize(width: number, height: number, devicePixelRatio: number): void {
    if (this.disposed) return;
    const safeWidth = Math.max(1, width);
    const safeHeight = Math.max(1, height);
    const dpr = Number.isFinite(devicePixelRatio)
      ? Math.max(1, devicePixelRatio)
      : 1;
    const cap = this.options.profile === "mobile" ? 1.25 : 1.5;
    this.renderer.setPixelRatio(Math.min(cap, dpr));
    this.renderer.setSize(safeWidth, safeHeight, false);
    this.camera.aspect = safeWidth / safeHeight;
    this.frameCamera();
    this.requestRender();
  }

  render(): void {
    if (this.disposed || this.hidden || this.contextLost) return;
    try {
      this.scene.updateMatrixWorld(true);
      this.camera.updateMatrixWorld();
      this.renderer.render(this.scene, this.camera);
    } catch (error) {
      this.reportFatal(error);
      return;
    }
    if (!this.firstFrameSent) {
      this.firstFrameSent = true;
      this.options.onFirstFrame();
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.resizeObserver?.disconnect();
    this.factories.document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange,
    );
    this.canvas.removeEventListener("webglcontextlost", this.handleContextLost);
    this.canvas.removeEventListener(
      "webglcontextrestored",
      this.handleContextRestored,
    );
    for (const texture of this.textures) texture.dispose();
    for (const geometry of this.geometries) geometry.dispose();
    for (const material of this.materials) material.dispose();
    this.renderer.dispose();
  }
}
