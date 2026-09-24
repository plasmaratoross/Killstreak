/**
 * Dreadscale NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.dreadscale = {
    "id": "dreadscale",
    "name": "Dreadscale",
    "description": "Enormous serpentine terror enveloped in dark abyssal scales.",
    "radius": 28,
    "speed": 155,
    "maxHp": 850000000,
    "damage": 16000000,
    "attackRate": 0.55,
    "attackRange": 30,
    "killsAwarded": 21,
    "killstreakAwarded": 145000,
    "respawnDelay": 7,
    "color": "#8b5cf6",
    "neutralColor": "#2e1065",
    "glowColor": "rgba(139, 92, 246, 0.55)",
    "massScale": 0.4,
    "shoveRatio": 0.45,
    "barWidth": 50,
    "barColor": "#8b5cf6"
};
})(window);
