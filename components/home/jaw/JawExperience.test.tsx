import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
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
  onContextLost(): void;
  onContextRestored(): void;
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

test("gates both loading layers by jaw motion before and after the first frame", async () => {
  const controller = createController();
  let options: SceneOptions | undefined;
  runtime.create.mockImplementation(
    async (_canvas: HTMLCanvasElement, nextOptions: SceneOptions) => {
      options = nextOptions;
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

  const poster = screen.getByRole("img", { name: /model chrupu sa načítava/i });
  const canvas = screen.getByTestId("jaw-canvas");
  expect(poster).toHaveStyle({ opacity: "0" });
  expect(canvas).toHaveStyle({ opacity: "0" });
  for (const opacity of [0, 0.4, 1]) {
    act(() => ref.current?.setMotion(motion({ jawOpacity: opacity })));
    expect(poster).toHaveStyle({ opacity: String(opacity) });
    expect(canvas).toHaveStyle({ opacity: "0" });
  }

  await intersectHost();
  expect(options).toBeDefined();
  act(() => options?.onFirstFrame());

  for (const opacity of [0, 0.4, 1]) {
    act(() => ref.current?.setMotion(motion({ jawOpacity: opacity })));
    expect(poster).toHaveStyle({ opacity: "0" });
    expect(canvas).toHaveStyle({ opacity: String(opacity) });
  }
});

test.each([0.4, 1])(
  "keeps the ready poster absent at jaw opacity %s through interaction and panel rerenders",
  async (jawOpacity) => {
    const controller = createController();
    let options: SceneOptions | undefined;
    runtime.create.mockImplementation(
      async (_canvas: HTMLCanvasElement, nextOptions: SceneOptions) => {
        options = nextOptions;
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
    act(() => ref.current?.setMotion(motion({ jawOpacity })));
    await intersectHost();

    const poster = screen.getByRole("img", { name: /model chrupu sa načítava/i });
    const canvas = screen.getByTestId("jaw-canvas");
    act(() => options?.onFirstFrame());
    expect(poster).toHaveStyle({ opacity: "0" });
    expect(canvas).toHaveStyle({ opacity: String(jawOpacity) });

    act(() =>
      ref.current?.setMotion(motion({ jawOpacity, interactive: true })),
    );
    expect(poster).toHaveStyle({ opacity: "0" });
    expect(canvas).toHaveStyle({ opacity: String(jawOpacity) });

    await userEvent.click(screen.getByRole("button", { name: "Predné zuby" }));
    expect(await screen.findByRole("dialog", { name: "Predné zuby" })).toBeVisible();
    expect(poster).toHaveStyle({ opacity: "0" });
    expect(canvas).toHaveStyle({ opacity: String(jawOpacity) });
  },
);

test("server markup starts both animated jaw layers hidden", () => {
  const html = renderToString(
    <JawExperience profile="desktop" prefersReducedMotion={false} />,
  );

  expect(html).toMatch(/<img[^>]+style="opacity:0"/);
  expect(html).toMatch(/<canvas[^>]+style="opacity:0"/);
});

test("gates jaw pointer surfaces across loading, ready, interactive, fallback, and reduced motion", async () => {
  const controller = createController();
  let options: SceneOptions | undefined;
  runtime.create.mockImplementation(
    async (_canvas: HTMLCanvasElement, nextOptions: SceneOptions) => {
      options = nextOptions;
      return controller;
    },
  );
  const ref = createRef<JawExperienceHandle>();
  const { unmount } = render(
    <JawExperience
      ref={ref}
      profile="mobile"
      prefersReducedMotion={false}
    />,
  );
  const canvas = screen.getByTestId("jaw-canvas");
  const credit = screen.getByTestId("jaw-model-credit");
  const stage = canvas.parentElement;
  const experience = stage?.parentElement;
  expect(experience).toHaveStyle({ pointerEvents: "none" });
  expect(stage).toHaveStyle({ pointerEvents: "none" });
  expect(canvas).toHaveStyle({ pointerEvents: "none" });
  expect(credit).toHaveStyle({ opacity: "0", pointerEvents: "none" });
  for (const button of zoneButtons()) {
    expect(button).toHaveStyle({ pointerEvents: "none" });
  }

  await intersectHost();
  act(() => options?.onFirstFrame());
  expect(experience).toHaveStyle({ pointerEvents: "none" });
  expect(stage).toHaveStyle({ pointerEvents: "none" });
  expect(canvas).toHaveStyle({ pointerEvents: "none" });
  expect(credit).toHaveStyle({ opacity: "0", pointerEvents: "none" });
  for (const button of zoneButtons()) {
    expect(button).toHaveStyle({ pointerEvents: "none" });
  }

  act(() =>
    ref.current?.setMotion(
      motion({ jawOpacity: 0.5, labelsOpacity: 0.4, interactive: false }),
    ),
  );
  expect(credit).toHaveStyle({ opacity: "0.2", pointerEvents: "none" });

  act(() => ref.current?.setMotion(motion({ interactive: true })));
  expect(experience).toHaveStyle({ pointerEvents: "none" });
  expect(stage).toHaveStyle({ pointerEvents: "auto" });
  expect(canvas).toHaveStyle({ pointerEvents: "auto" });
  expect(credit).toHaveStyle({ opacity: "1", pointerEvents: "auto" });
  for (const button of zoneButtons()) {
    expect(button).toHaveStyle({ pointerEvents: "auto" });
  }

  act(() => options?.onFatalError(new Error("render failed")));
  expect(experience).toHaveStyle({ pointerEvents: "none" });
  expect(stage).toHaveStyle({ pointerEvents: "none" });
  expect(canvas).toHaveStyle({ pointerEvents: "none" });
  expect(credit).toHaveStyle({ opacity: "1", pointerEvents: "auto" });
  for (const button of zoneButtons()) {
    expect(button).toHaveStyle({ pointerEvents: "auto" });
  }

  unmount();
  render(<JawExperience profile="mobile" prefersReducedMotion />);
  const reducedCanvas = screen.getByTestId("jaw-canvas");
  expect(reducedCanvas.parentElement).toHaveStyle({
    pointerEvents: "none",
  });
  expect(reducedCanvas).toHaveStyle({ pointerEvents: "none" });
  expect(screen.getByTestId("jaw-model-credit")).toHaveStyle({
    opacity: "1",
    pointerEvents: "auto",
  });
  for (const button of zoneButtons()) {
    expect(button).toHaveStyle({ pointerEvents: "auto" });
  }
});

test("keeps hidden credit links out of tab order across interaction transitions and restores them for usable states", async () => {
  const controller = createController();
  let options: SceneOptions | undefined;
  runtime.create.mockImplementation(
    async (_canvas: HTMLCanvasElement, nextOptions: SceneOptions) => {
      options = nextOptions;
      return controller;
    },
  );
  const ref = createRef<JawExperienceHandle>();
  const { unmount } = render(
    <>
      <button type="button">Before jaw</button>
      <JawExperience
        ref={ref}
        profile="mobile"
        prefersReducedMotion={false}
      />
      <button type="button">After jaw</button>
    </>,
  );
  const beforeJaw = screen.getByRole("button", { name: "Before jaw" });
  const afterJaw = screen.getByRole("button", { name: "After jaw" });
  const sourceLink = screen.getByRole("link", {
    name: "Free Teeth Base Mesh",
  });
  const licenseLink = screen.getByRole("link", { name: "CC BY 4.0" });

  expect(sourceLink).toHaveAttribute("tabindex", "-1");
  expect(licenseLink).toHaveAttribute("tabindex", "-1");
  beforeJaw.focus();
  await userEvent.tab();
  expect(afterJaw).toHaveFocus();

  await intersectHost();
  act(() => options?.onFirstFrame());
  expect(sourceLink).toHaveAttribute("tabindex", "-1");
  expect(licenseLink).toHaveAttribute("tabindex", "-1");
  beforeJaw.focus();
  await userEvent.tab();
  expect(afterJaw).toHaveFocus();

  act(() => ref.current?.setMotion(motion({ interactive: true })));
  expect(sourceLink).toHaveAttribute("tabindex", "0");
  expect(licenseLink).toHaveAttribute("tabindex", "0");
  beforeJaw.focus();
  for (const button of zoneButtons()) {
    await userEvent.tab();
    expect(button).toHaveFocus();
  }
  await userEvent.tab();
  expect(sourceLink).toHaveFocus();
  await userEvent.tab();
  expect(licenseLink).toHaveFocus();

  act(() => ref.current?.setMotion(motion({ interactive: false })));
  expect(sourceLink).toHaveAttribute("tabindex", "-1");
  expect(licenseLink).toHaveAttribute("tabindex", "-1");
  beforeJaw.focus();
  await userEvent.tab();
  expect(afterJaw).toHaveFocus();

  act(() => ref.current?.setMotion(motion({ interactive: true })));
  act(() => options?.onFatalError(new Error("render failed")));
  expect(sourceLink).toHaveAttribute("tabindex", "0");
  expect(licenseLink).toHaveAttribute("tabindex", "0");
  beforeJaw.focus();
  for (let index = 0; index < zoneButtons().length; index += 1) {
    await userEvent.tab();
  }
  await userEvent.tab();
  expect(sourceLink).toHaveFocus();

  unmount();
  render(
    <>
      <button type="button">Before reduced jaw</button>
      <JawExperience profile="mobile" prefersReducedMotion />
      <button type="button">After reduced jaw</button>
    </>,
  );
  const reducedSourceLink = screen.getByRole("link", {
    name: "Free Teeth Base Mesh",
  });
  const reducedLicenseLink = screen.getByRole("link", { name: "CC BY 4.0" });
  expect(reducedSourceLink).toHaveAttribute("tabindex", "0");
  expect(reducedLicenseLink).toHaveAttribute("tabindex", "0");
  screen.getByRole("button", { name: "Before reduced jaw" }).focus();
  for (let index = 0; index < zoneButtons().length; index += 1) {
    await userEvent.tab();
  }
  await userEvent.tab();
  expect(reducedSourceLink).toHaveFocus();
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

  const { unmount } = render(
    <JawExperience profile="desktop" prefersReducedMotion={false} />,
  );
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
  unmount();
  expect(controller.dispose).toHaveBeenCalledTimes(1);
});

test("context loss retains the selected panel and restores one eligible fresh scene", async () => {
  const originalController = createController();
  const restoredController = createController();
  let originalOptions: SceneOptions | undefined;
  runtime.create
    .mockImplementationOnce(
      async (_canvas: HTMLCanvasElement, options: SceneOptions) => {
        originalOptions = options;
        return originalController;
      },
    )
    .mockResolvedValueOnce(restoredController);

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
  await userEvent.click(screen.getByRole("button", { name: "Stoličky" }));
  expect(await screen.findByRole("dialog", { name: "Stoličky" })).toBeVisible();

  act(() => originalOptions?.onContextLost());
  expect(screen.getByTestId("jaw-canvas").previousElementSibling).toHaveAttribute(
    "src",
    "/media/jaw/jaw-fallback.webp",
  );
  expect(screen.getByRole("dialog", { name: "Stoličky" })).toBeVisible();

  act(() => originalOptions?.onContextRestored());
  await waitFor(() => expect(runtime.create).toHaveBeenCalledTimes(2));
  expect(originalController.dispose).toHaveBeenCalledTimes(1);
  expect(restoredController.setMotion).toHaveBeenLastCalledWith(
    motion({ interactive: true }),
  );
  expect(restoredController.setActiveZone).toHaveBeenLastCalledWith("molar");
  expect(restoredController.setPanelOpen).toHaveBeenLastCalledWith(true);

  act(() => originalOptions?.onContextRestored());
  expect(runtime.create).toHaveBeenCalledTimes(2);
});

test("early context fallback stays visibly interactive while restoration keeps the latest live motion", async () => {
  const originalController = createController();
  const restoredController = createController();
  let originalOptions: SceneOptions | undefined;
  let restoredOptions: SceneOptions | undefined;
  runtime.create
    .mockImplementationOnce(
      async (_canvas: HTMLCanvasElement, options: SceneOptions) => {
        originalOptions = options;
        return originalController;
      },
    )
    .mockImplementationOnce(
      async (_canvas: HTMLCanvasElement, options: SceneOptions) => {
        restoredOptions = options;
        return restoredController;
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
  act(() =>
    ref.current?.setMotion(
      motion({ jawOpacity: 0, labelsOpacity: 0, interactive: false }),
    ),
  );
  await intersectHost();
  const host = screen.getByTestId("jaw-canvas").closest<HTMLElement>(
    "[data-load-state]",
  )!;

  act(() => originalOptions?.onContextLost());
  expect(host).toHaveStyle({ "--jaw-opacity": "1", "--labels-opacity": "1" });
  for (const button of zoneButtons()) {
    expect(button).toHaveAttribute("aria-disabled", "false");
  }

  const latestMotion = motion({
    jawOpacity: 0.4,
    jawOpen: 0.5,
    labelsOpacity: 0.3,
    interactive: false,
  });
  act(() => ref.current?.setMotion(latestMotion));
  expect(host).toHaveStyle({ "--jaw-opacity": "1", "--labels-opacity": "1" });

  act(() => originalOptions?.onContextRestored());
  await waitFor(() => expect(runtime.create).toHaveBeenCalledTimes(2));
  expect(restoredController.setMotion).toHaveBeenLastCalledWith(latestMotion);
  act(() => restoredOptions?.onFirstFrame());
  expect(host).toHaveStyle({ "--jaw-opacity": "0.4", "--labels-opacity": "0.3" });
});

test("restores a focused zone highlight after recreating the scene", async () => {
  const originalController = createController();
  const restoredController = createController();
  let originalOptions: SceneOptions | undefined;
  runtime.create
    .mockImplementationOnce(
      async (_canvas: HTMLCanvasElement, options: SceneOptions) => {
        originalOptions = options;
        return originalController;
      },
    )
    .mockResolvedValueOnce(restoredController);
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
  screen.getByRole("button", { name: "Črenové zuby" }).focus();
  expect(originalController.setActiveZone).toHaveBeenLastCalledWith("premolar");

  act(() => originalOptions?.onContextLost());
  act(() => originalOptions?.onContextRestored());
  await waitFor(() => expect(runtime.create).toHaveBeenCalledTimes(2));
  expect(restoredController.setActiveZone).toHaveBeenLastCalledWith("premolar");
});

test("announces panel level changes while motion updates remain silent", async () => {
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
  const liveRegion = screen.getByRole("status");
  expect(liveRegion).toHaveTextContent("");

  await userEvent.click(screen.getByRole("button", { name: "Predné zuby" }));
  expect(liveRegion).toHaveTextContent("Otvorený detail: Predné zuby");
  await userEvent.click(
    screen.getByRole("button", { name: "Odlomil sa mi kúsok zuba" }),
  );
  expect(liveRegion).toHaveTextContent("Vybraný problém: Odlomil sa mi kúsok zuba");
  await userEvent.click(screen.getByRole("button", { name: "Výplň" }));
  expect(liveRegion).toHaveTextContent("Vybrané riešenie: Výplň");

  act(() =>
    ref.current?.setMotion(
      motion({ jawOpacity: 0.2, labelsOpacity: 0, interactive: true }),
    ),
  );
  expect(liveRegion).toHaveTextContent("Vybrané riešenie: Výplň");
  await userEvent.keyboard("{Escape}");
  expect(liveRegion).toHaveTextContent("Detail zatvorený.");
});

test("keeps fatal controller disposal exact-once across a profile change", async () => {
  const failedController = createController();
  const mobileController = createController();
  let failedOptions: SceneOptions | undefined;
  runtime.create
    .mockImplementationOnce(
      async (_canvas: HTMLCanvasElement, options: SceneOptions) => {
        failedOptions = options;
        return failedController;
      },
    )
    .mockResolvedValueOnce(mobileController);

  const { rerender } = render(
    <JawExperience profile="desktop" prefersReducedMotion={false} />,
  );
  await intersectHost();
  act(() => failedOptions?.onFatalError(new Error("render failed")));
  expect(failedController.dispose).toHaveBeenCalledTimes(1);

  rerender(<JawExperience profile="mobile" prefersReducedMotion={false} />);
  expect(failedController.dispose).toHaveBeenCalledTimes(1);
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
  expect(screen.getByText("Vyberte oblasť, ktorá vás trápi")).toBeVisible();
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

test("reverse with hidden labels closes the panel and keeps restored zone focus visible", async () => {
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

  act(() =>
    ref.current?.setMotion(
      motion({ interactive: false, labelsOpacity: 0 }),
    ),
  );
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  await waitFor(() => expect(trigger).toHaveFocus());
  expect(screen.getByTestId("jaw-zone-overlay")).toHaveStyle({ opacity: "1" });
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

test("leaves visibility and resize ownership to the controller without a duplicate observer", async () => {
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
  expect(FakeResizeObserver.instances).toHaveLength(0);
  expect(options).toBeDefined();
});

test("preserves live projected leaders across ready, interactive, and panel rerenders", async () => {
  const controller = createController();
  let options: SceneOptions | undefined;
  runtime.create.mockImplementation(
    async (_canvas: HTMLCanvasElement, nextOptions: SceneOptions) => {
      options = nextOptions;
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
  await intersectHost();

  const frontLeader = screen.getByTestId("jaw-leader-front");
  await waitFor(() => {
    expect(frontLeader).toHaveAttribute("x2", "400");
    expect(frontLeader).toHaveAttribute("y2", "260");
  });

  act(() => options?.onFirstFrame());
  expect(frontLeader).toHaveAttribute("x2", "400");
  expect(frontLeader).toHaveAttribute("y2", "260");

  act(() => ref.current?.setMotion(motion({ interactive: true })));
  expect(frontLeader).toHaveAttribute("x2", "400");
  expect(frontLeader).toHaveAttribute("y2", "260");

  await userEvent.click(screen.getByRole("button", { name: "Predné zuby" }));
  expect(await screen.findByRole("dialog", { name: "Predné zuby" })).toBeVisible();
  expect(frontLeader).toHaveAttribute("x2", "400");
  expect(frontLeader).toHaveAttribute("y2", "260");
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
