/* 0rnot // visits.js — 全訪問者の累計カウンター (Abacus, CORS対応) */
(() => {
  "use strict";
  const el = document.getElementById("visit-count");
  if (!el) return;

  const NS = "0rnot-com", KEY = "visits";
  const fmt = (n) => Number(n).toLocaleString("en-US");
  const show = (n) => { el.innerHTML = "VISITORS <b>" + fmt(n) + "</b>"; };

  // 同一セッション内の再読み込みでは増やさない（GETのみ）
  let counted = false;
  try { counted = sessionStorage.getItem("visited77") === "1"; } catch (e) {}
  const path = counted ? "get" : "hit";

  fetch("https://abacus.jasoncameron.dev/" + path + "/" + NS + "/" + KEY)
    .then(r => r.json())
    .then(j => {
      if (j && typeof j.value === "number") show(j.value);
      try { sessionStorage.setItem("visited77", "1"); } catch (e) {}
    })
    .catch(() => { el.textContent = ""; }); // 失敗時は静かに消す
})();
