/**
 * Tremor Sword Data
 * Weapon: The Earthquake — 10 progressive phases up to 1,200,000 killstreak.
 *
 * Imports src/swords/tremor/tremor.data.json and registers onto window.Killstreak.Data.Swords.tremor.
 */
import TREMOR_DATA from '../../../src/swords/tremor/tremor.data.json';

(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.Swords = window.Killstreak.Data.Swords || {};

  window.Killstreak.Data.Swords.tremor = TREMOR_DATA;
})(window);
