import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { ClinicStory, jawSegments } from "./ClinicStory";

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

test("uses one region and one sticky viewport for gallery, handoff and jaw", () => {
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
  expect(screen.getAllByTestId("jaw-video-layer")).toHaveLength(2);
  expect(screen.getByText("Prirodzený zhryz")).toBeInTheDocument();
  expect(screen.getByText("Zachovať vlastný zub")).toBeInTheDocument();
  expect(screen.getByText("Zdravý základ")).toBeInTheDocument();
});

test("maps physical desktop scroll to sequential grow and pan phases", () => {
  stubMatchMedia(false);
  render(<ClinicStory />);

  const section = screen.getByRole("region", {
    name: "Miesto, kde sa nikto neponáhľa.",
  });
  const track = screen.getByRole("list");
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 1000 });
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440 });
  Object.defineProperty(track, "scrollWidth", { configurable: true, value: 4200 });
  section.getBoundingClientRect = () =>
    ({
      bottom: 8980,
      height: 11300,
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

test("declares four independently seekable clips per asset profile", () => {
  expect(jawSegments).toHaveLength(4);
  expect(jawSegments.map((segment) => segment.desktop)).toEqual([
    "/media/jaw-story/jaw-01-1080.mp4",
    "/media/jaw-story/jaw-02-1080.mp4",
    "/media/jaw-story/jaw-03-1080.mp4",
    "/media/jaw-story/jaw-04-1080.mp4",
  ]);
  expect(jawSegments.map((segment) => segment.mobile)).toEqual([
    "/media/jaw-story/jaw-01-720.mp4",
    "/media/jaw-story/jaw-02-720.mp4",
    "/media/jaw-story/jaw-03-720.mp4",
    "/media/jaw-story/jaw-04-720.mp4",
  ]);
});

test("uses static readable fallback with manual swipe under reduced motion", () => {
  stubMatchMedia(true);
  const { container } = render(<ClinicStory />);

  expect(container.querySelector("video")).not.toBeInTheDocument();
  expect(
    container.querySelector('img[src="/media/jaw-story/jaw-poster.jpg"]'),
  ).toBeInTheDocument();
  expect(screen.getByRole("list")).toHaveAttribute("data-native-swipe", "true");
  expect(screen.getByText("Prirodzený zhryz")).toBeVisible();
});
