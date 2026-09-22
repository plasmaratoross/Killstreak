/**
 * Starforged NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.starforged = {
    id: "starforged",
    name: "Starforged",
    description: "Celestial construct forged in the heart of dying stars, radiating stellar fury and annihilating light.",
    radius: 19,
    speed: 125,
    maxHp: 190000,
    damage: 13500,
    attackRate: 0.90,
    attackRange: 19,
    killsAwarded: 4,
    killstreakAwarded: 650,
    respawnDelay: 5.0,
    color: "#f39c12",
    glowColor: "rgba(243, 156, 18, 0.95)",
    massScale: 0.12,
    shoveRatio: 0.30,
    barWidth: 60,
    barColor: "#f1c40f"
  };
})(window);
