/**
 * NpcRegistry — central lookup for all 22 NPC types.
 *
 * Maps npcType → { data } so Game and Config never scatter
 * NPC-specific knowledge across multiple files.
 */
import normalData      from './normal/normal.data.json';
import fairyData       from './fairy/fairy.data.json';
import thugData        from './thug/thug.data.json';
import guardData       from './guard/guard.data.json';
import swordmanData    from './swordman/swordman.data.json';
import buffManData     from './buff_man/buff_man.data.json';
import elfData         from './elf/elf.data.json';
import ironbornData    from './ironborn/ironborn.data.json';
import bloodfangData   from './bloodfang/bloodfang.data.json';
import arcanistData    from './arcanist/arcanist.data.json';
import colossusData    from './colossus/colossus.data.json';
import starforgedData  from './starforged/starforged.data.json';
import grizzlehornData from './grizzlehorn/grizzlehorn.data.json';
import bramblebackData from './brambleback/brambleback.data.json';
import embermaneData   from './embermane/embermane.data.json';
import duskhornData    from './duskhorn/duskhorn.data.json';
import mirewalkerData  from './mirewalker/mirewalker.data.json';
import thunderhoofData from './thunderhoof/thunderhoof.data.json';
import gloomscaleData  from './gloomscale/gloomscale.data.json';
import wildtuskData    from './wildtusk/wildtusk.data.json';
import moonmaneData    from './moonmane/moonmane.data.json';
import crimsonhideData from './crimsonhide/crimsonhide.data.json';
import reefmawData     from './reefmaw/reefmaw.data.json';
import coralbackData   from './coralback/coralback.data.json';
import tidescaleData   from './tidescale/tidescale.data.json';
import seafangData     from './seafang/seafang.data.json';
import abyssfinData    from './abyssfin/abyssfin.data.json';
import deepclawData    from './deepclaw/deepclaw.data.json';
import reefstalkerData from './reefstalker/reefstalker.data.json';
import dreadscaleData  from './dreadscale/dreadscale.data.json';
import tidebornData    from './tideborn/tideborn.data.json';
import leviathanData   from './leviathan/leviathan.data.json';
import abysswalkerData from './abysswalker/abysswalker.data.json';
import trenchmawData   from './trenchmaw/trenchmaw.data.json';
import depthclawData   from './depthclaw/depthclaw.data.json';
import gloomrayData    from './gloomray/gloomray.data.json';
import abyssalData     from './abyssal/abyssal.data.json';
import sirenbornData   from './sirenborn/sirenborn.data.json';
import stormscaleData  from './stormscale/stormscale.data.json';
import dreadtideData   from './dreadtide/dreadtide.data.json';
import trenchbornData  from './trenchborn/trenchborn.data.json';
import deepwardenData  from './deepwarden/deepwarden.data.json';
import abysslordData   from './abysslord/abysslord.data.json';
import tidebreakerData from './tidebreaker/tidebreaker.data.json';
import depthforgedData from './depthforged/depthforged.data.json';
import oceanbaneData   from './oceanbane/oceanbane.data.json';
import abyssforgedData from './abyssforged/abyssforged.data.json';

/** @type {Record<string, { data: object }>} */
const NpcRegistry = {
  normal:      { data: normalData },
  fairy:       { data: fairyData },
  thug:        { data: thugData },
  guard:       { data: guardData },
  swordman:    { data: swordmanData },
  buff_man:    { data: buffManData },
  elf:         { data: elfData },
  ironborn:    { data: ironbornData },
  bloodfang:   { data: bloodfangData },
  arcanist:    { data: arcanistData },
  colossus:    { data: colossusData },
  starforged:  { data: starforgedData },
  grizzlehorn: { data: grizzlehornData },
  brambleback: { data: bramblebackData },
  embermane:   { data: embermaneData },
  duskhorn:    { data: duskhornData },
  mirewalker:  { data: mirewalkerData },
  thunderhoof: { data: thunderhoofData },
  gloomscale:  { data: gloomscaleData },
  wildtusk:    { data: wildtuskData },
  moonmane:    { data: moonmaneData },
  crimsonhide: { data: crimsonhideData },
  reefmaw:     { data: reefmawData },
  coralback:   { data: coralbackData },
  tidescale:   { data: tidescaleData },
  seafang:     { data: seafangData },
  abyssfin:    { data: abyssfinData },
  deepclaw:    { data: deepclawData },
  reefstalker: { data: reefstalkerData },
  dreadscale:  { data: dreadscaleData },
  tideborn:    { data: tidebornData },
  leviathan:   { data: leviathanData },
  abysswalker: { data: abysswalkerData },
  trenchmaw:   { data: trenchmawData },
  depthclaw:   { data: depthclawData },
  gloomray:    { data: gloomrayData },
  abyssal:     { data: abyssalData },
  sirenborn:   { data: sirenbornData },
  stormscale:  { data: stormscaleData },
  dreadtide:   { data: dreadtideData },
  trenchborn:  { data: trenchbornData },
  deepwarden:  { data: deepwardenData },
  abysslord:   { data: abysslordData },
  tidebreaker: { data: tidebreakerData },
  depthforged: { data: depthforgedData },
  oceanbane:   { data: oceanbaneData },
  abyssforged: { data: abyssforgedData },
};

export default NpcRegistry;

/** Convenience: get NPC data by type string */
export function getNpcData(npcType) {
  return NpcRegistry[npcType]?.data ?? null;
}

/** Flat object of npcType → data (matches legacy window.Killstreak.Data.NPCs shape) */
export function getNpcDataMap() {
  const map = {};
  for (const [type, entry] of Object.entries(NpcRegistry)) {
    map[type] = entry.data;
  }
  return map;
}
