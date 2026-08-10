/* eslint-disable jsx-a11y/anchor-is-valid -- Throwaway comparison page; the links go nowhere on purpose. */

import type { JSX } from "react";
import { navigationItems } from "../hero/heroContent";
import styles from "./navDemo.module.css";

/**
 * Three candidate reveals for the desktop navigation, shown together so they
 * can be compared with a cursor rather than described in words.
 *
 * This whole folder is temporary. Once one is chosen it moves into
 * `hero.module.css` and `Hero.tsx`, and `components/navdemo` and its route are
 * deleted.
 */

const cases = [
  {
    letter: "A",
    name: "Záves",
    note: "Odkazy sa odkryjú sprava. Nič v lište sa nehýbe — logo ani tlačidlo neuskočia.",
    group: styles.groupWipe,
  },
  {
    letter: "B",
    name: "Zásuvka",
    note: "Lišta si miesto naozaj vypýta. Odkazy sa rozvinú od spúšťača von, jeden po druhom.",
    group: styles.groupDrawer,
  },
  {
    letter: "C",
    name: "Vejár",
    note: "Odkazy vyletia spod spúšťača, každý inou dráhou. Najvýraznejšie z troch.",
    group: styles.groupFan,
  },
  {
    letter: "D",
    name: "Vejár zprava",
    note: "Umiestnenie z B, animácia z C. Spúšťač sedí pri tlačidle a odkazy sa vejárovito rozvinú doľava — tlačidlo sa nepohne.",
    group: styles.groupCombo,
  },
] as const;

function Trigger(): JSX.Element {
  return (
    <button className={styles.trigger} type="button">
      <span className={styles.triggerRule} aria-hidden="true" />
      Menu
    </button>
  );
}

function Links({ className }: { className: string }): JSX.Element {
  return (
    <div className={className}>
      {navigationItems.map((item) => (
        <a className={styles.link} href="#" key={item.label}>
          {item.label}
        </a>
      ))}
    </div>
  );
}

export function NavDemo(): JSX.Element {
  return (
    <main className={styles.page}>
      <div className={styles.intro}>
        <h1 className={styles.introTitle}>Rozbaľovacie menu — návrhy</h1>
        <p className={styles.introText}>
          Prejdi kurzorom cez „Menu“ v každej lište. Tlačidlo Prehliadka kliniky
          ostáva vo všetkých nedotknuté. Každé sa otvorí aj tabulátorom, nielen
          myšou. D spája umiestnenie z B s animáciou z C.
        </p>
      </div>

      {cases.map((item) => (
        <section className={styles.case} key={item.letter}>
          <header className={styles.caseHead}>
            <span className={styles.caseLetter}>{item.letter}</span>
            <span className={styles.caseName}>{item.name}</span>
            <span className={styles.caseNote}>{item.note}</span>
          </header>

          <div className={styles.bar}>
            <div className={`${styles.group} ${item.group}`}>
              {item.letter === "A" ? (
                <>
                  <Trigger />
                  <Links className={styles.wipeLinks} />
                </>
              ) : null}

              {item.letter === "B" ? (
                <>
                  <Trigger />
                  <div className={styles.drawer}>
                    <Links className={styles.drawerInner} />
                  </div>
                </>
              ) : null}

              {item.letter === "C" ? (
                <>
                  <Trigger />
                  <Links className={styles.fan} />
                </>
              ) : null}

              {/* Links before the trigger, so they unfold towards the logo. */}
              {item.letter === "D" ? (
                <>
                  <div className={styles.combo}>
                    <Links className={styles.comboInner} />
                  </div>
                  <Trigger />
                </>
              ) : null}
            </div>

            <a className={styles.button} href="#">
              Prehliadka kliniky
            </a>
          </div>
        </section>
      ))}
    </main>
  );
}
