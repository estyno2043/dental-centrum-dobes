import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReviewsProvider } from "./ReviewsProvider";
import { ReviewsHighlight } from "./ReviewsHighlight";
import { highlightedReviewIds, reviews } from "./reviewsContent";

describe("ReviewsHighlight", () => {
  /*
   * Real people's words: each highlighted review appears whole and verbatim,
   * under the name Google shows, never trimmed to fit a card.
   */
  it("shows each highlighted review whole, under its author", () => {
    render(
      <ReviewsProvider>
        <ReviewsHighlight />
      </ReviewsProvider>,
    );

    expect(highlightedReviewIds).toHaveLength(3);
    for (const id of highlightedReviewIds) {
      const review = reviews.find((r) => r.id === id);
      expect(review, id).toBeDefined();
      expect(screen.getByText(review!.text)).toBeInTheDocument();
      expect(screen.getAllByText(review!.author).length).toBeGreaterThan(0);
    }
  });

  it("opens the rest in the reviews bar", () => {
    render(
      <ReviewsProvider>
        <ReviewsHighlight />
      </ReviewsProvider>,
    );

    const more = screen.getByRole("button", {
      name: new RegExp(`všetkých ${reviews.length} recenzií`, "i"),
    });
    expect(more).toHaveAttribute("aria-expanded", "false");
  });
});
