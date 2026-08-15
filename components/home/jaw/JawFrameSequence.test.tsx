import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DecodedJawFrame, JawSequenceLoader } from "./jawSequenceLoader";

type LoaderHarness = {
  exact: DecodedJawFrame | undefined;
  nearest: DecodedJawFrame | undefined;
  listener: (() => void) | undefined;
  disposed: number;
  visible: boolean[];
  targets: Array<readonly [number, -1 | 0 | 1]>;
};

const loaderState = vi.hoisted(() => ({ harnesses: [] as LoaderHarness[] }));

vi.mock("./jawSequenceLoader", () => ({
  createBrowserJawFrameDecoder: vi.fn(() => vi.fn()),
  createJawSequenceLoader: vi.fn(() => {
    const harness: LoaderHarness = {
      exact: undefined,
      nearest: undefined,
      listener: undefined,
      disposed: 0,
      visible: [],
      targets: [],
    };
    loaderState.harnesses.push(harness);
    return {
      setTarget: (index: number, direction: -1 | 0 | 1) => harness.targets.push([index, direction]),
      getExact: () => harness.exact,
      getNearest: () => harness.nearest,
      subscribe: (listener: () => void) => {
        harness.listener = listener;
        return () => {
          if (harness.listener === listener) harness.listener = undefined;
        };
      },
      setVisible: (visible: boolean) => harness.visible.push(visible),
      inspect: () => ({ decoded: 0, pending: 0, target: 1 }),
      dispose: () => {
        harness.disposed += 1;
      },
    } satisfies JawSequenceLoader;
  }),
}));

import { JawFrameSequence } from "./JawFrameSequence";

const originalCanvasContext = HTMLCanvasElement.prototype.getContext;
const originalResizeObserver = window.ResizeObserver;
const originalVisibility = Object.getOwnPropertyDescriptor(document, "visibilityState");
const originalDevicePixelRatio = Object.getOwnPropertyDescriptor(window, "devicePixelRatio");

type ResizeObserverHarness = Readonly<{
  callback: ResizeObserverCallback;
  disconnect: () => void;
}>;

const resizeObservers: ResizeObserverHarness[] = [];
let canvasContext: { drawImage: ReturnType<typeof vi.fn> };
let animationFrames: Array<Readonly<{ id: number; callback: FrameRequestCallback }>> = [];

function frame(index: number): DecodedJawFrame {
  return {
    index,
    source: document.createElement("img"),
    close: vi.fn(),
  };
}

function renderSequence(overrides: Partial<React.ComponentProps<typeof JawFrameSequence>> = {}) {
  return render(
    <JawFrameSequence
      direction={0}
      onExactFrameDrawn={vi.fn()}
      onPermanentFailure={vi.fn()}
      profile="desktop"
      reducedMotion={false}
      targetFrame={5}
      visible
      {...overrides}
    />,
  );
}

function emitLoader(index = 0): void {
  act(() => {
    loaderState.harnesses[index]?.listener?.();
    const next = animationFrames.shift();
    next?.callback(0);
  });
}

function resize(width: number, height: number, index = 0): void {
  act(() => {
    resizeObservers[index]?.callback(
      [{ contentRect: { width, height } } as ResizeObserverEntry],
      {} as ResizeObserver,
    );
  });
}

beforeEach(() => {
  loaderState.harnesses.length = 0;
  resizeObservers.length = 0;
  animationFrames = [];
  canvasContext = { drawImage: vi.fn() };
  let animationId = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    animationId += 1;
    animationFrames.push({ id: animationId, callback });
    return animationId;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 2 });
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    value: vi.fn(() => canvasContext),
  });
  class TestResizeObserver {
    readonly harness: ResizeObserverHarness;

    constructor(callback: ResizeObserverCallback) {
      this.harness = { callback, disconnect: vi.fn() };
      resizeObservers.push(this.harness);
    }

    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = () => this.harness.disconnect();
  }
  vi.stubGlobal("ResizeObserver", TestResizeObserver);
  Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    value: originalCanvasContext,
  });
  if (originalResizeObserver) {
    Object.defineProperty(window, "ResizeObserver", { configurable: true, value: originalResizeObserver });
  } else {
    Reflect.deleteProperty(window, "ResizeObserver");
  }
  if (originalVisibility) Object.defineProperty(document, "visibilityState", originalVisibility);
  if (originalDevicePixelRatio) Object.defineProperty(window, "devicePixelRatio", originalDevicePixelRatio);
});

