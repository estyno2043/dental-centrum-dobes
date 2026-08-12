import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, test, vi } from "vitest";
import type { JawProblemId, JawSolutionId } from "./jawContent";
import { getJawZone } from "./jawContent";
import { JawDetailPanel } from "./JawDetailPanel";

const frontZoneResult = getJawZone("front");

if (!frontZoneResult) throw new Error("Front-zone test fixture is missing.");
const frontZone = frontZoneResult;

function createPortalHost(): HTMLDivElement {
  const host = document.createElement("div");
  host.dataset.testid = "jaw-host";
  document.body.append(host);
  return host;
}

test("renders the four front-zone problems in the supplied jaw portal", async () => {
  const portalHost = createPortalHost();

  render(
    <JawDetailPanel
      zone={frontZone}
      portalContainer={portalHost}
      activeProblemId={null}
      activeSolutionId={null}
      onProblemSelect={vi.fn()}
      onSolutionSelect={vi.fn()}
      onBack={vi.fn()}
      onClose={vi.fn()}
    />,
  );

  const dialog = await screen.findByRole("dialog", { name: "Predné zuby" });
  expect(portalHost).toContainElement(dialog);

  for (const label of [
    "Odlomil sa mi kúsok zuba",
    "Jeden zub mi stmavol",
    "Reaguje na studené alebo sladké",
    "Prekáža mi tvar alebo medzera",
  ]) {
    expect(within(dialog).getByRole("button", { name: label })).toBeVisible();
  }

  expect(within(dialog).getAllByRole("button", { name: /./ })).toHaveLength(5);
  await waitFor(() => {
    expect(
      within(dialog).getByRole("button", {
        name: "Odlomil sa mi kúsok zuba",
      }),
    ).toHaveFocus();
  });
});

test("uses controlled callbacks to move from problems to solutions and back", async () => {
  const user = userEvent.setup();
  const portalHost = createPortalHost();
  const onProblemSelect = vi.fn();
  const onSolutionSelect = vi.fn();
  const onBack = vi.fn();

  function Harness() {
    const [problemId, setProblemId] = useState<JawProblemId | null>(null);
    const [solutionId, setSolutionId] = useState<JawSolutionId | null>(null);

    return (
      <JawDetailPanel
        zone={frontZone}
        portalContainer={portalHost}
        activeProblemId={problemId}
        activeSolutionId={solutionId}
        onProblemSelect={(id) => {
          onProblemSelect(id);
          setProblemId(id as JawProblemId);
        }}
        onSolutionSelect={(id) => {
          onSolutionSelect(id);
          setSolutionId(id as JawSolutionId);
        }}
        onBack={() => {
          onBack();
          if (solutionId) setSolutionId(null);
          else setProblemId(null);
        }}
        onClose={vi.fn()}
      />
    );
  }

  render(<Harness />);
  await user.click(
    await screen.findByRole("button", { name: "Odlomil sa mi kúsok zuba" }),
  );

  expect(onProblemSelect).toHaveBeenCalledWith("chipped");
  expect(
    screen.queryByRole("button", { name: "Jeden zub mi stmavol" }),
  ).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Výplň" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Korunka" })).toBeVisible();

  await user.click(screen.getByRole("button", { name: "Výplň" }));
  expect(onSolutionSelect).toHaveBeenCalledWith("filling");
  expect(screen.getByRole("heading", { name: "Výplň" })).toBeVisible();
  expect(screen.getByRole("form", { name: "Žiadosť o termín" })).toBeVisible();

  await user.click(screen.getByRole("button", { name: "Späť" }));
  expect(onBack).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button", { name: "Výplň" })).toBeVisible();

  await user.click(screen.getByRole("button", { name: "Späť" }));
  expect(onBack).toHaveBeenCalledTimes(2);
  expect(
    screen.getByRole("button", { name: "Odlomil sa mi kúsok zuba" }),
  ).toBeVisible();
});

test("shows the non-diagnostic notice and official price-list destination", async () => {
  const portalHost = createPortalHost();

  render(
    <JawDetailPanel
      zone={frontZone}
      portalContainer={portalHost}
      activeProblemId={null}
      activeSolutionId={null}
      onProblemSelect={vi.fn()}
      onSolutionSelect={vi.fn()}
      onBack={vi.fn()}
      onClose={vi.fn()}
    />,
  );

  expect(await screen.findByText(/nenahrádza vyšetrenie/i)).toBeVisible();
  expect(screen.getByRole("link", { name: /oficiálny cenník/i })).toHaveAttribute(
    "href",
    "https://www.bratislavazubar.sk/cennik/",
  );
});

test("Escape and the visible close button call the controlled close callback", async () => {
  const user = userEvent.setup();
  const portalHost = createPortalHost();
  const onClose = vi.fn();

  const { rerender } = render(
    <JawDetailPanel
      zone={frontZone}
      portalContainer={portalHost}
      activeProblemId={null}
      activeSolutionId={null}
      onProblemSelect={vi.fn()}
      onSolutionSelect={vi.fn()}
      onBack={vi.fn()}
      onClose={onClose}
    />,
  );

  await screen.findByRole("dialog");
  await user.keyboard("{Escape}");
  expect(onClose).toHaveBeenCalledTimes(1);

  rerender(
    <JawDetailPanel
      zone={frontZone}
      portalContainer={portalHost}
      activeProblemId={null}
      activeSolutionId={null}
      onProblemSelect={vi.fn()}
      onSolutionSelect={vi.fn()}
      onBack={vi.fn()}
      onClose={onClose}
    />,
  );
  await user.click(await screen.findByRole("button", { name: "Zavrieť detail" }));
  expect(onClose).toHaveBeenCalledTimes(2);
});

test("traps keyboard focus inside the detail panel", async () => {
  const user = userEvent.setup();
  const portalHost = createPortalHost();
  const outside = document.createElement("button");
  outside.textContent = "Outside";
  document.body.append(outside);

  render(
    <JawDetailPanel
      zone={frontZone}
      portalContainer={portalHost}
      activeProblemId={null}
      activeSolutionId={null}
      onProblemSelect={vi.fn()}
      onSolutionSelect={vi.fn()}
      onBack={vi.fn()}
      onClose={vi.fn()}
    />,
  );

  const dialog = await screen.findByRole("dialog");
  for (let index = 0; index < 8; index += 1) await user.tab();
  expect(dialog).toContainElement(document.activeElement as HTMLElement);
  expect(outside).not.toHaveFocus();
});
