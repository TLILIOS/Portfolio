# Migration vers primdev.app

Ce document décrit la procédure exacte pour basculer le portfolio de l'hôte
GitHub Pages par défaut (`https://tlilios.github.io/`) vers le domaine
personnalisé `https://primdev.app/` le jour où le domaine sera acheté et
configuré.

Pré-requis : être propriétaire du domaine `primdev.app` chez un registrar,
accès au panneau DNS, accès aux settings GitHub du repo `TLILIOS.github.io`.

Auteur : TLILI HAMDI

---

## 1. Remplacement des URLs dans le code

Trois fichiers à mettre à jour :
- `index.html` — canonical, hreflang, Open Graph, Twitter Card, JSON-LD.
- `robots.txt` — ligne `Sitemap:` + commentaire d'en-tête.
- `sitemap.xml` — `<loc>` + trois `<xhtml:link hreflang>`.

### 1.1. Script `sed` (à lancer depuis la racine du repo)

```bash
# macOS/BSD sed (utilise -i ''), pour GNU sed remplacer par -i''
sed -i '' 's|https://tlilios\.github\.io|https://primdev.app|g' index.html robots.txt sitemap.xml
```

### 1.2. Mise à jour `<lastmod>` dans `sitemap.xml`

Éditer manuellement la ligne `<lastmod>` avec la date du jour au format ISO
8601 (`YYYY-MM-DD`).

### 1.3. Vérification post-remplacement

```bash
grep -rn "tlilios.github.io" index.html robots.txt sitemap.xml
# → doit retourner 0 résultat

grep -rn "primdev.app" index.html robots.txt sitemap.xml
# → doit retourner exactement 32 occurrences
```

---

## 2. Fichier `CNAME`

GitHub Pages utilise un fichier `CNAME` à la racine du repo pour déclarer le
domaine personnalisé.

```bash
echo 'primdev.app' > CNAME
```

Le fichier contient une seule ligne, sans protocole, sans slash :
`primdev.app`.

Commit : `chore(pages): add CNAME for primdev.app custom domain`

---

## 3. Configuration DNS

### 3.1. Enregistrements A (IPv4) sur l'apex `primdev.app`

Ajouter les quatre A records suivants pour `@` (apex) :

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

### 3.2. Enregistrements AAAA (IPv6) sur l'apex

```
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

### 3.3. Enregistrement CNAME pour le sous-domaine `www`

```
www.primdev.app  CNAME  tlilios.github.io.
```

(Note : GitHub gère la redirection `www.primdev.app` → `primdev.app`
automatiquement une fois le CNAME configuré côté Pages.)

### 3.4. Vérification DNS

```bash
dig +short primdev.app
# → doit retourner les quatre IPv4 GitHub Pages

dig +short AAAA primdev.app
# → doit retourner les quatre IPv6 GitHub Pages

dig +short CNAME www.primdev.app
# → tlilios.github.io.
```

Propagation : généralement 15 min – 2 h, parfois jusqu'à 48 h selon le
registrar et les TTLs.

---

## 4. Settings GitHub Pages

1. Repo `TLILIOS/TLILIOS.github.io` → `Settings` → `Pages`.
2. Dans `Custom domain`, saisir `primdev.app` et valider.
3. Attendre que GitHub affiche le check DNS vert (peut prendre quelques
   minutes après propagation DNS).
4. Cocher `Enforce HTTPS` une fois le certificat Let's Encrypt provisionné
   (15 min – 1 h après validation DNS). **Ne pas cocher avant** : HTTPS
   renverrait une erreur de certificat.

---

## 5. Google Search Console

### 5.1. Créer la nouvelle propriété `primdev.app`

1. Se connecter à `https://search.google.com/search-console`.
2. `Ajouter une propriété` → `Préfixe d'URL` → saisir
   `https://primdev.app/`.
3. Vérifier la propriété — méthode recommandée : balise HTML (ajouter un
   `<meta name="google-site-verification" content="..." />` dans le
   `<head>` de `index.html` juste avant le premier `<link rel="canonical">`).
4. Commit du meta tag :
   `chore(seo): add Google Search Console verification for primdev.app`.
5. Déployer, puis cliquer `Vérifier` dans GSC.

### 5.2. Soumettre le sitemap

Dans la nouvelle propriété `primdev.app` → `Sitemaps` → saisir
`sitemap.xml` → `Envoyer`.

### 5.3. Déclarer le changement d'adresse

Dans l'ancienne propriété `https://tlilios.github.io/` :
`Settings` → `Change of address` → sélectionner la nouvelle propriété
`https://primdev.app/` → suivre les étapes de validation.

Google conservera la nouvelle destination pendant ~180 jours — garder
`tlilios.github.io` accessible et servi pendant cette période (GitHub Pages
redirige automatiquement `tlilios.github.io` vers `primdev.app` tant que le
CNAME est actif).

### 5.4. Demander l'indexation de la home

Dans la propriété `primdev.app` → `Inspection d'URL` → saisir
`https://primdev.app/` → `Demander l'indexation`.

---

## 6. Mise à jour des backlinks

Remplacer `https://tlilios.github.io` par `https://primdev.app` dans :

- **Profil GitHub** `TLILIOS` → champ `Website`.
- **LinkedIn** `Hamdi Tlili` → section `Contact info` → `Website`.
- **X (Twitter)** `@TliliOS` → bio + lien profil.
- **Bluesky / Mastodon** si présents.
- **Signature email** si elle contient l'URL.
- **CV PDF** (ré-export avec nouvelle URL).

Ne pas **supprimer** les anciennes mentions de `tlilios.github.io` sur
des plateformes tierces (anciens forums, Stack Overflow, etc.) — la
redirection 301 gérée par GitHub Pages fera le travail.

---

## 7. Checklist finale post-migration

- [ ] `curl -sI https://primdev.app/` renvoie `200` + `server: GitHub.com`.
- [ ] `curl -sI http://primdev.app/` renvoie `301` vers HTTPS.
- [ ] `curl -sI https://www.primdev.app/` renvoie `301` vers
      `https://primdev.app/`.
- [ ] `curl -sI https://tlilios.github.io/` renvoie `301` vers
      `https://primdev.app/` (redirect GitHub Pages).
- [ ] `curl -s https://primdev.app/ | grep -E 'canonical|og:url'` affiche
      bien `primdev.app` et pas `tlilios.github.io`.
- [ ] GSC `primdev.app` : sitemap accepté, 0 erreur.
- [ ] GSC `tlilios.github.io` : `Change of address` enregistré.
- [ ] Tests mobile + desktop OK, certificat HTTPS valide (Let's Encrypt
      GitHub).

---

## 8. Rollback d'urgence (si DNS cassé)

1. GitHub → Settings → Pages → supprimer le `Custom domain`.
2. Supprimer le fichier `CNAME` du repo et pousser.
3. Rollback des commits de remplacement d'URL :
   ```bash
   sed -i '' 's|https://primdev\.app|https://tlilios.github.io|g' index.html robots.txt sitemap.xml
   ```
4. Push. Le site redevient immédiatement accessible sur
   `https://tlilios.github.io/`.
