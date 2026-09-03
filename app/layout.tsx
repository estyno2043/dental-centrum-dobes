/* eslint-disable @next/next/no-page-custom-font -- The App Router root layout applies the approved font site-wide. */

import type { Metadata } from "next";

import { SmoothScroll } from "@/components/scroll/SmoothScroll";
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
        {/*
          Renders nothing; it only attaches the eased-scroll loop to the
          window. Kept at the root so every route gets it, and inert under
          `prefers-reduced-motion`.
        */}
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
