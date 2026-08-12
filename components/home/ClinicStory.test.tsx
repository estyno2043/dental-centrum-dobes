import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { ClinicStory } from "./ClinicStory";

class NoopIntersectionObserver {
  readonly observe = vi.fn();
  readonly disconnect = vi.fn();
}

class NoopResizeObserver {
  readonly observe = vi.fn();
  readonly disconnect = vi.fn();
}

let animationFrameCallbacks = new Map<number, FrameRequestCallback>();
let nextAnimationFrameId = 1;

beforeEach(() => {
  animationFrameCallbacks = new Map();
  nextAnimationFrameId = 1;
  vi.stubGlobal(
    "IntersectionObserver",
    NoopIntersectionObserver as unknown as typeof IntersectionObserver,
  );
  vi.stubGlobal(
    "ResizeObserver",
    NoopResizeObserver as unknown as typeof ResizeObserver,
  );
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      const id = nextAnimationFrameId++;
      animationFrameCallbacks.set(id, callback);
      return id;
    }),
  );
  vi.stubGlobal(
    "cancelAnimationFrame",
    vi.fn((id: number) => animationFrameCallbacks.delete(id)),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubMatchMedia(reduced: boolean, wide = true) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? reduced : wide,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

function flushAnimationFrame(now = 16): void {
  const callbacks = [...animationFrameCallbacks.values()];
  animationFrameCallbacks.clear();
  for (const callback of callbacks) callback(now);
}

function setSectionScrollVh(section: HTMLElement, scrollVh: number): void {
  const top = -scrollVh * (window.innerHeight / 100);
  section.getBoundingClientRect = () =>
    ({
      bottom: top + section.offsetHeight,
      height: section.offsetHeight,
      left: 0,
      right: window.innerWidth,
      top,
      width: window.innerWidth,
      x: 0,
      y: top,
      toJSON: () => ({}),
    }) satisfies DOMRect;
}

function zoneButtons(): HTMLButtonElement[] {
  return screen.getAllByRole("button", {
    name: /^(Predné zuby|Črenové zuby|Stoličky|Ďasná)$/,
  });
}

test("uses one sticky viewport for seven gallery frames and the realtime jaw", () => {
  stubMatchMedia(false);
  const { container } = render(<ClinicStory />);

  expect(
    screen.getByRole("region", { name: "Miesto, kde sa nikto neponáhľa." }),
  ).toBeInTheDocument();
  expect(screen.getAllByTestId("clinic-story-pin")).toHaveLength(1);
  expect(container.querySelectorAll('[data-gallery-frame="true"]')).toHaveLength(7);
  expect(screen.getByTestId("clinic-story-final-frame")).toBeInTheDocument();
  expect(screen.getByTestId("clinic-story-handoff")).toHaveAttribute(
    "src",
    "/media/strip-07-detail.jpg",
  );
  expect(screen.getByTestId("jaw-experience-host")).toBeInTheDocument();
  expect(zoneButtons()).toHaveLength(4);
  for (const button of zoneButtons()) {
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveAttribute("tabindex", "-1");
  }
  expect(container.querySelector("video")).not.toBeInTheDocument();
});

test("maps physical desktop scroll to sequential grow and pan phases in animation frames", () => {
  stubMatchMedia(false);
  render(<ClinicStory />);

  const section = screen.getByRole("region", {
    name: "Miesto, kde sa nikto neponáhľa.",
  });
  const track = screen.getByRole("list");
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 1000 });
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440 });
  Object.defineProperty(track, "scrollWidth", { configurable: true, value: 4200 });
  setSectionScrollVh(section, 232);

  act(() => {
    window.dispatchEvent(new Event("scroll"));
    flushAnimationFrame();
  });

  expect(section.style.getPropertyValue("--grow")).toBe("1");
  expect(section.style.getPropertyValue("--pan")).toBe("0.5");
  expect(section.style.getPropertyValue("--travel")).toBe("2760px");
});

test("enables interaction at 840vh and closes it when reverse scroll crosses below", () => {
  stubMatchMedia(false);
  render(<ClinicStory />);

  const section = screen.getByRole("region", {
    name: "Miesto, kde sa nikto neponáhľa.",
  });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 1000 });
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440 });
  setSectionScrollVh(section, 840);

  act(() => {
    window.dispatchEvent(new Event("scroll"));
    flushAnimationFrame();
  });

  for (const button of zoneButtons()) {
    expect(button).toHaveAttribute("aria-disabled", "false");
    expect(button).toHaveAttribute("tabindex", "0");
  }

  fireEvent.click(screen.getByRole("button", { name: "Predné zuby" }));
  expect(screen.getByRole("dialog", { name: "Predné zuby" })).toBeVisible();

  setSectionScrollVh(section, 839);
  act(() => {
    window.dispatchEvent(new Event("scroll"));
    flushAnimationFrame(32);
  });

  expect(screen.queryByRole("dialog", { name: "Predné zuby" })).not.toBeInTheDocument();
  for (const button of zoneButtons()) {
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveAttribute("tabindex", "-1");
  }
});

test("keeps the static realtime-jaw fallback and native gallery swipe under reduced motion", () => {
  stubMatchMedia(true);
  const { container } = render(<ClinicStory />);

  expect(container.querySelector("video")).not.toBeInTheDocument();
  expect(
    screen.getByRole("img", { name: /statický model chrupu/i }),
  ).toHaveAttribute("src", "/media/jaw/jaw-fallback.webp");
  expect(screen.getByRole("list")).toHaveAttribute("data-native-swipe", "true");
  for (const button of zoneButtons()) {
    expect(button).toHaveAttribute("aria-disabled", "false");
  }
});
