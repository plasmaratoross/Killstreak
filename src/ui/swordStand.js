/**
 * Sword stand (pedestal) panel.
 *
 * Phase 6, slice 11. Extracted from js/main.js; body verbatim.
 *
 * Extracted BEFORE the modals group on purpose: openScreen() renders this panel
 * via its SWORD_STAND case, so if modals.js were written first it would have to
 * import updateSwordStandUI back out of main.js — an inverted dependency.
 *
 * The inspectedSwordId binding travels with it as an exported live binding, so
 * any remaining reader keeps working untouched. Only the assignment goes through
 * the setter.
 *
 * It DOES reach the HUD, the skills panel and toasts: the equip handler in
 * initSwordStandWiring() below refreshes all three, which is why those imports
 * exist. Navigation is NOT imported — see initSwordStandWiring().
 */
import {
  standSwordName,
  standSwordPhase,
  standSwordBase,
  standSwordScaling,
  standSwordDamage,
  standEquipBtn,
  standSwordIcon,
  standWeaponTitle,
  standSwordLockHint,
  closeSwordBtn,
  swordStandCloseBtn
} from './domRefs.js';
import { formatNumber } from '../utils/format.js';
import { updateHudCounters, updateHudPhaseTracking, updateStatsUI } from './hud.js';
import { updateSkillsUI } from './skillsPanel.js';
import { showToast } from './toast.js';

export let inspectedSwordId = "devourer";

const Config = (typeof window !== "undefined" && window.Killstreak && window.Killstreak.Config) || null;
const I18n = (typeof window !== "undefined" && window.Killstreak && window.Killstreak.I18n) || null;

