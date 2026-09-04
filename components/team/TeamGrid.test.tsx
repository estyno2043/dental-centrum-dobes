import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TeamGrid } from "./TeamGrid";
import { teamIntro, teamMembers } from "./teamContent";

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

/*
 * The intro counts the team off. A sentence that states numbers about a roster
 * sitting three lines below it is one nobody re-reads when the roster changes
 * — so the roster is what decides whether it is still true.
 */
describe("teamIntro", () => {
  it("counts the same team the grid renders", () => {
    const count = (pattern: RegExp) =>
      teamMembers.filter((member) => pattern.test(member.role ?? "")).length;

    // Case-insensitive: the head of the clinic is "Hlava kliniky, zubár",
    // lowercase, and a capital-Z match quietly counted three doctors.
    expect(count(/zubár/i)).toBe(4);
    expect(count(/^Zdravotná sestra/)).toBe(5);
    expect(count(/Dentálna hygienička/)).toBe(1);
    expect(count(/Recepcia/)).toBe(1);
    expect(teamMembers).toHaveLength(11);

    expect(teamIntro.lead).toContain("Štyria lekári");
    expect(teamIntro.lead).toContain("päť sestier");
  });

  /* The line it replaced was true of every dental practice that has ever
     existed, which is what made it worth nothing. */
  it("does not say the generic thing again", () => {
    expect(teamIntro.lead).not.toMatch(/od prvého telefonátu|staráme sa o vás/i);
  });
});
