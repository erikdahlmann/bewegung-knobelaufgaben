# Knifflige Bewegungsaufgaben · Physik EF

Vier anspruchsvolle Sachaufgaben zur gleichmäßig beschleunigten Bewegung: Beschleunigung aus F = m·a, zwei Fahrzeuge (eines beschleunigt oder bremst, eines gleichförmig), am Ende jeweils eine quadratische Gleichung, teils mit Substitution. Pro Aufgabe drei gestufte Tipps: Ansatz, Lösungsskizze, gerechnete Lösung.

Fassungen:
- `index.html` – mit Skizzen
- `v1/` – zusätzlich ein Bild je Aufgabe (KI-generiert mit ChatGPT)
- `v2/` – zusätzlich eine 2D-Animation (SVG, Motion 14.12.0), Fahrzeuge folgen den Bewegungsgleichungen
- `v3/` – zusätzlich ein 3D-Film (WebGL, Three.js r186)

`python3 build.py` baut v1–v3 aus `index.html`. Bewegungsgleichungen für V2 und V3 in `medien/physik.js`. Bibliotheken lokal in `medien/lib/` (MIT-Lizenz).

Live: https://dm-pkg.de/bewegung-knobelaufgaben/
