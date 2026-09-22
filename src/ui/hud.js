/**
 * HUD panel — counters, statistics panel and the phase tracker.
 *
 * Phase 6, slice 3. Extracted from js/main.js.
 *
 * The bodies are verbatim. They referenced a module-level `let game` in
 * main.js; here `game` is a parameter, so every `game.x` reference resolves
 * exactly as before and no line inside needed rewriting. The single exception is
 * updateStatsUI's internal call to updateHudCounters, which now threads the
 * parameter through.
 *
 * I18n is captured once at module load from window.Killstreak, mirroring the
 * `const { I18n } = window.Killstreak` the IIFE did at startup, so the
 * `I18n ? ... : fallback` branches behave identically.
 */
import {
  hudKillstreakVal,
  hudKillsVal,
  hudSwordName,
  hudPhasePill,
  hudPhaseText,
  standCurrentKills,
  statTotalPlaytime,
  statTotalKills,
  statHighestStreak,
  statCurrentPhase
} from './domRefs.js';
import { setNumContent, formatPlaytime } from '../utils/dom.js';

const I18n = (typeof window !== "undefined" && window.Killstreak && window.Killstreak.I18n) || null;

/** @param {object} game */
export function updateHudCounters(game) {
  const totalKills = (game && game.saveData && (typeof game.saveData.totalKills === "number" ? game.saveData.totalKills : game.saveData.kills)) || 0;
  const streak = (game && typeof game.killstreak === "number") ? game.killstreak : 0;
  setNumContent(hudKillsVal, totalKills);
  setNumContent(hudKillstreakVal, streak);
  setNumContent(standCurrentKills, totalKills);
  setNumContent(statTotalKills, totalKills);
  if (statHighestStreak && game && game.saveData) {
    setNumContent(statHighestStreak, game.saveData.highestKillstreak || 0);
  }
}

/** @param {object} game */
export function updateStatsUI(game) {
  if (!game || !game.saveData || !statTotalPlaytime) return;
  statTotalPlaytime.textContent = formatPlaytime(game.saveData.playTime || 0);
  updateHudCounters(game);
  if (game.player && game.player.isSwordEquipped && game.player.phase) {
    const sInfo = I18n ? I18n.getSwordInfo(game.player.swordId) : { name: game.player.swordName || "Devourer" };
    const pInfo = I18n ? I18n.getPhaseInfo(game.player.swordId, game.player.phase.phase) : game.player.phase;
    statCurrentPhase.textContent = `${sInfo.name} — ${pInfo.name}`;
  } else {
    statCurrentPhase.textContent = I18n ? I18n.t("stats.none_unequipped") : "None (Unequipped)";
  }
}

/** @param {object} game */
export function updateHudPhaseTracking(game) {
  if (!game || !game.player || !hudSwordName || !hudPhaseText || !hudPhasePill) return;
  if (game.player && game.player.isSwordEquipped && game.player.phase) {
    const sInfo = I18n ? I18n.getSwordInfo(game.player.swordId) : { name: game.player.swordName || "DEVOURER" };
    const pInfo = I18n ? I18n.getPhaseInfo(game.player.swordId, game.player.phase.phase) : game.player.phase;
    hudSwordName.textContent = (sInfo.name || game.player.swordName || "DEVOURER").toUpperCase();
    hudPhaseText.textContent = I18n ? I18n.t("hud.phase_prefix", { name: (pInfo.shortName || game.player.phase.shortName).toUpperCase() }) : `PHASE: ${game.player.phase.shortName.toUpperCase()}`;
    hudPhasePill.className = `phase-pill ${game.player.phase.cssClass || "phase-1"}`;
  } else {
    hudSwordName.textContent = I18n ? I18n.t("hud.no_sword_caps") : "NO SWORD";
    hudPhaseText.textContent = I18n ? I18n.t("hud.unequipped_caps") : "UNEQUIPPED";
    hudPhasePill.className = "phase-pill phase-unequipped";
  }
}
