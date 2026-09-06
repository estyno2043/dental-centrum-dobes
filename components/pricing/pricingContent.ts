/**
 * The clinic's price list, as published.
 *
 * Transcribed from `Cennik_Dental_Centrum_Dobes_Vlarska.pdf`, valid from
 * 1 March 2026, on 2026-08-29. 248 entries across 28 groups. Nothing here is
 * estimated: a price a clinic publishes is a commitment, and a number invented
 * on its behalf is one it has to honour or explain.
 *
 * Three decisions were made in the transcription, all of them visible here so
 * they can be argued with:
 *
 *   Codes are gone. `1/D01`, `170/` and the rest are for billing and say
 *   nothing to the person reading. They are also the only thing that made the
 *   duplicates below legible.
 *
 *   One label at several prices became a span. The source lists "Fotokompozit
 *   – jedna plôška" three times, under three codes, at 105, 95 and 80 €.
 *   Internally that is three different procedures; on a public page it reads
 *   as three contradictory answers to one question. A patient cannot choose a
 *   code, so what they are told is the range it can land in — `80 – 105 €`.
 *   ⚠️ The clinic should confirm each span, or give the labels the words that
 *   tell them apart. Six entries are affected.
 *
 *   `Neúčtovaný výkon` is dropped — an internal accounting row with no price
 *   and no meaning outside the practice software.
 *
 * `price: null` means the source states none. `Podľa rozsahu` is the source's
 * own PRC, and renders as something to ask about rather than as a number.
 */

export type PriceEntry = {
  readonly label: string;
  /** As published. `null` where the source gives none. */
  readonly price: string | null;
};

export type PriceGroup = {
  /** `vykony` are treatments, `produkty` the shop. Two different questions. */
  readonly part: "vykony" | "produkty";
  readonly slug: string;
  readonly name: string;
  readonly entries: readonly PriceEntry[];
};

export const priceValidFrom = "1. 3. 2026";

