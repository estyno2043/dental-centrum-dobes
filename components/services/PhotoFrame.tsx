import type { JSX } from "react";
import { IconCamera } from "@tabler/icons-react";

import styles from "./photoFrame.module.css";

/**
 * A place a photograph will go, holding its own space until it arrives.
 *
 * Not a grey box. It states what should be shot and at what shape, because the
 * person who has to take these photographs is the one who will read it — and a
 * placeholder that only says "image" makes them come back and ask.
 *
 * Reserving the real aspect ratio is the point: the page can be judged for
 * rhythm now and will not reflow when the files land. Anything using this is
 * unfinished by definition, so it looks unfinished — a placeholder that blends
 * in is one nobody replaces.
 */
export function PhotoFrame({
  brief,
  ratio = "4 / 3",
}: {
  /** What to photograph, in the words the photographer needs. */
  readonly brief: string;
  /** CSS `aspect-ratio`. Reserve the shape the final image will have. */
  readonly ratio?: string;
}): JSX.Element {
  return (
    <figure className={styles.frame} style={{ aspectRatio: ratio }}>
      <IconCamera aria-hidden="true" size={22} stroke={1.4} />
      <figcaption className={styles.brief}>
        <span className={styles.tag}>Miesto pre fotku</span>
        {brief}
      </figcaption>
    </figure>
  );
}
