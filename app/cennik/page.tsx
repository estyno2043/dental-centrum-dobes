import Link from "next/link";
import type { Metadata } from "next";
import type { JSX } from "react";

import { PageShell } from "@/components/site/PageShell";
import { clinicPhone, entryExam } from "@/components/site/siteContent";
import styles from "./cennik.module.css";

export const metadata: Metadata = {
  title: "Cenník — Dental Centrum Dobeš",
  description:
    "Vstupné vyšetrenie v Dental Centrum Dobeš stojí 100 € a trvá približne " +
    "30 minút. Ďalší plán liečby a jeho cenu dostanete podľa nálezu.",
};

/**
 * ⚠️ One price, on purpose.
 *
 * The entry examination is the only figure the clinic has approved for
 * publication. The internal price list runs to 200+ coded items and is not
 * web-ready; publishing any of it early would put a number in front of a
 * patient that the clinic has not agreed to stand behind. The rest of the page
 * explains what the 100 € buys and how the patient learns the rest, which is
 * the mechanism the clinic chose for exactly this reason.
 */
const included = [
  "Približne 30 minút času len pre vás",
  "Panoramatická snímka chrupu",
  "Intraorálne fotografie a skeny",
  "CT snímka iba vtedy, keď je medicínsky potrebná",
] as const;

export default function PricingPage(): JSX.Element {
  return (
    <PageShell
      eyebrow="Cenník"
      lead="Začína sa to jedným vyšetrením. Z neho vyplynie, čo naozaj potrebujete — a čo to bude stáť."
      title="Vstupné vyšetrenie."
    >
      <div className={styles.layout}>
        <article className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{entryExam.label}</h2>
            <p className={styles.price}>{entryExam.price}</p>
          </div>

          <ul className={styles.included}>
            {included.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <p className={styles.note}>
            Plán ďalšieho ošetrenia a jeho cenu dostanete podľa nálezu z tohto
            vyšetrenia. Nič sa nezačína bez toho, aby ste vopred vedeli, čo vás
            čaká.
          </p>

          <div className={styles.actions}>
            <Link className={styles.primary} href="/kontakt">
              {entryExam.cta}
            </Link>
            <a className={styles.phone} href={clinicPhone.href}>
              alebo zavolajte {clinicPhone.label}
            </a>
          </div>
        </article>

        <aside className={styles.aside}>
          <h2 className={styles.asideTitle}>Prečo len jedna cena?</h2>
          <p>
            Ceny ošetrení sa líšia podľa nálezu — ten istý zub sa dá riešiť
            niekoľkými spôsobmi a každý stojí inak. Namiesto orientačných čísel,
            ktoré nakoniec nesedia, vám po vstupnom vyšetrení dáme konkrétny
            plán s konkrétnou cenou.
          </p>
        </aside>
      </div>
    </PageShell>
  );
}
