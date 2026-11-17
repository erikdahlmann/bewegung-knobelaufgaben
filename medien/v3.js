/* V3: kleiner 3D-Film in WebGL (Three.js r186, lokal). Die Fahrzeuge folgen physik.js.
   Koordinaten: x entlang der Strecke (m), y nach oben, z quer. Eigene Spur bei z = +1,75. */
import * as THREE from "./lib/three.module.js";

const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;
const SPUR = 3.5, ZEIGEN = { zug: 0 };
let renderer = null, lauf = null;

const mat = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.75, metalness: 0.05 }, o));
const M = {
  gruen: mat(0x23483e), rost: mat(0xbd562d), dunkelrost: mat(0x8f3f1c), creme: mat(0xfce9d7), rot: mat(0xb8322a),
  gelb: mat(0xe2b04a), traktor: mat(0x6b8f3a), reifen: mat(0x222622, { roughness: 0.9 }), glas: mat(0x2c3e43, { roughness: 0.25, metalness: 0.3 }),
  haut: mat(0xf1c9a5), holz: mat(0x7b6a4f), blatt: mat(0x557f4b), blatt2: mat(0x6d9a59), schiene: mat(0x8a9095, { metalness: 0.6, roughness: 0.4 }),
  schwelle: mat(0x6e5a44), asphalt: mat(0x5d6461, { roughness: 0.95 }), weg: mat(0xd6d2c4), gras: mat(0x9fbf84, { roughness: 1 }),
  weiss: mat(0xf4f1e8), schotter: mat(0x9b8f78, { roughness: 1 })
};
function box(w, h, d, m, x = 0, y = 0, z = 0, p) { const e = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); e.position.set(x, y, z); e.castShadow = e.receiveShadow = true; if (p) p.add(e); return e; }
function rad(r, b, m, x, y, z, p) { const e = new THREE.Mesh(new THREE.CylinderGeometry(r, r, b, 18), m); e.rotation.x = Math.PI / 2; e.position.set(x, y, z); e.castShadow = true; p.add(e); return e; }

