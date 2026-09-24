/**
 * Library modal — the three-section codex (SWORDS, BADGES, BESTIARY).
 *
 * Phase 6, slice 9. Extracted from js/main.js; bodies verbatim.
 *
 * `selectedLibrarySword` is the one piece of state that travels with the group.
 * It moved into this module, and the seven tab handlers that used to assign it
 * directly now call setSelectedLibrarySword() — a bare assignment left in
 * main.js can no longer reach a module binding. renderLibrarySwords() still
 * reads it from here, so the read/write pair stays intact.
 *
 * renderLibraryNpcs() is state-free: it reads window.Killstreak.Data / .NPC
 * directly, exactly as it did inside the IIFE.
 */
import {
  tabSwordsBtn,
  tabBadgesBtn,
  tabNpcsBtn,
  librarySwordsSection,
  libraryBadgesSection,
  libraryNpcsSection,
  libraryPhasesContainer,
  libraryBadgesContainer,
  libraryNpcsContainer,
  libNpcsTotalCount,
  libTabDevourer,
  libTabOverdrive,
  libTabAquatic,
  libTabSoil,
  libTabMetallic,
  libTabFlora,
  libTabHellfire,
  libTabWindy,
  libTabFrostbite,
  libSwordTag,
  libSwordName,
  libSwordDesc
} from './domRefs.js';
import { formatNumber } from '../utils/format.js';

let selectedLibrarySword = "devourer";

const Config = (typeof window !== "undefined" && window.Killstreak && window.Killstreak.Config) || null;
const I18n = (typeof window !== "undefined" && window.Killstreak && window.Killstreak.I18n) || null;

/** @param {*} game */
export function renderLibrary(game) {
  renderLibrarySwords(game);

  // 2. BADGES Section
  libraryBadgesContainer.innerHTML = "";
  Config.ACHIEVEMENTS.forEach((badge) => {
    const isUnlocked = game.saveData.badges.includes(badge.id || badge.badge);
    const achInfo = I18n ? I18n.getAchievementInfo(badge.id) : badge;
    const item = document.createElement("div");
    item.className = `badge-item ${isUnlocked ? "unlocked" : "locked"}`;
    const statusText = isUnlocked ? (I18n ? I18n.t("library.badge_unlocked") : "UNLOCKED") : (I18n ? I18n.t("library.badge_locked") : "LOCKED");
    // Phase 7: skeleton via innerHTML, data via textContent.
    item.innerHTML = `
      <div class="badge-icon"></div>
      <div class="badge-details">
        <div class="badge-name"></div>
        <div class="badge-desc"></div>
      </div>
      <span class="badge-status-tag"></span>
    `;
    item.querySelector(".badge-icon").textContent = badge.icon;
    item.querySelector(".badge-name").textContent = achInfo.title;
    item.querySelector(".badge-desc").textContent = achInfo.description;
    const statusTag = item.querySelector(".badge-status-tag");
    statusTag.classList.add(isUnlocked ? "unlocked" : "locked");
    statusTag.textContent = statusText;
    libraryBadgesContainer.appendChild(item);
  });

  // 3. BESTIARY (NPCS) Section
  renderLibraryNpcs();
}

