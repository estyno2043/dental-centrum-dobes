import { act, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { PhotoStrip } from "./PhotoStrip";

test("finishes card growth before mapping the remaining scroll to horizontal pan", () => {
  render(<PhotoStrip />);

  const section = screen.getByRole("region", {
    name: "Miesto, kde sa nikto neponáhľa.",
  });
  const track = screen.getByRole("list");

  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: 1000,
  });
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: 1000,
  });
  Object.defineProperty(section, "offsetHeight", {
    configurable: true,
    value: 3000,
  });
  Object.defineProperty(track, "scrollWidth", {
    configurable: true,
    value: 3000,
  });
  section.getBoundingClientRect = () =>
    ({
      bottom: 1780,
      height: 3000,
      left: 0,
      right: 1000,
      top: -1220,
      width: 1000,
      x: 0,
      y: -1220,
      toJSON: () => ({}),
    }) satisfies DOMRect;

  act(() => window.dispatchEvent(new Event("scroll")));

  expect(section.style.getPropertyValue("--grow")).toBe("1");
  expect(section.style.getPropertyValue("--pan")).toBe("0.5");
  expect(section.style.getPropertyValue("--travel")).toBe("2000px");
});
