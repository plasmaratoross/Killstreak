/**
 * tremor — primary (Z), Seismic Wave, phase 6+.
 *
 * Spec:
 *   - Unlocks at Phase 6 (Collapse).
 *   - 45-second cooldown.
 *   - Active duration: 3.0 seconds.
 *   - Travels forward at exactly 50% of the wielder's current walk speed.
 *   - Deals 10× current sword damage (1000%) with massive knockback.
 *   - Wide penetrating AoE: passes through all targets in its path, hitting each once.
 *   - Smoothly fades out over 3 seconds.
 */

export const SEISMIC_WAVE_COOLDOWN = 45.0;
export const SEISMIC_WAVE_DURATION = 3.0;
export const SEISMIC_WAVE_DAMAGE_MULTIPLIER = 10.0;

export default {
  /** @param {object} game */
  activate(game) {
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    if (game.state !== "COMBAT" || game.isGameOver || game.isCutsceneActive) return false;
    if (!game.player || !game.player.isSwordEquipped || game.player.swordId !== "tremor" || (game.player.phase && game.player.phase.phase < 6)) {
      return false;
    }
    if (game.seismicWaveCooldown > 0) return false;

    game.seismicWaveCooldown = SEISMIC_WAVE_COOLDOWN;

    // Determine travel speed: exactly 50% of player walk speed in px/sec
    const speedScale = (window.Killstreak && window.Killstreak.Config && window.Killstreak.Config.GAME_CONFIG && window.Killstreak.Config.GAME_CONFIG.player && window.Killstreak.Config.GAME_CONFIG.player.speedScale) || 8;
    const playerBaseSpeed = (game.player.phase && game.player.phase.speed) || game.player.speed || 55;
    const waveTravelSpeed = playerBaseSpeed * speedScale * 0.5; // e.g. 50 * 8 * 0.5 = 200 px/s

    // Calculate facing angle: either from movement, mouse target, or swing angle
    const angle = game.player.angle !== undefined ? game.player.angle : (Math.atan2(game.player.vy || 0, game.player.vx || 1) || 0);

    const waveDamage = Math.round(((game.player.damage || (game.player.phase && game.player.phase.damage)) || 60000) * SEISMIC_WAVE_DAMAGE_MULTIPLIER);

    if (!game.activeSeismicWaves) game.activeSeismicWaves = [];
    game.activeSeismicWaves.push({
      x: game.player.x,
      y: game.player.y,
      vx: Math.cos(angle) * waveTravelSpeed,
      vy: Math.sin(angle) * waveTravelSpeed,
      angle: angle,
      radius: 65,
      damage: waveDamage,
      timer: SEISMIC_WAVE_DURATION,
      maxTimer: SEISMIC_WAVE_DURATION,
      hitNpcIds: []
    });

    if (FloatingText) {
      game.floatingTexts.push(
        new FloatingText(game.player.x, game.player.y - 36, "SEISMIC WAVE!", "#f97316", 20)
      );
    }

    if (game.camera) {
      game.camera.shake(14, 0.5);
    }

    // Launch ground fracture particles
    if (Particle) {
      for (let i = 0; i < 35; i++) {
        const pAngle = angle + (Math.random() - 0.5) * 1.2;
        const pSpeed = 60 + Math.random() * 200;
        const color = i % 3 === 0 ? "#1c1917" : (i % 3 === 1 ? "#ea580c" : "#f97316");
        game.particles.push(
          new Particle(game.player.x, game.player.y, Math.cos(pAngle) * pSpeed, Math.sin(pAngle) * pSpeed, color, 5.0, 0.6)
        );
      }
    }

    if (game.callbacks && game.callbacks.onToast) {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      const title = I18n ? I18n.t("toasts.tremor_wave_title", { defaultValue: "SEISMIC WAVE" }) : "SEISMIC WAVE";
      const desc = I18n
        ? I18n.t("toasts.tremor_wave_desc", { defaultValue: "A travelling tectonic shockwave launches forward dealing 10× damage!" })
        : "A travelling tectonic shockwave launches forward dealing 10× damage!";
      game.callbacks.onToast(title, desc, "🌋");
    }

    return true;
  }
};
