/* 0rnot // core.js — shared wallet, audio, win FX, game carousel */
(() => {
  "use strict";

  /* ================= WALLET (shared across all machines) ================ */
  const KEY = "casino77";
  let st = { credit: 20, attempts: 0, debt: 0, lost: 0, best: 20 };
  try {
    const cur = JSON.parse(localStorage.getItem(KEY) || "null");
    if (cur) st = Object.assign(st, cur);
    else {
      const old = JSON.parse(localStorage.getItem("slot77") || "null"); // migrate v1
      if (old) st = Object.assign(st, { credit: old.credit, attempts: old.spins, debt: old.debt });
    }
  } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };

  const $ = (s) => document.querySelector(s);
  const elC = $("#m-credit"), elA = $("#m-attempts"), elD = $("#m-debt");

  const debtMeter = elD ? elD.closest(".meter") : null;
  function render() {
    if (!elC) return;
    elC.textContent = st.credit;
    elC.classList.toggle("neg", st.credit <= 0);
    elA.textContent = st.attempts;
    if (debtMeter) {
      const broke = st.credit <= 0;
      debtMeter.classList.toggle("loan", broke);
      debtMeter.setAttribute("role", broke ? "button" : "");
      debtMeter.tabIndex = broke ? 0 : -1;
      debtMeter.querySelector(".k").textContent = broke ? "借金する" : "累計負債";
      elD.textContent = broke ? "+20"
        : (st.debt > 0 ? "¥" + (st.debt * 10000).toLocaleString() : "—");
    }
    document.dispatchEvent(new CustomEvent("walletchange"));
  }

  const Wallet = {
    get credit() { return st.credit; },
    get attempts() { return st.attempts; },
    get debt() { return st.debt; },
    get lost() { return st.lost; },
    /** try to pay cost; false if broke */
    pay(cost) {
      if (st.credit < cost) return false;
      st.credit -= cost; st.attempts += 1; st.lost += cost;
      render(); save(); return true;
    },
    earn(n) {
      st.credit = Math.max(0, st.credit + n);
      if (n > 0) st.lost = Math.max(0, st.lost - n);
      if (st.credit > st.best) st.best = st.credit;
      render(); save();
    },
    borrow() {
      st.credit += 20; st.debt += 1;
      render(); save();
      return st.debt;
    },
    broke() { return st.credit <= 0; },
  };

  /* ================= AUDIO ================ */
  let ac = null, muted = localStorage.getItem(KEY + ":mute") === "1";
  function beep(freq, dur, vol, when, type) {
    if (muted) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const t = ac.currentTime + (when || 0);
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type || "square"; o.frequency.value = freq;
      g.gain.setValueAtTime(vol || .03, t);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g).connect(ac.destination);
      o.start(t); o.stop(t + dur);
    } catch (e) {}
  }
  const sfx = {
    tick: () => beep(140 + Math.random() * 60, .03, .02),
    stop: (i) => beep(520 - i * 60, .07, .04),
    lose: () => beep(160, .18, .03),
    near: () => { beep(300, .1, .03); beep(240, .15, .03, .1); },
    bad:  () => [200, 150, 100].forEach((f, i) => beep(f, .2, .05, i * .15)),
    coin: () => { beep(990, .08, .04); beep(1320, .12, .04, .06); },
    win:  () => [660, 880, 1100, 1320].forEach((f, i) => beep(f, .12, .05, i * .1)),
    jackpot: () => {
      [523, 659, 784, 1046, 1318, 1568, 2093].forEach((f, i) => beep(f, .16, .05, i * .09));
      [523, 659, 784, 1046].forEach((f, i) => beep(f / 2, .3, .03, .7 + i * .1, "sawtooth"));
    },
    heart: (when) => { beep(60, .12, .09, when, "sine"); beep(55, .16, .08, when + .18, "sine"); },
    borrow: () => { beep(220, .15, .05); beep(180, .2, .05, .12); },
    flip: () => beep(700 + Math.random() * 300, .04, .03),
  };
  const muteBtn = $("#btn-mute");
  function renderMute() { if (muteBtn) muteBtn.textContent = muted ? "MUTE" : "SND"; }
  if (muteBtn) muteBtn.addEventListener("click", () => {
    muted = !muted;
    localStorage.setItem(KEY + ":mute", muted ? "1" : "0");
    renderMute();
    if (!muted) beep(880, .06, .04);
  });
  renderMute();

  /* ================= WIN FX ================ */
  const layer = document.createElement("div");
  layer.id = "fx-layer"; layer.setAttribute("aria-hidden", "true");
  const flash = document.createElement("div"); flash.className = "fx-flash";
  const bigTxt = document.createElement("div"); bigTxt.className = "fx-bigtext";
  const pCanvas = document.createElement("canvas"); pCanvas.className = "fx-particles";
  layer.append(flash, pCanvas, bigTxt);
  document.body.appendChild(layer);
  const px = pCanvas.getContext("2d");
  let parts = [], pRaf = null;

  function sizeCanvas() {
    pCanvas.width = innerWidth * devicePixelRatio;
    pCanvas.height = innerHeight * devicePixelRatio;
  }
  sizeCanvas(); addEventListener("resize", sizeCanvas);

  function pLoop() {
    px.clearRect(0, 0, pCanvas.width, pCanvas.height);
    parts = parts.filter(p => p.life > 0);
    if (!parts.length) { pRaf = null; return; }
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life -= 1; p.rot += p.vr;
      px.save();
      px.translate(p.x, p.y); px.rotate(p.rot);
      px.globalAlpha = Math.max(0, Math.min(1, p.life / 40));
      px.fillStyle = p.bright ? "#fff" : "#999";
      px.font = p.size + "px monospace";
      px.fillText(p.ch, 0, 0);
      px.restore();
    }
    pRaf = requestAnimationFrame(pLoop);
  }
  function burst(n, chars, spread) {
    const dpr = devicePixelRatio;
    const cx = pCanvas.width / 2, cy = pCanvas.height / 2.4;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = (2 + Math.random() * (spread || 7)) * dpr;
      parts.push({
        x: cx, y: cy,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3 * dpr, g: .22 * dpr,
        ch: chars[Math.random() * chars.length | 0],
        size: (10 + Math.random() * 18) * dpr,
        rot: Math.random() * 6, vr: (Math.random() - .5) * .3,
        life: 50 + Math.random() * 40, bright: Math.random() < .5,
      });
    }
    if (!pRaf) pRaf = requestAnimationFrame(pLoop);
  }
  function doFlash(strong) {
    flash.classList.remove("go", "strong"); void flash.offsetWidth;
    flash.classList.add("go"); if (strong) flash.classList.add("strong");
  }
  function shake(strong) {
    document.body.classList.remove("shake", "shake-hard"); void document.body.offsetWidth;
    document.body.classList.add(strong ? "shake-hard" : "shake");
    setTimeout(() => document.body.classList.remove("shake", "shake-hard"), 600);
  }
  function bigText(html, ms) {
    bigTxt.innerHTML = html;
    bigTxt.classList.remove("go"); void bigTxt.offsetWidth;
    bigTxt.classList.add("go");
    setTimeout(() => bigTxt.classList.remove("go"), ms || 1400);
  }
  /** count up number inside el: "+N" with ticks */
  function countUp(el, to, dur, done) {
    const t0 = performance.now();
    let lastTick = 0;
    (function step(t) {
      const k = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      const val = Math.round(to * eased);
      el.textContent = (to >= 0 ? "+" : "") + val;
      if (t - lastTick > 50) { sfx.flip(); lastTick = t; }
      if (k < 1) requestAnimationFrame(step);
      else { el.textContent = (to >= 0 ? "+" : "") + to; if (done) done(); }
    })(performance.now());
  }
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  /** tier: 1 small / 2 big / 3 jackpot */
  function win(tier, label, amount) {
    if (reduced) { sfx.win(); return; }
    if (tier >= 3) {
      sfx.jackpot();
      doFlash(true); shake(true);
      document.documentElement.classList.add("invert");
      setTimeout(() => document.documentElement.classList.remove("invert"), 160);
      burst(140, "¥01※77＄骨夢", 10);
      setTimeout(() => burst(80, "¥¥¥777", 8), 350);
      bigText('<span class="jp glitch" data-text="' + label + '">' + label + "</span><b>+" + amount + "</b>", 2200);
    } else if (tier === 2) {
      sfx.win(); sfx.coin();
      doFlash(false); shake(false);
      burst(70, "¥01※", 8);
      bigText('<span class="glitch" data-text="' + label + '">' + label + "</span><b>+" + amount + "</b>", 1500);
    } else {
      sfx.coin();
      burst(24, "¥+", 5);
    }
  }

  /* ================= GAME CAROUSEL (arrow navigation) ================ */
  const GAMES = [
    { id: "slot",  name: "SISYPHUS-77",  sub: "資本主義体験装置" },
    { id: "gacha", name: "REROLL-∞",     sub: "人生ガチャ" },
    { id: "audit", name: "AUDIT-13",     sub: "人生査定" },
    { id: "pachi", name: "DIGNITY-0",    sub: "尊厳交換機" },
  ];
  let gi = 0;
  const gTitle = $("#g-title"), gIdx = $("#g-idx"), gSub = $("#g-sub");
  function showGame(i) {
    gi = (i + GAMES.length) % GAMES.length;
    const g = GAMES[gi];
    document.querySelectorAll(".game").forEach(el => {
      const on = el.id === "g-" + g.id;
      el.classList.toggle("active", on);
      el.style.display = on ? "block" : "none";  /* belt & suspenders vs stale CSS */
    });
    if (gTitle) gTitle.textContent = g.name;
    if (gSub) gSub.textContent = g.sub;
    if (gIdx) gIdx.textContent = (gi + 1) + "/" + GAMES.length;
    document.dispatchEvent(new CustomEvent("gamechange", { detail: g.id }));
  }
  const bPrev = $("#g-prev"), bNext = $("#g-next");
  if (bPrev) bPrev.addEventListener("click", () => { showGame(gi - 1); beep(400, .05, .03); });
  if (bNext) bNext.addEventListener("click", () => { showGame(gi + 1); beep(500, .05, .03); });
  document.addEventListener("keydown", (e) => {
    if (!document.querySelector("#panel-game.active")) return;
    if (e.target && /INPUT|TEXTAREA|BUTTON/.test(e.target.tagName) && e.target.tagName !== "BUTTON") return;
    if (e.code === "ArrowLeft")  { e.preventDefault(); showGame(gi - 1); beep(400, .05, .03); }
    if (e.code === "ArrowRight") { e.preventDefault(); showGame(gi + 1); beep(500, .05, .03); }
  });
  if (gTitle) showGame(0);

  /* borrowing lives on the debt meter — one loan shark for all machines */
  function takeLoan() {
    if (st.credit > 0) return;
    Wallet.borrow();
    sfx.borrow();
    if (window.showToast) window.showToast(
      "+20 融資完了 // 累計負債 ¥" + (st.debt * 10000).toLocaleString() + "（利率18%・複利・良心なし）");
  }
  if (debtMeter) {
    debtMeter.addEventListener("click", takeLoan);
    debtMeter.addEventListener("keydown", (e) => {
      if (e.code === "Enter" || e.code === "Space") { e.preventDefault(); takeLoan(); }
    });
  }

  window.Casino = { W: Wallet, beep, sfx, fx: { win, burst, shake, flash: doFlash, bigText, countUp } };
  render();
})();
