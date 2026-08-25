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

  it("switches reviews from the dots", async () => {
    const user = userEvent.setup();
    renderBar();
    const second = reviews[1]!;

    await user.click(screen.getByRole("button", { name: /Recenzia 2 z/ }));

    expect(screen.getByText(second.text)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Recenzia 2 z/ }),
    ).toHaveAttribute("aria-current", "true");
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

  /*
   * Guards the one thing that must never ship. Every seeded review says so in
   * its own text; when the clinic's real ones land, this test is deleted in
   * the same commit that removes the last placeholder.
   */
  it("still holds only placeholder copy", () => {
    for (const review of reviews) {
      expect(review.text).toContain("SEM PRÍDE SKUTOČNÁ GOOGLE RECENZIA");
      expect(review.author).toBe("Meno Priezvisko");
    }
  });
});
