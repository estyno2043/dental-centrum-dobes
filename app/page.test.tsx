import { render, screen, within } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import HomePage from "./page";

vi.stubGlobal(
  "matchMedia",
  vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
);
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    disconnect() {}
  },
);

afterEach(() => {
  vi.clearAllMocks();
});

test("keeps the unified clinic story beside the statement band so sticky binds to viewport", () => {
  render(<HomePage />);

  const statementBand = screen.getByRole("region", {
    name: "Meníme zážitok u zubára a vraciame vám sebavedomie.",
  });
  const clinicStory = screen.getByRole("region", {
    name: "Miesto, kde sa nikto neponáhľa.",
  });

  expect(clinicStory.parentElement).toBe(statementBand.parentElement);
});

test("keeps the statement motion surface and exit veil inside the statement region", () => {
  render(<HomePage />);

  const statementBand = screen.getByRole("region", {
    name: "Meníme zážitok u zubára a vraciame vám sebavedomie.",
  });

  expect(
    within(statementBand).getByTestId("statement-motion-surface"),
  ).toBeInTheDocument();
  expect(
    within(statementBand).getByTestId("statement-gradient-veil"),
  ).toBeInTheDocument();
});

test("lets hero controls receive clicks through the non-interactive statement slot", () => {
  render(<HomePage />);

  const statementBand = screen.getByRole("region", {
    name: "Meníme zážitok u zubára a vraciame vám sebavedomie.",
  });
  const clinicStory = screen.getByRole("region", {
    name: "Miesto, kde sa nikto neponáhľa.",
  });

  expect(statementBand).toHaveStyle({ pointerEvents: "none" });
  expect(statementBand.parentElement).toHaveStyle({ pointerEvents: "none" });
  expect(clinicStory).toHaveStyle({ pointerEvents: "auto" });
});

test("keeps gallery handoff and jaw inside the same sticky viewport", () => {
  render(<HomePage />);

  const clinicStory = screen.getByRole("region", {
    name: "Miesto, kde sa nikto neponáhľa.",
  });

  expect(within(clinicStory).getByTestId("clinic-handoff")).toBeInTheDocument();
  // JSDOM intentionally keeps <noscript> children inert, so this verifies
  // server fallback mount point while browser coverage verifies its copy.
  expect(within(clinicStory).getByTestId("jaw-noscript-fallback")).toBeInTheDocument();
  expect(screen.getAllByTestId("clinic-story-pin")).toHaveLength(1);
});

test("keeps PatientsSection after ClinicStory with its light-header marker", () => {
  render(<HomePage />);

  const clinicStory = screen.getByTestId("clinic-story");
  const patients = screen.getByRole("region", { name: /Výsledok si posúďte sami/i });

  expect(clinicStory.compareDocumentPosition(patients) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(patients).toHaveAttribute("data-header-mode", "light");
});
