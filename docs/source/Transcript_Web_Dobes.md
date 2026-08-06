# Transkript — Web Dental Centrum Dobeš
**Projekt: flagship web pre zubnú kliniku · Aurora Studio × Dental Centrum Dobeš**
Prepis pracovnej konverzácie (Rich ↔ Claude). Dlhé odpovede a kód sú zhrnuté do podstaty, deliverables označené.

---

## 1. Úvodná porada — funkcie, jedinečnosť, inšpirácia

**Rich:** Ideme robiť moderný web pre klienta Dental Centrum Dobeš (zubná klinika v Bratislave). Poradíme sa: (1) aké moderné funkcie pridať (3D animácie a pod.), (2) čím môže byť web jedinečne moderný, (3) čo nesmie chýbať, (4) aké weby zubných kliník pozrieť pre inšpiráciu.

**Claude:** Odpoveď po bodoch:
- **Moderné funkcie:** 3D model zubu/úsmevu (R3F, pozor na výkon na mobile), scroll-driven animácie priebehu ošetrenia, before/after slider, interaktívna mapa zubov (klik na boľavý zub → ošetrenie + CTA), cenová kalkulačka, online booking so sticky CTA.
- **Jedinečnosť:** anti-klinická „spa/boutique" estetika, vlastná fotografia a video namiesto stock, hero video, silná „Meet the Doctor" stránka, prípadové štúdie ako príbehy. Cinematic štýl skôr do videa/fotky než do dark-mode webu.
- **Čo nesmie chýbať:** objednávkové CTA na každej obrazovke, mobile-first + rýchlosť (70 %+ návštev z mobilu), recenzie, servisné podstránky pre lokálne SEO, schema.org, praktické info, GDPR.
- **Inšpirácia:** Dentologie, Grand Street Dental, Zen Dental Studio, Beehive Dental, Vivid Specialized Dentistry, Grind Dentistry, Alemany Dental + galérie (delmain.co, azurodigital.com, colorlib.com).

---

## 2. Cenová ponuka (.numbers)

**Rich:** [priložená cenová ponuka Dental Centrum Dobeš]

**Claude:** Prešiel celú ponuku (rozsah, špecifikácia, mesačné služby, harmonogram, podmienky). Kľúčové:
- Väčšina must-have vecí už v rozsahu (rezervačný formulár, SEO, meranie konverzií, GDPR, mikro-animácie).
- Do ceny sa zmestí: sticky CTA, before/after slider, FAQ + schema, „Prvá návšteva", stats counter.
- Upsell / fáza 2: **foto/video produkcia** (tlačiť najviac), 3D animácie, cenová kalkulačka, Ads správa.
- **Chyba v súčte:** `4037,4999…` (floating-point) → zaokrúhliť na 4 037,50 € / 3 990 €.

---

## 3. Web ako referencia pre celý vertikál

**Rich:** Tento web chceme urobiť najlepšie ako sa dá — chceme ním prezentovať prácu do ďalších kliník.

**Claude:** Mení to zadanie — nie zákazka za €4 037, ale investícia do referenčného webu. Web musí u iného majiteľa kliniky vyvolať pocit, že jeho web je zastaraný. Kľúčové:
- Prvých 5 s kinematografických (hero video z ambulancie).
- Jeden signature prvok (odporúčam mapu zubov — funkcia s dátami, nie dekorácia).
- Detaily portfóliovej úrovne (custom cursor, page transitions, mikro-animácie).
- Vypýtať si protihodnotu: právo na case study, prístup k GA4 dátam, video testimonial, footer credit.
- Foto/video už nie upsell, ale nutnosť (robíš in-house).
- Tech: Motion, R3F, Lenis. Lighthouse ≥ 90 povinnosť.

---

## 4. Sitemap + wireframe brief

**Rich:** Áno, priprav sitemap + wireframe brief s flagship ambíciou.

**Claude:** 📄 **Deliverable: `Brief_Web_DentalCentrumDobes.md`** — dvojcieľový brief (pacient + Aurora), dizajnové tokeny, sitemap, wireframe každej stránky (vrátane ASCII skice homepage), špecifikácia mapy zubov, animačný systém, shot listy (foto/video/case study), quality gates. Upozornenie: kap. 1B a 7.4 sú interné.

---

## 5. Vizuálna identita + logo

**Rich:** [2 sociálne posty + biele logo] Týmto vizuálnym smerom chceme ísť.

