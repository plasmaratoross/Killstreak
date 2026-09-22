/**
 * Grizzlehorn NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.grizzlehorn = {
    id: "grizzlehorn",
    name: "Grizzlehorn",
    description: "Rugged horned juggernaut bearing thick earthen plates and massive sweeping bronze horns.",
    radius: 21,
    speed: 120,
    maxHp: 300000,
    damage: 22000,
    attackRate: 0.90,
    attackRange: 21,
    killsAwarded: 4,
    killstreakAwarded: 850,
    respawnDelay: 5.0,
    color: "#5c4033",
    glowColor: "rgba(217, 119, 6, 0.85)",
    massScale: 0.10,
    shoveRatio: 0.28,
    barWidth: 64,
    barColor: "#d97706"
  };
})(window);
