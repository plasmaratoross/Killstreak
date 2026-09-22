/**
 * AbilitySystem — single dispatcher for sword active abilities.
 *
 * Replaces the seven `Game.activate*()` methods that used to hold the ability
 * bodies inline. Each body now lives in its own strategy module
 * (`src/swords/<id>/<id>.ability.js`).
 *
 * The two entry points below replicate, branch for branch, the dispatch that
 * previously lived at the two call sites in `js/main.js`.
 *
 * NOTE — PRESERVED QUIRK: the primary (Z) chain has no `overdrive` branch, so
 * an equipped Overdrive falls through to Devourer's Gluttony, whose guard
 * (`swordId !== "devourer"`) then rejects it. Overdrive therefore has no
 * functioning Z or X ability — pre-existing behaviour, deliberately not fixed.
 *
 * NOTE — GUIDE CORRECTION: KILLSTREAK_REFACTOR_GUIDE.md maps
 * `activateEngulf -> overdrive`, but the body guards on swordId "devourer" and
 * phase 17, making it Devourer's secondary ability. Modules are dispatched by
 * identity here, so behaviour is identical either way.
 *
 * Guards such as `player.isSwordEquipped` deliberately stay at the call sites,
 * exactly where they were before.
 */
import devourerAbility from '../swords/devourer/devourer.ability.js';
import devourerEngulfAbility from '../swords/devourer/devourer.engulf.ability.js';
import aquaticAbility from '../swords/aquatic/aquatic.ability.js';
import soilAbility from '../swords/soil/soil.ability.js';
import metallicAbility from '../swords/metallic/metallic.ability.js';
import floraAbility from '../swords/flora/flora.ability.js';
import hellfireAbility from '../swords/hellfire/hellfire.ability.js';

/**
 * Primary (Z) ability for the currently equipped sword.
 * Falls through to Devourer's Gluttony for every sword without its own branch —
 * including `overdrive` and any unknown id, matching the original chain.
 *
 * @param {object} game
 */
export function activatePrimary(game) {
  const swordId = game.player && game.player.swordId;

  if (swordId === "soil") return soilAbility.activate(game);
  if (swordId === "aquatic") return aquaticAbility.activate(game);
  if (swordId === "metallic") return metallicAbility.activate(game);
  if (swordId === "flora") return floraAbility.activate(game);
  if (swordId === "hellfire") return hellfireAbility.activate(game);

  return devourerAbility.activate(game);
}

/**
 * Secondary (X) ability. The original code called `activateEngulf`
 * unconditionally, with no swordId test.
 *
 * @param {object} game
 */
export function activateSecondary(game) {
  return devourerEngulfAbility.activate(game);
}
