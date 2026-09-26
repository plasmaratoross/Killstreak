/**
 * Lumen Sword Data
 * Weapon: The Radiant — 14 progressive phases up to 950,000 killstreak.
 *
 * DELIBERATE DEVIATION FROM THE OTHER data/swords/*.js FILES:
 * every other sword duplicates its phase table here and warns that the copy must
 * stay deep-equal to src/swords/<id>/<id>.data.json. Lumen instead IMPORTS that
 * JSON, so the two can never drift apart in value or in key order. 45 phases of
 * hand-maintained duplication is a drift bug waiting to happen, and the only
 * verifier that compares the two (scratch/validate_phase1.mjs) scopes itself to
 * the seven legacy swords, so nothing depends on this file being a literal copy.
 *
 * The IIFE shape and the window.Killstreak.Data.Swords registration are unchanged:
 * js/config.js reads Config.SWORDS from this namespace, and that is what drives
 * the Library tab, the pedestal and the sword stand.
 *
 * Phase 7 (Eclipse) and Phase 12 (Occultation) are DELIBERATE_COLLAPSE phases:
 * they are intentionally weak and the 28,000 / 170,000-killstreak gaps after them
 * are part of the design. Do not "correct" them into normal progression.
 */
import LUMEN_DATA from '../../../src/swords/lumen/lumen.data.json';

(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.Swords = window.Killstreak.Data.Swords || {};

  window.Killstreak.Data.Swords.lumen = LUMEN_DATA;
})(window);
