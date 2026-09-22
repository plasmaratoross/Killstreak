/**
 * Ironborn NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.ironborn = {
    id: "ironborn",
    name: "Ironborn",
    description: "Ironborn warrior forged in endless battle, clad in crude iron plating with brutal striking power.",
    radius: 17,
    speed: 120,
    maxHp: 28000,
    damage: 2250,
    attackRate: 0.85,
    attackRange: 17,
    killsAwarded: 2,
    killstreakAwarded: 150,
    respawnDelay: 4.0,
    color: "#7f8c8d",
    glowColor: "rgba(127, 140, 141, 0.75)",
    massScale: 0.22,
    shoveRatio: 0.50,
    barWidth: 54,
    barColor: "#95a5a6"
  };
})(window);
