import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import RootLayout from "@/app/layout";

import { ServiceBooking } from "./ServiceBooking";

const staticFormPath = resolve(process.cwd(), "public/__forms.html");

describe("Netlify Forms runtime-v5 contract", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("publishes the complete appointment schema as static HTML", () => {
    expect(existsSync(staticFormPath)).toBe(true);

    const document = new DOMParser().parseFromString(
      readFileSync(staticFormPath, "utf8"),
      "text/html",
    );
    const form = document.querySelector('form[name="jaw-appointment"]');
    const fieldNames = [...(form?.querySelectorAll("input") ?? [])].map(
      (input) => input.getAttribute("name"),
    );

    expect(form?.getAttribute("data-netlify")).toBe("true");
    expect(form?.getAttribute("method")).toBe("POST");
    expect(fieldNames).toEqual([
      "form-name",
      "bot-field",
      "name",
      "phone",
      "email",
      "zone",
      "problem",
      "examination",
      "service",
      "consent",
    ]);
  });

  it("keeps deploy-time detection markup out of the App Router layout", () => {
    const markup = renderToStaticMarkup(
      <RootLayout>
        <main>Test</main>
      </RootLayout>,
    );

    expect(markup).not.toContain("data-netlify");
    expect(markup).not.toContain('name="jaw-appointment"');
  });

  it("posts service enquiries to the static form target", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);
    render(<ServiceBooking service="vstupna-prehliadka" />);

    const form = screen.getByTestId("service-booking-form");
    expect(form).toHaveAttribute("action", "/__forms.html");
    expect(form).not.toHaveAttribute("data-netlify");

    await user.type(screen.getByLabelText("Meno a priezvisko"), "Anna Pacientka");
    await user.type(screen.getByLabelText("Telefón"), "0918 123 456");
    await user.click(
      screen.getByLabelText("Súhlasím so spracovaním údajov na účel objednania termínu."),
    );
    await user.click(screen.getByRole("button", { name: "Objednať termín" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/__forms.html");
  });
});
