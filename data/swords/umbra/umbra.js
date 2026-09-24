/**
 * Umbra Sword Data
 * Weapon: The Void — 15 progressive phases up to 1,400,000 killstreak.
 *
 * DELIBERATE DEVIATION FROM THE OTHER data/swords/*.js FILES:
 * every other sword duplicates its phase table here and warns that the copy must
 * stay deep-equal to src/swords/<id>/<id>.data.json. Umbra instead IMPORTS that
 * JSON, so the two can never drift apart in value or in key order. The only
 * verifier that compares the two (scratch/validate_phase1.mjs) scopes itself to
 * the seven legacy swords, so nothing depends on this file being a literal copy.
 *
 * Phase 7 (Unmaking) and Phase 12 (Unravelling) are DELIBERATE_COLLAPSE phases:
 * they are intentionally weak and the 2,000 / 230,000-killstreak gaps after them
 * are part of the design. Do not "correct" them into normal progression.
 */
import UMBRA_DATA from '../../../src/swords/umbra/umbra.data.json';

(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.Swords = window.Killstreak.Data.Swords || {};

  window.Killstreak.Data.Swords.umbra = UMBRA_DATA;
})(window);