/** @param {*} game */
export function updateSwordStandUI(game) {
  if (!game || !game.player) return;
  const sId = inspectedSwordId || "devourer";
  const swordDef = (Config.SWORDS && Config.SWORDS[sId]) || Config.SWORDS.devourer;
  const sInfo = I18n ? I18n.getSwordInfo(sId) : swordDef;
  const isOverdrive = sId === "overdrive";
  const isAquatic = sId === "aquatic";
  const isSoil = sId === "soil";
  const isMetallic = sId === "metallic";
  const isFlora = sId === "flora";
  const isHellfire = sId === "hellfire";
  const isWindy = sId === "windy";
  const totalKills = (game.saveData && game.saveData.totalKills) || 0;
  const unlockReq = swordDef.unlockKills || 0;
  const isLocked = unlockReq > 0 && totalKills < unlockReq;

  standSwordName.textContent = sInfo.name.toUpperCase();
  if (standWeaponTitle) standWeaponTitle.textContent = sInfo.name.toUpperCase();
  if (standSwordIcon) standSwordIcon.textContent = swordDef.icon || (isWindy ? "🌬️" : (isHellfire ? "🔥" : (isFlora ? "🌿" : (isMetallic ? "⚙️" : (isSoil ? "🛡️" : (isAquatic ? "🌊" : (isOverdrive ? "⚡" : "👁️")))))));

  let p = null;
  const isEquippedWithThis = game.player.isSwordEquipped && game.player.swordId === sId;
  if (game.player.swordId === sId) {
    p = game.player.phase;
  } else {
    let pList = Config.SWORD_PHASES;
    let savedNum = game.saveData.swordPhase || 1;
    if (isSoil) {
      pList = Config.SOIL_PHASES;
      savedNum = game.saveData.soilPhase || 1;
    } else if (isAquatic) {
      pList = Config.AQUATIC_PHASES;
      savedNum = game.saveData.aquaticPhase || 1;
    } else if (isOverdrive) {
      pList = Config.OVERDRIVE_PHASES;
      savedNum = game.saveData.overdrivePhase || 1;
    } else if (isMetallic) {
      pList = Config.METALLIC_PHASES;
      savedNum = game.saveData.metallicPhase || 1;
    } else if (isFlora) {
      pList = Config.FLORA_PHASES;
      savedNum = game.saveData.floraPhase || 1;
    } else if (isHellfire) {
      pList = Config.HELLFIRE_PHASES;
      savedNum = game.saveData.hellfirePhase || 1;
    } else if (isWindy) {
      pList = Config.WINDY_PHASES;
      savedNum = game.saveData.windyPhase || 1;
    }
    p = (pList && pList.find(x => x.phase === savedNum)) || (pList && pList[0]) || Config.SWORD_PHASES[0];
  }
  const pInfo = I18n ? I18n.getPhaseInfo(sId, p.phase) : p;

  if (standSwordPhase) {
    if (isLocked) {
      standSwordPhase.textContent = I18n ? I18n.t("pedestal.phase_locked", { kills: formatNumber(unlockReq).short }) : `LOCKED (${formatNumber(unlockReq).short} LIFETIME KILLS NEEDED)`;
      standSwordPhase.title = `${unlockReq.toLocaleString()} kills`;
    } else if (isEquippedWithThis) {
      standSwordPhase.textContent = I18n ? I18n.t("pedestal.phase_desc", { phase: p.phase, name: (pInfo.shortName || p.shortName).toUpperCase(), kills: formatNumber(p.killsRequired).short }) : `PHASE ${p.phase}: ${p.shortName.toUpperCase()} (${formatNumber(p.killsRequired).short} KILLSTREAK)`;
      standSwordPhase.title = `${p.killsRequired.toLocaleString()} killstreak`;
    } else {
      standSwordPhase.textContent = I18n ? I18n.t("pedestal.phase_pedestal", { phase: p.phase, name: (pInfo.shortName || p.shortName).toUpperCase() }) : `PHASE ${p.phase}: ${p.shortName.toUpperCase()} (PEDESTAL)`;
      standSwordPhase.title = "";
    }
  }

  if (standSwordBase) {
    const fDmg = formatNumber(p.damage);
    const fHp = formatNumber(p.maxHp);
    standSwordBase.textContent = I18n ? I18n.t("pedestal.base_stats_val", { damage: fDmg.short, hp: fHp.short }) : `${fDmg.short} DMG • ${fHp.short} HP`;
    standSwordBase.title = `${fDmg.full} DMG • ${fHp.full} HP`;
  }

  if (standSwordScaling) {
    if (isEquippedWithThis) {
      const phaseKills = game.player.phaseKills || 0;
      const fPhaseKills = formatNumber(phaseKills);
      const scaledPct = Math.round(((game.player.damage / p.damage) - 1) * 100);
      const dmgBonus = game.player.damage > p.damage ? (I18n ? I18n.t("pedestal.scaled_bonus", { pct: scaledPct }) : ` (+${scaledPct}% scaled)`) : " (+0%)";
      standSwordScaling.textContent = I18n ? I18n.t("pedestal.scaling_val", { kills: fPhaseKills.short, bonus: dmgBonus }) : `+${fPhaseKills.short} Phase Kills${dmgBonus}`;
    } else {
      standSwordScaling.textContent = I18n ? I18n.t("pedestal.scaling_pedestal") : "+0 Phase Kills (Pedestal)";
    }
  }

  if (standSwordDamage) {
    const curDmg = isEquippedWithThis ? game.player.damage : p.damage;
    const curHp = isEquippedWithThis ? game.player.maxHp : p.maxHp;
    const fDmg = formatNumber(curDmg);
    const fHp = formatNumber(curHp);
    standSwordDamage.textContent = I18n
      ? I18n.t("pedestal.active_power_val", { damage: fDmg.short, hp: fHp.short, speed: p.speed || 20, reach: p.bladeLength })
      : `${fDmg.short} DMG • ${fHp.short} HP • ${p.speed || 20} SPD • Reach: ${p.bladeLength}px`;
    standSwordDamage.title = `${fDmg.full} DMG • ${fHp.full} HP`;
  }

  if (isLocked) {
    if (standSwordLockHint) {
      standSwordLockHint.classList.remove("hidden");
      const fKills = formatNumber(totalKills);
      const fReq = formatNumber(unlockReq);
      standSwordLockHint.textContent = I18n
        ? I18n.t("pedestal.lock_hint", { req: fReq.short, kills: fKills.short })
        : `🔒 Requires ${fReq.short} Lifetime Kills to Equip (Current: ${fKills.short})`;
      standSwordLockHint.title = `Current: ${fKills.full}`;
    }
    standEquipBtn.textContent = I18n ? I18n.t("pedestal.btn_locked") : "LOCKED 🔒";
    standEquipBtn.className = "btn btn-equip locked";
    standEquipBtn.disabled = true;
  } else {
    if (standSwordLockHint) standSwordLockHint.classList.add("hidden");
    standEquipBtn.disabled = false;
    if (isEquippedWithThis) {
      standEquipBtn.textContent = I18n ? I18n.t("pedestal.btn_equipped") : "EQUIPPED ✓";
      standEquipBtn.className = "btn btn-equip equipped";
    } else if (game.player.swordId === sId) {
      standEquipBtn.textContent = I18n ? I18n.t("pedestal.btn_equip") : "EQUIP";
      standEquipBtn.className = "btn btn-equip";
    } else {
      standEquipBtn.textContent = I18n ? I18n.t("pedestal.btn_switch", { name: sInfo.name.toUpperCase() }) : `SWITCH TO ${swordDef.name.toUpperCase()}`;
      standEquipBtn.className = "btn btn-equip";
    }
  }
}

