/* Long Horizon — expected-return decomposition tool.

   Total return is decomposed the standard way:
     (1 + total) ≈ (1 + earnings growth) × (1 + annualised valuation change) + dividend yield
   The point of the tool is not to predict anything. It is to show how much of a
   high-multiple stock's outcome is decided by the exit multiple rather than by
   being right about the business.

   Localized pages set window.ER_I18N before this script loads. */

(function () {
  "use strict";

  var L = Object.assign({
    years: function (n) { return n + (n === 1 ? " year" : " years"); },
    heroNote: function (y) { return "Implied annual return over " + y + " years, on these assumptions"; },
    multipleNote: function (y, x) { return "That is " + x + "× your money over " + y + " years."; },
    lossNote: function (y, x) { return "That leaves you with " + x + "× your money after " + y + " years — a loss."; },
  }, window.ER_I18N || {});

  var els = {
    pe0: document.getElementById("er-pe0"),
    pe1: document.getElementById("er-pe1"),
    growth: document.getElementById("er-growth"),
    yield: document.getElementById("er-yield"),
    years: document.getElementById("er-years"),
    yearsOut: document.getElementById("er-years-out"),
    presets: document.querySelectorAll(".er-presets button"),
    hero: document.getElementById("er-hero"),
    heroNote: document.getElementById("er-hero-note"),
    statGrowth: document.getElementById("er-stat-growth"),
    statValue: document.getElementById("er-stat-value"),
    statYield: document.getElementById("er-stat-yield"),
    multiple: document.getElementById("er-multiple"),
  };
  if (!els.hero) return;

  function read() {
    return {
      pe0: Math.max(0.5, Number(els.pe0.value) || 1),
      pe1: Math.max(0.5, Number(els.pe1.value) || 1),
      growth: Math.min(60, Math.max(-20, Number(els.growth.value) || 0)) / 100,
      dividend: Math.min(15, Math.max(0, Number(els.yield.value) || 0)) / 100,
      years: Math.min(30, Math.max(1, Number(els.years.value) || 10)),
    };
  }

  function fmtPct(x) {
    var s = (x * 100).toFixed(1).replace(/\.0$/, "");
    return (x > 0 ? "+" : "") + s + "%";
  }

  function recalc() {
    var p = read();
    els.yearsOut.textContent = L.years(p.years);

    // annualised contribution of the multiple re-rating
    var valuation = Math.pow(p.pe1 / p.pe0, 1 / p.years) - 1;
    var priceCagr = (1 + p.growth) * (1 + valuation) - 1;
    var total = priceCagr + p.dividend;

    els.hero.textContent = fmtPct(total);
    els.hero.style.color = total >= 0 ? "" : "var(--series-2)";
    els.heroNote.textContent = L.heroNote(p.years);

    els.statGrowth.textContent = fmtPct(p.growth);
    els.statValue.textContent = fmtPct(valuation);
    els.statYield.textContent = fmtPct(p.dividend);
    els.statValue.style.color = valuation >= 0 ? "" : "var(--series-2)";

    var mult = Math.pow(1 + total, p.years);
    els.multiple.textContent = mult >= 1
      ? L.multipleNote(p.years, mult.toFixed(1))
      : L.lossNote(p.years, mult.toFixed(2));
  }

  els.presets.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var d = btn.dataset;
      els.pe0.value = d.pe0;
      els.pe1.value = d.pe1;
      els.growth.value = d.growth;
      els.yield.value = d.yield;
      els.presets.forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      recalc();
    });
  });

  [els.pe0, els.pe1, els.growth, els.yield].forEach(function (el) {
    el.addEventListener("input", function () {
      els.presets.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      recalc();
    });
  });
  els.years.addEventListener("input", recalc);

  recalc();
})();
