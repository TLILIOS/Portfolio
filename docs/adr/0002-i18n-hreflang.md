# ADR-0002 — i18n par URL, hreflang réciproque, pas d'auto-redirect

- Statut : Accepté
- Date : 2026-06-17
- Auteur : TLILI HAMDI

## Contexte

L'i18n existant était un toggle JS mutant le DOM sur une seule URL : Google ne crawlait que le FR, l'EN n'avait ni URL ni `hreflang`. Le marché est **FR primaire, EN/EU secondaire**. Google Search Central exige, pour des versions localisées, des **URL distinctes** et des annotations `hreflang` **réciproques** (sinon l'annotation est ignorée).

## Décision

Chaque page existe à une **URL FR (racine)** et une **URL EN (`/en/...`)**, contenu réellement servi à l'URL. Par page :
- `canonical` **auto-référent** (jamais EN→FR) ;
- `alternate hreflang="fr"`, `"en"`, et `"x-default"` ;
- **réciprocité** FR→EN et EN→FR, dérivée de la table unique `content/routes.js` ;
- `x-default` = **racine FR** (marché primaire).

Le switcher de langue est composé de **deux ancres** `<a hreflang lang>` vers la page jumelle — pas un bouton JS changeant le DOM. `localStorage prim.lang` ne sert qu'à **mémoriser** le dernier choix ; **aucun auto-redirect** par langue (piège Googlebot, explicitement interdit).

## Conséquences

- L'EN devient indexable et classable indépendamment.
- `routes.js` est l'unique source : toute page ajoutée y passe, sinon elle n'a ni jumelle ni entrée sitemap → invariant vérifié par `scripts/verify.mjs` (réciprocité hreflang).
- Le contenu légal (confidentialité, mentions, support, FicheChef privacy/support) a déjà ses jumelles EN — migrées fidèlement, non régressées.
- La préférence de langue en `localStorage` est déclarée dans la politique de confidentialité (donnée fonctionnelle, jamais transmise) — clause préservée.
