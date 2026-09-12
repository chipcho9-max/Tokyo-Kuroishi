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

## 1b. Pointing an old domain at the current one

GitHub Pages serves **one** custom domain per repository — there is one
`CNAME` file — so a second domain you own cannot be served by the same site.
It has to redirect from somewhere else.

Two things matter more than which tool you use:

- **301, not 302.** A permanent redirect tells search engines the address
  moved and transfers the link equity. A temporary one leaves the old URL
  indexed and splits the site between two addresses.
- **Preserve the path.** `old.example/ja/nisa.html` should land on
  `new.example/ja/nisa.html`, not on the homepage. A redirect that dumps
  everyone on `/` loses the reader who followed a deep link.

### Option A — Cloudflare (free, and what to use if the registrar cannot do it well)

1. Add the old domain as a site on Cloudflare's free plan, and change its
   nameservers at the registrar to the two Cloudflare gives you. This is the
   only real friction; propagation is usually minutes to a few hours.

   Cloudflare imports the existing DNS records during setup, but check the
   imported list before switching nameservers — anything it missed stops
   working the moment DNS moves. `MX` records matter most: if any mail
   address uses the old domain, losing them silently loses mail.
2. Redirect Rules only run on **proxied** traffic, so the hostname needs a DNS
   record to attach to even though nothing will ever be served from it. Add,
   both with the proxy (orange cloud) **on**:
   - `A` · `@` · `192.0.2.1`
   - `A` · `www` · `192.0.2.1`

   `192.0.2.1` is the RFC 5737 documentation address — it exists precisely so
   it can be used as a placeholder that routes nowhere.
3. **Rules → Redirect Rules → Create rule** (this is the "Single Redirects"
   product; the free plan allows ten per zone, and one is enough). The
   wildcard form is available on every plan and is easier to get right than
   an expression:
   - Request URL: `https://*long-horizon.com/*`
   - Target URL: `https://longhz.com/${2}`
   - Status **301**, **Preserve query string** on.

   The leading `*` covers `www` as well as the apex. If you prefer an
   expression, the dynamic equivalent is
   `concat("https://longhz.com", http.request.uri.path)` with the rule
   matching `http.host contains "long-horizon.com"` — regular expressions,
   unlike wildcards, need a Business plan.
4. Wait for Cloudflare's Universal SSL certificate on the old domain
   (usually ~15 minutes, occasionally longer). Until it issues, `https://`
   on the old domain will warn.

### Option B — the registrar's own URL forwarding

Faster, no nameserver change, and enough if the registrar does it properly.
Before relying on it, check all three:

- Is it a **301**, or only a 302?
- Does it **keep the path**, or send everything to the root?
- Is it a real redirect, or **frame/cloaking** forwarding that keeps the old
  address in the URL bar? Framed forwarding is the one to avoid — it hides
  the canonical URL and search engines treat it poorly.

If any answer is wrong, use Option A.

### Verify

```sh
curl -sI https://long-horizon.com/ja/nisa.html | head -3
# expect: HTTP/…  301
#         location: https://longhz.com/ja/nisa.html
```

### Is it worth doing at all?

Right now the honest answer is *barely*. The site ran on the old domain for
part of a single day, with no traffic, no backlinks and no search-console
registration, so there is almost no equity to preserve. The reasons to keep
and redirect it anyway are that "Long Horizon" is still the site's name, so
the matching domain is worth holding defensively, and that anywhere the old
address was written down keeps working. Letting it lapse is a legitimate
choice; letting it lapse *and* having someone else register it is the
outcome to avoid.

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
