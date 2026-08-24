import { readFileSync } from "node:fs";
import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { Hero } from "./Hero";
import { SiteHeader } from "./SiteHeader";

afterEach(() => {
  vi.unstubAllGlobals();
});

type QueryState = {
  matches: boolean;
  listeners: Set<(event: MediaQueryListEvent) => void>;
};

/** Stubs `matchMedia` per query so each media query can be driven separately. */
function stubMatchMedia(initial: Record<string, boolean>) {
  const states = new Map<string, QueryState>();

  const stateFor = (query: string): QueryState => {
    const existing = states.get(query);
    if (existing) return existing;

    const created: QueryState = {
      matches: initial[query] ?? false,
      listeners: new Set(),
    };
    states.set(query, created);
    return created;
  };

  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => {
      const state = stateFor(query);

      return {
        get matches() {
          return state.matches;
        },
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((_event, listener) => {
          state.listeners.add(listener);
        }),
        removeEventListener: vi.fn((_event, listener) => {
          state.listeners.delete(listener);
        }),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList;
    }),
  );

  return function setQuery(query: string, matches: boolean) {
    const state = stateFor(query);
    state.matches = matches;

    act(() => {
      for (const listener of state.listeners) {
        listener({ matches } as MediaQueryListEvent);
      }
    });
  };
}

function videoSources(container: HTMLElement): (string | null)[] {
  return Array.from(container.querySelectorAll("video source")).map((source) =>
    source.getAttribute("src"),
  );
}

test("renders the approved hero copy and patient contact details", () => {
  const { container } = render(<Hero />);

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
});

test("renders both navigation entry points alongside the tour button", () => {
  render(<SiteHeader />);

  expect(
    screen.getByRole("button", { name: "Otvoriť menu" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Otvoriť navigáciu" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /Interaktívna prehliadka klinikou/ }),
  ).toBeInTheDocument();
});

test("serves the phone encode on narrow viewports", () => {
  stubMatchMedia({
    "(prefers-reduced-motion: reduce)": false,
    "(min-width: 768px)": false,
  });

  const { container } = render(<Hero />);

  expect(videoSources(container)).toEqual(["/media/hero-720.mp4"]);
});

test("serves the 1080p pair on wide viewports, WebM first", () => {
  stubMatchMedia({
    "(prefers-reduced-motion: reduce)": false,
    "(min-width: 768px)": true,
  });

  const { container } = render(<Hero />);

  expect(videoSources(container)).toEqual([
    "/media/hero-1080.webm",
    "/media/hero-1080.mp4",
  ]);
});

test("keeps the chosen encode when the viewport later crosses the breakpoint", () => {
  const setQuery = stubMatchMedia({
    "(prefers-reduced-motion: reduce)": false,
    "(min-width: 768px)": false,
  });

  const { container } = render(<Hero />);

  expect(videoSources(container)).toEqual(["/media/hero-720.mp4"]);

  // A rotated phone must not restart the video to fetch a second encode.
  setQuery("(min-width: 768px)", true);

  expect(videoSources(container)).toEqual(["/media/hero-720.mp4"]);
});

test("uses the static poster while reduced motion is preferred", () => {
  const setQuery = stubMatchMedia({
    "(prefers-reduced-motion: reduce)": true,
    "(min-width: 768px)": true,
  });

  const { container } = render(<Hero />);

  expect(container.querySelector("video")).not.toBeInTheDocument();
  expect(
    container.querySelector('img[src="/media/hero-poster.jpg"]'),
  ).toBeInTheDocument();

  setQuery("(prefers-reduced-motion: reduce)", false);

  expect(container.querySelector("video")).toBeInTheDocument();
  expect(
    container.querySelector('img[src="/media/hero-poster.jpg"]'),
  ).not.toBeInTheDocument();

  setQuery("(prefers-reduced-motion: reduce)", true);

  expect(container.querySelector("video")).not.toBeInTheDocument();
  expect(
    container.querySelector('img[src="/media/hero-poster.jpg"]'),
  ).toBeInTheDocument();
});


/* And the mark says nothing out loud — the link's own words do that. */
test("keeps the package button's name to its label", () => {
  render(<Hero />);

  const button = screen.getByRole("link", {
    name: "Vstupný balík pre nových pacientov",
  });
  expect(button).toHaveAttribute("href", "/sluzby/vstupna-prehliadka");
});



/*
 * The package button speaks the tour button's language — same pill, same
 * hairline taupe, same translucency, same sweep — and differs only in size.
 * Two primary-looking buttons in two different idioms is the thing this
 * replaced.
 */
test("wears the same idiom as the tour button", () => {
  const css = readFileSync("components/hero/hero.module.css", "utf8");
  // Anchored to the line start: `.navigationButton {` also occurs inside
  // `.navigation.onMinimal .navigationButton {`, which is a different rule.
  const pkg = css.match(/^\.packageButton \{[^}]*\}/m)?.[0] ?? "";
  const tour = css.match(/^\.navigationButton \{[^}]*\}/m)?.[0] ?? "";

  for (const rule of [pkg, tour]) {
    expect(rule).toMatch(/border-radius:\s*999px/);
    expect(rule).toMatch(/text-transform:\s*uppercase/);
  }
  expect(pkg).toMatch(/background:\s*rgb\(20 20 23 \/ 22%\)/);
  expect(pkg).toMatch(/border:\s*1px solid rgb\(174 155 126 \/ 85%\)/);
});

/*
 * The ring is drawn as three arcs and closes into one on hover. The numbers
 * are the circle's own: at r=7.5 the circumference is 47.12, so three arcs of
 * 11.7 and three gaps of 4 go exactly once around. Change the radius without
 * changing these and the arcs stop being three.
 */
test("draws the package ring as three arcs that close into one", () => {
  const css = readFileSync("components/hero/hero.module.css", "utf8");

  expect(css).toMatch(/\.packageRing circle \{[^}]*stroke-dasharray:\s*11\.7 4/);
  expect(css).toMatch(/stroke-dasharray:\s*47\.2 0/);

  const arcs = 3;
  const circumference = 2 * Math.PI * 7.5;
  expect(arcs * 11.7 + arcs * 4).toBeCloseTo(circumference, 0);
});
