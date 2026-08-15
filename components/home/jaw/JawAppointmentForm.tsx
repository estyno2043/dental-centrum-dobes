"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import styles from "@/app/problemy/problemy.module.css";

import { emitJawAnalytics } from "./jawAnalytics";
import {
  ENTRY_EXAM_LABEL,
  type JawProblem,
  type JawProblemId,
  type JawZone,
} from "./jawContent";

const CLINIC_PHONE_LABEL = "0918 800 002";
const CLINIC_PHONE_HREF = "tel:+421918800002";

type SubmissionState = "idle" | "submitting" | "success" | "error";

export type JawAppointmentFormProps = Readonly<{
  zone: JawZone;
  problem?: JawProblem;
}>;

export function JawAppointmentForm({ zone, problem }: JawAppointmentFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [botField, setBotField] = useState("");
  const [submission, setSubmission] = useState<SubmissionState>("idle");
  const submittingRef = useRef(false);
  const mountedRef = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (submission === "error") errorRef.current?.focus();
  }, [submission]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current || botField) return;

    submittingRef.current = true;
    setSubmission("submitting");
    const controller = new AbortController();
    controllerRef.current = controller;
    const body = new URLSearchParams({
      "form-name": "jaw-appointment",
      "bot-field": botField,
      name,
      phone,
      email,
      zone: zone.id,
      problem: problem?.id ?? "",
      examination: ENTRY_EXAM_LABEL,
      consent: consent ? "yes" : "",
    });

    emitJawAnalytics({
      consent,
      event: "jaw_cta_click",
      zone: zone.id,
      ...(problem ? { problem: problem.id as JawProblemId } : {}),
    });

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("appointment submission failed");
      if (mountedRef.current) setSubmission("success");
    } catch {
      if (mountedRef.current && !controller.signal.aborted) setSubmission("error");
    } finally {
      submittingRef.current = false;
      if (controllerRef.current === controller) controllerRef.current = null;
      if (mountedRef.current && !controller.signal.aborted) {
        setSubmission((current) => (current === "success" || current === "error" ? current : "idle"));
      }
    }
  }

  const submitting = submission === "submitting";

  return (
    <form
      className={styles.appointmentForm}
      action="/"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      data-testid="jaw-appointment-form"
      method="POST"
      name="jaw-appointment"
      onSubmit={handleSubmit}
    >
      <input name="form-name" type="hidden" value="jaw-appointment" />
      <input
        aria-hidden="true"
        autoComplete="off"
        className={styles.honeypot}
        name="bot-field"
        onChange={(event) => setBotField(event.target.value)}
        tabIndex={-1}
        type="text"
        value={botField}
      />
      <input name="zone" type="hidden" value={zone.id} />
      <input name="problem" type="hidden" value={problem?.id ?? ""} />
      <input name="examination" type="hidden" value={ENTRY_EXAM_LABEL} />

      <div className={styles.fieldGrid}>
        <label className={styles.field} htmlFor="jaw-appointment-name">
          Meno a priezvisko
          <input
            autoComplete="name"
            id="jaw-appointment-name"
            name="name"
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
        </label>
        <label className={styles.field} htmlFor="jaw-appointment-phone">
          Telefón
          <input
            autoComplete="tel"
            id="jaw-appointment-phone"
            name="phone"
            onChange={(event) => setPhone(event.target.value)}
            required
            type="tel"
            value={phone}
          />
        </label>
        <label className={styles.field} htmlFor="jaw-appointment-email">
          E-mail
          <input
            autoComplete="email"
            id="jaw-appointment-email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </label>
      </div>

      <label className={styles.consent} htmlFor="jaw-appointment-consent">
        <input
          checked={consent}
          id="jaw-appointment-consent"
          name="consent"
          onChange={(event) => setConsent(event.target.checked)}
          required
          type="checkbox"
        />
        Súhlasím so spracovaním údajov pre objednanie.
      </label>

      {submission === "error" ? (
        <p aria-live="assertive" className={styles.formError} ref={errorRef} role="alert" tabIndex={-1}>
          Odoslanie sa nepodarilo. Skúste to znova alebo nám zavolajte na{" "}
          <a href={CLINIC_PHONE_HREF}>{CLINIC_PHONE_LABEL}</a>.
        </p>
      ) : null}
      {submission === "success" ? (
        <p aria-live="polite" className={styles.formSuccess} role="status">
          Ďakujeme. Vaša žiadosť o vstupné vyšetrenie bola odoslaná.
        </p>
      ) : null}

      <button className={styles.submitButton} disabled={submitting} type="submit">
        {submitting ? "Odosielame…" : "Objednať vstupné vyšetrenie"}
      </button>
    </form>
  );
}
