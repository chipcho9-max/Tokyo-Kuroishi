# Operations

Everything here is a setup task that needs an account, a domain, or a payment
method — the parts of running the site that cannot live in the codebase. The
code side of each is already in place and inert until configured.

## 1. Custom domain

The site answers on **`longhz.com`**, set by the `CNAME` file in the
repository root. Earlier addresses were `www.long-horizon.com` and
`chipcho9-max.github.io/Tokyo-Kuroishi/`.

Note that `set-base-url.js` rewrites the base URL where it appears as a full
`https://…/` prefix. Prose like this line that names a host without the scheme
is not rewritten, so check this file by eye after a move.

To move it again — or to move it back:

```sh
node scripts/set-base-url.js https://your-domain.example/
```

That rewrites all ~400 absolute URLs (canonical, hreflang, `og:url`,
`og:image`, `sitemap.xml`, `robots.txt`, README, this file) and writes the
`CNAME` file GitHub Pages reads. Then, outside the repo:

1. **DNS** — for an apex domain, four `A` records to GitHub Pages' addresses
   (or an `ALIAS`/`ANAME` if your registrar supports it); for `www` or another
   subdomain, one `CNAME` record to `chipcho9-max.github.io`.
2. **Repo → Settings → Pages → Custom domain** — enter the same hostname.
3. Wait for the certificate to issue, then tick **Enforce HTTPS**.

**Do step 1 before pushing the `CNAME`.** Once GitHub Pages sees a custom
domain it redirects the `github.io` address to it, so if DNS is not resolving
yet the site is reachable at neither address until it is.

Moving back is the same command with the `github.io` URL; it removes `CNAME`.

## 2. Analytics

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
