# Long Horizon

An educational static website for **long-term investors** — people in the US, Japan,
and Korea who plan to hold US stocks for 10, 20, or 30 years.

**Live site:** https://chipcho9-max.github.io/kuroishi/

## Languages

Every page exists in three languages, with a switcher in the header:

| Language | Path |
|---|---|
| English | `/` |
| 日本語 | `/ja/` |
| 한국어 | `/ko/` |

## Pages

| Page | Content |
|---|---|
| `index.html` | Home — who the site is for, reading paths |
| `start.html` | Getting started — first-month checklists per country, age-25/35/45 model cases |
| `principles.html` | Why decades win: compounding, time-in-market, risk over horizons, costs, the behavior gap |
| `markets.html` | US, Japan, and Korea market guides, a short emerging-markets section (China, India, Taiwan, Malaysia), and the currency question for cross-border holders |
| `equities.html` | How the world changes over 20–30 years: the AI value chain, case studies, and an expected-return decomposition tool |
| `strategy.html` | Index core, dollar-cost averaging, dividend growth, allocation by horizon, rebalancing, common mistakes |
| `accounts.html` | Tax-advantaged accounts by country: 401(k)/IRA/HSA, NISA/iDeCo, 연금저축/IRP/ISA, and cross-border tax notes |
| `nisa.html` | The two NISA quotas compared, the ¥18M lifetime cap, filling pace, myths, and administrative details |
| `survival.html` | Bear market survival — every major crash since 1929 with recovery times, and a hold-through playbook |
| `drawdown.html` | Spending the portfolio: the 4% rule, sequence-of-returns risk, bucket strategy, withdrawal order by country |
| `tools.html` | Interactive compounding/DCA calculator (USD/JPY/KRW) with chart and milestone table |
| `resources.html` | Reading list, primary data sources, glossary |

## Calculator

Two modes, both driven by the same month-by-month simulation:

- **Monthly → future value** — projected portfolio value from a monthly contribution.
- **Goal → monthly needed** — binary search for the contribution that reaches a target.

Supports an annual contribution step-up, 5–40 year horizons, and USD/JPY/KRW
(with 万/억-style axis units on the Japanese and Korean pages).

## Daily quote banner

`assets/js/daily-quote.js` holds a pool of 23 quotes from Buffett, Graham,
Munger, Lynch, and Bogle, each with English, Japanese, and Korean text. Every
page carries one `<div class="quote-banner" data-quote-slot="N">`; the module
picks `POOL[(localDay + slot) % 23]`, so:

- every visitor sees the same quote on the same local calendar day,
- it turns over at local midnight, not UTC midnight,
- each page shows a different quote on any given day,
- and the pool is ordered so neighbouring entries never share an author.

The pool deliberately excludes the quotes already sitting inline on the pages,
so a banner never repeats the one next to it.

## Tech

- Pure static HTML/CSS/vanilla JS — no build step, no dependencies.
- Light/dark theme: follows the system preference, with a manual toggle persisted in `localStorage`.
- The calculator chart is hand-rolled SVG styled via CSS custom properties, so it adapts to theme changes automatically. Localized pages set `window.CALC_I18N` before loading `assets/js/calculator.js`.
- SEO: OGP/Twitter meta, canonical + `hreflang` alternates on every page, `sitemap.xml`, `robots.txt`.

## Measurement and affiliate links

Both are built and both are inert until configured, so the site ships without
loading a third-party script or claiming a commercial relationship it does not
have.

- `assets/js/analytics.js` — one `CONFIG` object selects Cloudflare Web
  Analytics, Plausible, or GA4. With no provider set, nothing loads and no
  request leaves the reader's browser. Outbound clicks are reported
  automatically; `data-lh-goal="..."` on a link names the goal.
- `assets/js/affiliate.js` — a link marked `data-aff` gets a visible Ad / PR /
  광고 badge, `rel="sponsored nofollow noopener"`, and a tracked goal, and the
  section it sits in gets a disclosure notice in the page's language. The
  notice is generated from the links, so a page with none shows none.
- `scripts/set-base-url.js` — moves every absolute URL on the site to a new
  base in one command, and writes the `CNAME` file for a custom domain.

See [OPERATIONS.md](OPERATIONS.md) for the accounts, DNS, and search-console
steps that go with them, and for what should not be monetised at all.

## Run locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploy

Pushing to this branch triggers `.github/workflows/deploy-pages.yml`, which
publishes the site to GitHub Pages.

## Disclaimer

Educational content only — not investment, tax, or legal advice. Contribution
limits and tax rules for the US, Japan, and Korea change frequently; verify with
official sources before acting.
