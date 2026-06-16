// content/routes.js — Table canonique des routes (UNIQUE source du hreflang réciproque et du sitemap).
// Toute page ajoutée passe par ici. `fr`/`en` = chemins propres servis à l'URL (sans index.html).
// `template` = quelle fonction de rendu utiliser. `data` = clé du fichier content/pages/*.
// `sitemap` = annotations sitemap.xml. `inNav`/`inFooter` = présence dans le chrome.

export const routes = [
  {
    key: "home",
    fr: "/",
    en: "/en/",
    template: "home",
    data: "home",
    sitemap: { priority: "1.0", changefreq: "monthly" },
  },
  {
    key: "fichechef",
    fr: "/fichechef",
    en: "/en/fichechef",
    template: "app",
    data: "fichechef",
    appId: "fichechef",
    sitemap: { priority: "0.9", changefreq: "monthly" },
  },
  {
    key: "fichechef-privacy",
    fr: "/fichechef/privacy",
    en: "/en/fichechef/privacy",
    template: "legal",
    data: "fichechef-privacy",
    sitemap: { priority: "0.1", changefreq: "yearly" },
  },
  {
    key: "fichechef-support",
    fr: "/fichechef/support",
    en: "/en/fichechef/support",
    template: "legal",
    data: "fichechef-support",
    sitemap: { priority: "0.3", changefreq: "yearly" },
  },
  {
    key: "about",
    fr: "/a-propos",
    en: "/en/about",
    template: "about",
    data: "about",
    sitemap: { priority: "0.7", changefreq: "monthly" },
  },
  {
    key: "legal-notice",
    fr: "/mentions-legales",
    en: "/en/legal-notice",
    template: "legal",
    data: "legal-notice",
    sitemap: { priority: "0.1", changefreq: "yearly" },
  },
  {
    key: "privacy",
    fr: "/confidentialite",
    en: "/en/privacy",
    template: "legal",
    data: "privacy",
    sitemap: { priority: "0.1", changefreq: "yearly" },
  },
  {
    key: "support",
    fr: "/support",
    en: "/en/support",
    template: "legal",
    data: "support",
    sitemap: { priority: "0.3", changefreq: "yearly" },
  },
];

// Mappe un chemin propre vers son fichier de sortie sous la racine du build.
// "/" -> "index.html" ; "/fichechef" -> "fichechef/index.html" (URLs propres, html_handling auto-trailing-slash).
export function outputPathFor(routePath) {
  if (routePath === "/") return "index.html";
  const clean = routePath.replace(/^\/+|\/+$/g, "");
  return `${clean}/index.html`;
}
