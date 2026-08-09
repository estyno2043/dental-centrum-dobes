/**
 * Frames in the horizontal strip.
 *
 * Photography has not been supplied yet, so every frame renders as a numbered
 * placeholder. `src` is the only field that needs filling in — add a path and
 * that frame becomes a photograph, with nothing else to change.
 *
 * `ratio` is the frame's aspect ratio and drives its width, since the strip is
 * a fixed height and each frame is as wide as its ratio makes it. The mix of
 * wide and narrow frames is deliberate: a strip of identical panels reads as a
 * table, not a filmstrip.
 *
 * `label` is what the placeholder shows and what the alt text will be built
 * from — keep it describing the shot that belongs there.
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
  { id: "recepcia", label: "Recepcia", ratio: 16 / 10 },
  { id: "cakaren", label: "Čakáreň", ratio: 3 / 4 },
  { id: "ordinacia", label: "Ordinácia", ratio: 16 / 9 },
  { id: "mikroskop", label: "Mikroskop", ratio: 4 / 5 },
  { id: "chodba", label: "Chodba", ratio: 3 / 2 },
  { id: "sterilizacia", label: "Sterilizácia", ratio: 1 },
  // Ratio matches the photograph's own 3:2 so nothing is cropped away.
  {
    id: "detail",
    label: "Detail ordinácie",
    ratio: 3 / 2,
    src: "/media/strip-07-detail.jpg",
  },
] as const;
