import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { RotatingHeadline } from "./RotatingHeadline";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test("moves to the next headline after the approved hold and transition", () => {
  vi.useFakeTimers();

  render(
    <RotatingHeadline
      variants={["prvý", "druhý"]}
      intervalMs={2600}
      finalHoldMs={4600}
    />,
  );

  expect(screen.getByText("prvý")).toBeInTheDocument();

  act(() => vi.advanceTimersByTime(3160));

  expect(screen.getByText("druhý")).toBeInTheDocument();
});

test("keeps the first headline static when reduced motion is preferred", () => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } satisfies MediaQueryList),
  );

  render(
    <RotatingHeadline
      variants={["prvý", "druhý"]}
      intervalMs={2600}
      finalHoldMs={4600}
    />,
  );

  act(() => vi.advanceTimersByTime(20_000));

  expect(screen.getByText("prvý")).toBeInTheDocument();
  expect(screen.queryByText("druhý")).not.toBeInTheDocument();
  expect(vi.getTimerCount()).toBe(0);
});

test("clears an active transition timer when it unmounts", () => {
  vi.useFakeTimers();

  const { unmount } = render(
    <RotatingHeadline
      variants={["prvý", "druhý"]}
      intervalMs={2600}
      finalHoldMs={4600}
    />,
  );

  act(() => vi.advanceTimersByTime(2600));
  expect(vi.getTimerCount()).toBe(1);

  unmount();

  expect(vi.getTimerCount()).toBe(0);
});
