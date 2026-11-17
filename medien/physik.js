/* Gemeinsame Bewegungsgleichungen für V2 (2D) und V3 (3D).
   Längen in m, Zeiten in s. x ist immer die FRONT eines Fahrzeugs.
   dir = +1: fährt nach rechts (+x), belegt [x − L, x].  dir = −1: fährt nach links, belegt [x, x + L].
   spur: 0 = eigene Spur, 1 = Gegenspur (auf der Straße), Werte dazwischen beim Spurwechsel. */
(function () {
  const f = (v, n) => v.toLocaleString("de-DE", { minimumFractionDigits: n, maximumFractionDigits: n });
  const kmh = v => v * 3.6;
  const glatt = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);

  const V0_KIND = -7 + Math.sqrt(609);          // 17,68 m/s: gerade noch Stillstand vor dem Kind
  const T_STOP_KIND = 1 + V0_KIND / 7;

  window.SZENEN = {
    zug: {
      T: 10, pause: 2.5, art: "schiene",
      sicht: { breite: 270, mitte: () => 65 },
      objekte: [
        { id: "zug", typ: "zug", L: 60, dir: 1 },
        { id: "lok", typ: "lok", L: 14, dir: -1 }
      ],
      zustand(t) {
        const v = 20 - 1.2 * t;
        return {
          x: { zug: 20 * t - 0.6 * t * t, lok: 180 - 4 * t },
          spur: { zug: 0, lok: 0 },
          bremst: { zug: true, lok: false },
          anzeige: [`t = ${f(t, 1)} s`, `Zug ${f(kmh(v), 0)} km/h`, `Lok 14 km/h`],
          text: t >= this.T - 1e-6 ? "Zusammenstoß nach 10 s bei x = 140 m. Der Zug fährt noch 28,8 km/h." : "Schnellbremsung: a = −1,2 m/s²",
          marke: t >= this.T - 1e-6 ? { x: 140, text: "x = 140 m" } : null
        };
      }
    },

    lkw: {
      T: 10 - Math.sqrt(20), pause: 2.5, art: "strasse",
      sicht: { breite: 110, mitte: t => 40 + 20 * t - 15 },
      objekte: [
        { id: "auto", typ: "auto", L: 4.5, dir: 1 },
        { id: "lkw", typ: "lkw", L: 16, dir: 1 }
      ],
      zustand(t) {
        const xa = 30 * t - 0.5 * t * t, xl = 40 + 20 * t + 16;
        const ende = t >= this.T - 1e-6;
        return {
          x: { auto: xa, lkw: xl },
          spur: { auto: 0, lkw: 0 },
          bremst: { auto: true, lkw: false },
          anzeige: [`t = ${f(t, 2)} s`, `Auto ${f(kmh(30 - t), 0)} km/h`, `Abstand ${f(Math.max(0, xl - 16 - xa), 1)} m`],
          text: ende ? "Auffahrunfall nach 5,53 s. Das Auto ist noch 16 km/h schneller als der Lkw." : "Bremsen auf nassem Laub: a = −1 m/s²",
          marke: null
        };
      }
    },

    ueberholen: {
      T: 4.5, pause: 3.5, art: "strasse",
      sicht: { breite: 105, mitte: t => 15 * t + t * t + 36 },
      objekte: [
        { id: "auto", typ: "auto", L: 4.5, dir: 1 },
        { id: "traktor", typ: "traktor", L: 10, dir: 1 },
        { id: "motorrad", typ: "motorrad", L: 2.2, dir: -1 }
      ],
      zustand(t) {
        const xa = 15 * t + t * t, xm = 225 - 25 * t;
        const ende = t >= this.T - 1e-6;
        return {
          x: { auto: xa, traktor: 16 + 15 * t, motorrad: xm },
          spur: { auto: glatt(t / 1.4), traktor: 0, motorrad: 1 },
          bremst: { auto: false, traktor: false, motorrad: false },
          anzeige: [`t = ${f(t, 1)} s`, `Auto ${f(kmh(15 + 2 * t), 0)} km/h`, `Abstand Motorrad ${f(xm - xa, 0)} m`],
          text: ende ? "Stopp! In 0,5 s träfen sich Auto und Motorrad bei x = 100 m. Das Überholen dauert aber 6,3 s." : "Vollgas: a = (3000 N − 500 N) : 1250 kg = 2 m/s²",
          marke: { x: 100, text: "Treffpunkt nach 5 s" }
        };
      }
    },

    kind: {
      T: T_STOP_KIND, pause: 2.5, art: "strasse",
      sicht: { breite: 72, mitte: () => 27 },
      objekte: [
        { id: "auto", typ: "auto", L: 4.5, dir: 1 },
        { id: "bus", typ: "bus", L: 12, dir: 1 },
        { id: "kind", typ: "kind", L: 0.5, dir: 1 }
      ],
      zustand(t) {
        const v0 = V0_KIND;
        const x = t < 1 ? v0 * t : v0 + v0 * (t - 1) - 3.5 * (t - 1) ** 2;
        const v = t < 1 ? v0 : Math.max(0, v0 - 7 * (t - 1));
        const ende = t >= this.T - 1e-6;
        return {
          x: { auto: x, bus: 55, kind: 41.4 },
          // Bus parkt am Rand (−0.75), das Kind tritt vor dem Bus auf die Fahrbahn
          spur: { auto: 0, bus: -0.78, kind: -0.95 + 0.75 * glatt(t / 0.9) },
          bremst: { auto: t >= 1, bus: false, kind: false },
          anzeige: [`t = ${f(t, 2)} s`, `Auto ${f(kmh(v), 0)} km/h`, t < 1 ? "Reaktion" : ende ? "Stillstand" : "Bremsen"],
          text: ende ? "Mit 63,6 km/h kommt das Auto gerade noch vor dem Kind zum Stehen." : t < 1 ? "Reaktionszeit 1,0 s: Das Auto fährt ungebremst weiter." : "Vollbremsung: a = −7 m/s²",
          marke: { x: 40, text: "40 m" }
        };
      }
    }
  };
})();
