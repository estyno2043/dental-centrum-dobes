import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ReviewsBar } from "./ReviewsBar";
import { reviews } from "./reviewsContent";

function renderBar(open = true) {
  const onClose = vi.fn();
  const view = render(<ReviewsBar onClose={onClose} open={open} />);
  return { ...view, onClose };
}

describe("ReviewsBar", () => {
  /*
   * Off-screen is not gone. Without `inert` the bar keeps its tab stops and
   * stays readable to a screen reader while the reader can see nothing.
   */
  it("is inert while it is down and live once it is up", () => {
    const { rerender } = renderBar(false);
    const bar = screen.getByRole("complementary", { hidden: true });
    expect(bar).toHaveAttribute("inert");
    expect(bar).toHaveAttribute("data-open", "false");

    rerender(<ReviewsBar onClose={() => {}} open />);
    expect(screen.getByRole("complementary")).not.toHaveAttribute("inert");
  });

  it("shows the first review with its author and rating", () => {
    renderBar();
    const first = reviews[0]!;

    expect(screen.getByText(first.text)).toBeInTheDocument();
    expect(screen.getByText(first.author)).toBeInTheDocument();
    expect(screen.getByText(first.date)).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: `${first.rating} z 5` }),
    ).toBeInTheDocument();
  });

  it("walks the reviews with the arrows and wraps at both ends", async () => {
    const user = userEvent.setup();
    renderBar();
    const next = screen.getByRole("button", { name: "Ďalšia recenzia" });
    const previous = screen.getByRole("button", { name: "Predchádzajúca recenzia" });

    await user.click(next);
    expect(screen.getByText(reviews[1]!.text)).toBeInTheDocument();

    await user.click(previous);
    await user.click(previous);
    expect(screen.getByText(reviews.at(-1)!.text)).toBeInTheDocument();
  });

  /*
   * The Local Guide line is what Google prints, stored whole rather than
   * rebuilt from counts — Slovak plurals and the thousands separator included.
   */
  it("prints each reviewer's Google line exactly as given", () => {
    renderBar();
    expect(
      screen.getByText("Miestny sprievodca · 24 recenzií · 41 fotiek"),
    ).toBeInTheDocument();
  });

  /*
   * The one rule that cannot be relaxed: these are real people's words. A
   * fixture that trims or tidies them is the bug this catches.
   */
  it("carries every review verbatim, mistakes included", () => {
    const solovic = reviews.find((review) => review.id === "marek-solovic")!;
    expect(solovic.text).toContain("laxného prístupu , potom");
    expect(solovic.text.endsWith("viac")).toBe(true);

    const jokl = reviews.find((review) => review.id === "lubos-jokl")!;
    expect(jokl.text).toContain("parkovanie.Priatelsky");

    expect(reviews.every((review) => review.text.trim() === review.text)).toBe(true);
  });

  it("closes from the button and from Escape", async () => {
    const user = userEvent.setup();
    const { onClose } = renderBar();

    await user.click(screen.getByRole("button", { name: "Zavrieť hodnotenia" }));
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  /*
   * The page underneath stays usable, so a click on it must not dismiss the
   * bar — that is the difference between a docked bar and a dialog.
   */
  it("stays open when the page behind it is clicked", async () => {
    const user = userEvent.setup();
    const { onClose } = renderBar();

    await user.click(document.body);

    expect(onClose).not.toHaveBeenCalled();
  });

  /* `localGuide` drives the badge, so it has to agree with the printed line. */
  it("badges exactly the reviewers whose Google line says Local Guide", () => {
    for (const review of reviews) {
      expect(review.localGuide).toBe(
        review.meta.startsWith("Miestny sprievodca"),
      );
    }
  });
});
