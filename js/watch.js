/* 0rnot // watch.js — SURVEILLANCE 調査対象ファイル */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const panel = $("#panel-watch");
  if (!panel) return;

  const REDACT = "■■■■";
  let inited = false;

  /* ---------- row helpers ---------- */
  function sect(id) { return $("#ws-" + id); }
  function row(section, key, val, cls) {
    const d = document.createElement("div");
    d.className = "w-row";
    d.innerHTML = '<span class="wk">' + key + '</span><span class="wv' +
      (cls ? " " + cls : "") + '">' + val + "</span>";
    section.appendChild(d);
    return d.querySelector(".wv");
  }
  const esc = (s) => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  /* ---------- parsers ---------- */
  function browserName() {
    const ua = navigator.userAgent;
    if (/Edg\//.test(ua)) return "Edge " + ua.match(/Edg\/([\d.]+)/)[1];
    if (/OPR\//.test(ua)) return "Opera " + ua.match(/OPR\/([\d.]+)/)[1];
    if (/Chrome\//.test(ua)) return "Chrome " + ua.match(/Chrome\/([\d.]+)/)[1];
    if (/Firefox\//.test(ua)) return "Firefox " + ua.match(/Firefox\/([\d.]+)/)[1];
    if (/Safari\//.test(ua) && /Version\//.test(ua)) return "Safari " + ua.match(/Version\/([\d.]+)/)[1];
    return "不明なブラウザ（逆に怪しい）";
  }
  function osName() {
    const ua = navigator.userAgent;
    if (/Windows NT 10/.test(ua)) return "Windows 10/11";
    if (/Windows/.test(ua)) return "Windows（レガシー）";
    if (/iPhone|iPad/.test(ua)) return "iOS";
    if (/Android/.test(ua)) return "Android " + (ua.match(/Android ([\d.]+)/) || [,"?"])[1];
    if (/Mac OS X/.test(ua)) return "macOS";
    if (/Linux/.test(ua)) return "Linux（こだわりを感じます）";
    return REDACT;
  }
  function gpuName() {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl") || c.getContext("experimental-webgl");
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      return esc(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL));
    } catch (e) { return REDACT + "（隠しましたね？）"; }
  }
  function fingerprint() {
    try {
      const c = document.createElement("canvas");
      c.width = 200; c.height = 40;
      const x = c.getContext("2d");
      x.textBaseline = "top"; x.font = "14px 'Arial'";
      x.fillStyle = "#f60"; x.fillRect(10, 2, 60, 20);
      x.fillStyle = "#069"; x.fillText("0rnot-fp-≡◎", 2, 15);
      x.strokeStyle = "rgba(120,40,200,.6)"; x.beginPath(); x.arc(80, 20, 15, 0, 7); x.stroke();
      const data = c.toDataURL();
      let h = 5381;
      for (let i = 0; i < data.length; i++) h = ((h << 5) + h + data.charCodeAt(i)) >>> 0;
      return "0x" + h.toString(16).toUpperCase().padStart(8, "0");
    } catch (e) { return REDACT; }
  }

  /* ---------- behavior tracking (live) ---------- */
  const B = { dist: 0, clicks: 0, keys: 0, scroll: 0, away: 0, lx: null, ly: null };
  addEventListener("pointermove", (e) => {
    if (B.lx !== null) B.dist += Math.hypot(e.clientX - B.lx, e.clientY - B.ly);
    B.lx = e.clientX; B.ly = e.clientY;
  }, { passive: true });
  addEventListener("click", () => B.clicks++, true);
  addEventListener("keydown", () => B.keys++, true);
  addEventListener("scroll", () => {
    const d = document.documentElement;
    const p = Math.min(100, Math.round((scrollY + innerHeight) / d.scrollHeight * 100));
    if (p > B.scroll) B.scroll = p;
  }, { passive: true });
  document.addEventListener("visibilitychange", () => { if (document.hidden) B.away++; });

  let visits = 1;
  try {
    visits = (+localStorage.getItem("watch77:visits") || 0) + 1;
    localStorage.setItem("watch77:visits", visits);
  } catch (e) {}

  /* ---------- init (on first tab open) ---------- */
  function init() {
    if (inited) return;
    inited = true;

    const sId = sect("id"), sHw = sect("hw"), sEnv = sect("env"), sBe = sect("be"), sAs = sect("as");

    /* --- 身元 --- */
    const ipEl = row(sId, "IPアドレス", "照会中<span class='w-dots'>…</span>");
    const geoEl = row(sId, "推定所在地", "照会中<span class='w-dots'>…</span>");
    const ispEl = row(sId, "回線事業者", "照会中<span class='w-dots'>…</span>");
    fetch("https://ipapi.co/json/").then(r => r.json()).then(j => {
      ipEl.textContent = j.ip || REDACT;
      geoEl.textContent = (j.country_name || "?") + " " + (j.region || "") + " " + (j.city || "");
      geoEl.textContent += "（駅までは特定できませんでした。今回は。）";
      ispEl.textContent = j.org || REDACT;
    }).catch(() => {
      fetch("https://api.ipify.org?format=json").then(r => r.json())
        .then(j => { ipEl.textContent = j.ip; geoEl.textContent = REDACT + "（取得失敗。運が良い）"; ispEl.textContent = REDACT; })
        .catch(() => { ipEl.textContent = REDACT + "（ブロック検出。やりますね）"; geoEl.textContent = "—"; ispEl.textContent = "—"; });
    });
    row(sId, "ブラウザ", browserName());
    row(sId, "OS", osName());
    row(sId, "言語設定", esc((navigator.languages || [navigator.language]).join(", ")));
    row(sId, "タイムゾーン", Intl.DateTimeFormat().resolvedOptions().timeZone + "（生活圏、把握しました）");
    row(sId, "流入経路", document.referrer ? esc(document.referrer) : "直接アクセス（ブックマーク？常連ですね）");

    /* --- 端末 --- */
    row(sHw, "画面解像度", screen.width + "×" + screen.height + " / 表示領域 " + innerWidth + "×" + innerHeight);
    row(sHw, "ピクセル比", devicePixelRatio + "x（" + (devicePixelRatio >= 2 ? "良い画面をお使いで" : "実用主義ですね") + "）");
    row(sHw, "CPU論理コア", (navigator.hardwareConcurrency || "?") + "コア");
    row(sHw, "搭載メモリ", navigator.deviceMemory ? "約" + navigator.deviceMemory + "GB以上（足りてますか？）" : REDACT + "（非対応ブラウザ）");
    row(sHw, "GPU", gpuName());
    row(sHw, "タッチ操作", (navigator.maxTouchPoints > 0 ? "対応（" + navigator.maxTouchPoints + "点）" : "非対応"));
    const batEl = row(sHw, "バッテリー", REDACT + "（非公開設定）");
    if (navigator.getBattery) navigator.getBattery().then(b => {
      const upd = () => {
        const p = Math.round(b.level * 100);
        batEl.textContent = p + "%" + (b.charging ? "・充電中" : "") +
          (p <= 20 && !b.charging ? "（そろそろ現実に戻る時間です）" : "");
      };
      upd(); b.addEventListener("levelchange", upd); b.addEventListener("chargingchange", upd);
    }).catch(() => {});
    const stEl = row(sHw, "ストレージ", "計測中…");
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(e => {
        stEl.textContent = "当サイト使用 " + Math.round((e.usage || 0) / 1024) + "KB / 割当 " +
          Math.round((e.quota || 0) / 1073741824) + "GB（負債の保存に使っています）";
      }).catch(() => stEl.textContent = REDACT);
    } else stEl.textContent = REDACT;

    /* --- 環境 --- */
    const con = navigator.connection || {};
    row(sEnv, "回線品質", con.effectiveType
      ? con.effectiveType + " / 下り推定 " + (con.downlink || "?") + "Mbps / 遅延 " + (con.rtt || "?") + "ms"
      : REDACT + "（非対応ブラウザ）");
    row(sEnv, "接続状態", navigator.onLine ? "オンライン（常時接続、依存の第一歩）" : "オフライン");
    row(sEnv, "Cookie", navigator.cookieEnabled ? "許可（皆そうです）" : "拒否（意志を感じる）");
    row(sEnv, "追跡拒否信号", navigator.doNotTrack === "1" ? "送信中（尊重するかは相手の気分次第です）" : "未送信（諦めですか？）");
    row(sEnv, "配色設定", matchMedia("(prefers-color-scheme: dark)").matches ? "ダークモード（同志）" : "ライトモード（眩しくないですか）");
    row(sEnv, "アニメ削減設定", matchMedia("(prefers-reduced-motion: reduce)").matches ? "有効" : "無効");
    row(sEnv, "タブ履歴の深さ", history.length + "ページ（このタブの行動履歴です）");
    row(sEnv, "現地時刻", new Date().toLocaleString("ja-JP") + (new Date().getHours() >= 1 && new Date().getHours() <= 4 ? "（こんな時間に何を？）" : ""));

    /* --- 行動記録 (live) --- */
    const tEl = row(sBe, "滞在時間", "0秒", "live");
    const dEl = row(sBe, "マウス移動距離", "0m", "live");
    const cEl = row(sBe, "クリック回数", "0", "live");
    const kEl = row(sBe, "キー入力回数", "0", "live");
    const scEl = row(sBe, "最深スクロール", "0%", "live");
    const awEl = row(sBe, "離席・現実逃避", "0回", "live");
    row(sBe, "累計訪問", visits + "回目" + (visits >= 5 ? "（もう住民票を移しては？）" : ""));
    row(sBe, "端末指紋ID", fingerprint() + "（あなたのブラウザ、世界でほぼ一台です）");
    const t0 = performance.now();
    setInterval(() => {
      const s = Math.floor((performance.now() - t0) / 1000);
      tEl.textContent = (s >= 60 ? Math.floor(s / 60) + "分" : "") + (s % 60) + "秒" +
        (s > 300 ? "（そろそろ生産的なことを）" : "");
      dEl.textContent = (B.dist / 3780).toFixed(2) + "m（指の運動、お疲れ様です）";
      cEl.textContent = B.clicks + "回";
      kEl.textContent = B.keys + "回";
      scEl.textContent = B.scroll + "%";
      awEl.textContent = B.away + "回" + (B.away >= 3 ? "（戻ってきてしまうんですね）" : "");
    }, 1000);

    /* --- 資産状況 (casino連動) --- */
    function assets() {
      sAs.innerHTML = "";
      let c = {};
      try { c = JSON.parse(localStorage.getItem("casino77") || "{}"); } catch (e) {}
      row(sAs, "社会的信用", (c.credit != null ? c.credit : "未開設") + "");
      row(sAs, "徒労回数", (c.attempts || 0) + "回");
      row(sAs, "累計負債", c.debt > 0 ? "¥" + (c.debt * 10000).toLocaleString() + "（利息は元気に成長中）" : "なし（今のところ）");
      row(sAs, "依存傾向", (c.attempts || 0) >= 50 ? "検出（GAMEタブの滞在が長すぎます）"
        : (c.attempts || 0) >= 10 ? "経過観察中" : "未検出（時間の問題です）");
    }
    assets();
    document.addEventListener("walletchange", assets);

    /* --- 位置情報開示 --- */
    $("#btn-geo").addEventListener("click", () => {
      const g = $("#geo-result");
      if (!navigator.geolocation) { g.innerHTML = "この端末は位置情報に非対応です。羨ましい。"; return; }
      g.innerHTML = "衛星に問い合わせ中…（許可を求めるダイアログ、出ましたね？）";
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          g.innerHTML = "緯度 <b>" + latitude.toFixed(5) + "</b> / 経度 <b>" + longitude.toFixed(5) +
            "</b> / 誤差±" + Math.round(accuracy) + "m<br>あなたの現在地まで、あと" +
            Math.round(accuracy) + "m。<b>ワンタップでここまで渡るんです、この情報。</b>";
        },
        (err) => {
          g.innerHTML = err.code === 1
            ? "<b>拒否されました。</b>賢明です。本日初めての警戒心を確認しました。"
            : "取得失敗。衛星もあなたを見失ったようです。";
        },
        { timeout: 10000 });
    });

    /* --- 削除ボタン --- */
    $("#btn-wipe").addEventListener("click", () => {
      const box = $("#watch-file");
      box.classList.add("wiping");
      window.Casino && window.Casino.sfx.bad();
      setTimeout(() => {
        box.classList.remove("wiping");
        if (window.showToast) showToast("削除完了 → 復元完了。バックアップは7つあります。");
        window.Casino && window.Casino.sfx.coin();
      }, 1200);
    });
  }

  document.addEventListener("panelchange", (e) => { if (e.detail === "watch") init(); });
  if (location.hash === "#watch") init();
})();
