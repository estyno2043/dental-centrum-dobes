"use client";

import { useDeferredValue, useId, useMemo, useState, type JSX } from "react";
import { IconSearch, IconX } from "@tabler/icons-react";

import {
  priceGroups,
  priceValidFrom,
  type PriceGroup,
} from "./pricingContent";
import styles from "./pricing.module.css";

/**
 * The whole price list — 248 entries — made findable.
 *
 * Search first, because at this length browsing is not a real option: someone
 * arrives wanting one number, and a category tree makes them guess which of
 * seventeen headings the clinic filed it under. Typing "korunka" answers that
 * without them having to know.
 *
 * Two tabs, not one list. Treatments and the shop are different questions, and
 * a search for "kefka" that returns bone grafts alongside toothbrushes is
 * worse than either list alone.
 *
 * No billing codes. `1/D01` is for the practice software; on this page it is
 * noise in the one column a reader scans.
 */
function matches(group: PriceGroup, needle: string): PriceGroup | null {
  if (!needle) return group;

  // A group whose own name matches keeps all of its rows: someone typing
  // "protetika" wants the section, not the four rows with the word in them.
  if (group.name.toLocaleLowerCase("sk").includes(needle)) return group;

  const entries = group.entries.filter((entry) =>
    entry.label.toLocaleLowerCase("sk").includes(needle),
  );
  return entries.length > 0 ? { ...group, entries } : null;
}

export function PriceList(): JSX.Element {
  const [part, setPart] = useState<"vykony" | "produkty">("vykony");
  const [query, setQuery] = useState("");
  const searchId = useId();

  /*
   * Deferred so the field never stutters. Re-filtering 248 rows on every
   * keystroke is cheap, but rendering them is not, and the typing is the part
   * that must not wait.
   */
  const deferred = useDeferredValue(query);
  const needle = deferred.trim().toLocaleLowerCase("sk");

  const groups = useMemo(
    () =>
      priceGroups
        .filter((group) => group.part === part)
        .map((group) => matches(group, needle))
        .filter((group): group is PriceGroup => group !== null),
    [needle, part],
  );

  const found = groups.reduce((sum, group) => sum + group.entries.length, 0);

  return (
    <div className={styles.list}>
      <div className={styles.controls}>
        <div className={styles.tabs} role="group" aria-label="Časť cenníka">
          {(
            [
              ["vykony", "Výkony"],
              ["produkty", "Produkty"],
            ] as const
          ).map(([value, label]) => (
            <button
              aria-pressed={part === value}
              className={styles.tab}
              key={value}
              onClick={() => setPart(value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.search}>
          <IconSearch className={styles.searchIcon} size={17} stroke={1.7} />
          <label className={styles.visuallyHidden} htmlFor={searchId}>
            Hľadať v cenníku
          </label>
          <input
            autoComplete="off"
            className={styles.searchInput}
            id={searchId}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Hľadajte výkon alebo produkt…"
            type="search"
            value={query}
          />
          {query ? (
            <button
              aria-label="Zrušiť hľadanie"
              className={styles.clear}
              onClick={() => setQuery("")}
              type="button"
            >
              <IconX size={15} stroke={1.8} />
            </button>
          ) : null}
        </div>
      </div>

      {/*
        Politely announced rather than read out on every keystroke, so a screen
        reader hears the count settle instead of counting along.
      */}
      <p aria-live="polite" className={styles.count}>
        {needle
          ? `${found} ${found === 1 ? "položka" : found < 5 ? "položky" : "položiek"} pre „${deferred.trim()}“`
          : `Ceny platné od ${priceValidFrom}.`}
      </p>

      {groups.length === 0 ? (
        <p className={styles.empty}>
          Nič sme nenašli. Skúste kratšie slovo — alebo nám zavolajte na{" "}
          <a href="tel:+421918800002">0918 800 002</a> a nájdeme to spolu.
        </p>
      ) : (
        <div className={styles.groups}>
          {groups.map((group) => (
            <section
              aria-labelledby={`price-${group.slug}`}
              className={styles.group}
              key={group.slug}
            >
              <h2 className={styles.groupName} id={`price-${group.slug}`}>
                {group.name}
              </h2>
              <dl className={styles.rows}>
                {group.entries.map((entry) => (
                  <div className={styles.row} key={entry.label}>
                    <dt>{entry.label}</dt>
                    {/* The leader between the two is decoration, not content. */}
                    <dd data-missing={entry.price === null}>
                      {entry.price ?? "Na vyžiadanie"}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      )}

      <footer className={styles.legend}>
        <p>
          <strong>Podľa rozsahu</strong> — cenu určíme podľa toho, čo je
          potrebné; poviete si o ňu vopred a dostanete ju predtým, než začneme.
        </p>
        <p>
          Niektoré výkony sú uvedené rozsahom, pretože ich cena závisí od
          rozsahu a použitého materiálu. Cenník je informatívny prehľad, zmena
          cien vyhradená.
        </p>
      </footer>
    </div>
  );
}
