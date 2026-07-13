/* 0rnot // slot.js — SISYPHUS-77 資本主義体験装置 */
(() => {
  "use strict";

  const SYMBOLS = [
    { ch: "円", tag: "YEN",  w: 20 },
    { ch: "税", tag: "TAX",  w: 22 },
    { ch: "労", tag: "WORK", w: 22 },
    { ch: "夢", tag: "DREAM",w: 16 },
    { ch: "骨", tag: "BONE", w: 14 },
    { ch: "7",  tag: "LUCK", w: 6  },
  ];

  const TRIPLE = {
    "円": { pay: +30, msg: "<b>大当たり +30。</b>手数料、源泉徴収、復興特別税を引くと気持ちは +3。" },
    "税": { pay: -10, msg: "<b>税務調査、御一行様。</b>揃ったのはあなたの負担だけ。-10。" },
    "労": { pay: +5,  msg: "<b>労・労・労。+5。</b>報酬は雀の涙、やりがいは無限大（換金不可）。" },
    "夢": { pay: 0,   msg: "<b>夢が3つ揃いました。</b>配当: 0。夢では家賃が払えないので。" },
    "骨": { pay: -5,  msg: "<b>過労により骨。</b>-5。安心してください、天国にもKPIはあります。" },
    "7":  { pay: +77, msg: "<b>ジャックポット +77。</b>人生で唯一何かが揃った瞬間です。額に飾りましょう。" },
  };

  const NEAR_MISS = [
    "惜しい。「惜しい」で終わる人生の予行演習でした。",
    "あと1つ。昇進も、当選も、だいたいあと1つ。",
    "2つ揃いました。履歴書の「もう少しで内定」欄にどうぞ。",
  ];
  const LOSE = [
    "何も揃いません。あなたのスケジュール帳と同じですね。",
    "ハズレ。ですが「経験」という名の無配当をお持ち帰りください。",
    "揃いませんでした。運営は儲かっています。ご協力に感謝。",
    "結果はランダムです。努力は関係ありません。社会と同じ仕様です。",
    "ハズレ。なお当機のRTPは人生のそれよりは高めに設定されています。",
  ];
  const BROKE = "<b>信用残高: 0。</b>現実社会へようこそ。下のボタンで借金ができます（利息はしっかり取ります）。";
  const DEBT_MSG = "<b>+20 融資しました。</b>ご返済は不要です。代わりに尊厳をいただきました。";

  /* weighted bag */
  const BAG = [];
  SYMBOLS.forEach((s, i) => { for (let k = 0; k < s.w; k++) BAG.push(i); });
  const draw = () => BAG[Math.random() * BAG.length | 0];

  /* ---------- state ---------- */
  const LS = "slot77";
  let st = { credit: 20, spins: 0, debt: 0 };
  try { st = Object.assign(st, JSON.parse(localStorage.getItem(LS) || "{}")); } catch (e) {}
  const save = () => { try { localStorage.setItem(LS, JSON.stringify(st)); } catch (e) {} };

  /* ---------- dom ---------- */
  const $ = (s) => document.querySelector(s);
  const elCredit = $("#m-credit"), elSpins = $("#m-spins"), elDebt = $("#m-debt");
  const msg = $("#slot-msg");
  const btn = $("#btn-spin");
  const mute = $("#btn-mute");
  const reels = Array.from(document.querySelectorAll(".reel"));
  if (!btn || reels.length !== 3) return;

  const SYM_H = () => reels[0].querySelector(".sym").offsetHeight;

  /* build strips: [pad symbols ... final] final lands on payline */
  function buildStrip(finalIdx, len) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < len; i++) {
      const idx = (i === len - 1) ? finalIdx : draw();
      const d = document.createElement("div");
      d.className = "sym";
      d.innerHTML = SYMBOLS[idx].ch + "<small>" + SYMBOLS[idx].tag + "</small>";
      frag.appendChild(d);
    }
    return frag;
  }

  function render() {
    elCredit.textContent = st.credit;
    elCredit.classList.toggle("neg", st.credit <= 0);
    elSpins.textContent = st.spins;
    elDebt.textContent = st.debt > 0 ? "¥" + (st.debt * 10000).toLocaleString() : "—";
    if (st.credit <= 0) {
      btn.textContent = "借金する +20";
      btn.classList.add("debt");
    } else {
      btn.textContent = "SPIN // 1消費";
      btn.classList.remove("debt");
    }
  }

  function say(html) { msg.innerHTML = html; }

  /* ---------- audio (WebAudio, square waves, no assets) ---------- */
  let ac = null, muted = localStorage.getItem(LS + ":mute") === "1";
  function beep(freq, dur, vol, when) {
    if (muted) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const t = ac.currentTime + (when || 0);
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = "square"; o.frequency.value = freq;
      g.gain.setValueAtTime(vol || .03, t);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g).connect(ac.destination);
      o.start(t); o.stop(t + dur);
    } catch (e) {}
  }
  function renderMute() { mute.textContent = muted ? "MUTE" : "SND"; }
  mute.addEventListener("click", () => {
    muted = !muted;
    localStorage.setItem(LS + ":mute", muted ? "1" : "0");
    renderMute();
    if (!muted) beep(880, .06, .04);
  });
  renderMute();

  /* ---------- spin ---------- */
  let busy = false;
  function spin() {
    if (busy) return;

    if (st.credit <= 0) { /* debt mode */
      st.credit += 20; st.debt += 1;
      say(DEBT_MSG + " 累計負債: <b>¥" + (st.debt * 10000).toLocaleString() + "</b>（利率18%・複利・良心なし）");
      beep(220, .15, .05); beep(180, .2, .05, .12);
      render(); save();
      return;
    }

    busy = true;
    btn.disabled = true;
    st.credit -= 1; st.spins += 1;
    render();
    say("回転中。祈りは受け付けていますが、反映はされません。");

    const finals = [draw(), draw(), draw()];
    const h = SYM_H();

    reels.forEach((reel, i) => {
      const strip = reel.querySelector(".strip");
      const len = 18 + i * 6; // stagger travel
      strip.innerHTML = "";
      strip.appendChild(buildStrip(finals[i], len));
      strip.style.transition = "none";
      strip.style.transform = "translateY(0)";
      reel.classList.add("spinning");
      reel.classList.remove("hit");
      // force reflow, then animate to land last sym on window
      void strip.offsetHeight;
      const dur = 0.9 + i * 0.45;
      strip.style.transition = "transform " + dur + "s cubic-bezier(.15,.85,.25,1.02)";
      strip.style.transform = "translateY(-" + ((len - 1) * h) + "px)";
      // reel ticks
      const ticks = 6 + i * 3;
      for (let k = 0; k < ticks; k++) beep(140 + Math.random() * 60, .03, .02, (dur / ticks) * k);
      setTimeout(() => {
        reel.classList.remove("spinning");
        beep(520 - i * 60, .07, .04);
      }, dur * 1000);
    });

    setTimeout(() => {
      const [a, b, c] = finals;
      const chA = SYMBOLS[a].ch, chB = SYMBOLS[b].ch, chC = SYMBOLS[c].ch;

      if (a === b && b === c) {
        const r = TRIPLE[chA];
        st.credit = Math.max(0, st.credit + r.pay);
        reels.forEach(x => x.classList.add("hit"));
        say(r.msg);
        if (r.pay > 0) [660, 880, 1100, 1320].forEach((f, i) => beep(f, .12, .05, i * .1));
        else [200, 150, 100].forEach((f, i) => beep(f, .2, .05, i * .15));
      } else if (a === b || b === c || a === c) {
        say(NEAR_MISS[Math.random() * NEAR_MISS.length | 0]);
        beep(300, .1, .03); beep(240, .15, .03, .1);
      } else {
        say(LOSE[Math.random() * LOSE.length | 0]);
        beep(160, .18, .03);
      }

      if (st.credit <= 0) setTimeout(() => say(BROKE), 1600);

      render(); save();
      busy = false;
      btn.disabled = false;
    }, (0.9 + 2 * 0.45) * 1000 + 120);
  }

  btn.addEventListener("click", spin);
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && document.querySelector("#panel-game.active")) {
      e.preventDefault(); spin();
    }
  });

  /* init reels with random symbols */
  reels.forEach(reel => {
    const strip = reel.querySelector(".strip");
    strip.appendChild(buildStrip(draw(), 1));
  });
  render();
})();
