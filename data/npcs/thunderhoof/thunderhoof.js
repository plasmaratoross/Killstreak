/**
 * Thunderhoof NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.thunderhoof = {
    id: "thunderhoof",
    name: "Thunderhoof",
    description: "Storm-forged colossus clad in lightning-charged plate, discharging thunderous arcs across the earth.",
    radius: 25,
    speed: 135,
    maxHp: 2800000,
    damage: 170000,
    attackRate: 0.78,
    attackRange: 25,
    killsAwarded: 6,
    killstreakAwarded: 5000,
    respawnDelay: 6.0,
    color: "#1e3a8a",
    glowColor: "rgba(56, 189, 248, 0.95)",
    massScale: 0.06,
    shoveRatio: 0.18,
    barWidth: 74,
    barColor: "#38bdf8"
  };
})(window);
