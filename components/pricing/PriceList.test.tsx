import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PriceList } from "./PriceList";

describe("PriceList", () => {
  it("opens on the treatments, not the shop", () => {
    render(<PriceList />);

    expect(screen.getByRole("button", { name: "Výkony" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("Vyšetrenia a konzultácie")).toBeInTheDocument();
    expect(screen.queryByText("Curaprox")).not.toBeInTheDocument();
  });

  it("swaps to the products and back", async () => {
    const user = userEvent.setup();
    render(<PriceList />);

    await user.click(screen.getByRole("button", { name: "Produkty" }));
    expect(screen.getByText("Curaprox")).toBeInTheDocument();
    expect(
      screen.queryByText("Vyšetrenia a konzultácie"),
    ).not.toBeInTheDocument();
  });

  it("narrows to the rows that match and counts them", async () => {
    const user = userEvent.setup();
    render(<PriceList />);

    await user.type(screen.getByRole("searchbox"), "korunka");

    expect(await screen.findByText(/pre „korunka“/)).toBeInTheDocument();
    expect(screen.getByText("Celokeramická korunka Zirkón")).toBeInTheDocument();
    expect(screen.queryByText("Akútne vyšetrenie")).not.toBeInTheDocument();
  });

  /*
   * Someone typing a section name wants the section, not the four rows that
   * happen to repeat the word inside it.
   */
  it("keeps a whole group when the group's own name matches", async () => {
    const user = userEvent.setup();
    render(<PriceList />);

    await user.type(screen.getByRole("searchbox"), "implantol");

    expect(screen.getByText("Vhojovacia skrutka")).toBeInTheDocument();
  });

  it("offers the telephone when nothing matches", async () => {
    const user = userEvent.setup();
    render(<PriceList />);

    await user.type(screen.getByRole("searchbox"), "zzzz");

    expect(await screen.findByText(/Nič sme nenašli/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /0918 800 002/ })).toHaveAttribute(
      "href",
      "tel:+421918800002",
    );
  });
});
