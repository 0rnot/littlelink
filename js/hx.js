/* 0rnot // hx.js — RAT-RACE X 人生周回装置 (hack & slash) */
(() => {
  "use strict";
  const { W, sfx, fx } = window.Casino;
  const $ = (s) => document.querySelector(s);
  const root = $("#g-hx");
  if (!root) return;

  /* ================= EQUIPMENT DATA: 100 bases x 100 titles ============ */
  const SLOTS = [
    { id: "st", name: "地位" }, { id: "ed", name: "学歴" },
    { id: "cn", name: "人脈" }, { id: "as", name: "資産" },
  ];
  /* base power by rarity */
  const BPOW = { N: 2, R: 6, SR: 15, SSR: 40, UR: 100 };
  /* title multiplier by rarity */
  const TMUL = { N: 1, R: 1.4, SR: 2, SSR: 3, UR: 5, LR: 10 };
  const RCLS = { N: 0, R: 1, SR: 2, SSR: 3, UR: 4, LR: 5 };

  /* 25 bases per slot (N8/R7/SR5/SSR3/UR2) = 100 */
  const BASES = {
    st: [
      ["N","名ばかり役職"],["N","雑用係の証"],["N","シフトリーダーの腕章"],["N","仮採用の椅子"],
      ["N","窓際の席"],["N","肩書きシール"],["N","平社員バッジ"],["N","朝礼当番の札"],
      ["R","主任の名刺"],["R","係長の椅子"],["R","正社員の座"],["R","店長代理の札"],
      ["R","古参の発言権"],["R","委員長の経験"],["R","現場リーダー枠"],
      ["SR","課長の椅子"],["SR","プロジェクト全権"],["SR","現場の実権"],["SR","部長の椅子"],["SR","顧問の肩書き"],
      ["SSR","役員の椅子"],["SSR","天下りポスト"],["SSR","創業者の座"],
      ["UR","世襲の玉座"],["UR","上級国民パス"],
    ],
    ed: [
      ["N","卒業アルバム"],["N","ペン字検定3級"],["N","普通免許"],["N","英検の余韻"],
      ["N","出席日数"],["N","レポートコピペ術"],["N","単位ギリギリの成績表"],["N","部活の準優勝盾"],
      ["R","資格手当の紙切れ"],["R","TOEICの点数"],["R","専門学校の修了証"],["R","マイナー国家資格"],
      ["R","教授の推薦状"],["R","製本済みの卒論"],["R","学園祭実行委員の実績"],
      ["SR","有名大の卒業証書"],["SR","院卒の称号"],["SR","留学経験"],["SR","首席の記録"],["SR","難関資格"],
      ["SSR","博士号"],["SSR","司法試験合格"],["SSR","医師免許"],
      ["UR","幼稚舎エスカレーター"],["UR","名誉博士号"],
    ],
    cn: [
      ["N","元同僚のLINE"],["N","年賀状の束"],["N","飲み会の集合写真"],["N","フォロワー30人"],
      ["N","町内会での顔"],["N","同窓会の案内状"],["N","名刺の山"],["N","知人の知人"],
      ["R","頼れる先輩"],["R","元上司のコネ"],["R","取引先の窓口"],["R","大学のOB会"],
      ["R","行きつけの店の大将"],["R","地元の同級生網"],["R","SNSの相互"],
      ["SR","業界のキーマン"],["SR","役所に強い知人"],["SR","メディア関係者"],["SR","投資家の連絡先"],["SR","士業の親友"],
      ["SSR","政治家の後援会"],["SSR","財界のパイプ"],["SSR","伝説のヘッドハンター"],
      ["UR","家族ぐるみの権力者"],["UR","閨閥"],
    ],
    as: [
      ["N","小銭貯金"],["N","ポイントカード束"],["N","株主優待の端数"],["N","古いゲーム機"],
      ["N","漫画全巻セット"],["N","電池切れの腕時計"],["N","原付"],["N","積読の山"],
      ["R","定期預金"],["R","NISA(含み損)"],["R","中古車"],["R","金の指輪"],
      ["R","塩漬け仮想通貨"],["R","親の保険"],["R","退職金の見込み"],
      ["SR","都内ワンルーム"],["SR","優良株"],["SR","外貨預金"],["SR","事業の権利書"],["SR","金塊(小)"],
      ["SSR","タワマン一室"],["SSR","地方の雑居ビル"],["SSR","法人名義の何か"],
      ["UR","一等地の土地"],["UR","信託財産"],
    ],
  };

  /* 100 titles (N30/R25/SR20/SSR15/UR8/LR2) */
  const TITLES = [
    /* N x30 */
    ["N","中古の"],["N","型落ちの"],["N","自称"],["N","訳あり"],["N","非公式の"],
    ["N","賞味期限切れの"],["N","雨ざらしの"],["N","その辺の"],["N","借り物の"],["N","無記名の"],
    ["N","コピー品の"],["N","埃を被った"],["N","誰も欲しがらない"],["N","返品された"],["N","福袋の底の"],
    ["N","動作未確認の"],["N","解約し忘れた"],["N","前任者の"],["N","会議で決まった"],["N","とりあえずの"],
    ["N","形式上の"],["N","惰性の"],["N","現状維持の"],["N","様子見の"],["N","昭和の"],
    ["N","テンプレの"],["N","量産型の"],["N","無償配布の"],["N","規格外の"],["N","言い訳がましい"],
    /* R x25 */
    ["R","それなりの"],["R","一応の"],["R","叩き上げの"],["R","残業続きの"],["R","コスパ重視の"],
    ["R","中堅どころの"],["R","即戦力(自称)の"],["R","汎用の"],["R","口コミ4.2の"],["R","家電量販店の"],
    ["R","積立式の"],["R","堅実な"],["R","満員電車仕込みの"],["R","締切前の"],["R","二番煎じの"],
    ["R","無難に強い"],["R","知る人ぞ知る"],["R","近所で評判の"],["R","繁忙期の"],["R","黒字ギリギリの"],
    ["R","現実的な"],["R","駆け出しの"],["R","背伸びした"],["R","もらい物の"],["R","習い事帰りの"],
    /* SR x20 */
    ["SR","歴戦の"],["SR","バズった"],["SR","上場企業の"],["SR","港区の"],["SR","海外帰りの"],
    ["SR","インフルエンサーの"],["SR","早期退職者の"],["SR","不労所得の"],["SR","元経営者の"],["SR","選ばれし"],
    ["SR","監査済みの"],["SR","社内では伝説の"],["SR","満場一致の"],["SR","メディア掲載の"],["SR","行列のできる"],
    ["SR","融資の通る"],["SR","景気の良い"],["SR","顧問付きの"],["SR","節税済みの"],["SR","代々続く"],
    /* SSR x15 */
    ["SSR","財閥系の"],["SSR","政商の"],["SSR","タックスヘイブンの"],["SSR","天下り仕込みの"],["SSR","黄金の"],
    ["SSR","忖度を集める"],["SSR","規制をすり抜けた"],["SSR","マスコミが黙る"],["SSR","官報に載らない"],["SSR","既得権益の"],
    ["SSR","バブルを生き延びた"],["SSR","国策指定の"],["SSR","談合で磨かれた"],["SSR","上場ゴールの"],["SSR","悪運の強い"],
    /* UR x8 */
    ["UR","上級国民の"],["UR","世界経済を回す"],["UR","法の上に立つ"],["UR","歴史に残らない(消される)"],
    ["UR","中央銀行公認の"],["UR","革命でも死なない"],["UR","デジタル遺産級の"],["UR","伝説の地面師が認めた"],
    /* LR x2 */
    ["LR","神に経費申請した"],["LR","資本主義を卒業した"],
  ];

  /* drop weights */
  const BW = { N: 45, R: 30, SR: 16, SSR: 7, UR: 2 };
  const TW = { N: 50, R: 27, SR: 14, SSR: 6.5, UR: 2, LR: 0.5 };

  function pickWeighted(arr, weights) {
    const tot = arr.reduce((s, x) => s + weights[x[0]], 0);
    let t = Math.random() * tot;
    for (let i = 0; i < arr.length; i++) { t -= weights[arr[i][0]]; if (t < 0) return i; }
    return arr.length - 1;
  }
  function makeDrop(luck) {
    const slot = SLOTS[Math.random() * 4 | 0].id;
    const bi = pickWeighted(BASES[slot], BW);
    const ti = pickWeighted(TITLES, TW);
    const [br, bn] = BASES[slot][bi];
    const [tr, tn] = TITLES[ti];
    const p = Math.round(BPOW[br] * TMUL[tr] * (0.9 + Math.random() * 0.3) * (luck || 1));
    return { slot, bi, ti, p, br, tr, bn, tn };
  }
  const itemRank = (it) => Math.max(RCLS[it.br], RCLS[it.tr]);
  const itemName = (it) => "【" + it.tn + "】" + it.bn;
  const RNAMES = ["N", "R", "SR", "SSR", "UR", "LR"];

  /* ================= FIELDS ================ */
  const FIELDS = [
    { name: "実家のリビング",   req: 5,   foes: ["進路を聞く親戚", "テレビの音量", "正月の空気"] },
    { name: "受験戦争",         req: 15,  foes: ["模試E判定", "隣の天才", "赤本の山"] },
    { name: "就活会場",         req: 30,  foes: ["圧迫面接官", "お祈りメール", "ガクチカ盛る同期"] },
    { name: "新卒研修",         req: 50,  foes: ["謎マナー講師", "大声の社訓", "同期のエース"] },
    { name: "満員電車",         req: 80,  foes: ["新聞を広げる猛者", "リュック正面装備", "人身事故の遅延"] },
    { name: "社内政治",         req: 120, foes: ["手柄を掠める上司", "派閥のドン", "CC全員返信"] },
    { name: "住宅ローン35年",   req: 180, foes: ["変動金利", "修繕積立金", "営業スマイル"] },
    { name: "中間管理職",       req: 260, foes: ["上からの圧", "下からの突き上げ", "板挟みそのもの"] },
    { name: "老後2000万問題",   req: 360, foes: ["物価上昇", "年金定期便", "健康診断の数値"] },
    { name: "上級国民の壁",     req: 500, foes: ["見えない天井", "世襲の門番", "「ご縁がなかった」"] },
  ];
  const entryCost = (f) => 1 + Math.floor(f.req / 25);

  /* two-choice events */
  const EVENTS = [
    { q: "上司が「今夜どう？」と誘ってきた。",
      a: { t: "行く",   good: .5, up: 6, dn: 5, gm: "気に入られた。処世術の勝利。", bm: "説教3時間。時給0円。" },
      b: { t: "断る",   good: .8, up: 1, dn: 4, gm: "何も起きない。それが一番の勝ち。", bm: "査定に響いた。理不尽は仕様です。" } },
    { q: "「絶対儲かる話」が届いた。",
      a: { t: "乗る",   good: .1, up: 30, dn: 12, gm: "まさかの本物。次はありません。", bm: "教材が届いた。中身は空気。" },
      b: { t: "断る",   good: .95, up: 2, dn: 1, gm: "賢明。断る力は最強の資産。", bm: "断り方が下手で角が立った。" } },
    { q: "同僚があなたの手柄を役員会で発表している。",
      a: { t: "主張する", good: .45, up: 8, dn: 6, gm: "正当な評価を奪還。稀有な事例です。", bm: "「和を乱す人」認定。日本です。" },
      b: { t: "黙る",   good: .6, up: 2, dn: 5, gm: "恩を売った形になった。伝票はいつか回る。", bm: "そのまま昇進された。あなたの仕事で。" } },
    { q: "健康診断の結果を開封する時が来た。",
      a: { t: "開ける", good: .55, up: 4, dn: 6, gm: "オールA。若さの遺産です。", bm: "再検査。現実からの督促状。" },
      b: { t: "見ない", good: .3, up: 1, dn: 8, gm: "知らぬが仏。仏になる前に見てね。", bm: "放置した数値が育っていた。" } },
    { q: "推しが結婚を発表した。",
      a: { t: "祝う",   good: .7, up: 3, dn: 3, gm: "徳を積んだ。情緒は死んだが徳は積んだ。", bm: "祝いながら泣いた。回線が混雑。" },
      b: { t: "現実逃避", good: .5, up: 2, dn: 4, gm: "新しい推しを見つけた。回復が早い。", bm: "課金額だけが残った。" } },
    { q: "フリマアプリで「ほぼ新品」を見つけた。",
      a: { t: "買う",   good: .5, up: 5, dn: 5, gm: "本当にほぼ新品だった。奇跡。", bm: "「ほぼ」の定義が違った。" },
      b: { t: "見送る", good: .8, up: 1, dn: 2, gm: "浪費を回避。読まないのは広告だけでいい。", bm: "翌日値上がりした。世の常。" } },
    { q: "実家から「大事な話がある」と連絡。",
      a: { t: "帰省する", good: .5, up: 6, dn: 4, gm: "遺産の話だった。複雑な+。", bm: "お見合いの話だった。逃走。" },
      b: { t: "電話で済ます", good: .6, up: 2, dn: 3, gm: "案外あっさり済んだ。", bm: "「そういうとこだぞ」と言われた。" } },
    { q: "深夜、限定セールの通知が光る。",
      a: { t: "開く",   good: .3, up: 4, dn: 6, gm: "本当に必要な物が安かった。初めての体験。", bm: "気づけば決済完了。指が勝手に。" },
      b: { t: "寝る",   good: .9, up: 3, dn: 1, gm: "睡眠は最強の投資。複利で効きます。", bm: "夢の中でも買っていた。" } },
  ];

  /* ================= STATE ================ */
  const KEY = "hx77";
  let st = { pos: 1, gear: {} };
  try { st = Object.assign(st, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };

  const gearPower = () => SLOTS.reduce((s, sl) => s + (st.gear[sl.id] ? st.gear[sl.id].p : 0), 0);
  const effPower = () => W.credit + gearPower();

  /* ================= DOM ================ */
  const fieldsEl = $("#hx-fields"), logEl = $("#hx-log"), gearEl = $("#hx-gear");
  const powEl = $("#hx-power"), posEl = $("#hx-pos");
  const evBox = $("#hx-event"), evQ = $("#hx-ev-q"), evA = $("#btn-ev-a"), evB = $("#btn-ev-b");
  let running = false;

  function renderGear() {
    gearEl.innerHTML = "";
    SLOTS.forEach(sl => {
      const it = st.gear[sl.id];
      const d = document.createElement("div");
      d.className = "hx-slot" + (it ? " has r-" + RNAMES[itemRank(it)] : "");
      d.innerHTML = '<span class="k">' + sl.name + "</span>" +
        (it ? '<span class="n">' + itemName(it) + '</span><span class="p">+' + it.p + "</span>"
            : '<span class="n empty">— 未装備 —</span><span class="p">+0</span>');
      gearEl.appendChild(d);
    });
    powEl.innerHTML = W.credit + " <i>信用</i> + " + gearPower() + " <i>装備</i> = <b>" + effPower() + "</b>";
    posEl.textContent = "F" + st.pos + " " + FIELDS[st.pos - 1].name;
  }
  document.addEventListener("walletchange", () => { renderGear(); renderFields(); });

  function renderFields() {
    fieldsEl.innerHTML = "";
    FIELDS.forEach((f, i) => {
      const n = i + 1;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "hx-field" +
        (n === st.pos ? " here" : "") +
        (effPower() >= f.req ? " can" : "");
      b.disabled = running;
      b.innerHTML = '<span class="fn">F' + n + '</span><span class="fname">' + f.name +
        '</span><span class="freq">要求 ' + f.req + ' / 入場 ' + entryCost(f) + '</span>';
      b.addEventListener("click", () => run(n));
      fieldsEl.appendChild(b);
    });
  }

  const log = (html, cls) => {
    const p = document.createElement("p");
    p.className = "hx-line" + (cls ? " " + cls : "");
    p.innerHTML = html;
    logEl.appendChild(p);
    logEl.scrollTop = logEl.scrollHeight;
    while (logEl.children.length > 40) logEl.removeChild(logEl.firstChild);
  };
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  function askEvent(ev) {
    return new Promise(res => {
      evBox.classList.add("open");
      evQ.textContent = ev.q;
      evA.textContent = ev.a.t; evB.textContent = ev.b.t;
      const pick = (c) => {
        evBox.classList.remove("open");
        evA.onclick = evB.onclick = null;
        res(c);
      };
      evA.onclick = () => pick(ev.a);
      evB.onclick = () => pick(ev.b);
    });
  }

  async function run(n) {
    if (running) return;
    const f = FIELDS[n - 1];
    const cost = entryCost(f);
    if (W.broke()) {
      const debt = W.borrow();
      log("<b>+20 融資。</b>人生を周回するための借金。周回遅れの元本です。累計負債: ¥" +
        (debt * 10000).toLocaleString(), "ev");
      sfx.borrow(); renderGear(); renderFields(); return;
    }
    if (!W.pay(cost)) {
      log("入場料 " + cost + " が払えません。門前払いも人生の一部です。", "bad");
      sfx.lose(); return;
    }
    running = true; renderFields();
    logEl.innerHTML = "";
    log("<b>F" + n + " " + f.name + "</b> — 要求信用 " + f.req + "。入場料 " + cost + " 徴収済み。返金はありません。");
    sfx.flip();
    await sleep(600);

    /* encounters */
    for (let i = 0; i < 3; i++) {
      const foe = f.foes[i % f.foes.length];
      const fp = Math.round(f.req * (0.35 + 0.2 * i) * (0.85 + Math.random() * 0.3));
      log("遭遇: <b>" + foe + "</b>（脅威度 " + fp + "）");
      window.Casino.beep(180 + i * 40, .08, .04);
      await sleep(650);
      if (effPower() >= fp) {
        log("→ 撃破。威圧が通りました。信用とはそういう武器です。", "ok");
        sfx.coin();
        if (Math.random() < 0.65) {
          const it = makeDrop();
          const rk = itemRank(it);
          await sleep(400);
          if (rk >= 3) { fx.flash(rk >= 4); fx.shake(rk >= 4); }
          if (rk >= 4) fx.win(3, RNAMES[rk] + " DROP", it.p);
          log("DROP: <b class='r-" + RNAMES[rk] + "'>[" + RNAMES[RCLS[it.tr]] + "×" + RNAMES[RCLS[it.br]] + "] " +
            itemName(it) + "</b> (" + SLOTS.find(s => s.id === it.slot).name + " +" + it.p + ")", "drop");
          const cur = st.gear[it.slot];
          if (!cur || it.p > cur.p) {
            st.gear[it.slot] = it; save();
            log("→ 装備更新。人は着ている肩書きで態度を変えます。", "ok");
            window.Casino.beep(880, .1, .05); window.Casino.beep(1100, .12, .05, .08);
          } else {
            const scrap = Math.max(1, Math.round(it.p / 8));
            W.earn(scrap);
            log("→ 既存装備が上。リサイクルショップで +" + scrap + " に換金。夢の末路です。");
          }
          renderGear();
        }
      } else {
        const dmg = 1 + (Math.random() * 2 | 0);
        W.earn(-dmg);
        log("→ 敗走。信用 -" + dmg + "。「社会勉強代」と呼ぶことでダメージを軽減した気になれます。", "bad");
        sfx.lose();
      }
      await sleep(650);

      /* rare event */
      if (Math.random() < 0.22) {
        const ev = EVENTS[Math.random() * EVENTS.length | 0];
        log("<b>イベント発生:</b> " + ev.q, "ev");
        sfx.near();
        const c = await askEvent(ev);
        const good = Math.random() < c.good;
        const delta = good ? c.up : -c.dn;
        W.earn(delta);
        log("→ " + (good ? c.gm : c.bm) + " <b>" + (delta >= 0 ? "+" : "") + delta + "</b>",
          good ? "ok" : "bad");
        if (good && delta >= 5) sfx.win(); else if (!good) sfx.bad();
        renderGear();
        await sleep(650);
      }
    }

    /* the gate */
    log("最深部: <b>要求社会的信用 " + f.req + "</b> の壁。あなたの合計: <b>" + effPower() + "</b>。");
    sfx.heart(0); sfx.heart(.6);
    await sleep(1100);
    if (effPower() >= f.req) {
      const reward = Math.max(2, Math.round(f.req / 8));
      W.earn(reward);
      st.pos = Math.max(st.pos, Math.min(10, n + 1));
      const it = makeDrop(1.2);
      const cur = st.gear[it.slot];
      log("<b>突破。</b>+" + reward + "。壁は壊すものではなく、書類で迂回するものです。", "ok");
      fx.win(n >= 8 ? 3 : 2, "F" + n + " 突破", reward);
      if (!cur || it.p > cur.p) {
        st.gear[it.slot] = it;
        log("報酬装備: <b class='r-" + RNAMES[itemRank(it)] + "'>" + itemName(it) + "</b> +" + it.p + " を装備。", "drop");
      } else {
        const scrap = Math.max(1, Math.round(it.p / 8));
        W.earn(scrap);
        log("報酬装備は型落ちでした。+" + scrap + " に換金。", "drop");
      }
    } else {
      st.pos = Math.max(1, n - 1);
      log("<b>力不足。</b>F" + st.pos + " へ強制送還。エレベーターは下りだけ混みません。", "bad");
      sfx.bad(); fx.shake(false);
    }
    save();
    running = false;
    renderGear(); renderFields();
  }

  renderGear(); renderFields();
  log("ここは人生の周回コース。信用で殴り、装備で誤魔化し、上を目指してください。降りる自由もあります（推奨はしません。胴元として）。");
})();
