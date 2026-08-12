import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { ClinicStoryMotionState } from "../clinicStoryMotion";
import {
  JawExperience,
  type JawExperienceHandle,
} from "./JawExperience";
import {
  JawZoneOverlay,
  cardEdgeTowardTarget,
  zoneIdForHit,
  type JawZoneOverlayProps,
} from "./JawZoneOverlay";

const runtime = vi.hoisted(() => ({
  moduleEvaluations: 0,
  create: vi.fn(),
}));

vi.mock("./JawSceneController", () => {
  runtime.moduleEvaluations += 1;
  return {
    JawSceneController: {
      create: runtime.create,
    },
  };
});

type SceneOptions = {
  profile: "desktop" | "mobile";
  modelUrl: string;
  onFirstFrame(): void;
  onFatalError(error: Error): void;
  requestRender(): void;
};

type FakeController = ReturnType<typeof createController>;

function createController() {
  return {
    setMotion: vi.fn(),
    setActiveZone: vi.fn(),
    setPanelOpen: vi.fn(),
    projectAnchor: vi.fn((id: string) => {
      const points: Record<string, { x: number; y: number; visible: boolean }> = {
        front: { x: 400, y: 260, visible: true },
        "premolar.left": { x: 300, y: 310, visible: true },
        "premolar.right": { x: 500, y: 310, visible: true },
        "molar.left": { x: 230, y: 350, visible: true },
        "molar.right": { x: 570, y: 350, visible: true },
        "gum.upper": { x: 400, y: 210, visible: true },
        "gum.lower": { x: 400, y: 410, visible: true },
      };
      return points[id] ?? { x: 0, y: 0, visible: false };
    }),
    hitTest: vi.fn<(...args: [number, number]) => string | null>(() => null),
    resize: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
  };
}

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];

  readonly observe = vi.fn();
  readonly disconnect = vi.fn();

  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    FakeIntersectionObserver.instances.push(this);
  }

  emit(isIntersecting: boolean): void {
    this.callback(
      [
        {
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
          target: this.observe.mock.calls[0]?.[0] ?? document.body,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }
}

class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];

  readonly observe = vi.fn();
  readonly disconnect = vi.fn();

  constructor(readonly callback: ResizeObserverCallback) {
    FakeResizeObserver.instances.push(this);
  }

  emit(width: number, height: number): void {
    this.callback(
      [
        {
          contentRect: { width, height },
          target: this.observe.mock.calls[0]?.[0] ?? document.body,
        } as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver,
    );
  }
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function motion(
  overrides: Partial<ClinicStoryMotionState> = {},
): ClinicStoryMotionState {
  return {
    grow: 1,
    pan: 1,
    snap: 1,
    zoom: 1,
    blur: 1,
    jawOpacity: 1,
    jawOpen: 1,
    jawSeparation: 1,
    labelsOpacity: 1,
    interactive: false,
    globalTime: 8,
    finalOpacity: 1,
    ...overrides,
  };
}

function zoneButtons(): HTMLButtonElement[] {
  return screen.getAllByRole("button", {
    name: /^(Predné zuby|Črenové zuby|Stoličky|Ďasná)$/,
  });
}

async function intersectHost(): Promise<void> {
  const observer = FakeIntersectionObserver.instances.at(-1);
  if (!observer) throw new Error("Jaw host was not observed.");
  await act(async () => observer.emit(true));
}

beforeEach(() => {
  FakeIntersectionObserver.instances = [];
  FakeResizeObserver.instances = [];
  runtime.create.mockReset();
  vi.stubGlobal(
    "IntersectionObserver",
    FakeIntersectionObserver as unknown as typeof IntersectionObserver,
  );
  vi.stubGlobal(
    "ResizeObserver",
    FakeResizeObserver as unknown as typeof ResizeObserver,
  );
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    value: "visible",
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("reduced motion keeps the static final pose interactive without loading the runtime", async () => {
  const evaluationCount = runtime.moduleEvaluations;
  render(<JawExperience profile="desktop" prefersReducedMotion />);

  expect(screen.getByRole("img", { name: /statický model chrupu/i })).toHaveAttribute(
    "src",
    "/media/jaw/jaw-fallback.webp",
  );
  expect(zoneButtons()).toHaveLength(4);
  for (const button of zoneButtons()) {
    expect(button).toHaveAttribute("aria-disabled", "false");
  }
  expect(FakeIntersectionObserver.instances).toHaveLength(0);
  expect(runtime.moduleEvaluations).toBe(evaluationCount);
  expect(runtime.create).not.toHaveBeenCalled();

  await userEvent.click(screen.getByRole("button", { name: "Predné zuby" }));
  expect(
    await screen.findByRole("dialog", { name: "Predné zuby" }),
  ).toBeVisible();
});

test("keeps the poster visible until the first valid decorative-canvas frame", async () => {
  const pendingController = deferred<FakeController>();
  const controller = createController();
  let options: SceneOptions | undefined;
  runtime.create.mockImplementation(
    (_canvas: HTMLCanvasElement, nextOptions: SceneOptions) => {
      options = nextOptions;
      return pendingController.promise;
    },
  );

  const ref = createRef<JawExperienceHandle>();
  render(
    <JawExperience
      ref={ref}
      profile="desktop"
      prefersReducedMotion={false}
    />,
  );
  act(() => ref.current?.setMotion(motion({ jawOpacity: 0.7 })));

  expect(screen.getByRole("heading", { name: "Kde vás to trápi?" })).toBeVisible();
  expect(screen.getByRole("img", { name: /model chrupu sa načítava/i })).toBeVisible();
  expect(screen.getByTestId("jaw-canvas")).toHaveAttribute("aria-hidden", "true");
  expect(screen.getByTestId("jaw-canvas")).toHaveAttribute("data-frame-ready", "false");
  expect(zoneButtons()).toHaveLength(4);
  for (const button of zoneButtons()) {
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveAttribute("tabindex", "-1");
  }

  expect(runtime.create).not.toHaveBeenCalled();
  expect(FakeIntersectionObserver.instances[0]?.options?.rootMargin).toBe(
    "150% 0px",
  );
  await intersectHost();
  expect(runtime.create).toHaveBeenCalledTimes(1);
  expect(options?.modelUrl).toBe("/media/jaw/jaw-desktop.glb");
  expect(screen.getByRole("img", { name: /model chrupu sa načítava/i })).toBeVisible();

  await act(async () => pendingController.resolve(controller));
  expect(options).toBeDefined();
  act(() => options?.onFirstFrame());

  expect(screen.getByTestId("jaw-canvas")).toHaveAttribute("data-frame-ready", "true");
  expect(screen.getByRole("img", { name: /model chrupu sa načítava/i })).toBeInTheDocument();
});

test("WebGL failure switches to a usable fallback without removing the four controls", async () => {
  runtime.create.mockImplementation(
    (_canvas: HTMLCanvasElement, options: SceneOptions) => {
      const error = new Error("WebGL unavailable");
      options.onFatalError(error);
      return Promise.reject(error);
    },
  );

  const ref = createRef<JawExperienceHandle>();
  render(
    <JawExperience
      ref={ref}
      profile="mobile"
      prefersReducedMotion={false}
    />,
  );
  await intersectHost();

  const fallback = await screen.findByRole("img", {
    name: /statický model chrupu/i,
  });
  expect(fallback).toHaveAttribute("src", "/media/jaw/jaw-fallback.webp");
  const host = fallback.closest<HTMLElement>("[data-load-state]");
  expect(host).toHaveStyle({ "--jaw-opacity": "1", "--labels-opacity": "1" });
  expect(zoneButtons()).toHaveLength(4);
  for (const button of zoneButtons()) {
    expect(button).toHaveAttribute("aria-disabled", "false");
  }

  act(() => ref.current?.setMotion(motion({ jawOpacity: 0, labelsOpacity: 0 })));
  expect(host).toHaveStyle({ "--jaw-opacity": "1", "--labels-opacity": "1" });

  await userEvent.click(screen.getByRole("button", { name: "Ďasná" }));
  expect(await screen.findByRole("dialog", { name: "Ďasná" })).toBeVisible();
});

test("a fatal error after startup disposes the failed controller and retains fallback controls", async () => {
  const controller = createController();
  let options: SceneOptions | undefined;
  runtime.create.mockImplementation(
    async (_canvas: HTMLCanvasElement, nextOptions: SceneOptions) => {
      options = nextOptions;
      return controller;
    },
  );

  render(<JawExperience profile="desktop" prefersReducedMotion={false} />);
  await intersectHost();
  expect(options).toBeDefined();
  act(() => options?.onFatalError(new Error("render failed")));

  expect(
    await screen.findByRole("img", { name: /statický model chrupu/i }),
  ).toBeVisible();
  expect(controller.dispose).toHaveBeenCalledTimes(1);
  for (const button of zoneButtons()) {
    expect(button).toHaveAttribute("aria-disabled", "false");
  }
});

test("projects seven leaders while exposing only four semantic zone buttons", () => {
  const projected: JawZoneOverlayProps["projectedAnchors"] = {
    front: { x: 400, y: 250, visible: true },
    "premolar.left": { x: 300, y: 300, visible: true },
    "premolar.right": { x: 500, y: 300, visible: true },
    "molar.left": { x: 220, y: 340, visible: true },
    "molar.right": { x: 580, y: 340, visible: true },
    "gum.upper": { x: 400, y: 190, visible: true },
    "gum.lower": { x: 400, y: 410, visible: true },
  };

  render(
    <div style={{ position: "relative", width: 800, height: 600 }}>
      <JawZoneOverlay
        projectedAnchors={projected}
        profile="desktop"
        interactive
        onZoneSelect={vi.fn()}
        onZoneHighlight={vi.fn()}
      />
    </div>,
  );

  expect(zoneButtons()).toHaveLength(4);
  expect(screen.getAllByTestId(/^jaw-leader-/)).toHaveLength(7);
  expect(
    screen.getByRole("group", { name: "Vyberte oblasť, ktorá vás trápi" }),
  ).toBeVisible();
});

test("uses the exact nearest-card-edge intersection for leader starts", () => {
  const rect = {
    left: 100,
    top: 50,
    width: 200,
    height: 100,
  } as DOMRect;

  expect(cardEdgeTowardTarget(rect, { x: 400, y: 200 })).toEqual({
    x: 300,
    y: 150,
  });
  expect(cardEdgeTowardTarget(rect, { x: 200, y: 100 })).toEqual({
    x: 200,
    y: 100,
  });
});

test.each(["premolar.left", "premolar.right"])(
  "maps the %s canvas hit to shared premolar content",
  async (hitId) => {
    const controller = createController();
    controller.hitTest.mockReturnValue(hitId);
    runtime.create.mockImplementation(
      async (_canvas: HTMLCanvasElement, options: SceneOptions) => {
        controller.render.mockImplementation(options.onFirstFrame);
        return controller;
      },
    );
    const ref = createRef<JawExperienceHandle>();
    render(
      <JawExperience
        ref={ref}
        profile="desktop"
        prefersReducedMotion={false}
      />,
    );
    act(() => ref.current?.setMotion(motion({ interactive: true })));
    await intersectHost();

    fireEvent.pointerDown(screen.getByTestId("jaw-canvas"), {
      clientX: 320,
      clientY: 240,
    });

    expect(
      await screen.findByRole("dialog", { name: "Črenové zuby" }),
    ).toBeVisible();
  },
);

test.each([
  ["front", "front"],
  ["premolar.left", "premolar"],
  ["premolar.right", "premolar"],
  ["molar.left", "molar"],
  ["molar.right", "molar"],
  ["gum.upper", "gum"],
  ["gum.lower", "gum"],
] as const)("maps the %s proxy to the %s semantic zone", (hitId, zoneId) => {
  expect(zoneIdForHit(hitId)).toBe(zoneId);
});

test("reversing below the interactive boundary closes the panel and restores zone focus", async () => {
  const controller = createController();
  runtime.create.mockResolvedValue(controller);
  const ref = createRef<JawExperienceHandle>();
  render(
    <JawExperience
      ref={ref}
      profile="desktop"
      prefersReducedMotion={false}
    />,
  );
  act(() => ref.current?.setMotion(motion({ interactive: true })));
  await intersectHost();

  const trigger = screen.getByRole("button", { name: "Stoličky" });
  await userEvent.click(trigger);
  expect(await screen.findByRole("dialog", { name: "Stoličky" })).toBeVisible();

  act(() => ref.current?.setMotion(motion({ interactive: false })));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  await waitFor(() => expect(trigger).toHaveFocus());
  expect(trigger).toHaveAttribute("aria-disabled", "true");
  expect(trigger).toHaveAttribute("tabindex", "-1");
});

test("cancels stale controller creation across profile changes and cleanup", async () => {
  const desktopPending = deferred<FakeController>();
  const mobilePending = deferred<FakeController>();
  const desktopController = createController();
  const mobileController = createController();
  runtime.create
    .mockImplementationOnce(() => desktopPending.promise)
    .mockImplementationOnce(() => mobilePending.promise);

  const { rerender, unmount } = render(
    <JawExperience profile="desktop" prefersReducedMotion={false} />,
  );
  await intersectHost();
  rerender(<JawExperience profile="mobile" prefersReducedMotion={false} />);
  await intersectHost();

  await act(async () => desktopPending.resolve(desktopController));
  expect(desktopController.dispose).toHaveBeenCalledTimes(1);

  await act(async () => mobilePending.resolve(mobileController));
  unmount();
  expect(mobileController.dispose).toHaveBeenCalledTimes(1);
  expect(
    FakeIntersectionObserver.instances.every(
      (observer) => observer.disconnect.mock.calls.length === 1,
    ),
  ).toBe(true);
  expect(
    FakeResizeObserver.instances.every(
      (observer) => observer.disconnect.mock.calls.length === 1,
    ),
  ).toBe(true);
});

test("renders and reprojects only while intersecting and visible, including resize", async () => {
  const controller = createController();
  let options: SceneOptions | undefined;
  runtime.create.mockImplementation(
    async (_canvas: HTMLCanvasElement, nextOptions: SceneOptions) => {
      options = nextOptions;
      return controller;
    },
  );
  render(<JawExperience profile="desktop" prefersReducedMotion={false} />);
  await intersectHost();

  controller.render.mockClear();
  controller.projectAnchor.mockClear();
  act(() => options?.requestRender());
  expect(controller.render).toHaveBeenCalledTimes(1);
  expect(controller.projectAnchor).toHaveBeenCalledTimes(7);

  act(() => FakeIntersectionObserver.instances.at(-1)?.emit(false));
  controller.render.mockClear();
  act(() => options?.requestRender());
  expect(controller.render).not.toHaveBeenCalled();

  act(() => FakeIntersectionObserver.instances.at(-1)?.emit(true));
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    value: "hidden",
  });
  fireEvent(document, new Event("visibilitychange"));
  controller.render.mockClear();
  act(() => options?.requestRender());
  expect(controller.render).not.toHaveBeenCalled();

  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    value: "visible",
  });
  fireEvent(document, new Event("visibilitychange"));
  const resizeObserver = FakeResizeObserver.instances.at(-1);
  act(() => resizeObserver?.emit(640, 480));
  expect(controller.resize).toHaveBeenLastCalledWith(640, 480, 1);
  expect(controller.render).toHaveBeenCalled();
  expect(controller.projectAnchor).toHaveBeenCalled();
});

test("shows linked model and CC BY credit in the interactive layer", () => {
  render(<JawExperience profile="desktop" prefersReducedMotion />);

  expect(screen.getByTestId("jaw-model-credit")).toHaveTextContent(
    /Free Teeth Base Mesh\s+— ferrumiron6, upravené,\s+CC BY 4.0/,
  );
  expect(screen.getByRole("link", { name: "Free Teeth Base Mesh" })).toHaveAttribute(
    "href",
    "https://sketchfab.com/3d-models/free-teeth-base-mesh-b66fde0dc3eb44b0908096aa51b96431",
  );
  expect(screen.getByRole("link", { name: "CC BY 4.0" })).toHaveAttribute(
    "href",
    "https://creativecommons.org/licenses/by/4.0/",
  );
});
