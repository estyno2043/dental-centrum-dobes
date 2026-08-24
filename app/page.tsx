import { ExperienceBand } from "@/components/home/ExperienceBand";
import { Hero } from "@/components/hero/Hero";
import { ClinicStory } from "@/components/home/ClinicStory";
import { DriftScene } from "@/components/drift/DriftScene";
import { PatientsSection } from "@/components/patients/PatientsSection";
import { ServicesSection } from "@/components/services/ServicesSection";
import { SiteHeader } from "@/components/hero/SiteHeader";
import { TeamSection } from "@/components/team/TeamSection";
import styles from "@/components/home/home.module.css";

export default function HomePage() {
  return (
    <>
      {/*
        Outside the stack on purpose. The hero layer is `position: sticky`,
        which creates a stacking context, and a fixed header nested inside it
        cannot rise above anything further down the page however high its
        z-index goes.
      */}
      <SiteHeader />
      <div className={styles.stack}>
        <div className={styles.heroLayer}>
          <Hero />
        </div>
        <div className={styles.overlay} style={{ pointerEvents: "none" }}>
          <ExperienceBand />
          <ClinicStory />
        </div>
      </div>
      <PatientsSection />
      <DriftScene />
      {/*
       * Each of the three sections below carries its own crossing from the one
       * above it, so the grounds hand over on a change of temperature rather
       * than an edge. The chain is #e2d7c3 -> #f0ece3 -> #fbfaf7, and moving
       * one of them means moving the next one's `--from-tone` with it.
       */}
      <ServicesSection />
      <TeamSection />
    </>
  );
}
