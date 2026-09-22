/**
 * Buff Man NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.buff_man = {
    id: "buff_man",
    name: "Buff Man",
    description: "Colossal arena heavyweight boasting extreme mass resistance and crushing strikes.",
    radius: 18.5,
    speed: 105,
    maxHp: 10000,
    damage: 500,
    attackRate: 1.5,
    attackRange: 18.5,
    killsAwarded: 2,
    killstreakAwarded: 50,
    respawnDelay: 6.0,
    color: "#d97706",
    glowColor: "rgba(217, 119, 6, 0.7)",
    massScale: 0.15,
    shoveRatio: 0.35,
    barWidth: 52,
    barColor: "#fbbf24"
  };
})(window);
