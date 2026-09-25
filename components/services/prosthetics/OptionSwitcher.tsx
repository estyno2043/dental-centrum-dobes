"use client";

import Link from "next/link";
import { useState, type JSX } from "react";
import { IconArrowNarrowRight } from "@tabler/icons-react";

import { IconBridge, IconDenture, IconImplantDenture } from "./ProstheticsArt";
import { options } from "./prostheticsContent";
import styles from "./prosthetics.module.css";

const ICONS = {
  mostik: IconBridge,
  proteza: IconDenture,
  implantaty: IconImplantDenture,
} as const;

/**
 * Bridge, denture, denture on implants: one on screen at a time, each
 * answering the same three questions so they compare.
 *
 * A real tablist, as on the aesthetic page: arrow keys move between the tabs
 * and only the selected tab is in the tab order.
 */
export function OptionSwitcher(): JSX.Element {
  const [active, setActive] = useState(0);
  const items = options.items;
  const current = items[active]!;

  const move = (delta: number) => {
    const next = (active + delta + items.length) % items.length;
    setActive(next);
    document.getElementById(`prosthetic-tab-${items[next]!.id}`)?.focus();
  };

  return (
    <div className={styles.switcher}>
      <div aria-label="Spôsoby náhrady" className={styles.tabs} role="tablist">
        {items.map((item, index) => {
          const Glyph = ICONS[item.id];
          return (
            <button
              aria-controls={`prosthetic-panel-${item.id}`}
              aria-selected={index === active}
              className={styles.tab}
              id={`prosthetic-tab-${item.id}`}
              key={item.id}
              onClick={() => setActive(index)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") move(1);
                else if (event.key === "ArrowLeft") move(-1);
                else return;
                event.preventDefault();
              }}
              role="tab"
              tabIndex={index === active ? 0 : -1}
              type="button"
            >
              <Glyph className={styles.tabIcon} />
              <span className={styles.tabName}>{item.name}</span>
              <span className={styles.tabKind}>{item.kind}</span>
            </button>
          );
        })}
      </div>

      <div
        aria-labelledby={`prosthetic-tab-${current.id}`}
        className={styles.panel}
        id={`prosthetic-panel-${current.id}`}
        role="tabpanel"
        tabIndex={0}
      >
        <p className={styles.panelWhen}>{current.when}</p>
        <p className={styles.panelBody}>{current.body}</p>

        <dl className={styles.panelFacts}>
          {current.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>

        {current.prices.length > 0 ? (
          <ul className={styles.priceList}>
            {current.prices.map((line) => (
              <li key={line.row}>
                <span>{line.label}</span>
                <strong>{line.price}</strong>
              </li>
            ))}
          </ul>
        ) : null}

        {current.id === "mostik" ? (
          <div className={styles.example}>
            <p className={styles.exampleLabel}>{options.example.label}</p>
            <p className={styles.exampleTotal}>
              <span>{options.example.detail}</span>
              <strong>{options.example.total}</strong>
            </p>
            <p className={styles.exampleNote}>{options.example.note}</p>
          </div>
        ) : null}

        {current.link ? (
          <Link className={styles.textLink} href={current.link.href}>
            <span>{current.link.label}</span>
            <IconArrowNarrowRight size={18} stroke={1.7} />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
