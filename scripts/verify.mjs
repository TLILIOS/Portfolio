#!/usr/bin/env node
// scripts/verify.mjs — Contrôles maison (validation §13) sur la sortie dist/ :
//  - réciprocité hreflang FR↔EN + canonical auto-référent + x-default=FR par page
//  - présence sitemap.xml (avec alternates) et robots.txt
//  - règle _headers AASA application/json présente
//  - aucun auto-redirect localStorage (le JS ne redirige pas)
// Sort en code != 0 si une vérification échoue.

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { routes, outputPathFor } from "../content/routes.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const PUBLIC = join(ROOT, "public");
const SITE_URL = "https://primapp.dev";

const errors = [];
const ok = [];

const read = async (p) => (existsSync(p) ? readFile(p, "utf8") : null);

function check(cond, label) {
  if (cond) ok.push(label);
  else errors.push(label);
}

async function main() {
  // 1. Par page : canonical auto-référent + hreflang fr/en/x-default présents et réciproques.
  for (const route of routes) {
    for (const lang of ["fr", "en"]) {
      const rel = outputPathFor(route[lang]);
      const html = await read(join(DIST, rel));
      if (html == null) {
        errors.push(`Page manquante : ${rel}`);
        continue;
      }
      const selfUrl = `${SITE_URL}${route[lang]}`;
      const frUrl = `${SITE_URL}${route.fr}`;
      const enUrl = `${SITE_URL}${route.en}`;

      check(
        html.includes(`<link rel="canonical" href="${selfUrl}">`),
        `canonical auto-référent — ${rel}`
      );
      check(html.includes(`hreflang="fr" href="${frUrl}"`), `hreflang fr — ${rel}`);
      check(html.includes(`hreflang="en" href="${enUrl}"`), `hreflang en — ${rel}`);
      check(
        html.includes(`hreflang="x-default" href="${frUrl}"`),
        `x-default = FR — ${rel}`
      );
      // Pas d'auto-redirect : aucune redirection JS basée sur la langue.
      check(
        !/location\.(href|replace|assign)\s*=/.test(html) &&
          !/window\.location\s*=/.test(html),
        `aucun auto-redirect localStorage/JS — ${rel}`
      );
    }
  }

  // 2. Réciprocité explicite : la jumelle EN pointe vers FR et inversement (déjà couvert par
  //    hreflang identiques des deux côtés, on le vérifie en croisé).
  for (const route of routes) {
    const frHtml = await read(join(DIST, outputPathFor(route.fr)));
    const enHtml = await read(join(DIST, outputPathFor(route.en)));
    const frUrl = `${SITE_URL}${route.fr}`;
    const enUrl = `${SITE_URL}${route.en}`;
    check(
      frHtml && enHtml && frHtml.includes(enUrl) && enHtml.includes(frUrl),
      `réciprocité FR↔EN — ${route.key}`
    );
  }

  // 3. sitemap + robots.
  const sitemap = await read(join(DIST, "sitemap.xml"));
  check(!!sitemap && sitemap.includes("xhtml:link"), "sitemap.xml avec alternates xhtml:link");
  check(!!sitemap && sitemap.includes(`${SITE_URL}/en/`), "sitemap inclut les URLs EN");
  const robots = await read(join(DIST, "robots.txt"));
  check(!!robots && robots.includes("Sitemap:"), "robots.txt référence le sitemap");

  // 4. _headers AASA content-type (préservé, non régressé).
  const headers = (await read(join(PUBLIC, "_headers"))) || "";
  check(
    headers.includes("apple-app-site-association") &&
      /Content-Type:\s*application\/json/.test(headers),
    "_headers : AASA servi en application/json (universal links non régressés)"
  );

  // Rapport.
  console.log(`✓ ${ok.length} contrôles OK.`);
  if (errors.length) {
    console.error(`\n✗ ${errors.length} contrôle(s) en échec :`);
    for (const e of errors) console.error(`   - ${e}`);
    process.exit(1);
  }
  console.log("✓ Réciprocité hreflang, sitemap/robots, AASA content-type : conformes.");
}

main().catch((e) => {
  console.error("verify.mjs erreur :", e);
  process.exit(1);
});
