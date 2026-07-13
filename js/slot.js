/* 0rnot // slot.js — SISYPHUS-77 資本主義体験装置 (uses Casino core) */
(() => {
  "use strict";
  const { W, sfx, fx } = window.Casino;

  const SYMBOLS = [
    { ch: "円", tag: "YEN",  w: 20 },
    { ch: "税", tag: "TAX",  w: 22 },
    { ch: "労", tag: "WORK", w: 22 },
    { ch: "夢", tag: "DREAM",w: 16 },
    { ch: "骨", tag: "BONE", w: 14 },
    { ch: "7",  tag: "LUCK", w: 6  },
  ];

  const TRIPLE = {
    "円": { pay: +30, tier: 2, label: "PAYOUT", msg: "<b>大当たり +30。</b>手数料、源泉徴収、復興特別税を引くと気持ちは +3。" },
    "税": { pay: -10, tier: 0, label: "",       msg: "<b>税務調査、御一行様。</b>揃ったのはあなたの負担だけ。-10。" },
    "労": { pay: +5,  tier: 1, label: "",       msg: "<b>労・労・労。+5。</b>報酬は雀の涙、やりがいは無限大（換金不可）。" },
    "夢": { pay: 0,   tier: 0, label: "",       msg: "<b>夢が3つ揃いました。</b>配当: 0。夢では家賃が払えないので。" },
    "骨": { pay: -5,  tier: 0, label: "",       msg: "<b>過労により骨。</b>-5。安心してください、天国にもKPIはあります。" },
    "7":  { pay: +77, tier: 3, label: "JACKPOT", msg: "<b>ジャックポット +77。</b>人生で唯一何かが揃った瞬間です。額に飾りましょう。" },
  };

  const NEAR_MISS = [
    "惜しい。「惜しい」で終わる人生の予行演習でした。",
    "あと1つ。昇進も、当選も、だいたいあと1つ。",
    "2つ揃いました。履歴書の「もう少しで内定」欄にどうぞ。",
    "2つまでは揃う。あなたの計画もいつも8割で止まりますね。",
    "ニアミス。脳が一番痺れるように設計されています。効いてますか？",
  ];
  const LOSE = [
    "何も揃いません。あなたのスケジュール帳と同じですね。",
    "ハズレ。ですが「経験」という名の無配当をお持ち帰りください。",
    "揃いませんでした。運営は儲かっています。ご協力に感謝。",
    "結果はランダムです。努力は関係ありません。社会と同じ仕様です。",
    "ハズレ。なお当機のRTPは人生のそれよりは高めに設定されています。",
    "ハズレ。乱数はあなたを個人的に嫌っているわけではありません。多分。",
    "揃いません。会議と同じで、回っただけです。",
    "ハズレ。今の1回分はあなたの退職金の先払いでした。",
    "何も起きませんでした。平日と同じですね。",
    "ハズレ。ですが胴元側の手数料はしっかり発生しています。",
    "残念。「次こそは」——それ、先月も言っていました。",
    "揃いませんでした。配られた札で戦ってください。遺伝子と同じです。",
    "ハズレ。運営から励ましのメッセージ: 特にありません。",
    "外れました。なお本結果はお客様の自己責任です（利用規約 第7条）。",
    "ハズレ。徳が足りません。前世からやり直してください。",
    "揃わない。だが安心してほしい、揃っても大して変わらない。",
    "ハズレ。この0.1秒で胴元の子供の学費が少し貯まりました。",
    "何も揃いません。あなたの老後の資金計画と同程度の精度です。",
    "ハズレ。「引き際」という言葉を辞書で引いてみましょう。今です。",
    "外れ。神は死んだ。RNGは元気です。",
    "ハズレ。涙は出ますか？ 出ない？ もう慣れましたか。そうですか。",
    "揃いませんでした。SNSで「勝った」と書く自由は残っています。",
  ];
  const REACH = [
    "リーチ。心拍数だけが配当です。",
    "リーチ。ここで外すのがあなたの人生です。",
    "リーチ。期待という名の税金を徴収中……",
    "リーチ。脳内物質は当社の利益となります。",
  ];
  const BROKE = "<b>信用残高: 0。</b>現実社会へようこそ。ボタンで借金ができます（利息はしっかり取ります）。";

  const BAG = [];
  SYMBOLS.forEach((s, i) => { for (let k = 0; k < s.w; k++) BAG.push(i); });
  const draw = () => BAG[Math.random() * BAG.length | 0];

  const $ = (s) => document.querySelector(s);
  const msg = $("#slot-msg");
  const btn = $("#btn-spin");
  const reels = Array.from(document.querySelectorAll("#g-slot .reel"));
  if (!btn || reels.length !== 3) return;

  const SYM_H = () => reels[0].querySelector(".sym").offsetHeight || 148;

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

  function renderBtn() {
    if (W.broke()) { btn.textContent = "借金する +20"; btn.classList.add("debt"); }
    else { btn.textContent = "SPIN // 1消費"; btn.classList.remove("debt"); }
  }
  document.addEventListener("walletchange", renderBtn);
  const say = (html) => { msg.innerHTML = html; };

  let busy = false;
  function spin() {
    if (busy) return;

    if (W.broke()) {
      const debt = W.borrow();
      say("<b>+20 融資しました。</b>ご返済は不要です。代わりに尊厳をいただきました。" +
          " 累計負債: <b>¥" + (debt * 10000).toLocaleString() + "</b>（利率18%・複利・良心なし）");
      sfx.borrow();
      return;
    }
    if (!W.pay(1)) return;

    busy = true;
    btn.disabled = true;
    say("回転中。祈りは受け付けていますが、反映はされません。");

    const finals = [draw(), draw(), draw()];
    const reach = finals[0] === finals[1]; // reach: extend 3rd reel, add tension
    const h = SYM_H();
    const durs = [0.9, 1.35, reach ? 3.4 : 1.8];

    reels.forEach((reel, i) => {
      const strip = reel.querySelector(".strip");
      const len = 18 + i * 6 + (reach && i === 2 ? 10 : 0);
      strip.innerHTML = "";
      strip.appendChild(buildStrip(finals[i], len));
      strip.style.transition = "none";
      strip.style.transform = "translateY(0)";
      reel.classList.add("spinning");
      reel.classList.remove("hit", "reach");
      void strip.offsetHeight;
      const dur = durs[i];
      strip.style.transition = "transform " + dur + "s cubic-bezier(.15,.85,.25,1.02)";
      strip.style.transform = "translateY(-" + ((len - 1) * h) + "px)";
      const ticks = Math.floor(dur * 8);
      for (let k = 0; k < ticks; k++)
        window.Casino.beep(140 + Math.random() * 60, .03, .02, (dur / ticks) * k);
      setTimeout(() => { reel.classList.remove("spinning"); sfx.stop(i); }, dur * 1000);
    });

    if (reach) {
      setTimeout(() => {
        reels[2].classList.add("reach");
        say('<span class="reach-txt">' + REACH[Math.random() * REACH.length | 0] + "</span>");
        sfx.heart(0); sfx.heart(.7); sfx.heart(1.4);
      }, durs[1] * 1000 + 60);
    }

    setTimeout(() => {
      reels[2].classList.remove("reach");
      const [a, b, c] = finals;

      if (a === b && b === c) {
        const r = TRIPLE[SYMBOLS[a].ch];
        W.earn(r.pay);
        reels.forEach(x => x.classList.add("hit"));
        if (r.tier >= 1) {
          fx.win(r.tier, r.label || "PAYOUT", r.pay);
          say(r.msg + ' <b class="payup" id="payup"></b>');
          const pu = document.getElementById("payup");
          if (pu) fx.countUp(pu, r.pay, r.tier >= 3 ? 1600 : 900);
        } else {
          say(r.msg); sfx.bad(); fx.shake(false);
        }
      } else if (a === b || b === c || a === c) {
        say(NEAR_MISS[Math.random() * NEAR_MISS.length | 0]);
        sfx.near();
      } else {
        say(LOSE[Math.random() * LOSE.length | 0]);
        sfx.lose();
      }

      if (W.broke()) setTimeout(() => say(BROKE), 1800);
      busy = false;
      btn.disabled = false;
      renderBtn();
    }, durs[2] * 1000 + 140);
  }

  btn.addEventListener("click", spin);
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && document.querySelector("#panel-game.active") &&
        document.querySelector("#g-slot.active")) {
      e.preventDefault(); spin();
    }
  });

  reels.forEach(reel => {
    reel.querySelector(".strip").appendChild(buildStrip(draw(), 1));
  });
  renderBtn();
})();
