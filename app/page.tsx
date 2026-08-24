import { ConversionBlock } from "@/components/conversion/ConversionBlock";
import { ExperienceBand } from "@/components/home/ExperienceBand";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/hero/Hero";
import { ClinicStory } from "@/components/home/ClinicStory";
import { DriftScene } from "@/components/drift/DriftScene";
import { PatientsSection } from "@/components/patients/PatientsSection";
import { SiteHeader } from "@/components/hero/SiteHeader";
import { TeamPreview } from "@/components/team/TeamPreview";
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
        Four faces and a way through to the whole roster — the full eleven,
        with their own scroll-driven colour, are `/tim`'s job. The page has
        already asked a lot by this point.
      */}
      <TeamPreview />
      <ConversionBlock />
      <Footer />
    </>
  );
}
