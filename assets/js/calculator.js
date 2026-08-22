/* Long Horizon — compound growth / DCA calculator
   Two series: portfolio value (series-1) and cumulative contributions (series-2).
   Chart is SVG, styled entirely via CSS custom properties so theme switches
   need no re-render. Values are also available without hover via the
   milestone table below the chart. */

(function () {
  "use strict";

  var els = {
    currency: document.getElementById("calc-currency"),
    initial: document.getElementById("calc-initial"),
    monthly: document.getElementById("calc-monthly"),
    ret: document.getElementById("calc-return"),
    stepup: document.getElementById("calc-stepup"),
    years: document.getElementById("calc-years"),
    yearsOut: document.getElementById("calc-years-out"),
    presets: document.querySelectorAll(".preset-row button"),
    heroValue: document.getElementById("calc-hero-value"),
    heroNote: document.getElementById("calc-hero-note"),
    statContrib: document.getElementById("stat-contrib"),
    statGrowth: document.getElementById("stat-growth"),
    statMultiple: document.getElementById("stat-multiple"),
    chartHost: document.getElementById("calc-chart"),
    tooltip: document.getElementById("calc-tooltip"),
    tableBody: document.getElementById("calc-table-body"),
  };
  if (!els.chartHost) return;

  var CURRENCIES = {
    USD: { symbol: "$", perMonthDefaultInitial: 10000, perMonthDefault: 500 },
    JPY: { symbol: "¥", perMonthDefaultInitial: 1000000, perMonthDefault: 50000 },
    KRW: { symbol: "₩", perMonthDefaultInitial: 10000000, perMonthDefault: 500000 },
  };

  function currency() { return els.currency ? els.currency.value : "USD"; }
  function symbol() { return CURRENCIES[currency()].symbol; }

  function fmtFull(v) {
    return symbol() + Math.round(v).toLocaleString("en-US");
  }

  function fmtCompact(v) {
    var s = symbol();
    var abs = Math.abs(v);
    if (abs >= 1e12) return s + trim(v / 1e12) + "T";
    if (abs >= 1e9) return s + trim(v / 1e9) + "B";
    if (abs >= 1e6) return s + trim(v / 1e6) + "M";
    if (abs >= 1e3) return s + trim(v / 1e3) + "K";
    return s + Math.round(v);
    function trim(x) {
      var r = x >= 100 ? Math.round(x) : Math.round(x * 10) / 10;
      return String(r);
    }
  }

  function readInputs() {
    return {
      initial: Math.max(0, Number(els.initial.value) || 0),
      monthly: Math.max(0, Number(els.monthly.value) || 0),
      annualReturn: Math.min(20, Math.max(-5, Number(els.ret.value) || 0)) / 100,
      stepup: Math.min(20, Math.max(0, Number(els.stepup.value) || 0)) / 100,
      years: Math.min(40, Math.max(5, Number(els.years.value) || 25)),
    };
  }

  /* Simulate month by month; keep one data point per year.
     Contributions land at the end of each month; the step-up raises the
     monthly amount once per completed year. */
  function simulate(p) {
    var monthlyRate = Math.pow(1 + p.annualReturn, 1 / 12) - 1;
    var value = p.initial;
    var contributed = p.initial;
    var monthly = p.monthly;
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

  var state = { points: [], xFor: null, yFor: null };

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
    state.points = points; state.xFor = xFor; state.yFor = yFor;

    var svg = svgEl("svg", {
      class: "chart-svg",
      viewBox: "0 0 " + W + " " + H,
      role: "img",
      "aria-label": "Projected portfolio value and cumulative contributions by year",
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
      lbl.textContent = yr === 0 ? "Now" : "Yr " + yr;
      svg.appendChild(lbl);
    }

    // area washes + lines
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
    title.textContent = d.year === 0 ? "Start" : "Year " + d.year;
    tt.appendChild(title);
    [
      { cls: "s1", name: "Portfolio value", val: d.value },
      { cls: "s2", name: "Contributed", val: d.contributed },
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
    var gn = document.createElement("span"); gn.className = "tt-name"; gn.textContent = "Growth";
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
    for (var yr = 0; yr <= years; yr += 5) {
      if (yr === 0) continue;
      appendRow(points[yr]);
    }
    if (years % 5 !== 0) appendRow(points[years]);

    function appendRow(d) {
      var tr = document.createElement("tr");
      var cells = [
        { txt: "Year " + d.year, cls: "" },
        { txt: fmtFull(d.contributed), cls: "num" },
        { txt: fmtFull(d.value - d.contributed), cls: "num" },
        { txt: fmtFull(d.value), cls: "num" },
      ];
      cells.forEach(function (c) {
        var td = document.createElement("td");
        if (c.cls) td.className = c.cls;
        td.textContent = c.txt;
        tr.appendChild(td);
      });
      body.appendChild(tr);
    }
  }

  /* ---------- orchestration ---------- */

  function recalc() {
    var p = readInputs();
    els.yearsOut.textContent = p.years + (p.years === 1 ? " year" : " years");
    var points = simulate(p);
    var last = points[points.length - 1];

    els.heroValue.textContent = fmtFull(last.value);
    els.heroNote.textContent = "Projected value after " + p.years + " years at " +
      (p.annualReturn * 100).toFixed(1).replace(/\.0$/, "") + "% a year, before tax and inflation";
    els.statContrib.textContent = fmtFull(last.contributed);
    els.statGrowth.textContent = fmtFull(last.value - last.contributed);
    els.statMultiple.textContent = last.contributed > 0 ? (last.value / last.contributed).toFixed(1) + "×" : "—";

    renderChart(points);
    renderTable(points);
  }

  els.presets.forEach(function (btn) {
    btn.addEventListener("click", function () {
      els.ret.value = btn.dataset.rate;
      els.presets.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      recalc();
    });
  });

  [els.initial, els.monthly, els.stepup].forEach(function (el) {
    el.addEventListener("input", recalc);
  });
  els.ret.addEventListener("input", function () {
    els.presets.forEach(function (b) {
      b.setAttribute("aria-pressed", Number(b.dataset.rate) === Number(els.ret.value) ? "true" : "false");
    });
    recalc();
  });
  els.years.addEventListener("input", recalc);
  els.currency.addEventListener("change", function () {
    var c = CURRENCIES[currency()];
    els.initial.value = c.perMonthDefaultInitial;
    els.monthly.value = c.perMonthDefault;
    recalc();
  });

  window.addEventListener("resize", function () {
    // viewBox keeps the SVG responsive; only the HTML tooltip needs a reset
    els.tooltip.style.display = "none";
  });

  recalc();
})();