export const priceGroups: readonly PriceGroup[] = [
  {
    part: "vykony",
    slug: "vysetrenia-a-konzultacie",
    name: "Vyšetrenia a konzultácie",
    entries: [
      { label: "Komplexné stomatologické vyšetrenie", price: "40 €" },
      { label: "Preventívna stomatologická prehliadka", price: "30 €" },
      { label: "Cielené stomatologické vyšetrenie", price: "25 €" },
      { label: "Akútne vyšetrenie", price: "50 €" },
      { label: "Konzultácia", price: "30 €" },
      { label: "Konzultácia s návrhom liečby", price: "50 €" },
      { label: "Nedodržaný termín", price: "50 €" },
      { label: "Vitalita zuba", price: "5 €" },
    ],
  },
  {
    part: "vykony",
    slug: "rtg-a-zobrazovacie-vysetrenia",
    name: "RTG a zobrazovacie vyšetrenia",
    entries: [
      { label: "RTG snímka intraorálna zubov a ústnych tkanív", price: "10 €" },
      { label: "CT", price: "130 €" },
      { label: "CT výsek", price: "55 €" },
      { label: "Panoramatický snímok", price: "25 €" },
      { label: "Panoramatický snímok výsek", price: "25 €" },
      { label: "Analýza 3D RTG", price: "20 €" },
    ],
  },
  {
    part: "vykony",
    slug: "anestezia-a-izolacia",
    name: "Anestézia a izolácia",
    entries: [
      { label: "Injekčná anestézia", price: "15 €" },
      { label: "Intraligamentárna anestéza", price: "15 €" },
      { label: "Mandibulárna anestéza", price: "20 €" },
      { label: "Koferdam", price: "15 €" },
      { label: "Koferdam nad 3 zuby", price: "20 €" },
      { label: "Koferdam s ligatúrami", price: "25 €" },
      { label: "Optragate", price: "5 €" },
    ],
  },
  {
    part: "vykony",
    slug: "prevencia-a-dentalna-hygiena",
    name: "Prevencia a dentálna hygiena",
    entries: [
      { label: "Odber materiálu na laboratórne vyšetrenie", price: "145 €" },
      { label: "Pečatenie", price: "30 €" },
      { label: "Otvorené pečatenie", price: "50 €" },
      { label: "Vardis – ošetrenie demineralizačných lézií, 1 balenie", price: "65 €" },
      { label: "Vardis – každá ďalšia lézia", price: "35 €" },
      { label: "Vardis – domáca aplikácia", price: "14 €" },
      { label: "Pečatenie krčka S&P", price: "15 €" },
      { label: "Impregnácia krčka", price: "15 €" },
      { label: "Odstránenie zubného povlaku alebo kameňa", price: "90 – 100 €" },
      { label: "Odstránenie zubného povlaku alebo kameňa – dieťa", price: "75 €" },
      { label: "FMD – full mouth dezinfection", price: "115 €" },
      { label: "Air flow – 1 zuboradie", price: "50 €" },
      { label: "Polishing – 1 zuboradie", price: "40 €" },
      { label: "Inštruktáž, nácvik ústnej hygieny a lokálna fluoridácia", price: "20 €" },
      { label: "Fluoridácia lakom", price: "30 €" },
    ],
  },
  {
    part: "vykony",
    slug: "parodontologia",
    name: "Parodontológia",
    entries: [
      { label: "Komplexné parodontologické vyšetrenie", price: "50 €" },
      { label: "Odstránenie lokálneho dráždenia", price: "25 €" },
      { label: "Lokálne ošetrenie gingívy alebo sliznice", price: "30 €" },
      { label: "Zatvorená kyretáž koreňa (root planing)", price: "45 €" },
      { label: "Otvorená kyretáž", price: "180 €" },
      { label: "Dlahovanie 1 zub", price: "75 €" },
      { label: "Aplikácia lasera", price: "10 €" },
      { label: "Návrh paro liečby", price: "35 €" },
      { label: "Aplikácia liečiva do paro vačku", price: "Podľa rozsahu" },
      { label: "Odber materiálu Mikro-gen", price: "155 €" },
      /*
       * "Odmer" in the clinic's PDF. Corrected to "Odber" — the same word is
       * spelled correctly on the row directly above it and again under
       * prevention, so the typo is theirs and unambiguous. Flagged to the user
       * on 2026-09-06 so the clinic can fix their own document.
       */
      { label: "Odber materiálu Mikro", price: "85 €" },
      { label: "PRF – krvná plazma", price: "75 €" },
      { label: "PRP – každá ďalšia skúmavka", price: "15 €" },
    ],
  },
  {
    part: "vykony",
    slug: "vyplne-zachovna-stomatologia",
    name: "Výplne (záchovná stomatológia)",
    entries: [
      { label: "Jednoplôšková výplň zuba iná", price: "40 €" },
      { label: "Dvojplôšková výplň zuba (AMG)", price: "60 €" },
      { label: "Trojplôšková výplň zuba (AMG)", price: "70 €" },
      { label: "Úprava výplne", price: "25 €" },
      { label: "Fotokompozit – jedna plôška", price: "80 – 105 €" },
      { label: "Fotokompozit – dve plôšky", price: "100 – 120 €" },
      { label: "Fotokompozit – tri plôšky", price: "125 – 145 €" },
      { label: "Kompozitná rekonštrukcia korunky zuba", price: "135 – 175 €" },
      { label: "Most na vlákne – 1 člen", price: "145 €" },
      { label: "MTA pro root", price: "55 €" },
      { label: "Biodentín", price: "55 €" },
      { label: "Dycal", price: "20 €" },
      { label: "Ionoseal", price: "20 €" },
      { label: "ever X", price: "20 €" },
      { label: "Tetric evo flow", price: "15 €" },
      { label: "Dočasné ošetrenie hlbokého zubného kazu", price: "55 €" },
      { label: "Fuji otvorený sendvič", price: "30 €" },
      { label: "Provizórna výplň", price: "20 €" },
    ],
  },
  {
    part: "vykony",
    slug: "estetika-a-bielenie",
    name: "Estetika a bielenie",
    entries: [
      { label: "WH – vnútorné bielenie", price: "240 €" },
      { label: "Fazetovanie zuba Empress Direct", price: "220 €" },
      { label: "Fazetovanie zuba", price: "190 €" },
      { label: "ICON – odstránenie bielych škvŕn", price: "110 €" },
      { label: "Mikroabrázia", price: "40 €" },
      { label: "Nite White", price: "260 €" },
      { label: "Nite White – doplnkové bielenie", price: "40 €" },
    ],
  },
  {
    part: "vykony",
    slug: "detska-stomatologia",
    name: "Detská stomatológia",
    entries: [
      { label: "Trepanácia mliečneho zuba", price: "35 €" },
      { label: "Amputácia mliečneho zuba", price: "60 €" },
      { label: "Výplň mliečneho zuba – Fuji", price: "60 €" },
      { label: "Ťažko ošetriteľné dieťa", price: "40 €" },
      { label: "Ošetrenie sťaženého prerezávania zuba múdrosti", price: "40 €" },
    ],
  },
  {
    part: "vykony",
    slug: "endodoncia",
    name: "Endodoncia",
    entries: [
      { label: "Trepanácia trvalého zuba", price: "30 €" },
      { label: "Trepanácia cez korunku", price: "30 €" },
      { label: "Paliatívne endodontické ošetrenie", price: "100 €" },
      { label: "Paliatívne endo 2 kk", price: "120 €" },
      { label: "Paliatívne endo viac kk", price: "140 €" },
      { label: "Odstránenie VK 1 kk (reendodoncia)", price: "55 €" },
      { label: "Odstránenie VK 1 kk (reendo) nad 10\"", price: "80 €" },
      { label: "Odstránenie zalomeného nástroja", price: "80 €" },
      { label: "Odstránenie koreňového čapu", price: "40 €" },
      { label: "Endodontické ošetrenie trvalého zuba 3D", price: "75 €" },
      { label: "Endodontické ošetrenie trvalého zuba", price: "70 €" },
      { label: "Jednorazové endo 1 kk", price: "170 €" },
      { label: "Endodontické ošetrenie 2 kk trvalého zuba", price: "195 €" },
      { label: "Jednorazové endo 3 kk", price: "240 €" },
      { label: "Jednorazové endo 4 kk", price: "270 €" },
      { label: "Ošetrenie Reciproc", price: "25 €" },
      { label: "Titanová nadstavba", price: "100 €" },
      { label: "Čap – sklenené vlákna", price: "100 €" },
      { label: "3D teplá gutaperča", price: "20 €" },
    ],
  },
  {
    part: "vykony",
    slug: "extrakcie",
    name: "Extrakcie",
    entries: [
      { label: "Extrakcia mliečneho zuba alebo koreňa", price: "30 €" },
      { label: "Extrakcia mliečneho zuba alebo koreňa – komplikovaná", price: "40 €" },
      { label: "Extrakcia trvalého zuba alebo koreňa", price: "95 €" },
      { label: "Extrakcia trvalého zuba alebo koreňa – paro", price: "70 €" },
      { label: "Extrakcia viackoreňového zuba", price: "125 €" },
      { label: "Extrakcia viackoreňového zuba – paro", price: "80 €" },
      { label: "Komplikovaná extrakcia", price: "160 €" },
      { label: "Neplánovaná chirurgická extrakcia", price: "210 €" },
      { label: "Chirurgická extrakcia", price: "190 €" },
      { label: "Chirurgická extrakcia 8.", price: "250 €" },
    ],
  },
  {
    part: "vykony",
    slug: "dentoalveolarna-chirurgia",
    name: "Dentoalveolárna chirurgia",
    entries: [
      { label: "Dekapsulácia zuba", price: "65 €" },
      { label: "Resekcia koreňového hrotu", price: "185 €" },
      { label: "Resekcia koreňového hrotu distálne", price: "235 €" },
      { label: "Chirurgická revízia rany", price: "115 €" },
      { label: "Egalizácia alveolárneho výbežku", price: "140 €" },
      { label: "Plastika frenúl, slizničných a väzivových pruhov", price: "120 €" },
      { label: "Vestibuloplastika", price: "85 – 170 €" },
      { label: "Gingivektómia", price: "50 €" },
      { label: "Intraorálna incízia dentogénneho abscesu", price: "50 €" },
      { label: "Augmentácia – GTR", price: "350 €" },
      { label: "Hemiextrakcia (odstránenie koreňa viackoreňového zuba)", price: "170 €" },
      { label: "Sutúra malej rany ústnej sliznice do 3 cm ako samostatný výkon", price: "20 €" },
      { label: "Sutúra extrakčnej rany – približovací steh", price: "40 €" },
      { label: "Fenestrácia", price: "220 €" },
      { label: "Cystektómia", price: "165 €" },
      { label: "Odstránenie cudzieho telesa", price: "165 €" },
      { label: "Slizničný obväz", price: "35 €" },
      { label: "Alveogyl", price: "10 €" },
      { label: "Ošetrenie (kontrola) po chirurgickom zákroku", price: "Zdarma" },
      { label: "Plastika oroantrálnej komunikácie", price: "185 €" },
      { label: "Egalizácia Thorus mandibularis", price: "180 €" },
    ],
  },
  {
    part: "vykony",
    slug: "protetika-priprava-a-laboratorium",
    name: "Protetika – príprava a laboratórium",
    entries: [
      { label: "Anatomické odtlačky", price: "65 €" },
      { label: "3D sken 3SHAPE", price: "120 €" },
      { label: "Model 3D tlač", price: "Podľa rozsahu" },
      { label: "Retrakčné vlákno 1 ks", price: "5 €" },
      { label: "Retrakčná pasta 3M", price: "10 €" },
      { label: "Silikónový kľúč", price: "80 €" },
      { label: "Štúdijný model", price: "50 €" },
      { label: "Analýza študijného modelu", price: "40 €" },
      { label: "Wax up – člen", price: "20 €" },
      { label: "Protetické brúsenie zuba", price: "10 €" },
      { label: "Tvárový oblúk", price: "55 €" },
      { label: "Úprava odtlačkovej lyžice", price: "10 €" },
      { label: "Voskový mock up", price: "30 €" },
      { label: "Centrická registrácia", price: "80 €" },
      { label: "Pieskovanie protetickej práce", price: "10 €" },
    ],
  },
  {
    part: "vykony",
    slug: "protetika-korunky-inlaye-fazety",
    name: "Protetika – korunky, inlaye a fazety",
    entries: [
      { label: "Inlay koreňová", price: "100 €" },
      { label: "Celokeramická korunka Zirkón", price: "455 €" },
      { label: "Celokeramický medzičlen Zirkón", price: "455 €" },
      { label: "Inlay keramická", price: "420 €" },
      { label: "Inlay kompozitná", price: "350 €" },
      { label: "Keramická fazeta", price: "455 €" },
      { label: "Stiahnutie korunky", price: "25 €" },
      { label: "Fixácia spadnutej korunky", price: "50 €" },
      { label: "Kovokeramický člen mostíka", price: "330 €" },
      { label: "Celokeramická korunka na implantát", price: "460 €" },
      { label: "Kovokeramická korunka", price: "345 €" },
      { label: "Dočasná korunka", price: "30 €" },
      { label: "Dočasná korunka lab.", price: "65 €" },
      { label: "Dočasná korunka frézovaná", price: "65 €" },
      { label: "Živicová korunka", price: "140 €" },
      { label: "Celokeramický člen", price: "460 €" },
      { label: "Kovokeramická korunka na implantát", price: "355 €" },
    ],
  },
  {
    part: "vykony",
    slug: "protetika-snimatelne-nahrady",
    name: "Protetika – snímateľné náhrady",
    entries: [
      { label: "Celková snímateľná náhrada", price: "530 €" },
      { label: "Čiastočná snímateľná náhrada", price: "630 €" },
      { label: "Skeletová náhrada", price: "630 €" },
      { label: "Imediátna náhrada do štyroch zubov", price: "260 €" },
      { label: "Imediátna náhrada nad 4 zuby", price: "365 €" },
      { label: "Oprava zlomenej náhrady", price: "80 €" },
      { label: "Spona trojramenná celoliata", price: "50 €" },
      { label: "Podporný strmeň Gilmor", price: "150 €" },
      { label: "Zásuvný spoj CEKA", price: "170 €" },
    ],
  },
  {
    part: "vykony",
    slug: "implantologia",
    name: "Implantológia",
    entries: [
      { label: "Implantát", price: "810 €" },
      { label: "Abutment", price: "220 – 335 €" },
      { label: "Abutment individuálny", price: "250 €" },
      { label: "Vhojovacia skrutka", price: "120 €" },
      { label: "RTR", price: "73 €" },
      { label: "Membrána", price: "120 €" },
    ],
  },
  {
    part: "vykony",
    slug: "dlahy-proti-bruxizmu",
    name: "Dlahy proti bruxizmu",
    entries: [
      { label: "Dlaha proti bruxizmu", price: "130 €" },
      { label: "Centrická dlaha proti bruxizmu", price: "250 €" },
    ],
  },
  {
    part: "vykony",
    slug: "ostatne-platby",
    name: "Ostatné a platby",
    entries: [
      { label: "Protetické ošetrenie cez", price: "Podľa rozsahu" },
      { label: "Ošetrenie výplňami", price: "Podľa rozsahu" },
      { label: "Endo ošetrenie", price: "Podľa rozsahu" },
      { label: "Chirurgické ošetrenie", price: "Podľa rozsahu" },
      { label: "Úhrada faktúry", price: "Podľa rozsahu" },
    ],
  },
  {
    part: "produkty",
    slug: "curaprox",
    name: "Curaprox",
    entries: [
      { label: "Curaprox kefka 1560, 1-balenie", price: "5 €" },
      { label: "Curaprox kefka 3960, 1-balenie", price: "5 €" },
      { label: "Curaprox kefka 5460, 1-balenie", price: "5 €" },
      { label: "Curaprox kefky 5460-1560, 3-balenie", price: "14 €" },
      { label: "Curaprox kefky 5460 duopack, 2-balenie", price: "9 €" },
      { label: "Curaprox kefka single – jednozväzková", price: "6 €" },
      { label: "Curaprox kefka ATA", price: "4 €" },
      { label: "Curaprox kefka Smart (od 4 rokov)", price: "5 €" },
      { label: "Curaprox kefka CuraKid detská", price: "5 €" },
      { label: "Curaprox niť modrá (DF834)", price: "6 €" },
      { label: "Curaprox kefka + medzizubné 8 ks", price: "8 €" },
      { label: "Curaprox medzizubné kefky 5 ks", price: "8 €" },
      { label: "Curaprox medzizubné kefky, set 12 ks", price: "15 €" },
      { label: "Curaprox zubná pasta BE YOU", price: "10 €" },
      { label: "Curaprox zubné pasty BE YOU mini", price: "14 €" },
      { label: "Curaprox TRAVEL (set kefka + medzizub. + pasta)", price: "11 €" },
      { label: "CPX Aligner", price: "16 €" },
      { label: "Škrabka na jazyk", price: "4 €" },
      { label: "CPX náhradné hlavice 8 ks", price: "8 €" },
    ],
  },
  {
    part: "produkty",
    slug: "swissdent",
    name: "Swissdent",
    entries: [
      { label: "Swissdent kefka 1 ks", price: "3 €" },
      { label: "Swissdent kefky 3 ks", price: "8 €" },
      { label: "Swissdent XP EXTREME 100 ml", price: "18 €" },
    ],
  },
  {
    part: "produkty",
    slug: "elmex",
    name: "Elmex",
    entries: [
      { label: "Elmex gellé", price: "9 €" },
      { label: "Elmex zubná pasta DETSKÁ", price: "4 €" },
      { label: "Elmex zubná pasta JUNIOR", price: "5 €" },
    ],
  },
  {
    part: "produkty",
    slug: "meridol",
    name: "Meridol",
    entries: [
      { label: "Meridol zubná pasta", price: "3 €" },
      { label: "Meridol ústna voda", price: "5 €" },
    ],
  },
  {
    part: "produkty",
    slug: "tepe",
    name: "Tepe",
    entries: [
      { label: "Tepe medzizubné kefky 8 ks", price: "6 €" },
      { label: "Tepe kefka", price: "4 €" },
      { label: "Tepe kefka na implantáty", price: "4 €" },
    ],
  },
  {
    part: "produkty",
    slug: "splat",
    name: "Splat",
    entries: [
      { label: "Biocalcium", price: "6 €" },
    ],
  },
  {
    part: "produkty",
    slug: "biela-perla",
    name: "Biela perla",
    entries: [
      { label: "BP kurkuma", price: "6 €" },
    ],
  },
  {
    part: "produkty",
    slug: "probiotika-a-prebiotika",
    name: "Probiotiká a prebiotiká",
    entries: [
      { label: "Probiotiká Bac-entos", price: "18 €" },
      { label: "Probiotiká Probiodentix / Probix", price: "20 €" },
      { label: "Butarax", price: "23 €" },
    ],
  },
  {
    part: "produkty",
    slug: "curasept",
    name: "Curasept",
    entries: [
      { label: "Curasept ADS ústna voda", price: "12 €" },
      { label: "Curasept ADS zubná pasta", price: "9 €" },
      { label: "Curasept ADS paro gél 30 ml", price: "11 €" },
      { label: "Curasept Whitening + kefka", price: "21 €" },
      { label: "Curasept ÚV modrá 0,2 % CHX", price: "9 €" },
      { label: "Curasept paro gél 0,5 %, 5 ml", price: "1 €" },
      { label: "ÚV Afty", price: "10 €" },
    ],
  },
  {
    part: "produkty",
    slug: "bluem",
    name: "Bluem",
    entries: [
      { label: "Bluem ústna voda", price: "10 €" },
      { label: "Bluem zubná pasta", price: "11 €" },
    ],
  },
  {
    part: "produkty",
    slug: "ostatne",
    name: "Ostatné",
    entries: [
      { label: "Škrabka na jazyk (Curaprox)", price: "4 €" },
      { label: "OralB superfloss", price: "4 €" },
      { label: "GumAccess superfloss", price: "6 €" },
      { label: "Šabličky GUM", price: "4 €" },
      { label: "SoftDent kefka", price: "3 €" },
      { label: "GC Tooth Mousse / GC MI Paste plus", price: "18 €" },
      { label: "Apapro", price: "18 €" },
      { label: "Apapro fialové (120 g)", price: "22 €" },
      { label: "Apadent (total care / sensitive)", price: "13 €" },
      { label: "Buccotherm zubná pasta DETSKÁ (2–6 rokov)", price: "6 €" },
      { label: "Tepe detekčné tablety – balenie", price: "4 €" },
      { label: "Tepe detekčné tablety – 1 tbl.", price: "0 €" },
      { label: "PHILIPS výrobky (kód výrobku do poznámky)", price: "Podľa výrobku" },
      { label: "Niť Edel White oranžová", price: "4 €" },
      { label: "Marvis zubná pasta", price: "9 €" },
      { label: "Dračie kvapky DRAGS IMUN", price: "28 €" },
      { label: "MARA expert", price: "9 €" },
      { label: "MISWAK zubná kefka", price: "5 €" },
      { label: "GUM soft picks", price: "9 €" },
      { label: "Xylitolové cukríky", price: "30 €" },
      { label: "GUM Sensi Vital", price: "8 €" },
    ],
  },];

/**
 * The prices people ring up to ask, shown on the homepage.
 *
 * Whole procedures, never an "od" teased off the cheapest component. The
 * hygiene line is the reason that rule is written down: `Air flow – 1
 * zuboradie` is 50 €, and "hygiena od 50 €" would be true of one arch and
 * wrong about the visit anybody actually books.
 */
export const anchorPrices: readonly PriceEntry[] = [
  { label: "Komplexné stomatologické vyšetrenie", price: "40 €" },
  { label: "Odstránenie zubného povlaku alebo kameňa", price: "90 – 100 €" },
  { label: "Celokeramická korunka Zirkón", price: "455 €" },
  { label: "Implantát", price: "810 €" },
];
