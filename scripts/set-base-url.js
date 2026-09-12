#!/usr/bin/env node
/* Point the whole site at a different base URL.

     node scripts/set-base-url.js https://longhorizon.example/
     node scripts/set-base-url.js https://tokyokuroishi.github.io/

   Every absolute URL on the site — canonical, hreflang alternates, og:url,
   og:image, the sitemap, robots.txt and the README — is derived from one base,
   so moving to a custom domain is this one command rather than 400 hand edits.
   Relative links between pages are already path-independent and are untouched.

   It also maintains a CNAME file, but note that this site publishes through a
   custom GitHub Actions workflow, and GitHub ignores CNAME files on that
   publishing source: "If you are publishing from a custom GitHub Actions
   workflow, any CNAME file is ignored and is not required." The address is
   set only in Settings -> Pages -> Custom domain. The file is kept so the
   repository still describes its own intended address, and so nothing breaks
   if the publishing source is ever switched to a branch — but changing it
   does not move the site.
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

  /* Kept for documentation and for branch-based publishing; ignored by the
     Actions publishing source this repository actually uses. */
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
    console.log("\nThe CNAME file alone does NOT move the site — this repo publishes via");
    console.log("GitHub Actions, which ignores it. Still to do:");
    console.log("  1. DNS: ALIAS/ANAME or four A records for the apex to GitHub Pages,");
    console.log("     or a CNAME record for a www/subdomain to <user>.github.io");
    console.log("  2. Repo Settings -> Pages -> Custom domain: " + next.hostname);
    console.log("     <- THIS is what actually changes the address");
    console.log("  3. Wait for the certificate, then tick Enforce HTTPS");
  }
}

main();
