/**
 * Centralized Internationalization (I18n) System
 * Provides seamless English and Vietnamese localization for all UI, HUD,
 * weapons, phases, achievements, zones, cutscenes, and toasts.
 *
 * Phase 1 refactor: the two dictionary literals that used to live inline in
 * `js/i18n.js` now live in `en.json` / `vi.json`. The logic below is carried
 * over verbatim — same API, same fallbacks, same interpolation.
 *
 * The object is still published as `window.Killstreak.I18n` because the legacy
 * modules (game.js, entities.js, main.js, map.js) read it from the namespace.
 */
import en from './en.json';
import vi from './vi.json';

window.Killstreak = window.Killstreak || {};

const translations = {
  en,
  vi
};

let currentLang = "en";
const listeners = [];

function getNestedValue(obj, keyPath) {
  if (!obj || !keyPath) return null;
  const parts = keyPath.split(".");
  let curr = obj;
  for (const part of parts) {
    if (curr == null || typeof curr !== "object") return null;
    curr = curr[part];
  }
  return curr;
}

const I18n = {
  currentLang: "en",
  translations,

  init(lang = "en") {
    this.setLanguage(lang, false);
  },

  getLanguage() {
    return currentLang;
  },

  setLanguage(lang, notify = true) {
    if (lang !== "en" && lang !== "vi") {
      lang = "en";
    }
    currentLang = lang;
    this.currentLang = lang;

    // Update HTML lang attribute
    if (document.documentElement) {
      document.documentElement.setAttribute("lang", lang);
    }

    this.applyToDOM();

    if (notify) {
      listeners.forEach(fn => {
        try {
          fn(currentLang);
        } catch (err) {
          console.error("[I18n Listener Error]", err);
        }
      });
    }
  },

  onLanguageChange(callback) {
    if (typeof callback === "function") {
      listeners.push(callback);
    }
  },

  t(key, params = {}) {
    if (!key) return "";

    // 1. Check current language
    let val = getNestedValue(translations[currentLang], key);

    // 2. Fallback to English
    if (val === null || val === undefined) {
      val = getNestedValue(translations.en, key);
    }

    // 3. Fall back to the caller's default, then to the key itself.
    //    Honouring `defaultValue` matters: returning the raw key is why a missing
    //    translation renders as plausible-looking text ("zones.unit_normal") and
    //    survives review. 21 call sites already pass a defaultValue expecting it to
    //    be used — before this they were dead arguments. The legacy implementation
    //    never read it either, so keys that DO resolve are unaffected.
    if (val === null || val === undefined) {
      return typeof params.defaultValue === "string" ? params.defaultValue : key;
    }

    if (typeof val !== "string") {
      return val;
    }

    // 4. Interpolate {param}
    return val.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, pName) => {
      return params[pName] !== undefined ? params[pName] : match;
    });
  },

  applyToDOM(root = document) {
    if (!root || !root.querySelectorAll) return;

    // 1. data-i18n (textContent)
    root.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (key) {
        const text = this.t(key);
        if (text) el.textContent = text;
      }
    });

    // 2. data-i18n-title (title tooltip attribute)
    root.querySelectorAll("[data-i18n-title]").forEach(el => {
      const key = el.getAttribute("data-i18n-title");
      if (key) {
        const text = this.t(key);
        if (text) el.setAttribute("title", text);
      }
    });

    // 3. data-i18n-placeholder (placeholder attribute)
    root.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (key) {
        const text = this.t(key);
        if (text) el.setAttribute("placeholder", text);
      }
    });
  },

  // Localization Helpers for Dynamic Content
  getSwordInfo(swordId) {
    const sId = (swordId || "devourer").toLowerCase();
    const sData = (translations[currentLang].swords && translations[currentLang].swords[sId])
      || translations.en.swords[sId];
    if (sData) return sData;

    const swDef = window.Killstreak && window.Killstreak.Config && window.Killstreak.Config.SWORDS && window.Killstreak.Config.SWORDS[sId];
    if (swDef) {
      return {
        name: swDef.name,
        tag: swDef.tag || "WEAPON",
        description: swDef.description || ""
      };
    }
    return { name: swordId, tag: "WEAPON", description: "" };
  },

  getPhaseInfo(swordId, phaseNumber) {
    const sId = (swordId || "devourer").toLowerCase();
    const pNum = Number(phaseNumber) || 1;
    const phasesDict = (translations[currentLang].phases && translations[currentLang].phases[sId])
      || translations.en.phases[sId]
      || {};
    let phaseData = phasesDict[pNum] || (translations.en.phases[sId] && translations.en.phases[sId][pNum]);
    if (!phaseData) {
      const swDef = window.Killstreak && window.Killstreak.Config && window.Killstreak.Config.SWORDS && window.Killstreak.Config.SWORDS[sId];
      const match = swDef && swDef.phases && swDef.phases.find(p => p.phase === pNum);
      if (match) {
        phaseData = {
          name: match.name,
          shortName: match.shortName,
          effects: match.effects,
          notification: match.notification
        };
      }
    }
    return phaseData || {
      name: `Phase ${pNum}`,
      shortName: `Phase ${pNum}`,
      effects: ""
    };
  },

  getAchievementInfo(achId) {
    const items = (translations[currentLang].achievements && translations[currentLang].achievements.items)
      || translations.en.achievements.items;
    return items[achId] || translations.en.achievements.items[achId] || { title: achId, description: "" };
  },

  getZoneLabel(zoneId) {
    const zones = translations[currentLang].zones || translations.en.zones;
    return zones[zoneId] || translations.en.zones[zoneId] || zoneId;
  },

  getNpcInfo(npcId) {
    if (!npcId) return null;
    const npcs = translations[currentLang].npcs || translations.en.npcs;
    return (npcs && npcs[npcId]) || (translations.en.npcs && translations.en.npcs[npcId]) || null;
  },

  getMapName(mapId) {
    if (!mapId) return "";
    const maps = translations[currentLang].maps || translations.en.maps;
    let upper = String(mapId).toUpperCase();
    if (upper === "GRASSLAND") upper = "COMBAT";
    return maps[upper] || maps[mapId] || (translations.en.maps && (translations.en.maps[upper] || translations.en.maps[mapId])) || mapId;
  }
};

window.Killstreak.I18n = I18n;

export default I18n;
export { translations };
