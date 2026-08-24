import type { Metadata } from "next";
import type { JSX } from "react";

import { SiteHeader } from "@/components/hero/SiteHeader";
import { TeamSection } from "@/components/team/TeamSection";
import { teamMembers } from "@/components/team/teamContent";

export const metadata: Metadata = {
  title: "Tím — Dental Centrum Dobeš",
  description:
    `${teamMembers.length} ľudí, ktorí sa v Dental Centrum Dobeš na Kramároch ` +
    "starajú o vaše zuby — lekári, dentálna hygienička a zdravotné sestry.",
};

export default function TeamPage(): JSX.Element {
  return (
    <>
      <SiteHeader />
      {/*
       * The same section the homepage closes on, with its headline promoted to
       * `h1` — here the team is the page's subject rather than its last word.
       * Sharing the component rather than copying it is what keeps the two from
       * drifting apart as the roster changes.
       */}
      <main>
        <TeamSection headingLevel="h1" />
      </main>
    </>
  );
}
