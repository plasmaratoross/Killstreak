/**
 * SwordRegistry — central lookup for all 13 swords.
 *
 * Maps swordId → { data, render } so Player and Game never contain per-sword
 * if/switch chains.
 *
 * There is deliberately NO `ability` field here, and no ability accessor.
 * Abilities are dispatched solely by src/systems/AbilitySystem.js, through an
 * explicit swordId if-chain with its own imports. The field used to exist and was
 * never read; worse, reading it would have been a BUG — Overdrive has no ability,
 * so `getSword(id).ability` would hand it Devourer's Gluttony. Read that file's
 * header before re-adding anything like it.
 */
import devourerData   from './devourer/devourer.data.json';
import overdriveData  from './overdrive/overdrive.data.json';
import aquaticData    from './aquatic/aquatic.data.json';
import soilData       from './soil/soil.data.json';
import metallicData   from './metallic/metallic.data.json';
import floraData      from './flora/flora.data.json';
import hellfireData   from './hellfire/hellfire.data.json';
import windyData      from './windy/windy.data.json';
import frostbiteData  from './frostbite/frostbite.data.json';
import voltstrikeData from './voltstrike/voltstrike.data.json';
import lumenData      from './lumen/lumen.data.json';
import umbraData      from './umbra/umbra.data.json';
import sanguineData   from './sanguine/sanguine.data.json';

import devourerRender  from './devourer/devourer.render.js';
import overdriveRender from './overdrive/overdrive.render.js';
import aquaticRender   from './aquatic/aquatic.render.js';
import soilRender      from './soil/soil.render.js';
import metallicRender  from './metallic/metallic.render.js';
import floraRender     from './flora/flora.render.js';
import hellfireRender  from './hellfire/hellfire.render.js';
import windyRender     from './windy/windy.render.js';import frostbiteRender from './frostbite/frostbite.render.js';
import voltstrikeRender from './voltstrike/voltstrike.render.js';
import lumenRender     from './lumen/lumen.render.js';
import umbraRender     from './umbra/umbra.render.js';
import sanguineRender  from './sanguine/sanguine.render.js';
// Ability modules are deliberately NOT imported here — see the header. They are
// imported by src/systems/AbilitySystem.js, which owns the dispatch.

/**
 * Which ability each sword has (if any) is recorded in src/systems/AbilitySystem.js,
 * not here:
 *   devourer  → Gluttony (Z) + Engulf (X)
 *   overdrive → none; its Z falls through to Gluttony, whose
 *               `swordId !== "devourer"` guard rejects it
 *   aquatic, soil, metallic, flora, hellfire, windy, frostbite → their own Z ability
 *   frostbite → Freeze (Z) + Blizzard (X)
 *   voltstrike → Zap (Z)
 *   lumen     → Flash (Z) + Radiance (X)
 *   umbra     → Gravity Well (Z) + Erasure (X)
 *   sanguine  → Bloodletting (Z) + Exsanguinate (X)
 *
 * @type {Record<string, { data: object, render: object }>}
 */
const SwordRegistry = {
  devourer:  { data: devourerData,  render: devourerRender },
  overdrive: { data: overdriveData, render: overdriveRender },
  aquatic:   { data: aquaticData,   render: aquaticRender },
  soil:      { data: soilData,      render: soilRender },
  metallic:  { data: metallicData,  render: metallicRender },
  flora:     { data: floraData,     render: floraRender },
  hellfire:  { data: hellfireData,  render: hellfireRender },
  windy:     { data: windyData,     render: windyRender },
  frostbite: { data: frostbiteData, render: frostbiteRender },
  voltstrike: { data: voltstrikeData, render: voltstrikeRender },
  lumen:     { data: lumenData,     render: lumenRender },
  umbra:     { data: umbraData,     render: umbraRender },
  sanguine:  { data: sanguineData,  render: sanguineRender },
};

export default SwordRegistry;

/**
 * Renderer lookup used by Player.draw().
 *
 * Falls back to Devourer, which mirrors the `else` branch of the original
 * swordId dispatch chain — that branch also served unknown/empty sword ids.
 */
export function getSwordRenderer(swordId) {
  return (SwordRegistry[swordId] ?? SwordRegistry.devourer).render;
}

/** All valid sword IDs in progression order */
export const SWORD_IDS = ['devourer', 'overdrive', 'aquatic', 'soil', 'metallic', 'flora', 'hellfire', 'windy', 'frostbite', 'voltstrike', 'lumen', 'umbra', 'sanguine'];
