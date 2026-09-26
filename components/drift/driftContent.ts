/**
 * The drifting-photograph scene.
 *
 * Each card crosses the pinned frame once. `in` is where in the section's
 * scroll it starts, `span` how much of that scroll it takes, and the two
 * coordinate pairs are where it enters from and leaves towards, in percent of
 * the frame — so a card at `from: [-40, 20]` slides in from off the left edge
 * and drifts up and right.
 *
 * Ranges deliberately overlap: two or three cards should be on screen at once,
 * or the frame keeps emptying out and the section reads as a slideshow rather
 * than a current passing through it.
 */

export type DriftCard = {
  readonly src: string;
  readonly alt: string;
  /** Fraction of the section's scroll where the card begins to appear. */
  readonly in: number;
  readonly span: number;
  /** Entry offset, in percent of the frame. */
  readonly from: readonly [number, number];
  /** Exit offset, in percent of the frame. */
  readonly to: readonly [number, number];
  /** Resting position of the card's centre, in percent of the frame. */
  readonly at: readonly [number, number];
  /** Width as a percentage of the frame. */
  readonly width: number;
};

export const driftIntro = {
  eyebrow: "Ako to u nás vyzerá",
  headline: "Aby ste sa cítili dobre v každom kroku.",
} as const;

/*
 * Timings retuned 2026-09-26 after the audit found a full empty screen at
 * each end of this scene: the first card entered only after the section had
 * pinned and the last had faded before it let go, so the approach and the
 * exit were a screen of bare ground each. The first two now start before
 * the pin (negative `in`, so they are already in the air as the section
 * scrolls up), and the last two are still visible when it releases.
 */
export const driftCards: readonly DriftCard[] = [
  {
    src: "/media/drift-01.jpg",
    alt: "Kolegyne v ordinácii",
    in: -0.14,
    span: 0.34,
    from: [-30, 14],
    to: [10, -18],
    at: [22, 30],
    width: 26,
  },
  {
    // Was the panoramic scan until that photograph moved into the gallery —
    // the same shot in both places reads as an oversight.
    src: "/media/drift-03.jpg",
    alt: "Čakáreň",
    in: -0.06,
    span: 0.32,
    from: [26, 26],
    to: [-8, -22],
    at: [74, 34],
    width: 17,
  },
  {
    src: "/media/drift-05.jpg",
    alt: "Ošetrenie pacienta",
    in: 0.12,
    span: 0.34,
    from: [-24, 20],
    to: [12, -20],
    at: [30, 68],
    width: 18,
  },
  {
    src: "/media/drift-02.jpg",
    alt: "Lekárka v ordinácii",
    in: 0.24,
    span: 0.32,
    from: [28, 18],
    to: [-10, -20],
    at: [70, 66],
    width: 24,
  },
  {
    src: "/media/drift-04.jpg",
    alt: "Práca pod mikroskopom",
    in: 0.38,
    span: 0.32,
    from: [-26, -16],
    to: [10, 22],
    at: [24, 40],
    width: 17,
  },
  {
    src: "/media/drift-07.jpg",
    alt: "Nástroje pripravené na zákrok",
    in: 0.5,
    span: 0.32,
    from: [24, 22],
    to: [-8, -20],
    at: [76, 56],
    width: 16,
  },
  {
    src: "/media/drift-06.jpg",
    alt: "Model chrupu",
    in: 0.62,
    span: 0.4,
    from: [-22, 18],
    to: [14, -16],
    at: [34, 74],
    width: 22,
  },
  {
    src: "/media/drift-08.jpg",
    alt: "Lekár s pacientom",
    in: 0.7,
    span: 0.45,
    from: [26, -14],
    to: [-10, 20],
    at: [68, 28],
    width: 25,
  },
] as const;