/* Fahrzeuge: lokale Front bei x = 0, Fahrzeug reicht nach −x. Gibt { g, raeder, licht } zurück. */
function fahrzeug(typ, L) {
  const g = new THREE.Group(), raeder = [], licht = [];
  const R = (r, b, x, z, y = r) => raeder.push(rad(r, b, M.reifen, x, y, z, g));
  if (typ === "zug") {
    const n = 3, lw = L / n;
    for (let i = 0; i < n; i++) {
      const x0 = -L + i * lw + lw / 2;
      box(lw - 0.8, 3.0, 2.9, M.rot, x0, 2.4, 0, g);
      box(lw - 0.8, 0.6, 2.92, M.creme, x0, 2.0, 0, g);
      box(lw - 2, 0.9, 2.95, M.glas, x0, 3.0, 0, g);
      box(lw - 1, 0.3, 2.6, M.dunkelrost, x0, 4.05, 0, g);
      for (const dx of [-lw * 0.33, lw * 0.33]) for (const dz of [-0.75, 0.75]) R(0.45, 0.25, x0 + dx, dz * 1.0, 0.45);
    }
    box(1.2, 2.0, 2.6, M.glas, -0.7, 3.0, 0, g);
  } else if (typ === "lok") {
    box(L * 0.65, 2.0, 2.8, M.rost, -L * 0.62, 1.9, 0, g);
    box(L * 0.3, 3.4, 2.9, M.rost, -L * 0.17, 2.6, 0, g);
    box(L * 0.31, 0.9, 2.95, M.glas, -L * 0.17, 3.4, 0, g);
    box(L, 0.25, 2.9, M.creme, -L / 2, 1.0, 0, g);
    for (const x of [-L * 0.85, -L * 0.6, -L * 0.18]) for (const dz of [-0.75, 0.75]) R(0.5, 0.25, x, dz, 0.5);
  } else if (typ === "auto") {
    box(L, 0.75, 1.8, M.gruen, -L / 2, 0.65, 0, g);
    box(L * 0.5, 0.6, 1.6, M.gruen, -L * 0.55, 1.3, 0, g);
    box(L * 0.52, 0.45, 1.64, M.glas, -L * 0.55, 1.3, 0, g);
    for (const x of [-L * 0.2, -L * 0.8]) for (const dz of [-0.85, 0.85]) R(0.33, 0.25, x, dz);
    for (const dz of [-0.65, 0.65]) { const l = box(0.06, 0.18, 0.35, new THREE.MeshStandardMaterial({ color: 0x5a1a10, emissive: 0x000000 }), -L - 0.01, 0.8, dz, g); licht.push(l); }
    for (const dz of [-0.6, 0.6]) box(0.06, 0.15, 0.3, new THREE.MeshStandardMaterial({ color: 0xfff6c8, emissive: 0x665f40 }), 0.01, 0.75, dz, g);
  } else if (typ === "lkw") {
    box(L * 0.8, 3.2, 2.5, M.rost, -L * 0.6, 2.2, 0, g);
    box(L * 0.17, 2.6, 2.45, M.dunkelrost, -L * 0.09, 1.9, 0, g);
    box(L * 0.05, 0.9, 2.3, M.glas, -L * 0.02, 2.5, 0, g);
    for (const x of [-L * 0.95, -L * 0.85, -L * 0.45, -L * 0.07]) for (const dz of [-1.05, 1.05]) R(0.5, 0.35, x, dz);
  } else if (typ === "traktor") {
    box(4.2, 1.0, 2.2, M.holz, -L + 2.4, 1.0, 0, g);
    box(4.2, 0.6, 0.08, M.holz, -L + 2.4, 1.6, 1.08, g); box(4.2, 0.6, 0.08, M.holz, -L + 2.4, 1.6, -1.08, g);
    for (const dz of [-1.0, 1.0]) R(0.4, 0.3, -L + 2.4, dz);
    box(2.2, 0.9, 1.1, M.traktor, -1.4, 1.1, 0, g);
    box(1.3, 1.3, 1.3, M.glas, -3.0, 1.85, 0, g);
    box(1.4, 0.12, 1.5, M.traktor, -3.0, 2.55, 0, g);
    for (const dz of [-0.95, 0.95]) R(0.8, 0.45, -3.1, dz);
    for (const dz of [-0.85, 0.85]) R(0.45, 0.3, -0.6, dz);
  } else if (typ === "motorrad") {
    box(L * 0.6, 0.35, 0.35, M.rost, -L * 0.5, 0.75, 0, g);
    R(0.33, 0.12, -0.35, 0); R(0.33, 0.12, -L + 0.35, 0);
    const k = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.5, 4, 8), M.gruen); k.position.set(-L * 0.55, 1.35, 0); k.rotation.z = 0.35; k.castShadow = true; g.add(k);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), M.weiss); h.position.set(-L * 0.45, 1.85, 0); h.castShadow = true; g.add(h);
  } else if (typ === "bus") {
    box(L, 2.6, 2.5, M.gelb, -L / 2, 1.7, 0, g);
    box(L - 1.5, 0.9, 2.53, M.glas, -L / 2 - 0.3, 2.2, 0, g);
    box(0.06, 1.3, 2.2, M.glas, 0.01, 2.0, 0, g);
    for (const x of [-L * 0.82, -L * 0.18]) for (const dz of [-1.05, 1.05]) R(0.5, 0.3, x, dz);
  } else if (typ === "kind") {
    const k = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.5, 4, 8), M.rost); k.position.y = 0.6; k.castShadow = true; g.add(k);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10), M.haut); h.position.y = 1.12; h.castShadow = true; g.add(h);
    box(0.14, 0.32, 0.26, M.dunkelrost, -0.18, 0.75, 0, g);
  }
  return { g, raeder, licht };
}

function baum(p, x, z, s) {
  const t = new THREE.Group();
  const st = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * s, 0.22 * s, 1.6 * s, 8), M.holz); st.position.y = 0.8 * s; st.castShadow = true; t.add(st);
  const k = new THREE.Mesh(new THREE.ConeGeometry(1.4 * s, 3.4 * s, 9), Math.random() < 0.5 ? M.blatt : M.blatt2); k.position.y = 3.0 * s; k.castShadow = true; t.add(k);
  t.position.set(x, 0, z); p.add(t);
}

