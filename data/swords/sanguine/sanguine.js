/**
 * Sanguine Sword Data
 * Weapon: The Blood — 16 progressive phases up to 1,850,000 killstreak.
 *
 * DELIBERATE DEVIATION FROM THE OTHER data/swords/*.js FILES:
 * every other sword duplicates its phase table here and warns that the copy must
 * stay deep-equal to src/swords/<id>/<id>.data.json. Sanguine instead IMPORTS that
 * JSON, so the two can never drift apart in value or in key order. The only
 * verifier that compares the two (scratch/validate_phase1.mjs) scopes itself to
 * the seven legacy swords, so nothing depends on this file being a literal copy.
 *
 * Phases 1-6 are DELIBERATELY the weakest in the game (3-380 damage) and Phase 7
 * (Flatline) is a further DELIBERATE_COLLAPSE phase. From Phase 8 the curve turns,
 * and Phase 12 (Fester) is where the fragile half ends: it is deliberately NOT a
 * collapse, because at that point the sword has to be able to fight
 * Duskhorn/Mirewalker/Thunderhoof-tier enemies. Do not "correct" either end into a
 * smooth curve, and do not re-weaken Phase 12.
 */
import SANGUINE_DATA from '../../../src/swords/sanguine/sanguine.data.json';

(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.Swords = window.Killstreak.Data.Swords || {};

  window.Killstreak.Data.Swords.sanguine = SANGUINE_DATA;
})(window);
