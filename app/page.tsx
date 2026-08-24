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
       * The services section holds the drifting scene's own end tone rather
       * than crossing away from it: the two sit on screen together for a full
       * viewport, and two flat fills that disagree show an edge between them.
       * It ends on white further down, and the team picks that up as its
       * `--from-tone` — move one and the next has to move with it.
       */}
      <ServicesSection />
      <TeamSection />
    </>
  );
}
