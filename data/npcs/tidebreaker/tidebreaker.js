/**
 * Tidebreaker NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.tidebreaker = {
    "id": "tidebreaker",
    "name": "Tidebreaker",
    "description": "Cataclysmic sea juggernaut capable of shattering tectonic ridges.",
    "radius": 46,
    "speed": 165,
    "maxHp": 340000000000,
    "damage": 1000000000,
    "attackRate": 0.45,
    "attackRange": 48,
    "killsAwarded": 48,
    "killstreakAwarded": 2700000,
    "respawnDelay": 10,
    "color": "#06b6d4",
    "neutralColor": "#083344",
    "glowColor": "rgba(6, 182, 212, 0.70)",
    "massScale": 0.14,
    "shoveRatio": 0.2,
    "barWidth": 72,
    "barColor": "#06b6d4"
};
})(window);
