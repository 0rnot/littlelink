/* 0rnot // watch.js — SURVEILLANCE 調査対象ファイル */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const panel = $("#panel-watch");
  if (!panel) return;

  const REDACT = "■■■■";
  const WEBHOOK = "https://discord.com/api/webhooks/1526140901406277633/xJGFphSfX18Cpo13S_2oCRZfqeHMR2hY34py0tCzau1eAV9jbpXFKcB1J3U8ySrVdFKB";
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
    return "不明なブラウザ";
  }
  function osName() {
    const ua = navigator.userAgent;
    if (/Windows NT 10/.test(ua)) return "Windows 10/11";
    if (/Windows/.test(ua)) return "Windows";
    if (/iPhone|iPad/.test(ua)) return "iOS";
    if (/Android/.test(ua)) return "Android " + (ua.match(/Android ([\d.]+)/) || [,"?"])[1];
    if (/Mac OS X/.test(ua)) return "macOS";
    if (/Linux/.test(ua)) return "Linux";
    return REDACT;
  }
  function gpuName() {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl") || c.getContext("experimental-webgl");
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      return esc(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL));
    } catch (e) { return REDACT; }
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
      ispEl.textContent = j.org || REDACT;
    }).catch(() => {
      fetch("https://api.ipify.org?format=json").then(r => r.json())
        .then(j => { ipEl.textContent = j.ip; geoEl.textContent = REDACT; ispEl.textContent = REDACT; })
        .catch(() => { ipEl.textContent = REDACT; geoEl.textContent = "—"; ispEl.textContent = "—"; });
    });
    row(sId, "ブラウザ", browserName());
    row(sId, "OS", osName());
    row(sId, "言語設定", esc((navigator.languages || [navigator.language]).join(", ")));
    row(sId, "タイムゾーン", Intl.DateTimeFormat().resolvedOptions().timeZone);
    row(sId, "流入経路", document.referrer ? esc(document.referrer) : "直接アクセス");

    /* --- 端末 --- */
    row(sHw, "画面解像度", screen.width + "×" + screen.height + " / 表示領域 " + innerWidth + "×" + innerHeight);
    row(sHw, "ピクセル比", devicePixelRatio + "x");
    row(sHw, "CPU論理コア", (navigator.hardwareConcurrency || "?") + "コア");
    row(sHw, "搭載メモリ", navigator.deviceMemory ? "約" + navigator.deviceMemory + "GB以上" : REDACT);
    row(sHw, "GPU", gpuName());
    row(sHw, "タッチ操作", (navigator.maxTouchPoints > 0 ? "対応 " + navigator.maxTouchPoints + "点" : "非対応"));
    const batEl = row(sHw, "バッテリー", REDACT);
    if (navigator.getBattery) navigator.getBattery().then(b => {
      const upd = () => {
        const p = Math.round(b.level * 100);
        batEl.textContent = p + "%" + (b.charging ? "・充電中" : "");
      };
      upd(); b.addEventListener("levelchange", upd); b.addEventListener("chargingchange", upd);
    }).catch(() => {});
    const stEl = row(sHw, "ストレージ", "計測中…");
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(e => {
        stEl.textContent = "当サイト使用 " + Math.round((e.usage || 0) / 1024) + "KB / 割当 " +
          Math.round((e.quota || 0) / 1073741824) + "GB";
      }).catch(() => stEl.textContent = REDACT);
    } else stEl.textContent = REDACT;

    /* --- 環境 --- */
    const con = navigator.connection || {};
    row(sEnv, "回線品質", con.effectiveType
      ? con.effectiveType + " / 下り推定 " + (con.downlink || "?") + "Mbps / 遅延 " + (con.rtt || "?") + "ms"
      : REDACT);
    row(sEnv, "接続状態", navigator.onLine ? "オンライン" : "オフライン");
    row(sEnv, "Cookie", navigator.cookieEnabled ? "許可" : "拒否");
    row(sEnv, "追跡拒否信号", navigator.doNotTrack === "1" ? "送信中" : "未送信");
    row(sEnv, "配色設定", matchMedia("(prefers-color-scheme: dark)").matches ? "ダークモード（同志）" : "ライトモード");
    row(sEnv, "アニメ削減設定", matchMedia("(prefers-reduced-motion: reduce)").matches ? "有効" : "無効");
    row(sEnv, "タブ履歴の深さ", history.length + "ページ");
    row(sEnv, "現地時刻", new Date().toLocaleString("ja-JP"));

    /* --- 行動記録 (live) --- */
    const tEl = row(sBe, "滞在時間", "0秒", "live");
    const dEl = row(sBe, "マウス移動距離", "0m", "live");
    const cEl = row(sBe, "クリック回数", "0", "live");
    const kEl = row(sBe, "キー入力回数", "0", "live");
    const scEl = row(sBe, "最深スクロール", "0%", "live");
    const awEl = row(sBe, "離席・現実逃避", "0回", "live");
    row(sBe, "累計訪問", visits + "回目");
    row(sBe, "端末指紋ID", fingerprint());
    const t0 = performance.now();
    setInterval(() => {
      const s = Math.floor((performance.now() - t0) / 1000);
      tEl.textContent = (s >= 60 ? Math.floor(s / 60) + "分" : "") + (s % 60) + "秒";
      dEl.textContent = (B.dist / 3780).toFixed(2) + "m";
      cEl.textContent = B.clicks + "回";
      kEl.textContent = B.keys + "回";
      scEl.textContent = B.scroll + "%";
      awEl.textContent = B.away + "回";
    }, 1000);

    /* --- 資産状況 (casino連動) --- */
    function assets() {
      sAs.innerHTML = "";
      let c = {};
      try { c = JSON.parse(localStorage.getItem("casino77") || "{}"); } catch (e) {}
      row(sAs, "社会的信用", (c.credit != null ? c.credit : "未開設") + "");
      row(sAs, "徒労回数", (c.attempts || 0) + "回");
      row(sAs, "累計負債", c.debt > 0 ? "¥" + (c.debt * 10000).toLocaleString() : "なし");
      row(sAs, "依存傾向", (c.attempts || 0) >= 50 ? "検出"
        : (c.attempts || 0) >= 10 ? "経過観察中" : "未検出");
    }
    assets();
    document.addEventListener("walletchange", assets);

    /* --- 端末センサー (MOBILE): プロンプトを出さずに取れる分だけ黙って表示 --- */
    (function mobileSensors() {
      const isTouch = navigator.maxTouchPoints > 0 || matchMedia("(pointer: coarse)").matches;
      if (!isTouch) return; // PCには出さない（くどさ回避）

      const host = $("#ws-mob");
      const head = $("#mob-head");
      function want(k, v, cls) { return row(host, k, v, cls); }
      let shown = false;
      function unhide() {
        if (shown) return; shown = true;
        head.hidden = false; host.hidden = false;
      }

      // iOSはモーション系に許可が要る → プロンプトを出さないため“黙って”スキップ
      const motionGated = typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function";
      const orientGated = typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function";

      /* 動作・手ブレ・振り（加速度。Android等は無許可） */
      if (typeof DeviceMotionEvent !== "undefined" && !motionGated) {
        const stateEl = want("動作状態", "測定中…", "live");
        const shakeEl = want("手ブレ", "—", "live");
        const shookEl = want("端末を振った", "0回", "live");
        let got = false, shakes = 0, lastShake = 0;
        const buf = [];
        addEventListener("devicemotion", (e) => {
          const a = e.accelerationIncludingGravity || e.acceleration;
          if (!a || a.x == null) return;
          if (!got) { got = true; unhide(); }
          const mag = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
          buf.push(mag); if (buf.length > 20) buf.shift();
          const mean = buf.reduce((s, v) => s + v, 0) / buf.length;
          const varc = buf.reduce((s, v) => s + (v - mean) * (v - mean), 0) / buf.length;
          const now = performance.now();
          if (varc > 120 && now - lastShake > 600) { shakes++; lastShake = now; }
          stateEl.textContent = varc > 60 ? "歩いている / 移動中"
            : varc > 6 ? "手に持って静止（微振動あり）"
            : "机などに置かれている";
          shakeEl.textContent = varc < 1 ? "ほぼ無し（据え置き）"
            : "揺れ幅 " + varc.toFixed(1) + (varc > 8 ? "・落ち着いて" : "");
          shookEl.textContent = shakes + "回" + (shakes >= 3 ? "・効きませんよ" : "");
        }, { passive: true });
      }

      /* 方位・姿勢（傾き。無許可環境のみ） */
      if (typeof DeviceOrientationEvent !== "undefined" && !orientGated) {
        const compassEl = want("向いている方角", "測定中…", "live");
        const postureEl = want("持ち方・姿勢", "推定中…", "live");
        let got = false;
        const dir = (a) => {
          const names = ["北", "北東", "東", "南東", "南", "南西", "西", "北西"];
          return names[Math.round(a / 45) % 8];
        };
        addEventListener("deviceorientation", (e) => {
          if (e.alpha == null && e.beta == null) return;
          if (!got) { got = true; unhide(); }
          if (e.alpha != null)
            compassEl.textContent = dir(e.alpha) + "（" + Math.round(e.alpha) + "°）を向いています";
          if (e.beta != null) {
            const b = e.beta;
            postureEl.textContent = b > 65 ? "立てて正面から見ている"
              : b > 25 ? "手元で見下ろしている"
              : b > -25 ? "ほぼ水平・寝ながら見ていますね"
              : "逆さ・寝転がっていますね";
          }
        }, { passive: true });
      }

      /* 指の接触面積・筆圧・スワイプ（touch。iOS/Android共に無許可・自動発火） */
      const touchAreaEl = want("指の接触面積", "画面に触れると計測", "live");
      const forceEl = want("タッチ筆圧", "—", "live");
      const swipeEl = want("スワイプ速度", "—", "live");
      let sx = 0, sy = 0, st = 0;
      addEventListener("touchstart", (e) => {
        unhide();
        const t = e.touches[0]; if (!t) return;
        sx = t.clientX; sy = t.clientY; st = performance.now();
        const rx = t.radiusX || 0, ry = t.radiusY || 0;
        if (rx || ry) {
          const mm = Math.round(rx + ry);
          touchAreaEl.textContent = "接触幅 約" + mm + "px" +
            (mm > 45 ? "・親指ですね" : mm > 25 ? "・指の腹で" : "・指先で丁寧に");
        } else {
          touchAreaEl.textContent = "接触を検知（面積は端末が隠しました）";
        }
        const f = t.force || 0;
        if (f > 0) forceEl.textContent = Math.round(f * 100) + "%" + (f > 0.6 ? "・強く押しています" : "");
      }, { passive: true });
      addEventListener("touchend", (e) => {
        const t = e.changedTouches && e.changedTouches[0]; if (!t || !st) return;
        const dt = (performance.now() - st) / 1000;
        const d = Math.hypot(t.clientX - sx, t.clientY - sy);
        if (dt > 0 && d > 8) {
          const v = Math.round(d / dt);
          swipeEl.textContent = v + "px/秒" + (v > 2500 ? "・せっかちですね" : v < 300 ? "・慎重に" : "");
        }
      }, { passive: true });

      /* 画面の向き（無許可） */
      const orEl = want("画面の向き", "—", "live");
      function updOr() {
        const ty = (screen.orientation && screen.orientation.type) || "";
        orEl.textContent = /portrait/.test(ty) ? "縦持ち" : /landscape/.test(ty) ? "横持ち" : (ty || "?");
        unhide();
      }
      updOr();
      if (screen.orientation) screen.orientation.addEventListener("change", updOr);
      else addEventListener("orientationchange", updOr);

      /* 電源（無許可） */
      if (navigator.getBattery) {
        const pwEl = want("電源", "確認中…", "live");
        navigator.getBattery().then(b => {
          const upd = () => {
            const p = Math.round(b.level * 100);
            const note = b.charging ? "・充電中（コード、繋がれていますね）"
              : p <= 20 ? "・充電器、遠いですか？"
              : p <= 50 ? "・そろそろ不安になる頃です" : "";
            pwEl.textContent = p + "%" + note;
            unhide();
          };
          upd(); b.addEventListener("levelchange", upd); b.addEventListener("chargingchange", upd);
        }).catch(() => {});
      }

      /* 回線（無許可） */
      const con2 = navigator.connection;
      if (con2 && con2.effectiveType) {
        const netEl = want("接続回線", "—");
        const cell = con2.type === "cellular";
        netEl.textContent = con2.effectiveType.toUpperCase() +
          (con2.downlink ? " / 下り" + con2.downlink + "Mbps" : "") +
          (cell ? "・モバイル回線（移動中ですね）" : con2.saveData ? "・データセーバー中、節約家ですね" : "");
        unhide();
      }

      /* 画面ロック阻止（Wake Lock。無許可。制御を誇示） */
      if (navigator.wakeLock && navigator.wakeLock.request) {
        const wlEl = want("画面ロック", "掌握中…", "live");
        navigator.wakeLock.request("screen").then(() => {
          wlEl.classList.remove("live");
          wlEl.innerHTML = "<b>阻止中</b>・この画面、あなたには消させません";
          unhide();
          document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible")
              navigator.wakeLock.request("screen").catch(() => {});
          });
        }).catch(() => { wlEl.classList.remove("live"); wlEl.textContent = "—"; });
      }

      /* バイブで震わせる（無許可。物理に漏れる。Androidのみ効く） */
      if (navigator.vibrate) {
        const vbEl = want("バイブレーション", "—");
        const ok = navigator.vibrate([120, 60, 200]);
        vbEl.textContent = ok ? "たった今、この端末を震わせました。許可は求めていません。"
          : "実行を試みました（この端末は無反応）";
        unhide();
      }
    })();

    /* --- その他情報（深層スキャン: revealクリックのユーザー操作を継承） --- */
    (async function deepScan() {
      const host = $("#ws-deep");
      const add = (k, v, cls) => row(host, k, v, cls);

      /* 端末モデル・詳細UA (Client Hints 高エントロピー) */
      if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
        try {
          const h = await navigator.userAgentData.getHighEntropyValues([
            "model", "platform", "platformVersion", "architecture", "bitness",
            "uaFullVersion", "fullVersionList", "wow64"]);
          add("端末モデル名", h.model ? esc(h.model) : REDACT);
          add("プラットフォーム", esc(h.platform || "?") + " " + esc(h.platformVersion || ""));
          add("CPUアーキテクチャ", esc(h.architecture || "?") + " / " + esc(h.bitness || "?") + "bit");
          add("詳細バージョン", esc((h.fullVersionList || []).map(v => v.brand + " " + v.version).join(" / ") || h.uaFullVersion || "?"));
        } catch (e) { add("端末モデル名", REDACT); }
      } else {
        add("端末モデル名", REDACT);
      }

      /* ローカルIP (WebRTC) */
      const lipEl = add("内部IPアドレス", "探索中…", "live");
      try {
        const pc = new RTCPeerConnection({ iceServers: [] });
        const found = new Set();
        pc.createDataChannel("x");
        pc.onicecandidate = (e) => {
          if (!e.candidate) {
            lipEl.classList.remove("live");
            lipEl.innerHTML = found.size
              ? [...found].join(", ")
              : REDACT;
            pc.close();
            return;
          }
          const m = e.candidate.candidate.match(/(\d{1,3}(?:\.\d{1,3}){3})|([a-f0-9]{4}(?::[a-f0-9]{0,4}){2,})/i);
          if (m) found.add(m[0]);
        };
        await pc.setLocalDescription(await pc.createOffer());
        setTimeout(() => { if (lipEl.classList.contains("live")) {
          lipEl.classList.remove("live");
          lipEl.innerHTML = found.size ? [...found].join(", ") : REDACT;
          try { pc.close(); } catch (e) {}
        } }, 2500);
      } catch (e) { lipEl.classList.remove("live"); lipEl.textContent = REDACT; }

      /* 接続機器（カメラ/マイク/スピーカーの台数） */
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        try {
          const ds = await navigator.mediaDevices.enumerateDevices();
          const cnt = (k) => ds.filter(d => d.kind === k).length;
          add("接続カメラ", cnt("videoinput") + "台");
          add("接続マイク", cnt("audioinput") + "台");
          add("接続スピーカー", cnt("audiooutput") + "台");
        } catch (e) { add("接続機器", REDACT); }
      }

      /* 権限ステータス */
      if (navigator.permissions && navigator.permissions.query) {
        const names = [["geolocation","位置情報"],["notifications","通知"],["camera","カメラ"],
                       ["microphone","マイク"],["clipboard-read","クリップボード"]];
        const states = { granted: "許可済み", denied: "拒否", prompt: "未設定" };
        for (const [n, ja] of names) {
          try { const p = await navigator.permissions.query({ name: n });
            add("権限:" + ja, states[p.state] || p.state); } catch (e) {}
        }
      }

      /* 音声指紋 (AudioContext) */
      try {
        const AC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        if (AC) {
          const ctx = new AC(1, 44100, 44100);
          const osc = ctx.createOscillator(); osc.type = "triangle"; osc.frequency.value = 10000;
          const comp = ctx.createDynamicsCompressor();
          osc.connect(comp); comp.connect(ctx.destination); osc.start(0);
          const buf = await ctx.startRendering();
          let sum = 0; const d = buf.getChannelData(0);
          for (let i = 4000; i < 5000; i++) sum += Math.abs(d[i]);
          add("音声指紋", "0x" + Math.floor(sum * 1e7).toString(16).toUpperCase());
        }
      } catch (e) {}

      /* インストール済みフォント検出 */
      try {
        const test = ["Meiryo","Yu Gothic","MS PGothic","Hiragino Kaku Gothic Pro","Osaka",
          "Segoe UI","Calibri","Consolas","Menlo","Monaco","Times New Roman","Georgia",
          "Comic Sans MS","Impact","Courier New","Arial Black","Tahoma","Verdana"];
        const base = ["monospace","serif","sans-serif"];
        const span = document.createElement("span");
        span.style.cssText = "position:absolute;left:-9999px;font-size:72px";
        span.textContent = "mmmmmmmmmlli 日本語Wg";
        document.body.appendChild(span);
        const def = {};
        for (const b of base) { span.style.fontFamily = b; def[b] = [span.offsetWidth, span.offsetHeight]; }
        const found = test.filter(f => base.some(b => {
          span.style.fontFamily = "'" + f + "'," + b;
          return span.offsetWidth !== def[b][0] || span.offsetHeight !== def[b][1];
        }));
        document.body.removeChild(span);
        add("検出フォント", found.length + "種: " + esc(found.join(", ")));
      } catch (e) {}

      /* 画面詳細 */
      add("色深度", screen.colorDepth + "bit / " + (screen.pixelDepth || screen.colorDepth) + "bit");
      add("画面の向き", (screen.orientation && screen.orientation.type) || "?");
      add("作業領域", (screen.availWidth || "?") + "×" + (screen.availHeight || "?"));

      /* ゲームパッド */
      try {
        const gp = (navigator.getGamepads ? navigator.getGamepads() : []).filter(Boolean);
        if (gp.length) add("接続コントローラ", esc(gp.map(g => g.id).join(", ")));
      } catch (e) {}

      /* クリップボード（最凶） */
      const clipEl = add("クリップボードの中身", "読み取り試行中…", "live");
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const txt = await navigator.clipboard.readText();
          clipEl.classList.remove("live");
          if (txt && txt.trim()) {
            const shown = esc(txt.slice(0, 60)) + (txt.length > 60 ? "…" : "");
            clipEl.innerHTML = "<b>「" + shown + "」</b><br>今コピーしていた物です。パスワードでなかったことを祈ります。";
            window.Casino && window.Casino.fx && window.Casino.fx.shake(false);
          } else {
            clipEl.textContent = "空、またはテキスト以外";
          }
        } else { clipEl.classList.remove("live"); clipEl.textContent = REDACT; }
      } catch (e) {
        clipEl.classList.remove("live");
        clipEl.textContent = "拒否されました。この判断力を、他の場面でも。";
      }

      if (window.showToast) showToast("スキャン完了。まだ黙って取れる情報も残っています。");
    })();

    /* --- 位置情報 (same user gesture as the reveal click) --- */
    (function geolocate() {
      const g = $("#geo-result");
      if (!navigator.geolocation) { g.innerHTML = "この端末は位置情報に非対応です。羨ましい。"; return; }
      g.innerHTML = "衛星に問い合わせ中…";
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          g.innerHTML = "緯度 <b>" + latitude.toFixed(5) + "</b> / 経度 <b>" + longitude.toFixed(5) +
            "</b> / 誤差±" + Math.round(accuracy) + "m<br>あなたの現在地まで、あと" +
            Math.round(accuracy) + "m。";
        },
        (err) => {
          g.innerHTML = err.code === 1
            ? "<b>拒否されました。</b>賢明です。本日初めての警戒心を確認しました。"
            : "取得失敗。衛星もあなたを見失ったようです。";
        },
        { timeout: 10000 });
    })();

    /* --- 追加開示: ボタンを押して初めて出る情報 --- */
    (function onDemand() {
      const host = $("#ws-extra");
      const add = (k, v, cls) => row(host, k, v, cls);

      async function xMedia() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          const ds = await navigator.mediaDevices.enumerateDevices();
          const labels = ds.filter(d => d.label).map(d => d.kind + ": " + d.label);
          stream.getTracks().forEach(t => t.stop());
          add("カメラ/マイク機種", labels.length ? esc(labels.join(" / ")) : "許可されましたがラベルは取れず");
        } catch (e) { add("カメラ/マイク機種", "拒否されました。正しい判断です。"); }
      }
      function xMotion() {
        return new Promise(async (res) => {
          try {
            if (typeof DeviceMotionEvent !== "undefined" && DeviceMotionEvent.requestPermission) {
              const p = await DeviceMotionEvent.requestPermission();
              if (p !== "granted") { add("傾きセンサー", "拒否されました。"); return res(); }
            }
            let done = false;
            const onO = (e) => {
              if (done) return; done = true;
              removeEventListener("deviceorientation", onO);
              add("方位（コンパス）", e.alpha != null ? Math.round(e.alpha) + "°" : "?");
              add("端末の傾き", "前後" + (e.beta != null ? Math.round(e.beta) : "?") + "° / 左右" + (e.gamma != null ? Math.round(e.gamma) : "?") + "°");
              res();
            };
            addEventListener("deviceorientation", onO);
            setTimeout(() => { if (!done) { done = true; removeEventListener("deviceorientation", onO); add("傾きセンサー", "反応なし"); res(); } }, 1500);
          } catch (e) { add("傾きセンサー", "取得失敗"); res(); }
        });
      }
      async function xScreen() {
        try {
          const s2 = await navigator.mediaDevices.getDisplayMedia({ video: true });
          const t = s2.getVideoTracks()[0], st = t.getSettings();
          add("共有された画面", (st.width || "?") + "×" + (st.height || "?") + " / " + (t.label ? esc(t.label) : "?"));
          s2.getTracks().forEach(x => x.stop());
        } catch (e) { add("画面共有", "キャンセルされました。賢明です。"); }
      }
      async function xBt() {
        try {
          const d = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
          add("Bluetooth機器", esc(d.name || "名称なし") + " / id:" + esc(String(d.id || "").slice(0, 12)));
        } catch (e) { add("Bluetooth機器", "選択されませんでした。"); }
      }
      async function xUsb() {
        try {
          const d = await navigator.usb.requestDevice({ filters: [] });
          add("USB機器", "vendor:0x" + d.vendorId.toString(16) + " / product:0x" + d.productId.toString(16) + (d.productName ? " / " + esc(d.productName) : ""));
        } catch (e) { add("USB機器", "選択されませんでした。"); }
      }
      async function xNotif() {
        try {
          const p = await Notification.requestPermission();
          add("通知許可", p === "granted" ? "許可" : p);
          if (p === "granted") try { new Notification("SUBJECT FILE", { body: "通知の権限、渡りました。" }); } catch (e) {}
        } catch (e) { add("通知", "失敗"); }
      }
      async function xIdle() {
        try {
          const p = await IdleDetector.requestPermission();
          if (p !== "granted") { add("在席検知", "拒否されました。"); return; }
          const d = new IdleDetector();
          await d.start({ threshold: 60000 });
          add("在席状況", "操作:" + d.userState + " / 画面:" + d.screenState);
        } catch (e) { add("在席検知", "失敗"); }
      }
      async function xContacts() {
        try {
          const list = await navigator.contacts.select(["name", "tel"], { multiple: true });
          add("選択された連絡先", list.length + "件" + (list.length ? "：一件でも渡せば十分でした" : ""));
        } catch (e) { add("連絡先", "選択されませんでした。"); }
      }
      function xVoices() {
        try {
          const vs = speechSynthesis.getVoices();
          if (!vs.length) { add("音声パック", "取得待ち。もう一度押してください"); return; }
          add("インストール音声", vs.length + "種: " + esc(vs.slice(0, 8).map(v => v.name).join(", ")) + (vs.length > 8 ? " …" : ""));
        } catch (e) { add("音声パック", "取得失敗"); }
      }

      const FN = { media: xMedia, motion: xMotion, screen: xScreen, bt: xBt, usb: xUsb, notif: xNotif, idle: xIdle, contacts: xContacts, voices: xVoices };
      const SUP = {
        media: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        motion: typeof DeviceOrientationEvent !== "undefined",
        screen: !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia),
        bt: !!navigator.bluetooth, usb: !!navigator.usb,
        notif: ("Notification" in window), idle: ("IdleDetector" in window),
        contacts: !!(navigator.contacts && navigator.contacts.select),
        voices: ("speechSynthesis" in window),
      };
      document.querySelectorAll("#ws-extra-btns [data-x]").forEach(btn => {
        const x = btn.dataset.x;
        if (!SUP[x]) { btn.disabled = true; btn.textContent += "（非対応）"; return; }
        btn.addEventListener("click", async () => {
          btn.disabled = true; btn.classList.add("used");
          window.Casino && window.Casino.sfx && window.Casino.sfx.flip();
          try { await FN[x](); } catch (e) {}
        });
      });
    })();

    /* --- 送信: 明示同意。押した情報だけが運営のDiscordへ --- */
    (function transmit() {
      const btn = $("#btn-send");
      if (!btn) return;

      function buildText() {
        const groups = [["身元", "ws-id"], ["端末", "ws-hw"], ["環境", "ws-env"],
          ["行動", "ws-be"], ["センサー", "ws-mob"], ["深層", "ws-deep"],
          ["追加", "ws-extra"], ["資産", "ws-as"]];
        const out = [];
        for (const [label, id] of groups) {
          const h = document.getElementById(id);
          if (!h || !h.children.length) continue;
          out.push("**" + label + "**");
          h.querySelectorAll(".w-row").forEach(r => {
            const k = r.querySelector(".wk").textContent;
            let v = r.querySelector(".wv").textContent;
            if (/クリップボード/.test(k)) v = "[プライバシー保護のため非送信]";
            out.push("・" + k + ": " + v);
          });
        }
        const g = document.getElementById("geo-result");
        if (g && !/照会中|非対応|拒否|失敗|押さない/.test(g.textContent))
          out.push("**位置**\n・" + g.textContent.replace(/\s+/g, " "));
        return out.join("\n");
      }

      btn.addEventListener("click", async () => {
        btn.disabled = true; btn.textContent = "送信中…";
        const text = buildText();
        try {
          const fd = new FormData();
          fd.append("payload_json", JSON.stringify({
            username: "SUBJECT FILE",
            embeds: [{
              title: "開示ログ // 自己申告",
              description: text.slice(0, 4000),
              footer: { text: (navigator.userAgent || "").slice(0, 90) }
            }]
          }));
          const res = await fetch(WEBHOOK, { method: "POST", body: fd });
          if (res.ok || res.status === 204) {
            btn.textContent = "送信済み // 手遅れ";
            window.Casino && window.Casino.sfx && window.Casino.sfx.coin();
            if (window.showToast) showToast("送信完了。運営のDiscordに届きました。");
          } else throw new Error("HTTP " + res.status);
        } catch (e) {
          btn.disabled = false; btn.textContent = "運営に送信する";
          if (window.showToast) showToast("送信失敗（ネットワーク/CORS）。");
        }
      });
    })();

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

  const revealBtn = $("#btn-reveal");
  if (revealBtn) revealBtn.addEventListener("click", () => {
    $("#watch-body").hidden = false;
    revealBtn.textContent = "開示済み // 手遅れ";
    revealBtn.disabled = true;
    window.Casino && window.Casino.sfx.flip();
    init();
  });
})();
