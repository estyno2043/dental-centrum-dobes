import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TeamGrid } from "./TeamGrid";
import { teamMembers } from "./teamContent";

describe("TeamGrid", () => {
  it("renders every member of the roster", () => {
    render(<TeamGrid />);

    expect(screen.getAllByRole("listitem")).toHaveLength(teamMembers.length);
    for (const member of teamMembers) {
      expect(
        screen.getByRole("heading", { name: member.name }),
      ).toBeInTheDocument();
    }
  });

  it("gives each member the portrait encoded under their own slug", () => {
    render(<TeamGrid />);

    for (const member of teamMembers) {
      const portrait = screen.getByAltText(member.name);
      expect(portrait).toHaveAttribute("src", `/media/tim/${member.slug}.webp`);
      expect(portrait.getAttribute("srcSet")).toContain(
        `/media/tim/${member.slug}-mobile.webp 680w`,
      );
    }
  });

  /*
   * The point of the guard: seven of the eleven are published by the clinic
   * with a degree and no role, and a job title invented for a real medical
   * professional would be a false claim rather than filler. If someone adds a
   * fallback string here, this fails.
   */
  it("prints a role only for the members who have one, and never a fallback", () => {
    const { container } = render(<TeamGrid />);

    const withRole = teamMembers.filter((member) => member.role);
    const printed = container.querySelectorAll("li p");

    expect(printed).toHaveLength(withRole.length);
    expect([...printed].map((node) => node.textContent)).toEqual(
      withRole.map((member) => member.role),
    );
  });
});
