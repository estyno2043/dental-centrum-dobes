import { ExperienceBand } from "@/components/home/ExperienceBand";
import { Hero } from "@/components/hero/Hero";
import { ClinicStory } from "@/components/home/ClinicStory";
import { PatientsSection } from "@/components/patients/PatientsSection";
import { SiteHeader } from "@/components/hero/SiteHeader";
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
    </>
  );
}
