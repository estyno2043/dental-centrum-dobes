import { ExperienceBand } from "@/components/home/ExperienceBand";
import { Hero } from "@/components/hero/Hero";
import { ClinicStory } from "@/components/home/ClinicStory";
import { PatientsSection } from "@/components/patients/PatientsSection";
import styles from "@/components/home/home.module.css";

export default function HomePage() {
  return (
    <>
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
