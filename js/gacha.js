/* 0rnot // gacha.js — REROLL-∞ 人生ガチャ */
(() => {
  "use strict";
  const { W, sfx, fx } = window.Casino;

  const POOL = [
    { r: "UR",  w: 5,   pay: +100, name: "上級国民の孫",       note: "生まれた時点でクリア" },
    { r: "SSR", w: 20,  pay: +40,  name: "実家が太い",         note: "努力、不要でした" },
    { r: "SSR", w: 15,  pay: +35,  name: "顔がいい",           note: "面接無双（期限あり）" },
    { r: "SR",  w: 80,  pay: +12,  name: "大手内定（コネ）",   note: "実力と書いてコネと読む" },
    { r: "SR",  w: 60,  pay: +10,  name: "宝くじ3等",          note: "税引後は気持ち程度" },
    { r: "R",   w: 200, pay: +2,   name: "健康な身体",         note: "※期間限定コンテンツ" },
    { r: "R",   w: 150, pay: +1,   name: "気の合う同僚",       note: "来月退職します" },
    { r: "N",   w: 250, pay: 0,    name: "現状維持",           note: "実質デバフ" },
    { r: "N",   w: 150, pay: -2,   name: "花粉症デビュー",     note: "恒久コンテンツ" },
    { r: "N",   w: 70,  pay: -5,   name: "上司ガチャ大失敗",   note: "リセマラ不可" },
  ];
  const BAG = [];
  POOL.forEach((c, i) => { for (let k = 0; k < c.w; k++) BAG.push(i); });
  const draw = () => POOL[BAG[Math.random() * BAG.length | 0]];
  const RANK = { N: 0, R: 1, SR: 2, SSR: 3, UR: 4 };

  const $ = (s) => document.querySelector(s);
  const grid = $("#gacha-grid"), msg = $("#gacha-msg");
  const b1 = $("#btn-gacha1"), b10 = $("#btn-gacha10");
  if (!grid) return;

  const say = (h) => { msg.innerHTML = h; };

  function renderBtns() {
    if (W.broke()) {
      b1.textContent = "借金する +20"; b1.classList.add("debt");
      b10.disabled = true;
    } else {
      b1.textContent = "1回 // 3消費"; b1.classList.remove("debt");
      b10.disabled = false;
    }
  }
  document.addEventListener("walletchange", renderBtns);

  function cardEl(c, delay) {
    const d = document.createElement("div");
    d.className = "gcard r-" + c.r;
    d.style.animationDelay = (delay || 0) + "ms";
    d.innerHTML = '<span class="gr">' + c.r + '</span><span class="gn">' + c.name +
      '</span><span class="gp">' + (c.pay >= 0 ? "+" : "") + c.pay +
      '</span><span class="gnote">' + c.note + "</span>";
    return d;
  }

  let busy = false;
  function pull(n) {
    if (busy) return;
    if (W.broke()) {
      const debt = W.borrow();
      say("<b>+20 融資。</b>ガチャを回すための借金。教科書に載せたい健全さです。累計負債: <b>¥" +
        (debt * 10000).toLocaleString() + "</b>");
      sfx.borrow(); return;
    }
    const cost = n === 10 ? 25 : 3;
    if (!W.pay(cost)) {
      say("信用不足。ガチャすら引けない信用って、逆にレアですよ。");
      sfx.lose(); return;
    }
    busy = true; b1.disabled = true; b10.disabled = true;
    grid.innerHTML = "";
    say(n === 10 ? "10連召喚中。天井はありません。あなたの生活には床もありません。"
                 : "召喚中。結果は演出より先に、もう決まっています。");

    const results = Array.from({ length: n }, draw);
    // 10連: "R以上1枚保証" — a guarantee that changes nothing, statistically
    if (n === 10 && results.every(c => c.r === "N")) results[9] = POOL[5];

    results.forEach((c, i) => {
      setTimeout(() => {
        grid.appendChild(cardEl(c, 0));
        sfx.flip();
        if (RANK[c.r] >= 3) { fx.flash(false); window.Casino.beep(1100, .1, .05); }
      }, 260 * i + 200);
    });

    setTimeout(() => {
      const total = results.reduce((s, c) => s + c.pay, 0);
      const best = results.reduce((a, c) => RANK[c.r] > RANK[a.r] ? c : a, results[0]);
      W.earn(total);
      const tier = RANK[best.r] >= 4 ? 3 : RANK[best.r] >= 3 ? 2 : (total > 0 ? 1 : 0);
      if (tier >= 2) fx.win(tier, best.r + " " + best.name, total);
      else if (tier === 1) sfx.coin();
      else sfx.lose();

      const line = total > 0
        ? "収支 <b>+" + total + "</b>。おめでとうございます。なお現実の残高は変動していません。"
        : total === 0
        ? "収支 <b>±0</b>。時間だけが確実に減りました。"
        : "収支 <b>" + total + "</b>。引くほど減る。人生ガチャの仕様です。";
      say("最高レア: <b>" + best.r + "「" + best.name + "」</b> — " + line);

      busy = false; b1.disabled = false; b10.disabled = false; renderBtns();
    }, 260 * n + 700);
  }

  b1.addEventListener("click", () => pull(1));
  b10.addEventListener("click", () => pull(10));
  renderBtns();
})();
