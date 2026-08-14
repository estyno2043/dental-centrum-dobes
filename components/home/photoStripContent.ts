/**
 * Frames in the horizontal strip.
 *
 * `ratio` is each frame's aspect ratio and drives its width, since the strip
 * is a fixed height and every frame is as wide as its ratio makes it. Each one
 * matches its photograph's own proportions, so nothing is cropped — and
 * because the shoot alternates portrait and landscape, the strip gets its
 * uneven rhythm for free. A row of identical panels reads as a table.
 *
 * Order is the reading order: the brand wall, then through the clinic, then
 * the people, then the close detail. `detail` must stay **last** — `ClinicStory`
 * zooms the final frame into the jaw sequence and references that asset by
 * name in its handoff `<picture>`.
 *
 * `label` becomes the alt text, so keep it describing what is actually shown.
 * A frame with no `src` falls back to a numbered placeholder.
 */

export type PhotoFrame = {
  readonly id: string;
  readonly label: string;
  readonly ratio: number;
  readonly src?: string;
};

export const photoStripIntro = {
  eyebrow: "Ambulancia",
  headline: "Miesto, kde sa nikto neponáhľa.",
} as const;

export const photoFrames: readonly PhotoFrame[] = [
  {
    id: "recepcia",
    label: "Recepcia",
    ratio: 2 / 3,
    src: "/media/strip-01-recepcia.jpg",
  },
  {
    id: "chodba",
    label: "Chodba ku ordináciám",
    ratio: 3 / 2,
    src: "/media/strip-02-chodba.jpg",
  },
  {
    id: "mikroskop-praca",
    label: "Ošetrenie pod mikroskopom",
    ratio: 3 / 2,
    src: "/media/strip-03-mikroskop-praca.jpg",
  },
  {
    id: "mikroskop",
    label: "Operačný mikroskop",
    ratio: 3 / 2,
    src: "/media/strip-04-mikroskop.jpg",
  },
  {
    id: "ordinacia",
    label: "Ordinácia",
    ratio: 2 / 3,
    src: "/media/strip-05-ordinacia.jpg",
  },
  {
    id: "diagnostika",
    label: "Diagnostika",
    ratio: 3 / 2,
    src: "/media/strip-06-diagnostika.jpg",
  },
  {
    id: "tim",
    label: "Náš tím",
    ratio: 3 / 2,
    src: "/media/strip-tim.jpg",
  },
  // Stays last: ClinicStory hands this frame off into the jaw sequence.
  {
    id: "detail",
    label: "Detail ordinácie",
    ratio: 3 / 2,
    src: "/media/strip-07-detail.jpg",
  },
] as const;
