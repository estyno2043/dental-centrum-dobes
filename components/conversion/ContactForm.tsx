"use client";

import { useEffect, useRef, useState, type FormEvent, type JSX } from "react";

import { clinicPhone } from "@/components/site/siteContent";
import styles from "./contactForm.module.css";

const FORM_NAME = "kontakt";

type SubmissionState = "idle" | "submitting" | "success" | "error";

/**
 * The booking form on `/kontakt`.
 *
 * Deliberately the same shape as the jaw appointment form: Netlify Forms with
 * a honeypot, a controlled submit that aborts on unmount, and no endpoint of
 * our own. Two forms behaving differently is how one of them quietly rots.
 *
 * Netlify's runtime rejects `data-netlify` forms that exist only in App
 * Router output, because that output is not deploy-time static HTML. So the
 * detection schema lives in `public/__forms.html` and this posts to it,
 * exactly as `ServiceBooking` does. The live form carries no `data-netlify`
 * attributes, which would be misleading here.
 *
 * ⚠️ The consent checkbox has nothing to link to. Informed consent under GDPR
 * needs a privacy notice naming the operator, the purpose and the retention
 * period, and no such page exists yet. The wording matches the jaw form so
 * both can be corrected in one pass. Recorded as a blocker in `COLLAB.md`.
 */
export function ContactForm(): JSX.Element {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [botField, setBotField] = useState("");
  const [submission, setSubmission] = useState<SubmissionState>("idle");
  const submittingRef = useRef(false);
  const mountedRef = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    mountedRef.current = true;
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
      "form-name": FORM_NAME,
      "bot-field": botField,
      name,
      phone,
      email,
      message,
      consent: consent ? "yes" : "",
    });

    try {
      const response = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("contact submission failed");
      if (mountedRef.current) setSubmission("success");
    } catch {
      if (mountedRef.current && !controller.signal.aborted) setSubmission("error");
    } finally {
      submittingRef.current = false;
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }

  const submitting = submission === "submitting";

  return (
    <form
      action="/__forms.html"
      className={styles.form}
      data-testid="contact-form"
      method="POST"
      name={FORM_NAME}
      onSubmit={handleSubmit}
    >
      <input name="form-name" type="hidden" value={FORM_NAME} />
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

      <div className={styles.fieldGrid}>
        <label className={styles.field} htmlFor="kontakt-name">
          Meno a priezvisko
          <input
            autoComplete="name"
            id="kontakt-name"
            name="name"
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
        </label>
        <label className={styles.field} htmlFor="kontakt-phone">
          Telefón
          <input
            autoComplete="tel"
            id="kontakt-phone"
            name="phone"
            onChange={(event) => setPhone(event.target.value)}
            required
            type="tel"
            value={phone}
          />
        </label>
        <label className={styles.field} htmlFor="kontakt-email">
          E-mail
          <input
            autoComplete="email"
            id="kontakt-email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </label>
      </div>

      <label className={styles.field} htmlFor="kontakt-message">
        Čo vás trápi? <span className={styles.optional}>(nepovinné)</span>
        <textarea
          id="kontakt-message"
          name="message"
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
          value={message}
        />
      </label>

      <label className={styles.consent} htmlFor="kontakt-consent">
        <input
          checked={consent}
          id="kontakt-consent"
          name="consent"
          onChange={(event) => setConsent(event.target.checked)}
          required
          type="checkbox"
        />
        Súhlasím so spracovaním údajov pre objednanie.
      </label>

      {submission === "error" ? (
        <p
          aria-live="assertive"
          className={styles.formError}
          ref={errorRef}
          role="alert"
          tabIndex={-1}
        >
          Odoslanie sa nepodarilo. Skúste to znova alebo nám zavolajte na{" "}
          <a href={clinicPhone.href}>{clinicPhone.label}</a>.
        </p>
      ) : null}
      {submission === "success" ? (
        <p aria-live="polite" className={styles.formSuccess} role="status">
          Ďakujeme. Ozveme sa vám a dohodneme termín.
        </p>
      ) : null}

      <button className={styles.submit} disabled={submitting} type="submit">
        {submitting ? "Odosielame…" : "Objednať sa"}
      </button>
    </form>
  );
}
