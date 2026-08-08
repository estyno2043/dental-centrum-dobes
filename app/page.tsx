import { ExperienceBand } from "@/components/home/ExperienceBand";
import { Hero } from "@/components/hero/Hero";
import styles from "@/components/home/home.module.css";

export default function HomePage() {
  return (
    <div className={styles.stack}>
      <div className={styles.heroLayer}>
        <Hero />
      </div>
      <div className={styles.overlay}>
        <ExperienceBand />
      </div>
    </div>
  );
}
