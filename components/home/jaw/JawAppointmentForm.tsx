"use client";

import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type JSX,
} from "react";
import styles from "./jawExperience.module.css";

export type JawAppointmentSelection = Readonly<{
  zoneId: string;
  problemId: string;
  solutionId: string;
}>;

export type JawAppointmentFormProps = {
  selection: JawAppointmentSelection;
};

type SubmissionState = "idle" | "submitting" | "success" | "error";

const CONSENT_COPY =
  "Súhlasím, aby Dental Centrum Dobeš použilo moje kontaktné údaje a vybraný problém na odpoveď k termínu vyšetrenia.";

export function encodeNetlifyForm(form: HTMLFormElement): URLSearchParams {
  const encoded = new URLSearchParams();
  for (const [key, value] of new FormData(form).entries()) {
    if (typeof value === "string") encoded.append(key, value);
  }
  return encoded;
}

export function JawAppointmentForm({
  selection,
}: JawAppointmentFormProps): JSX.Element {
  const fieldId = useId();
  const submittingRef = useRef(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle");

  const updateName = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value);
  };
  const updatePhone = (event: ChangeEvent<HTMLInputElement>) => {
    setPhone(event.currentTarget.value);
  };
  const updateEmail = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.currentTarget.value);
  };

  async function submitAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    submittingRef.current = true;
    setSubmissionState("submitting");
    const body = encodeNetlifyForm(event.currentTarget);

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      setSubmissionState(response.ok ? "success" : "error");
    } catch {
      setSubmissionState("error");
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <form
      name="jaw-appointment"
      method="POST"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      aria-label="Žiadosť o termín"
      className={styles.appointmentForm}
      onSubmit={submitAppointment}
    >
      <input type="hidden" name="form-name" value="jaw-appointment" />
      <input type="hidden" name="zone" value={selection.zoneId} />
      <input type="hidden" name="problem" value={selection.problemId} />
      <input type="hidden" name="solution" value={selection.solutionId} />
      <p className={styles.botField} aria-hidden="true">
        <label htmlFor={`${fieldId}-bot-field`}>Toto pole nevypĺňajte</label>
        <input
          id={`${fieldId}-bot-field`}
          name="bot-field"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </p>

      <div className={styles.formField}>
        <label htmlFor={`${fieldId}-name`}>Meno</label>
        <input
          id={`${fieldId}-name`}
          name="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={updateName}
        />
      </div>

      <div className={styles.formField}>
        <label htmlFor={`${fieldId}-phone`}>Telefón</label>
        <input
          id={`${fieldId}-phone`}
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          value={phone}
          onChange={updatePhone}
        />
      </div>

      <div className={styles.formField}>
        <label htmlFor={`${fieldId}-email`}>E-mail</label>
        <input
          id={`${fieldId}-email`}
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={updateEmail}
        />
      </div>

      <label className={styles.consentField} htmlFor={`${fieldId}-consent`}>
        <input
          id={`${fieldId}-consent`}
          name="consent"
          type="checkbox"
          value="yes"
          required
          checked={consent}
          onChange={(event) => setConsent(event.currentTarget.checked)}
        />
        <span>{CONSENT_COPY}</span>
      </label>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={submissionState === "submitting"}
      >
        {submissionState === "submitting" ? "Odosielame…" : "Požiadať o termín"}
      </button>

      {submissionState === "success" ? (
        <p className={styles.formSuccess} role="status">
          Ďakujeme. Ozveme sa vám s návrhom termínu.
        </p>
      ) : null}

      {submissionState === "error" ? (
        <p className={styles.formError} role="alert">
          Formulár sa nepodarilo odoslať. Skúste znova alebo zavolajte na{" "}
          <a href="tel:+421918800002">0918 800 002</a>.
        </p>
      ) : null}
    </form>
  );
}
