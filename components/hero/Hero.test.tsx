import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { Hero } from "./Hero";

afterEach(() => {
  vi.unstubAllGlobals();
});

test("renders the approved hero copy and patient contact details", () => {
  const { container } = render(<Hero />);

  expect(screen.getByRole("navigation")).toBeInTheDocument();
  expect(screen.getByRole("banner")).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "Sme dôvod, prečo sa už zubárom nemusíte vyhýbať.",
  );
  expect(screen.getByRole("link", { name: /0918 800 002/ })).toHaveAttribute(
    "href",
    "tel:+421918800002",
  );
  expect(screen.getByText("4,5")).toBeInTheDocument();
  expect(screen.getByText("Google hodnotenie")).toBeInTheDocument();
  expect(screen.getByText("parkovanie pre pacientov")).toBeInTheDocument();
  expect(screen.getByText("ošetrujeme aj deti")).toBeInTheDocument();

  const video = container.querySelector("video");
  expect(video).toHaveAttribute("poster", "/media/hero-poster.jpg");
  expect(video).toHaveTextContent("Váš prehliadač nepodporuje video.");
  expect(video?.querySelector("source")).toHaveAttribute(
    "src",
    "/media/hero-video.mp4",
  );
});

test("uses the static poster while reduced motion is preferred", () => {
  let reducedMotion = true;
  let changeListener: ((event: MediaQueryListEvent) => void) | undefined;
  const mediaQueryList = {
    get matches() {
      return reducedMotion;
    },
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn((_event, listener) => {
      changeListener = listener;
    }),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as MediaQueryList;

  vi.stubGlobal("matchMedia", vi.fn(() => mediaQueryList));

  const { container } = render(<Hero />);

  expect(container.querySelector("video")).not.toBeInTheDocument();
  expect(
    container.querySelector('img[src="/media/hero-poster.jpg"]'),
  ).toBeInTheDocument();

  reducedMotion = false;
  act(() => changeListener?.({ matches: false } as MediaQueryListEvent));

  expect(container.querySelector("video")).toBeInTheDocument();
  expect(
    container.querySelector('img[src="/media/hero-poster.jpg"]'),
  ).not.toBeInTheDocument();

  reducedMotion = true;
  act(() => changeListener?.({ matches: true } as MediaQueryListEvent));

  expect(container.querySelector("video")).not.toBeInTheDocument();
  expect(
    container.querySelector('img[src="/media/hero-poster.jpg"]'),
  ).toBeInTheDocument();
});
