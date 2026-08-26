import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { JAW_ZONES } from "./jawContent";
import { JawAppointmentForm } from "./JawAppointmentForm";

const zone = JAW_ZONES.find((candidate) => candidate.id === "molar")!;
const problem = zone.problems.find((candidate) => candidate.id === "pulsing")!;

function renderForm({ strict = false }: { strict?: boolean } = {}) {
  const form = <JawAppointmentForm zone={zone} problem={problem} />;
  return render(strict ? <StrictMode>{form}</StrictMode> : form);
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Meno a priezvisko"), "Anna Pacientka");
  await user.type(screen.getByLabelText("Telefón"), "0918 123 456");
  await user.type(screen.getByLabelText("E-mail"), "anna@example.test");
  await user.click(screen.getByLabelText("Súhlasím so spracovaním údajov pre objednanie."));
}

describe("JawAppointmentForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    delete (window as Window & { dataLayer?: unknown }).dataLayer;
  });

  afterEach(() => vi.unstubAllGlobals());

  it("submits only controlled jaw context and keeps its visible honeypot blank", () => {
    renderForm();
    const form = screen.getByTestId("jaw-appointment-form") as HTMLFormElement;
    const values = new FormData(form);
    const honeypot = form.elements.namedItem("bot-field") as HTMLInputElement;

    expect(form).toHaveAttribute("action", "/__forms.html");
    expect(form).not.toHaveAttribute("data-netlify");
    expect(values.get("zone")).toBe("molar");
    expect(values.get("problem")).toBe("pulsing");
    expect(values.get("examination")).toBe("Vstupné vyšetrenie — 100 EUR");
    expect(values.get("bot-field")).toBe("");
    expect(honeypot.type).toBe("text");
    expect(honeypot).not.toHaveAttribute("type", "hidden");
  });

  it("posts URL-encoded form data to Netlify after a valid submit", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);
    renderForm();
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Objednať vstupné vyšetrenie" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/__forms.html");
    expect(init).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    expect(init?.body).toBeInstanceOf(URLSearchParams);
    expect((init?.body as URLSearchParams).toString()).toContain("form-name=jaw-appointment");
    expect((init?.body as URLSearchParams).toString()).toContain("zone=molar");
    expect((init?.body as URLSearchParams).toString()).toContain("problem=pulsing");
  });

  it("uses an atomic submission lock for duplicate activation", async () => {
    const user = userEvent.setup();
    let resolveRequest: ((response: Response) => void) | undefined;
    const fetchMock = vi.mocked(fetch).mockImplementation(
      () => new Promise<Response>((resolve) => { resolveRequest = resolve; }),
    );
    renderForm();
    await fillRequiredFields(user);
    const submit = screen.getByRole("button", { name: "Objednať vstupné vyšetrenie" });

    await user.click(submit);
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveRequest?.({ ok: true } as Response);
  });

  it("shows retry state and unlocks after a non-OK response in Strict Mode", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);
    renderForm({ strict: true });
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Objednať vstupné vyšetrenie" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Skúste to znova");
    expect(screen.getByLabelText("Meno a priezvisko")).toHaveValue("Anna Pacientka");
    expect(screen.getByLabelText("Telefón")).toHaveValue("0918 123 456");
    expect(screen.getByLabelText("E-mail")).toHaveValue("anna@example.test");
    expect(screen.getByRole("link", { name: "0918 800 002" })).toHaveAttribute(
      "href",
      "tel:+421918800002",
    );
    expect(screen.getByRole("button", { name: "Objednať vstupné vyšetrenie" })).toBeEnabled();
  });

  it("provides the same retry path after a network error", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockRejectedValue(new Error("offline"));
    renderForm();
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Objednať vstupné vyšetrenie" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Skúste to znova");
  });

  it("shows success and unlocks only after an OK response resolves in Strict Mode", async () => {
    const user = userEvent.setup();
    let resolveRequest: ((response: Response) => void) | undefined;
    vi.mocked(fetch).mockImplementation(
      () => new Promise<Response>((resolve) => { resolveRequest = resolve; }),
    );
    renderForm({ strict: true });
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Objednať vstupné vyšetrenie" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    resolveRequest?.({ ok: true } as Response);
    expect(await screen.findByRole("status")).toHaveTextContent("Ďakujeme");
    expect(screen.getByRole("button", { name: "Objednať vstupné vyšetrenie" })).toBeEnabled();
  });

  it("does not post when bot field is filled", async () => {
    const user = userEvent.setup();
    renderForm();
    await fillRequiredFields(user);
    const form = screen.getByTestId("jaw-appointment-form") as HTMLFormElement;
    await user.type(form.elements.namedItem("bot-field") as HTMLInputElement, "bot");
    await user.click(screen.getByRole("button", { name: "Objednať vstupné vyšetrenie" }));

    expect(fetch).not.toHaveBeenCalled();
  });

  it("aborts the pending request on unmount without publishing a result", async () => {
    const user = userEvent.setup();
    let signal: AbortSignal | undefined;
    vi.mocked(fetch).mockImplementation((_url, init) => {
      signal = init?.signal as AbortSignal;
      return new Promise<Response>(() => undefined);
    });
    const { unmount } = renderForm();
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Objednať vstupné vyšetrenie" }));
    unmount();

    expect(signal?.aborted).toBe(true);
  });

  it("emits CTA analytics with controlled ids and no contact values", async () => {
    const user = userEvent.setup();
    const push = vi.fn();
    Object.assign(window, { dataLayer: { push } });
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);
    renderForm();
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Objednať vstupné vyšetrenie" }));

    await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
    expect(push).toHaveBeenCalledWith({
      event: "jaw_cta_click",
      jaw_zone: "molar",
      jaw_problem: "pulsing",
    });
    expect(JSON.stringify(push.mock.calls)).not.toMatch(/Anna|0918 123|example\.test/);
  });
});
