import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";

import { ReviewsProvider } from "@/components/reviews/ReviewsProvider";
import { Footer } from "@/components/site/Footer";
import { SmoothScroll } from "@/components/scroll/SmoothScroll";
import "./globals.css";

/*
 * The site's face, self-hosted through `next/font` since 2026-09-26. It used
 * to load from fonts.googleapis.com, which hands every visitor's IP address
 * to Google before they have agreed to anything; served from this domain it
 * costs no third-party request and no consent. `latin-ext` carries the Slovak
 * diacritics, and the variable font covers every weight the site uses.
 */
const sans = Hanken_Grotesk({
  display: "swap",
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

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
    <html className={sans.variable} lang="sk">
      <body>
        {/*
          Renders nothing; it only attaches the eased-scroll loop to the
          window. Kept at the root so every route gets it, and inert under
          `prefers-reduced-motion`.
        */}
        <SmoothScroll />
        {/*
          Holds the reviews bar for the whole site. `children` stays a Server
          Component tree; only the provider and its triggers cross to the
          client.
        */}
        <ReviewsProvider>
          {children}
          <Footer />
        </ReviewsProvider>
      </body>
    </html>
  );
}
