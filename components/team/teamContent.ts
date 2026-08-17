/**
 * Content for the Tím page.
 *
 * Every name and every role below is the clinic's own, taken from the roster
 * the user supplied on 2026-08-14 and cross-checked against the team page of
 * their previous site (bratislavazubar.sk/nas-team). The two sources agree
 * exactly, including which people carry a stated role and which do not.
 *
 * ⚠️ `role` is optional on purpose. Seven of the eleven are published by the
 * clinic itself with a degree and no role — only the four nurses have one. A
 * role is a claim about a real person's qualifications, so an absent one is
 * rendered as absent rather than guessed from the title. When the clinic
 * supplies the missing seven, add them here; nothing else has to change.
 *
 * The pairing order is theirs too. Their old page reads down two columns —
 * the dentists and the hygienist on the left, the nurses on the right — and
 * keeping that order keeps our grid recognisable to anyone who knew the old
 * site.
 */

export type TeamMember = {
  /** Matches the portrait folder and the encoded file in `public/media/tim`. */
  readonly slug: string;
  readonly name: string;
  /** Only where the clinic states one. Never inferred from a degree. */
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
  { slug: "dobes", name: "MUDr. Ján Dobeš" },
  { slug: "lattova", name: "Zuzana Lattová", role: "Zdravotná sestra" },
  { slug: "dobesova", name: "MUDr. Mária Dobešová" },
  { slug: "makaiova", name: "Lucia Makaiová", role: "Zdravotná sestra" },
  { slug: "kunova", name: "MDDr. Alexandra Kunová" },
  { slug: "ozvaldova", name: "Mgr. Jana Ožvaldová", role: "Zdravotná sestra" },
  {
    slug: "novotnakova",
    name: "MUDr. Daniela Novotňáková, PhD., MPH, MBA, LL.M.",
  },
  { slug: "izova", name: "Svetlana Ižová", role: "Zdravotná sestra" },
  { slug: "petschuchova", name: "Tamara Petschuchová, Dipl. DH." },
  { slug: "vankova", name: "Bc. Janka Vaňková" },
  { slug: "volny", name: "Ing. Babula Voľný" },
] as const;
