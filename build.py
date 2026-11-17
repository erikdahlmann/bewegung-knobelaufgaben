#!/usr/bin/env python3
"""Baut aus index.html die drei Fassungen v1/ (Bild), v2/ (2D-Animation) und v3/ (3D-Film).

Aufruf: python3 build.py
Die Hauptseite index.html bleibt die Quelle für Text, Aufgaben und Tipps.
Jede Fassung lädt zusätzlich medien/medien.css und ihr Skript aus medien/.
"""
import pathlib, re, hashlib

ROOT = pathlib.Path(__file__).resolve().parent
QUELLE = (ROOT / "index.html").read_text(encoding="utf-8")

FASSUNG = {
    1: ("V1 Bild", '<script src="../medien/v1.js"></script>'),
    2: ("V2 Animation", '<script src="../medien/lib/motion.js"></script>\n'
                        '<script src="../medien/physik.js"></script>\n'
                        '<script src="../medien/v2.js"></script>'),
    3: ("V3 3D-Film", '<script src="../medien/physik.js"></script>\n'
                      '<script type="module" src="../medien/v3.js"></script>'),
}

for n, (name, skripte) in FASSUNG.items():
    s = QUELLE
    s = s.replace("<title>Knifflige Bewegungsaufgaben · Physik EF</title>",
                  f"<title>Knifflige Bewegungsaufgaben ({name}) · Physik EF</title>", 1)
    s = s.replace("</head>", '<link rel="stylesheet" href="../medien/medien.css">\n</head>', 1)
    s = s.replace('data-fassung="0"', f'data-fassung="{n}"', 1)
    # Umschalter: Pfade relativ zur Unterseite
    s = re.sub(r'(<div class="fassung"[^>]*>.*?</div>)',
               lambda m: m.group(1).replace('href="./', 'href="../'), s, count=1, flags=re.S)
    s = s.replace("</body>", skripte + "\n</body>", 1)
    # Versionsnummer je Datei, damit Browser nach Änderungen nicht die alte Fassung zeigen
    s = re.sub(r'(src|href)="\.\./(medien/[^"?]+)"',
               lambda m: f'{m.group(1)}="../{m.group(2)}?v={hashlib.md5((ROOT / m.group(2)).read_bytes()).hexdigest()[:8]}"', s)
    ziel = ROOT / f"v{n}" / "index.html"
    ziel.parent.mkdir(exist_ok=True)
    ziel.write_text(s, encoding="utf-8")
    print("gebaut:", ziel.relative_to(ROOT))
