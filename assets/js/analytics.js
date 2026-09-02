/* Long Horizon — measurement.

   Off by default: with provider empty nothing is loaded and no request leaves
   the reader's browser. Fill CONFIG in to switch it on.

   Choosing a provider is a trade-off, not a preference:

     "cloudflare"  free, cookieless, no consent banner needed — but page views
                   only. It cannot answer "which link did they click", which is
                   the question monetisation actually depends on.
     "plausible"   paid, cookieless, no consent banner needed, custom events.
                   The best fit for this site.
     "ga4"         free, full-featured, but sets cookies — using it makes
                   consent (GDPR / 個人情報保護法 / PIPA) your problem.

   To exclude your own visits from the numbers, run this once in the browser
   console on the live site:  localStorage.setItem("lh-no-analytics", "1")
*/

(function () {
  "use strict";

  var CONFIG = {
    provider: "",            // "cloudflare" | "plausible" | "ga4" | "" (off)
    cloudflareToken: "",     // Cloudflare Web Analytics beacon token
    plausibleDomain: "",     // the bare domain you registered, e.g. "example.com"
    ga4MeasurementId: ""     // "G-XXXXXXXXXX"
  };

  window.LH = window.LH || {};

  function optedOut() {
    try { return localStorage.getItem("lh-no-analytics") === "1"; } catch (e) { return false; }
  }

  function script(src, attrs) {
    var s = document.createElement("script");
    s.src = src;
    s.defer = true;
    Object.keys(attrs || {}).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    document.head.appendChild(s);
    return s;
  }

  /* No provider, or a provider that was named but never configured, leaves
     LH.track as a no-op so callers never have to check. */
  window.LH.track = function () {};

  if (optedOut()) return;

  if (CONFIG.provider === "cloudflare" && CONFIG.cloudflareToken) {
    script("https://static.cloudflareinsights.com/beacon.min.js",
      { "data-cf-beacon": JSON.stringify({ token: CONFIG.cloudflareToken }) });
    // no custom-event API — LH.track stays a no-op by design

  } else if (CONFIG.provider === "plausible" && CONFIG.plausibleDomain) {
    window.plausible = window.plausible || function () {
      (window.plausible.q = window.plausible.q || []).push(arguments);
    };
    script("https://plausible.io/js/script.js", { "data-domain": CONFIG.plausibleDomain });
    window.LH.track = function (name, props) {
      window.plausible(name, props ? { props: props } : undefined);
    };

  } else if (CONFIG.provider === "ga4" && CONFIG.ga4MeasurementId) {
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag("js", new Date());
    gtag("config", CONFIG.ga4MeasurementId);
    script("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(CONFIG.ga4MeasurementId));
    window.LH.track = function (name, props) { gtag("event", name, props || {}); };
  }

  /* Outbound clicks. Monetisation lives or dies on these: a page view tells
     you nothing about whether the reader went on to open an account. Links
     carrying data-lh-goal are reported under that name instead. */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.host === location.host || !/^https?:$/.test(url.protocol)) return;

    window.LH.track(a.dataset.lhGoal || "Outbound", {
      to: url.host,
      from: location.pathname,
      lang: document.documentElement.lang || "en"
    });
  }, true);
})();
