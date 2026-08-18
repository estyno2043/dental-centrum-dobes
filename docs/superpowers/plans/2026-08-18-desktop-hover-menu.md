# Desktop Hover Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat desktop header link row with the existing dental-capsule trigger, opening a compact hover panel (Služby, Cenník, Tím, Kontakt) that stays reachable everywhere the header currently hides itself.

**Architecture:** A new `DesktopMenu` component renders as a sibling of `<nav>` inside `SiteHeader`, independent of the header's own `visibility` toggling. It positions itself with `position: fixed`, tracks the header's scrolled padding through one prop, and reveals a `motion`-animated panel on hover-intent, click, or keyboard focus. `MobileMenu` and the phone breakpoint are untouched.

**Tech Stack:** Next.js 16, React 19, `motion/react` (already used by `MobileMenu`/`RotatingHeadline`), `@tabler/icons-react`, Vitest + Testing Library, CSS Modules.

---

## Spec

`docs/superpowers/specs/2026-08-18-desktop-hover-menu-design.md`

## File Structure

Created:
- `components/hero/DesktopMenu.tsx` — trigger button, hover-intent timers, animated panel, four links + phone.
- `components/hero/DesktopMenu.test.tsx` — its tests.

Modified:
- `components/hero/heroContent.ts` — `navigationItems` drops `Ambulancia` (4 items, shared by phone and desktop).
- `components/hero/MobileMenu.test.tsx` — drops the now-stale `Ambulancia` assertion.
- `components/hero/SiteHeader.tsx` — removes the flat `.navigationLinks` row, renders `DesktopMenu` as a sibling of `<nav>`.
- `components/hero/Hero.test.tsx` — the `<SiteHeader />` integration test asserts the new trigger instead of the removed link row.
- `components/hero/hero.module.css` — removes the five `.navigationLinks`-related rules, adds the desktop trigger/panel rules.
- `COLLAB.md` — reservation update (Task 6), handoff entry after user approval.

---

### Task 1: Drop Ambulancia from the shared navigation list

**Files:**
- Modify: `components/hero/heroContent.ts:9-13`
- Modify: `components/hero/MobileMenu.test.tsx:20-36`

`navigationItems` feeds both `MobileMenu` today and `DesktopMenu` later. Change it once, first, so every later task builds on the final 4-item list.

- [ ] **Step 1: Edit `heroContent.ts`**

Change:

```ts
export const navigationItems = [
  { label: "Služby", href: "#" },
  { label: "Cenník", href: "#" },
  { label: "Tím", href: "#" },
  { label: "Ambulancia", href: "#" },
  { label: "Kontakt", href: "#" },
] as const;
```

to:

```ts
export const navigationItems = [
  { label: "Služby", href: "#" },
  { label: "Cenník", href: "#" },
  { label: "Tím", href: "#" },
  { label: "Kontakt", href: "#" },
] as const;
```

- [ ] **Step 2: Run the test suite and confirm the expected failure**

Run: `npm test`
Expected: FAIL — `MobileMenu.test.tsx` › `opens the complete mobile navigation` fails on `screen.getByRole("link", { name: "Ambulancia" })`.

- [ ] **Step 3: Update `MobileMenu.test.tsx`**

In the `"opens the complete mobile navigation"` test, delete these two lines:

```ts
  expect(
    screen.getByRole("link", { name: "Ambulancia" }),
  ).toBeInTheDocument();
```

- [ ] **Step 4: Run the test suite and confirm it passes**