function szene(id, sz) {
  const s = new THREE.Scene();
  s.background = new THREE.Color(0xdfeaf0);
  s.fog = new THREE.Fog(0xdfeaf0, 120, 420);
  s.add(new THREE.HemisphereLight(0xf6f3ea, 0x7d8f6c, 1.4));
  const sonne = new THREE.DirectionalLight(0xfff1dc, 2.2);
  sonne.position.set(60, 90, 50); sonne.castShadow = true;
  sonne.shadow.mapSize.set(2048, 2048);
  Object.assign(sonne.shadow.camera, { left: -140, right: 140, top: 60, bottom: -60, near: 1, far: 300 });
  s.add(sonne); s.add(sonne.target);
  const boden = new THREE.Mesh(new THREE.PlaneGeometry(1400, 600), M.gras); boden.rotation.x = -Math.PI / 2; boden.position.x = 150; boden.receiveShadow = true; s.add(boden);
  const zufall = (() => { let q = id.length * 7919; return () => (q = (q * 16807) % 2147483647) / 2147483647; })();

  if (sz.art === "schiene") {
    box(700, 0.3, 4, M.schotter, 150, 0.15, 0, s).castShadow = false;
    for (const z of [-0.72, 0.72]) box(700, 0.15, 0.08, M.schiene, 150, 0.45, z, s);
    const sw = new THREE.InstancedMesh(new THREE.BoxGeometry(0.25, 0.12, 2.4), M.schwelle, 1000);
    const m4 = new THREE.Matrix4(); for (let i = 0; i < 1000; i++) { m4.makeTranslation(-200 + i * 0.7, 0.33, 0); sw.setMatrixAt(i, m4); } sw.receiveShadow = true; s.add(sw);
    for (let i = 0; i < 70; i++) { const x = -80 + zufall() * 330, z = (zufall() < 0.5 ? -1 : 1) * (8 + zufall() * 50); baum(s, x, z, 0.8 + zufall() * 0.9); }
  } else {
    box(900, 0.04, 2 * SPUR + 0.6, M.asphalt, 200, 0.02, 0, s).castShadow = false;
    box(900, 0.15, 2.4, M.weg, 200, 0.075, SPUR + 1.5, s).castShadow = false;
    for (const z of [-SPUR + 0.1, SPUR - 0.1]) box(900, 0.01, 0.12, M.weiss, 200, 0.05, z, s).castShadow = false;
    const st = new THREE.InstancedMesh(new THREE.BoxGeometry(6, 0.01, 0.14), M.weiss, 60);
    const m4 = new THREE.Matrix4(); for (let i = 0; i < 60; i++) { m4.makeTranslation(-200 + i * 18, 0.05, 0); st.setMatrixAt(i, m4); } s.add(st);
    for (let i = 0; i < 90; i++) { const x = -100 + zufall() * 500, z = (zufall() < 0.5 ? -1 : 1) * (13 + zufall() * 40); baum(s, x, z, 0.7 + zufall() * 0.8); }
  }

  const fz = {};
  for (const ob of sz.objekte) {
    const f = fahrzeug(ob.typ, ob.L);
    if (ob.dir < 0) f.g.rotation.y = Math.PI;
    s.add(f.g); fz[ob.id] = Object.assign(f, { ob });
  }
  // Markierung (Treffpunkt / 40 m)
  const marke = new THREE.Group();
  const pf = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 6, 8), mat(0xbd562d, { emissive: 0x3a1206 })); pf.position.y = 3; marke.add(pf);
  const fa = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 0.05), mat(0xf5a563, { emissive: 0x3a2206 })); fa.position.set(0.8, 5.4, 0); marke.add(fa);
  marke.visible = false; s.add(marke);
  return { s, fz, marke, sonne };
}

