/**
 * Deepclaw NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.deepclaw = {
    "id": "deepclaw",
    "name": "Deepclaw",
    "description": "Heavy benthic stalker brandishing crushing abyssal pincers.",
    "radius": 26,
    "speed": 135,
    "maxHp": 320000000,
    "damage": 8000000,
    "attackRate": 0.55,
    "attackRange": 28,
    "killsAwarded": 17,
    "killstreakAwarded": 90000,
    "respawnDelay": 6.5,
    "color": "#e11d48",
    "neutralColor": "#4c0519",
    "glowColor": "rgba(225, 29, 72, 0.50)",
    "massScale": 0.45,
    "shoveRatio": 0.5,
    "barWidth": 46,
    "barColor": "#e11d48"
};
})(window);
