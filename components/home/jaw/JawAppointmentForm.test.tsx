import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import {
  encodeNetlifyForm,
  JawAppointmentForm,
} from "./JawAppointmentForm";
import { NetlifyJawFormDefinition } from "./NetlifyJawFormDefinition";

const selection = {
  zoneId: "front",
  problemId: "chipped",
  solutionId: "filling",
} as const;

afterEach(() => {
  vi.unstubAllGlobals();
});

test("encodes all string controls as URLSearchParams and omits files", () => {
  const form = document.createElement("form");
  const text = document.createElement("input");
  text.name = "name";
  text.value = "Žofia & Adam";
  const repeated = document.createElement("input");
  repeated.name = "name";
  repeated.value = "Dobeš";
  const upload = document.createElement("input");
  upload.type = "file";
  upload.name = "attachment";
  form.append(text, repeated, upload);

  expect(encodeNetlifyForm(form).toString()).toBe(
    "name=%C5%BDofia+%26+Adam&name=Dobe%C5%A1",
  );
});

test("renders the Netlify form contract and patient fields without medical history", () => {
  const { container } = render(<JawAppointmentForm selection={selection} />);
  const form = screen.getByRole("form", { name: "Žiadosť o termín" });

  expect(form).toHaveAttribute("name", "jaw-appointment");
  expect(form).toHaveAttribute("method", "POST");
  expect(form).toHaveAttribute("data-netlify", "true");
  expect(form).toHaveAttribute("data-netlify-honeypot", "bot-field");
  expect(container.querySelector('input[name="form-name"]')).toHaveValue(
    "jaw-appointment",
  );
  expect(container.querySelector('input[name="zone"]')).toHaveValue("front");
  expect(container.querySelector('input[name="problem"]')).toHaveValue("chipped");
  expect(container.querySelector('input[name="solution"]')).toHaveValue("filling");

  expect(screen.getByRole("textbox", { name: "Meno" })).toBeRequired();
  expect(screen.getByRole("textbox", { name: "Telefón" })).toBeRequired();
  expect(screen.getByRole("textbox", { name: "E-mail" })).not.toBeRequired();
  expect(screen.getByRole("checkbox", { name: /Súhlasím, aby Dental Centrum Dobeš/ })).toBeRequired();
  expect(screen.getByText(
    "Súhlasím, aby Dental Centrum Dobeš použilo moje kontaktné údaje a vybraný problém na odpoveď k termínu vyšetrenia.",
  )).toBeVisible();
  expect(container.querySelector('input[name="bot-field"]')).toHaveAttribute(
    "type",
    "hidden",
  );
  expect(container.querySelector("textarea")).not.toBeInTheDocument();
});

test("posts URL-encoded values and shows success only for an ok response", async () => {
  const user = userEvent.setup();
  const fetchMock = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal("fetch", fetchMock);
  render(<JawAppointmentForm selection={selection} />);

  await user.type(screen.getByRole("textbox", { name: "Meno" }), "Žofia Dobešová");
  await user.type(screen.getByRole("textbox", { name: "Telefón" }), "+421 900 123 456");
  await user.type(screen.getByRole("textbox", { name: "E-mail" }), "zofia@example.sk");
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: "Požiadať o termín" }));

  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
  expect(url).toBe("/");
  expect(options.method).toBe("POST");
  expect(options.headers).toEqual({
    "Content-Type": "application/x-www-form-urlencoded",
  });
  expect(options.body).toBeInstanceOf(URLSearchParams);
  expect(Object.fromEntries(options.body as URLSearchParams)).toEqual({
    "form-name": "jaw-appointment",
    zone: "front",
    problem: "chipped",
    solution: "filling",
    name: "Žofia Dobešová",
    phone: "+421 900 123 456",
    email: "zofia@example.sk",
    consent: "yes",
    "bot-field": "",
  });
  expect(await screen.findByRole("status")).toHaveTextContent(/ďakujeme/i);
});

test.each([
  ["non-ok response", vi.fn().mockResolvedValue({ ok: false })],
  ["network failure", vi.fn().mockRejectedValue(new Error("offline"))],
])("retains controlled fields after %s and offers the clinic phone", async (_label, fetchMock) => {
  const user = userEvent.setup();
  vi.stubGlobal("fetch", fetchMock);
  render(<JawAppointmentForm selection={selection} />);

  await user.type(screen.getByRole("textbox", { name: "Meno" }), "Adam Novák");
  await user.type(screen.getByRole("textbox", { name: "Telefón" }), "0900 111 222");
  await user.type(screen.getByRole("textbox", { name: "E-mail" }), "adam@example.sk");
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: "Požiadať o termín" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(/skúste znova/i);
  expect(screen.getByRole("link", { name: /0918 800 002/ })).toHaveAttribute(
    "href",
    "tel:+421918800002",
  );
  expect(screen.getByRole("textbox", { name: "Meno" })).toHaveValue("Adam Novák");
  expect(screen.getByRole("textbox", { name: "Telefón" })).toHaveValue("0900 111 222");
  expect(screen.getByRole("textbox", { name: "E-mail" })).toHaveValue("adam@example.sk");
  expect(screen.getByRole("checkbox")).toBeChecked();
});

test("disables duplicate submission while the first request is pending", async () => {
  const user = userEvent.setup();
  let resolveRequest: ((value: { ok: boolean }) => void) | undefined;
  const fetchMock = vi.fn().mockReturnValue(
    new Promise<{ ok: boolean }>((resolve) => {
      resolveRequest = resolve;
    }),
  );
  vi.stubGlobal("fetch", fetchMock);
  render(<JawAppointmentForm selection={selection} />);

  await user.type(screen.getByRole("textbox", { name: "Meno" }), "Nina");
  await user.type(screen.getByRole("textbox", { name: "Telefón" }), "0911 222 333");
  await user.click(screen.getByRole("checkbox"));
  const submit = screen.getByRole("button", { name: "Požiadať o termín" });

  await user.click(submit);
  expect(submit).toBeDisabled();
  fireEvent.submit(submit.closest("form")!);
  expect(fetchMock).toHaveBeenCalledTimes(1);

  resolveRequest?.({ ok: true });
  expect(await screen.findByRole("status")).toHaveTextContent(/ďakujeme/i);
});

test("provides an accessibility-safe static Netlify definition with every scanned field", () => {
  const { container } = render(<NetlifyJawFormDefinition />);
  const form = container.querySelector('form[name="jaw-appointment"]');

  expect(form).not.toBeNull();
  expect(form).toHaveAttribute("method", "POST");
  expect(form).toHaveAttribute("data-netlify", "true");
  expect(form).toHaveAttribute("data-netlify-honeypot", "bot-field");
  expect(form).toHaveAttribute("hidden");
  expect(form).toHaveAttribute("aria-hidden", "true");
  expect(
    Array.from(form!.querySelectorAll("input"), (input) => input.name),
  ).toEqual([
    "form-name",
    "zone",
    "problem",
    "solution",
    "name",
    "phone",
    "email",
    "consent",
    "bot-field",
  ]);
  expect(container.querySelector("textarea")).not.toBeInTheDocument();
});
