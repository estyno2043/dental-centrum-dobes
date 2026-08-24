/**
 * The services.
 *
 * Five carry a photograph and five do not, which is the split the reference
 * site uses and it earns its keep: the five with images are the ones the
 * clinic wants to be known for, and giving the rest the same weight would
 * flatten that into a catalogue.
 *
 * The order of the five is a patient's own order — arrive and be examined,
 * get clean, get the front teeth right, replace what is missing, save what
 * hurts. It is not a ranking by price.
 *
 * All ten come from the clinic's own list on bratislavazubar.sk, with
 * parodontológia added at the user's request. Several of their entries are
 * folded together here: the entry and preventive check-ups into one, ceramic
 * crowns and whitening into the aesthetic service, and the two prosthetics
 * pages into one.
 *
 * ⚠️ Every `lead` below describes what the clinic already says it does. No
 * price, no duration and no clinical promise is stated anywhere in this file —
 * those have to come from the clinic before a service page can carry them.
 */

export type Service = {
  readonly slug: string;
  readonly name: string;
  /** One line, patient language, no claim the clinic has not made itself. */
  readonly lead: string;
  /** Present only on the five that lead the section. */
  readonly image?: string;
};

export const servicesIntro = {
  eyebrow: "Služby",
  headline: "Od prvej prehliadky po zub, ktorý nikto nespozná.",
  lead:
    "Päť vecí, ktoré robíme najčastejšie, a päť ďalších, ktoré k nim patria. " +
    "Ak neviete, do ktorej kolónky patríte, začnite vstupnou prehliadkou — " +
    "od nej sa odvíja všetko ostatné.",
} as const;

/** The five with photography. Order is the patient's journey. */
export const featuredServices: readonly Service[] = [
  {
    slug: "vstupna-prehliadka",
    name: "Vstupná prehliadka a 3D diagnostika",
    lead:
      "Panoramatický snímok aj CT, aby sme videli okolozubné štruktúry skôr, " +
      "než sa čohokoľvek dotkneme.",
    image: "diagnostika",
  },
  {
    slug: "dentalna-hygiena",
    name: "Dentálna hygiena GBT",
    lead:
      "Guided Biofilm Therapy na AIR FLOW: biofilm sa najprv zafarbí, aby bolo " +
      "vidieť, čo sa odstraňuje, a čo doma unikalo.",
    image: "hygiena",
  },
  {
    slug: "esteticka-stomatologia",
    name: "Estetická stomatológia",
    lead:
      "Fazety, keramické korunky a bielenie — tvar a farba predných zubov, " +
      "ktoré vydržia aj zblízka.",
    image: "estetika",
  },
  {
    slug: "zubne-implantaty",
    name: "Zubné implantáty",
    lead:
      "Implantáty Osstem plánované z 3D snímku, aby náhrada sadla tam, kde má, " +
      "a držala ako vlastný zub.",
    image: "implantaty",
  },
  {
    slug: "endodoncia",
    name: "Endodoncia pod mikroskopom",
    lead:
      "Pri 25-násobnom zväčšení vieme prerobiť zle ošetrené kanáliky aj vybrať " +
      "zalomený nástroj — a zachrániť zub, ktorý inde končí v kliešťach.",
    image: "endodoncia",
  },
] as const;

/** The five without. Same routes, less shouting. */
export const furtherServices: readonly Service[] = [
  {
    slug: "parodontologia",
    name: "Parodontológia",
    lead: "Keď ďasná krvácajú, ustupujú alebo sa uvoľňuje zub.",
  },
  {
    slug: "osetrenie-deti",
    name: "Ošetrenie detí",
    lead: "Od troch rokov, formou rozprávky a bez toho, aby dieťa spoznalo bolesť.",
  },
  {
    slug: "stomatochirurgia",
    name: "Stomatochirurgia",
    lead: "Extrakcie a chirurgické zákroky vrátane zubov múdrosti.",
  },
  {
    slug: "protetika",
    name: "Protetika: mostíky a protézy",
    lead: "Fixné mostíky aj snímateľné náhrady robené na mieru.",
  },
  {
    slug: "biele-vyplne",
    name: "Biele výplne",
    lead: "Kompozitné plomby, ktoré od zuba nerozoznáte.",
  },
] as const;

export const allServices: readonly Service[] = [
  ...featuredServices,
  ...furtherServices,
];

export function getServiceBySlug(slug: string): Service | undefined {
  return allServices.find((service) => service.slug === slug);
}