export function renderLibraryNpcs() {
  if (!libraryNpcsContainer) return;
  libraryNpcsContainer.innerHTML = "";

  const Data = window.Killstreak.Data || {};
  const npcsData = Data.NPCs || {};
  const npcList = Object.values(npcsData);

  // Sort strictly from weakest to strongest (ascending maxHp)
  npcList.sort((a, b) => (a.maxHp || 0) - (b.maxHp || 0));

  if (libNpcsTotalCount) {
    libNpcsTotalCount.textContent = I18n
      ? I18n.t("library.npc_count", { count: npcList.length })
      : `${npcList.length} KNOWN ENTITIES`;
  }

  const NPC_ICONS = {
    normal: "🌲",
    fairy: "🧚",
    thug: "🗡️",
    guard: "🛡️",
    swordman: "⚔️",
    buff_man: "💪",
    elf: "🏹",
    ironborn: "⛓️",
    bloodfang: "🐺",
    arcanist: "🔮",
    colossus: "🗿",
    starforged: "✨",
    grizzlehorn: "🦏",
    brambleback: "🪵",
    embermane: "🔥",
    duskhorn: "🌒",
    mirewalker: "🍄",
    thunderhoof: "⚡",
    gloomscale: "🐉",
    wildtusk: "🐗",
    moonmane: "🌙",
    crimsonhide: "👑"
  };

  const NPC_ZONES = {
    normal: "zone_north",
    fairy: "zone_fairy_north",
    thug: "zone_thug_camp",
    guard: "zone_guard",
    swordman: "zone_swordman",
    buff_man: "zone_buff_man",
    elf: "zone_elf",
    ironborn: "zone_ironborn",
    bloodfang: "zone_bloodfang",
    arcanist: "zone_arcanist",
    colossus: "zone_colossus",
    starforged: "zone_starforged",
    grizzlehorn: "zone_grizzlehorn",
    brambleback: "zone_brambleback",
    embermane: "zone_embermane",
    duskhorn: "zone_duskhorn",
    mirewalker: "zone_mirewalker",
    thunderhoof: "zone_thunderhoof",
    gloomscale: "zone_gloomscale",
    wildtusk: "zone_wildtusk",
    moonmane: "zone_moonmane",
    crimsonhide: "zone_crimsonhide"
  };

  function getTierBadge(rank) {
    if (rank <= 4) return { cls: "tier-novice", label: I18n ? I18n.t("library.tier_1") : "TIER I • NOVICE", border: "#64748b" };
    if (rank <= 8) return { cls: "tier-adept", label: I18n ? I18n.t("library.tier_2") : "TIER II • ADEPT", border: "#10b981" };
    if (rank <= 12) return { cls: "tier-elite", label: I18n ? I18n.t("library.tier_3") : "TIER III • ELITE", border: "#0284c7" };
    if (rank <= 17) return { cls: "tier-dread", label: I18n ? I18n.t("library.tier_4") : "TIER IV • DREAD", border: "#f59e0b" };
    return { cls: "tier-apex", label: I18n ? I18n.t("library.tier_5") : "TIER V • APEX", border: "#ef4444" };
  }

  const statHpLabel = I18n ? I18n.t("library.stat_hp") : "HP";
  const statDmgLabel = I18n ? I18n.t("library.stat_damage") : "DAMAGE";
  const statAtkLabel = I18n ? I18n.t("library.stat_attack_speed") : "ATK RATE";
  const statStreakLabel = I18n ? I18n.t("library.stat_streak") : "STREAK";
  const statKillsLabel = I18n ? I18n.t("library.stat_kills") : "KILLS";
  const statRespawnLabel = I18n ? I18n.t("library.stat_respawn") : "RESPAWN";
  const statZoneLabel = I18n ? I18n.t("library.stat_location") : "ZONE";

  npcList.forEach((npc, index) => {
    const rank = index + 1;
    const tier = getTierBadge(rank);
    const icon = NPC_ICONS[npc.id] || "👾";
    const npcInfo = I18n ? I18n.getNpcInfo(npc.id) : null;
    const name = (npcInfo && npcInfo.name) || npc.name || npc.id.toUpperCase();
    const desc = (npcInfo && npcInfo.desc) || npc.description || "";

    const zoneKey = NPC_ZONES[npc.id] || `zone_${npc.id}`;
    const zoneName = I18n ? I18n.getZoneLabel(zoneKey) : zoneKey;

    const hpFormatted = Number(npc.maxHp || 0).toLocaleString();
    const dmgFormatted = Number(npc.damage || 0).toLocaleString();
    const atkRate = (npc.attackRate || 0).toFixed(2) + "s";
    const streakFormatted = "+" + Number(npc.killstreakAwarded || 0).toLocaleString();
    const killsFormatted = "+" + Number(npc.killsAwarded || 1);
    const respawn = (npc.respawnDelay || 5).toFixed(1) + "s";

    const card = document.createElement("div");
    card.className = "library-npc-card";
    card.style.borderLeftColor = npc.color || tier.border;

    // Phase 7: the skeleton stays in innerHTML; every value that comes from data or
    // i18n is written through the DOM API, including the data-npc-id ATTRIBUTE and
    // the zone title, which are the injection-sensitive parts.
    card.innerHTML = `
      <div class="library-npc-card-top">
        <div class="npc-avatar-box">
          <canvas class="npc-avatar-canvas" width="44" height="44"></canvas>
        </div>
        <div class="npc-meta-group">
          <div class="npc-title-row">
            <span class="npc-rank-badge"></span>
            <span class="npc-name"></span>
            <span class="npc-tier-pill"></span>
          </div>
          <p class="npc-desc"></p>
        </div>
      </div>
      <div class="npc-stats-grid">
        <div class="npc-stat-item">
          <span class="npc-stat-label"></span>
          <span class="npc-stat-value hp-val"></span>
        </div>
        <div class="npc-stat-item">
          <span class="npc-stat-label"></span>
          <span class="npc-stat-value dmg-val"></span>
        </div>
        <div class="npc-stat-item">
          <span class="npc-stat-label"></span>
          <span class="npc-stat-value"></span>
        </div>
        <div class="npc-stat-item">
          <span class="npc-stat-label"></span>
          <span class="npc-stat-value streak-val"></span>
        </div>
        <div class="npc-stat-item">
          <span class="npc-stat-label"></span>
          <span class="npc-stat-value"></span>
        </div>
        <div class="npc-stat-item">
          <span class="npc-stat-label"></span>
          <span class="npc-stat-value"></span>
        </div>
        <div class="npc-stat-item" style="grid-column: span 2;">
          <span class="npc-stat-label"></span>
          <span class="npc-stat-value zone-val"></span>
        </div>
      </div>
    `;
    card.querySelector(".npc-avatar-canvas").dataset.npcId = npc.id;
    card.querySelector(".npc-rank-badge").textContent = `#${rank}`;
    card.querySelector(".npc-name").textContent = `${icon} ${name}`;
    card.querySelector(".npc-tier-pill").classList.add(tier.cls);
    card.querySelector(".npc-tier-pill").textContent = tier.label;
    card.querySelector(".npc-desc").textContent = desc;
    const statLabels = [statHpLabel, statDmgLabel, statAtkLabel, statStreakLabel, statKillsLabel, statRespawnLabel, statZoneLabel];
    const statValues = [hpFormatted, dmgFormatted, atkRate, streakFormatted, killsFormatted, respawn, `📍 ${zoneName}`];
    card.querySelectorAll(".npc-stat-label").forEach((el, i) => { el.textContent = statLabels[i]; });
    card.querySelectorAll(".npc-stat-value").forEach((el, i) => { el.textContent = statValues[i]; });
    card.querySelector(".zone-val").title = zoneName;

    libraryNpcsContainer.appendChild(card);

    // Render crisp canvas avatar.
    // The guard used to read window.Killstreak.NPC, which has never existed — the
    // namespace exposes NPC under Entities. So this block was dead: every bestiary
    // avatar was left blank (0 painted pixels, vs 1434 for a rendered one). The
    // class signature is (x, y, zoneIndex, type, slotIndex), which is exactly what
    // the call below passes. The catch still degrades to a flat circle.
    const canvas = card.querySelector(".npc-avatar-canvas");
    if (canvas && window.Killstreak && window.Killstreak.Entities && window.Killstreak.Entities.NPC) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, 44, 44);
      ctx.save();
      // Circular clipping
      ctx.beginPath();
      ctx.arc(22, 22, 21, 0, Math.PI * 2);
      ctx.clip();

      // Background glow matching NPC color
      const glow = ctx.createRadialGradient(22, 22, 4, 22, 22, 22);
      glow.addColorStop(0, npc.glowColor || npc.color || "rgba(56, 189, 248, 0.4)");
      glow.addColorStop(1, "rgba(10, 16, 28, 0.8)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 44, 44);

      const radius = npc.radius || 18;
      const scale = Math.min(0.85, 16 / radius);
      ctx.translate(22, 22);
      ctx.scale(scale, scale);
      ctx.translate(-22, -22);

      try {
        const dummyNpc = new window.Killstreak.Entities.NPC(22, 22, 0, npc.id, 0);
        dummyNpc.hp = dummyNpc.maxHp;
        dummyNpc.isHostile = false;
        dummyNpc.draw(ctx);
      } catch(e) {
        ctx.beginPath();
        ctx.arc(22, 22, radius, 0, Math.PI * 2);
        ctx.fillStyle = npc.color || "#ef4444";
        ctx.fill();
      }
      ctx.restore();
    }
  });
}

