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
      <body>{children}</body>
    </html>
  );
}