Run: `npm test`
Expected: PASS — all `MobileMenu.test.tsx` and `Hero.test.tsx` tests green. (`Hero.test.tsx`'s `getByRole("link", { name: "Služby" })` still passes: the flat row still renders it until Task 3.)

- [ ] **Step 5: Commit**

```bash
git add components/hero/heroContent.ts components/hero/MobileMenu.test.tsx
git commit -m "refactor: drop Ambulancia from shared navigation items"
```

---

### Task 2: Build `DesktopMenu`

**Files:**
- Create: `components/hero/DesktopMenu.tsx`
- Create: `components/hero/DesktopMenu.test.tsx`

Builds the component in isolation (not yet wired into `SiteHeader`), one behaviour at a time. Uses the exact 86×50 capsule markup `MobileMenu` already renders, reusing its `mobileMenuTooth` / `mobileMenuDivider` / `mobileMenuAction` CSS classes (Task 4 adds the new classes this task also needs — `desktopMenuTrigger`, `desktopMenuPanel`, `desktopMenuLinks`, `desktopMenuLink`, `desktopMenuFooter` — see Step 1 below, which adds a minimal stand-in block so this task's tests can run before Task 4's full CSS pass).

- [ ] **Step 1: Add a minimal CSS stand-in and write the first failing test**

`DesktopMenu` needs *some* class names to exist in `hero.module.css` before the component can reference `styles.desktopMenuTrigger` etc. without a TypeScript error (CSS Modules types resolve at build time via the actual file). Append this block to the end of `components/hero/hero.module.css` for now — Task 4 replaces it with the final, fully styled version:

```css
.desktopMenuRoot {
}

.desktopMenuTrigger {
}

.desktopMenuPanel {
}

.desktopMenuLinks {
}

.desktopMenuLink {
}

.desktopMenuFooter {
}
```

Create `components/hero/DesktopMenu.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { DesktopMenu } from "./DesktopMenu";

test("renders a closed trigger with a distinct accessible name from the mobile menu", () => {
  render(<DesktopMenu scrolled={false} />);

  const trigger = screen.getByRole("button", { name: "Otvoriť navigáciu" });
  expect(trigger).toBeInTheDocument();
  expect(trigger).toHaveAttribute("aria-expanded", "false");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/hero/DesktopMenu.test.tsx`
Expected: FAIL — cannot find module `./DesktopMenu`.

- [ ] **Step 3: Write the minimal component**

Create `components/hero/DesktopMenu.tsx`:

```tsx
"use client";

/* eslint-disable jsx-a11y/anchor-is-valid -- Destinations stay as approved placeholders until their sections exist. */

import { useState, type JSX } from "react";
import { IconDental, IconMenuDeep } from "@tabler/icons-react";
import { navigationItems } from "./heroContent";
import styles from "./hero.module.css";

type DesktopMenuProps = Readonly<{
  scrolled: boolean;
}>;

export function DesktopMenu({ scrolled }: DesktopMenuProps): JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={[styles.desktopMenuRoot, scrolled ? styles.scrolled : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        aria-label="Otvoriť navigáciu"
        aria-expanded={open}
        aria-controls="desktop-menu-panel"
        className={styles.desktopMenuTrigger}
      >
        <span className={styles.mobileMenuTooth} aria-hidden="true">
          <IconDental stroke={1.6} />
        </span>
        <span className={styles.mobileMenuDivider} aria-hidden="true" />
        <span className={styles.mobileMenuAction} aria-hidden="true">
          <IconMenuDeep stroke={1.7} />
          <span>Menu</span>
        </span>
      </button>

      <div id="desktop-menu-panel" className={styles.desktopMenuPanel} inert={!open}>
        <nav aria-label="Navigácia" className={styles.desktopMenuLinks}>
          {navigationItems.map((item, index) => (
            <a key={item.label} href={item.href} className={styles.desktopMenuLink}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.desktopMenuFooter}>
          <a className={styles.mobileMenuPhone} href="tel:+421918800002">
            <span>Objednajte sa</span>
            <strong>0918 800 002</strong>
          </a>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/hero/DesktopMenu.test.tsx`
Expected: PASS

- [ ] **Step 5: Write the failing test for click-to-toggle**

Add to `DesktopMenu.test.tsx`:

```tsx
import userEvent from "@testing-library/user-event";
```

```tsx
test("clicking the trigger opens the panel and makes its links reachable", async () => {
  const user = userEvent.setup();
  render(<DesktopMenu scrolled={false} />);

  const trigger = screen.getByRole("button", { name: "Otvoriť navigáciu" });
  await user.click(trigger);

  expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("link", { name: "Služby" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Cenník" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Tím" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Kontakt" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /0918 800 002/ })).toHaveAttribute(
    "href",
    "tel:+421918800002",
  );

  await user.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "false");
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npx vitest run components/hero/DesktopMenu.test.tsx`
Expected: FAIL — clicking does nothing yet, `aria-expanded` stays `"false"`.

- [ ] **Step 7: Add the click handler**

In `DesktopMenu.tsx`, add `onClick` to the trigger button:

```tsx
      <button
        type="button"
        aria-label="Otvoriť navigáciu"
        aria-expanded={open}
        aria-controls="desktop-menu-panel"
        className={styles.desktopMenuTrigger}
        onClick={() => setOpen((value) => !value)}
      >
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npx vitest run components/hero/DesktopMenu.test.tsx`
Expected: PASS

- [ ] **Step 9: Write the failing test for Escape and focus return**

Add to `DesktopMenu.test.tsx`:

```tsx
test("Escape closes the panel and returns focus to the trigger", async () => {
  const user = userEvent.setup();
  render(<DesktopMenu scrolled={false} />);

  const trigger = screen.getByRole("button", { name: "Otvoriť navigáciu" });
  await user.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "true");

  await user.keyboard("{Escape}");

  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(trigger).toHaveFocus();
});
```

- [ ] **Step 10: Run the test to verify it fails**

Run: `npx vitest run components/hero/DesktopMenu.test.tsx`
Expected: FAIL — Escape is not handled, `aria-expanded` stays `"true"`.

- [ ] **Step 11: Add a root ref and the Escape handler**

Replace the component body in `DesktopMenu.tsx` with:

```tsx
"use client";

/* eslint-disable jsx-a11y/anchor-is-valid -- Destinations stay as approved placeholders until their sections exist. */

import { useRef, useState, type JSX, type KeyboardEvent } from "react";
import { IconDental, IconMenuDeep } from "@tabler/icons-react";
import { navigationItems } from "./heroContent";
import styles from "./hero.module.css";

type DesktopMenuProps = Readonly<{
  scrolled: boolean;
}>;

export function DesktopMenu({ scrolled }: DesktopMenuProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = () => setOpen(false);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      close();
      triggerRef.current?.focus();
    }
  };

  return (
    <div
      className={[styles.desktopMenuRoot, scrolled ? styles.scrolled : ""]
        .filter(Boolean)
        .join(" ")}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label="Otvoriť navigáciu"
        aria-expanded={open}
        aria-controls="desktop-menu-panel"
        className={styles.desktopMenuTrigger}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.mobileMenuTooth} aria-hidden="true">
          <IconDental stroke={1.6} />
        </span>
        <span className={styles.mobileMenuDivider} aria-hidden="true" />
        <span className={styles.mobileMenuAction} aria-hidden="true">
          <IconMenuDeep stroke={1.7} />
          <span>Menu</span>
        </span>
      </button>

      <div id="desktop-menu-panel" className={styles.desktopMenuPanel} inert={!open}>
        <nav aria-label="Navigácia" className={styles.desktopMenuLinks}>
          {navigationItems.map((item, index) => (
            <a key={item.label} href={item.href} className={styles.desktopMenuLink}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.desktopMenuFooter}>
          <a className={styles.mobileMenuPhone} href="tel:+421918800002">
            <span>Objednajte sa</span>
            <strong>0918 800 002</strong>
          </a>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 12: Run the test to verify it passes**

Run: `npx vitest run components/hero/DesktopMenu.test.tsx`
Expected: PASS

- [ ] **Step 13: Write the failing test for hover-intent open and close delays**

Add to `DesktopMenu.test.tsx`, alongside a new fake-timers import:

```tsx
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { DesktopMenu } from "./DesktopMenu";

afterEach(() => {
  vi.useRealTimers();
});
```

```tsx
test("opens on hover after a short delay and closes after leaving", () => {
  vi.useFakeTimers();
  render(<DesktopMenu scrolled={false} />);

  const trigger = screen.getByRole("button", { name: "Otvoriť navigáciu" });
  fireEvent.mouseEnter(trigger.parentElement as Element);

  act(() => vi.advanceTimersByTime(60));
  expect(trigger).toHaveAttribute("aria-expanded", "false");

  act(() => vi.advanceTimersByTime(40));
  expect(trigger).toHaveAttribute("aria-expanded", "true");

  fireEvent.mouseLeave(trigger.parentElement as Element);

  act(() => vi.advanceTimersByTime(150));
  expect(trigger).toHaveAttribute("aria-expanded", "true");

  act(() => vi.advanceTimersByTime(80));
  expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("re-entering before the close delay elapses cancels the close", () => {
  vi.useFakeTimers();
  render(<DesktopMenu scrolled={false} />);

  const trigger = screen.getByRole("button", { name: "Otvoriť navigáciu" });
  const root = trigger.parentElement as Element;

  fireEvent.mouseEnter(root);
  act(() => vi.advanceTimersByTime(90));
  expect(trigger).toHaveAttribute("aria-expanded", "true");

  fireEvent.mouseLeave(root);
  act(() => vi.advanceTimersByTime(100));
  fireEvent.mouseEnter(root);
  act(() => vi.advanceTimersByTime(300));

  expect(trigger).toHaveAttribute("aria-expanded", "true");
});
```

- [ ] **Step 14: Run the tests to verify they fail**

Run: `npx vitest run components/hero/DesktopMenu.test.tsx`
Expected: FAIL — hover produces no state change yet.

- [ ] **Step 15: Add hover-intent timers**

Replace the component body in `DesktopMenu.tsx` with the version below. This adds `openTimer`/`closeTimer` refs, mouse handlers on the root, and a cleanup effect.

```tsx
"use client";

/* eslint-disable jsx-a11y/anchor-is-valid -- Destinations stay as approved placeholders until their sections exist. */

import { useEffect, useRef, useState, type JSX, type KeyboardEvent } from "react";
import { IconDental, IconMenuDeep } from "@tabler/icons-react";
import { navigationItems } from "./heroContent";
import styles from "./hero.module.css";

const openDelayMs = 90;
const closeDelayMs = 220;

type DesktopMenuProps = Readonly<{
  scrolled: boolean;
}>;

export function DesktopMenu({ scrolled }: DesktopMenuProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      clearTimeout(openTimer.current);
      clearTimeout(closeTimer.current);
    };
  }, []);

  const clearTimers = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  };

  const close = () => {
    clearTimers();
    setOpen(false);
  };

  const handleMouseEnter = () => {
    clearTimeout(closeTimer.current);
    if (open) return;
    openTimer.current = setTimeout(() => setOpen(true), openDelayMs);
  };

  const handleMouseLeave = () => {
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), closeDelayMs);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      close();
      triggerRef.current?.focus();
    }
  };

  return (
    <div
      className={[styles.desktopMenuRoot, scrolled ? styles.scrolled : ""]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label="Otvoriť navigáciu"
        aria-expanded={open}
        aria-controls="desktop-menu-panel"
        className={styles.desktopMenuTrigger}
        onClick={() => {
          clearTimers();
          setOpen((value) => !value);
        }}
      >
        <span className={styles.mobileMenuTooth} aria-hidden="true">
          <IconDental stroke={1.6} />
        </span>
        <span className={styles.mobileMenuDivider} aria-hidden="true" />
        <span className={styles.mobileMenuAction} aria-hidden="true">
          <IconMenuDeep stroke={1.7} />
          <span>Menu</span>
        </span>
      </button>

      <div id="desktop-menu-panel" className={styles.desktopMenuPanel} inert={!open}>
        <nav aria-label="Navigácia" className={styles.desktopMenuLinks}>
          {navigationItems.map((item, index) => (
            <a key={item.label} href={item.href} className={styles.desktopMenuLink}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.desktopMenuFooter}>
          <a className={styles.mobileMenuPhone} href="tel:+421918800002">
            <span>Objednajte sa</span>
            <strong>0918 800 002</strong>
          </a>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 16: Run the tests to verify they pass**

Run: `npx vitest run components/hero/DesktopMenu.test.tsx`
Expected: PASS

- [ ] **Step 17: Write the failing test for focus-in opening and blur-out closing**

Add to `DesktopMenu.test.tsx`:

```tsx
test("keyboard focus opens the panel; focus leaving the root closes it", async () => {
  const user = userEvent.setup();
  render(
    <div>
      <DesktopMenu scrolled={false} />
      <button type="button">Elsewhere</button>
    </div>,
  );

  await user.tab();
  const trigger = screen.getByRole("button", { name: "Otvoriť navigáciu" });
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveAttribute("aria-expanded", "true");

  await user.tab();
  await user.tab();
  await user.tab();
  await user.tab();
  await user.tab();

  expect(screen.getByRole("button", { name: "Elsewhere" })).toHaveFocus();
  expect(trigger).toHaveAttribute("aria-expanded", "false");
});
```

- [ ] **Step 18: Run the test to verify it fails**

Run: `npx vitest run components/hero/DesktopMenu.test.tsx`
Expected: FAIL — focusing the trigger does not open the panel yet.

- [ ] **Step 19: Add focus and blur handlers**

In `DesktopMenu.tsx`:

Add the import:

```tsx
import { useEffect, useRef, useState, type FocusEvent, type JSX, type KeyboardEvent } from "react";
```

Add handlers above `handleKeyDown`:

```tsx
  const rootRef = useRef<HTMLDivElement>(null);

  const handleFocus = () => {
    clearTimers();
    setOpen(true);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (rootRef.current?.contains(event.relatedTarget as Node | null)) return;
    close();
  };
```

Wire `rootRef`, `onFocus`, `onBlur` onto the root `div`:

```tsx
    <div
      ref={rootRef}
      className={[styles.desktopMenuRoot, scrolled ? styles.scrolled : ""]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
```

- [ ] **Step 20: Run the test to verify it passes**

Run: `npx vitest run components/hero/DesktopMenu.test.tsx`
Expected: PASS

- [ ] **Step 21: Run the whole file once and commit**

Run: `npx vitest run components/hero/DesktopMenu.test.tsx`
Expected: PASS — all 7 tests green.

```bash
git add components/hero/DesktopMenu.tsx components/hero/DesktopMenu.test.tsx components/hero/hero.module.css
git commit -m "feat: add DesktopMenu trigger and hover panel"
```

---

### Task 3: Wire `DesktopMenu` into `SiteHeader`

**Files:**
- Modify: `components/hero/SiteHeader.tsx`
- Modify: `components/hero/Hero.test.tsx:93-104`

- [ ] **Step 1: Update the `Hero.test.tsx` integration test first (RED)**

Replace the `"includes the signature mobile menu without removing desktop navigation"` test with:

```tsx
test("renders both navigation entry points alongside the tour button", () => {
  render(<SiteHeader />);

  expect(
    screen.getByRole("button", { name: "Otvoriť menu" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Otvoriť navigáciu" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /Interaktívna prehliadka klinikou/ }),
  ).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/hero/Hero.test.tsx`
Expected: FAIL — no element has the accessible name `"Otvoriť navigáciu"` yet; `SiteHeader` does not render `DesktopMenu`.

- [ ] **Step 3: Edit `SiteHeader.tsx`**

Change the imports:

```tsx
import { useEffect, useState, type JSX } from "react";
import { MobileMenu } from "./MobileMenu";
import { navigationItems } from "./heroContent";
import styles from "./hero.module.css";
```

to:

```tsx
import { useEffect, useState, type JSX } from "react";
import { DesktopMenu } from "./DesktopMenu";
import { MobileMenu } from "./MobileMenu";
import styles from "./hero.module.css";
```

Change the return statement from:

```tsx
  return (
    <nav
      aria-label="Hlavná navigácia"
      className={[
        styles.navigation,
        isScrolled ? styles.scrolled : "",
        mode === "light" ? styles.onLight : "",
        mode === "minimal" ? styles.onMinimal : "",
        onHero ? styles.onHero : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <a className={styles.logo} href="#">
        <img
          src="/media/dobes-logo-white.png"
          alt="Dental Centrum Dobeš"
          width="900"
          height="381"
        />
        <span className={styles.tagline}>
          Súkromná zubná klinika pri Kramároch v&nbsp;Bratislave
        </span>
      </a>

      <div className={styles.navigationRight}>
        <div className={styles.navigationLinks}>
          {navigationItems.map((item) => (
            <a href={item.href} key={item.label}>
              {item.label}
            </a>
          ))}
        </div>
        <a className={styles.navigationButton} href="#">
          <span className={styles.tourRing} aria-hidden="true" />
          Interaktívna prehliadka klinikou
        </a>
        <MobileMenu />
      </div>
    </nav>
  );
```

to:

```tsx
  return (
    <>
      <nav
        aria-label="Hlavná navigácia"
        className={[
          styles.navigation,
          isScrolled ? styles.scrolled : "",
          mode === "light" ? styles.onLight : "",
          mode === "minimal" ? styles.onMinimal : "",
          onHero ? styles.onHero : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <a className={styles.logo} href="#">
          <img
            src="/media/dobes-logo-white.png"
            alt="Dental Centrum Dobeš"
            width="900"
            height="381"
          />
          <span className={styles.tagline}>
            Súkromná zubná klinika pri Kramároch v&nbsp;Bratislave
          </span>
        </a>

        <div className={styles.navigationRight}>
          <a className={styles.navigationButton} href="#">
            <span className={styles.tourRing} aria-hidden="true" />
            Interaktívna prehliadka klinikou
          </a>
          <MobileMenu />
        </div>
      </nav>
      <DesktopMenu scrolled={isScrolled} />
    </>
  );
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/hero/Hero.test.tsx`
Expected: PASS

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: PASS — every test file green.

- [ ] **Step 6: Commit**

```bash
git add components/hero/SiteHeader.tsx components/hero/Hero.test.tsx
git commit -m "feat: wire DesktopMenu into SiteHeader, drop the flat link row"
```

---

### Task 4: Final CSS — positioning, hover treatment, panel styling

**Files:**
- Modify: `components/hero/hero.module.css`

Removes the now-dead `.navigationLinks` rules and replaces Task 2's placeholder `.desktopMenu*` block with the real styling.

- [ ] **Step 1: Delete the placeholder block from Task 2**

Delete the block appended in Task 2, Step 1:

```css
.desktopMenuRoot {
}

.desktopMenuTrigger {
}

.desktopMenuPanel {
}

.desktopMenuLinks {
}

.desktopMenuLink {
}

.desktopMenuFooter {
}
```

- [ ] **Step 2: Delete the five dead `.navigationLinks` rules**

Delete this block (around line 85):

```css
.navigationLinks {
  visibility: hidden;
  opacity: 0;
  transform: translateX(16px);
  transition:
    opacity 0.4s var(--ease),
    transform 0.5s var(--ease),
    visibility 0.4s var(--ease);
}
```

Delete this block (around line 95):

```css
.navigation.onLight .navigationLinks {
  visibility: visible;
  opacity: 1;
  transform: none;
}
```

Delete this block (around line 190):

```css
.navigationLinks {
  display: flex;
  gap: 30px;
  align-items: center;
}
```

Delete this block (around line 196):

```css
.navigationLinks a {
  color: rgb(255 255 255 / 82%);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-decoration: none;
  transition: color 0.2s var(--ease);
}
```

Delete this block (around line 205):

```css
.navigationLinks a:hover {
  color: #fff;
}
```

Inside the `@media (max-width: 960px)` block, delete just the `.navigationLinks` sub-rule, keeping its siblings:

```css
@media (max-width: 960px) {
  .navigationLinks {
    display: none;
  }

  .navigationButton {
    display: none;
  }

  .mobileMenuTrigger {
    display: flex;
  }
}
```

becomes:

```css
@media (max-width: 960px) {
  .navigationButton {
    display: none;
  }

  .mobileMenuTrigger {
    display: flex;
  }
}
```

- [ ] **Step 3: Add the real desktop menu rules**

Insert this block immediately after `.mobileMenuPhone strong { font-size: 17px; letter-spacing: 0.03em; }` and before `.visuallyHidden`:

```css
/*
 * The desktop trigger is the same Dental Menu Mark the phone renders,
 * fixed at the header's own top-right position but living outside
 * `<nav>` — `.navigation` hides itself with `visibility` between the
 * hero and the patients section, and a trigger nested inside it would
 * disappear right along with it. 34px / 24px reproduce where the tour
 * button already sits (26px or 16px of nav padding, plus the 8px
 * `.navigationRight` adds); confirm this in the browser once real
 * content is on screen rather than trusting the arithmetic.
 */
.desktopMenuRoot {
  position: fixed;
  z-index: 51;
  top: 34px;
  right: 44px;
  transition: top 0.3s var(--ease);
}

.desktopMenuRoot.scrolled {
  top: 24px;
}

@media (max-width: 960px) {
  .desktopMenuRoot {
    display: none;
  }
}

.desktopMenuTrigger {
  position: relative;
  display: flex;
  width: 86px;
  height: 50px;
  align-items: center;
  justify-content: center;
  padding: 0;
  overflow: visible;
  border: 1px solid rgb(250 249 246 / 24%);
  border-radius: 15px;
  background: rgb(28 28 31 / 78%);
  box-shadow:
    0 12px 34px rgb(0 0 0 / 24%),
    inset 0 1px 0 rgb(255 255 255 / 10%);
  color: var(--porcelain);
  cursor: pointer;
  isolation: isolate;
  backdrop-filter: blur(14px);
  transition:
    background 0.4s var(--ease),
    border-color 0.4s var(--ease),
    color 0.4s var(--ease);
}

.desktopMenuTrigger:focus-visible {
  outline: 2px solid var(--taupe);
  outline-offset: 4px;
}

/* Same fill-on-hover treatment as the tour button. */
.desktopMenuTrigger:hover,
.desktopMenuTrigger:focus-visible {
  background: var(--taupe);
  border-color: var(--taupe);
  color: var(--ink);
}

.desktopMenuTrigger:hover .mobileMenuAction span,
.desktopMenuTrigger:focus-visible .mobileMenuAction span {
  color: var(--ink);
}

.desktopMenuTrigger:hover .mobileMenuDivider,
.desktopMenuTrigger:focus-visible .mobileMenuDivider {
  background: rgb(28 28 31 / 30%);
}

.desktopMenuTrigger:hover .mobileMenuOrbit,
.desktopMenuTrigger:focus-visible .mobileMenuOrbit {
  opacity: 0;
}

/*
 * Anchored under the trigger by the root's own box (`position: fixed`
 * on `.desktopMenuRoot` makes it the containing block), not by a
 * second copy of the top offset.
 */
.desktopMenuPanel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 260px;
  padding: 18px 10px 14px;
  border: 1px solid rgb(174 155 126 / 32%);
  border-radius: 14px;
  background: rgb(28 28 31 / 96%);
  backdrop-filter: blur(16px);
  box-shadow: 0 24px 60px rgb(0 0 0 / 30%);
}

.desktopMenuLinks {
  display: flex;
  flex-direction: column;
}

.desktopMenuLink {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  color: rgb(250 249 246 / 88%);
  font-size: 19px;
  font-weight: 560;
  letter-spacing: -0.01em;
  text-decoration: none;
  transition:
    color 0.2s var(--ease),
    background 0.2s var(--ease);
}

.desktopMenuLink:hover,
.desktopMenuLink:focus-visible {
  background: rgb(174 155 126 / 14%);
  color: var(--porcelain);
}

.desktopMenuLink > span {
  flex: none;
  color: var(--taupe);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.desktopMenuFooter {
  margin-top: 14px;
  padding: 14px 10px 0;
  border-top: 1px solid rgb(255 255 255 / 10%);
}
```

- [ ] **Step 4: Add `prefers-reduced-motion` coverage for the scroll-follow transition**

In the existing `@media (prefers-reduced-motion: reduce)` block, change:

```css
@media (prefers-reduced-motion: reduce) {
  .navigation,
  .navigationLinks a,
  .navigationButton,
```

to:

```css
@media (prefers-reduced-motion: reduce) {
  .navigation,
  .desktopMenuRoot,
  .navigationButton,
```

- [ ] **Step 5: Run the full test suite, lint, and typecheck**

Run: `npm test && npm run lint && npm run typecheck`
Expected: PASS on all three.

- [ ] **Step 6: Commit**

```bash
git add components/hero/hero.module.css
git commit -m "style: position and style the desktop menu trigger and panel"
```

---

### Task 5: Add the panel's open/close motion

**Files:**
- Modify: `components/hero/DesktopMenu.tsx`

Task 2 built the panel without animation so its tests could focus on state and interaction. This task adds the `motion`-driven transform, matching `MobileMenu`'s existing `premiumEase` and stagger conventions, plus `prefers-reduced-motion` handling. No new test: RTL/jsdom does not compute animated style values, and the existing codebase (`MobileMenu.test.tsx`) does not test this either — Task 6's browser pass verifies it visually.

- [ ] **Step 1: Replace `DesktopMenu.tsx` with the animated version**

```tsx
"use client";

/* eslint-disable jsx-a11y/anchor-is-valid -- Destinations stay as approved placeholders until their sections exist. */

import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type JSX,
  type KeyboardEvent,
} from "react";
import { IconDental, IconMenuDeep } from "@tabler/icons-react";
import { motion, useReducedMotion } from "motion/react";
import { navigationItems } from "./heroContent";
import styles from "./hero.module.css";

const premiumEase = [0.22, 1, 0.36, 1] as const;
const openDelayMs = 90;
const closeDelayMs = 220;

type DesktopMenuProps = Readonly<{
  scrolled: boolean;
}>;

export function DesktopMenu({ scrolled }: DesktopMenuProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      clearTimeout(openTimer.current);
      clearTimeout(closeTimer.current);
    };
  }, []);

  const clearTimers = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  };

  const close = () => {
    clearTimers();
    setOpen(false);
  };

  const handleMouseEnter = () => {
    clearTimeout(closeTimer.current);
    if (open) return;
    openTimer.current = setTimeout(() => setOpen(true), openDelayMs);
  };

  const handleMouseLeave = () => {
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), closeDelayMs);
  };

  const handleFocus = () => {
    clearTimers();
    setOpen(true);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (rootRef.current?.contains(event.relatedTarget as Node | null)) return;
    close();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      close();
      triggerRef.current?.focus();
    }
  };

  return (
    <div
      ref={rootRef}
      className={[styles.desktopMenuRoot, scrolled ? styles.scrolled : ""]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label="Otvoriť navigáciu"
        aria-expanded={open}
        aria-controls="desktop-menu-panel"
        className={styles.desktopMenuTrigger}
        onClick={() => {
          clearTimers();
          setOpen((value) => !value);
        }}
      >
        <span className={styles.mobileMenuTooth} aria-hidden="true">
          <IconDental stroke={1.6} />
        </span>
        <span className={styles.mobileMenuDivider} aria-hidden="true" />
        <span className={styles.mobileMenuAction} aria-hidden="true">
          <IconMenuDeep stroke={1.7} />
          <span>Menu</span>
        </span>
      </button>

      <motion.div
        id="desktop-menu-panel"
        className={styles.desktopMenuPanel}
        style={{ pointerEvents: open ? "auto" : "none" }}
        inert={!open}
        initial={false}
        animate={
          prefersReducedMotion
            ? { opacity: open ? 1 : 0 }
            : {
                opacity: open ? 1 : 0,
                y: open ? 0 : -10,
                scale: open ? 1 : 0.97,
              }
        }
        transition={{
          duration: prefersReducedMotion ? 0 : 0.38,
          ease: premiumEase,
        }}
      >
        <motion.nav
          aria-label="Navigácia"
          className={styles.desktopMenuLinks}
          initial={false}
          animate={open ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: {
              transition: {
                delayChildren: prefersReducedMotion ? 0 : 0.06,
                staggerChildren: prefersReducedMotion ? 0 : 0.06,
              },
            },
          }}
        >
          {navigationItems.map((item, index) => (
            <motion.a
              key={item.label}
              href={item.href}
              className={styles.desktopMenuLink}
              variants={{
                hidden: { opacity: 0, x: prefersReducedMotion ? 0 : 16 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.42,
                ease: premiumEase,
              }}
            >
              <span aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.label}
            </motion.a>
          ))}
        </motion.nav>

        <div className={styles.desktopMenuFooter}>
          <a className={styles.mobileMenuPhone} href="tel:+421918800002">
            <span>Objednajte sa</span>
            <strong>0918 800 002</strong>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: PASS — Task 2's tests still pass; `motion.div`/`motion.a` render the same underlying `<div>`/`<a>` elements and forward `inert`, `aria-*`, and event props unchanged.

- [ ] **Step 3: Commit**

```bash
git add components/hero/DesktopMenu.tsx
git commit -m "feat: animate the desktop menu panel open and closed"
```

---

### Task 6: Browser verification

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Open: `http://localhost:3000`

- [ ] **Step 2: Measure trigger/tour-button alignment, unscrolled**

In the browser devtools console:

```js
const trigger = document.querySelector('[aria-label="Otvoriť navigáciu"]');
const tour = document.querySelector('a[href="#"].navigationButton, a[class*="navigationButton"]');
console.log(trigger.getBoundingClientRect().top, tour.getBoundingClientRect().top);
```

Expected: both values within 2px of each other. If not, adjust `.desktopMenuRoot { top: ... }` in `hero.module.css` by the observed difference and re-check.

- [ ] **Step 3: Scroll to the `.scrolled` state and repeat the measurement**

Scroll down 100px, re-run the same console snippet.
Expected: both values within 2px of each other, both shifted up from Step 2 by the same amount.

- [ ] **Step 4: Confirm the trigger survives the hidden-header sections**

Scroll to roughly the middle of the page (well past the hero, before the patients section — the clinic story / jaw sequence).
Expected: the header bar itself is invisible, but the trigger capsule is still visible at the top-right.

- [ ] **Step 5: Exercise hover, click, and keyboard**

- Hover the trigger, hold still: panel opens after a brief pause (not instantly).
- Move the cursor from the trigger down into the panel without leaving the hover region: panel stays open.
- Move the cursor away from both: panel closes after a brief pause.
- Click the trigger: panel opens/closes immediately, no delay.
- Tab to the trigger from the address bar: panel opens; press Escape: panel closes and focus stays on the trigger; keep tabbing through: focus reaches all four links and the phone number, then leaves the panel and the panel closes.

Expected: all of the above match, with no console errors (check via devtools Console tab).

- [ ] **Step 6: Repeat Steps 2–5 at 1280×800 and 1024×768**

Expected: same results, no horizontal overflow, panel never clips outside the viewport's right edge.

- [ ] **Step 7: Confirm the phone experience is untouched**

Resize to 390×844.
Expected: no desktop trigger anywhere on the page; the existing hamburger capsule (`aria-label="Otvoriť menu"`) opens the full-screen dialog exactly as before, including all four links.

- [ ] **Step 8: Record the result**

Note the tested viewport sizes and outcome for the `COLLAB.md` update in Task 7.

---

### Task 7: Final verification and handoff record

**Files:**
- Modify: `COLLAB.md`

- [ ] **Step 1: Run the complete verification set**

```bash
npm test
npm run lint
npm run typecheck
npm run build
git diff --check
```

Expected: PASS on every command.

- [ ] **Step 2: Scan changed files for credentials**

```bash
git diff origin/main --name-only | xargs grep -InE "(api[_-]?key|secret|password|token)\s*[:=]\s*['\"][^'\"]+['\"]" || echo "no matches"
```

Expected: `no matches`.

- [ ] **Step 3: Update `COLLAB.md`**

In `## File Reservations`, add a line noting the two touched test files that were not in the original reservation, and record what changed:

```markdown
- The desktop hover menu work also touched `components/hero/Hero.test.tsx`
  (the `<SiteHeader />` integration test) and `components/hero/MobileMenu.test.tsx`
  (dropped the `Ambulancia` assertion) — direct fallout of the shared
  `navigationItems` change, not scope creep.
```

Add a dated entry to the task log recording the completed work, the verification that passed, and the tested viewport sizes from Task 6, Step 8.

- [ ] **Step 4: Commit**

```bash
git add COLLAB.md
git commit -m "docs: record desktop hover menu verification in COLLAB.md"
```

- [ ] **Step 5: Stop — do not push or open a PR**

Per the spec's Delivery section and the project's `AI_WORKFLOW.md`: this branch (`claude/desktop-hover-menu`) stays local until the user reviews the result at `localhost` and explicitly approves it. Report completion and wait.

---

## Self-Review Notes

- **Spec coverage:** trigger visual/position (Task 4), panel geometry/motion (Task 4 + 5), hover-intent timing (Task 2), click + keyboard + blur (Task 2), reduced motion (Task 5), scope removals — Ambulancia and the flat row (Task 1, 3, 4), component boundary as a `<nav>` sibling (Task 3), shared `heroContent.ts` (Task 1), verification matrix (Task 6, 7). No spec section is without a task.
- **Placeholder scan:** the only literal "placeholder" content is the pre-existing `href="#"` convention the spec explicitly keeps; no TBD/TODO remains in any step.
- **Type consistency:** `DesktopMenuProps.scrolled` (Task 2) is threaded through unchanged to `SiteHeader`'s `isScrolled` (Task 3); `styles.desktopMenu*` class names introduced in Task 2's placeholder block match Task 4's real block and Task 5's final component exactly.