/** @param {*} game */
export function renderLibrarySwords(game) {
  const sId = selectedLibrarySword;
  const swordDef = (Config.SWORDS && Config.SWORDS[sId]) || Config.SWORDS.devourer;
  const sInfo = I18n ? I18n.getSwordInfo(sId) : swordDef;

  if (libSwordTag) libSwordTag.textContent = sInfo.tag || "WEAPON";
  if (libSwordName) libSwordName.textContent = `${swordDef.icon} ${sInfo.name.toUpperCase()}`;
  if (libSwordDesc) libSwordDesc.textContent = sInfo.description;

  if (libTabDevourer) {
    libTabDevourer.textContent = I18n ? I18n.getSwordInfo("devourer").name.toUpperCase() : "DEVOURER";
    if (sId === "devourer") libTabDevourer.classList.add("active");
    else libTabDevourer.classList.remove("active");
  }
  if (libTabOverdrive) {
    libTabOverdrive.textContent = I18n ? I18n.getSwordInfo("overdrive").name.toUpperCase() : "OVERDRIVE";
    if (sId === "overdrive") libTabOverdrive.classList.add("active");
    else libTabOverdrive.classList.remove("active");
  }
  if (libTabAquatic) {
    libTabAquatic.textContent = I18n ? I18n.getSwordInfo("aquatic").name.toUpperCase() : "AQUATIC";
    if (sId === "aquatic") libTabAquatic.classList.add("active");
    else libTabAquatic.classList.remove("active");
  }
  if (libTabSoil) {
    libTabSoil.textContent = I18n ? I18n.getSwordInfo("soil").name.toUpperCase() : "SOIL";
    if (sId === "soil") libTabSoil.classList.add("active");
    else libTabSoil.classList.remove("active");
  }
  if (libTabMetallic) {
    libTabMetallic.textContent = I18n ? I18n.getSwordInfo("metallic").name.toUpperCase() : "METALLIC";
    if (sId === "metallic") libTabMetallic.classList.add("active");
    else libTabMetallic.classList.remove("active");
  }
  if (libTabFlora) {
    libTabFlora.textContent = I18n ? I18n.getSwordInfo("flora").name.toUpperCase() : "FLORA";
    if (sId === "flora") libTabFlora.classList.add("active");
    else libTabFlora.classList.remove("active");
  }
  if (libTabHellfire) {
    libTabHellfire.textContent = I18n ? I18n.getSwordInfo("hellfire").name.toUpperCase() : "HELLFIRE";
    if (sId === "hellfire") libTabHellfire.classList.add("active");
    else libTabHellfire.classList.remove("active");
  }
  if (libTabWindy) {
    libTabWindy.textContent = I18n ? I18n.getSwordInfo("windy").name.toUpperCase() : "WINDY";
    if (sId === "windy") libTabWindy.classList.add("active");
    else libTabWindy.classList.remove("active");
  }
  if (libTabFrostbite) {
    libTabFrostbite.textContent = I18n ? I18n.getSwordInfo("frostbite").name.toUpperCase() : "FROSTBITE";
    if (sId === "frostbite") libTabFrostbite.classList.add("active");
    else libTabFrostbite.classList.remove("active");
  }

  const phases = swordDef.phases;
  libraryPhasesContainer.innerHTML = "";

  phases.forEach((p) => {
    const isCurrent = game.player.swordId === sId && p.phase === game.player.phase.phase;
    const card = document.createElement("div");
    card.className = `library-phase-card ${isCurrent ? "current-phase-card" : ""}`;
    const pInfo = I18n ? I18n.getPhaseInfo(sId, p.phase) : p;
    const finalBadgeText = I18n ? I18n.t("library.final_badge") : "👑 FINAL TRANSFORMATION";
    const weakBadgeText = I18n ? I18n.t("library.transitional_hurdle") : "TRANSITIONAL HURDLE";
    const collapseText = I18n ? I18n.t("library.deliberate_collapse") : "DELIBERATE COLLAPSE";
    const isWeakDev = sId === "devourer" && (p.phase === 9 || p.phase === 16);
    const isWeakAq = sId === "aquatic" && p.phase === 8;
    const isWeakSoil = sId === "soil" && p.phase === 9;
    // Frostbite's two deliberate collapses, straight from the sword spec.
    const isWeakFb = sId === "frostbite" && (p.phase === 7 || p.phase === 11);
    // metallic p8, flora p7 and hellfire p7 were flagged here too, so they carried a
    // DELIBERATE COLLAPSE badge. They are not weak phases: their stats rise normally
    // (e.g. hellfire p7 9,072 DMG -> p8 18,144 DMG) and none of their render modules
    // has a collapse variant, unlike aquatic p8 and soil p9 whose data carries
    // weaponType "collapse" plus a cracked/weakened visual. A weak badge on them was
    // simply wrong, so they were dropped rather than relabelled TRANSITIONAL HURDLE.
    const showWeakBadge = isWeakDev || isWeakAq || isWeakSoil || isWeakFb;
    const weakIsCollapse = isWeakAq || isWeakSoil || isWeakFb;

    let scaledRow = null;
    if (isCurrent && game.player.isSwordEquipped) {
      const fScDmg = formatNumber(game.player.damage);
      const fScHp = formatNumber(game.player.maxHp);
      const fScKills = formatNumber(game.player.phaseKills || 0);
      scaledRow = {
        title: `${fScDmg.full} DMG • ${fScHp.full} HP`,
        text: I18n ? I18n.t("library.active_scaled", { damage: fScDmg.short, hp: fScHp.short, kills: fScKills.short }) : `Active Scaled: ${fScDmg.short} DMG • ${fScHp.short} HP (+${fScKills.short} kills in active phase)`
      };
    }

    const fBaseDmg = formatNumber(p.damage);
    const fBaseHp = formatNumber(p.maxHp);
    const fReqKills = formatNumber(p.killsRequired);
    const baseStatsText = I18n ? I18n.t("pedestal.base_stats_val", { damage: fBaseDmg.short, hp: fBaseHp.short }) : `Base: ${fBaseDmg.short} DMG • ${fBaseHp.short} HP`;
    const reqText = I18n ? I18n.t("library.req_streak", { kills: fReqKills.short }) : `Requirement: ${fReqKills.short} Killstreak`;
    const spdUnit = I18n ? I18n.t("library.speed_unit") : "SPD";

    // Phase 7: skeleton via innerHTML; every data-derived value goes through the
    // DOM API. The inline colour uses setAttribute rather than `el.style.color`
    // because the HTML parser keeps a style attribute's text verbatim
    // ("color: #94a3b8;") whereas the CSSOM re-serialises it to
    // "color: rgb(148, 163, 184);" — the computed colour is identical, but the
    // DOM would differ. Verified in-browser before choosing.
    card.innerHTML = `
      <div class="library-phase-header">
        <span class="library-phase-title"></span>
        <span class="library-phase-dmg"></span>
      </div>
      <div class="library-phase-req"></div>
      <div class="library-phase-desc"></div>
    `;

    const titleEl = card.querySelector(".library-phase-title");
    titleEl.setAttribute("style", `color: ${p.color};`);
    titleEl.appendChild(document.createTextNode(
      `\n          ${isCurrent ? "▶ " : ""}${sInfo.name.toUpperCase()} — ${pInfo.name.toUpperCase()} `
    ));
    if (p.isFinal) {
      const finalEl = document.createElement("span");
      finalEl.className = "library-final-badge";
      finalEl.textContent = finalBadgeText;
      titleEl.appendChild(finalEl);
    }
    if (showWeakBadge) {
      const weakEl = document.createElement("span");
      weakEl.setAttribute("style", "font-size: 10px; color: #94a3b8; border: 1px solid rgba(148,163,184,0.4); border-radius: 4px; padding: 1px 5px; margin-left: 6px;");
      weakEl.textContent = weakIsCollapse ? collapseText : weakBadgeText;
      titleEl.appendChild(weakEl);
    }
    titleEl.appendChild(document.createTextNode("\n        "));

    card.querySelector(".library-phase-dmg").textContent = `${baseStatsText} • ${p.speed || 20} ${spdUnit}`;
    card.querySelector(".library-phase-req").textContent = reqText;

    const descEl = card.querySelector(".library-phase-desc");
    descEl.textContent = pInfo.effects;

    // scaledRow sits BETWEEN req and desc in the original template, so it is
    // inserted rather than appended.
    if (scaledRow) {
      const scaledEl = document.createElement("div");
      scaledEl.setAttribute("style", "font-size: 11px; color: #38bdf8; font-weight: 700; margin: 2px 0;");
      scaledEl.setAttribute("title", scaledRow.title);
      scaledEl.textContent = `\n          ${scaledRow.text}\n        `;
      card.insertBefore(scaledEl, descEl);
    }

    if (pInfo.notification) {
      const notifEl = document.createElement("div");
      notifEl.setAttribute("style", "font-size: 11px; color: #cbd5e1; font-style: italic; margin-top: 4px;");
      // The literal quotes are now characters in a text node, so a notification
      // containing a " can no longer break the markup.
      notifEl.textContent = `"${pInfo.notification}"`;
      card.appendChild(notifEl);
    }

    libraryPhasesContainer.appendChild(card);
  });
}

