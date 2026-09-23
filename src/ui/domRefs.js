/**
 * domRefs — every DOM element js/main.js used to look up in its own body.
 *
 * Phase 6, slice 1. These are the 122 `document.getElementById` constants that
 * were declared at the top of the main.js IIFE. They were hoisted here so the
 * UI modules can import them by name — ES module named imports bind the same
 * identifiers, so no call site had to change.
 *
 * Resolved once, at module evaluation. `document` must be queryable when this
 * module loads, which it is: js/main.js is imported as a deferred module script
 * and index.html declares every element statically.
 *
 * A missing element yields `null`, exactly as it did inline. Call sites already
 * guard for that (e.g. `if (mapModal) ...`); do not add throwing guards here or
 * the behaviour would diverge.
 */

export const canvas = document.getElementById("game-canvas");
export const mainMenu = document.getElementById("main-menu");
export const gameplayHud = document.getElementById("gameplay-hud");
export const swordModal = document.getElementById("sword-modal");
export const libraryModal = document.getElementById("library-modal");
export const achievementsModal = document.getElementById("achievements-modal");
export const settingsModal = document.getElementById("settings-modal");
export const mapModal = document.getElementById("map-modal");
export const gameOverScreen = document.getElementById("game-over-screen");
export const interactionPrompt = document.getElementById("interaction-prompt");
export const interactionText = document.getElementById("interaction-text");
export const minimapWidget = document.getElementById("minimap-widget");
export const menuPlayBtn = document.getElementById("menu-play-btn");
export const menuLibraryBtn = document.getElementById("menu-library-btn");
export const menuAchievementsBtn = document.getElementById("menu-achievements-btn");
export const menuSettingsBtn = document.getElementById("menu-settings-btn");
export const hudHpText = document.getElementById("hud-hp-text");
export const hudHpBar = document.getElementById("hud-hp-bar");
export const hudShieldBar = document.getElementById("hud-shield-bar");
export const hudKillstreakVal = document.getElementById("hud-killstreak-val");
export const hudKillsVal = document.getElementById("hud-kills-val");
export const hudSwordName = document.getElementById("hud-sword-name");
export const hudPhasePill = document.getElementById("hud-phase-pill");
export const hudPhaseText = document.getElementById("hud-phase-text");
export const hudAreaLabel = document.getElementById("hud-area-label");
export const hudStatsBtn = document.getElementById("hud-stats-btn");
export const hudLibraryBtn = document.getElementById("hud-library-btn");
export const hudLobbyBtn = document.getElementById("hud-lobby-btn");
export const hudMenuBtn = document.getElementById("hud-menu-btn");
export const skillGluttonyBtn = document.getElementById("skill-gluttony-btn");
export const skillGluttonyVal = document.getElementById("skill-gluttony-val");
export const skillEngulfBtn = document.getElementById("skill-engulf-btn");
export const skillEngulfVal = document.getElementById("skill-engulf-val");
export const standSwordName = document.getElementById("stand-sword-name");
export const standSwordPhase = document.getElementById("stand-sword-phase");
export const standSwordBase = document.getElementById("stand-sword-base");
export const standSwordScaling = document.getElementById("stand-sword-scaling");
export const standSwordDamage = document.getElementById("stand-sword-damage");
export const standEquipBtn = document.getElementById("stand-equip-btn");
export const closeSwordBtn = document.getElementById("close-sword-btn");
export const swordStandCloseBtn = document.getElementById("sword-stand-close-btn");
export const standSwordIcon = document.getElementById("stand-sword-icon");
export const standWeaponTitle = document.getElementById("stand-weapon-title");
export const standSwordLockHint = document.getElementById("stand-sword-lock-hint");
export const standCurrentKills = document.getElementById("stand-current-kills");
export const hudDmgVal = document.getElementById("hud-dmg-val");
export const hudScaleVal = document.getElementById("hud-scale-val");
export const closeLibraryBtn = document.getElementById("close-library-btn");
export const closeLibraryBtnBottom = document.getElementById("close-library-btn-bottom");
export const tabSwordsBtn = document.getElementById("tab-swords-btn");
export const tabBadgesBtn = document.getElementById("tab-badges-btn");
export const tabNpcsBtn = document.getElementById("tab-npcs-btn");
export const librarySwordsSection = document.getElementById("library-swords-section");
export const libraryBadgesSection = document.getElementById("library-badges-section");
export const libraryNpcsSection = document.getElementById("library-npcs-section");
export const libraryPhasesContainer = document.getElementById("library-phases-container");
export const libraryBadgesContainer = document.getElementById("library-badges-container");
export const libraryNpcsContainer = document.getElementById("library-npcs-container");
export const libNpcsTotalCount = document.getElementById("lib-npcs-total-count");
export const libTabDevourer = document.getElementById("lib-tab-devourer");
export const libTabOverdrive = document.getElementById("lib-tab-overdrive");
export const libTabAquatic = document.getElementById("lib-tab-aquatic");
export const libTabSoil = document.getElementById("lib-tab-soil");
export const libTabMetallic = document.getElementById("lib-tab-metallic");
export const libTabFlora = document.getElementById("lib-tab-flora");
export const libTabHellfire = document.getElementById("lib-tab-hellfire");
export const libTabWindy = document.getElementById("lib-tab-windy");
export const libSwordTag = document.getElementById("lib-sword-tag");
export const libSwordName = document.getElementById("lib-sword-name");
export const libSwordDesc = document.getElementById("lib-sword-desc");
export const closeAchievementsBtn = document.getElementById("close-achievements-btn");
export const closeAchievementsBtnBottom = document.getElementById("close-achievements-btn-bottom");
export const badgesList = document.getElementById("badges-list");
export const closeSettingsBtn = document.getElementById("close-settings-btn");
export const closeSettingsBtnBottom = document.getElementById("close-settings-btn-bottom");
export const langBtnEn = document.getElementById("lang-btn-en");
export const langBtnVi = document.getElementById("lang-btn-vi");
export const settingShake = document.getElementById("setting-shake");
export const settingNumbers = document.getElementById("setting-numbers");
export const settingDamageTaken = document.getElementById("setting-damage-taken");
export const resetSaveBtn = document.getElementById("reset-save-btn");
export const settingsCogTrigger = document.getElementById("settings-cog-trigger");
export const debugAuthContainer = document.getElementById("debug-auth-container");
export const debugPasswordInput = document.getElementById("debug-password-input");
export const debugPasswordSubmit = document.getElementById("debug-password-submit");
export const debugPasswordError = document.getElementById("debug-password-error");
export const debugPanel = document.getElementById("debug-panel");
export const debugModeToggle = document.getElementById("debug-mode-toggle");
export const debugStatusPill = document.getElementById("debug-status-pill");
export const debugActionsArea = document.getElementById("debug-actions-area");
export const debugCustomKillsInput = document.getElementById("debug-custom-kills-input");
export const debugAddCustomKillsBtn = document.getElementById("debug-add-custom-kills-btn");
export const debugSetCustomKillsBtn = document.getElementById("debug-set-custom-kills-btn");
export const debugGrantAllBadgesBtn = document.getElementById("debug-grant-all-badges-btn");
export const debugIndividualBadgesList = document.getElementById("debug-individual-badges-list");
export const debugKillstreakHud = document.getElementById("debug-killstreak-hud");
export const debugHudStreakInput = document.getElementById("debug-hud-streak-input");
export const debugHudStreakApply = document.getElementById("debug-hud-streak-apply");
export const debugHudEventBtn = document.getElementById("debug-hud-event-btn");
export const debugSummonBloodmoonBtn = document.getElementById("debug-summon-bloodmoon-btn");
export const debugEndBloodmoonBtn = document.getElementById("debug-end-bloodmoon-btn");
export const statsModal = document.getElementById("stats-modal");
export const closeStatsBtn = document.getElementById("close-stats-btn");
export const closeStatsBtnBottom = document.getElementById("close-stats-btn-bottom");
export const statTotalPlaytime = document.getElementById("stat-total-playtime");
export const statTotalKills = document.getElementById("stat-total-kills");
export const statHighestStreak = document.getElementById("stat-highest-streak");
export const statCurrentPhase = document.getElementById("stat-current-phase");
export const runStreak = document.getElementById("run-streak");
export const runWeapon = document.getElementById("run-weapon");
export const runPhase = document.getElementById("run-phase");
export const runBestStreak = document.getElementById("run-best-streak");
export const respawnCombatBtn = document.getElementById("respawn-combat-btn");
export const returnLobbyBtn = document.getElementById("return-lobby-btn");
export const toast = document.getElementById("toast");
export const toastIcon = document.getElementById("toast-icon");
export const toastTitle = document.getElementById("toast-title");
export const toastDesc = document.getElementById("toast-desc");
export const cutsceneOverlay = document.getElementById("cutscene-overlay");
export const cutsceneSpeaker = document.getElementById("cutscene-speaker");
export const cutsceneText = document.getElementById("cutscene-text");
export const cutsceneSkipBtn = document.getElementById("cutscene-skip-btn");