const KAMERA = {
  zug: (z, t) => ({ pos: [z.x.zug - 55 + Math.sin(t * 0.3) * 4, 13, 34], ziel: [z.x.zug + 70, 1, -4] }),
  lkw: z => ({ pos: [z.x.auto - 16, 6.5, 11], ziel: [z.x.auto + 22, 1, -1] }),
  ueberholen: z => ({ pos: [z.x.auto - 17, 9, 3], ziel: [z.x.auto + 16, 0, -1] }),
  kind: (z, t) => ({ pos: [19 + Math.sin(t * 0.4) * 1.5, 4.2, 11], ziel: [38, 0.6, 2] })
};

function baue(id, box) {
  const sz = window.SZENEN[id];
  box.className = "medien v3";
  box.innerHTML = `<div class="buehne"><div class="hud"></div></div><div class="zeile"><span class="txt"></span><button type="button">Pause</button></div>`;
  const buehne = box.querySelector(".buehne"), hud = box.querySelector(".hud"), txt = box.querySelector(".txt"), knopf = box.querySelector("button");
  try {
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
  } catch (e) {
    buehne.innerHTML = `<div class="fehler">Dieses Gerät kann kein WebGL anzeigen. Die Skizze unten zeigt dieselbe Situation.</div>`; return null;
  }
  buehne.prepend(renderer.domElement);
  const { s, fz, marke, sonne } = szene(id, sz);
  const kam = new THREE.PerspectiveCamera(40, 16 / 7, 0.5, 900);
  const groesse = () => { const w = buehne.clientWidth, h = buehne.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); kam.aspect = w / h; kam.updateProjectionMatrix(); };
  const ro = new ResizeObserver(groesse); ro.observe(buehne); groesse();

  let laeuft = !ruhig, zeit = ruhig ? sz.T : 0, alt = performance.now(), letzterText = "", aktiv = true;
  knopf.textContent = laeuft ? "Pause" : "Abspielen";
  knopf.onclick = () => { laeuft = !laeuft; knopf.textContent = laeuft ? "Pause" : "Weiter"; };

  function bild(jetzt) {
    if (!aktiv) return;
    const dt = Math.min(0.05, (jetzt - alt) / 1000); alt = jetzt;
    if (laeuft) zeit = (zeit + dt) % (sz.T + sz.pause);
    const t = Math.min(zeit, sz.T), z = sz.zustand(t);
    for (const k in fz) {
      const v = fz[k], d = v.ob.dir, sp = z.spur[k];
      // Spur 0 = eigene Spur (z = +1,75), 1 = Gegenspur (z = −1,75); Schiene: z = 0
      const zz = sz.art === "schiene" ? 0 : SPUR / 2 - sp * SPUR;
      v.g.position.set(z.x[k], sz.art === "schiene" ? 0.5 : 0, zz);
      if (v.ob.typ === "auto" && id === "ueberholen") v.g.rotation.y = -0.22 * Math.sin(Math.PI * Math.min(1, t / 1.4)) * (t < 1.4 ? 1 : 0);
      v.raeder.forEach(r => { r.rotation.y = -(z.x[k] / 0.4) * d; });
      v.licht.forEach(l => l.material.emissive.setHex(z.bremst[k] ? 0xff2a1a : 0x000000));
    }
    if (z.marke) { marke.visible = true; marke.position.set(z.marke.x, 0, sz.art === "schiene" ? -2.5 : -SPUR - 0.6); } else marke.visible = false;
    const c = KAMERA[id](z, t);
    kam.position.set(...c.pos); kam.lookAt(...c.ziel);
    sonne.position.set(c.ziel[0] + 60, 90, 50); sonne.target.position.set(c.ziel[0], 0, 0);
    renderer.render(s, kam);
    hud.innerHTML = z.anzeige.map(a => `<span>${a}</span>`).join("");
    if (z.text !== letzterText) { letzterText = z.text; txt.textContent = z.text; }
    requestAnimationFrame(bild);
  }
  requestAnimationFrame(bild);
  return { stop() { aktiv = false; ro.disconnect(); s.traverse(o => { if (o.geometry) o.geometry.dispose(); }); } };
}

window.medien = (id, box) => { if (lauf) lauf.stop(); lauf = baue(id, box); };
window.neuZeichnen && window.neuZeichnen();
