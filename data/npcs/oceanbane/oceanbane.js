/**
 * Oceanbane NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.oceanbane = {
    "id": "oceanbane",
    "name": "Oceanbane",
    "description": "Living nightmare of the seas whose wake devours all marine life.",
    "radius": 50,
    "speed": 185,
    "maxHp": 760000000000,
    "damage": 1800000000,
    "attackRate": 0.31,
    "attackRange": 52,
    "killsAwarded": 50,
    "killstreakAwarded": 3900000,
    "respawnDelay": 10.5,
    "color": "#ef4444",
    "neutralColor": "#450a0a",
    "glowColor": "rgba(239, 68, 68, 0.75)",
    "massScale": 0.1,
    "shoveRatio": 0.15,
    "barWidth": 80,
    "barColor": "#ef4444"
};
})(window);
