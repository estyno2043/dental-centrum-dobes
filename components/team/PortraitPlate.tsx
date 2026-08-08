import type { JSX } from "react";
import type { TeamMember } from "./teamContent";
import styles from "./team.module.css";

/**
 * Renders a member's portrait, or a designed plate when no photograph exists.
 *
 * The clinic's photography is still outstanding, and an empty frame would make
 * a finished layout look broken. The plate is drawn from the brand's own parts
 * — the outline tooth, the taupe wash, the monogram — so the page reads as
 * deliberate until real portraits replace it. Swapping in a photo is one field
 * on the member: `portrait`.
 */
export function PortraitPlate({
  member,
  eager = false,
}: {
  member: TeamMember;
  eager?: boolean;
}): JSX.Element {
  if (member.portrait) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Portraits are pre-cropped static assets; the image service adds nothing here.
      <img
        className={styles.portraitImage}
        src={member.portrait}
        alt={`${member.name} — ${member.role}`}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  return (
    <div className={styles.portraitPlate} role="img" aria-label={`${member.name} — portrét zatiaľ nie je k dispozícii`}>
      <svg
        className={styles.portraitTooth}
        viewBox="0 0 100 120"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M50 8c14 0 26 7 26 22 0 12-4 18-6 30-2 11-2 26-6 40-2 7-8 10-12 6-3-3-3-14-4-22-1-6-5-6-6 0-1 8-1 19-4 22-4 4-10 1-12-6-4-14-4-29-6-40-2-12-6-18-6-30C14 15 36 8 50 8Z"
          stroke="currentColor"
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className={styles.portraitMonogram} aria-hidden="true">
        {member.initials}
      </span>
    </div>
  );
}
