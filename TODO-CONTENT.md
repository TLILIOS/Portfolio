# TODO-CONTENT — ce que l'humain doit fournir / valider

> Manifeste des manques **honnêtement consignés** (principe : autonome en exécution, honnête sur le contenu). Rien n'a été fabriqué : là où une donnée réelle manque, le build a généré un gabarit + un emplacement, et le manque est listé ici. Auteur : TLILI HAMDI.

## 0. Écart prompt ↔ réalité repéré (à arbitrer)

- Le prompt de refonte (§1) affirme « l'AASA est déjà servi avec `Content-Type: application/json` pour FicheChef ». **Réalité du repo** : le fichier `public/.well-known/apple-app-site-association` **n'existe pas** ; seule la **règle `_headers`** (qui forcera le content-type) est en place. Aucune régression possible sur un fichier absent — la règle est préservée. **Action** : déposer le vrai fichier AASA à la publication de FicheChef (cf. §4).

## 1. Copie des apps (`content/apps.json`, tous `_draft: true`)

Les 5 apps sont pré-remplies avec des **statuts conservateurs** et de la copie marquée `_draft`. **À valider / corriger** :

| App | Statut posé | À faire |
|---|---|---|
| `fichechef` | `coming-soon` (flagship) | Valider tagline/summary/features/differentiators FR+EN. Confirmer la catégorie (`Food & cost management`) et `applicationCategory` schema.org (`BusinessApplication`). |
| `lune` | `in-development` | **Copie placeholder** — tout à écrire (tagline, summary, features, differentiators FR+EN). Confirmer le statut réel. |
| `prim-cfo` | `in-development` | Copie placeholder à valider. Confirmer nom commercial et statut. |
| `sobre` | `concept` | Copie placeholder. Confirmer si l'app doit apparaître (les `concept` sans visuel ne sont qu'en ligne « À l'étude »). |
| `mondpe` | `concept` | Copie placeholder. Idem. |

Régle de rendu : une carte produit n'apparaît que si `showOnHome` ET (`status ∈ {available, coming-soon}` OU au moins une capture réelle). **Aucune app n'est affichée comme livrée sans preuve.**

## 2. Captures d'écran réelles

- **Aucune capture réelle n'est disponible** → `screenshots: []` pour toutes les apps. La home et `/fichechef` affichent un **emplacement honnête** (« Captures d'écran à venir »).
- **Action** : déposer les fichiers sous `public/assets/<app>/` (ex. `public/assets/fichechef/shot-1.png`), puis renseigner dans `apps.json` :
  ```json
  "screenshots": [ { "src": "/assets/fichechef/shot-1.png", "alt": { "fr": "…", "en": "…" } } ]
  ```
  Dès qu'une capture réelle est présente, elle alimente aussi le `screenshot` du JSON-LD `SoftwareApplication`.

## 3. Statuts réels des apps

Les statuts posés sont **conservateurs**. Corriger dans `apps.json` selon la réalité (`available` exige une `appStoreUrl` non nulle — contrôlé au build).

## 4. Lancement d'une app (FicheChef en priorité)

À la **publication** d'une app, renseigner dans `apps.json` :
- `appStoreUrl` (le CTA « Bientôt » devient automatiquement un vrai lien « Télécharger »).
- `testflightUrl` si bêta (CTA « Rejoindre la bêta TestFlight »).
- `appStoreId` (active le Smart App Banner `<meta name="apple-itunes-app">` — **à câbler dans le template au lancement**, cohérent avec l'AASA).
- `priceEUR` (number, `0` si gratuit) pour émettre `offers` dans le JSON-LD — **uniquement après publication**.
Et déposer **`public/.well-known/apple-app-site-association`** (universal links) — servi en `application/json` par la règle `_headers` déjà en place.

## 5. Vidéos de démonstration — RÉSOLU (pas de VTT)

- Les démos portfolio (`/a-propos`) sont des **screencasts muets, sans piste audio**. WCAG 1.2.2 (sous-titres) ne s'applique pas à un média sans audio : **aucun fichier `.vtt` ni `<track>` n'est requis**. Décision figée — ne pas réintroduire de TODO sous-titres.
- A11y vidéo couverte autrement : `muted`, pas d'autoplay sonore, `controls` à l'ouverture de la modale, `prefers-reduced-motion` respecté, légende visible (`figcaption` / caption) sous chaque vidéo.

## 6. Décision `ENABLE_EMAIL_CAPTURE`

- Défaut **`false`** (fail-safe) dans `content/config.json` : aucun formulaire, page confidentialité inchangée.
- **Action si capture souhaitée** : passer à `true`, choisir un sous-traitant **EU**, implémenter le formulaire (consentement explicite), **et** mettre à jour la confidentialité (base légale, finalité, sous-traitant, durée). Ne jamais activer la collecte PII implicitement.

## 7. Assets binaires à vérifier

- `public/og-image.png` (1200×630) — réutilisé de l'existant ; vérifier qu'il reflète le studio (et non le portfolio CDI). À refaire au branding studio si besoin.
- `public/cv-tlili-hamdi.pdf` — cible du CTA CV de `/a-propos`. Tenir à jour.
- Les anciennes vidéos de démo (`demo_*.mp4`, `poster_*.jpg`) restent dans `public/` mais **ne sont plus référencées** par les pages studio-first. À supprimer si inutiles (le build ne les supprime pas — non-destructif).

## 8. Résidus a11y (gate)

- Gate axe : **0 violation WCAG2AA** sur les 16 routes. 6 résultats *incomplete* (texte au-dessus du gradient hero/collaborate) — **vérifiés manuellement** : chaque paire fg/bg ≥ 4.5:1 sur fond solide de repli (plancher 5,38:1). Aucun résidu bloquant.
- `pa11y-ci` (config `.pa11yci`) conflait *incomplete* et erreurs → on utilise `scripts/a11y-gate.mjs` (ne bloque que sur violations réelles). `pa11y-ci` reste disponible pour inspection manuelle.

## 9. Textes éditoriaux à relire (non bloquant)

- Home : hero, méthode (4 cartes), teaser fondateur, contact — relire le ton studio.
- `/a-propos` : bloc « Collaborer — CDI & missions », messaging anti-fuite-recruteur. Relire.
- Pages légales/support : **migrées fidèlement** de l'existant (confidentialité RGPD non régressée). Harmoniser éventuellement les dates (« 10 juin 2026 » site vs « avril 2026 » FicheChef).