**Claude:** Identita: greige/taupe tóny, grafitové pill CTA, obrysový zub, geometrický sans. Aktualizoval brief:
- Paleta: greige `#EDEAE4`, porcelain, taupe `#AE9B7E`, charcoal `#26262A` (namiesto pôvodnej petrolejovej).
- Obrysový zub → grafický podpis webu + základ mapy zubov.
- Typografia: geometrický sans (Poppins / General Sans), serif vyhodený.
- ⚠️ Adresa nesedí (posty 3299 vs ponuka 13762), logo len biele, tykanie vs. vykanie.

---

## 6. Ako pokračovať + plán krokov

**Rich:** Ako ideme ďalej?

**Claude:** Kritická cesta cez klienta: (1) vstupný brief s doktorom, (2) podklady, (3) paralelne dizajn homepage, (4) fotenie/video, (5) vývoj, (6) testovanie + spustenie.

---

## 7. Doplnenie briefu z .docx + odpovede doktora

**Rich:** [docx s doplnenými odpoveďami] Chýba nám niečo na štart? Fotky budúci týždeň, videá máme.

**Claude:** Blokátory štartu: rozhodnutie o CMS, finálny cenník, adresa, tmavé logo, texty ošetrení. „Bez poisťovní" mení komunikačnú stratégiu (transparentný cenník sa stáva konverzne kritickým). Môžeš hneď spustiť: projekt setup, hero video slučku, dizajn homepage, prototyp mapy zubov.

---

## 8. Odpovede doktora + referenčný web LAVA

**Rich:** Cenník budeme editovať aj my (netreba CMS bez programátora). Adresa: Vlárska 13762/13C. Tmavé logo posielam (nedošlo). Fonty z postov, prispôsob pre modernosť. Biznis poradie služieb: protetika → chirurgia/implantáty → endodoncia/záchovná → parodontológia → pedostomatológia. Referenčný web: lavadental.lv/en. Napíš otázky na zajtrajší hovor s doktorom.

**Claude:** Analyzoval LAVA (produktizované vstupné vyšetrenie ako hlavný CTA, zážitkové piliere). 📄 **Deliverable: `Otazky_hovor_Dobes.md`** — 10 tém, ~45 otázok, checklist výstupov. Priority: vstupné vyšetrenie ako produkt, zážitkové prvky, EN verzia (rozsah).

---

## 9. Perfektný dizajn — kde a s čím

**Rich:** Čo sa týka perfektného dizajnu, kde a s čím to mám riešiť?

**Claude:** Nie je to o jednom nástroji. Overil: **GSAP je od apríla 2025 kompletne zadarmo** (vrátane pluginov, po akvizícii Webflowom). Workflow: referencie (Awwwards, Godly, Land-book, Refero, Mobbin) → art direction → Figma skeleton → prototyp animácií v kóde (GSAP + ScrollTrigger, Lenis, Motion, R3F) → build → kritika a leštenie. „Svetová úroveň" = posadnutosť detailmi (custom easing, stagger, hover stavy, page transitions, typografia). Odvahu miň na jednom mieste. Výkon = podmienka.

---

## 10. Kto navrhne dizajn

**Rich:** Frontend dizajn mi vieš navrhnúť aj ty alebo Claude Design?

**Claude:** Oboje. Ja viem: art direction dokument + reálny nakódovaný prototyp (bežiaci kód, nie obrázok). Claude Design = plátno s dizajn nástrojmi (over si aktuálne možnosti). Odporúčaný postup: art direction → nakódovaný prototyp homepage → prevezmeš do repa.

