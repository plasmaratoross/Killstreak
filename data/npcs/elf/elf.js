/**
 * Elf NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.elf = {
    id: "elf",
    name: "Elf",
    description: "Sanctuary guardian wielding high damage emerald magic.",
    radius: 16,
    speed: 135,
    maxHp: 15275,
    damage: 1250,
    attackRate: 1.0,
    attackRange: 16,
    killsAwarded: 2,
    killstreakAwarded: 100,
    respawnDelay: 6.0,
    color: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.85)",
    massScale: 0.30,
    shoveRatio: 0.70,
    barWidth: 50,
    barColor: "#34d399"
  };
})(window);
