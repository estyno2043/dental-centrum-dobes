import { ExperienceBand } from "@/components/home/ExperienceBand";
import { Hero } from "@/components/hero/Hero";
import { ClinicStory } from "@/components/home/ClinicStory";
import { DriftScene } from "@/components/drift/DriftScene";
import { PatientsSection } from "@/components/patients/PatientsSection";
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
       * The page's last word. It carries its own crossing from the drifting
       * scene's warm ground, so the two sections join on a change of
       * temperature rather than an edge — see `team.module.css`.
       */}
      <TeamSection />
    </>
  );
}
