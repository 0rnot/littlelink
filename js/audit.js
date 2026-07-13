/* 0rnot // audit.js — AUDIT-13 人生査定ハイ&ロー */
(() => {
  "use strict";
  const { W, sfx, fx } = window.Casino;

  const $ = (s) => document.querySelector(s);
  const cardEl = $("#hl-card"), nextEl = $("#hl-next"), potEl = $("#hl-pot"), streakEl = $("#hl-streak");
  const msg = $("#hl-msg");
  const bHigh = $("#btn-high"), bLow = $("#btn-low"), bStart = $("#btn-hl-start"), bOut = $("#btn-hl-out");
  if (!cardEl) return;

  const SUITS = ["♠", "♣", "♤", "♧"];
  const FACE = { 1: "A", 11: "J", 12: "Q", 13: "K" };
  const label = (v) => FACE[v] || String(v);

  const WIN_LINES = [
    "査定通過。まぐれも実績です。書類上は。",
    "正解。この的中率が仕事で出ないのはなぜでしょうね。",
    "通過。調子に乗るのは自由です。結果に責任を持つのもあなたです。",
    "査定OK。上振れは実力、下振れは環境のせい。いい心がけです。",
  ];
  const LOSE_LINES = [
    "査定落ち。ポットは没収。査定員に感情はありません。",
    "不正解。挑戦した勇気は評価します。評価するだけです。",
    "落選。「continueしなければ勝てた」— 敗者の定型文をどうぞ。",
    "没収。欲張ったのではない、希望を持っただけ。同じことですが。",
  ];
  const OUT_LINES = [
    "撤退を確定。人生で一番難しい判断ができましたね。",
    "利確。この判断力、株では絶対に出ないやつです。",
    "撤退。勝ち逃げは嫌われます。主に胴元に。",
  ];

  let cur = 0, pot = 0, streak = 0, active = false, busy = false;

  function drawCard() { return 1 + Math.random() * 13 | 0; }
  function render() {
    potEl.textContent = pot;
    streakEl.textContent = streak;
    bHigh.disabled = bLow.disabled = !active || busy;
    bOut.disabled = !active || busy || pot === 0;
    bStart.textContent = active ? "査定中…" : "査定開始 // 2消費";
    bStart.disabled = active;
  }
  document.addEventListener("walletchange", render);
  const say = (h) => { msg.innerHTML = h; };

  function showCard(el, v, hidden) {
    el.innerHTML = hidden ? '<span class="hv">?</span>'
      : '<span class="hv">' + label(v) + '</span><span class="hs">' + SUITS[Math.random() * 4 | 0] + "</span>";
    el.classList.remove("flip"); void el.offsetWidth; el.classList.add("flip");
  }

  function start() {
    if (active || busy) return;
    if (W.broke()) {
      say("<b>信用ゼロ。</b>査定対象がありません。上の【<b>借金する</b>】が点滅しています。押せば+20。押した瞬間から利息が育ちます。");
      sfx.lose(); render(); return;
    }
    if (!W.pay(2)) { say("信用不足。査定のスタートラインにすら立てない。就活と同じですね。"); sfx.lose(); return; }
    cur = drawCard(); pot = 2; streak = 0; active = true;
    showCard(cardEl, cur, false); showCard(nextEl, 0, true);
    say("現在値: <b>" + label(cur) + "</b>。次は上か、下か。人生と違って二択です。");
    sfx.flip(); render();
  }

  function guess(dir) {
    if (!active || busy) return;
    busy = true; render();
    const nxt = drawCard();
    showCard(nextEl, nxt, false);
    sfx.flip();

    setTimeout(() => {
      if (nxt === cur) {
        say("同値。引き分け——つまり時間の無駄。もう一度どうぞ。");
        sfx.near();
      } else if ((dir === "high") === (nxt > cur)) {
        streak += 1;
        const gain = 2 + streak;
        pot += gain;
        say(WIN_LINES[Math.random() * WIN_LINES.length | 0] +
            " ポット <b>+" + gain + "</b>。続けるか、逃げるか。");
        if (streak >= 3) { fx.win(2, "STREAK×" + streak, pot); }
        else sfx.coin();
      } else {
        say(LOSE_LINES[Math.random() * LOSE_LINES.length | 0] + "（-" + pot + "）");
        sfx.bad(); fx.shake(false);
        pot = 0; streak = 0; active = false;
      }
      cur = nxt;
      showCard(cardEl, cur, false);
      if (active) showCard(nextEl, 0, true);
      busy = false; render();
    }, 420);
  }

  function cashout() {
    if (!active || pot === 0) return;
    W.earn(pot);
    const tier = pot >= 20 ? 2 : 1;
    fx.win(tier, "CASH OUT", pot);
    say(OUT_LINES[Math.random() * OUT_LINES.length | 0] + " <b>+" + pot + "</b> 回収。");
    pot = 0; streak = 0; active = false;
    showCard(nextEl, 0, true);
    render();
  }

  bStart.addEventListener("click", start);
  bHigh.addEventListener("click", () => guess("high"));
  bLow.addEventListener("click", () => guess("low"));
  bOut.addEventListener("click", cashout);
  showCard(cardEl, drawCard(), false); showCard(nextEl, 0, true);
  render();
})();
