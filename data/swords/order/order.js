/**
 * Order Sword Data
 * Weapon: The Law — 12 progressive phases up to 966,000 killstreak.
 *
 * Imports src/swords/order/order.data.json and registers onto window.Killstreak.Data.Swords.order.
 */
import ORDER_DATA from '../../../src/swords/order/order.data.json';

(function(window) {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.Data = window.Killstreak.Data || {};
  window.Killstreak.Data.Swords = window.Killstreak.Data.Swords || {};

  window.Killstreak.Data.Swords.order = ORDER_DATA;
})(window);
