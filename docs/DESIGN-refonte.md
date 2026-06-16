# Phase A — Note de design — Refonte studio-first de primapp.dev

> Rendue avant tout code (§12-A). Auteur : TLILI HAMDI.
> Décision stratégique actée (prémortem) : objectif primaire = **studio Prim + apps** (racine `/` + pages produit) ; objectif secondaire = **CDI / mission** (vit sur `/a-propos`, jamais mélangé au hero studio). Séparation **par URL**, pas par section.

---

## 1. État des lieux du repo (vérifié, non présumé)

- **Repo source de vérité** : `~/Desktop/portfolio` (HEAD = `origin/main` = `ee69f4a`, à jour). Le clone `~/Code/tlilios.github.io` est en retard de 6 commits — ignoré.
- **Déploiement** : app Cloudflare Git-connectée `primapp-portfolio` (Workers Builds sur push `main`) sert `./public`. Worker `primapp-www-redirect` porte le 301 www→apex. **Pas de `wrangler deploy` manuel.**
- **Existant** : `public/index.html` est un monolithe ~1148 lignes, portfolio **CDI-first** (hero « Craft at prime » + label « Disponible CDI »), i18n FR/EN par toggle JS sur la **même URL** (EN non servi à une URL distincte → non crawlable). Pages légales FR + jumelles `/en/` déjà présentes. Pages FicheChef `/fichechef/privacy` + `/support` présentes.
- **AASA** : ⚠ **le fichier `.well-known/apple-app-site-association` N'EXISTE PAS** dans le repo. Seule la **règle `_headers`** (`Content-Type: application/json` sur cette route) est posée, en attente de la publication de l'app. Le prompt §1 affirme « AASA déjà servi » — **écart prompt↔réalité consigné dans TODO-CONTENT.md**. Garde-fou §11.5 réinterprété : *préserver la règle `_headers` et ne pas régresser la mécanique* — il n'y a pas de fichier à casser. Si le fichier est ajouté plus tard, le build le copiera tel quel.
- **Toolchain** : Node v22.17 (ESM + top-level await natifs). Pas de `package.json` → on en introduit un (pin wrangler `4.98.0`, la 4.99 a une régression `wrangler dev`).

## 2. Écart fondamental traité par la refonte

L'existant vend **Tlili Hamdi candidat CDI**. La cible vend **le studio Prim et ses apps** en racine, et relègue le CDI sur `/a-propos`. Ce n'est pas un reskin : c'est une **réécriture de l'intent** (hero, JSON-LD `og:type`, CTA, SEO) + un **passage de monolithe à build piloté par données** (DRY, bilingue servi par URL).

---

## 3. Architecture cible — arborescence des fichiers

### Créés
```
package.json                          # type:module, scripts build/validate/dev, wrangler pin
scripts/
  build.mjs                           # pipeline (lire → valider → rendre → head/hreflang → JSON-LD → sitemap → copie assets+AASA)
  lib/
    templates.mjs                     # layout() + composants (nav, footer, head, langSwitcher, appCard, cta)
    render-pages.mjs                  # une fonction par type de page (home, app, about, legal, support)
    jsonld.mjs                        # générateurs status-aware (Organization, WebSite, SoftwareApplication, Person)
    validate.mjs                      # validation schémas apps/routes (échec build si invalide)
  verify.mjs                          # contrôle réciprocité hreflang + présence sitemap/robots + AASA content-type (validation §13)
content/
  site.json                           # chrome global { fr, en } : nav, footer, CTA, switcher, méta défaut, sociaux
  apps.json                           # registre 5 apps, _draft:true, status-aware
  routes.js                           # table canonique { fr, en } par page → unique source hreflang + sitemap
  config.json                         # SITE_URL, LOCALES, X_DEFAULT, ENABLE_EMAIL_CAPTURE=false
  pages/
    home.json                         # blocs éditoriaux home (hero studio, méthode, teaser fondateur, contact) { fr, en }
    fichechef.json                    # corps page produit (lié à apps.json[fichechef])
    about.json                        # studio + fondateur + bloc « Collaborer — CDI & missions » { fr, en }
    legal-notice.md/.json             # mentions légales (migré de l'existant)
    privacy.md/.json                  # confidentialité (migré FIDÈLEMENT — RGPD conforme, non régressé)
    support.json                      # support global (migré)
    fichechef-privacy.json            # privacy app (migré)
    fichechef-support.json            # support app (migré)
docs/adr/0001-architecture-build-statique.md
docs/adr/0002-i18n-hreflang.md
docs/adr/0003-accessibilite-gate.md
docs/DESIGN-refonte.md                # ce fichier
README.md
TODO-CONTENT.md
.pa11yci                              # config pa11y-ci (liste des routes dist/)
```

