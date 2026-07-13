/* 0rnot // pachi.js — DIGNITY-0 尊厳交換機 (canvas pachinko) */
(() => {
  "use strict";
  const { W, sfx, fx } = window.Casino;

  const $ = (s) => document.querySelector(s);
  const canvas = $("#pachi-canvas");
  const btn = $("#btn-pachi");
  const msg = $("#pachi-msg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  /* logical size; canvas scales to css width */
  const LW = 320, LH = 430;
  const POCKETS = [
    { pay: 0,  label: "没収" },
    { pay: 2,  label: "+2" },
    { pay: 0,  label: "没収" },
    { pay: 15, label: "+15" },
    { pay: 0,  label: "没収" },
    { pay: 2,  label: "+2" },
    { pay: 0,  label: "没収" },
  ];
  const ZERO_LINES = [
    "没収。玉は消え、台は残り、あなたは戻ってくる。",
    "没収。ホールの照明代になりました。眩しいでしょう？",
    "没収。「次の一玉は違う」— 大丈夫、同じです。",
    "没収。重力は平等です。財布には不平等ですが。",
    "没収。この台、あなたの尊厳で動いています。",
  ];
  const SMALL_LINES = [
    "+2。時給に換算しないでください。泣きますよ。",
    "+2。脳が「勝ち」と誤認しました。設計通りです。",
    "+2。取り返した気になる、それが一番高くつく。",
  ];
  const BIG_LINES = [
    "<b>中央入賞 +15。</b>今日の武勇伝が確定しました。明日には負けています。",
    "<b>+15。</b>この快感の再現に、あと数万円かかります。",
  ];

  /* pegs: offset grid */
  const pegs = [];
  const rows = 8, r0 = 70;
  for (let r = 0; r < rows; r++) {
    const n = r % 2 === 0 ? 7 : 6;
    for (let c = 0; c < n; c++) {
      const gap = LW / 7;
      pegs.push({ x: gap * (c + (r % 2 === 0 ? 0.5 : 1)), y: r0 + r * 36, r: 3.5 });
    }
  }
  const PR = 5;        // ball radius
  const G = 0.16, DAMP = 0.62;
  let balls = [], raf = null, dpr = 1;

  function resize() {
    const w = Math.min(canvas.parentElement.clientWidth || 320, 380) || 320;
    dpr = devicePixelRatio || 1;
    canvas.style.width = w + "px";
    canvas.style.height = (w * LH / LW) + "px";
    canvas.width = LW * dpr;
    canvas.height = LH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener("resize", () => { resize(); drawBoard(); });
  document.addEventListener("gamechange", (e) => {
    if (e.detail === "pachi") { resize(); drawBoard(); }
  });
  resize();

  function drawBoard() {
    ctx.clearRect(0, 0, LW, LH);
    /* pegs */
    for (const p of pegs) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 7);
      ctx.fillStyle = "#3a3a3a";
      ctx.fill();
      ctx.strokeStyle = "#666"; ctx.lineWidth = 1; ctx.stroke();
    }
    /* pockets */
    const pw = LW / POCKETS.length;
    for (let i = 0; i < POCKETS.length; i++) {
      const x = i * pw;
      ctx.strokeStyle = "#444";
      ctx.strokeRect(x + 1, LH - 34, pw - 2, 33);
      ctx.fillStyle = POCKETS[i].pay >= 15 ? "#fff" : POCKETS[i].pay > 0 ? "#aaa" : "#555";
      ctx.font = (POCKETS[i].pay >= 15 ? "bold 13px" : "11px") + " monospace";
      ctx.textAlign = "center";
      ctx.fillText(POCKETS[i].label, x + pw / 2, LH - 13);
    }
    /* walls */
    ctx.strokeStyle = "#333";
    ctx.strokeRect(0.5, 0.5, LW - 1, LH - 1);
    /* balls */
    for (const b of balls) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, PR, 0, 7);
      ctx.fillStyle = "#e6e6e6";
      ctx.fill();
      /* trail */
      ctx.beginPath();
      ctx.arc(b.px, b.py, PR * .6, 0, 7);
      ctx.fillStyle = "rgba(230,230,230,.25)";
      ctx.fill();
    }
  }

  function land(b) {
    const pw = LW / POCKETS.length;
    const idx = Math.max(0, Math.min(POCKETS.length - 1, b.x / pw | 0));
    const p = POCKETS[idx];
    if (p.pay > 0) W.earn(p.pay);
    if (p.pay >= 15) {
      fx.win(2, "中央入賞", p.pay);
      msg.innerHTML = BIG_LINES[Math.random() * BIG_LINES.length | 0];
    } else if (p.pay > 0) {
      sfx.coin();
      msg.innerHTML = SMALL_LINES[Math.random() * SMALL_LINES.length | 0];
    } else {
      sfx.lose();
      msg.innerHTML = ZERO_LINES[Math.random() * ZERO_LINES.length | 0];
    }
  }

  function step() {
    for (const b of balls) {
      b.px = b.x; b.py = b.y;
      b.vy += G;
      b.x += b.vx; b.y += b.vy;
      /* walls */
      if (b.x < PR) { b.x = PR; b.vx = Math.abs(b.vx) * DAMP; }
      if (b.x > LW - PR) { b.x = LW - PR; b.vx = -Math.abs(b.vx) * DAMP; }
      /* pegs */
      for (const p of pegs) {
        const dx = b.x - p.x, dy = b.y - p.y;
        const d2 = dx * dx + dy * dy, min = PR + p.r;
        if (d2 < min * min && d2 > 0.0001) {
          const d = Math.sqrt(d2);
          const nx = dx / d, ny = dy / d;
          b.x = p.x + nx * min; b.y = p.y + ny * min;
          const dot = b.vx * nx + b.vy * ny;
          b.vx = (b.vx - 2 * dot * nx) * DAMP + (Math.random() - .5) * .5;
          b.vy = (b.vy - 2 * dot * ny) * DAMP;
          if (Math.abs(dot) > 1.2) window.Casino.beep(2000 + Math.random() * 800, .015, .012);
        }
      }
      if (b.y > LH - 34 - PR) { b.dead = true; land(b); }
    }
    balls = balls.filter(b => !b.dead);
    drawBoard();
    if (balls.length) raf = requestAnimationFrame(step);
    else { raf = null; renderBtn(); }
  }

  function renderBtn() { btn.textContent = "打つ // 1消費"; }
  document.addEventListener("walletchange", renderBtn);

  function shoot() {
    if (W.broke()) {
      msg.innerHTML = "<b>信用ゼロ。</b>玉は信用でできています。上の【<b>借金する</b>】が点滅しています。押せば+20。押した瞬間から利息が育ちます。";
      sfx.lose(); return;
    }
    if (balls.length >= 6) return;
    if (!W.pay(1)) return;
    balls.push({
      x: 20 + Math.random() * (LW - 40),
      y: 12, px: 0, py: 0,
      vx: (Math.random() - .5) * 2.4,
      vy: 0.5 + Math.random(),
    });
    window.Casino.beep(1500, .05, .03);
    msg.textContent = "発射。あとは重力と資本の意思にお任せください。";
    if (!raf) raf = requestAnimationFrame(step);
  }

  btn.addEventListener("click", shoot);
  /* fire only on a real tap: "click" never fires when the gesture became a scroll */
  canvas.addEventListener("click", shoot);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && raf) { cancelAnimationFrame(raf); raf = null; }
    else if (!document.hidden && balls.length && !raf) raf = requestAnimationFrame(step);
  });
  drawBoard();
  renderBtn();
})();
