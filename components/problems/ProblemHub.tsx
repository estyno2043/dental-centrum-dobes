import Link from "next/link";

import {
  JAW_DISCLAIMER,
  JAW_ZONES,
} from "@/components/home/jaw/jawContent";
import styles from "@/app/problemy/problemy.module.css";

export function ProblemHub() {
  return (
    <main className={styles.problemHub}>
      <header className={styles.problemHero}>
        <p className={styles.eyebrow}>Problémy a riešenia</p>
        <h1>Čo vás trápi?</h1>
        <p className={styles.heroCopy}>
          Vyberte oblasť alebo situáciu. Ukážeme vám najčastejšie možnosti a ďalší krok.
        </p>
      </header>

      <ul aria-label="Oblasti a situácie" className={styles.zoneGrid}>
        {JAW_ZONES.map((zone, index) => (
          <li data-testid="problem-zone-card" key={zone.id}>
            <Link className={styles.zoneCardLink} href={zone.route}>
              <span aria-hidden="true" className={styles.zoneIndex}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2>{zone.label}</h2>
              <p>
                {zone.problems.length > 0
                  ? zone.problems.map((problem) => problem.patientLabel).join(" · ")
                  : "Začneme vstupným vyšetrením."}
              </p>
              <span aria-hidden="true" className={styles.zoneArrow}>↗</span>
            </Link>
          </li>
        ))}
      </ul>

      <section aria-label="Ďalší krok" className={styles.hubClose}>
        <p className={styles.disclaimer}>{JAW_DISCLAIMER}</p>
        <div className={styles.hubActions}>
          <Link className={styles.primaryAction} href="/kontakt?typ=vstupne-vysetrenie">
            Objednať vstupné vyšetrenie — 100 €
          </Link>
          <Link className={styles.secondaryAction} href="/#ambulancia">
            Pozrieť interaktívnu mapu
          </Link>
        </div>
      </section>
    </main>
  );
}
