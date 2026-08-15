/* eslint-disable @next/next/no-page-custom-font -- The App Router root layout applies the approved font site-wide. */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dental Centrum Dobeš",
  description: "Súkromná zubná klinika pri Kramároch v Bratislave.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <form
          aria-hidden="true"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          hidden
          method="POST"
          name="jaw-appointment"
        >
          <input name="form-name" type="hidden" value="jaw-appointment" />
          <input name="bot-field" type="hidden" />
          <input name="name" type="hidden" />
          <input name="phone" type="hidden" />
          <input name="email" type="hidden" />
          <input name="zone" type="hidden" />
          <input name="problem" type="hidden" />
          <input name="examination" type="hidden" />
          <input name="consent" type="hidden" />
        </form>
        {children}
      </body>
    </html>
  );
}
