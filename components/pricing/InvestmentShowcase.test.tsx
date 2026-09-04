import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { allServices } from "@/components/services/servicesContent";
import { InvestmentShowcase } from "./InvestmentShowcase";
import { investmentIntro, slides } from "./investmentContent";

describe("InvestmentShowcase", () => {
  it("shows the slide's name, its points and what it costs", () => {
    render(<InvestmentShowcase />);
    const slide = slides[0]!;

    expect(
      screen.getByRole("heading", { name: investmentIntro.headline }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: slide.title })).toBeInTheDocument();
    for (const point of slide.points) {
      expect(screen.getByText(point)).toBeInTheDocument();
    }
    expect(screen.getByText(slide.price.value)).toBeInTheDocument();
  });

  /*
   * The card has to be the catalogue's card, not a lookalike: same link and
   * the same `data-service-photo` frame the morph flies out of. Two cards that
   * looked alike and behaved differently would be worse than none.
   */
  it("carries the same link and morph frame as the catalogue's card", () => {
    const { container } = render(<InvestmentShowcase />);
    const slide = slides[0]!;

    const link = screen.getByRole("link", { name: /Vstupná prehliadka/ });
    expect(link).toHaveAttribute("href", `/sluzby/${slide.slug}`);
    expect(link.querySelector("[data-service-photo]")).not.toBeNull();
    expect(container.querySelector("[data-slide]")).not.toBeNull();
  });

  /*
   * A slide is a treatment; a service page can hold several. Whitening is one
   * of five options on the aesthetics page, and without its own card the slide
   * would carry that page's name and photograph — promising somebody who came
   * for whitening something broader than they asked about.
   */
  it("lets a slide carry its own card while linking to the service", () => {
    render(<InvestmentShowcase />);

    const whitening = slides.find((s) => s.slug === "esteticka-stomatologia")!;
    const link = screen.getByRole("link", { name: /Bielenie Nite White/ });

    expect(link).toHaveAttribute("href", "/sluzby/esteticka-stomatologia");
    expect(link.querySelector("img")).toHaveAttribute(
      "src",
      `/media/sluzby/${whitening.card!.image}.webp`,
    );
    expect(link).not.toHaveTextContent("Fazety, keramické korunky");
  });

  /*
   * The card promises whitening and the page has to open on it — otherwise the
   * click lands somewhere that has to be searched for what was clicked.
   */
  it("opens the aesthetics page on the treatment the card promised", async () => {
    const { solutions } = await import(
      "@/components/services/aesthetic/aestheticContent"
    );

    expect(solutions[0]?.id).toBe("bielenie");
  });

  it("points every slide at a service that exists", () => {
    for (const slide of slides) {
      expect(
        allServices.find((service) => service.slug === slide.slug),
        `${slide.slug} is not a service`,
      ).toBeDefined();
    }
  });

  it("still offers the whole price list", () => {
    render(<InvestmentShowcase />);

    expect(screen.getByRole("link", { name: /Celý cenník/ })).toHaveAttribute(
      "href",
      "/cennik",
    );
  });

  /*
   * The section reserves a viewport per slide plus one for the last to stand
   * still in, and every fade is derived from `--slide` alone. Reduced motion
   * takes the whole mechanism away rather than merely shortening it — a
   * scroll-linked cross-fade is exactly the motion that setting is about.
   */
  /*
   * The first slide holds before anything moves. The section takes the
   * viewport the moment its top reaches the top, and the header is still
   * retracting then — without the hold, the reader's first flick both hides
   * the bar and swaps the service, and what they arrived at is gone before
   * they have read it.
   */
  it("spends a viewport standing still before the run starts", () => {
    const source = readFileSync(
      "components/pricing/InvestmentShowcase.tsx",
      "utf8",
    ).replace(/\/\*[\s\S]*?\*\//g, "");

    expect(source).toContain("1 / slides.length");
    expect(source).toContain("(raw - hold) / (1 - hold)");
    // A viewport per slide plus the one it holds in.
    expect(
      readFileSync("components/pricing/investment.module.css", "utf8"),
    ).toMatch(/calc\(\(var\(--count\) \+ 1\) \* 100vh\)/);
  });

  /*
   * Only the photographs travel. Moving the words as well turns a transition
   * into a scene change, and the reader loses which of the two they were
   * part-way through — so the track translates and the panels only fade.
   */
  it("moves the filmstrip and leaves the words in place", () => {
    const css = readFileSync(
      "components/pricing/investment.module.css",
      "utf8",
    ).replace(/\/\*[\s\S]*?\*\//g, "");

    expect(css.replace(/\s+/g, " ")).toContain(
      "transform: translateY(calc(var(--slide) * -100%))",
    );
    /*
     * The panels swap by opacity alone. Anchored to a property boundary: an
     * unanchored `transform:` also matches `text-transform`, which the kicker
     * uses, and the guard passed on a technicality.
     */
    const panels = css.slice(css.indexOf(".name,"), css.indexOf(".filmstrip"));
    expect(panels).not.toMatch(/(^|[\s;{])transform:/);
  });

  /*
   * Doubling the distance empties the outgoing panel by the halfway point and
   * starts the incoming one after it. A gentle cross-fade put both at 0.7
   * through the middle — two paragraphs printed over each other.
   */
  it("never shows two panels at once", () => {
    const css = readFileSync(
      "components/pricing/investment.module.css",
      "utf8",
    ).replace(/\/\*[\s\S]*?\*\//g, "");

    expect(css.replace(/\s+/g, " ")).toContain(
      "1 - max(var(--slide) - var(--index), var(--index) - var(--slide)) * 2",
    );
  });

  /*
   * The hold is not dead scrolling. The title says its piece and leaves —
   * fading out rather than shrinking, with a negative margin taking its box
   * with it so the card re-centres into the whole stage instead of sitting
   * under an empty gap. The card and its columns grow into the room.
   */
  it("clears the title and grows the card across the hold", () => {
    const css = readFileSync(
      "components/pricing/investment.module.css",
      "utf8",
    ).replace(/\/\*[\s\S]*?\*\//g, "");
    const flat = css.replace(/\s+/g, " ");

    // Gone by two thirds of the hold, not merely dimmed.
    expect(flat).toContain("opacity: clamp(0, calc(1 - var(--intro) * 1.5), 1)");
    expect(flat).toContain("calc(var(--intro-height, 0px) * var(--intro) * -1)");
    expect(flat).toContain("--grow: calc(1 + var(--intro) * 0.07)");

    /*
     * The card's overlay is sized against the card, not the root. In rem it
     * spilled straight out of the frame whenever the card was short.
     */
    expect(flat).toContain("font-size: clamp(0.95rem, 6cqw, 1.35rem)");
    expect(flat).toMatch(/\.filmstrip \{[^}]*container-type: inline-size/);

    // The title keeps its size; it is leaving, not shrinking.
    /*
     * The card is back to the size it was; the title is what yields on a short
     * screen, so its size is height-aware rather than width-only.
     */
    expect(flat).toContain("font-size: clamp(1.6rem, min(4.4vw, 4.4vh), 3.4rem)");
    /*
     * The card's height is not a guessed clamp any more — every guess was
     * wrong in one direction or the other. The row flexes to fill the stage
     * and the card takes the room, so removing the title's box grows it with
     * nothing to keep in sync.
     */
    expect(flat).toContain("height: min(100%, 40rem)");
    expect(flat).toMatch(/\.slides \{[^}]*flex: 1 1 auto/);
  });

  /*
   * The margin that removes the title's box has to be its real height. Two
   * lines of balanced text at a clamped size is not a number a stylesheet can
   * know, and guessing leaves either a gap or the card sliding too far.
   */
  it("measures the title rather than guessing its height", () => {
    const source = readFileSync(
      "components/pricing/InvestmentShowcase.tsx",
      "utf8",
    ).replace(/\/\*[\s\S]*?\*\//g, "");

    expect(source).toContain("--intro-height");
    expect(source).toContain("[data-intro]");
    expect(source).toContain('window.addEventListener("resize", onResize)');
  });

  /*
   * A sticky element taller than the viewport scrolls with the page before it
   * sticks, which showed up as everything lurching upward mid-run with the
   * headline cut off. The stage is pinned to exactly one viewport instead.
   */
  it("pins the stage to one viewport so it cannot travel", () => {
    const css = readFileSync(
      "components/pricing/investment.module.css",
      "utf8",
    ).replace(/\/\*[\s\S]*?\*\//g, "");
    const stage = css.slice(css.indexOf(".stage {"), css.indexOf(".intro"));

    expect(stage).toMatch(/height:\s*100vh/);
    expect(stage).not.toMatch(/min-height/);
  });

  it("drives the run from one value, and drops it under reduced motion", () => {
    const css = readFileSync("components/pricing/investment.module.css", "utf8");
    // Comments stripped: the note above the rule explains why `abs()` is
    // avoided, and the guard below would otherwise trip over that sentence.
    const rules = css.replace(/\/\*[\s\S]*?\*\//g, "");

    expect(rules).toMatch(/min-height:\s*calc\(\(var\(--count\) \+ 1\) \* 100vh\)/);
    // `max(a - b, b - a)` rather than `abs()` — same arithmetic, but `abs()`
    // only reached Chrome in 2025 and this has to work on older phones.
    expect(rules.replace(/\s+/g, " ")).toContain(
      "max(var(--slide) - var(--index), var(--index) - var(--slide))",
    );
    expect(rules).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*min-height:\s*0/,
    );
  });
});
