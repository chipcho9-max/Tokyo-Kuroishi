/* Long Horizon — shared site behavior: theme toggle + mobile nav */

(function () {
  var root = document.documentElement;
  var STORAGE_KEY = "lh-theme";

  function storedTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function applyTheme(theme) {
    if (theme === "dark" || theme === "light") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
    var btn = document.querySelector(".theme-toggle");
    if (btn) {
      var effectiveDark = theme === "dark" ||
        (theme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      btn.textContent = effectiveDark ? "☀" : "☾";
      btn.setAttribute("aria-label", effectiveDark ? "Switch to light theme" : "Switch to dark theme");
    }
  }

  applyTheme(storedTheme());

  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(storedTheme());

    var btn = document.querySelector(".theme-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        var current = root.getAttribute("data-theme");
        var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        var effectiveDark = current === "dark" || (!current && systemDark);
        var next = effectiveDark ? "light" : "dark";
        try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* private mode */ }
        applyTheme(next);
        document.dispatchEvent(new CustomEvent("lh-theme-change"));
      });
    }

    var burger = document.querySelector(".nav-burger");
    var links = document.querySelector(".nav-links");
    if (burger && links) {
      burger.addEventListener("click", function () {
        var open = links.classList.toggle("open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    // mark the current page in the nav
    var path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === path) a.setAttribute("aria-current", "page");
    });
  });
})();
