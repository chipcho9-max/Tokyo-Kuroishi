#!/usr/bin/env node
/* Regenerate sitemap.xml and robots.txt from the pages actually on disk.

     node scripts/gen-sitemap.js

   The base URL is read from index.html's canonical link rather than being
   written down here, so this cannot drift out of step with
   scripts/set-base-url.js the way a second hardcoded copy would.
*/

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const LANGS = ["", "ja", "ko"];

function base() {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const m = html.match(/<link rel="canonical" href="([^"]+)">/);
  if (!m) throw new Error("no canonical link in index.html");
  return m[1].endsWith("/") ? m[1] : m[1] + "/";
}

/* Pages are whatever exists in all three languages — add a page and it is
   picked up, with no list to remember to update. */
function pages() {
  const inRoot = fs.readdirSync(ROOT)
    .filter((f) => f.endsWith(".html"))
    .map((f) => f.replace(/\.html$/, ""));
  const all = inRoot.filter((p) =>
    LANGS.every((l) => fs.existsSync(path.join(ROOT, l, p + ".html")))
  );
  // index first, the rest alphabetical — stable output across runs
  return all.sort((a, b) => (a === "index" ? -1 : b === "index" ? 1 : a.localeCompare(b)));
}

function urlFor(BASE, lang, page) {
  const dir = lang ? lang + "/" : "";
  return BASE + dir + (page === "index" ? "" : page + ".html");
}

function main() {
  const BASE = base();
  const PAGES = pages();
  const missing = [];
  for (const l of LANGS) {
    for (const p of PAGES) {
      if (!fs.existsSync(path.join(ROOT, l, p + ".html"))) missing.push(`${l}/${p}`);
    }
  }
  if (missing.length) throw new Error("missing translations: " + missing.join(", "));

  const entries = [];
  for (const page of PAGES) {
    for (const lang of LANGS) {
      const alts = LANGS.map(
        (l) => `    <xhtml:link rel="alternate" hreflang="${l || "en"}" href="${urlFor(BASE, l, page)}"/>`
      ).join("\n");
      entries.push(`  <url>\n    <loc>${urlFor(BASE, lang, page)}</loc>\n${alts}\n  </url>`);
    }
  }

  fs.writeFileSync(
    path.join(ROOT, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
      entries.join("\n") +
      `\n</urlset>\n`
  );
  fs.writeFileSync(
    path.join(ROOT, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${BASE}sitemap.xml\n`
  );

  console.log(`base: ${BASE}`);
  console.log(`${PAGES.length} pages x ${LANGS.length} languages = ${entries.length} sitemap entries`);
  console.log(`pages: ${PAGES.join(", ")}`);
}

main();