/** @param {string} id */
export function setInspectedSwordId(id) {
  inspectedSwordId = id;
}

/**
 * Registers the sword stand's own controls.
 *
 * Phase 6 wiring relocation (the option-2 rule). The equip handler moved here
 * verbatim out of js/main.js.
 *
 * ON THE CYCLE: this panel's close buttons belong to the screen router, and
 * modals.js already imports updateSwordStandUI from this module. Importing
 * openScreen/returnFromModal back would close the loop, so the close action is
 * INJECTED by the caller instead and the dependency stays one-way:
 *
 *     initSwordStandWiring(game, () => returnFromModal(game));
 *
 * @param {*} game
 * @param {() => void} onClose  the router's close action (see above)
 */
export function initSwordStandWiring(game, onClose) {
  standEquipBtn.addEventListener("click", () => {
    const sId = inspectedSwordId || "devourer";
    const swordDef = (Config.SWORDS && Config.SWORDS[sId]) || Config.SWORDS.devourer;
    const totalKills = (game.saveData && game.saveData.totalKills) || 0;
    const unlockReq = swordDef.unlockKills || 0;

    if (unlockReq > 0 && totalKills < unlockReq) {
      const lockTitle = I18n ? I18n.t("toasts.weapon_locked_title") : "Weapon Locked";
      const sInfo = I18n ? I18n.getSwordInfo(sId) : swordDef;
      const lockDesc = I18n
        ? I18n.t("toasts.weapon_locked_req_desc", { req: formatNumber(unlockReq).short, name: sInfo.name })
        : `Requires ${formatNumber(unlockReq).short} Lifetime Kills to equip ${swordDef.name}!`;
      showToast(lockTitle, lockDesc, "🔒");
      return;
    }

    let isEquipped = false;
    if (game.player.swordId === sId) {
      isEquipped = game.toggleSwordEquip();
    } else {
      const success = game.equipSword(sId);
      isEquipped = success && game.player.isSwordEquipped;
    }

    updateSwordStandUI(game);
    updateHudPhaseTracking(game);
    updateHudCounters(game);
    updateStatsUI(game);
    updateSkillsUI(game, {
      isSwordEquipped: isEquipped,
      swordId: game.player.swordId,
      phase: game.player.phase.phase,
      gluttonyCooldown: game.gluttonyCooldown,
      engulfCooldown: game.engulfCooldown,
      fortitudeCooldown: game.fortitudeCooldown,
      tsunamiCooldown: game.tsunamiCooldown,
      ironWillCooldown: game.ironWillCooldown,
      ironWillActive: Boolean(game.player.ironWillActive || game.player.ironWillTimer > 0),
      worldrootCooldown: game.worldrootCooldown,
      cataclysmCooldown: game.cataclysmCooldown,
      cycloneCooldown: game.cycloneCooldown
    });

    const sInfo = I18n ? I18n.getSwordInfo(sId) : swordDef;
    if (isEquipped) {
      const sIcon = sId === "windy" ? "🌬️" : (sId === "soil" ? "🛡️" : (sId === "aquatic" ? "🌊" : (sId === "metallic" ? "⚙️" : (sId === "flora" ? "🌿" : (sId === "hellfire" ? "🔥" : (sId === "overdrive" ? "⚡" : "👁️"))))));
      const eqTitle = I18n ? I18n.t("toasts.sword_equipped_title", { name: sInfo.name }) : `${game.player.swordName || "Sword"} Equipped`;
      const eqDesc = I18n ? I18n.t("toasts.sword_equipped_desc") : "Ready to fight in the grassland.";
      showToast(eqTitle, eqDesc, sIcon);
    } else {
      const ueqTitle = I18n ? I18n.t("toasts.sword_unequipped_title") : "Sword Unequipped";
      const ueqDesc = I18n ? I18n.t("toasts.sword_unequipped_desc") : "Returned to weapon pedestal.";
      showToast(ueqTitle, ueqDesc, "🛡️");
    }
  });

  closeSwordBtn.addEventListener("click", () => onClose());
  swordStandCloseBtn.addEventListener("click", () => onClose());
}
