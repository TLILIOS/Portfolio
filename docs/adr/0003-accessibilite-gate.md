# ADR-0003 — Accessibilité AA au commit, gate automatisé bloquant

- Statut : Accepté
- Date : 2026-06-17
- Auteur : TLILI HAMDI

## Contexte

Le site revendiquait « accessibilité native » comme argument produit alors que rien ne garantissait que le site **lui-même** soit conforme. L'EAA (Directive (UE) 2019/882) est opposable depuis juin 2025 ; WCAG 2.2 AA est la cible. Un audit a posteriori arrive trop tard et n'empêche pas la régression.

## Décision

Les pages naissent **conformes AA** ; un check automatisé **bloque** le build.
- Tokens couleur dont chaque paire fg/bg est vérifiée **≥ 4.5:1** (texte normal) / **≥ 3:1** (texte large) contre `#08090c`.
- Drapeaux emoji 🇫🇷🇬🇧 **remplacés par texte « FR / EN »** (un drapeau n'est pas une langue — W3C i18n) ; switcher avec nom accessible + `lang` + `hreflang`.
- Modale Calendly : `role="dialog"` + `aria-modal="true"` + focus trap + ESC + retour de focus + ✕ labellisé (WAI-ARIA APG dialog).
- Liens à noms uniques/descriptifs (SC 2.4.4) ; démos vidéo = screencasts **muets sans audio** → SC 1.2.2 non applicable, **aucun `<track>`/.vtt requis** ; `controls` à l'ouverture modale, pas d'autoplay sonore, légende visible (`figcaption`), `prefers-reduced-motion` respecté (SC 2.3.3) ; ordre de titres `h1→h2→h3` réel, numérotation « 01 — » décorative ; skip-link `#main` qui déplace réellement le focus.
- **Gate** : `scripts/a11y-gate.mjs` (axe-core sur Chrome headless via puppeteer) sur **toutes les routes** de `dist/` ; échec sur toute **violation** WCAG2AA réelle, sinon build rouge. `pa11y-ci` reste disponible (`.pa11yci`) mais conflait les résultats *incomplete* d'axe (texte au-dessus d'un `background-image` gradient que la machine ne peut trancher seule) avec de vraies erreurs — d'où le gate maison qui ne bloque que sur `violations`. Les `incomplete` (hero/collaborate à fond gradient) sont vérifiés **manuellement** : chaque paire fg/bg calculée ≥ 4.5:1 sur un fond solide de repli (`background-color` ajouté sous le gradient, plancher mesuré 5,38:1 pour `--text-muted`). Aucun vrai défaut n'est exclu. Résidus consignés dans `TODO-CONTENT.md`.

**Règle dure** : la claim « accessibilité native » ne réapparaît sur le site comme argument que **lorsque le site lui-même passe AA**.

## Conséquences

- Toute régression de contraste ou de pattern ARIA casse le build avant déploiement.
- Coût : un check a11y dans le pipeline ; dépendance dev `pa11y-ci`.
- Démos vidéo muettes (sans audio) : pas de sous-titres VTT requis (SC 1.2.2 non applicable). Légende visible `figcaption` à la place.
