#!/usr/bin/env node
/* Point the whole site at a different base URL.

     node scripts/set-base-url.js https://longhorizon.example/
     node scripts/set-base-url.js https://chipcho9-max.github.io/Tokyo-Kuroishi/

   Every absolute URL on the site — canonical, hreflang alternates, og:url,
   og:image, the sitemap, robots.txt and the README — is derived from one base,
   so moving to a custom domain is this one command rather than 400 hand edits.
   Relative links between pages are already path-independent and are untouched.

   For a custom domain it also writes the CNAME file GitHub Pages needs, and
   removes it again when you move back to a github.io address.
*/

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const LANGS = ["", "ja", "ko"];

/* Pages are discovered from disk rather than listed here. A hardcoded list
   silently skipped future.html when that page was added later, leaving it
   pointing at the previous domain. */
function targets() {
  const files = [];
  for (const lang of LANGS) {
    const dir = path.join(ROOT, lang);
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith(".html")) files.push(path.join(dir, f));
    }
  }
  for (const f of ["sitemap.xml", "robots.txt", "README.md", "OPERATIONS.md"]) files.push(path.join(ROOT, f));
  return files.filter((f) => fs.existsSync(f));
}

function currentBase() {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const m = html.match(/<link rel="canonical" href="([^"]+)">/);
  if (!m) throw new Error("no canonical link in index.html — cannot tell what the current base is");
  return m[1];
}

function main() {
  const raw = process.argv[2];
  if (!raw) {
    console.error("usage: node scripts/set-base-url.js <new-base-url>");
    console.error("current base: " + currentBase());
    process.exit(1);
  }

  let next;
  try { next = new URL(raw); } catch (e) {
    console.error("not a valid URL: " + raw);
    process.exit(1);
  }
  if (next.protocol !== "https:") {
    console.error("use https — GitHub Pages serves it and search engines expect it");
    process.exit(1);
  }
  const newBase = next.href.endsWith("/") ? next.href : next.href + "/";
  const oldBase = currentBase();

  if (newBase === oldBase) {
    console.log("already at " + newBase + " — nothing to do");
    return;
  }

  let total = 0, touched = 0;
  for (const file of targets()) {
    const before = fs.readFileSync(file, "utf8");
    const after = before.split(oldBase).join(newBase);
    if (after === before) continue;
    const n = before.split(oldBase).length - 1;
    fs.writeFileSync(file, after);
    total += n;
    touched++;
  }

  // GitHub Pages reads the custom domain from a CNAME file in the published root
  const cname = path.join(ROOT, "CNAME");
  const isGitHubDefault = /\.github\.io$/.test(next.hostname);
  if (isGitHubDefault) {
    if (fs.existsSync(cname)) { fs.unlinkSync(cname); console.log("removed CNAME"); }
  } else {
    fs.writeFileSync(cname, next.hostname + "\n");
    console.log("wrote CNAME -> " + next.hostname);
  }

  console.log(`${oldBase}\n  -> ${newBase}`);
  console.log(`${total} URLs rewritten across ${touched} files`);
  if (!isGitHubDefault) {
    console.log("\nStill to do at the registrar and on GitHub:");
    console.log("  1. DNS: ALIAS/ANAME or four A records for the apex to GitHub Pages,");
    console.log("     or a CNAME record for a www/subdomain to <user>.github.io");
    console.log("  2. Repo Settings -> Pages -> Custom domain: " + next.hostname);
    console.log("  3. Wait for the certificate, then tick Enforce HTTPS");
  }
}

main();
