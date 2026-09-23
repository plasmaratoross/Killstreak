/**
 * Persistent Storage Manager
 * Preserves progression, badges, achievements, and user settings.
 */
(function(window) {
  window.Killstreak = window.Killstreak || {};

  const Config = window.Killstreak.Config;
  const STORAGE_KEY = (Config && Config.GAME_CONFIG && Config.GAME_CONFIG.storageKey) || "killstreak_v1_data";

  const DEFAULT_SAVE = {
    kills: 0,
    totalKills: 0,
    playTime: 0,
    highestKillstreak: 0,
    swordPhase: 1,
    overdrivePhase: 1,
    aquaticPhase: 1,
    soilPhase: 1,
    metallicPhase: 1,
    floraPhase: 1,
    hellfirePhase: 1,
    windyPhase: 1,
    equippedSword: "devourer",
    isSwordEquipped: true,
    phase17CutsceneSeen: false,
    aquaticUnlockCutsceneSeen: false,
    aquaticPhase13CutsceneSeen: false,
    soilUnlockCutsceneSeen: false,
    soilPhase10CutsceneSeen: false,
    metallicUnlockCutsceneSeen: false,
    metallicPhase10CutsceneSeen: false,
    floraUnlockCutsceneSeen: false,
    floraPhase10CutsceneSeen: false,
    hellfireUnlockCutsceneSeen: false,
    hellfirePhase10CutsceneSeen: false,
    windyUnlockCutsceneSeen: false,
    windyPhase13CutsceneSeen: false,
    achievements: [],
    badges: [],
    settings: {
      screenShake: true,
      damageNumbers: true,
      damageTaken: true,
      language: "en"
    }
  };

  const Storage = {
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { ...DEFAULT_SAVE, achievements: [], badges: [], settings: { ...DEFAULT_SAVE.settings } };
        const parsed = JSON.parse(raw);
        const rawKills = typeof parsed.totalKills === "number"
          ? parsed.totalKills
          : (typeof parsed.kills === "number" ? parsed.kills : 0);
        const unifiedKills = Math.max(0, rawKills);
        const playTimeVal = typeof parsed.playTime === "number" ? parsed.playTime : 0;
        const currentLang = (parsed.settings && (parsed.settings.language === "vi" || parsed.settings.language === "en"))
          ? parsed.settings.language
          : "en";
        const validSwords = ["devourer", "overdrive", "aquatic", "soil", "metallic", "flora", "hellfire", "windy"];
        const eqSword = validSwords.includes(parsed.equippedSword) ? parsed.equippedSword : "devourer";
        return {
          kills: unifiedKills,
          totalKills: unifiedKills,
          playTime: playTimeVal,
          highestKillstreak: typeof parsed.highestKillstreak === "number" ? parsed.highestKillstreak : 0,
          swordPhase: typeof parsed.swordPhase === "number" ? parsed.swordPhase : 1,
          overdrivePhase: typeof parsed.overdrivePhase === "number" ? parsed.overdrivePhase : 1,
          aquaticPhase: typeof parsed.aquaticPhase === "number" ? parsed.aquaticPhase : 1,
          soilPhase: typeof parsed.soilPhase === "number" ? parsed.soilPhase : 1,
          metallicPhase: typeof parsed.metallicPhase === "number" ? parsed.metallicPhase : 1,
          floraPhase: typeof parsed.floraPhase === "number" ? parsed.floraPhase : 1,
          hellfirePhase: typeof parsed.hellfirePhase === "number" ? parsed.hellfirePhase : 1,
          windyPhase: typeof parsed.windyPhase === "number" ? parsed.windyPhase : 1,
          equippedSword: eqSword,
          isSwordEquipped: typeof parsed.isSwordEquipped === "boolean" ? parsed.isSwordEquipped : true,
          phase17CutsceneSeen: Boolean(parsed.phase17CutsceneSeen),
          aquaticUnlockCutsceneSeen: Boolean(parsed.aquaticUnlockCutsceneSeen),
          aquaticPhase13CutsceneSeen: Boolean(parsed.aquaticPhase13CutsceneSeen),
          soilUnlockCutsceneSeen: Boolean(parsed.soilUnlockCutsceneSeen),
          soilPhase10CutsceneSeen: Boolean(parsed.soilPhase10CutsceneSeen),
          metallicUnlockCutsceneSeen: Boolean(parsed.metallicUnlockCutsceneSeen),
          metallicPhase10CutsceneSeen: Boolean(parsed.metallicPhase10CutsceneSeen),
          floraUnlockCutsceneSeen: Boolean(parsed.floraUnlockCutsceneSeen),
          floraPhase10CutsceneSeen: Boolean(parsed.floraPhase10CutsceneSeen),
          hellfireUnlockCutsceneSeen: Boolean(parsed.hellfireUnlockCutsceneSeen),
          hellfirePhase10CutsceneSeen: Boolean(parsed.hellfirePhase10CutsceneSeen),
          windyUnlockCutsceneSeen: Boolean(parsed.windyUnlockCutsceneSeen),
          windyPhase13CutsceneSeen: Boolean(parsed.windyPhase13CutsceneSeen),
          achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
          badges: Array.isArray(parsed.badges) ? parsed.badges : [],
          settings: {
            screenShake: parsed.settings && typeof parsed.settings.screenShake === "boolean" ? parsed.settings.screenShake : true,
            damageNumbers: parsed.settings && typeof parsed.settings.damageNumbers === "boolean" ? parsed.settings.damageNumbers : true,
            damageTaken: parsed.settings && typeof parsed.settings.damageTaken === "boolean" ? parsed.settings.damageTaken : true,
            language: currentLang
          }
        };
      } catch (err) {
        console.warn("[Killstreak Storage] Failed to load data, using defaults.", err);
        return { ...DEFAULT_SAVE, achievements: [], badges: [], settings: { ...DEFAULT_SAVE.settings } };
      }
    },

    save(data) {
      if (!data) return;
      const rawKills = typeof data.totalKills === "number"
        ? data.totalKills
        : (typeof data.kills === "number" ? data.kills : 0);
      const unifiedKills = Math.max(0, rawKills);
      data.kills = unifiedKills;
      data.totalKills = unifiedKills;

      const lang = data.settings && (data.settings.language === "vi" || data.settings.language === "en")
        ? data.settings.language
        : "en";

      const validSwords = ["devourer", "overdrive", "aquatic", "soil", "metallic", "flora", "hellfire", "windy"];
      const eqSword = validSwords.includes(data.equippedSword) ? data.equippedSword : "devourer";

      const payload = {
        kills: unifiedKills,
        totalKills: unifiedKills,
        playTime: typeof data.playTime === "number" ? data.playTime : 0,
        highestKillstreak: typeof data.highestKillstreak === "number" ? data.highestKillstreak : 0,
        swordPhase: typeof data.swordPhase === "number" ? data.swordPhase : 1,
        overdrivePhase: typeof data.overdrivePhase === "number" ? data.overdrivePhase : 1,
        aquaticPhase: typeof data.aquaticPhase === "number" ? data.aquaticPhase : 1,
        soilPhase: typeof data.soilPhase === "number" ? data.soilPhase : 1,
        metallicPhase: typeof data.metallicPhase === "number" ? data.metallicPhase : 1,
        floraPhase: typeof data.floraPhase === "number" ? data.floraPhase : 1,
        hellfirePhase: typeof data.hellfirePhase === "number" ? data.hellfirePhase : 1,
        windyPhase: typeof data.windyPhase === "number" ? data.windyPhase : 1,
        equippedSword: eqSword,
        isSwordEquipped: typeof data.isSwordEquipped === "boolean" ? data.isSwordEquipped : true,
        phase17CutsceneSeen: Boolean(data.phase17CutsceneSeen),
        aquaticUnlockCutsceneSeen: Boolean(data.aquaticUnlockCutsceneSeen),
        aquaticPhase13CutsceneSeen: Boolean(data.aquaticPhase13CutsceneSeen),
        soilUnlockCutsceneSeen: Boolean(data.soilUnlockCutsceneSeen),
        soilPhase10CutsceneSeen: Boolean(data.soilPhase10CutsceneSeen),
        metallicUnlockCutsceneSeen: Boolean(data.metallicUnlockCutsceneSeen),
        metallicPhase10CutsceneSeen: Boolean(data.metallicPhase10CutsceneSeen),
        floraUnlockCutsceneSeen: Boolean(data.floraUnlockCutsceneSeen),
        floraPhase10CutsceneSeen: Boolean(data.floraPhase10CutsceneSeen),
        hellfireUnlockCutsceneSeen: Boolean(data.hellfireUnlockCutsceneSeen),
        hellfirePhase10CutsceneSeen: Boolean(data.hellfirePhase10CutsceneSeen),
        windyUnlockCutsceneSeen: Boolean(data.windyUnlockCutsceneSeen),
        windyPhase13CutsceneSeen: Boolean(data.windyPhase13CutsceneSeen),
        achievements: Array.isArray(data.achievements) ? [...data.achievements] : [],
        badges: Array.isArray(data.badges) ? [...data.badges] : [],
        settings: data.settings ? {
          screenShake: typeof data.settings.screenShake === "boolean" ? data.settings.screenShake : true,
          damageNumbers: typeof data.settings.damageNumbers === "boolean" ? data.settings.damageNumbers : true,
          damageTaken: typeof data.settings.damageTaken === "boolean" ? data.settings.damageTaken : true,
          language: lang
        } : { screenShake: true, damageNumbers: true, damageTaken: true, language: "en" }
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
        console.warn("[Killstreak Storage] Failed to save data.", err);
      }
    },

    reset(keepLanguage = true) {
      let currentLang = "en";
      if (keepLanguage) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.settings && (parsed.settings.language === "vi" || parsed.settings.language === "en")) {
              currentLang = parsed.settings.language;
            }
          }
        } catch (_) {}
      }

      const freshSave = {
        ...DEFAULT_SAVE,
        achievements: [],
        badges: [],
        settings: { ...DEFAULT_SAVE.settings, language: currentLang }
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(freshSave));
      } catch (err) {
        console.warn("[Killstreak Storage] Failed to reset data.", err);
      }
      return freshSave;
    }
  };

  window.Killstreak.Storage = Storage;
})(window);
