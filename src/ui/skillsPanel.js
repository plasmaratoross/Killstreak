/**
 * Skills panel — the Z/X ability HUD, one branch per sword.
 *
 * Phase 6, slice 4. Extracted from js/main.js.
 *
 * The body is verbatim. It took `skillsData` already; `game` became an explicit
 * first parameter because the body reads the live cooldowns off the game instance
 * as a fallback for missing skillsData fields. It touches none of main.js's
 * mutable module state, which is why it could move without a shared-state module.
 *
 * I18n is captured once at module load (mirroring the IIFE's startup destructure)
 * so the `I18n ? ... : fallback` branches behave identically.
 */
import {
  skillGluttonyBtn,
  skillGluttonyVal,
  skillEngulfBtn,
  skillEngulfVal
} from './domRefs.js';
import { activatePrimary, activateSecondary } from '../systems/AbilitySystem.js';

const I18n = (typeof window !== "undefined" && window.Killstreak && window.Killstreak.I18n) || null;

/** @param {*} game @param {*} skillsData */
export function updateSkillsUI(game, skillsData) {
  if (!skillGluttonyBtn || !skillEngulfBtn) return;
  const hudSkillsBar = document.getElementById("hud-skills-bar");
  const isEquipped = skillsData && typeof skillsData.isSwordEquipped === "boolean"
    ? skillsData.isSwordEquipped
    : Boolean(game && game.player && game.player.isSwordEquipped);

  const swordId = (skillsData && skillsData.swordId) || (game && game.player && game.player.swordId) || "devourer";

  // Skills bar only visible when Devourer, Aquatic, Soil, Metallic, Flora, Hellfire, Windy, Frostbite, Voltstrike, Lumen, Umbra, Sanguine, Order, Tremor or Poison is equipped
  if (!isEquipped || (swordId !== "devourer" && swordId !== "aquatic" && swordId !== "soil" && swordId !== "metallic" && swordId !== "flora" && swordId !== "hellfire" && swordId !== "windy" && swordId !== "frostbite" && swordId !== "voltstrike" && swordId !== "lumen" && swordId !== "umbra" && swordId !== "sanguine" && swordId !== "order" && swordId !== "tremor" && swordId !== "poison")) {
    if (hudSkillsBar) hudSkillsBar.classList.add("hidden");
    skillGluttonyBtn.disabled = true;
    skillEngulfBtn.disabled = true;
    return;
  }

  if (hudSkillsBar) hudSkillsBar.classList.remove("hidden");

  const phase = (skillsData && skillsData.phase) || (game.player && game.player.phase.phase) || 1;

  // METALLIC SKILL: Iron Will (Z)
  if (swordId === "metallic") {
    skillEngulfBtn.classList.add("hidden");
    skillGluttonyBtn.classList.remove("hidden");

    const labelEl = skillGluttonyBtn.querySelector(".skill-btn-label");
    if (labelEl) labelEl.textContent = I18n ? I18n.t("skills.iron_will_label") : "[ Z — IRON WILL ]";
    skillGluttonyBtn.title = I18n ? I18n.t("skills.iron_will_title") : "Iron Will [Z] — 46% damage reduction for 6.9s + reflective shrapnel (Phase 4+, 17s CD)";

    const iwCd = (skillsData && typeof skillsData.ironWillCooldown === "number")
      ? skillsData.ironWillCooldown
      : (game && typeof game.ironWillCooldown === "number" ? game.ironWillCooldown : 0);
    const isIwActive = (skillsData && skillsData.ironWillActive) || (game && game.player && (game.player.ironWillActive || game.player.ironWillTimer > 0));

    if (phase < 4) {
      skillGluttonyBtn.className = "skill-btn skill-locked";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.locked_p4") : "LOCKED (P4)";
    } else if (isIwActive) {
      skillGluttonyBtn.className = "skill-btn skill-ready";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.active") : "ACTIVE";
    } else if (iwCd > 0) {
      skillGluttonyBtn.className = "skill-btn skill-cooldown";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = `${iwCd.toFixed(1)}s`;
    } else {
      skillGluttonyBtn.className = "skill-btn skill-ready";
      skillGluttonyBtn.disabled = false;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.ready") : "READY";
    }
    return;
  }

  // FLORA SKILL: Worldroot (Z)
  if (swordId === "flora") {
    skillEngulfBtn.classList.add("hidden");
    skillGluttonyBtn.classList.remove("hidden");

    const labelEl = skillGluttonyBtn.querySelector(".skill-btn-label");
    if (labelEl) labelEl.textContent = I18n ? I18n.t("skills.worldroot_label") : "[ Z — WORLDROOT ]";
    skillGluttonyBtn.title = I18n ? I18n.t("skills.worldroot_title") : "Worldroot [Z] — Roots all nearby enemies for 2.9s and restores 23% max HP over 4s (Phase 4+, 19s CD)";

    const wrCd = (skillsData && typeof skillsData.worldrootCooldown === "number")
      ? skillsData.worldrootCooldown
      : (game && typeof game.worldrootCooldown === "number" ? game.worldrootCooldown : 0);

    if (phase < 4) {
      skillGluttonyBtn.className = "skill-btn skill-locked";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.locked_p4") : "LOCKED (P4)";
    } else if (wrCd > 0) {
      skillGluttonyBtn.className = "skill-btn skill-cooldown";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = `${wrCd.toFixed(1)}s`;
    } else {
      skillGluttonyBtn.className = "skill-btn skill-ready";
      skillGluttonyBtn.disabled = false;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.ready") : "READY";
    }
    return;
  }

  // HELLFIRE SKILL: Cataclysm (Z)
  if (swordId === "hellfire") {
    skillEngulfBtn.classList.add("hidden");
    skillGluttonyBtn.classList.remove("hidden");

    const labelEl = skillGluttonyBtn.querySelector(".skill-btn-label");
    if (labelEl) labelEl.textContent = I18n ? I18n.t("skills.cataclysm_label") : "[ Z — CATACLYSM ]";
    skillGluttonyBtn.title = I18n ? I18n.t("skills.cataclysm_title") : "Cataclysm [Z] — Erupts surrounding ground in magma, dealing 5.75x weapon damage (Phase 4+, 15.3s CD)";

    const ccCd = (skillsData && typeof skillsData.cataclysmCooldown === "number")
      ? skillsData.cataclysmCooldown
      : (game && typeof game.cataclysmCooldown === "number" ? game.cataclysmCooldown : 0);

    if (phase < 4) {
      skillGluttonyBtn.className = "skill-btn skill-locked";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.locked_p4") : "LOCKED (P4)";
    } else if (ccCd > 0) {
      skillGluttonyBtn.className = "skill-btn skill-cooldown";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = `${ccCd.toFixed(1)}s`;
    } else {
      skillGluttonyBtn.className = "skill-btn skill-ready";
      skillGluttonyBtn.disabled = false;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.ready") : "READY";
    }
    return;
  }

  // VOLTSTRIKE SKILL: Zap (Z) — single target only, so the X slot stays hidden
  if (swordId === "voltstrike") {
    skillEngulfBtn.classList.add("hidden");
    skillGluttonyBtn.classList.remove("hidden");

    const labelEl = skillGluttonyBtn.querySelector(".skill-btn-label");
    if (labelEl) labelEl.textContent = I18n ? I18n.t("skills.zap_label") : "[ Z — ZAP ]";
    skillGluttonyBtn.title = I18n ? I18n.t("skills.zap_title") : "Zap [Z] — Strikes the nearest enemy inside your swing range for 125% damage and stuns it for 1.75s (Phase 5+, 30s CD)";

    const zapCd = (skillsData && typeof skillsData.zapCooldown === "number")
      ? skillsData.zapCooldown
      : (game && typeof game.zapCooldown === "number" ? game.zapCooldown : 0);

    if (phase < 5) {
      skillGluttonyBtn.className = "skill-btn skill-locked";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.locked_p5") : "LOCKED (P5)";
    } else if (zapCd > 0) {
      skillGluttonyBtn.className = "skill-btn skill-cooldown";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = `${zapCd.toFixed(1)}s`;
    } else {
      skillGluttonyBtn.className = "skill-btn skill-ready";
      skillGluttonyBtn.disabled = false;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.ready") : "READY";
    }
    return;
  }

  // FROSTBITE SKILLS: Freeze (Z) + Blizzard (X) — the only sword with two of its own
  if (swordId === "frostbite") {
    skillGluttonyBtn.classList.remove("hidden");
    skillEngulfBtn.classList.remove("hidden");

    const zLabel = skillGluttonyBtn.querySelector(".skill-btn-label");
    const xLabel = skillEngulfBtn.querySelector(".skill-btn-label");
    if (zLabel) zLabel.textContent = I18n ? I18n.t("skills.freeze_label") : "[ Z — FREEZE ]";
    if (xLabel) xLabel.textContent = I18n ? I18n.t("skills.blizzard_label") : "[ X — BLIZZARD ]";
    skillGluttonyBtn.title = I18n ? I18n.t("skills.freeze_title") : "Freeze [Z] — Encases every enemy within your average swing range in ice for 5s; frozen targets take double damage (Phase 7+, 25s CD)";
    skillEngulfBtn.title = I18n ? I18n.t("skills.blizzard_title") : "Blizzard [X] — A freezing storm covering 4x your average swing range for 5s, dealing 50% damage every 0.25s and slowing enemies by 15% (Phase 11+, 60s CD)";

    const fzCd = (skillsData && typeof skillsData.freezeCooldown === "number")
      ? skillsData.freezeCooldown
      : (game && typeof game.freezeCooldown === "number" ? game.freezeCooldown : 0);
    const bzCd = (skillsData && typeof skillsData.blizzardCooldown === "number")
      ? skillsData.blizzardCooldown
      : (game && typeof game.blizzardCooldown === "number" ? game.blizzardCooldown : 0);

    // Z — Freeze unlocks at the first deliberate collapse (phase 7).
    if (phase < 7) {
      skillGluttonyBtn.className = "skill-btn skill-locked";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.locked_p7") : "LOCKED (P7)";
    } else if (fzCd > 0) {
      skillGluttonyBtn.className = "skill-btn skill-cooldown";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = `${fzCd.toFixed(1)}s`;
    } else {
      skillGluttonyBtn.className = "skill-btn skill-ready";
      skillGluttonyBtn.disabled = false;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.ready") : "READY";
    }

    // X — Blizzard unlocks at the second collapse (phase 11).
    if (phase < 11) {
      skillEngulfBtn.className = "skill-btn skill-locked";
      skillEngulfBtn.disabled = true;
      skillEngulfVal.textContent = I18n ? I18n.t("skills.locked_p11") : "LOCKED (P11)";
    } else if (bzCd > 0) {
      skillEngulfBtn.className = "skill-btn skill-cooldown";
      skillEngulfBtn.disabled = true;
      skillEngulfVal.textContent = `${bzCd.toFixed(1)}s`;
    } else {
      skillEngulfBtn.className = "skill-btn skill-ready";
      skillEngulfBtn.disabled = false;
      skillEngulfVal.textContent = I18n ? I18n.t("skills.ready") : "READY";
    }
    return;
  }

  // WINDY SKILL: Cyclone (Z)
  if (swordId === "windy") {
    skillEngulfBtn.classList.add("hidden");
    skillGluttonyBtn.classList.remove("hidden");

    const labelEl = skillGluttonyBtn.querySelector(".skill-btn-label");
    if (labelEl) labelEl.textContent = I18n ? I18n.t("skills.cyclone_label") : "[ Z — CYCLONE ]";
    skillGluttonyBtn.title = I18n ? I18n.t("skills.cyclone_title") : "Cyclone [Z] — Spinning vortex striking everything within 3x your swing radius for 5.5x weapon damage (Phase 4+, 35s CD)";

    const cyCd = (skillsData && typeof skillsData.cycloneCooldown === "number")
      ? skillsData.cycloneCooldown
      : (game && typeof game.cycloneCooldown === "number" ? game.cycloneCooldown : 0);

    if (phase < 4) {
      skillGluttonyBtn.className = "skill-btn skill-locked";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.locked_p4") : "LOCKED (P4)";
    } else if (cyCd > 0) {
      skillGluttonyBtn.className = "skill-btn skill-cooldown";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = `${cyCd.toFixed(1)}s`;
    } else {
      skillGluttonyBtn.className = "skill-btn skill-ready";
      skillGluttonyBtn.disabled = false;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.ready") : "READY";
    }
    return;
  }

  // SOIL SKILL: Fortitude (Z)
  if (swordId === "soil") {
    skillEngulfBtn.classList.add("hidden");
    skillGluttonyBtn.classList.remove("hidden");

    const labelEl = skillGluttonyBtn.querySelector(".skill-btn-label");
    if (labelEl) labelEl.textContent = I18n ? I18n.t("skills.fortitude_label") : "[ Z — FORTITUDE ]";
    skillGluttonyBtn.title = I18n ? I18n.t("skills.fortitude_title") : "Fortitude [Z] — Shield equal to 15% of current HP for 5s (Phase 4+, 20s CD)";

    const fCd = (skillsData && typeof skillsData.fortitudeCooldown === "number")
      ? skillsData.fortitudeCooldown
      : (game && typeof game.fortitudeCooldown === "number" ? game.fortitudeCooldown : 0);

    if (phase < 4) {
      skillGluttonyBtn.className = "skill-btn skill-locked";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.locked_p4") : "LOCKED (P4)";
    } else if (fCd > 0) {
      skillGluttonyBtn.className = "skill-btn skill-cooldown";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = `${fCd.toFixed(1)}s`;
    } else {
      skillGluttonyBtn.className = "skill-btn skill-ready";
      skillGluttonyBtn.disabled = false;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.ready") : "READY";
    }
    return;
  }

  // AQUATIC SKILL: Tsunami (Z)
  if (swordId === "aquatic") {
    skillEngulfBtn.classList.add("hidden");
    skillGluttonyBtn.classList.remove("hidden");

    const labelEl = skillGluttonyBtn.querySelector(".skill-btn-label");
    if (labelEl) labelEl.textContent = I18n ? I18n.t("skills.tsunami_label") : "[ Z — TSUNAMI ]";
    skillGluttonyBtn.title = I18n ? I18n.t("skills.tsunami_title") : "Tsunami [Z] — Sweeping wave dealing 4x sword damage (Phase 9+)";

    const tCd = (skillsData && typeof skillsData.tsunamiCooldown === "number")
      ? skillsData.tsunamiCooldown
      : (game && typeof game.tsunamiCooldown === "number" ? game.tsunamiCooldown : 0);

    if (phase < 9) {
      skillGluttonyBtn.className = "skill-btn skill-locked";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.locked_p9") : "LOCKED (P9)";
    } else if (tCd > 0) {
      skillGluttonyBtn.className = "skill-btn skill-cooldown";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = `${tCd.toFixed(1)}s`;
    } else {
      skillGluttonyBtn.className = "skill-btn skill-ready";
      skillGluttonyBtn.disabled = false;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.ready") : "READY";
    }
    return;
  }

  // LUMEN SKILLS: Flash (Z) + Radiance (X)
  if (swordId === "lumen") {
    skillGluttonyBtn.classList.remove("hidden");
    skillEngulfBtn.classList.remove("hidden");

    const zLabel = skillGluttonyBtn.querySelector(".skill-btn-label");
    const xLabel = skillEngulfBtn.querySelector(".skill-btn-label");
    if (zLabel) zLabel.textContent = I18n ? I18n.t("skills.flash_label") : "[ Z — FLASH ]";
    if (xLabel) xLabel.textContent = I18n ? I18n.t("skills.radiance_label") : "[ X — RADIANCE ]";
    skillGluttonyBtn.title = I18n ? I18n.t("skills.flash_title") : "Flash [Z] — Blinds and staggers everything within your swing range for 1.4s and deals 220% damage (Phase 7+, 26s CD)";
    skillEngulfBtn.title = I18n ? I18n.t("skills.radiance_title") : "Radiance [X] — A 4s light field around you: burns enemies for 45% damage per second and heals you for 10% of max HP per second (Phase 12+, 50s CD)";

    const flCd = (skillsData && typeof skillsData.flashCooldown === "number")
      ? skillsData.flashCooldown
      : (game && typeof game.flashCooldown === "number" ? game.flashCooldown : 0);
    const rdCd = (skillsData && typeof skillsData.radianceCooldown === "number")
      ? skillsData.radianceCooldown
      : (game && typeof game.radianceCooldown === "number" ? game.radianceCooldown : 0);

    // Z — Flash unlocks at the first deliberate collapse (phase 7).
    if (phase < 7) {
      skillGluttonyBtn.className = "skill-btn skill-locked";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.locked_p7") : "LOCKED (P7)";
    } else if (flCd > 0) {
      skillGluttonyBtn.className = "skill-btn skill-cooldown";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = `${flCd.toFixed(1)}s`;
    } else {
      skillGluttonyBtn.className = "skill-btn skill-ready";
      skillGluttonyBtn.disabled = false;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.ready") : "READY";
    }

    // X — Radiance unlocks at the second collapse (phase 12).
    if (phase < 12) {
      skillEngulfBtn.className = "skill-btn skill-locked";
      skillEngulfBtn.disabled = true;
      skillEngulfVal.textContent = I18n ? I18n.t("skills.locked_p12") : "LOCKED (P12)";
    } else if (rdCd > 0) {
      skillEngulfBtn.className = "skill-btn skill-cooldown";
      skillEngulfBtn.disabled = true;
      skillEngulfVal.textContent = `${rdCd.toFixed(1)}s`;
    } else {
      skillEngulfBtn.className = "skill-btn skill-ready";
      skillEngulfBtn.disabled = false;
      skillEngulfVal.textContent = I18n ? I18n.t("skills.ready") : "READY";
    }
    return;
  }

  // UMBRA SKILLS: Gravity Well (Z) + Erasure (X)
  if (swordId === "umbra") {
    skillGluttonyBtn.classList.remove("hidden");
    skillEngulfBtn.classList.remove("hidden");

    const zLabel = skillGluttonyBtn.querySelector(".skill-btn-label");
    const xLabel = skillEngulfBtn.querySelector(".skill-btn-label");
    if (zLabel) zLabel.textContent = I18n ? I18n.t("skills.gravity_well_label") : "[ Z — GRAVITY WELL ]";
    if (xLabel) xLabel.textContent = I18n ? I18n.t("skills.erasure_label") : "[ X — ERASURE ]";
    skillGluttonyBtn.title = I18n ? I18n.t("skills.gravity_well_title") : "Gravity Well [Z] — Rips every enemy within 3x your swing range toward you and deals 180% damage (Phase 7+, 30s CD)";
    skillEngulfBtn.title = I18n ? I18n.t("skills.erasure_title") : "Erasure [X] — Instantly erases every enemy below 25% HP within 3x your swing range; everything above takes 200% damage (Phase 12+, 70s CD)";

    const gwCd = (skillsData && typeof skillsData.gravityWellCooldown === "number")
      ? skillsData.gravityWellCooldown
      : (game && typeof game.gravityWellCooldown === "number" ? game.gravityWellCooldown : 0);
    const erCd = (skillsData && typeof skillsData.erasureCooldown === "number")
      ? skillsData.erasureCooldown
      : (game && typeof game.erasureCooldown === "number" ? game.erasureCooldown : 0);

    // Z — Gravity Well unlocks at the first deliberate collapse (phase 7).
    if (phase < 7) {
      skillGluttonyBtn.className = "skill-btn skill-locked";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.locked_p7") : "LOCKED (P7)";
    } else if (gwCd > 0) {
      skillGluttonyBtn.className = "skill-btn skill-cooldown";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = `${gwCd.toFixed(1)}s`;
    } else {
      skillGluttonyBtn.className = "skill-btn skill-ready";
      skillGluttonyBtn.disabled = false;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.ready") : "READY";
    }

    // X — Erasure unlocks at the second collapse (phase 12).
    if (phase < 12) {
      skillEngulfBtn.className = "skill-btn skill-locked";
      skillEngulfBtn.disabled = true;
      skillEngulfVal.textContent = I18n ? I18n.t("skills.locked_p12") : "LOCKED (P12)";
    } else if (erCd > 0) {
      skillEngulfBtn.className = "skill-btn skill-cooldown";
      skillEngulfBtn.disabled = true;
      skillEngulfVal.textContent = `${erCd.toFixed(1)}s`;
    } else {
      skillEngulfBtn.className = "skill-btn skill-ready";
      skillEngulfBtn.disabled = false;
      skillEngulfVal.textContent = I18n ? I18n.t("skills.ready") : "READY";
    }
    return;
  }

  // SANGUINE SKILLS: Bloodletting (Z) + Exsanguinate (X)
  if (swordId === "sanguine") {
    skillGluttonyBtn.classList.remove("hidden");
    skillEngulfBtn.classList.remove("hidden");

    const zLabel = skillGluttonyBtn.querySelector(".skill-btn-label");
    const xLabel = skillEngulfBtn.querySelector(".skill-btn-label");
    if (zLabel) zLabel.textContent = I18n ? I18n.t("skills.bloodletting_label") : "[ Z — BLOODLETTING ]";
    if (xLabel) xLabel.textContent = I18n ? I18n.t("skills.exsanguinate_label") : "[ X — EXSANGUINATE ]";
    skillGluttonyBtn.title = I18n ? I18n.t("skills.bloodletting_title") : "Bloodletting [Z] — Pay 15% of your current HP to deal 400% damage to everything within your swing range and heal for 30% of it (Phase 7+, 26s CD)";
    skillEngulfBtn.title = I18n ? I18n.t("skills.exsanguinate_title") : "Exsanguinate [X] — A 5s bleed field: 45% damage per second to everything inside while you heal for 10% of it (Phase 12+, 60s CD)";

    const blCd = (skillsData && typeof skillsData.bloodlettingCooldown === "number")
      ? skillsData.bloodlettingCooldown
      : (game && typeof game.bloodlettingCooldown === "number" ? game.bloodlettingCooldown : 0);
    const exCd = (skillsData && typeof skillsData.exsanguinateCooldown === "number")
      ? skillsData.exsanguinateCooldown
      : (game && typeof game.exsanguinateCooldown === "number" ? game.exsanguinateCooldown : 0);

    // Z — Bloodletting unlocks at the first deliberate collapse (phase 7).
    if (phase < 7) {
      skillGluttonyBtn.className = "skill-btn skill-locked";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.locked_p7") : "LOCKED (P7)";
    } else if (blCd > 0) {
      skillGluttonyBtn.className = "skill-btn skill-cooldown";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = `${blCd.toFixed(1)}s`;
    } else {
      skillGluttonyBtn.className = "skill-btn skill-ready";
      skillGluttonyBtn.disabled = false;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.ready") : "READY";
    }

    // X — Exsanguinate unlocks at the second collapse (phase 12).
    if (phase < 12) {
      skillEngulfBtn.className = "skill-btn skill-locked";
      skillEngulfBtn.disabled = true;
      skillEngulfVal.textContent = I18n ? I18n.t("skills.locked_p12") : "LOCKED (P12)";
    } else if (exCd > 0) {
      skillEngulfBtn.className = "skill-btn skill-cooldown";
      skillEngulfBtn.disabled = true;
      skillEngulfVal.textContent = `${exCd.toFixed(1)}s`;
    } else {
      skillEngulfBtn.className = "skill-btn skill-ready";
      skillEngulfBtn.disabled = false;
      skillEngulfVal.textContent = I18n ? I18n.t("skills.ready") : "READY";
    }
    return;
  }

  // ORDER SKILL: Judgment (Z)
  if (swordId === "order") {
    skillEngulfBtn.classList.add("hidden");
    skillGluttonyBtn.classList.remove("hidden");

    const labelEl = skillGluttonyBtn.querySelector(".skill-btn-label");
    if (labelEl) labelEl.textContent = I18n ? I18n.t("skills.judgment_label") : "[ Z — JUDGMENT ]";
    skillGluttonyBtn.title = I18n ? I18n.t("skills.judgment_title") : "Judgment [Z] — Mark targets on touch for 10s, then press [Z] again to execute 500% damage on all marked targets (Phase 4+, 45s CD)";

    const jCd = (skillsData && typeof skillsData.judgmentCooldown === "number")
      ? skillsData.judgmentCooldown
      : (game && typeof game.judgmentCooldown === "number" ? game.judgmentCooldown : 0);
    const jTimer = (skillsData && typeof skillsData.judgmentMarkingTimer === "number")
      ? skillsData.judgmentMarkingTimer
      : (game && typeof game.judgmentMarkingTimer === "number" ? game.judgmentMarkingTimer : 0);

    if (phase < 4) {
      skillGluttonyBtn.className = "skill-btn skill-locked";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.locked_p4") : "LOCKED (P4)";
    } else if (jTimer > 0) {
      skillGluttonyBtn.className = "skill-btn skill-ready";
      skillGluttonyBtn.disabled = false;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.verdict_ready", { time: jTimer.toFixed(1) }) : `VERDICT [Z] (${jTimer.toFixed(1)}s)`;
    } else if (jCd > 0) {
      skillGluttonyBtn.className = "skill-btn skill-cooldown";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = `${jCd.toFixed(1)}s`;
    } else {
      skillGluttonyBtn.className = "skill-btn skill-ready";
      skillGluttonyBtn.disabled = false;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.ready") : "READY";
    }
    return;
  }

  // TREMOR SKILL: Seismic Wave (Z)
  if (swordId === "tremor") {
    skillEngulfBtn.classList.add("hidden");
    skillGluttonyBtn.classList.remove("hidden");

    const labelEl = skillGluttonyBtn.querySelector(".skill-btn-label");
    if (labelEl) labelEl.textContent = I18n ? I18n.t("skills.seismic_wave_label") : "[ Z — SEISMIC WAVE ]";
    skillGluttonyBtn.title = I18n ? I18n.t("skills.seismic_wave_title") : "Seismic Wave [Z] — Launch a slow-moving devastating shockwave for 3s dealing 10× damage (Phase 6+, 45s CD)";

    const swCd = (skillsData && typeof skillsData.seismicWaveCooldown === "number")
      ? skillsData.seismicWaveCooldown
      : (game && typeof game.seismicWaveCooldown === "number" ? game.seismicWaveCooldown : 0);

    if (phase < 6) {
      skillGluttonyBtn.className = "skill-btn skill-locked";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.locked_p6") : "LOCKED (P6)";
    } else if (swCd > 0) {
      skillGluttonyBtn.className = "skill-btn skill-cooldown";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = `${swCd.toFixed(1)}s`;
    } else {
      skillGluttonyBtn.className = "skill-btn skill-ready";
      skillGluttonyBtn.disabled = false;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.ready") : "READY";
    }
    return;
  }

  // POISON SKILLS: Toxic Dash (Z) + Venomous Requiem (X)
  if (swordId === "poison") {
    skillGluttonyBtn.classList.remove("hidden");
    skillEngulfBtn.classList.remove("hidden");

    const zLabel = skillGluttonyBtn.querySelector(".skill-btn-label");
    const xLabel = skillEngulfBtn.querySelector(".skill-btn-label");
    if (zLabel) zLabel.textContent = I18n ? I18n.t("skills.toxic_dash_label") : "[ Z — TOXIC DASH ]";
    if (xLabel) xLabel.textContent = I18n ? I18n.t("skills.requiem_label") : "[ X — VENOMOUS REQUIEM ]";
    skillGluttonyBtn.title = I18n ? I18n.t("skills.toxic_dash_title") : "Toxic Dash [Z] — Dash forward 300px and inflict 1250% total poison damage over 5s (Phase 4+, 15s CD)";
    skillEngulfBtn.title = I18n ? I18n.t("skills.requiem_title") : "Venomous Requiem [X] — Record all poison damage for 30s, then execute nearby enemies for 125% stored damage + secondary poison (Phase 12+, 75s CD)";

    const tdCd = (skillsData && typeof skillsData.toxicDashCooldown === "number")
      ? skillsData.toxicDashCooldown
      : (game && typeof game.toxicDashCooldown === "number" ? game.toxicDashCooldown : 0);
    const rqCd = (skillsData && typeof skillsData.requiemCooldown === "number")
      ? skillsData.requiemCooldown
      : (game && typeof game.requiemCooldown === "number" ? game.requiemCooldown : 0);
    const isRecording = Boolean(skillsData ? skillsData.isRequiemRecording : (game && game.isRequiemRecording));
    const isReadyRelease = Boolean(skillsData ? skillsData.isRequiemReadyToRelease : (game && game.isRequiemReadyToRelease));
    const recTimer = (skillsData && typeof skillsData.requiemRecordingTimer === "number")
      ? skillsData.requiemRecordingTimer
      : (game && typeof game.requiemRecordingTimer === "number" ? game.requiemRecordingTimer : 0);
    const storedDmg = (skillsData && typeof skillsData.requiemStoredDamage === "number")
      ? skillsData.requiemStoredDamage
      : (game && typeof game.requiemStoredDamage === "number" ? game.requiemStoredDamage : 0);

    // Z — Toxic Dash (Phase 4+, 15s CD)
    if (phase < 4) {
      skillGluttonyBtn.className = "skill-btn skill-locked";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.locked_p4") : "LOCKED (P4)";
    } else if (tdCd > 0) {
      skillGluttonyBtn.className = "skill-btn skill-cooldown";
      skillGluttonyBtn.disabled = true;
      skillGluttonyVal.textContent = `${tdCd.toFixed(1)}s`;
    } else {
      skillGluttonyBtn.className = "skill-btn skill-ready";
      skillGluttonyBtn.disabled = false;
      skillGluttonyVal.textContent = I18n ? I18n.t("skills.ready") : "READY";
    }

    // X — Venomous Requiem (Phase 12+, 75s CD)
    if (phase < 12) {
      skillEngulfBtn.className = "skill-btn skill-locked";
      skillEngulfBtn.disabled = true;
      skillEngulfVal.textContent = I18n ? I18n.t("skills.locked_p12") : "LOCKED (P12)";
    } else if (isReadyRelease) {
      skillEngulfBtn.className = "skill-btn skill-ready";
      skillEngulfBtn.disabled = false;
      const fmtStored = window.Killstreak && window.Killstreak.formatNumber ? window.Killstreak.formatNumber(storedDmg).short : storedDmg;
      skillEngulfVal.textContent = I18n ? I18n.t("skills.requiem_execute", { dmg: fmtStored, defaultValue: `EXECUTE (${fmtStored})` }) : `EXECUTE (${fmtStored})`;
    } else if (isRecording) {
      skillEngulfBtn.className = "skill-btn skill-ready";
      skillEngulfBtn.disabled = false;
      skillEngulfVal.textContent = I18n ? I18n.t("skills.requiem_recording", { time: Math.ceil(recTimer), defaultValue: `RECORDING (${Math.ceil(recTimer)}s)` }) : `RECORDING (${Math.ceil(recTimer)}s)`;
    } else if (rqCd > 0) {
      skillEngulfBtn.className = "skill-btn skill-cooldown";
      skillEngulfBtn.disabled = true;
      skillEngulfVal.textContent = `${rqCd.toFixed(1)}s`;
    } else {
      skillEngulfBtn.className = "skill-btn skill-ready";
      skillEngulfBtn.disabled = false;
      skillEngulfVal.textContent = I18n ? I18n.t("skills.ready") : "READY";
    }
    return;
  }

  // DEVOURER SKILLS: Gluttony (Z) & Engulf (X)
  skillEngulfBtn.classList.remove("hidden");
  skillGluttonyBtn.classList.remove("hidden");

  const labelEl = skillGluttonyBtn.querySelector(".skill-btn-label");
  if (labelEl) labelEl.textContent = I18n ? I18n.t("skills.gluttony_label") : "[ Z — GLUTTONY ]";
  skillGluttonyBtn.title = I18n ? I18n.t("skills.gluttony_title") : "Gluttony [Z] — Beam attack (Phase 10+)";
  skillEngulfBtn.title = I18n ? I18n.t("skills.engulf_title") : "Engulf [X] — Devourer AoE aura (Phase 17)";

  const gCd = (skillsData && skillsData.gluttonyCooldown) || 0;
  const eCd = (skillsData && skillsData.engulfCooldown) || 0;

  // 1. Gluttony (Phase 10+)
  if (phase < 10) {
    skillGluttonyBtn.className = "skill-btn skill-locked";
    skillGluttonyBtn.disabled = true;
    skillGluttonyVal.textContent = I18n ? I18n.t("skills.locked_p10") : "LOCKED (P10)";
  } else if (gCd > 0) {
    skillGluttonyBtn.className = "skill-btn skill-cooldown";
    skillGluttonyBtn.disabled = true;
    skillGluttonyVal.textContent = `${gCd.toFixed(1)}s`;
  } else {
    skillGluttonyBtn.className = "skill-btn skill-ready";
    skillGluttonyBtn.disabled = false;
    skillGluttonyVal.textContent = I18n ? I18n.t("skills.ready") : "READY";
  }

  // 2. Engulf (Phase 17+)
  if (phase < 17) {
    skillEngulfBtn.className = "skill-btn skill-locked";
    skillEngulfBtn.disabled = true;
    skillEngulfVal.textContent = I18n ? I18n.t("skills.locked_p17") : "LOCKED (P17)";
  } else if (skillsData && skillsData.isEngulfActive) {
    skillEngulfBtn.className = "skill-btn skill-ready";
    skillEngulfBtn.disabled = true;
    skillEngulfVal.textContent = I18n ? I18n.t("skills.active") : "ACTIVE";
  } else if (eCd > 0) {
    skillEngulfBtn.className = "skill-btn skill-cooldown";
    skillEngulfBtn.disabled = true;
    skillEngulfVal.textContent = eCd >= 10 ? `${Math.ceil(eCd)}s` : `${eCd.toFixed(1)}s`;
  } else {
    skillEngulfBtn.className = "skill-btn skill-ready";
    skillEngulfBtn.disabled = false;
    skillEngulfVal.textContent = I18n ? I18n.t("skills.ready") : "READY";
  }
}

/**
 * Registers the two skill buttons.
 *
 * Phase 6 wiring relocation (the option-2 rule). Moved verbatim out of js/main.js.
 * activatePrimary/activateSecondary are the same entry points the Z and X keys
 * use, so buttons and hotkeys stay in lockstep by construction.
 *
 * @param {*} game
 */
export function initSkillsPanelWiring(game) {
  skillGluttonyBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    activatePrimary(game);
  });

  skillEngulfBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    activateSecondary(game);
  });
}
