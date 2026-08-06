# Dental Centrum Dobeš — návrh projektového základu

## Cieľ

Vytvoriť udržiavateľný produkčný základ webu Dental Centrum Dobeš zo schváleného prototypu `Hero_v7_Dobes.html`. Výsledok má zachovať existujúci hero vizuálne, obsahovo aj funkčne a pripraviť bezpečný workflow pre spoluprácu Codexu a Claude.

Aktuálny rozsah neobsahuje novú obsahovú sekciu. Plánovaná animácia čeľuste vytvorená cez Higgsfield a ďalšie sekcie pribudnú až po samostatnom zadaní používateľa.

## Technický prístup

Projekt použije Next.js, TypeScript a App Router. Táto kombinácia podporí budúce SEO podstránky, slovenskú a anglickú verziu, formuláre, interaktívne prvky a prípadné CMS bez potreby meniť základnú architektúru.

Hero sa rozdelí na zrozumiteľné komponenty bez zmeny výsledného vzhľadu. Globálne dizajnové tokeny zostanú založené na existujúcej palete, typografii a animáciách.

## Migrácia hero prototypu

- Zachovať texty, navigáciu, CTA, trust strip, rotujúci nadpis, scroll správanie a responzívne správanie.
- Zachovať Hanken Grotesk a existujúce farby.
- Presunúť vložené base64 logo a video do samostatných súborov v `public/`.
- Použiť natívny video element s produkčne pripravenou štruktúrou zdrojov a posterom, keď budú dodané finálne médiá.
- Rešpektovať `prefers-reduced-motion`.
- Nenahrádzať schválený hero novým dizajnom ani textom.
- Za hero ponechať iba neutrálny vývojový koniec stránky; nepridávať obsah, ktorý používateľ nezadal.

## Budúce rozšírenia

Architektúra umožní samostatne doplniť:

- animáciu čeľuste dodanú z Higgsfieldu,
- sekcie služieb a detailové SEO stránky,
- vstupný balík pre nových pacientov,
- mapu zubov,
- cenník,
- tím, ambulanciu, recenzie a kontakt,
- slovenskú a anglickú jazykovú verziu.

Tieto položky nie sú súčasťou aktuálnej implementácie.

## Git a GitHub workflow

Vznikne súkromné GitHub repo `dental-centrum-dobes`.

- `main`: stabilná vetva.
- `develop`: spoločná integračná a rozvíjacia vetva.
- `codex/<tema>`: pracovné vetvy Codexu.
- `claude/<tema>`: pracovné vetvy Claude.
- Práca sa integruje cez malé, popísané commity. Agent neupravuje rozpracované súbory druhého agenta bez handoffu.
- Tajomstvá, tokeny a lokálne konfiguračné hodnoty nesmú byť commitnuté.

## Koordinácia agentov

Koreň projektu bude obsahovať `COLLAB.md` ako jediný spoločný stavový dokument. Bude obsahovať:

- aktuálnu úlohu a vlastníka,
- pracovnú vetvu,
- dotknuté alebo rezervované súbory,
- prijaté rozhodnutia,
- hotové zmeny,
- otvorené otázky a ďalší krok,
- stručný handoff log.

`AGENTS.md` a `CLAUDE.md` prikážu obom agentom prečítať `COLLAB.md` pred začiatkom práce a aktualizovať ho pri preberaní alebo odovzdávaní úlohy.

## Obsah repozitára

- Next.js aplikácia s TypeScriptom.
- Migrovaný hero a jeho médiá.
- Pôvodný transcript uložený v `docs/source/`.
- Pôvodný HTML prototyp uložený v `docs/source/` alebo `archive/` ako referencia.
- `README.md` s lokálnym spustením a workflow.
- `COLLAB.md`, `AGENTS.md`, `CLAUDE.md`.
- `.gitignore` a vzor prostredia iba vtedy, keď ho projekt potrebuje.

## Spracovanie chýb a degradácia

- Ak video nemožno prehrať, hero použije poster alebo tmavé pozadie bez rozbitia textu.
- JavaScript animácie nesmú blokovať navigáciu ani CTA.
- Pri zapnutom obmedzení pohybu zostane celý obsah okamžite viditeľný.
- Chýbajúce budúce médiá nebudú nahradené vymyslenými materiálmi.

## Overenie

Aktuálna etapa musí splniť:

- úspešný produkčný build,
- TypeScript kontrolu bez chýb,
- hero dostupný na desktopoch aj mobiloch,
- funkčný telefónny odkaz,
- funkčnú rotáciu nadpisu a režim obmedzeného pohybu,
- žiadny token alebo tajomstvo v sledovaných súboroch,
- čistý Git stav po commite,
- `main` a `develop` odoslané do súkromného GitHub repa.

## Mimo rozsahu

- návrh alebo implementácia ďalšej sekcie,
- tvorba Higgsfield animácie,
- hosting a produkčné nasadenie,
- CMS, formuláre, analytika a externé integrácie,
- zmena schváleného hero dizajnu alebo textov.
