# Operations

Everything here is a setup task that needs an account, a domain, or a payment
method — the parts of running the site that cannot live in the codebase. The
code side of each is already in place and inert until configured.

## 1. Address

The site is served at **`tokyokuroishi.github.io`** — a GitHub *user site*,
which is why there is no repository path in the URL. No custom domain is
configured.

A user site is produced by naming the repository exactly the same as the
account: account `tokyokuroishi` + repository `tokyokuroishi.github.io`.
Rename either one and the address moves, so after any rename run
`set-base-url.js` with the new base and update the git remote. Previous
addresses were `chipcho9-max.github.io/` over repositories `manintokyo`,
`Tokyo-Kuroishi` and `kuroishi`.

**The address is set in Settings → Pages → Custom domain, and nowhere else.**
This repository publishes through a GitHub Actions workflow, and GitHub's
documentation is explicit that on that publishing source "any CNAME file is
ignored and is not required". `scripts/set-base-url.js` rewrites the site's
own absolute links (canonical, hreflang, og:url, og:image, sitemap, robots,
README, this file) — it does not move the site.

### Moving to a custom domain later

In this order. Getting it wrong in the other order is what breaks things:

1. **DNS** — apex: four `A` records to GitHub Pages' addresses; subdomain: a
   `CNAME` to `tokyokuroishi.github.io`. If Cloudflare manages the zone, set
   that record's **proxy off (grey cloud)** — proxied, GitHub cannot issue a
   certificate.
2. **Confirm** — `dig +short <host>` returns GitHub's addresses.
3. **Rewrite** — `node scripts/set-base-url.js https://<host>/`, then commit.
4. **Settings → Pages → Custom domain** — enter the host and Save. *This is
   the step that actually moves the site.*
5. Tick **Enforce HTTPS** once the certificate issues.

To move back, run the script with the `github.io` URL and clear the Custom
domain field.

### Domains owned but unused

`long-horizon.com` and `longhz.com` are registered. Nothing in this repository
points at them and nothing depends on them. To use one, follow the five steps
above; to retire one, let it lapse. If a second domain should redirect to the
first, GitHub Pages cannot do it — one repository serves one hostname — so use
Cloudflare Redirect Rules or the registrar's forwarding, with a **301** that
**preserves the path**, and make sure the rule does not also match the hostname
that serves the site.

## 2. Analytics

**Current state: Cloudflare Web Analytics chosen, not yet switched on.**
`provider` is set to `cloudflare`; `cloudflareToken` is still empty, and both
are required, so the site currently loads nothing and sends nothing. To
finish, take the 32-character value from Cloudflare dashboard → Analytics &
Logs → Web Analytics → add the site → the snippet's
`data-cf-beacon='{"token": "…"}'`, and put it in `cloudflareToken`.

Configured in `assets/js/analytics.js` — one `CONFIG` object at the top. With
`provider` empty, nothing loads and no request leaves the reader's browser.

| provider | cost | cookies | custom events |
|---|---|---|---|
| `cloudflare` | free | none | ✗ page views only |
| `plausible` | paid | none | ✓ |
| `ga4` | free | yes | ✓ |

Cookies are the deciding factor. The cookieless options need no consent banner
under the usual reading of GDPR, 個人情報保護法, and PIPA; GA4 does set cookies,
so choosing it makes consent your problem across three jurisdictions.

Custom events are the other deciding factor. Page views cannot answer *did the
reader go on to open an account*, which is the only question monetisation
depends on. `assets/js/analytics.js` already reports every outbound click, and
any link carrying `data-lh-goal="Some name"` is reported under that name — but
only a provider with custom-event support will record them.

To keep your own visits out of the numbers, once on the live site:

```js
localStorage.setItem("lh-no-analytics", "1")
```

## 3. Search consoles

Verification tags are already in the `<head>` of all three `index.html` files,
commented out. Paste the token each console gives you and uncomment.

| console | covers | sitemap to submit |
|---|---|---|
| [Google Search Console](https://search.google.com/search-console) | all three languages | `/sitemap.xml` |
| [Naver Search Advisor](https://searchadvisor.naver.com/) | `/ko/` — most Korean search traffic | `/sitemap.xml` |
| [Bing Webmaster Tools](https://www.bing.com/webmasters) | small but free | `/sitemap.xml` |

Google's console reads the `hreflang` alternates already on every page, so
register one property for the domain rather than one per language.

## 4. Affiliate links

Mark the link and everything else is automatic:

```html
<a href="https://broker.example/signup" data-aff>SBI証券</a>
```

`assets/js/affiliate.js` then adds a visible badge (Ad / PR / 광고), sets
`rel="sponsored nofollow noopener"`, names the click for analytics, and inserts
the disclosure notice into that section in the page's language.

The disclosure is generated from the links rather than typed into the page so
it can never drift out of step with what is actually there — a page with no
marked links shows no notice, and one appears the moment a link is added. This
matters legally: Japan's stealth-marketing rule (景品表示法, in force October
2023), the FTC's endorsement guides, and Korea's 표시광고법 all require an ad to
be identifiable as an ad where the reader meets it, not in a footer.

**The editorial rule that keeps this survivable:** only link to something the
page would already have recommended, and never reorder by what pays. The
site's whole claim is that it does not sell recommendations. An affiliate link
that changes a sentence forfeits that, and the traffic follows.

## 5. What not to monetise

Paid, personalised investment advice is a licensed activity in all three
markets this site serves:

- **Japan** — 投資助言・代理業 registration under 金融商品取引法.
- **Korea** — 유사투자자문업 obligations under 자본시장법.
- **US** — adviser registration; the publisher's exemption covers a bona fide
  general-circulation publication, not individual advice for a fee.

Education, tools, and general information sit outside this, which is where the
site already sits. A paid tier that answers "what should *I* buy" does not.
Take advice from a professional in the relevant jurisdiction before charging
for anything that comes close.
