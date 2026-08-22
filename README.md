# Long Horizon

An educational static website for **long-term investors** — people in the US, Japan,
and Korea who plan to hold US stocks for 10, 20, or 30 years.

## Pages

| Page | Content |
|---|---|
| `index.html` | Home — who the site is for, reading paths |
| `principles.html` | Why decades win: compounding, time-in-market, risk over horizons, costs, the behavior gap |
| `markets.html` | US, Japan, and Korea market guides, plus the currency question for cross-border holders |
| `strategy.html` | Index core, dollar-cost averaging, dividend growth, allocation by horizon, rebalancing, common mistakes |
| `accounts.html` | Tax-advantaged accounts by country: 401(k)/IRA/HSA, NISA/iDeCo, 연금저축/IRP/ISA, and cross-border tax notes |
| `tools.html` | Interactive compounding/DCA calculator (USD/JPY/KRW) with chart and milestone table |
| `resources.html` | Reading list, primary data sources, glossary |

## Tech

- Pure static HTML/CSS/vanilla JS — no build step, no dependencies.
- Light/dark theme: follows the system preference, with a manual toggle persisted in `localStorage`.
- The calculator chart is hand-rolled SVG styled via CSS custom properties, so it adapts to theme changes automatically.

## Run locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploy (GitHub Pages)

Settings → Pages → deploy from this branch, root folder. The `.nojekyll` file is
already in place.

## Disclaimer

Educational content only — not investment, tax, or legal advice. Contribution
limits and tax rules for the US, Japan, and Korea change frequently; verify with
official sources before acting.