**Rich:** [vybral „ešte to zvážim"]

**Claude:** OK — art direction dokument je najlepší prvý krok bez ohľadu na ďalšiu cestu. Počkajme na hovor s doktorom.

---

## 11. Inventúra podkladov

**Rich:** Čo sa týka podkladov, cenová ponuka, vizuálna identita — máš?

**Claude:** Mám: cenovú ponuku, identitu (paleta + posty), biele logo, obsah starého webu, odpovede doktora, LAVA. Chýba: tmavý vektor loga, cenník, vstupné vyšetrenie, fotky, videá (súbory), tím/before-after. Na art direction + prototyp to stačí.

---

## 12. Tmavé logo + info z hovoru

**Rich:** [čierne logo] Cenník ešte pošlem, brief z hovoru pošlem, videá/fotky neskôr v zložke. DNS: Netropolis (Jakub Kšiňan). GBP: Venet. Sedácia: len lokálna. Vstupné vyšetrenie: panorama + intraorálne snímky, CT nie na vstupnom, ~30 min, 100 €. Bez plánu s cenami. Bez splátok (platba na etapy). Karta+hotovosť. Parkovanie zdarma. Bez bezbariérovosti (schody). Akútne stavy prednostne. EN verzia: chcú → naceniť. Portfólio: súhlas ÁNO.

**Claude:** Pozrel starý web bratislavazubar.sk — zlatá baňa (mikroskop 25×, deti od 3 r., GBT hygiena, bezbolestnosť, filozofia). Odporúčanie: **doménu ponechať a migrovať** (SEO hodnota). Aktualizoval brief o sekciu **8b (migrácia + 301 redirect mapa)** a prepísal sekciu 9 (vyriešené/otvorené). Strategická poznámka 9b: **vstupné vyšetrenie 100 € = brána k cene** (rieši rozpor transparentnosť vs. individuálne ceny). 📄 **Deliverable: `Otazky_hovor_Dobes_v2.md`** (orezané otázky).

---

## 13. Dodatok — EN verzia

**Rich:** [potvrdil rozpočet EN] Priprav cenovú ponuku na EN verziu ako dodatok.

**Claude:** 📄 **Deliverable: `CP_Dodatok1_EN_verzia_Dobes.xlsx`** — 5 položiek (bilingválna architektúra, preklad/lokalizácia, mikrotexty, EN SEO, testovanie), medzisúčet 850 €, vernostná zľava 15 %, **spolu 722,50 €**. Podmienky: preklad po schválení SK textov, EN ako 2. etapa, budúce texty samostatne.

---

## 14. Cenník (foto)

**Rich:** [8 strán interného cenníka + retailový sortiment]

**Claude:** Interný cenník (200+ položiek s kódmi) NESMIE ísť na web verbatim. 📄 **Deliverable: `Cennik_web_draft_Dobes.md`** — orientačné „od" ceny podľa biznis priority (protetika od 455 €, implantát od 810 € / kompletné riešenie ~1 490 €+, endo od 100 €, atď.), vstupné vyšetrenie 100 € ako CTA. Flagy: CT rozpor, implantát framing, retail ako budúci e-shop.

---

## 15. CT rozlíšenie

**Rich:** CT nerobia na vstupnom vyšetrení, ale normálne ho robia.

**Claude:** Opravené v cenníku. Framing: kompletný diagnostický arzenál (CT + 3Shape skener + mikroskop + EMS + Osstem), CT nasadzujú cielene — technológia + zodpovednosť.

---

## 16. Recenzie z GBP

**Rich:** Recenzie si vieš vytiahnuť aj sám z ich GBP?

**Claude:** Verejne: ~36 recenzií, ~4,5★. Témy pre copywriting: bezbolestnosť, rodinná klinika, rekonštrukcie (Dobeš), parkovanie, ceny primerané kvalite. Insight: viac lekárov (Novotňáková, Dobešová). Odporúčanie: živý Google widget + pár hero recenzií. Adresa 3299 vs 13762 — zladiť pre NAP.

---

## 17. Plán práce

**Rich:** Poďme si rozpísať plán práce.

**Claude:** 📄 **Deliverable: `Plan_prace_Web_Dobes.md`** — 6 fáz (0 príprava → 5 spustenie), mapované na položky ponuky, paralelné vetvy, kritická cesta, flagship špecifiká. Fotky nie sú blocker; mapu zubov prototypovať skoro; GBP/DNS pýtať hneď.

---

## 18. Hero video

**Rich:** Na homepage chcem na celej ploche reklamné video pod textom. Mám ešte 2 videá (implantológia, hygiena).

**Claude:** Video: 4K/60fps, 105 s, 294 MB. 📄 **Deliverables: `hero_loop_draft.mp4`** (8,4 s slučka, 1,89 MB) + **`hero_poster.jpg`**. Draft na odsúhlasenie strihu. Ďalšie 2 videá → hero pozadia detailových stránok služieb.

---

## 19. Art direction

**Rich:** Poďme na art direction.

**Claude:** 📄 **Deliverable: `Art_Direction_Dobes.html`** — živý HTML dokument (9 sekcií: pozicionovanie, farby, typografia Hanken Grotesk, grafický jazyk s funkčnými hover stavmi, foto/video, pohyb s easing demom, mapa zubov demo, rytmus sekcií, do/don't).

**Rich:** Smer sa mi veľmi nepáči, ale poďme urobiť homepage aspoň prvý „slide" a doladíme postupne.

**Claude:** Fér — postavil hero filmovejšie (fullscreen video, tmavý scrim, svetlá typografia). 📄 **`Hero_v1_Dobes.html`**. Prosba o feedback k nálade/typografii/headline.

---

## 20. Hero — kolá pripomienok

**Rich (v1→v2):** Nadpis „Tvoríme úsmevy, ktoré Vás robia krajšími". Celé video na pozadí (nie fotka). Presné zmenené logo. Google 4,5★. Eyebrow inak (kolíduje s logom). Vymaž „25× mikroskop".
→ **Claude: `Hero_v2_Dobes.html`** (zapečené video + presné biele logo).

**Rich (→v3/v4):** Všetko menšie (premium). CTA v štýle referencie „$99 New Patient Special", elegantnejšie/originálnejšie. Celé 2-min video. „Prehliadka kliniky" vpravo hore. „ZDARMA" namiesto 0 €. Tagline „Súkromná zubná klinika pri Kramároch v Bratislave" pod logo.
→ **Claude: `Hero_v3` / `Hero_v4`** — celé video (720p, 6,2 MB), CTA s vnútorným rámikom + taupe fill na hover, telefón CTA.

**Rich (→v4):** Tagline zlatý + pomlčka. CTA „Vstupný balík pre nových pacientov" (bez ceny). Tlačidlá oblejšie. Návrh kreatívnejšieho nadpisu, menej textu.
→ **Claude:** nadpisové varianty A–E, `Hero_v4`.

**Rich (→v5):** Nadpis: fixné „Sme" + 4 rotujúce varianty (animácia na Claudovi). Podnadpis: „Moderní. Bez bolesti. Bezpeční. S úsmevom na tvári."
→ **Claude: `Hero_v5`** (rotátor). Oprava v5.1 (text sa nemenil).

**Rich (→v6):** Meniaci sa text bielou / gradientom zlatej. „Sme" fixné, prispôsobuje sa mu ďalší text.
→ **Claude: `Hero_v6`** (gradient biela→zlatá, pevná výška bloku).

**Rich (→v7):** Animácia zdola hore.
→ **Claude: `Hero_v7`** (vertikálny pohyb bez blur).

**Rich (→v8):** Aj meniaci sa text daj do animácie zdola hore.
→ **Claude: `Hero_v8`** (rozdelenie na slová, stagger rise — vysvetlenie, prečo v7 reálne nemala pohyb).

**Rich:** Verzia v7 sa mi páči viac, nechajme ju.
→ **Claude:** ✅ **`Hero_v7_Dobes.html` = finálny hero.**

---

## 21. Video — vyššie rozlíšenie a FPS

**Rich:** Do budúcna vieme dať video vo vyššom rozlíšení a FPS?

**Claude:** Áno — preview je zámerne komprimované. Produkcia: 1080p (z 4K masteru = ostrejšie), **FPS radšej 30** (60 zdvojnásobí veľkosť bez viditeľného zisku pri pokojnom hero), dva formáty (WebM/VP9 + MP4), lazy-load + poster, mobilná verzia. Pošli originály pri finalizácii.

---

## 22. Transkript

**Rich:** Urob mi transkript chatu do .md súboru.

**Claude:** 📄 **Deliverable: `Transcript_Web_Dobes.md`** (tento súbor).

---

## Prehľad deliverables

| Súbor | Obsah |
|---|---|
| `Brief_Web_DentalCentrumDobes.md` | Master brief (sitemap, wireframe, tokeny, migrácia, quality gates) |
| `Otazky_hovor_Dobes.md` / `_v2.md` | Otázky na hovor s doktorom (plná + orezaná verzia) |
| `CP_Dodatok1_EN_verzia_Dobes.xlsx` | Cenový dodatok EN verzie (722,50 €) |
| `Cennik_web_draft_Dobes.md` | Web-ready „od" ceny podľa biznis priority |
| `Plan_prace_Web_Dobes.md` | 6-fázový plán práce |
| `hero_loop_draft.mp4` / `hero_poster.jpg` | Hero video slučka + poster |
| `hero_video_full_720.mp4` | Celé video (720p preview) |
| `Art_Direction_Dobes.html` | Živý art direction dokument |
| `Hero_v7_Dobes.html` | **Finálny hero homepage** |

---

## Kde sme skončili / ďalší krok

Hero (v7) je **hotový a odsúhlasený**. Ďalej podľa plánu: **signature prvok (mapa zubov)** alebo sekcia **služby**. Otvorené rozhodnutia pred ďalšou sekciou:
1. Čím pokračovať — mapa zubov hneď, alebo najprv ľahšia sekcia?
2. Nadväznosť — po tmavom hero svetlá sekcia, alebo držať tmavú kinematografickú líniu?

Čaká sa od klienta: fotky (budúci týždeň), GBP + DNS prístup, súhlas recenzie/before-after, originály videí pre produkčné verzie.

---
*Aurora Studio s.r.o. · pracovný transkript · júl–aug 2026*
