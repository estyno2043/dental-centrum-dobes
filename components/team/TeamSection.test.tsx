import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TeamSection } from "./TeamSection";
import { teamIntro, teamMembers } from "./teamContent";

describe("TeamSection", () => {
  it("asks the header for a background, since the section is pale", () => {
    const { container } = render(<TeamSection />);

    expect(container.querySelector("section")).toHaveAttribute(
      "data-header-mode",
      "light",
    );
  });

  /*
   * The section appears twice — as the homepage's last section and as the
   * whole of `/tim` — and the two need different heading levels. Getting this
   * wrong leaves `/tim` with no `h1` at all.
   */
  it("defaults its headline to h2 and takes h1 when the page asks", () => {
    const { unmount } = render(<TeamSection />);
    expect(screen.getByRole("heading", { level: 2, name: teamIntro.headline }))
      .toBeInTheDocument();
    unmount();

    render(<TeamSection headingLevel="h1" />);
    expect(screen.getByRole("heading", { level: 1, name: teamIntro.headline }))
      .toBeInTheDocument();
  });

  it("keeps the member names one level below its own headline", () => {
    const { unmount } = render(<TeamSection />);
    expect(
      screen.getByRole("heading", { level: 3, name: teamMembers[0].name }),
    ).toBeInTheDocument();
    unmount();

    render(<TeamSection headingLevel="h1" />);
    expect(
      screen.getByRole("heading", { level: 2, name: teamMembers[0].name }),
    ).toBeInTheDocument();
  });

  /*
   * The listener has to run on mount, not on the first scroll event. Without
   * that first call the section would hold whatever the stylesheet declares
   * until the reader happens to scroll, and a section that is already on
   * screen would never get its values at all.
   */
  it("writes both scroll values on mount", () => {
    const { container } = render(<TeamSection />);
    const section = container.querySelector("section");

    expect(section?.style.getPropertyValue("--enter")).not.toBe("");
    expect(section?.style.getPropertyValue("--p")).not.toBe("");
  });

  /*
   * Both values are progress fractions and the CSS multiplies tones, offsets
   * and opacities by them, so anything outside 0–1 puts the section off its
   * own ground or its columns off their rows.
   */
  it("keeps both values within 0 and 1", () => {
    const { container } = render(<TeamSection />);
    const section = container.querySelector("section");

    for (const property of ["--enter", "--p"] as const) {
      const value = Number(section?.style.getPropertyValue(property));
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
});
