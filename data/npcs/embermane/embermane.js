/**
 * Embermane NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.embermane = {
    id: "embermane",
    name: "Embermane",
    description: "Fierce predator crowned with a flickering mane of primordial magma, scorching anything that draws near.",
    radius: 23,
    speed: 130,
    maxHp: 750000,
    damage: 52000,
    attackRate: 0.78,
    attackRange: 23,
    killsAwarded: 5,
    killstreakAwarded: 1750,
    respawnDelay: 5.5,
    color: "#c2410c",
    glowColor: "rgba(234, 88, 12, 0.90)",
    massScale: 0.08,
    shoveRatio: 0.24,
    barWidth: 68,
    barColor: "#ea580c"
  };
})(window);
