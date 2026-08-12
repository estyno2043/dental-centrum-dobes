import type { JSX } from "react";

export function NetlifyJawFormDefinition(): JSX.Element {
  return (
    <form
      name="jaw-appointment"
      method="POST"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      hidden
      aria-hidden="true"
    >
      <input type="hidden" name="form-name" value="jaw-appointment" />
      <input type="hidden" name="zone" />
      <input type="hidden" name="problem" />
      <input type="hidden" name="solution" />
      <input type="hidden" name="name" />
      <input type="hidden" name="phone" />
      <input type="hidden" name="email" />
      <input type="hidden" name="consent" />
      <input type="hidden" name="bot-field" />
    </form>
  );
}
