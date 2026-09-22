/**
 * Swordman NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.swordman = {
    id: "swordman",
    name: "Swordman",
    description: "Disciplined barracks warrior wielding extended steel reach.",
    radius: 17,
    speed: 130,
    maxHp: 4500,
    damage: 275,
    attackRate: 0.8,
    attackRange: 46,
    killsAwarded: 2,
    killstreakAwarded: 20,
    respawnDelay: 6.0,
    color: "#2563eb",
    glowColor: "rgba(37, 99, 235, 0.7)",
    massScale: 0.25,
    shoveRatio: 0.55,
    barWidth: 46,
    barColor: "#60a5fa"
  };
})(window);
