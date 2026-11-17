/* V2: 2D-Animation (SVG) mit Motion. Die Fahrzeuge folgen den Gleichungen aus physik.js.
   Straße in der Draufsicht, Bahnstrecke in der Seitenansicht. Läuft in Schleife. */
(function () {
  const NS = "http://www.w3.org/2000/svg", W = 900, H = 300;
  const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const C = { gruen: "#23483e", rost: "#bd562d", creme: "#fce9d7", gelb: "#e2b04a", traktor: "#6b8f3a", reifen: "#262b28",
              glas: "#a9c9cc", gras: "#b9cf9f", gras2: "#a7c08b", asphalt: "#6f7672", weg: "#d6d2c4" };
  const BREITE = { auto: 1.8, lkw: 2.5, traktor: 2.4, motorrad: 0.8, bus: 2.5, kind: 0.6 };
  const LW = 40, YSPUR = 170, LAT = LW / 3.5;          // Spurbreite 3,5 m = 40 px
  let lauf = null;

  const mk = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const zufall = s => () => (s = (s * 16807) % 2147483647) / 2147483647;

  /* ---------- Fahrzeuge (lokal: Front bei x = 0, Fahrzeug liegt bei x < 0) ---------- */
  function draufsicht(typ, L, g) {
    const w = BREITE[typ] * LAT, h = w / 2, o = { g, licht: [] };
    if (typ === "auto") {
      mk("rect", { x: -L, y: -h, width: L, height: w, rx: 5, fill: C.gruen }, g);
      mk("rect", { x: -L * 0.62, y: -h + 2, width: L * 0.42, height: w - 4, rx: 3, fill: "#1b3831" }, g);
      mk("rect", { x: -L * 0.3, y: -h + 2.5, width: L * 0.1, height: w - 5, rx: 2, fill: C.glas }, g);
      mk("rect", { x: -L * 0.66, y: -h + 3, width: L * 0.06, height: w - 6, rx: 2, fill: C.glas }, g);
      for (const s of [-1, 1]) o.licht.push(mk("rect", { x: -L - 1, y: s * (h - 3.5) - 2.5, width: 3, height: 5, rx: 1, fill: "#5a1a10" }, g));
      for (const s of [-1, 1]) mk("rect", { x: -2, y: s * (h - 3.5) - 2, width: 2.5, height: 4, rx: 1, fill: "#fff6c8" }, g);
    } else if (typ === "lkw") {
      mk("rect", { x: -L, y: -h, width: L * 0.8, height: w, rx: 2, fill: C.rost }, g);
      mk("rect", { x: -L * 0.18, y: -h + 1, width: L * 0.18, height: w - 2, rx: 4, fill: "#8f3f1c" }, g);
      mk("rect", { x: -L * 0.06, y: -h + 3, width: L * 0.04, height: w - 6, rx: 2, fill: C.glas }, g);
      for (let i = 1; i < 5; i++) mk("line", { x1: -L + i * L * 0.16, y1: -h, x2: -L + i * L * 0.16, y2: h, stroke: "#a0471f", "stroke-width": 1 }, g);
    } else if (typ === "traktor") {
      const lt = L * 0.4;
      mk("rect", { x: -L, y: -h + 1, width: L - lt - 4, height: w - 2, rx: 2, fill: "#c9a46a" }, g);
      mk("line", { x1: -lt - 4, y1: 0, x2: -lt, y2: 0, stroke: "#555", "stroke-width": 2 }, g);
      for (const s of [-1, 1]) mk("rect", { x: -lt, y: s * h - (s > 0 ? 6 : 0), width: lt * 0.45, height: 6, rx: 2, fill: C.reifen }, g);
      for (const s of [-1, 1]) mk("rect", { x: -lt * 0.25, y: s * h - (s > 0 ? 4 : 0), width: lt * 0.2, height: 4, rx: 1, fill: C.reifen }, g);
      mk("rect", { x: -lt, y: -h + 5, width: lt, height: w - 10, rx: 3, fill: C.traktor }, g);
      mk("rect", { x: -lt * 0.95, y: -h + 6, width: lt * 0.4, height: w - 12, rx: 2, fill: "#4c6b28" }, g);
    } else if (typ === "motorrad") {
      mk("rect", { x: -L, y: -2.5, width: L, height: 5, rx: 2.5, fill: C.reifen }, g);
      mk("ellipse", { cx: -L * 0.45, cy: 0, rx: L * 0.3, ry: 5, fill: C.rost }, g);
      mk("circle", { cx: -L * 0.5, cy: 0, r: 4.5, fill: "#f2f2ee", stroke: "#333", "stroke-width": 1 }, g);
      mk("circle", { cx: -1, cy: 0, r: 1.8, fill: "#fff6c8" }, g);
    } else if (typ === "bus") {
      mk("rect", { x: -L, y: -h, width: L, height: w, rx: 4, fill: C.gelb }, g);
      for (let i = 0; i < 4; i++) mk("rect", { x: -L + 6 + i * L * 0.24, y: -h + 6, width: L * 0.12, height: w - 12, rx: 2, fill: "#f3d27e" }, g);
      mk("rect", { x: -4, y: -h + 2, width: 3, height: w - 4, rx: 1, fill: C.glas }, g);
    } else if (typ === "kind") {
      mk("ellipse", { cx: 0, cy: 0, rx: 6, ry: 8, fill: C.rost }, g);
      mk("rect", { x: -7, y: -5, width: 4, height: 10, rx: 2, fill: "#7a2e14" }, g);
      mk("circle", { cx: 1, cy: 0, r: 4.2, fill: "#f1c9a5" }, g);
      mk("path", { d: "M-2 -4 a4.2 4.2 0 0 1 6 0 v2 h-6z", fill: "#5b3a24" }, g);
    }
    return o;
  }

  function seitenansicht(typ, L, g) {
    const o = { g, licht: [], raeder: [] }, VH = 7.5;   // Höhenfaktor: Seitenansicht leicht überhöht
    const rad = (x, r) => { const k = mk("g", { transform: `translate(${x} ${-r})` }, g); mk("circle", { r, fill: C.reifen }, k); mk("line", { x1: -r * 0.7, y1: 0, x2: r * 0.7, y2: 0, stroke: "#8b918d", "stroke-width": 1.2 }, k); o.raeder.push({ k, x, r }); };
    if (typ === "zug") {
      const n = 3, lw = L / n;
      for (let i = 0; i < n; i++) {
        const x0 = -L + i * lw, h = 3.6 * VH;
        mk("rect", { x: x0 + 1, y: -h - 4, width: lw - 2, height: h, rx: i === n - 1 ? 9 : 3, fill: "#b8322a" }, g);
        mk("rect", { x: x0 + 1, y: -h - 4 + h * 0.62, width: lw - 2, height: h * 0.2, fill: C.creme }, g);
        for (let j = 0; j < 5; j++) mk("rect", { x: x0 + 5 + j * (lw - 10) / 5, y: -h + 1, width: (lw - 10) / 5 - 3, height: h * 0.32, rx: 1.5, fill: "#2c3e43" }, g);
        rad(x0 + lw * 0.18, 5); rad(x0 + lw * 0.82, 5);
      }
      o.funke = mk("g", { opacity: 0 }, g);
      for (const x of [-L * 0.06, -L * 0.94]) for (let k = 0; k < 4; k++) mk("line", { x1: x, y1: -1, x2: x - 4 - k * 2, y2: -3 - k * 2.5, stroke: "#ffb03a", "stroke-width": 1.4 }, o.funke);
    } else if (typ === "lok") {
      const h = 3.4 * VH;
      mk("rect", { x: -L, y: -h - 4, width: L, height: h * 0.62, rx: 2, fill: C.rost }, g);
      mk("rect", { x: -L * 0.32, y: -h - 4, width: L * 0.3, height: h, rx: 3, fill: "#a34921" }, g);
      mk("rect", { x: -L * 0.28, y: -h, width: L * 0.22, height: h * 0.28, rx: 1.5, fill: "#2c3e43" }, g);
      mk("rect", { x: -L, y: -h * 0.42 - 4, width: L, height: 3, fill: C.creme }, g);
      rad(-L * 0.8, 5); rad(-L * 0.55, 5); rad(-L * 0.18, 5);
    }
    return o;
  }

  /* ---------- Szene aufbauen ---------- */
  function baue(id, box) {
    const sz = window.SZENEN[id];
    box.className = "medien v2";
    box.innerHTML = `<div class="buehne"><div class="hud"></div></div><div class="zeile"><span class="txt"></span><button type="button">Pause</button></div>`;
    const buehne = box.querySelector(".buehne"), hud = box.querySelector(".hud"), txt = box.querySelector(".txt"), knopf = box.querySelector("button");
    const svg = mk("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "xMidYMid meet", role: "img", "aria-label": "Animation der Aufgabe" });
    buehne.prepend(svg);
    const k = W / sz.sicht.breite, rnd = zufall(id.length * 977 + 13);
    const welt = mk("g", {}, null), fz = {};
    let striche = [], baeume = [];

    if (sz.art === "schiene") {
      const def = mk("defs", {}, svg), lg = mk("linearGradient", { id: "himmel" + id, x1: 0, y1: 0, x2: 0, y2: 1 }, def);
      mk("stop", { offset: 0, "stop-color": "#dfeaf0" }, lg); mk("stop", { offset: 1, "stop-color": "#f6f1e3" }, lg);
      mk("rect", { width: W, height: H, fill: `url(#himmel${id})` }, svg);
      mk("path", { d: `M0 190 C150 140 260 170 380 150 S650 120 900 165 V300 H0Z`, fill: "#c7d8b4" }, svg);
      mk("path", { d: `M0 215 C200 190 420 205 600 192 S820 200 900 205 V300 H0Z`, fill: C.gras }, svg);
      for (let i = 0; i < 16; i++) { const x = rnd() * W, s = 0.6 + rnd() * 0.7, y = 196 + rnd() * 8; mk("rect", { x: x - 1.5, y: y - 14 * s, width: 3, height: 14 * s, fill: "#7b6a4f" }, svg); mk("circle", { cx: x, cy: y - 18 * s, r: 9 * s, fill: rnd() < 0.5 ? "#5f8a52" : "#4d7546" }, svg); }
      mk("rect", { x: 0, y: 226, width: W, height: 8, fill: "#9b8f78" }, svg);
      const sw = mk("g", {}, svg); for (let x = -40; x < 260; x += 2.2) striche.push({ e: mk("rect", { y: 228, width: 3, height: 5, fill: "#6e5a44" }, sw), x });
      mk("line", { x1: 0, y1: 226, x2: W, y2: 226, stroke: "#59605c", "stroke-width": 2 }, svg);
      svg.appendChild(welt);
      for (const ob of sz.objekte) { const g = mk("g", {}, welt); fz[ob.id] = Object.assign(seitenansicht(ob.typ, ob.L * k, g), { ob, y: 225 }); }
    } else {
      mk("rect", { width: W, height: H, fill: C.gras }, svg);
      mk("rect", { y: 214, width: W, height: H - 214, fill: C.gras2 }, svg);
      for (let x = -60; x < 520; x += 7 + rnd() * 9) baeume.push({ x, y: rnd() < 0.5 ? 40 + rnd() * 55 : 238 + rnd() * 50, r: 10 + rnd() * 9, f: rnd() });
      const bg = mk("g", {}, svg);
      baeume.forEach(b => { b.e = mk("g", {}, bg); mk("circle", { r: b.r, fill: b.f < 0.5 ? "#5f8a52" : "#4d7546" }, b.e); mk("circle", { cx: -b.r * 0.25, cy: -b.r * 0.25, r: b.r * 0.55, fill: "#7aa267", opacity: 0.6 }, b.e); });
      mk("rect", { y: YSPUR - 1.5 * LW, width: W, height: 2 * LW, fill: C.asphalt }, svg);
      mk("rect", { y: YSPUR + LW / 2, width: W, height: 24, fill: C.weg }, svg);
      for (const y of [YSPUR - 1.5 * LW + 3, YSPUR + LW / 2 - 3]) mk("line", { x1: 0, y1: y, x2: W, y2: y, stroke: "#f4f1e8", "stroke-width": 2 }, svg);
      const mitte = mk("line", { x1: 0, y1: YSPUR - LW / 2, x2: W, y2: YSPUR - LW / 2, stroke: "#f4f1e8", "stroke-width": 2.5, "stroke-dasharray": `${6 * k} ${12 * k}` }, svg);
      striche = [{ mitte }];
      svg.appendChild(welt);
      for (const ob of sz.objekte) { const g = mk("g", {}, welt); fz[ob.id] = Object.assign(draufsicht(ob.typ, ob.L * k, g), { ob }); }
    }
    const marke = mk("g", { opacity: 0 }, svg);
    mk("line", { x1: 0, y1: 50, x2: 0, y2: H - 18, stroke: C.rost, "stroke-width": 2, "stroke-dasharray": "6 5" }, marke);
    const mt = mk("text", { x: 6, y: H - 24, fill: C.rost, "font-size": 15, "font-weight": 700, "font-family": "system-ui,sans-serif" }, marke);
    let letzterText = "";

    function zeichne(t) {
      const z = sz.zustand(t), x0 = sz.sicht.mitte(t) - sz.sicht.breite / 2, px = x => (x - x0) * k;
      if (sz.art === "schiene") striche.forEach(s => s.e.setAttribute("x", px(s.x)));
      else {
        striche[0].mitte.setAttribute("stroke-dashoffset", (x0 * k) % (18 * k));
        baeume.forEach(b => b.e.setAttribute("transform", `translate(${px(b.x)} ${b.y})`));
      }
      for (const id2 in fz) {
        const v = fz[id2], x = z.x[id2], d = v.ob.dir;
        const y = sz.art === "schiene" ? v.y : YSPUR - z.spur[id2] * LW;
        v.g.setAttribute("transform", `translate(${px(x).toFixed(1)} ${y.toFixed(1)})${d < 0 ? " scale(-1 1)" : ""}`);
        v.licht.forEach(l => l.setAttribute("fill", z.bremst[id2] ? "#ff3b2f" : "#5a1a10"));
        if (v.raeder) v.raeder.forEach(r => r.k.setAttribute("transform", `translate(${r.x} ${-r.r}) rotate(${(x / (r.r / k) * 57.3 * d) % 360})`));
        if (v.funke) v.funke.setAttribute("opacity", z.bremst[id2] && t < sz.T - 0.05 ? (Math.sin(t * 40) > 0 ? 0.9 : 0.4) : 0);
      }
      if (z.marke) { marke.setAttribute("opacity", 1); marke.setAttribute("transform", `translate(${px(z.marke.x)} 0)`); mt.textContent = z.marke.text; } else marke.setAttribute("opacity", 0);
      hud.innerHTML = z.anzeige.map(a => `<span>${a}</span>`).join("");
      if (z.text !== letzterText) { letzterText = z.text; txt.textContent = z.text; window.Motion.animate(txt, { opacity: [0.2, 1] }, { duration: 0.3 }); }
    }

    zeichne(ruhig ? sz.T : 0);
    const steuer = window.Motion.animate(0, sz.T, { duration: sz.T, ease: "linear", repeat: Infinity, repeatDelay: sz.pause, onUpdate: zeichne });
    if (ruhig) { steuer.pause(); steuer.time = sz.T; knopf.textContent = "Abspielen"; }
    knopf.onclick = () => {
      if (knopf.textContent === "Pause") { steuer.pause(); knopf.textContent = "Weiter"; }
      else { steuer.play(); knopf.textContent = "Pause"; }
    };
    return steuer;
  }

  window.medien = (id, box) => { if (lauf) lauf.stop(); lauf = baue(id, box); };
  window.neuZeichnen && window.neuZeichnen();
})();
