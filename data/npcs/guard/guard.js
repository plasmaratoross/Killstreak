/**
 * Guard NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.guard = {
    id: "guard",
    name: "Guard",
    description: "Armored outpost defender with high durability and shields.",
    radius: 19,
    speed: 130,
    maxHp: 2000,
    damage: 150,
    attackRate: 0.7,
    attackRange: 19,
    killsAwarded: 1,
    killstreakAwarded: 10,
    respawnDelay: 6.0,
    color: "#f8fafc",
    glowColor: "rgba(248, 250, 252, 0.95)",
    massScale: 0.20,
    shoveRatio: 0.45,
    barWidth: 44,
    barColor: "#f8fafc"
  };
})(window);
