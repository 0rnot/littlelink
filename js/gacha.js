/* 0rnot // gacha.js — REROLL-∞ 人生ガチャ v2 */
(() => {
  "use strict";
  const { W, sfx, fx } = window.Casino;

  /* rarity: N < R < SR < SSR < UR < LR */
  const RANK = { N: 0, R: 1, SR: 2, SSR: 3, UR: 4, LR: 5 };

  /* w = weight (per 10000) */
  const POOL = [
    /* ---- LR 0.2% ---- */
    { r: "LR", w: 10, pay: +300, name: "前世の徳(未使用)",     note: "初期化漏れの奇跡" },
    { r: "LR", w: 10, pay: +250, name: "資本家の養子縁組",     note: "ラストのRはリセマラのR" },
    /* ---- UR 1% ---- */
    { r: "UR", w: 30, pay: +120, name: "上級国民の孫",         note: "生まれた時点でクリア" },
    { r: "UR", w: 30, pay: +100, name: "地面師も逃げる地主",   note: "土地は裏切らない" },
    { r: "UR", w: 40, pay: +90,  name: "宝くじ1等(税引後)",    note: "友達は増えます。減りもします" },
    /* ---- SSR 4% ---- */
    { r: "SSR", w: 100, pay: +45, name: "実家が太い",          note: "努力、不要でした" },
    { r: "SSR", w: 90,  pay: +40, name: "顔がいい",            note: "面接無双（期限あり）" },
    { r: "SSR", w: 80,  pay: +38, name: "声がいい",            note: "何を言っても通る" },
    { r: "SSR", w: 70,  pay: +35, name: "謎の不労所得",        note: "深く聞かないでください" },
    { r: "SSR", w: 60,  pay: +32, name: "バズる才能",          note: "炎上と紙一重" },
    /* ---- SR 15% ---- */
    { r: "SR", w: 260, pay: +15, name: "大手内定（コネ）",     note: "実力と書いてコネと読む" },
    { r: "SR", w: 240, pay: +14, name: "宝くじ3等",            note: "税引後は気持ち程度" },
    { r: "SR", w: 230, pay: +12, name: "英語ペラペラ",         note: "会議で黙る技術は別売り" },
    { r: "SR", w: 220, pay: +12, name: "医者の知り合い",       note: "予約が取れる人生" },
    { r: "SR", w: 200, pay: +11, name: "家賃補助MAX",          note: "実質年収+50万" },
    { r: "SR", w: 190, pay: +10, name: "有給が取れる職場",     note: "都市伝説ではなかった" },
    { r: "SR", w: 160, pay: +10, name: "腰痛と無縁の腰",       note: "30代で真価を発揮" },
    /* ---- R 33% ---- */
    { r: "R", w: 500, pay: +4, name: "健康な身体",             note: "※期間限定コンテンツ" },
    { r: "R", w: 450, pay: +3, name: "気の合う同僚",           note: "来月退職します" },
    { r: "R", w: 420, pay: +3, name: "よく眠れる才能",         note: "会議中に発動します" },
    { r: "R", w: 400, pay: +3, name: "定時退社(今日だけ)",     note: "明日は知りません" },
    { r: "R", w: 380, pay: +2, name: "ポイント10倍デー",       note: "人生で一番の追い風" },
    { r: "R", w: 350, pay: +2, name: "傘を持ってた日の雨",     note: "小さな全能感" },
    { r: "R", w: 300, pay: +2, name: "レジの列、当たり",       note: "選球眼の無駄遣い" },
    { r: "R", w: 250, pay: +1, name: "推しの新規供給",         note: "財布への予告状" },
    { r: "R", w: 250, pay: +1, name: "上司の外出",             note: "オフィスに平和が訪れる" },
    /* ---- N 46.8% ---- */
    { r: "N", w: 700, pay: 0,  name: "現状維持",               note: "実質デバフ" },
    { r: "N", w: 600, pay: 0,  name: "既読スルー耐性",         note: "いつの間にか実装済み" },
    { r: "N", w: 550, pay: -1, name: "月曜日",                 note: "毎週排出されます" },
    { r: "N", w: 500, pay: -1, name: "謎の肩こり",             note: "原因: 人生" },
    { r: "N", w: 450, pay: -2, name: "花粉症デビュー",         note: "恒久コンテンツ" },
    { r: "N", w: 400, pay: -2, name: "サブスクの解約忘れ",     note: "毎月の supporter" },
    { r: "N", w: 350, pay: -3, name: "電車の遅延(重要な日)",   note: "ピンポイント運用" },
    { r: "N", w: 330, pay: -3, name: "会議のための会議",       note: "無限に増殖します" },
    { r: "N", w: 300, pay: -4, name: "上司ガチャ大失敗",       note: "リセマラ不可" },
    { r: "N", w: 250, pay: -5, name: "健康診断の再検査",       note: "現実からの通知" },
    { r: "N", w: 250, pay: -5, name: "同窓会の招待状",         note: "比較データ一括受信" },
  ];
  const TOTAL_W = POOL.reduce((s, c) => s + c.w, 0);
  const draw = () => {
    let t = Math.random() * TOTAL_W;
    for (const c of POOL) { t -= c.w; if (t < 0) return c; }
    return POOL[POOL.length - 1];
  };

  const $ = (s) => document.querySelector(s);
  const grid = $("#gacha-grid"), msg = $("#gacha-msg");
  const b1 = $("#btn-gacha1"), b10 = $("#btn-gacha10"), bRates = $("#btn-rates");
  const center = $("#gacha-center"), ratesModal = $("#rates-modal");
  if (!grid) return;
  const say = (h) => { msg.innerHTML = h; };

  /* ---------- rates modal (generated from POOL: no lies, unlike everyone) */
  function buildRates() {
    const body = ratesModal.querySelector(".modal-body");
    let html = "";
    let byR = {};
    POOL.forEach(c => { (byR[c.r] = byR[c.r] || []).push(c); });
    ["LR", "UR", "SSR", "SR", "R", "N"].forEach(r => {
      const items = byR[r] || [];
      const sum = items.reduce((s, c) => s + c.w, 0);
      html += '<p class="rate-head r-' + r + '">' + r + " — " + (sum / TOTAL_W * 100).toFixed(2) + "%</p><table>";
      items.forEach(c => {
        html += "<tr><td>" + c.name + "</td><td>" + (c.pay >= 0 ? "+" : "") + c.pay +
          "</td><td>" + (c.w / TOTAL_W * 100).toFixed(2) + "%</td></tr>";
      });
      html += "</table>";
    });
    body.innerHTML = html;
  }
  bRates.addEventListener("click", () => { buildRates(); ratesModal.classList.add("open"); sfx.flip(); });
  ratesModal.addEventListener("click", (e) => {
    if (e.target === ratesModal || e.target.classList.contains("modal-close"))
      ratesModal.classList.remove("open");
  });

  function renderBtns() {
    if (W.broke()) {
      b1.textContent = "借金する +20"; b1.classList.add("debt"); b10.disabled = true;
    } else {
      b1.textContent = "1回 // 3消費"; b1.classList.remove("debt"); b10.disabled = false;
    }
  }
  document.addEventListener("walletchange", renderBtns);

  function cardHTML(c) {
    return '<span class="gr">' + c.r + '</span><span class="gn">' + c.name +
      '</span><span class="gp">' + (c.pay >= 0 ? "+" : "") + c.pay +
      '</span><span class="gnote">' + c.note + "</span>";
  }
  function cardEl(c) {
    const d = document.createElement("div");
    d.className = "gcard r-" + c.r;
    d.innerHTML = cardHTML(c);
    return d;
  }

  /* ---------- single pull: center-screen reveal w/ suspense ---------- */
  function centerReveal(c, done) {
    const box = center.querySelector(".gacha-center-card");
    const rank = RANK[c.r];
    center.classList.add("open");
    box.className = "gacha-center-card back";
    box.innerHTML = '<span class="gq">?</span>';
    const suspense = rank >= 2 ? (rank >= 4 ? 2000 : 1200) : 500;
    if (rank >= 2) {
      center.classList.add("suspense");
      let n = 0;
      const iv = setInterval(() => {
        window.Casino.beep(70 + n * 12, .12, .07, 0, "sine"); n++;
      }, 300);
      setTimeout(() => clearInterval(iv), suspense);
    }
    setTimeout(() => {
      center.classList.remove("suspense");
      box.className = "gacha-center-card gcard r-" + c.r;
      box.innerHTML = cardHTML(c);
      if (rank >= 4) {           // UR/LR: full ceremony
        fx.win(3, c.r, c.pay);
      } else if (rank === 3) {   // SSR
        fx.win(2, "SSR", c.pay);
      } else if (rank === 2) {
        fx.flash(false); sfx.coin();
      } else {
        sfx.flip();
      }
      setTimeout(() => {
        center.classList.remove("open");
        if (done) done();
      }, rank >= 3 ? 2400 : 1500);
    }, suspense);
  }
  center.addEventListener("click", () => center.classList.remove("open"));

  let busy = false;
  function settle(results) {
    const total = results.reduce((s, c) => s + c.pay, 0);
    const best = results.reduce((a, c) => RANK[c.r] > RANK[a.r] ? c : a, results[0]);
    W.earn(total);
    const line = total > 0
      ? "収支 <b>+" + total + "</b>。おめでとうございます。なお現実の残高は変動していません。"
      : total === 0
      ? "収支 <b>±0</b>。時間だけが確実に減りました。"
      : "収支 <b>" + total + "</b>。引くほど減る。人生ガチャの仕様です。";
    say("結果: <b class='r-" + best.r + "'>" + best.r + "「" + best.name + "」</b> — " + line);
    busy = false; b1.disabled = false; b10.disabled = false; renderBtns();
  }

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

    if (n === 1) {
      say("召喚中。結果は演出より先に、もう決まっています。");
      const c = draw();
      centerReveal(c, () => { grid.appendChild(cardEl(c)); settle([c]); });
      return;
    }

    say("10連召喚中。天井はありません。あなたの生活には床もありません。");
    const results = Array.from({ length: n }, draw);
    if (results.every(c => RANK[c.r] === 0)) results[9] = POOL[17]; // "R以上1枚保証"
    results.forEach((c, i) => {
      setTimeout(() => {
        grid.appendChild(cardEl(c));
        sfx.flip();
        if (RANK[c.r] >= 3) { fx.flash(false); window.Casino.beep(1100, .1, .05); }
        if (RANK[c.r] >= 4) fx.shake(true);
      }, 260 * i + 200);
    });
    setTimeout(() => {
      const best = results.reduce((a, c) => RANK[c.r] > RANK[a.r] ? c : a, results[0]);
      if (RANK[best.r] >= 3) fx.win(RANK[best.r] >= 4 ? 3 : 2, best.r, best.pay);
      settle(results);
    }, 260 * n + 700);
  }

  b1.addEventListener("click", () => pull(1));
  b10.addEventListener("click", () => pull(10));
  renderBtns();
})();
