/**
 * Normal Sentry NPC Data
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.NPCs = window.Killstreak.Data.NPCs || {};

  window.Killstreak.Data.NPCs.normal = {
    id: "normal",
    name: "Normal Sentry",
    description: "Basic stationary sentry defending feeding grounds.",
    radius: 16,
    speed: 130,
    maxHp: 40,
    damage: 2,
    attackRate: 0.75,
    attackRange: 16,
    killsAwarded: 1,
    killstreakAwarded: 1,
    respawnDelay: 6.0,
    color: "#ef4444",
    neutralColor: "#475569",
    glowColor: null,
    massScale: 1.0,
    shoveRatio: 0.75,
    barWidth: 32,
    barColor: "#ef4444"
  };
})(window);
