/**
 * Arcanist NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.arcanist = {
    id: "arcanist",
    name: "Arcanist",
    description: "Ancient arcane wielder channeling volatile spell energies into devastating magical strikes.",
    radius: 16,
    speed: 110,
    maxHp: 72000,
    damage: 6000,
    attackRate: 0.80,
    attackRange: 16,
    killsAwarded: 3,
    killstreakAwarded: 300,
    respawnDelay: 4.5,
    color: "#8e44ad",
    glowColor: "rgba(142, 68, 173, 0.90)",
    massScale: 0.18,
    shoveRatio: 0.40,
    barWidth: 58,
    barColor: "#9b59b6"
  };
})(window);
