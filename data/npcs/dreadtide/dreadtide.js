/**
 * Dreadtide NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.dreadtide = {
    "id": "dreadtide",
    "name": "Dreadtide",
    "description": "Incarnation of catastrophic tidal forces churning the abyss.",
    "radius": 38,
    "speed": 180,
    "maxHp": 67000000000,
    "damage": 325000000,
    "attackRate": 0.37,
    "attackRange": 40,
    "killsAwarded": 41,
    "killstreakAwarded": 1250000,
    "respawnDelay": 9,
    "color": "#2563eb",
    "neutralColor": "#172554",
    "glowColor": "rgba(37, 99, 235, 0.65)",
    "massScale": 0.22,
    "shoveRatio": 0.28,
    "barWidth": 64,
    "barColor": "#2563eb"
};
})(window);
