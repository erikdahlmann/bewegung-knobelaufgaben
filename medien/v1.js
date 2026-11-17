/* V1: zu jeder Aufgabe ein Bild (ChatGPT, eingebautes Bildwerkzeug über Codex). */
(function () {
  const ALT = {
    zug: "Regionalzug bremst auf eingleisiger Strecke, weiter vorn kommt eine Rangierlok entgegen.",
    lkw: "Auto bremst auf nasser, laubbedeckter Straße hinter einem Lkw.",
    ueberholen: "Auto schert hinter einem Traktor zum Überholen aus, in der Ferne kommt ein Motorrad entgegen.",
    kind: "Kind tritt vor einem haltenden Bus auf die Straße, ein Auto bremst."
  };
  window.medien = (id, box) => {
    box.className = "medien v1";
    box.innerHTML = `<img src="../medien/bilder/${id}.webp" alt="${ALT[id]}" loading="lazy" width="1400" height="933">
      <div class="zeile"><span>${ALT[id]}</span><span class="quelle">Bild: KI-generiert (ChatGPT), stilisiert</span></div>`;
  };
  window.neuZeichnen && window.neuZeichnen();
})();
