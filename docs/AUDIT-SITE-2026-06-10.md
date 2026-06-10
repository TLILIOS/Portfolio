# AUDIT SITE — tlilios.github.io — 2026-06-10

**Périmètre** : portfolio one-page `https://tlilios.github.io/` — repo `TLILIOS/tlilios.github.io`, HEAD `c130d64` (2026-04-17).
**Méthode** : Lighthouse 13 (mobile + desktop, headless), analyse statique du HTML/CSS/JS, vérifications live `curl`, calculs de contraste WCAG.
**Auteur / Auditeur** : TLILI HAMDI

---

## 1. Synthèse exécutive

| Axe | Score | Verdict |
|---|---|---|
| Performance | **56/100 mobile** (LCP 18,1 s) — 100 desktop | 🔴 critique mobile |
| SEO technique | 100/100 Lighthouse | 🟢 excellent, P2 mineurs |
| UX & design | bon | 🟡 2 corrections (lien X, email) |
| Accessibilité | 100/100 Lighthouse | 🟡 2 manquements WCAG réels (2.2.2, 2.5.3) |
| Conformité & confiance | — | 🔴 insuffisant (légal absent) |

**Top 3 risques** :
1. **10,5 MB chargés au load, LCP mobile 18,1 s** — l'attribut `autoplay` annule `preload="none"` sur les 4 vidéos. Prospect mobile perdu avant affichage.
2. **Zéro mention légale, zéro politique de confidentialité, 3 cookies tiers déposés sans consentement** (Calendly → Cloudflare + Stripe) — LCEN art. 6-III et RGPD/ePrivacy opposables.
3. **Objectif App Store (FicheChef) non couvert** : aucune page privacy/support exigée par App Store Connect (Guideline 5.1.1) ; AASA impossible sur GitHub Pages (Content-Type non configurable).

---

## 2. Phase 1 — État des lieux

```
index.html        68 KB   (CSS + JS inline, 1 024 lignes, one-page FR/EN via toggle JS)
demo_seniorprep   3,8 MB  ┐
demo_eventorias   1,9 MB  │ 4 vidéos .mp4 = 7,3 MB
demo_medistock    988 KB  │
demo_tajmahal     872 KB  ┘
og-image.png      164 KB
robots.txt, sitemap.xml, MIGRATION_PRIMDEV.md
```

- **Live = code** ✓ : `last-modified: 17 Apr 2026 19:31 GMT` = date du HEAD `c130d64` ; `content-length` 69 442 cohérent avec `index.html` local. Aucun écart.
- Hébergement **GitHub Pages** (pas Cloudflare Workers) — `wrangler deployments list` sans objet ; Phase 3 adaptée en « Vérification infra GitHub Pages » (§5).
- Migration domaine custom documentée et prête : `MIGRATION_PRIMDEV.md`.

---

## 3. Findings par axe

### 3.1 Performance — mobile 56/100, desktop 100/100

**[P0] `autoplay` annule `preload="none"` → 10,5 MB au chargement, LCP 18,1 s mobile**
- Constat : les 4 `<video>` portent `autoplay` (`index.html:420,454,494,523`). Spec HTML : *« The preload attribute is expected to be ignored if autoplay is present »* (html.spec.whatwg.org §4.8.11). Les 3 vidéos below-the-fold (~3,7 MB) censées être différées se chargent donc immédiatement, en plus de la hero (3,8 MB). Lighthouse mobile : FCP 9,6 s, LCP 18,1 s, poids total 10 474 KiB (cibles : LCP < 2,5 s, poids < 500 KB hors images — web.dev/lcp).
- Impact : page inutilisable en 4G moyenne ; cible « prospects B2B » et « reviewers » perdue sur mobile.
- Correctif : retirer `autoplay` des 4 vidéos ; l'`IntersectionObserver` existant (`index.html:900-914`) appelle déjà `.play()` à l'entrée viewport — le chargement deviendra réellement différé. Ajouter un `poster` (frame JPEG/WebP ≈ 20 KB/vidéo) pour l'affichage instantané du cadre.
- Effort : **S**.

**[P1] `<link rel="preload" as="video">` télécharge le fichier entier** — `index.html:45`
- Le commentaire « métadonnées seulement » est inexact : `rel=preload` fetch la ressource complète (web.dev/preload-critical-assets). Double-coût avec le P0. Correctif : supprimer la ligne. Effort : **S**.