describe("JawFrameSequence", () => {
  it("keeps approved closed image visible until first successful decorative canvas draw", () => {
    const { container } = renderSequence();

    const staticFrame = screen.getByAltText("");
    const canvas = container.querySelector("canvas");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).not.toHaveAttribute("role");
    expect(staticFrame).toHaveAttribute("src", "/media/jaw-sequence/desktop/frame-001.webp");
    expect(staticFrame).toBeVisible();
    expect(container.firstElementChild).toHaveAttribute("data-jaw-sequence-state", "loading");

    loaderState.harnesses[0].exact = frame(5);
    emitLoader();

    expect(staticFrame).not.toBeVisible();
    expect(container.firstElementChild).toHaveAttribute("data-jaw-sequence-state", "ready");
  });

  it("uses nearest decoded frame before exact frame without claiming exact readiness", () => {
    const onExactFrameDrawn = vi.fn();
    renderSequence({ onExactFrameDrawn });
    loaderState.harnesses[0].nearest = frame(4);
    emitLoader();

    expect(canvasContext.drawImage).toHaveBeenCalledTimes(1);
    expect(onExactFrameDrawn).not.toHaveBeenCalled();
  });

  it("notifies exact frame only after its draw succeeds", () => {
    const onExactFrameDrawn = vi.fn();
    renderSequence({ onExactFrameDrawn });
    loaderState.harnesses[0].exact = frame(5);
    canvasContext.drawImage.mockImplementationOnce(() => {
      throw new Error("draw failed");
    });
    emitLoader();
    expect(onExactFrameDrawn).not.toHaveBeenCalled();

    emitLoader();
    expect(onExactFrameDrawn).toHaveBeenCalledWith(5);
  });

  it("caps canvas backing resolution by profile DPR while keeping CSS size", () => {
    const { container } = renderSequence({ profile: "desktop" });
    const canvas = container.querySelector("canvas")!;
    resize(300, 200);
    expect(canvas.width).toBe(450);
    expect(canvas.height).toBe(300);

    const mobile = renderSequence({ profile: "mobile" });
    resize(300, 200, 1);
    expect(mobile.container.querySelector("canvas")!.width).toBe(375);
    expect(mobile.container.querySelector("canvas")!.height).toBe(250);
  });

  it("restores closed fallback during a resize until canvas redraw completes", () => {
    const { container } = renderSequence();
    loaderState.harnesses[0].exact = frame(5);
    emitLoader();
    expect(screen.getByAltText("")).not.toBeVisible();

    resize(300, 200);

    expect(screen.getByAltText("")).toBeVisible();
    expect(container.firstElementChild).toHaveAttribute("data-jaw-sequence-state", "loading");
  });

  it("pauses hidden document work and resumes latest target when page becomes visible", () => {
    const { rerender } = renderSequence({ targetFrame: 5, visible: true });
    const harness = loaderState.harnesses[0];
    expect(harness.targets.at(-1)).toEqual([5, 0]);

    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(harness.visible.at(-1)).toBe(false);

    rerender(
      <JawFrameSequence
        direction={1}
        onExactFrameDrawn={vi.fn()}
        onPermanentFailure={vi.fn()}
        profile="desktop"
        reducedMotion={false}
        targetFrame={20}
        visible
      />,
    );
    expect(harness.targets.at(-1)).toEqual([20, 1]);

    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(harness.visible.at(-1)).toBe(true);
    expect(harness.targets.at(-1)).toEqual([20, 1]);
  });

  it("activates open static fallback once after three current-window draw failures", () => {
    const onPermanentFailure = vi.fn();
    const { container } = renderSequence({ onPermanentFailure });
    canvasContext.drawImage.mockImplementation(() => {
      throw new Error("decoder/draw failure");
    });
    loaderState.harnesses[0].exact = frame(5);

    emitLoader();
    emitLoader();
    emitLoader();
    emitLoader();

    expect(onPermanentFailure).toHaveBeenCalledTimes(1);
    expect(screen.getByAltText("")).toHaveAttribute("src", "/media/jaw-sequence/desktop/frame-072.webp");
    expect(container.firstElementChild).toHaveAttribute("data-jaw-sequence-state", "fallback");
  });

  it("skips loader and canvas for reduced motion while rendering open static endpoint", () => {
    const { container } = renderSequence({ reducedMotion: true });

    expect(loaderState.harnesses).toHaveLength(0);
    expect(container.querySelector("canvas")).toBeNull();
    expect(screen.getByAltText("")).toHaveAttribute("src", "/media/jaw-sequence/desktop/frame-072.webp");
    expect(container.firstElementChild).toHaveAttribute("data-jaw-sequence-state", "reduced");
  });

  it("cleans observer, animation frame, loader and subscription exactly once on unmount", () => {
    const { unmount } = renderSequence();
    const harness = loaderState.harnesses[0];
    unmount();
    unmount();

    expect(harness.disposed).toBe(1);
    expect(resizeObservers[0].disconnect).toHaveBeenCalledTimes(1);
    expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);
  });
});
