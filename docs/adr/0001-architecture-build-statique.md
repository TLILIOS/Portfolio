# ADR-0001 — Build statique Node minimal piloté par données

- Statut : Accepté
- Date : 2026-06-17
- Auteur : TLILI HAMDI

## Contexte

Le site `primapp.dev` était un monolithe `public/index.html` (~1150 lignes) avec i18n FR/EN par toggle JavaScript sur une **même URL** — l'anglais n'était donc jamais servi à une URL distincte, ni crawlable. La refonte studio-first impose : contenu bilingue **servi à l'URL**, `hreflang` réciproque, `sitemap` et JSON-LD dérivés de données (DRY), et un registre d'apps status-aware. Maintenir ça à la main, ×2 langues, dérive mécaniquement.

Le site est déployé par une app Cloudflare **Git-connectée** (`primapp-portfolio`, Workers Builds sur push `main`) qui sert `./public`. Un double canal de déploiement a déjà cassé la prod (audit 2026-06-10). Le mainteneur est un développeur **iOS solo, non-spécialiste web**.

## Décision

Build statique en **Node ESM natif** (`scripts/build.mjs`), **dépendances de build réduites au strict nécessaire** (aucune au runtime ; outils de validation en `devDependencies`). Les sources de vérité vivent dans `content/` (`site.json`, `apps.json`, `routes.js`, `config.json`, `pages/*`). Le build lit, valide les schémas (échec si invalide), rend chaque page FR (racine) + EN (`/en/`), génère `<head>`/hreflang/canonical/JSON-LD/sitemap/robots, et copie `_headers` + l'AASA.

**Cible de sortie = `public/`** (le dossier déjà servi) → `wrangler.jsonc` et la config dashboard restent **inchangés**, le `git push main` reste le seul trigger. Le build est **non-destructif sur les binaires** (`.mp4`, posters, `og-image.png`, `cv-tlili-hamdi.pdf`) : il régénère le HTML/sitemap/robots et copie `_headers`/`.well-known`, sans jamais supprimer un asset. `dist/` est produit en miroir vérifiable pour les validations (`html-validate`, `pa11y-ci`).

Alternatives écartées :
- **Astro / Hugo** : i18n et sitemap natifs, mais framework + courbe d'apprentissage + blast-radius autonome (mises à jour, plugins) sur un canal Git-connecté déjà sensible. Sur-dimensionné pour 8 pages × 2 langues maintenues en solo.
- **HTML manuel** : dérive garantie du bilingue/hreflang/sitemap (cause initiale du problème).

## Conséquences

- Maintenance solo : ajouter une app = éditer `apps.json` ; ajouter une page = éditer `routes.js` + un fichier `pages/`. Aucun HTML dupliqué.
- Modèle Workers Static Assets **conservé** : pas de Worker script, requêtes statiques gratuites préservées.
- `public/` devient **généré** — ne plus l'éditer à la main ; éditer `content/` puis `npm run build`.
- Mécanisme AASA : voir §AASA du README ; `_headers` Cloudflare force `Content-Type: application/json`, copié tel quel.
- Risque : un build oublié laisse `public/` désynchronisé des sources. Mitigation : `npm run build` documenté en tête de README + check CI possible (diff vide attendu après build).