**[P1] Vidéos sur-encodées pour une surface de 194×426 px (314×678 en modal)**
- 3,8 MB pour `demo_seniorprep.mp4` ; cache GitHub Pages limité à `max-age=600` → re-téléchargements fréquents (3 813 KiB d'économie estimée par Lighthouse `cache-insight`).
- Correctif : ré-encoder à ~480p, H.264 CRF 28 ou HEVC/AV1, cible ≤ 1 MB/vidéo (`ffmpeg -vf scale=480:-2 -crf 28`). Effort : **M**.

**[P1] Calendly chargé d'emblée** — `index.html:41-42` + iframe `index.html:599`
- `widget.css` render-blocking dans `<head>` (230 ms est. desktop), iframe + sous-ressources (Stripe) chargées même si l'utilisateur ne scrolle jamais jusqu'à la section. Correctif : click-to-load (bouton « Afficher le calendrier » qui injecte script + iframe) — règle aussi le finding cookies (§3.5). Effort : **S/M**.

**[P2] `loading="lazy"` invalide sur `<video>`** — `index.html:454,494,523`
- Attribut défini uniquement pour `<img>` et `<iframe>` (MDN, html.spec.whatwg.org). Inopérant : à retirer pour ne pas masquer la vraie cause (autoplay). Effort : **S**.

**[P2] `dns-prefetch` au lieu de `preconnect` pour `assets.calendly.com`** — `index.html:38`
- Lighthouse estime 300 ms de gain avec `<link rel="preconnect">` (devient inutile si click-to-load adopté). Effort : **S**.

Positif : CLS 0 (dimensions vidéo explicites ✓), TBT 0 ms, CSS/JS inline (zéro requête bloquante propre au site), desktop 100.

### 3.2 SEO technique — 100/100

**[P2] hreflang fr/en/x-default pointent vers la même URL** — `index.html:27-29`, `sitemap.xml:9-11`
- hreflang sert à désambiguïser des URLs *distinctes* par langue (Google Search Central, « Tell Google about localized versions »). Le contenu EN n'existe que via toggle JS + `localStorage` : invisible des crawlers, seul le FR est indexé. Soit retirer les hreflang (honnête, zéro perte), soit créer une vraie URL `/en/` (chantier). Effort : **S** (retrait).

**[P2] Meta description 196 caractères** — `index.html:14`
- Tronquée en SERP (~155 visibles). Raccourcir en gardant « Senior iOS Developer freelance Paris · SwiftUI · Swift 6 ». Effort : **S**.

**[P2] `meta keywords` obsolète** — `index.html:15`
- Ignorée par Google depuis 2009 (Google Search Central Blog, « Google does not use the keywords meta tag »). Bruit : retirer. Effort : **S**.

**[P2] JSON-LD `sameAs` Twitter vs lien X incohérents** — `index.html:101` vs `:587` (cf. §3.3).

Positif : title < 60 c, canonical absolu ✓, sitemap + robots cohérents et servis ✓ (200, bons content-types), OG + Twitter Cards complets avec image 1200×630 ✓, JSON-LD `Person` + `Organization` + `WebSite` ✓, microdata `SoftwareApplication` par projet ✓, H1 unique ✓, GSC vérifié ✓.

### 3.3 UX & design

**[P1] Lien X pointe vers `https://x.com/home?lang=fr` au lieu du profil** — `index.html:587`
- L'aria-label promet « Profil X (Twitter) TliliOS » ; le visiteur atterrit sur le feed X générique (ou login). Lien de crédibilité cassé. Correctif : `https://x.com/TliliOS`. Effort : **S**.

**[P1] Email `hamdi.tlili@yahoo.fr` en mailto + JSON-LD** — `index.html:89,583`
- Dissonant avec le positionnement « studio premium » (objectif crédibilité éditeur) ; exposé au harvesting. Correctif : adresse sur domaine custom (iCloud+ Custom Domain déjà en place côté Prim) dès la migration ; à minima cohérence branding. Effort : **S** (post-migration).

**[P2] `< 480 px` : nav-links masqués sans alternative** — `index.html:338`
- `display:none`, pas de menu burger. Acceptable en one-page (scroll), mais les ancres directes Production/Stack/Contact disparaissent sur iPhone SE/mini. Correctif optionnel : garder « Contact » seul visible. Effort : **S**.

**[P2] CSS mort** : `.coming-soon-card` (`index.html:274-276`) n'est référencé par aucun élément. Nettoyage. Effort : **S**.

Positif : above-the-fold clair (label, H1, desc, 2 CTA < 5 s) ✓, breakpoints 1024/768/540/480 cohérents ✓, hero `clamp()` tient à 320 px ✓, design system soigné.

### 3.4 Accessibilité

**[P1] Vidéos en autoplay + boucle sans mécanisme de pause — WCAG 2.2.2 Pause, Stop, Hide (niveau A)**
- Contenu animé > 5 s démarrant automatiquement : l'utilisateur doit pouvoir le mettre en pause *sans* dépendre du réglage OS `prefers-reduced-motion` (WCAG 2.2, critère 2.2.2 ; EAA opposable). Correctif : retirer `autoplay` (= fix P0 perf, double bénéfice) ; en modal, `controls` est déjà activé en reduced-motion — l'activer systématiquement. Effort : **S**.

**[P1] Bouton langue : texte visible absent du nom accessible — WCAG 2.5.3 Label in Name (niveau A)**
- Flaggé par Lighthouse (`label-content-name-mismatch`) : `index.html:358` — texte visible « FR EN », `aria-label="Changer de langue"`. Échec en commande vocale (« cliquer FR » ne matche pas). Correctif : `aria-label="Changer de langue — FR ou EN"`. Effort : **S**.

**[P2] Contraste `--text-muted` #7a7f94 sur `--bg-elevated` #181b27 = 4,32:1 < 4,5:1** — état hover des stat-cards (`index.html:232`)
- WCAG 2.2 1.4.3 (AA texte normal, `.stat-label` ≈ 12,5 px). Sur fonds de base : 5,02:1 (✓) et 4,71:1 (✓ limite). Correctif : éclaircir `--text-muted` → `#868ba0` (≈ 4,8:1 sur #181b27). Effort : **S**.

Positif : skip-link ✓, landmarks header/main/footer + nav labellisée ✓, `:focus-visible` systématique ✓, focus trap + retour focus modal ✓, `aria-live` annonce de langue ✓, `prefers-reduced-motion` traité finement ✓, labels explicites sur tous les contrôles ✓. Lighthouse a11y 100/100 mobile + desktop.

### 3.5 Conformité & confiance

**[P0] Aucune mention légale ni politique de confidentialité**
- Site professionnel (freelance/studio) : LCEN art. 6-III — identité de l'éditeur, contact, hébergeur obligatoires. Des données personnelles sont traitées (Calendly : nom, email, créneau) : information RGPD art. 13 requise. Aucun lien dans le footer.
- Impact : non-conformité opposable + **bloquant pour l'objectif App Store** : App Store Connect exige une Privacy Policy URL et une Support URL publiques (App Store Review Guideline 5.1.1) — FicheChef ne peut pas être soumise en pointant ici.
- Correctif : créer `mentions-legales.html`, `confidentialite.html`, `support.html` (ou `/ficheChef/support`), liens footer sur la page. Effort : **M**.

**[P1] 3 cookies tiers déposés sans consentement**
- Mesuré par Lighthouse : `__cf_bm` + `_cfuvid` (Cloudflare, via assets.calendly.com) et `m` (**m.stripe.com**, chargé par l'iframe Calendly). Délibération CNIL 2020-091 / lignes directrices cookies : consentement préalable requis hors traceurs strictement nécessaires — un widget de prise de RDV chargé d'office avec Stripe ne l'est pas.
- Correctif : click-to-load Calendly (cf. §3.1) — aucun cookie avant action volontaire de l'utilisateur, et pas besoin de bannière de consentement. Le `localStorage` `prim.lang` est purement fonctionnel : exempté. Effort : **S/M**.

**[P2] Liens App Store/TestFlight** : aucun présent, aucun placeholder cassé — RAS tant que FicheChef n'est pas publiée.

---

## 4. Plan d'action

### Quick wins (effort S, < 1 h chacun) — ordre impact/effort

| # | Action | Findings réglés | Fichier |
|---|---|---|---|
| 1 | Retirer `autoplay` des 4 vidéos + supprimer `<link rel=preload as=video>` + retirer `loading="lazy"` invalide ; ajouter `controls` au modal | P0 perf, P1 preload, P1 WCAG 2.2.2, P2 lazy | `index.html:45,420,454,494,523,616` |
| 2 | Lien X → `https://x.com/TliliOS` | P1 UX | `index.html:587` |
| 3 | `aria-label` du lang-toggle incluant « FR » et « EN » | P1 WCAG 2.5.3 | `index.html:358` |
| 4 | Click-to-load Calendly (retirer css/js du head, bouton d'activation) | P1 cookies RGPD, P1 perf | `index.html:41-42,599` |
| 5 | Meta description ≤ 155 c ; retirer `meta keywords` ; retirer hreflang (ou documenter le choix) | P2 SEO ×3 | `index.html:14,15,27-29` + `sitemap.xml` |
| 6 | `--text-muted` → `#868ba0` | P2 contraste | `index.html:168` |
| 7 | `404.html` custom (charte sombre, lien retour) | P2 infra | nouveau fichier |

### Chantiers (M/L)

| # | Action | Effort | Note |
|---|---|---|---|
| 8 | Pages légales : mentions, confidentialité, support FicheChef + liens footer | **M** | Précondition soumission App Store |
| 9 | Ré-encodage vidéos ≤ 1 MB (480p, CRF 28) + posters | **M** | ~80 % du poids page en moins |
| 10 | Posters WebP par vidéo (frame extraite) | **S/M** | Combiné avec #9 |
| 11 | Migration domaine custom (`MIGRATION_PRIMDEV.md` prêt) — ou Cloudflare Workers si Universal Links FicheChef requis (AASA, cf. §5) | **L** | Décision produit |

---

## 5. Checklist infra — GitHub Pages (Phase 3 adaptée)

| Point | État | Détail / correctif |
|---|---|---|
| HTTP → HTTPS 301 | ✅ conforme | `curl -sI http://tlilios.github.io/` → 301 |
| TLS / HSTS | ✅ conforme | `strict-transport-security: max-age=31556952` (sans `includeSubDomains`/`preload` — non configurable sur Pages) |
| HTTP/3 | ⚠️ absent | Pas d'`alt-svc` : h2 seulement. Non configurable (Fastly côté GitHub). |
| **AASA** | ❌ **impossible** | `/.well-known/apple-app-site-association` → 404 ; même ajouté, Pages servirait le fichier sans extension en `application/octet-stream`, or Apple exige `application/json` (Apple Docs — Supporting Associated Domains). **Universal Links FicheChef ⇒ migration Workers obligatoire** (raison du choix initial du prompt primapp.dev, confirmée). |
| Headers sécurité (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) | ❌ absents | Headers custom non configurables sur Pages. Mitigation partielle : `<meta http-equiv="Content-Security-Policy">` (limité — pas de `frame-ancestors`). Réglé nativement en migrant vers Workers. |
| Cache | ⚠️ limité | `max-age=600` uniforme, pas d'`immutable` possible. Pénalise les vidéos (3,8 MB re-téléchargés). Non configurable. |
| 404 custom | ❌ absent | Page GitHub par défaut (anglais, hors charte). `404.html` à la racine — quick win #7. |
| Custom domain / www | N/A | Sous-domaine github.io ; bascule documentée dans `MIGRATION_PRIMDEV.md` (procédure vérifiée, correcte). |
| Analytics cookieless | 💡 reco | Cloudflare Web Analytics (script, cookieless, sans bannière) injectable même sur Pages ; sinon attendre la migration. |

**Conclusion infra** : les 4 limitations structurelles (headers sécurité, cache, AASA, HTTP/3) sont intrinsèques à GitHub Pages. Tant que le site reste une vitrine sans Universal Links, elles sont tolérables ; dès que FicheChef nécessite AASA ou des pages légales servies avec de vrais headers, la migration vers Cloudflare Workers Static Assets (ou a minima le domaine custom + proxy Cloudflare) devient le chemin critique.

---

## Sources

- web.dev — LCP, Preload critical assets, Lazy loading video
- HTML Living Standard §4.8.11 (media elements : autoplay/preload) — html.spec.whatwg.org
- MDN — `loading` attribute (`img`/`iframe` uniquement)
- Google Search Central — Localized versions (hreflang), Keywords meta tag (2009), Sitemaps
- WCAG 2.2 — 1.4.3 Contrast (Minimum), 2.2.2 Pause Stop Hide, 2.5.3 Label in Name
- EAA — Directive (UE) 2019/882 ; LCEN art. 6-III ; RGPD art. 13 ; CNIL — Cookies et autres traceurs (délibération 2020-091)
- Apple Developer Documentation — Supporting Associated Domains ; App Store Review Guidelines 5.1.1
- GitHub Docs — About custom domains and GitHub Pages

---

**Validé par : TLILI HAMDI** — rapport en attente de validation avant toute modification de code (implémentation par lots, un commit par axe, P0 d'abord).
