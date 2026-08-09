import { ExperienceBand } from "@/components/home/ExperienceBand";
import { Hero } from "@/components/hero/Hero";
import { PhotoStrip } from "@/components/home/PhotoStrip";
import styles from "@/components/home/home.module.css";

export default function HomePage() {
  return (
    <div className={styles.stack}>
      <div className={styles.heroLayer}>
        <Hero />
      </div>
      <div className={styles.overlay}>
        <ExperienceBand />
        <PhotoStrip />
      </div>
    </div>
  );
}
