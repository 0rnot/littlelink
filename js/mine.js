/* 0rnot // mine.js — MINE-25 地雷物件ツアー (mines gamble) */
(() => {
  "use strict";
  const { W, sfx, fx } = window.Casino;
  const $ = (s) => document.querySelector(s);
  const grid = $("#mine-grid"), msg = $("#mine-msg");
  const potEl = $("#mine-pot"), mulEl = $("#mine-mul"), safeEl = $("#mine-safe");
  const bStart = $("#btn-mine-start"), bOut = $("#btn-mine-out");
  if (!grid) return;

  const SIZE = 25, MINES = 5, COST = 3;

  const SAFE_LINES = [
    "床、無事。今のところ。",
    "前の住人は「普通に」退去したそうです。多分。",
    "日当たり良好。墓地ビューですが。",
    "水回りOK。水道が通っていれば、の話ですが。",
    "壁が薄い？ 隣人の生活音はBGMだと思えば無料です。",
    "駅徒歩5分（全力疾走・信号無視時）。",
    "リフォーム済み。何をリフォームしたかは告知対象外。",
    "静かな物件です。静かすぎるのが気になりますが。",
    "オートロック完備。開いたままですが完備は完備。",
    "礼金ゼロ。礼を言う相手がいないので。",
  ];
  const MINE_LINES = [
    "<b>事故物件でした。</b>おめでとうございます、あなたが2件目の事故です。",
    "<b>地雷を踏みました。</b>敷金は返りません。永遠に。",
    "<b>大家の証言:</b>「言うほどの事故でもないと思ってた」— 没収。",
    "<b>告知義務</b>は前の契約者までで消化済みでした。法律って面白いですね。没収。",
    "<b>爆発。</b>不動産屋は今、次のお客様に同じ部屋を案内しています。",
  ];
  const OUT_LINES = [
    "撤退。良い物件は逃げますが、命は逃げません。",
    "利確。不動産で勝つ唯一の方法は、深入りしないことです。",
    "契約書にサインする前に逃げる。今日一番の好判断です。",
  ];

  let mines = new Set(), opened = new Set(), active = false;

  const mult = (k) => {
    let m = 0.97;
    for (let i = 0; i < k; i++) m *= (SIZE - i) / (SIZE - MINES - i);
    return m;
  };
  const pot = () => Math.max(COST, Math.floor(COST * mult(opened.size)));

  function render() {
    const p = active ? pot() : 0;
    potEl.textContent = active ? p : "—";
    mulEl.textContent = active ? "×" + mult(opened.size).toFixed(2) : "×1.00";
    safeEl.textContent = active ? (SIZE - MINES - opened.size) : "—";
    bOut.disabled = !active || opened.size === 0;
    bStart.textContent = active ? "内見中…" : "内見開始 // " + COST + "消費";
    bStart.disabled = active;
  }
  document.addEventListener("walletchange", render);
  const say = (h) => { msg.innerHTML = h; };

  function buildGrid(disabled) {
    grid.innerHTML = "";
    for (let i = 0; i < SIZE; i++) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "mcell";
      b.disabled = disabled;
      b.textContent = "?";
      b.addEventListener("click", () => open(i, b));
      grid.appendChild(b);
    }
  }

  function revealAll() {
    Array.from(grid.children).forEach((b, i) => {
      b.disabled = true;
      if (mines.has(i)) { b.textContent = "†"; b.classList.add("boom"); }
      else if (!opened.has(i)) { b.textContent = "·"; b.classList.add("dud"); }
    });
  }

  function start() {
    if (active) return;
    if (W.broke()) {
      say("<b>信用ゼロ。</b>内見すら審査落ち。上の【<b>借金する</b>】が点滅しています。押せば+20。押した瞬間から利息が育ちます。");
      sfx.lose(); render(); return;
    }
    if (!W.pay(COST)) { say("信用不足。入居審査どころか内見審査で落ちました。"); sfx.lose(); return; }
    mines = new Set(); opened = new Set();
    while (mines.size < MINES) mines.add(Math.random() * SIZE | 0);
    active = true;
    buildGrid(false);
    say("内見開始。25部屋のうち<b>5部屋が事故物件</b>です。告知義務は今、果たしました。");
    sfx.flip(); render();
  }

  function open(i, b) {
    if (!active || opened.has(i)) return;
    if (mines.has(i)) {
      active = false;
      b.textContent = "†"; b.classList.add("boom", "hit");
      revealAll();
      say(MINE_LINES[Math.random() * MINE_LINES.length | 0] + "（-" + pot() + "相当）");
      sfx.bad(); fx.shake(true); fx.flash(false);
      render();
      return;
    }
    opened.add(i);
    b.textContent = "✓"; b.classList.add("safe"); b.disabled = true;
    window.Casino.beep(600 + opened.size * 40, .05, .035);
    say(SAFE_LINES[Math.random() * SAFE_LINES.length | 0] +
      " 現在 <b>" + pot() + "</b>（×" + mult(opened.size).toFixed(2) + "）");
    if (opened.size === SIZE - MINES) { // full clear
      const p = pot();
      active = false;
      W.earn(p);
      revealAll();
      fx.win(3, "完全内見", p);
      say("<b>全室踏破 +" + p + "。</b>事故物件を全て避けた男/女。不動産屋より詳しくなりましたね。");
    }
    render();
  }

  function cashout() {
    if (!active || opened.size === 0) return;
    const p = pot();
    active = false;
    W.earn(p);
    revealAll();
    fx.win(p >= 100 ? 3 : p >= 25 ? 2 : 1, "CASH OUT", p);
    say(OUT_LINES[Math.random() * OUT_LINES.length | 0] + " <b>+" + p + "</b> 回収。");
    render();
  }

  bStart.addEventListener("click", start);
  bOut.addEventListener("click", cashout);
  buildGrid(true);
  render();
})();
