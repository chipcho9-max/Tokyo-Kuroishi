/* Long Horizon — affiliate links and their disclosure.

   Mark a link with data-aff and everything else follows automatically:

     <a href="https://broker.example/..." data-aff>SBI証券</a>

   The link gets a visible badge, rel="sponsored nofollow noopener", and a
   goal name for analytics; the section it sits in gets a disclosure notice.

   The disclosure is generated from the links rather than written into the
   page on purpose. Japan's stealth-marketing rule (景品表示法, October 2023),
   the FTC's endorsement guides, and Korea's 표시광고법 all require an ad to be
   identifiable as an ad at the point the reader meets it — and a disclosure
   typed by hand goes stale the moment a link is added or removed. Generated,
   it can never claim more or less than what is actually on the page.
*/

(function () {
  "use strict";

  var TEXT = {
    en: {
      badge: "Ad",
      title: "Affiliate disclosure",
      body: "Links marked “Ad” on this page pay this site a commission if you open an " +
            "account through them, at no extra cost to you. They do not change what is " +
            "written here: the same brokers and funds would be named without them, and " +
            "nothing is ranked by what it pays."
    },
    ja: {
      badge: "PR",
      title: "アフィリエイト広告について",
      body: "このページの「PR」表示のリンクは広告です。リンク経由で口座開設などが行われた場合、" +
            "当サイトが報酬を受け取ることがあります。読者の負担が増えることはありません。" +
            "報酬の有無で記載内容は変わりません — 報酬がなくても同じ証券会社・ファンドを同じように挙げますし、" +
            "報酬額で順位を並べ替えることもしません。"
    },
    ko: {
      badge: "광고",
      title: "제휴 광고 안내",
      body: "이 페이지에서 ‘광고’로 표시된 링크를 통해 계좌를 개설하면 이 사이트가 수수료를 " +
            "받을 수 있습니다. 독자가 추가로 부담하는 비용은 없습니다. 보수의 유무가 서술 내용을 " +
            "바꾸지는 않습니다 — 보수가 없어도 같은 증권사와 펀드를 동일하게 소개하며, " +
            "보수 금액으로 순서를 바꾸지 않습니다."
    }
  };

  function init() {
    var links = document.querySelectorAll("a[data-aff]");
    if (!links.length) return;

    var lang = document.documentElement.lang || "en";
    var t = TEXT[lang] || TEXT.en;
    var sections = [];

    links.forEach(function (a) {
      a.setAttribute("rel", "sponsored nofollow noopener");
      a.setAttribute("target", "_blank");
      if (!a.dataset.lhGoal) a.dataset.lhGoal = "Affiliate click";

      if (!a.querySelector(".aff-badge")) {
        var badge = document.createElement("span");
        badge.className = "aff-badge";
        badge.textContent = t.badge;
        a.appendChild(document.createTextNode(" "));
        a.appendChild(badge);
      }

      var section = a.closest("section") || document.body;
      if (sections.indexOf(section) < 0) sections.push(section);
    });

    sections.forEach(function (section) {
      if (section.querySelector(".aff-disclosure")) return;
      var host = section.querySelector(".container") || section;

      var box = document.createElement("aside");
      box.className = "aff-disclosure";
      var strong = document.createElement("strong");
      strong.textContent = t.title;
      box.appendChild(strong);
      box.appendChild(document.createTextNode(" " + t.body));

      /* below the heading, above the content it applies to */
      var heading = host.querySelector("h1, h2");
      if (heading && heading.nextSibling) host.insertBefore(box, heading.nextSibling);
      else if (heading) host.appendChild(box);
      else host.insertBefore(box, host.firstChild);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
