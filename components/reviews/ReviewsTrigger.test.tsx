import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ReviewsProvider } from "./ReviewsProvider";
import { ReviewsTrigger } from "./ReviewsTrigger";

describe("ReviewsTrigger", () => {
  it("raises the bar and says so", async () => {
    const user = userEvent.setup();
    render(
      <ReviewsProvider>
        <ReviewsTrigger>4,5 ★</ReviewsTrigger>
      </ReviewsProvider>,
    );

    const trigger = screen.getByRole("button", { name: /4,5/ });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("complementary", { hidden: true })).toHaveAttribute(
      "inert",
    );

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("complementary")).not.toHaveAttribute("inert");
  });

  it("closes again from the same rating", async () => {
    const user = userEvent.setup();
    render(
      <ReviewsProvider>
        <ReviewsTrigger>4,5 ★</ReviewsTrigger>
      </ReviewsProvider>,
    );

    const trigger = screen.getByRole("button", { name: /4,5/ });
    await user.click(trigger);
    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  /*
   * One bar for the site, however many ratings point at it. Two would drift
   * apart the moment either was opened.
   */
  it("shares one bar between every rating on the page", async () => {
    const user = userEvent.setup();
    render(
      <ReviewsProvider>
        <ReviewsTrigger>hero</ReviewsTrigger>
        <ReviewsTrigger>podstránka</ReviewsTrigger>
      </ReviewsProvider>,
    );

    expect(screen.getAllByRole("complementary", { hidden: true })).toHaveLength(
      1,
    );

    await user.click(screen.getByRole("button", { name: "hero" }));
    expect(
      screen.getByRole("button", { name: "podstránka" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  /*
   * A rating is worth showing whether or not it can be opened. Falling back to
   * plain text is a smaller failure than a page that will not render.
   */
  it("degrades to plain text with no provider above it", () => {
    render(<ReviewsTrigger>4,5 ★</ReviewsTrigger>);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("4,5 ★")).toBeInTheDocument();
  });
});
