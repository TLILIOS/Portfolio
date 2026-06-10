# Migration vers primapp.dev — Cloudflare Workers Static Assets

Remplace `MIGRATION_PRIMDEV.md` (cible abandonnée : primdev.app / GitHub Pages custom domain).
Nouvelle cible : **primapp.dev**, domaine Cloudflare Registrar + NS Cloudflare,
hébergement **Cloudflare Workers Static Assets** (worker `primapp-site`, assets-only).

Auteur : TLILI HAMDI — 2026-06-10

---

## Décisions structurantes

1. **Workers Static Assets, pas Cloudflare Pages** : Pages est en mode maintenance,
   Cloudflare oriente les nouveaux projets vers Workers (Cloudflare Docs — Workers
   static assets). Requêtes d'assets statiques gratuites et illimitées.
2. **Pas de fichier `CNAME` GitHub** : un custom domain sur le user-site
   `TLILIOS/tlilios.github.io` déplacerait *tous* les project-sites sous le domaine
   (GitHub Docs — About custom domains), donc `tlilios.github.io/scope` deviendrait
   `primapp.dev/scope` → cassé. La redirection de l'ancien host est gérée par les
   pages `index.html` + `404.html` à la **racine du repo** (meta refresh 0 +
   `location.replace` préservant le chemin + `rel=canonical` + `noindex`).
   Limite assumée : ce n'est pas un 301 serveur — Google traite le meta refresh 0
   comme une redirection permanente (Search Central — Redirects and Google Search).
3. **Arborescence** : le site vit dans `public/` (cf. `wrangler.jsonc`), la racine du
   repo ne contient que la config, les docs et les pages de redirection GitHub Pages.

---

## État de la branche `migration/primapp-dev` (déjà fait)

- [x] `wrangler.jsonc` — worker assets-only, `404-page`, `auto-trailing-slash`.
- [x] `public/_headers` — CSP, nosniff, Referrer-Policy, Permissions-Policy, HSTS,
      cache 7 j médias, `Content-Type: application/json` prêt pour l'AASA FicheChef.
- [x] `public/_redirects` — `www.primapp.dev/* → primapp.dev/:splat 301`.
- [x] URLs basculées (27 occurrences), liens `/scope/` préservés.
- [x] Hébergeur Cloudflare dans mentions légales + confidentialité.
- [x] Emails : `hamdi.tlili@primapp.dev` (contact), `support@primapp.dev` (support).
- [x] Pages de redirection racine pour l'ancien host GitHub Pages.

---

## Étapes d'activation (manuel, dashboard Cloudflare)

### 1. Connecter le repo (Workers Builds)

Dash Cloudflare → **Workers & Pages → Create → Workers → Import a repository** →
`TLILIOS/tlilios.github.io`, branche `migration/primapp-dev` (puis `main` après merge).
- Build command : *(vide)*
- Deploy command : `npx wrangler deploy`
- Root directory : `/`

Alternative CLI sans Builds : `npx wrangler deploy` depuis la racine (login `wrangler login`).

### 2. Attacher les domaines au Worker

Worker `primapp-site` → **Settings → Domains & Routes → Add → Custom domain** :
- `primapp.dev`
- `www.primapp.dev` (nécessaire pour que la règle `_redirects` www→apex s'exécute)

NS déjà chez Cloudflare → DNS + certificat automatiques (quelques minutes).

### 3. Vérifications post-déploiement

```bash
curl -sI https://primapp.dev/ | grep -iE 'content-security|nosniff|referrer|permissions|strict-transport'
curl -sI https://www.primapp.dev/ | head -3          # → 301 vers apex
curl -s -o /dev/null -w "%{http_code}\n" https://primapp.dev/nexistepas   # → 404
curl -sI https://primapp.dev/demo_seniorprep.mp4 | grep -i cache-control  # → max-age=604800
curl -sIL --http3 https://primapp.dev/ | head -1                          # → HTTP/3
```

### 4. Merger la branche dans `main`

**Seulement une fois primapp.dev en ligne** (sinon les pages de redirection racine,
servies par GitHub Pages, pointeraient vers un domaine mort) :

```bash
git checkout main && git merge migration/primapp-dev && git push origin main
```

Effets simultanés : Workers Builds redéploie depuis `main` ; GitHub Pages sert
désormais les pages de redirection → l'ancien host bascule.

```bash
curl -s https://tlilios.github.io/ | grep primapp.dev      # page de redirection
curl -s https://tlilios.github.io/scope/ | head -3         # scope intact
```

### 5. Google Search Console

1. Nouvelle propriété **Domaine** `primapp.dev` (vérification DNS TXT — un clic,
   Cloudflare étant le registrar).
2. Soumettre `https://primapp.dev/sitemap.xml`.
3. Ancienne propriété `tlilios.github.io` → **Change of address** → `primapp.dev`.
   Garder les pages de redirection ≥ 180 jours.
4. Inspection d'URL → demander l'indexation de la home.

### 6. Backlinks & profils

Remplacer `tlilios.github.io` par `primapp.dev` : profil GitHub (Website), LinkedIn,
bio X `@TliliOS`, signature email, CV PDF.

### 7. Emails (iCloud+ Custom Domain)

Créer/vérifier les adresses sur le domaine **avant** le merge :
- `hamdi.tlili@primapp.dev` (contact, mailto + JSON-LD)
- `support@primapp.dev` (page support — alias iCloud+ possible)

### 8. Plus tard — FicheChef

- Déposer le fichier AASA dans `public/.well-known/apple-app-site-association`
  (sans extension) — la règle `_headers` `Content-Type: application/json` est déjà prête.
- Ajouter la SoftwareApplication FicheChef au JSON-LD + lien App Store.
- Réintroduire le SIREN dans `mentions-legales.html` dès immatriculation.

---

## Rollback d'urgence

1. Worker → Settings → Domains : détacher `primapp.dev` / `www`.
2. `git revert` du merge sur `main` (ne **pas** force-push) → GitHub Pages ressert le site.
3. GSC : ne pas annuler le Change of address avant 48 h de recul.
