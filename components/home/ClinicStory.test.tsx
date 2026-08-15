import { act, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, expect, test, vi } from "vitest";
import { ClinicStory } from "./ClinicStory";
import { photoFrames } from "./photoStripContent";

const cssText = readFileSync("components/home/clinicStory.module.css", "utf8");

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
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
}

test("keeps complete semantic gallery and one sticky handoff into jaw sequence", () => {
  stubMatchMedia(false);
  const { container } = render(<ClinicStory />);

  expect(
    screen.getByRole("region", { name: "Miesto, kde sa nikto neponáhľa." }),
  ).toBeInTheDocument();
  expect(screen.getAllByTestId("clinic-story-pin")).toHaveLength(1);
  expect(screen.getAllByTestId("clinic-frame")).toHaveLength(photoFrames.length);
  expect(screen.getAllByTestId("clinic-frame").map((node) => node.dataset.frameId)).toEqual(
    photoFrames.map((frame) => frame.id),
  );
  expect(screen.getByTestId("clinic-handoff")).toHaveAttribute("data-frame-id", "detail");
  expect(screen.getByTestId("clinic-story")).toHaveAttribute("data-desktop-vh", "1030");
  expect(container.querySelector("video")).not.toBeInTheDocument();
  expect(container.textContent).not.toContain("Prirodzený zhryz");
});

test("maps physical desktop scroll to sequential grow and pan phases", () => {
  stubMatchMedia(false);
  render(<ClinicStory />);

  const section = screen.getByTestId("clinic-story");
  const track = screen.getByRole("list");
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 1000 });
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440 });
  Object.defineProperty(track, "scrollWidth", { configurable: true, value: 4200 });
  section.getBoundingClientRect = () =>
    ({
      bottom: 7980,
      height: 10300,
      left: 0,
      right: 1440,
      top: -2320,
      width: 1440,
      x: 0,
      y: -2320,
      toJSON: () => ({}),
    }) satisfies DOMRect;

  act(() => window.dispatchEvent(new Event("scroll")));

  expect(section.style.getPropertyValue("--grow")).toBe("1");
  expect(section.style.getPropertyValue("--pan")).toBe("0.5");
  expect(section.style.getPropertyValue("--travel")).toBe("2760px");
});

test("renders static open sequence and six routes for reduced motion", () => {
  stubMatchMedia(true);
  const { container } = render(<ClinicStory />);

  expect(container.querySelector("video")).not.toBeInTheDocument();
  expect(screen.getByRole("list")).toHaveAttribute("data-native-swipe", "true");
  expect(container.querySelector('[data-jaw-sequence-state="reduced"] img')).toHaveAttribute(
    "src",
    "/media/jaw-sequence/desktop/frame-072.webp",
  );
  expect(
    screen.getAllByRole("link", {
      name: /Predné zuby|Črenové zuby|Stoličky|Ďasná|Chýbajúci zub|Neviem/,
    }),
  ).toHaveLength(6);
});

test("keeps gallery and story geometry when sequence reports a permanent failure", () => {
  stubMatchMedia(false);
  render(<ClinicStory />);

  const section = screen.getByTestId("clinic-story");
  act(() => window.dispatchEvent(new Event("jaw-sequence-permanent-failure")));

  expect(screen.getAllByTestId("clinic-frame")).toHaveLength(photoFrames.length);
  expect(screen.getByTestId("clinic-handoff")).toHaveAttribute("data-frame-id", "detail");
  expect(section).toHaveAttribute("data-desktop-vh", "1030");
  expect(screen.getAllByTestId("clinic-frame").map((node) => node.dataset.frameId)).toEqual(
    photoFrames.map((frame) => frame.id),
  );
});

test("reserves a separate mobile title and prompt lane above the jaw artboard", () => {
  expect(cssText).toMatch(
    /@media \(max-width: 767px\)[\s\S]*?\.jawLayer h2[\s\S]*?width:\s*calc\(100% - 2rem\)[\s\S]*?line-height:\s*1\.05/,
  );
  expect(cssText).toMatch(
    /@media \(max-width: 767px\)[\s\S]*?\.jawLayer h2 \+ p[\s\S]*?top:\s*clamp\(7\.35rem, 16vh, 8\.75rem\)/,
  );
});