/** @param {string} id */
export function setSelectedLibrarySword(id) {
  selectedLibrarySword = id;
}

/**
 * Registers the Library's three section tabs and the seven sword tabs.
 *
 * Phase 6 wiring relocation (the option-2 rule): this block moved verbatim out of
 * js/main.js so the Library module owns its own event wiring, rather than main.js
 * reaching into the Library's DOM. main.js calls this once, after `game` exists.
 *
 * The `if (node)` guards are kept exactly as they were — they preserve the old
 * behaviour when an element is absent from index.html.
 *
 * @param {*} game
 */
export function initLibraryWiring(game) {
  // Library Three-Section Navigation (SWORDS, BADGES, BESTIARY)
  if (tabSwordsBtn) {
    tabSwordsBtn.addEventListener("click", () => {
      tabSwordsBtn.classList.add("active");
      if (tabBadgesBtn) tabBadgesBtn.classList.remove("active");
      if (tabNpcsBtn) tabNpcsBtn.classList.remove("active");
      if (librarySwordsSection) librarySwordsSection.classList.remove("hidden");
      if (libraryBadgesSection) libraryBadgesSection.classList.add("hidden");
      if (libraryNpcsSection) libraryNpcsSection.classList.add("hidden");
    });
  }

  if (tabBadgesBtn) {
    tabBadgesBtn.addEventListener("click", () => {
      tabBadgesBtn.classList.add("active");
      if (tabSwordsBtn) tabSwordsBtn.classList.remove("active");
      if (tabNpcsBtn) tabNpcsBtn.classList.remove("active");
      if (libraryBadgesSection) libraryBadgesSection.classList.remove("hidden");
      if (librarySwordsSection) librarySwordsSection.classList.add("hidden");
      if (libraryNpcsSection) libraryNpcsSection.classList.add("hidden");
    });
  }

  if (tabNpcsBtn) {
    tabNpcsBtn.addEventListener("click", () => {
      tabNpcsBtn.classList.add("active");
      if (tabSwordsBtn) tabSwordsBtn.classList.remove("active");
      if (tabBadgesBtn) tabBadgesBtn.classList.remove("active");
      if (libraryNpcsSection) libraryNpcsSection.classList.remove("hidden");
      if (librarySwordsSection) librarySwordsSection.classList.add("hidden");
      if (libraryBadgesSection) libraryBadgesSection.classList.add("hidden");
      renderLibraryNpcs();
    });
  }

  if (libTabDevourer) {
    libTabDevourer.addEventListener("click", () => {
      setSelectedLibrarySword("devourer");
      renderLibrarySwords(game);
    });
  }

  if (libTabOverdrive) {
    libTabOverdrive.addEventListener("click", () => {
      setSelectedLibrarySword("overdrive");
      renderLibrarySwords(game);
    });
  }

  if (libTabAquatic) {
    libTabAquatic.addEventListener("click", () => {
      setSelectedLibrarySword("aquatic");
      renderLibrarySwords(game);
    });
  }

  if (libTabSoil) {
    libTabSoil.addEventListener("click", () => {
      setSelectedLibrarySword("soil");
      renderLibrarySwords(game);
    });
  }

  if (libTabMetallic) {
    libTabMetallic.addEventListener("click", () => {
      setSelectedLibrarySword("metallic");
      renderLibrarySwords(game);
    });
  }

  if (libTabFlora) {
    libTabFlora.addEventListener("click", () => {
      setSelectedLibrarySword("flora");
      renderLibrarySwords(game);
    });
  }

  if (libTabHellfire) {
    libTabHellfire.addEventListener("click", () => {
      setSelectedLibrarySword("hellfire");
      renderLibrarySwords(game);
    });
  }

  if (libTabWindy) {
    libTabWindy.addEventListener("click", () => {
      setSelectedLibrarySword("windy");
      renderLibrarySwords(game);
    });
  }

  if (libTabFrostbite) {
    libTabFrostbite.addEventListener("click", () => {
      setSelectedLibrarySword("frostbite");
      renderLibrarySwords(game);
    });
  }
}
