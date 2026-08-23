# Long Horizon

An educational static website for **long-term investors** — people in the US, Japan,
and Korea who plan to hold US stocks for 10, 20, or 30 years.

**Live site:** https://chipcho9-max.github.io/manintokyo/

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
| `markets.html` | US, Japan, and Korea market guides, plus the currency question for cross-border holders |
| `strategy.html` | Index core, dollar-cost averaging, dividend growth, allocation by horizon, rebalancing, common mistakes |
| `accounts.html` | Tax-advantaged accounts by country: 401(k)/IRA/HSA, NISA/iDeCo, 연금저축/IRP/ISA, and cross-border tax notes |
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

## Tech

- Pure static HTML/CSS/vanilla JS — no build step, no dependencies.
- Light/dark theme: follows the system preference, with a manual toggle persisted in `localStorage`.
- The calculator chart is hand-rolled SVG styled via CSS custom properties, so it adapts to theme changes automatically. Localized pages set `window.CALC_I18N` before loading `assets/js/calculator.js`.
- SEO: OGP/Twitter meta, canonical + `hreflang` alternates on every page, `sitemap.xml`, `robots.txt`.

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
