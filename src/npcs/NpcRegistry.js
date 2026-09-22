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
