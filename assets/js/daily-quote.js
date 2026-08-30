/* Long Horizon — daily rotating quote banner.

   One quote per calendar day, picked deterministically from the pool so every
   visitor sees the same quote on the same day, and it changes at local midnight.
   Each banner carries a data-quote-slot so different pages show different
   quotes on the same day.

   The pool deliberately excludes the quotes that already appear inline on the
   pages, so a banner never duplicates the quote sitting next to it, and it is
   ordered so no two neighbouring entries share an author. */

(function () {
  "use strict";

  var LABEL = { en: "Quote of the day", ja: "今日の一言", ko: "오늘의 한마디" };
  /* match the punctuation the inline quotes on the pages already use */
  var MARKS = { en: ["\u0022", "\u0022"], ja: ["\u300c", "\u300d"], ko: ["\u0022", "\u0022"] };

  // t = quote text, a = author, s = optional source note
  var POOL = [
    { a: { en: "Warren Buffett", ja: "ウォーレン・バフェット", ko: "워런 버핏" },
      s: { en: ", Berkshire Hathaway shareholder letter, 2008", ja: "(バークシャー・ハサウェイ株主への手紙、2008年)", ko: "(버크셔 해서웨이 주주서한, 2008)" },
      t: { en: "Price is what you pay. Value is what you get.",
           ja: "価格とは支払うもの。価値とは手に入れるものだ。",
           ko: "가격은 당신이 지불하는 것이고, 가치는 당신이 얻는 것이다." } },

    { a: { en: "Peter Lynch", ja: "ピーター・リンチ", ko: "피터 린치" },
      t: { en: "Know what you own, and know why you own it.",
           ja: "自分が何を持っているかを知り、なぜ持っているのかを知れ。",
           ko: "자신이 무엇을 갖고 있는지 알고, 왜 갖고 있는지 알라." } },

    { a: { en: "Benjamin Graham", ja: "ベンジャミン・グレアム", ko: "벤저민 그레이엄" },
      s: { en: ", The Intelligent Investor", ja: "(『賢明なる投資家』)", ko: "(『현명한 투자자』)" },
      t: { en: "The intelligent investor is a realist who sells to optimists and buys from pessimists.",
           ja: "賢明な投資家とは、楽観主義者に売り、悲観主義者から買う現実主義者である。",
           ko: "현명한 투자자란 낙관론자에게 팔고 비관론자에게서 사는 현실주의자다." } },

    { a: { en: "Charlie Munger", ja: "チャーリー・マンガー", ko: "찰리 멍거" },
      t: { en: "Knowing what you don't know is more useful than being brilliant.",
           ja: "自分が何を知らないかを知っているほうが、頭が切れることよりも役に立つ。",
           ko: "자신이 무엇을 모르는지 아는 것이, 똑똑한 것보다 쓸모 있다." } },

    { a: { en: "Warren Buffett", ja: "ウォーレン・バフェット", ko: "워런 버핏" },
      s: { en: ", Berkshire Hathaway shareholder letter, 1989", ja: "(バークシャー・ハサウェイ株主への手紙、1989年)", ko: "(버크셔 해서웨이 주주서한, 1989)" },
      t: { en: "It's far better to buy a wonderful company at a fair price than a fair company at a wonderful price.",
           ja: "そこそこの企業を素晴らしい価格で買うより、素晴らしい企業をそこそこの価格で買うほうが、はるかに良い。",
           ko: "괜찮은 기업을 훌륭한 가격에 사는 것보다, 훌륭한 기업을 괜찮은 가격에 사는 편이 훨씬 낫다." } },

    { a: { en: "Peter Lynch", ja: "ピーター・リンチ", ko: "피터 린치" },
      s: { en: ", One Up on Wall Street", ja: "(『ピーター・リンチの株で勝つ』)", ko: "(『전설로 떠나는 월가의 영웅』)" },
      t: { en: "The real key to making money in stocks is not to get scared out of them.",
           ja: "株で儲ける本当の鍵は、怖くなって株から逃げ出さないことだ。",
           ko: "주식으로 돈을 버는 진짜 열쇠는, 겁먹고 주식에서 빠져나오지 않는 것이다." } },

    { a: { en: "John C. Bogle", ja: "ジョン・C・ボーグル", ko: "존 C. 보글" },
      t: { en: "Time is your friend; impulse is your enemy.",
           ja: "時間は味方であり、衝動は敵である。",
           ko: "시간은 당신의 친구이고, 충동은 당신의 적이다." } },

    { a: { en: "Benjamin Graham", ja: "ベンジャミン・グレアム", ko: "벤저민 그레이엄" },
      s: { en: ", The Intelligent Investor", ja: "(『賢明なる投資家』)", ko: "(『현명한 투자자』)" },
      t: { en: "Obvious prospects for physical growth in a business do not translate into obvious profits for investors.",
           ja: "事業が目に見えて成長するという明白な見通しは、投資家にとっての明白な利益には変わらない。",
           ko: "사업이 눈에 띄게 성장하리라는 명백한 전망이, 투자자에게 명백한 이익으로 이어지지는 않는다." } },

    { a: { en: "Warren Buffett", ja: "ウォーレン・バフェット", ko: "워런 버핏" },
      t: { en: "Risk comes from not knowing what you're doing.",
           ja: "リスクとは、自分が何をしているのか分かっていないことから生まれる。",
           ko: "리스크는 자신이 무엇을 하는지 모르는 데서 온다." } },

    { a: { en: "Peter Lynch", ja: "ピーター・リンチ", ko: "피터 린치" },
      t: { en: "Far more money has been lost by investors preparing for corrections than has been lost in corrections themselves.",
           ja: "調整に備えようとして失われたお金は、調整そのもので失われたお金より、はるかに多い。",
           ko: "조정에 대비하려다 잃은 돈이, 조정 그 자체로 잃은 돈보다 훨씬 많다." } },

    { a: { en: "Warren Buffett", ja: "ウォーレン・バフェット", ko: "워런 버핏" },
      t: { en: "The most important quality for an investor is temperament, not intellect.",
           ja: "投資家にとって最も重要な資質は、知性ではなく気質である。",
           ko: "투자자에게 가장 중요한 자질은 지능이 아니라 기질이다." } },

    { a: { en: "Benjamin Graham", ja: "ベンジャミン・グレアム", ko: "벤저민 그레이엄" },
      t: { en: "The essence of investment management is the management of risks, not the management of returns.",
           ja: "投資運用の本質は、リターンの管理ではなくリスクの管理である。",
           ko: "투자 운용의 본질은 수익의 관리가 아니라 리스크의 관리다." } },

    { a: { en: "Charlie Munger", ja: "チャーリー・マンガー", ko: "찰리 멍거" },
      t: { en: "It's waiting that helps you as an investor, and a lot of people just can't stand to wait.",
           ja: "投資家を助けてくれるのは待つことだ。だが多くの人は、待つことに耐えられない。",
           ko: "투자자를 돕는 것은 기다림이다. 그런데 많은 사람이 기다리는 것을 견디지 못한다." } },

    { a: { en: "Peter Lynch", ja: "ピーター・リンチ", ko: "피터 린치" },
      t: { en: "Everyone has the brainpower to make money in stocks. Not everyone has the stomach.",
           ja: "株で儲けるだけの頭脳は誰にでもある。だが、それに耐える胃袋は誰にでもあるわけではない。",
           ko: "주식으로 돈을 벌 두뇌는 누구에게나 있다. 그것을 견딜 배짱은 누구에게나 있지 않다." } },

    { a: { en: "Warren Buffett", ja: "ウォーレン・バフェット", ko: "워런 버핏" },
      t: { en: "Never invest in a business you cannot understand.",
           ja: "理解できないビジネスには、決して投資してはいけない。",
           ko: "이해할 수 없는 사업에는 결코 투자하지 마라." } },

    { a: { en: "Benjamin Graham", ja: "ベンジャミン・グレアム", ko: "벤저민 그레이엄" },
      t: { en: "Individuals who cannot master their emotions are ill-suited to profit from the investment process.",
           ja: "自分の感情を御することができない人は、投資から利益を得るのに向いていない。",
           ko: "자신의 감정을 다스리지 못하는 사람은 투자로 이익을 얻기에 적합하지 않다." } },

    { a: { en: "Peter Lynch", ja: "ピーター・リンチ", ko: "피터 린치" },
      t: { en: "Time is on your side when you own shares of superior companies.",
           ja: "優れた企業の株を持っているとき、時間は味方である。",
           ko: "뛰어난 기업의 주식을 갖고 있을 때, 시간은 당신 편이다." } },

    { a: { en: "John C. Bogle", ja: "ジョン・C・ボーグル", ko: "존 C. 보글" },
      t: { en: "Stay the course. No matter what happens, stick to your program.",
           ja: "進路を守れ。何が起きても、自分の計画を貫け。",
           ko: "항로를 지켜라. 무슨 일이 있어도 자신의 계획을 고수하라." } },

    { a: { en: "Warren Buffett", ja: "ウォーレン・バフェット", ko: "워런 버핏" },
      t: { en: "You only have to do a very few things right in your life so long as you don't do too many things wrong.",
           ja: "ひどい間違いをいくつも重ねさえしなければ、人生で正しくやるべきことはほんの少しでいい。",
           ko: "크게 잘못하는 일만 없다면, 인생에서 제대로 해야 할 일은 아주 몇 가지뿐이다." } },

    { a: { en: "Charlie Munger", ja: "チャーリー・マンガー", ko: "찰리 멍거" },
      t: { en: "The world is full of foolish gamblers, and they will not do as well as the patient investor.",
           ja: "世の中は愚かなギャンブラーであふれている。彼らは、辛抱強い投資家ほどの成果は得られない。",
           ko: "세상은 어리석은 도박꾼으로 가득하다. 그들은 인내심 있는 투자자만큼의 성과를 내지 못한다." } },

    { a: { en: "Benjamin Graham", ja: "ベンジャミン・グレアム", ko: "벤저민 그레이엄" },
      s: { en: ", Security Analysis", ja: "(『証券分析』)", ko: "(『증권분석』)" },
      t: { en: "An investment operation is one which, upon thorough analysis, promises safety of principal and an adequate return.",
           ja: "投資とは、徹底した分析に基づき、元本の安全と適切なリターンを約束する行為である。",
           ko: "투자란 철저한 분석을 바탕으로 원금의 안전과 적절한 수익을 약속하는 행위다." } },

    { a: { en: "Warren Buffett", ja: "ウォーレン・バフェット", ko: "워런 버핏" },
      t: { en: "The best thing that happens to us is when a great company gets into temporary trouble.",
           ja: "私たちにとって最良の出来事は、優れた企業が一時的な苦境に陥ることだ。",
           ko: "우리에게 가장 좋은 일은, 훌륭한 기업이 일시적인 어려움에 빠지는 것이다." } },

    { a: { en: "Peter Lynch", ja: "ピーター・リンチ", ko: "피터 린치" },
      t: { en: "Absent a lot of surprises, stocks are relatively predictable over twenty years.",
           ja: "大きな驚きさえなければ、株式は20年という単位では比較的読みやすい。",
           ko: "큰 이변만 없다면, 주식은 20년 단위에서는 비교적 예측 가능하다." } }

  ];

  /* Local calendar day as an integer, so the quote turns over at local midnight
     rather than at UTC midnight. */
  function localDayNumber() {
    var d = new Date();
    return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);
  }

  function render(el) {
    var lang = document.documentElement.lang || "en";
    if (!LABEL[lang]) lang = "en";
    var slot = parseInt(el.getAttribute("data-quote-slot"), 10) || 0;
    /* The pool is ordered so that no two neighbouring entries share an author.
       Stepping through it one place per day and one place per slot therefore
       varies the voice both between pages and from one day to the next. */
    var i = localDayNumber() + slot;
    var q = POOL[((i % POOL.length) + POOL.length) % POOL.length];

    el.textContent = "";

    var label = document.createElement("div");
    label.className = "qb-label";
    label.textContent = LABEL[lang];

    var fig = document.createElement("figure");

    var bq = document.createElement("blockquote");
    var text = document.createElement("p");
    text.className = "qb-text";
    text.textContent = MARKS[lang][0] + q.t[lang] + MARKS[lang][1];
    bq.appendChild(text);

    // non-English pages also carry the English original, as the inline quotes do
    if (lang !== "en") {
      var orig = document.createElement("p");
      orig.className = "qb-orig";
      orig.textContent = MARKS.en[0] + q.t.en + MARKS.en[1];
      bq.appendChild(orig);
    }

    var cap = document.createElement("figcaption");
    cap.textContent = "— " + q.a[lang];
    if (q.s && q.s[lang]) {
      var src = document.createElement("span");
      src.className = "qb-src";
      src.textContent = q.s[lang];
      cap.appendChild(src);
    }

    fig.appendChild(bq);
    fig.appendChild(cap);
    el.appendChild(label);
    el.appendChild(fig);
    el.classList.add("is-loaded");
  }

  function init() {
    document.querySelectorAll(".quote-banner").forEach(render);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
