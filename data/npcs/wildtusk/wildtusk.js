/**
 * Wildtusk NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.wildtusk = {
    id: "wildtusk",
    name: "Wildtusk",
    description: "Colossal prehistoric dread-boar brandishing massive outward war tusks and iron-studded skull plating.",
    radius: 26,
    speed: 125,
    maxHp: 6700000,
    damage: 370000,
    attackRate: 0.73,
    attackRange: 26,
    killsAwarded: 7,
    killstreakAwarded: 10000,
    respawnDelay: 6.5,
    color: "#78350f",
    glowColor: "rgba(245, 158, 11, 0.95)",
    massScale: 0.05,
    shoveRatio: 0.15,
    barWidth: 78,
    barColor: "#f59e0b"
  };
})(window);
