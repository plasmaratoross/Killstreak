/**
 * Gloomscale NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.gloomscale = {
    id: "gloomscale",
    name: "Gloomscale",
    description: "Abyssal serpentine horror armored in dark prismatic dragon scales that refract necrotic void energy.",
    radius: 25,
    speed: 140,
    maxHp: 4300000,
    damage: 250000,
    attackRate: 0.68,
    attackRange: 25,
    killsAwarded: 7,
    killstreakAwarded: 7000,
    respawnDelay: 6.5,
    color: "#0f172a",
    glowColor: "rgba(236, 72, 153, 0.95)",
    massScale: 0.06,
    shoveRatio: 0.16,
    barWidth: 76,
    barColor: "#ec4899"
  };
})(window);