### Sortie générée (`dist/` ou `public/` — voir §4)
```
dist/index.html  /en/index.html
dist/fichechef/index.html  /en/fichechef/index.html
dist/fichechef/privacy/  support/  (+ /en/)
dist/a-propos/index.html  /en/about/index.html
dist/mentions-legales/  confidentialite/  support/  (+ /en/ jumelles)
dist/sitemap.xml  robots.txt  _headers  .well-known/apple-app-site-association (si fourni)
dist/404.html  + assets copiés (mp4, posters, og-image, cv pdf, favicon)
```

### Modifiés / supprimés
- `public/index.html` monolithe : **remplacé** par la sortie du build. Décision §4 sur cible.
- `wrangler.jsonc` : `assets.directory` pointe vers le dossier de sortie retenu (§4). Reste assets-only, pas de routes, www inchangé.
- `public/_headers`, `public/.well-known/` : **préservés** et copiés par le build (AASA content-type intact).

## 4. Décision build — cible de sortie

**Retenu** : le build écrit dans **`public/`** (le dossier déjà servi par `wrangler.jsonc` et l'app Git-connectée), à partir des sources `content/`.
Raison : zéro changement de `wrangler.jsonc` ni de la config dashboard de l'app Git-connectée → **blast-radius minimal** sur le canal de déploiement (un double pilotage a déjà cassé la prod, audit 2026-06-10). Le `git push main` reste le seul trigger. `dist/` servirait aussi mais imposerait de changer `assets.directory` côté config déployée — risque évité.
Conséquence : `public/` devient **généré** ; les sources de vérité sont `content/`. Les assets binaires existants (`*.mp4`, posters, `og-image.png`, `cv-tlili-hamdi.pdf`, `_headers`, `.well-known/`) sont déplacés sous `assets/` source et **copiés** par le build, ou conservés in-place et préservés par un build non-destructif. **Sous-décision** : build **non-destructif sur les binaires** — il régénère uniquement le HTML/sitemap/robots et copie `_headers`/AASA ; il ne supprime jamais un `.mp4`. Documenté en ADR-0001.

> Note : le prompt §15 liste `dist/` comme livrable. On produit `dist/` comme **artefact de build vérifiable** (cible des validations §13 : html-validate, pa11y-ci) ET on synchronise vers `public/` pour le déploiement, OU on génère directement dans `public/`. Tranché à l'implémentation C selon la simplicité ; par défaut **génération dans `public/`** + `dist/` = miroir optionnel. Le README documentera le choix final effectif.

## 5. Modèle de données (schémas validés au build)

- **site.json** : `{ fr:{nav, footer, cta, switcher, meta, social}, en:{…} }`. Aucune chaîne UI en dur ailleurs.
- **apps.json** : tableau de 5 apps, schéma du §3.2 du prompt. Validation dure : `id` unique kebab, `status ∈ {available,coming-soon,in-development,concept}`, `flagship`/`showOnHome` bool, `appStoreUrl|testflightUrl|appStoreId` null ou string, copie bilingue présente, `_draft:true`. **Règle de rendu home** encodée : carte visible ssi `showOnHome && (status∈{available,coming-soon} || screenshot réel présent)` ; sinon ligne « À l'étude » discrète. Jamais de fausse carte produit.
  - Calibrage initial : `fichechef` flagship `coming-soon` ; `lune`/`prim-cfo`/`sobre`/`mondpe` en `in-development` ou `concept`, `appStoreUrl:null`. (L'humain corrige via TODO.)
- **routes.js** : `[{ key, fr:'/…', en:'/en/…', type, sitemap:{priority,changefreq} }]`. **Unique source** du hreflang réciproque et du sitemap.
- **config.json** : `SITE_URL`, `LOCALES`, `X_DEFAULT='fr'`, `ENABLE_EMAIL_CAPTURE=false` (fail-safe).

## 6. Composants / templates (sans framework)

`layout({lang, route, head, body})` → squelette `<html lang>` + skip-link + header + main + footer.
Composants : `head()` (canonical auto-référent + hreflang fr/en/x-default réciproques + meta + JSON-LD), `nav()`, `langSwitcher()` (**texte « FR / EN », zéro drapeau**, nom accessible, `lang` + `hreflang` sur les liens — pas un toggle JS qui change l'URL : deux liens pointant vers la jumelle), `footer()`, `appCard()` (status-aware), `cta()` (hiérarchie encodée par surface §8), `calendlyModal()` (réutilise la mécanique AA existante : `role=dialog`, `aria-modal`, focus trap, ESC, retour focus, ✕ labellisé, lazy-load).

Réécriture clé du switcher : aujourd'hui c'est un bouton JS qui ne change pas l'URL. Cible = **deux ancres** `<a hreflang lang>` vers la page jumelle (contenu servi à l'URL). `localStorage prim.lang` ne sert qu'à **mémoriser** le dernier choix pour le prochain hit — **aucun auto-redirect** (§11.4).

## 7. Mécanisme AASA retenu

`_headers` Cloudflare (déjà en place, supporté par Workers Static Assets) force `Content-Type: application/json` sur `/.well-known/apple-app-site-association`. **On conserve `_headers`** — pas de shim Worker (qui ferait perdre le service statique gratuit et ajouterait un script là où l'app est assets-only). Le build copie `_headers` et, s'il existe, le fichier AASA, sans les modifier. Vérifié contre la doc Cloudflare Workers Static Assets (`_headers` est le mécanisme natif). Documenté ADR-0001 + README.

## 8. Hiérarchie CTA (encodée dans les données, pas en dur)

- Surfaces **studio** (home, `/fichechef`) : primaire = action app (télécharger/TestFlight, ou « Bientôt » status-aware si pas d'URL) ; secondaire = contact email. Calendly = secondaire.
- Surface **freelance** (`/a-propos`, bloc Collaborer) : primaire = **email + CV** ; secondaire = Calendly.
Chaque CTA porte `{ role: primary|secondary, kind: app|email|cv|calendly, surface }` dans les données ; le composant `cta()` applique le style selon `role`.

## 9. Points WCAG 2.2 AA traités (AA dès le commit, gate bloquant)

| Point | Traitement |
|---|---|
| Contraste (SC 1.4.3) | Tokens couleur sur `#08090c` ; `--text-muted #868ba0` déjà ≥ 5:1 (vérifié existant) ; chaque paire fg/bg re-vérifiée par script + pa11y. |
| Drapeaux → texte (W3C i18n) | Suppression des emojis 🇫🇷🇬🇧 ; switcher = « FR / EN » texte, nom accessible, `lang`+`hreflang`. |
| Modale Calendly (APG dialog) | `role=dialog` + `aria-modal` + focus trap + ESC + retour focus + ✕ labellisé (mécanique existante réutilisée, déjà conforme). |
| Liens descriptifs (SC 2.4.4) | Noms uniques ; suppression des « GitHub → » dupliqués ; `aria-label` si texte visible insuffisant. |
| Vidéos (SC 1.2.2 / 2.3.3) | `controls`, pas d'autoplay sonore (muted), `<track kind=captions>` référencé (fichiers VTT = TODO si absents), `prefers-reduced-motion` respecté. |
| Ordre titres | `h1→h2→h3` réel ; « 01 — » décoratif (`aria-hidden` sur pseudo-numéro). |
| Skip-link `#main` | Déplace réellement le focus (existant conservé). |
| Gate | `pa11y-ci` sur toutes les routes `dist/` ; échec = build rouge (validation §13). |

**Règle dure §6** : la claim « accessibilité native » n'est ré-affichée comme argument que si le site passe AA. Les nouvelles pages naissent AA.

## 10. SEO / hreflang / JSON-LD

- `canonical` auto-référent par page (jamais EN→FR). `hreflang fr/en/x-default` réciproques, `x-default = racine FR`.
- Pas d'auto-redirect localStorage. EN servi à l'URL.
- JSON-LD status-aware généré : Home = `Organization`+`WebSite` (plus `og:type:website`, **plus `profile`**) ; `/fichechef` = `SoftwareApplication` **sans `offers`/`aggregateRating` tant que non publié** ; `/a-propos` = `Person`+`Organization`.
- `sitemap.xml` FR+EN avec `xhtml:link` alternates ; `robots.txt` → sitemap.

## 11. Garde-fous §11 — comment chacun est tenu

1. Liens App Store fabriqués → **interdit** ; `appStoreUrl:null` → rendu « Bientôt ». 2. Captures/notes inventées → **interdit** ; emplacements + TODO. 3. PII sans flag → `ENABLE_EMAIL_CAPTURE=false`, confidentialité non régressée. 4. Auto-redirect localStorage → **aucun**. 5. Workers + AASA → préservés (règle `_headers` intacte ; fichier AASA absent → consigné, pas inventé). 6. App pipeline affichée livrée → **interdit** (règle de rendu §5). 7. Claim « a11y native » → conditionnée AA. 8. Studio/CDI mélangés → séparés par URL. 9. Framework lourd → aucun (Node natif, pin wrangler seul).

## 12. Phases & commits (conventional)
A `docs:` (ce design + ADR) · B `chore:` (scaffold + content) · C `feat:` (build pipeline) · D `feat:` (pages FR+EN) · E `fix(a11y):` · F `feat(seo):` · G validations rapportées · H auto-audit · I `docs:` (README + TODO-CONTENT).

## 13. Risques / dépendances externes consignés
- Contenu `_draft` des 5 apps + statuts réels + captures = **fournis par l'humain** (TODO).
- Fichiers VTT sous-titres vidéos = absents → TODO, `<track>` référencé en placeholder.
- Fichier AASA réel = absent → TODO (à déposer à la publication FicheChef).
- `appStoreId`/URLs = null jusqu'au lancement → TODO.
- `ENABLE_EMAIL_CAPTURE` = décision humaine (défaut false).
- Migration du contenu légal : **fidèle**, vérifiée contre l'existant (extraction en cours).
