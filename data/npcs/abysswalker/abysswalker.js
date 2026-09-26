/**
 * Abysswalker NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.abysswalker = {
    "id": "abysswalker",
    "name": "Abysswalker",
    "description": "Towering trench strider traversing the sunless ocean depths.",
    "radius": 30,
    "speed": 150,
    "maxHp": 3300000000,
    "damage": 42000000,
    "attackRate": 0.5,
    "attackRange": 32,
    "killsAwarded": 27,
    "killstreakAwarded": 280000,
    "respawnDelay": 7.5,
    "color": "#6366f1",
    "neutralColor": "#1e1b4b",
    "glowColor": "rgba(99, 102, 241, 0.60)",
    "massScale": 0.35,
    "shoveRatio": 0.4,
    "barWidth": 54,
    "barColor": "#6366f1"
};
})(window);
