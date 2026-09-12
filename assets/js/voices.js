/* Long Horizon — what the people building this are actually saying.

   Updated roughly twice a week. Rules for anything added here, which exist
   because a misattributed quotation on a public site is a real harm:

     1. Every entry carries a source URL and the date of the statement.
        No source, no entry.
     2. Quote what was said, not what it was reported to mean. If the wording
        cannot be checked against a transcript, filing, recording or the
        speaker's own post, leave it out.
     3. `why` is this site's own reading, not the speaker's. Keep that line
        about what the statement implies for someone holding for decades —
        never a price view, never a recommendation.
     4. Newest first. Old entries stay: the record of what people said before
        an outcome was known is the most useful part of a page like this.

   The page renders from this file in all three languages, so an update
   touches this file alone.
*/

(function () {
  "use strict";

  var UPDATED = "2026-09-12";

  var LABEL = {
    en: { updated: "Last updated", source: "Source", why: "Why a long-horizon holder should care", empty: "No entries yet." },
    ja: { updated: "最終更新", source: "出典", why: "長期保有者にとっての意味", empty: "まだ項目がありません。" },
    ko: { updated: "마지막 업데이트", source: "출처", why: "장기 보유자에게 주는 의미", empty: "아직 항목이 없습니다." }
  };

  /* d = date of the statement (YYYY-MM-DD), t = quote, why = this site's reading */
  var VOICES = [
    {
      d: "2026-09-06",
      who: { en: "Jensen Huang", ja: "ジェンスン・ファン", ko: "젠슨 황" },
      role: { en: "CEO, Nvidia", ja: "Nvidia CEO", ko: "엔비디아 CEO" },
      where: { en: "Post on X", ja: "X への投稿", ko: "X 게시물" },
      url: "https://finance.yahoo.com/technology/ai/articles/jensen-huang-declares-agi-arrived-163016628.html",
      t: {
        en: "AGI has arrived.",
        ja: "AGIは到達した。",
        ko: "AGI는 도달했다."
      },
      why: {
        en: "Read it beside what the same person said on the earnings call eleven days earlier, below. A chief executive marketing his own hardware and a chief executive answering analysts are two different registers, and the gap between them is the most useful thing on this page.",
        ja: "11日前の決算説明会での同じ人物の発言(下)と並べて読んでください。自社ハードを売る立場での発言と、アナリストに答える立場での発言は別の言語です。そしてその落差こそが、このページで最も役に立つ情報です。",
        ko: "11일 전 실적 발표에서 같은 인물이 한 발언(아래)과 나란히 놓고 읽으십시오. 자사 하드웨어를 파는 자리에서의 발언과 애널리스트에게 답하는 자리에서의 발언은 다른 언어입니다. 그리고 그 격차가 이 페이지에서 가장 쓸모 있는 정보입니다."
      }
    },
    {
      d: "2026-08-26",
      who: { en: "Jensen Huang", ja: "ジェンスン・ファン", ko: "젠슨 황" },
      role: { en: "CEO, Nvidia", ja: "Nvidia CEO", ko: "엔비디아 CEO" },
      where: { en: "Q2 FY2027 earnings call", ja: "2027年度第2四半期 決算説明会", ko: "FY2027 2분기 실적 발표" },
      url: "https://explainx.ai/blog/jensen-huang-agi-has-arrived-gpt-6-astra-nvidia-september-2026",
      t: {
        en: "If we had more compute, we could generate more profitable tokens.",
        ja: "もっと計算資源があれば、もっと利益の出るトークンを生成できる。",
        ko: "연산 자원이 더 있다면, 더 수익성 있는 토큰을 생성할 수 있다."
      },
      why: {
        en: "This is the infrastructure argument stated by the person with the most to gain from it, which is a reason to check it rather than dismiss it. If compute is the binding constraint, the constraint behind compute is electricity — and that is a physical build-out with permitting queues and grid connections, not a software release cycle.",
        ja: "これは、その主張から最も利益を得る人物の口から出た「インフラ論」です。だからこそ退けるのではなく検証する価値があります。計算資源が制約なら、その計算資源の背後にある制約は電力です。そして電力は、ソフトウェアのリリースサイクルではなく、許認可待ちと系統接続を伴う物理的な建設です。",
        ko: "이것은 그 주장으로 가장 크게 이득을 보는 인물의 입에서 나온 '인프라 논리'입니다. 그래서 무시할 것이 아니라 검증할 가치가 있습니다. 연산이 제약이라면 그 연산 뒤의 제약은 전력이고, 전력은 소프트웨어 릴리스 주기가 아니라 인허가 대기와 계통 연결을 수반하는 물리적 건설입니다."
      }
    },
    {
      d: "2026-08-04",
      who: { en: "Lisa Su", ja: "リサ・スー", ko: "리사 수" },
      role: { en: "CEO, AMD", ja: "AMD CEO", ko: "AMD CEO" },
      where: { en: "Q2 2026 earnings call", ja: "2026年第2四半期 決算説明会", ko: "2026년 2분기 실적 발표" },
      url: "https://www.cnbc.com/2026/08/04/amd-earnings-report-q2-2026.html",
      t: {
        en: "Demand for both accelerators and CPUs is growing well above our prior expectations.",
        ja: "アクセラレータとCPUの双方で、需要は当社の従来想定を大きく上回って伸びている。",
        ko: "가속기와 CPU 양쪽 모두에서 수요가 기존 예상을 크게 웃돌며 성장하고 있다."
      },
      why: {
        en: "Note what it does not say. Demand running above expectations is a statement about revenue, not about the return on a share bought at today's price. AMD's revenue rose 50% and its data-centre sales doubled in the same quarter — and the stock fell on the day. That gap is the entire subject of this site.",
        ja: "言っていないことに注目してください。需要が想定を上回るのは売上の話であって、今日の株価で買った株のリターンの話ではありません。同じ四半期にAMDの売上は50%増、データセンター部門は倍増しました — そしてその日、株価は下落しました。この落差こそがこのサイトの主題そのものです。",
        ko: "말하지 않은 것에 주목하십시오. 수요가 예상을 웃도는 것은 매출의 이야기이지, 오늘의 주가에 산 주식의 수익률 이야기가 아닙니다. 같은 분기에 AMD의 매출은 50% 늘었고 데이터센터 매출은 두 배가 되었습니다 — 그리고 그날 주가는 떨어졌습니다. 이 간극이 이 사이트의 주제 그 자체입니다."
      }
    },
    {
      d: "2026-07-14",
      who: { en: "Mark Zuckerberg", ja: "マーク・ザッカーバーグ", ko: "마크 저커버그" },
      role: { en: "CEO, Meta", ja: "Meta CEO", ko: "메타 CEO" },
      where: { en: "On Meta's multi-gigawatt AI clusters", ja: "Metaのギガワット級AIクラスタについて", ko: "메타의 기가와트급 AI 클러스터에 대해" },
      url: "https://www.itpro.com/infrastructure/data-centres/meta-working-on-a-5gw-data-center-to-supercharge-ai-infrastructure-and-mark-zuckerberg-says-one-cluster-alone-covers-a-significant-part-of-the-footprint-of-manhattan",
      t: {
        en: "Just one of these covers a significant part of the footprint of Manhattan.",
        ja: "このうちのたった1つが、マンハッタンの面積のかなりの部分を覆う。",
        ko: "이 가운데 단 하나가 맨해튼 면적의 상당 부분을 덮는다."
      },
      why: {
        en: "The clearest statement that this build-out is physical. Land, transformers, turbines, water and transmission lines have lead times measured in years and cannot be accelerated by capital alone. That is what makes the suppliers of those things a different kind of exposure from the model companies — and also what makes them capital-intensive businesses with all the risks that carries.",
        ja: "この建設が物理的なものであることを最も明確に示した発言です。土地、変圧器、タービン、水、送電線のリードタイムは年単位で、資金だけでは短縮できません。だからこそ、それらを供給する側はモデル企業とは性質の違うエクスポージャーになります — そして同時に、資本集約型事業に固有のリスクを全部背負う商売でもあります。",
        ko: "이 건설이 물리적인 것임을 가장 분명하게 보여 준 발언입니다. 토지, 변압기, 터빈, 물, 송전선의 리드타임은 연 단위이고 자본만으로 단축되지 않습니다. 그래서 이것들을 공급하는 쪽은 모델 기업과는 성격이 다른 익스포저가 됩니다 — 동시에 자본집약적 사업 특유의 위험을 그대로 지는 장사이기도 합니다."
      }
    }
  ];

  function fmtDate(iso, lang) {
    var p = iso.split("-");
    if (lang === "ja") return p[0] + "年" + (+p[1]) + "月" + (+p[2]) + "日";
    if (lang === "ko") return p[0] + "년 " + (+p[1]) + "월 " + (+p[2]) + "일";
    var M = ["January", "February", "March", "April", "May", "June",
             "July", "August", "September", "October", "November", "December"];
    return M[+p[1] - 1] + " " + (+p[2]) + ", " + p[0];
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function render(root) {
    var lang = document.documentElement.lang || "en";
    if (!LABEL[lang]) lang = "en";
    var L = LABEL[lang];
    root.textContent = "";

    var stamp = el("p", "voices-updated", L.updated + ": " + fmtDate(UPDATED, lang));
    root.appendChild(stamp);

    if (!VOICES.length) {
      root.appendChild(el("p", "small", L.empty));
      return;
    }

    var list = el("div", "voices-list");
    VOICES.forEach(function (v) {
      var card = el("article", "voice");

      var head = el("div", "voice-head");
      head.appendChild(el("span", "voice-who", v.who[lang]));
      head.appendChild(el("span", "voice-role", v.role[lang]));
      head.appendChild(el("span", "voice-date", fmtDate(v.d, lang)));
      card.appendChild(head);

      var fig = el("figure");
      var bq = el("blockquote");
      bq.appendChild(el("p", "voice-text", "“" + v.t[lang] + "”"));
      if (lang !== "en") bq.appendChild(el("p", "voice-orig", "“" + v.t.en + "”"));
      fig.appendChild(bq);

      var cap = el("figcaption", "voice-src");
      cap.appendChild(document.createTextNode(v.where[lang] + " · "));
      var a = el("a", null, L.source);
      a.href = v.url;
      a.target = "_blank";
      a.rel = "noopener nofollow";
      cap.appendChild(a);
      fig.appendChild(cap);
      card.appendChild(fig);

      var why = el("div", "voice-why");
      why.appendChild(el("strong", null, L.why));
      why.appendChild(document.createTextNode(" " + v.why[lang]));
      card.appendChild(why);

      list.appendChild(card);
    });
    root.appendChild(list);
  }

  function init() {
    var root = document.getElementById("voices-root");
    if (root) render(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
