/**
 * Poison Sword Data
 * Weapon: The Diabolical Assassin — 14 progressive phases up to 1,433,000 killstreak.
 *
 * Imports src/swords/poison/poison.data.json and registers onto window.Killstreak.Data.Swords.poison.
 */
import POISON_DATA from '../../../src/swords/poison/poison.data.json';

(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.Swords = window.Killstreak.Data.Swords || {};

  window.Killstreak.Data.Swords.poison = POISON_DATA;
})(window);
