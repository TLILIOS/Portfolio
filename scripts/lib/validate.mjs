// scripts/lib/validate.mjs — Validation des schémas content/. Échec build si invalide.
// Pas de dépendance externe (Ajv) — validation impérative ciblée, suffisante pour ce périmètre.

const APP_STATUSES = ["available", "coming-soon", "in-development", "concept"];
const LOCALES = ["fr", "en"];

function fail(errors) {
  const e = new Error(`Validation des schémas échouée :\n - ${errors.join("\n - ")}`);
  e.isValidation = true;
  throw e;
}

export function validateConfig(config) {
  const errs = [];
  if (typeof config.SITE_URL !== "string" || !config.SITE_URL.startsWith("https://"))
    errs.push("config.SITE_URL doit être une URL https.");
  if (!Array.isArray(config.LOCALES) || config.LOCALES.length === 0)
    errs.push("config.LOCALES doit être un tableau non vide.");
  if (!config.LOCALES.includes(config.X_DEFAULT))
    errs.push("config.X_DEFAULT doit appartenir à LOCALES.");
  if (typeof config.ENABLE_EMAIL_CAPTURE !== "boolean")
    errs.push("config.ENABLE_EMAIL_CAPTURE doit être un booléen (fail-safe).");
  if (errs.length) fail(errs);
}

export function validateRoutes(routes) {
  const errs = [];
  const keys = new Set();
  const frPaths = new Set();
  const enPaths = new Set();
  for (const r of routes) {
    if (!r.key) errs.push("Une route sans `key`.");
    if (keys.has(r.key)) errs.push(`Clé de route dupliquée : ${r.key}.`);
    keys.add(r.key);
    if (typeof r.fr !== "string" || !r.fr.startsWith("/"))
      errs.push(`Route ${r.key}: champ fr invalide.`);
    if (typeof r.en !== "string" || !r.en.startsWith("/en"))
      errs.push(`Route ${r.key}: champ en doit commencer par /en.`);
    if (frPaths.has(r.fr)) errs.push(`Chemin FR dupliqué : ${r.fr}.`);
    if (enPaths.has(r.en)) errs.push(`Chemin EN dupliqué : ${r.en}.`);
    frPaths.add(r.fr);
    enPaths.add(r.en);
    if (!r.template) errs.push(`Route ${r.key}: `+"`template` manquant.");
    if (!r.data) errs.push(`Route ${r.key}: `+"`data` manquant.");
  }
  if (errs.length) fail(errs);
}

export function validateApps(appsDoc) {
  const errs = [];
  if (!Array.isArray(appsDoc.apps)) fail(["apps.json: `apps` doit être un tableau."]);
  const ids = new Set();
  for (const app of appsDoc.apps) {
    const id = app.id || "(sans id)";
    if (!app.id || !/^[a-z0-9-]+$/.test(app.id))
      errs.push(`App ${id}: id manquant ou non-kebab-case.`);
    if (ids.has(app.id)) errs.push(`App id dupliqué : ${app.id}.`);
    ids.add(app.id);
    if (!APP_STATUSES.includes(app.status))
      errs.push(`App ${id}: status invalide (${app.status}). Attendu ${APP_STATUSES.join("|")}.`);
    if (typeof app.flagship !== "boolean") errs.push(`App ${id}: flagship doit être booléen.`);
    if (typeof app.showOnHome !== "boolean") errs.push(`App ${id}: showOnHome doit être booléen.`);
    if (!app.name) errs.push(`App ${id}: name manquant.`);
    for (const loc of LOCALES) {
      if (!app.tagline || typeof app.tagline[loc] !== "string")
        errs.push(`App ${id}: tagline.${loc} manquant.`);
      if (!app.summary || typeof app.summary[loc] !== "string")
        errs.push(`App ${id}: summary.${loc} manquant.`);
    }
    // Garde-fou anti-fabrication : URLs null ou string http(s).
    for (const k of ["appStoreUrl", "testflightUrl"]) {
      if (app[k] !== null && !(typeof app[k] === "string" && app[k].startsWith("https://")))
        errs.push(`App ${id}: ${k} doit être null ou une URL https (jamais fabriquée).`);
    }
    if (app.appStoreId !== null && typeof app.appStoreId !== "string")
      errs.push(`App ${id}: appStoreId doit être null ou string.`);
    if (!Array.isArray(app.screenshots))
      errs.push(`App ${id}: screenshots doit être un tableau (vide si aucune capture réelle).`);
    // Cohérence status-aware : une app 'available' sans appStoreUrl est incohérente.
    if (app.status === "available" && !app.appStoreUrl)
      errs.push(`App ${id}: status 'available' sans appStoreUrl — incohérent (anti-vaporware).`);
  }
  if (errs.length) fail(errs);
}

export function validateAll({ config, routes, appsDoc }) {
  validateConfig(config);
  validateRoutes(routes);
  validateApps(appsDoc);
}

// Règle de rendu home (§3.2) : carte visible ssi showOnHome ET
// (status ∈ {available, coming-soon} OU >=1 screenshot réel).
export function appHasVisibleCard(app) {
  const hasShot = Array.isArray(app.screenshots) && app.screenshots.length > 0;
  return app.showOnHome && (["available", "coming-soon"].includes(app.status) || hasShot);
}
