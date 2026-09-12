/* Long Horizon — compound growth / DCA calculator

   This is arithmetic on the reader's own assumptions, not a projection the site
   stands behind, and the UI is written so that cannot be misread: the assumed
   return is deducted for costs, restated in today's money, and shown beside the
   same contributions run at other rates. The spread between those rows is the
   point — it is wider than anything the reader can control.

   Two modes:
     future — monthly amount → projected value
     goal   — target amount → required monthly (binary search over the same simulation)
   Two series: portfolio value (series-1) and cumulative contributions (series-2).
   Chart is SVG, styled via CSS custom properties so theme switches need no re-render.
   Localized pages set window.CALC_I18N before this script loads. */

(function () {
  "use strict";

  var L = Object.assign({
    cjkUnits: null, /* e.g. { man: "万", oku: "億", cho: "兆" } — enables 万/億 axis units for JPY/KRW */
    west: { K: "K", M: "M", B: "B", T: "T" },
    now: "Now",
    yr: function (n) { return "Yr " + n; },
    start: "Start",
    yearN: function (n) { return "Year " + n; },
    years: function (n) { return n + (n === 1 ? " year" : " years"); },
    seriesValue: "Portfolio value",
    seriesContrib: "Contributed",
    growth: "Growth",
    heroLabelFwd: "Projected portfolio value",
    heroLabelGoal: "Required monthly contribution",
    stat3Fwd: "Value ÷ contributions",
    stat3Goal: "Projected final value",
    perMonth: "/mo",
    heroNoteFwd: function (y, r) { return "If " + r + "% a year net of costs were achieved for " + y + " years — an assumption, not a forecast"; },
    heroNoteGoal: function (y, r, target) { return "Monthly investment needed to reach " + target + " in " + y + " years, if " + r + "% a year net of costs were achieved"; },
    chartAria: "Projected portfolio value and cumulative contributions by year",
    realLabel: function (y) { return "In today's money (at " + y + "% inflation a year):"; },
    assumeH: "What this figure does and does not include",
    assumeNet: function (g, f, n) { return "Return used: " + g + "% assumed, minus " + f + "% annual costs = <strong>" + n + "% net</strong>. Nothing else is deducted from the growth rate."; },
    assumeTax: "No tax is deducted. What you keep depends on the account and the country — see <a href=\"accounts.html\">Accounts &amp; Tax</a>.",
    assumeInfl: "The headline figure is in future currency. The line beneath it restates the same amount in today's purchasing power.",
    assumeSeq: "Returns are applied as a constant every year. Real markets never do that, and the order in which good and bad years arrive changes the outcome — especially once you are withdrawing.",
    cmpH: "The same plan at other rates of return",
    cmpNote: "Nothing above changes except the assumed return. The gap between the top and bottom rows is larger than almost any decision you can make about contributions — which is the honest reason this tool cannot tell you what you will have.",
    cmpRate: "Annual return (net)",
    cmpFinal: "Projected value",
    cmpReal: "In today's money",
    cmpMonthly: "Monthly needed",
    cmpContrib: "Total you would pay in",
    cmpYours: "your assumption",
    saveBtn: "Save these inputs",
    clearBtn: "Clear",
    savedAt: function (d) { return "Saved in this browser on " + d + "."; },
    savedNone: "Inputs are not saved until you press Save. They stay in this browser and are never sent anywhere.",
    savedCleared: "Saved inputs cleared.",
  }, window.CALC_I18N || {});

  var els = {
    currency: document.getElementById("calc-currency"),
    initial: document.getElementById("calc-initial"),
    monthly: document.getElementById("calc-monthly"),
    target: document.getElementById("calc-target"),
    ret: document.getElementById("calc-return"),
    fee: document.getElementById("calc-fee"),
    infl: document.getElementById("calc-inflation"),
    stepup: document.getElementById("calc-stepup"),
    years: document.getElementById("calc-years"),
    yearsOut: document.getElementById("calc-years-out"),
    presets: document.querySelectorAll(".preset-row button"),
    modeBtns: document.querySelectorAll(".mode-switch button"),
    monthlyWrap: document.getElementById("monthly-wrap"),
    targetWrap: document.getElementById("target-wrap"),
    heroLabel: document.getElementById("calc-hero-label"),
    heroValue: document.getElementById("calc-hero-value"),
    heroNote: document.getElementById("calc-hero-note"),
    statContrib: document.getElementById("stat-contrib"),
    statGrowth: document.getElementById("stat-growth"),
    stat3Label: document.getElementById("stat-3-label"),
    stat3: document.getElementById("stat-multiple"),
    chartHost: document.getElementById("calc-chart"),
    tooltip: document.getElementById("calc-tooltip"),
    tableBody: document.getElementById("calc-table-body"),
    realLine: document.getElementById("calc-real"),
    assumeBox: document.getElementById("calc-assume"),
    cmpBody: document.getElementById("calc-compare-body"),
    cmpHead3: document.getElementById("calc-compare-h3"),
    cmpHead4: document.getElementById("calc-compare-h4"),
    saveBtn: document.getElementById("calc-save"),
    clearBtn: document.getElementById("calc-clear"),
    savedMsg: document.getElementById("calc-saved-msg"),
  };
  if (!els.chartHost) return;

  var mode = "future";

  var CURRENCIES = {
    USD: { symbol: "$", initial: 10000, monthly: 500, target: 1000000 },
    JPY: { symbol: "¥", initial: 1000000, monthly: 50000, target: 50000000 },
    KRW: { symbol: "₩", initial: 10000000, monthly: 500000, target: 1000000000 },
  };

  function currency() { return els.currency ? els.currency.value : "USD"; }
  function symbol() { return CURRENCIES[currency()].symbol; }
  function useCjk() { return L.cjkUnits && currency() !== "USD"; }

  function fmtFull(v) {
    return symbol() + Math.round(v).toLocaleString("en-US");
  }

  function trim(x) {
    var r = x >= 100 ? Math.round(x) : Math.round(x * 10) / 10;
    return String(r);
  }

  function fmtCompact(v) {
    var s = symbol();
    var abs = Math.abs(v);
    if (useCjk()) {
      var u = L.cjkUnits;
      if (abs >= 1e12) return s + trim(v / 1e12) + u.cho;
      if (abs >= 1e8) return s + trim(v / 1e8) + u.oku;
      if (abs >= 1e4) return s + trim(v / 1e4) + u.man;
      return s + Math.round(v);
    }
    if (abs >= 1e12) return s + trim(v / 1e12) + L.west.T;
    if (abs >= 1e9) return s + trim(v / 1e9) + L.west.B;
    if (abs >= 1e6) return s + trim(v / 1e6) + L.west.M;
    if (abs >= 1e3) return s + trim(v / 1e3) + L.west.K;
    return s + Math.round(v);
  }

  /* The headline growth rate is the assumed gross return minus the annual cost,
     because a fee is not a footnote — it compounds against you exactly the way
     the return compounds for you. */
  function readInputs() {
    var gross = Math.min(20, Math.max(-5, Number(els.ret.value) || 0)) / 100;
    var fee = els.fee ? Math.min(5, Math.max(0, Number(els.fee.value) || 0)) / 100 : 0;
    return {
      initial: Math.max(0, Number(els.initial.value) || 0),
      monthly: Math.max(0, Number(els.monthly.value) || 0),
      target: Math.max(0, Number(els.target && els.target.value) || 0),
      gross: gross,
      fee: fee,
      annualReturn: gross - fee,
      inflation: els.infl ? Math.min(10, Math.max(0, Number(els.infl.value) || 0)) / 100 : 0,
      stepup: Math.min(20, Math.max(0, Number(els.stepup.value) || 0)) / 100,
      years: Math.min(40, Math.max(5, Number(els.years.value) || 25)),
    };
  }

  /* Same nominal amount expressed in today's purchasing power. */
  function toReal(v, p) {
    return v / Math.pow(1 + p.inflation, p.years);
  }

  function finalValueAt(p, rate, monthly) {
    var q = {};
    for (var k in p) q[k] = p[k];
    q.annualReturn = rate;
    return finalValue(q, monthly);
  }

  /* Simulate month by month; keep one data point per year.
     Contributions land at the end of each month; the step-up raises the
     monthly amount once per completed year. */
  function simulate(p, monthlyOverride) {
    var monthlyRate = Math.pow(1 + p.annualReturn, 1 / 12) - 1;
    var value = p.initial;
    var contributed = p.initial;
    var monthly = monthlyOverride !== undefined ? monthlyOverride : p.monthly;
    var points = [{ year: 0, value: value, contributed: contributed }];
    for (var y = 1; y <= p.years; y++) {
      for (var m = 0; m < 12; m++) {
        value = value * (1 + monthlyRate) + monthly;
        contributed += monthly;
      }
      points.push({ year: y, value: value, contributed: contributed });
      monthly *= 1 + p.stepup;
    }
    return points;
  }

  function finalValue(p, monthly) {
    var pts = simulate(p, monthly);
    return pts[pts.length - 1].value;
  }

  /* Smallest first-year monthly amount whose simulated path reaches the target. */
  function requiredMonthly(p) {
    if (finalValue(p, 0) >= p.target) return 0;
    var lo = 0, hi = Math.max(1, p.target);
    for (var i = 0; i < 60; i++) {
      var mid = (lo + hi) / 2;
      if (finalValue(p, mid) < p.target) lo = mid; else hi = mid;
    }
    return hi;
  }

  /* ---------- chart ---------- */

  var W = 720, H = 360;
  var PAD = { top: 24, right: 118, bottom: 34, left: 64 };

  /* Clean tick steps whose top tick always covers the max value,
     so the line never overshoots the plot area. */
  function niceTicks(max) {
    var mag = Math.pow(10, Math.floor(Math.log10(max)) - 1);
    var mults = [1, 2, 2.5, 5, 10, 20, 25, 50];
    for (var i = 0; i < mults.length; i++) {
      var step = mults[i] * mag;
      var n = Math.ceil(max / step - 1e-9);
      if (n <= 7) {
        var ticks = [];
        for (var t = 0; t <= n; t++) ticks.push(t * step);
        return ticks;
      }
    }
    return [0, max];
  }

  function svgEl(name, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function renderChart(points) {
    var host = els.chartHost;
    host.textContent = "";

    var maxVal = 0;
    points.forEach(function (d) { maxVal = Math.max(maxVal, d.value, d.contributed); });
    if (maxVal <= 0) maxVal = 1;
    var ticks = niceTicks(maxVal);
    var yMax = ticks[ticks.length - 1];
    var years = points[points.length - 1].year;

    var plotW = W - PAD.left - PAD.right;
    var plotH = H - PAD.top - PAD.bottom;
    var xFor = function (year) { return PAD.left + (year / years) * plotW; };
    var yFor = function (v) { return PAD.top + plotH - (v / yMax) * plotH; };

    var svg = svgEl("svg", {
      class: "chart-svg",
      viewBox: "0 0 " + W + " " + H,
      role: "img",
      "aria-label": L.chartAria,
    });

    // gridlines + y tick labels (skip the zero line; the axis carries it)
    ticks.forEach(function (t) {
      var y = yFor(t);
      if (t > 0) {
        svg.appendChild(svgEl("line", { class: "gridline", x1: PAD.left, x2: W - PAD.right, y1: y, y2: y }));
      }
      var lbl = svgEl("text", { class: "tick-label", x: PAD.left - 8, y: y + 4, "text-anchor": "end" });
      lbl.textContent = fmtCompact(t);
      svg.appendChild(lbl);
    });

    // baseline + x ticks (every 5 years)
    var baseY = yFor(0);
    svg.appendChild(svgEl("line", { class: "axisline", x1: PAD.left, x2: W - PAD.right, y1: baseY, y2: baseY }));
    for (var yr = 0; yr <= years; yr += 5) {
      var lbl = svgEl("text", { class: "tick-label", x: xFor(yr), y: baseY + 20, "text-anchor": "middle" });
      lbl.textContent = yr === 0 ? L.now : L.yr(yr);
      svg.appendChild(lbl);
    }

    // area wash under the value line + the two lines
    function linePath(key) {
      return points.map(function (d, i) {
        return (i === 0 ? "M" : "L") + xFor(d.year).toFixed(1) + " " + yFor(d[key]).toFixed(1);
      }).join(" ");
    }
    function areaPath(key) {
      return linePath(key) +
        " L" + xFor(years).toFixed(1) + " " + baseY.toFixed(1) +
        " L" + xFor(0).toFixed(1) + " " + baseY.toFixed(1) + " Z";
    }
    svg.appendChild(svgEl("path", { class: "area-s1", d: areaPath("value") }));
    svg.appendChild(svgEl("path", { class: "line-s2", d: linePath("contributed") }));
    svg.appendChild(svgEl("path", { class: "line-s1", d: linePath("value") }));

    // end markers + direct end labels (the selective labels; ticks carry the rest)
    var last = points[points.length - 1];
    var endX = xFor(years);
    var y1 = yFor(last.value), y2 = yFor(last.contributed);
    svg.appendChild(svgEl("circle", { class: "end-dot-s2", cx: endX, cy: y2, r: 4.5 }));
    svg.appendChild(svgEl("circle", { class: "end-dot-s1", cx: endX, cy: y1, r: 4.5 }));
    var l1 = svgEl("text", { class: "end-label", x: endX + 10, y: y1 + 4 });
    l1.textContent = fmtCompact(last.value);
    var l2y = Math.abs(y2 - y1) < 18 ? y1 + 20 : y2 + 4; // keep the two labels apart
    var l2 = svgEl("text", { class: "end-label", x: endX + 10, y: l2y });
    l2.textContent = fmtCompact(last.contributed);
    svg.appendChild(l1);
    svg.appendChild(l2);

    // hover layer: crosshair snaps to the nearest year, tooltip lists both series
    var crosshair = svgEl("line", { class: "crosshair", y1: PAD.top, y2: baseY, x1: 0, x2: 0, visibility: "hidden" });
    var hd1 = svgEl("circle", { class: "hover-dot end-dot-s1", r: 4.5, visibility: "hidden" });
    var hd2 = svgEl("circle", { class: "hover-dot end-dot-s2", r: 4.5, visibility: "hidden" });
    svg.appendChild(crosshair);
    svg.appendChild(hd2);
    svg.appendChild(hd1);

    var hit = svgEl("rect", {
      x: PAD.left, y: PAD.top, width: plotW, height: plotH,
      fill: "transparent", "pointer-events": "all",
    });
    svg.appendChild(hit);

    function showAt(clientX) {
      var rect = svg.getBoundingClientRect();
      var px = (clientX - rect.left) * (W / rect.width);
      var yearF = ((px - PAD.left) / plotW) * years;
      var yr = Math.min(years, Math.max(0, Math.round(yearF)));
      var d = points[yr];
      var x = xFor(yr);
      crosshair.setAttribute("x1", x); crosshair.setAttribute("x2", x);
      crosshair.setAttribute("visibility", "visible");
      hd1.setAttribute("cx", x); hd1.setAttribute("cy", yFor(d.value)); hd1.setAttribute("visibility", "visible");
      hd2.setAttribute("cx", x); hd2.setAttribute("cy", yFor(d.contributed)); hd2.setAttribute("visibility", "visible");
      renderTooltip(d, x / W);
    }
    function hide() {
      crosshair.setAttribute("visibility", "hidden");
      hd1.setAttribute("visibility", "hidden");
      hd2.setAttribute("visibility", "hidden");
      els.tooltip.style.display = "none";
    }
    hit.addEventListener("pointermove", function (e) { showAt(e.clientX); });
    hit.addEventListener("pointerleave", hide);

    host.appendChild(svg);
  }

  function renderTooltip(d, xFrac) {
    var tt = els.tooltip;
    tt.textContent = "";
    var title = document.createElement("div");
    title.className = "tt-title";
    title.textContent = d.year === 0 ? L.start : L.yearN(d.year);
    tt.appendChild(title);
    [
      { cls: "s1", name: L.seriesValue, val: d.value },
      { cls: "s2", name: L.seriesContrib, val: d.contributed },
    ].forEach(function (row) {
      var r = document.createElement("div");
      r.className = "tt-row " + row.cls;
      var key = document.createElement("span"); key.className = "tt-key";
      var name = document.createElement("span"); name.className = "tt-name"; name.textContent = row.name;
      var val = document.createElement("span"); val.className = "tt-val"; val.textContent = fmtFull(row.val);
      r.appendChild(key); r.appendChild(name); r.appendChild(val);
      tt.appendChild(r);
    });
    var g = document.createElement("div");
    g.className = "tt-row";
    var gn = document.createElement("span"); gn.className = "tt-name"; gn.textContent = L.growth;
    var gv = document.createElement("span"); gv.className = "tt-val"; gv.textContent = fmtFull(d.value - d.contributed);
    g.appendChild(gn); g.appendChild(gv);
    tt.appendChild(g);

    tt.style.display = "block";
    var hostRect = els.chartHost.getBoundingClientRect();
    var ttW = tt.offsetWidth;
    var left = xFrac * hostRect.width + 14;
    if (left + ttW > hostRect.width - 4) left = xFrac * hostRect.width - ttW - 14;
    tt.style.left = Math.max(4, left) + "px";
    tt.style.top = "24px";
  }

  /* ---------- table view ---------- */

  function renderTable(points) {
    var body = els.tableBody;
    body.textContent = "";
    var years = points[points.length - 1].year;
    for (var yr = 5; yr <= years; yr += 5) appendRow(points[yr]);
    if (years % 5 !== 0) appendRow(points[years]);

    function appendRow(d) {
      var tr = document.createElement("tr");
      [
        { txt: L.yearN(d.year), cls: "" },
        { txt: fmtFull(d.contributed), cls: "num" },
        { txt: fmtFull(d.value - d.contributed), cls: "num" },
        { txt: fmtFull(d.value), cls: "num" },
      ].forEach(function (c) {
        var td = document.createElement("td");
        if (c.cls) td.className = c.cls;
        td.textContent = c.txt;
        tr.appendChild(td);
      });
      body.appendChild(tr);
    }
  }

  /* ---------- assumptions, real terms, rate comparison ---------- */

  function renderAssumptions(p) {
    if (!els.assumeBox) return;
    els.assumeBox.textContent = "";
    var h = document.createElement("span");
    h.className = "assume-h";
    h.textContent = L.assumeH;
    els.assumeBox.appendChild(h);
    var ul = document.createElement("ul");
    [
      L.assumeNet(fmtRate(p.gross), fmtRate(p.fee), fmtRate(p.annualReturn)),
      L.assumeTax,
      L.assumeInfl,
      L.assumeSeq
    ].forEach(function (t) {
      var li = document.createElement("li");
      li.innerHTML = t;              /* fixed localized strings, no user input */
      ul.appendChild(li);
    });
    els.assumeBox.appendChild(ul);
  }

  function renderReal(p, finalNominal) {
    if (!els.realLine) return;
    els.realLine.textContent = "";
    if (p.inflation <= 0) { els.realLine.style.display = "none"; return; }
    els.realLine.style.display = "";
    var lbl = document.createElement("span");
    lbl.textContent = L.realLabel(fmtRate(p.inflation)) + " ";
    var val = document.createElement("span");
    val.className = "rl-val";
    val.textContent = fmtFull(toReal(finalNominal, p));
    els.realLine.appendChild(lbl);
    els.realLine.appendChild(val);
  }

  /* A ladder of plausible net returns with the reader's own rate slotted in and
     marked. Seeing the same contributions land two-and-a-half times apart is the
     part of this page that survives being skimmed. */
  function comparisonRates(p) {
    var ladder = [0.02, 0.04, 0.06, 0.08, 0.10];
    var mine = Math.round(p.annualReturn * 10000) / 10000;
    var out = ladder.filter(function (r) { return Math.abs(r - mine) > 0.0025; });
    out.push(mine);
    out.sort(function (a, b) { return a - b; });
    return out.map(function (r) { return { rate: r, mine: Math.abs(r - mine) < 1e-9 }; });
  }

  function renderComparison(p) {
    if (!els.cmpBody) return;
    if (els.cmpHead3) els.cmpHead3.textContent = mode === "goal" ? L.cmpMonthly : L.cmpFinal;
    if (els.cmpHead4) els.cmpHead4.textContent = mode === "goal" ? L.cmpContrib : L.cmpReal;
    els.cmpBody.textContent = "";
    comparisonRates(p).forEach(function (row) {
      var tr = document.createElement("tr");

      var tdR = document.createElement("td");
      tdR.textContent = fmtRate(row.rate) + "%";
      if (row.mine) {
        tdR.className = "rate-self";
        var tag = document.createElement("span");
        tag.className = "small";
        tag.textContent = " — " + L.cmpYours;
        tdR.appendChild(tag);
      }
      tr.appendChild(tdR);

      var primary, secondary;
      if (mode === "goal") {
        var q = {}; for (var k in p) q[k] = p[k];
        q.annualReturn = row.rate;
        var need = requiredMonthly(q);
        var pts = simulate(q, need);
        primary = fmtFull(need) + L.perMonth;
        /* the target is fixed, so restating it per row says nothing; what the
           reader is buying with a higher return is a smaller total outlay */
        secondary = fmtFull(pts[pts.length - 1].contributed);
      } else {
        var nominal = finalValueAt(p, row.rate);
        primary = fmtFull(nominal);
        secondary = p.inflation > 0 ? fmtFull(toReal(nominal, p)) : "—";
      }

      var tdV = document.createElement("td");
      tdV.className = "num";
      if (row.mine) tdV.classList.add("rate-self");
      tdV.textContent = primary;
      tr.appendChild(tdV);

      var tdReal = document.createElement("td");
      tdReal.className = "num";
      if (row.mine) tdReal.classList.add("rate-self");
      tdReal.textContent = secondary;
      tr.appendChild(tdReal);

      els.cmpBody.appendChild(tr);
    });
  }

  /* ---------- saved inputs ----------
     Written only on an explicit press, kept in this browser, never transmitted.
     The privacy page documents this key by name, so do not rename it lightly. */

  var SAVE_KEY = "lh-calc";
  var SAVE_FIELDS = ["currency", "initial", "monthly", "target", "ret", "fee", "infl", "stepup", "years"];

  function saveInputs() {
    var data = { mode: mode, saved: new Date().toISOString().slice(0, 10) };
    SAVE_FIELDS.forEach(function (f) { if (els[f]) data[f] = els[f].value; });
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      if (els.savedMsg) els.savedMsg.textContent = L.savedAt(data.saved);
    } catch (e) {
      if (els.savedMsg) els.savedMsg.textContent = L.savedNone;
    }
  }

  function clearInputs() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* private mode */ }
    if (els.savedMsg) els.savedMsg.textContent = L.savedCleared;
  }

  function restoreInputs() {
    var raw;
    try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
    if (!raw) { if (els.savedMsg) els.savedMsg.textContent = L.savedNone; return false; }
    var data;
    try { data = JSON.parse(raw); } catch (e) { return false; }
    SAVE_FIELDS.forEach(function (f) {
      if (els[f] && typeof data[f] === "string") els[f].value = data[f];
    });
    if (els.savedMsg) els.savedMsg.textContent = L.savedAt(data.saved || "—");
    syncPresets();
    return data.mode === "goal" ? "goal" : "future";
  }

  function syncPresets() {
    els.presets.forEach(function (b) {
      b.setAttribute("aria-pressed", Number(b.dataset.rate) === Number(els.ret.value) ? "true" : "false");
    });
  }

  /* ---------- orchestration ---------- */

  function fmtRate(r) {
    return (r * 100).toFixed(1).replace(/\.0$/, "");
  }

  function recalc() {
    var p = readInputs();
    els.yearsOut.textContent = L.years(p.years);

    var points, last;
    if (mode === "goal") {
      var need = requiredMonthly(p);
      points = simulate(p, need);
      last = points[points.length - 1];
      els.heroLabel.textContent = L.heroLabelGoal;
      els.heroValue.textContent = fmtFull(need) + L.perMonth;
      els.heroNote.textContent = L.heroNoteGoal(p.years, fmtRate(p.annualReturn), fmtFull(p.target));
      els.stat3Label.textContent = L.stat3Goal;
      els.stat3.textContent = fmtCompact(last.value);
    } else {
      points = simulate(p);
      last = points[points.length - 1];
      els.heroLabel.textContent = L.heroLabelFwd;
      els.heroValue.textContent = fmtFull(last.value);
      els.heroNote.textContent = L.heroNoteFwd(p.years, fmtRate(p.annualReturn));
      els.stat3Label.textContent = L.stat3Fwd;
      els.stat3.textContent = last.contributed > 0 ? (last.value / last.contributed).toFixed(1) + "×" : "—";
    }

    els.statContrib.textContent = fmtFull(last.contributed);
    els.statGrowth.textContent = fmtFull(last.value - last.contributed);

    renderReal(p, mode === "goal" ? p.target : last.value);
    renderAssumptions(p);
    renderComparison(p);
    renderChart(points);
    renderTable(points);
  }

  function setMode(next) {
    mode = next;
    els.modeBtns.forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.mode === mode ? "true" : "false");
    });
    if (els.monthlyWrap) els.monthlyWrap.style.display = mode === "goal" ? "none" : "";
    if (els.targetWrap) els.targetWrap.style.display = mode === "goal" ? "" : "none";
    recalc();
  }

  els.modeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () { setMode(btn.dataset.mode); });
  });

  els.presets.forEach(function (btn) {
    btn.addEventListener("click", function () {
      els.ret.value = btn.dataset.rate;
      els.presets.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      recalc();
    });
  });

  [els.initial, els.monthly, els.target, els.stepup, els.fee, els.infl].forEach(function (el) {
    if (el) el.addEventListener("input", recalc);
  });

  if (els.saveBtn) els.saveBtn.addEventListener("click", saveInputs);
  if (els.clearBtn) els.clearBtn.addEventListener("click", clearInputs);
  els.ret.addEventListener("input", function () { syncPresets(); recalc(); });
  els.years.addEventListener("input", recalc);
  els.currency.addEventListener("change", function () {
    var c = CURRENCIES[currency()];
    els.initial.value = c.initial;
    els.monthly.value = c.monthly;
    if (els.target) els.target.value = c.target;
    recalc();
  });

  window.addEventListener("resize", function () {
    // viewBox keeps the SVG responsive; only the HTML tooltip needs a reset
    els.tooltip.style.display = "none";
  });

  setMode(restoreInputs() || "future");
})();
