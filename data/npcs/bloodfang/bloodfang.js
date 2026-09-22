/**
 * Bloodfang NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.bloodfang = {
    id: "bloodfang",
    name: "Bloodfang",
    description: "Feral predator with crimson-stained fangs, relentlessly hunting prey with reckless ferocity.",
    radius: 17.5,
    speed: 140,
    maxHp: 45000,
    damage: 3900,
    attackRate: 0.95,
    attackRange: 17.5,
    killsAwarded: 2,
    killstreakAwarded: 200,
    respawnDelay: 4.0,
    color: "#c0392b",
    glowColor: "rgba(192, 57, 43, 0.85)",
    massScale: 0.20,
    shoveRatio: 0.45,
    barWidth: 56,
    barColor: "#e74c3c"
  };
})(window);
