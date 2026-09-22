/**
 * Thug NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.thug = {
    id: "thug",
    name: "Thug",
    description: "Brutish encampment raider packing hefty punch.",
    radius: 17,
    speed: 135,
    maxHp: 750,
    damage: 50,
    attackRate: 0.8,
    attackRange: 17,
    killsAwarded: 1,
    killstreakAwarded: 5,
    respawnDelay: 6.0,
    color: "#b45309",
    glowColor: "rgba(180, 83, 9, 0.65)",
    massScale: 0.35,
    shoveRatio: 0.60,
    barWidth: 38,
    barColor: "#f59e0b"
  };
})(window);
