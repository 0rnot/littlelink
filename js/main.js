/* 0rnot // main.js — tabs, HUD, rain, clipboard */
(() => {
  "use strict";

  /* ---------- tabs (hash routing) ---------- */
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const panels = Array.from(document.querySelectorAll(".panel"));

  function activate(id, push) {
    tabs.forEach(t => t.setAttribute("aria-selected", String(t.dataset.panel === id)));
    panels.forEach(p => p.classList.toggle("active", p.id === "panel-" + id));
    if (push) history.replaceState(null, "", "#" + id);
    document.dispatchEvent(new CustomEvent("panelchange", { detail: id }));
  }
  tabs.forEach(t => t.addEventListener("click", () => activate(t.dataset.panel, true)));
  window.addEventListener("hashchange", () => {
    const id = location.hash.slice(1);
    if (panels.some(p => p.id === "panel-" + id)) activate(id, false);
  });
  activate(location.hash === "#game" ? "game" : "links", false);

  /* ---------- HUD clock + fake telemetry ---------- */
  const clock = document.getElementById("hud-clock");
  const hex = document.getElementById("hud-hex");
  const sys = document.getElementById("sys-line");
  const boot = performance.now();
  function pad(n) { return String(n).padStart(2, "0"); }
  setInterval(() => {
    const d = new Date();
    if (clock) clock.textContent =
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
      `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} JST`;
    if (hex) hex.textContent = "0x" + Math.floor(Math.random() * 0xffff)
      .toString(16).toUpperCase().padStart(4, "0");
    if (sys) {
      const up = Math.floor((performance.now() - boot) / 1000);
      sys.textContent = `UPTIME ${pad(Math.floor(up / 60))}:${pad(up % 60)} // MEM OK // HOPE N/A`;
    }
  }, 1000);

  /* ---------- toast ---------- */
  const toast = document.getElementById("toast");
  let toastTimer;
  window.showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  };

  /* ---------- clipboard chips ---------- */
  function copy(text, msg) {
    const done = () => showToast(msg);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallback(text, done));
    } else fallback(text, done);
  }
  function fallback(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.focus(); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { console.error(e); }
    document.body.removeChild(ta);
  }
  document.querySelectorAll("[data-copy]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      copy(el.dataset.copy, el.dataset.copyMsg || "COPIED");
    });
  });

  /* ---------- background rain (monochrome, subtle) ---------- */
  const canvas = document.getElementById("fx-rain");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (canvas && !reduced) {
    const ctx = canvas.getContext("2d");
    const GLYPHS = "01｜/\\_.:¦†<>[]{}=+*#";
    let cols = [], fs = 14, W = 0, H = 0, raf;

    function resize() {
      W = canvas.width = innerWidth * devicePixelRatio;
      H = canvas.height = innerHeight * devicePixelRatio;
      canvas.style.width = innerWidth + "px";
      canvas.style.height = innerHeight + "px";
      fs = (innerWidth < 480 ? 12 : 14) * devicePixelRatio;
      const n = Math.floor(W / (fs * 2.2)); // sparse columns
      cols = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        v: (0.4 + Math.random() * 1.1) * devicePixelRatio,
        s: Math.random() < .5 ? 1 : 0
      }));
    }
    resize();
    addEventListener("resize", resize);

    let last = 0;
    function tick(t) {
      raf = requestAnimationFrame(tick);
      if (t - last < 50) return; // ~20fps is plenty; save battery
      last = t;
      ctx.fillStyle = "rgba(5,5,5,0.18)";
      ctx.fillRect(0, 0, W, H);
      ctx.font = fs + "px monospace";
      for (const c of cols) {
        ctx.fillStyle = c.s ? "rgba(180,180,180,0.30)" : "rgba(90,90,90,0.28)";
        ctx.fillText(GLYPHS[Math.random() * GLYPHS.length | 0], c.x, c.y);
        c.y += c.v * 14;
        if (c.y > H + fs) { c.y = -fs; c.x = Math.random() * W; }
      }
    }
    raf = requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(tick);
    });
  }

  /* ---------- console ---------- */
  console.log("%c0RNOT :: MONOCHROME BUILD", "color:#fff;background:#000;padding:4px 10px;border:1px solid #fff;font-family:monospace;");
  console.log("%cSYSTEM SECURED. WHAT ARE YOU LOOKING AT?", "color:#888;font-size:12px;font-family:monospace;");
})();
