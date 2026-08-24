/**
 * Content for the Tím page.
 *
 * Every name and every role below is the clinic's own. The names came from the
 * roster the user supplied on 2026-08-14 and match the team page of their
 * previous site (bratislavazubar.sk/nas-team) exactly. That site stated a role
 * for the four nurses and nobody else; the remaining seven were supplied by
 * the user on 2026-08-18 and are recorded here verbatim.
 *
 * ⚠️ Nothing here is inferred. A role is a claim about a real person's
 * qualifications, and two of them cut against what their degrees suggest —
 * Petschuchová carries `Dipl. DH.` but is a nurse, and Vaňková is the
 * hygienist. That is the clinic's own answer and it overrides the titles.
 *
 * `role` stays optional so an unanswered one renders as absent rather than as
 * a guess, and a test fails if anyone gives it a fallback string.
 *
 * The order is the clinic's own too. Their old page reads down two columns and
 * keeping that order keeps our grid recognisable to anyone who knew the old
 * site.
 */

export type TeamMember = {
  /** Matches the portrait folder and the encoded file in `public/media/tim`. */
  readonly slug: string;
  readonly name: string;
  /** As the clinic states it. Never inferred from a degree. */
  readonly role?: string;
};

export const teamIntro = {
  eyebrow: "Tím",
  headline: "Za každým úsmevom stojí celý tím.",
  lead:
    "Jedenásť ľudí, ktorí sa o vás starajú od prvého telefonátu až po kontrolu " +
    "po ošetrení. Poznáte ich po mene ešte predtým, než si sadnete do kresla.",
} as const;

export const teamMembers: readonly TeamMember[] = [
  { slug: "dobes", name: "MUDr. Ján Dobeš", role: "Hlava kliniky, zubár" },
  { slug: "lattova", name: "Zuzana Lattová", role: "Zdravotná sestra" },
  { slug: "dobesova", name: "MUDr. Mária Dobešová", role: "Zubár" },
  { slug: "makaiova", name: "Lucia Makaiová", role: "Zdravotná sestra" },
  { slug: "kunova", name: "MDDr. Alexandra Kunová", role: "Zubár" },
  { slug: "ozvaldova", name: "Mgr. Jana Ožvaldová", role: "Zdravotná sestra" },
  {
    slug: "novotnakova",
    name: "MUDr. Daniela Novotňáková, PhD., MPH, MBA, LL.M.",
    role: "Zubár",
  },
  { slug: "izova", name: "Svetlana Ižová", role: "Zdravotná sestra" },
  // Swapped with Petschuchová on 2026-08-18 at the user's request, so the
  // hygienist takes the left column and the nurse the right.
  {
    slug: "vankova",
    name: "Bc. Janka Vaňková",
    role: "Dentálna hygienička, hlava sociálnych sietí",
  },
  {
    slug: "petschuchova",
    name: "Tamara Petschuchová, Dipl. DH.",
    role: "Zdravotná sestra",
  },
  { slug: "volny", name: "Ing. Babula Voľný", role: "Recepcia, manažment" },
] as const;
