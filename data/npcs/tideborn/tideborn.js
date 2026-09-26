/**
 * Tideborn NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.tideborn = {
    "id": "tideborn",
    "name": "Tideborn",
    "description": "Elemental aquatic sentinel formed from concentrated ocean currents.",
    "radius": 28,
    "speed": 165,
    "maxHp": 1350000000,
    "damage": 22000000,
    "attackRate": 0.48,
    "attackRange": 30,
    "killsAwarded": 23,
    "killstreakAwarded": 180000,
    "respawnDelay": 7,
    "color": "#0ea5e9",
    "neutralColor": "#0369a1",
    "glowColor": "rgba(14, 165, 233, 0.55)",
    "massScale": 0.4,
    "shoveRatio": 0.45,
    "barWidth": 52,
    "barColor": "#0ea5e9"
};
})(window);
