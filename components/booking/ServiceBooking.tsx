"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type JSX } from "react";
import { IconArrowNarrowRight } from "@tabler/icons-react";

import { privacyPath, privacyReady } from "@/components/legal/legalContent";

import styles from "./serviceBooking.module.css";

const CLINIC_PHONE_LABEL = "0918 800 002";
const CLINIC_PHONE_HREF = "tel:+421918800002";

type SubmissionState = "idle" | "submitting" | "success" | "error";

export type ServiceBookingProps = Readonly<{
  /** Which page the enquiry came from, carried into the submission. */
  service: string;
}>;

/**
 * The booking form at the foot of a service page.
 *
 * Rebuilt 2026-09-26 for conversion: filled fields in a card, an optional
 * "what is it about" field, the privacy notice linked from the consent, and
 * a full-width button that says what happens. The persuasion around it lives
 * in `BookingPanel`.
 *
 * It posts the same way `JawAppointmentForm` does — a Netlify form named
 * `jaw-appointment`, honeypot and all — so both land in one place rather than
 * two. It is a separate component rather than a shared one because that form
 * is built around a jaw zone and a symptom, and five of the ten services have
 * neither. Folding them together is worth doing once the remaining service
 * pages exist and the shape they need is settled.
 *
 * Netlify detects the shared schema from `public/__forms.html` at deploy time;
 * this client form posts to that static target. Locally the submission will
 * fail unless a compatible form endpoint is running, and that is expected.
 */
export function ServiceBooking({ service }: ServiceBookingProps): JSX.Element {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [botField, setBotField] = useState("");
  const [submission, setSubmission] = useState<SubmissionState>("idle");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submission === "submitting") return;
    setSubmission("submitting");

    const body = new URLSearchParams({
      "form-name": "jaw-appointment",
      "bot-field": botField,
      name,
      phone,
      email,
      message,
      service,
      consent: consent ? "yes" : "",
    });

    try {
      const response = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!response.ok) throw new Error("booking submission failed");
      if (mountedRef.current) setSubmission("success");
    } catch {
      if (mountedRef.current) setSubmission("error");
    }
  }

  if (submission === "success") {
    return (
      <p className={styles.done} role="status">
        Ďakujeme, ozveme sa vám. Ak to súri, volajte{" "}
        <a href={CLINIC_PHONE_HREF}>{CLINIC_PHONE_LABEL}</a>.
      </p>
    );
  }

  return (
    <form
      action="/__forms.html"
      className={styles.form}
      data-testid="service-booking-form"
      method="POST"
      name="jaw-appointment"
      onSubmit={handleSubmit}
    >
      <input name="form-name" type="hidden" value="jaw-appointment" />
      <input name="service" type="hidden" value={service} />
      {/* The honeypot. Hidden from sight and from assistive technology, so
          only something filling fields blindly will touch it. */}
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

      <div className={styles.fields}>
        <label className={styles.field}>
          <span>Meno a priezvisko</span>
          <input
            autoComplete="name"
            name="name"
            onChange={(event) => setName(event.target.value)}
            required
            type="text"
            value={name}
          />
        </label>
        <label className={styles.field}>
          <span>Telefón</span>
          <input
            autoComplete="tel"
            name="phone"
            onChange={(event) => setPhone(event.target.value)}
            required
            type="tel"
            value={phone}
          />
        </label>
        <label className={styles.field}>
          <span>
            E-mail <small>nepovinné</small>
          </span>
          <input
            autoComplete="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </label>
        {/*
          Optional, and the one field that tells the clinic what the call is
          about before they make it: "bolí ma stolička" saves a round of
          questions on the phone.
        */}
        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span>
            S čím vám môžeme pomôcť? <small>nepovinné</small>
          </span>
          <textarea
            name="message"
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
            value={message}
          />
        </label>
      </div>

      <label className={styles.consent}>
        <input
          checked={consent}
          name="consent"
          onChange={(event) => setConsent(event.target.checked)}
          required
          type="checkbox"
        />
        <span>
          Súhlasím so spracovaním údajov na účel objednania termínu.
          {privacyReady ? (
            <>
              {" "}
              <Link href={privacyPath}>Ako s údajmi zaobchádzame</Link>
            </>
          ) : null}
        </span>
      </label>

      <div className={styles.actions}>
        <button className={styles.submit} disabled={submission === "submitting"} type="submit">
          {submission === "submitting" ? "Odosielam…" : "Odoslať žiadosť o termín"}
          {submission === "submitting" ? null : (
            <IconArrowNarrowRight aria-hidden="true" size={18} stroke={1.8} />
          )}
        </button>
        <p className={styles.alt}>Ozveme sa vám a termín dohodneme spolu.</p>
      </div>

      {submission === "error" ? (
        <p className={styles.error} role="alert">
          Odoslanie sa nepodarilo. Skúste to znova, alebo nám zavolajte na{" "}
          <a href={CLINIC_PHONE_HREF}>{CLINIC_PHONE_LABEL}</a>.
        </p>
      ) : null}
    </form>
  );
}
