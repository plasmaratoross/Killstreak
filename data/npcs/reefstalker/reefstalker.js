/**
 * Reefstalker NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.reefstalker = {
    "id": "reefstalker",
    "name": "Reefstalker",
    "description": "Camouflaged marine predator that ambushes targets from reef shadows.",
    "radius": 26,
    "speed": 160,
    "maxHp": 520000000,
    "damage": 11500000,
    "attackRate": 0.65,
    "attackRange": 28,
    "killsAwarded": 19,
    "killstreakAwarded": 115000,
    "respawnDelay": 7,
    "color": "#10b981",
    "neutralColor": "#064e3b",
    "glowColor": "rgba(16, 185, 129, 0.50)",
    "massScale": 0.45,
    "shoveRatio": 0.5,
    "barWidth": 48,
    "barColor": "#10b981"
};
})(window);
