/**
 * Colossus NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.colossus = {
    id: "colossus",
    name: "Colossus",
    description: "Titanic stone-armored giant with earth-shaking blows and near-impenetrable bulk.",
    radius: 22,
    speed: 85,
    maxHp: 110000,
    damage: 8750,
    attackRate: 1.10,
    attackRange: 22,
    killsAwarded: 3,
    killstreakAwarded: 450,
    respawnDelay: 5.0,
    color: "#616a6b",
    glowColor: "rgba(97, 106, 107, 0.80)",
    massScale: 0.10,
    shoveRatio: 0.25,
    barWidth: 62,
    barColor: "#839192"
  };
})(window);
