import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { OptionSwitcher } from "./OptionSwitcher";
import { options } from "./prostheticsContent";

describe("OptionSwitcher", () => {
  it("is a tablist that switches panels by click and by arrow keys", async () => {
    const user = userEvent.setup();
    render(<OptionSwitcher />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(options.example.total)).toBeInTheDocument();

    await user.click(tabs[1]!);
    expect(screen.getByRole("tabpanel")).toHaveTextContent(options.items[1].when);
    expect(screen.queryByText(options.example.total)).not.toBeInTheDocument();

    await user.keyboard("{ArrowRight}");
    expect(screen.getAllByRole("tab")[2]).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("link", { name: /Zubné implantáty/ })).toBeInTheDocument();
  });
});
