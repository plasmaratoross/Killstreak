/**
 * Language toggle — swaps the menu button labels and re-applies translations.
 *
 * Phase 6, slice 8. Extracted from js/main.js; body verbatim, plus the wiring
 * added in the option-2 relocation pass (initLanguageWiring below).
 *
 * NOTE: KILLSTREAK_REFACTOR_GUIDE.md targets src/i18n/I18n.js for this function.
 * It lives here instead because I18n.js is the pure i18n engine that the legacy
 * modules import; hanging a DOM-mutating UI function off it would invert that
 * dependency. Worth reconciling with the guide.
 *
 * DELIBERATELY NOT HERE: the I18n.onLanguageChange() handler, which re-renders
 * the HUD, sword stand, library, achievements, debug grid and skills panel. That
 * is cross-module orchestration rather than language UI — pulling it in would
 * make this module import six others and turn it into a hub. It stays in main.js,
 * the composition root, which is the one place that legitimately knows them all.
 */
import {
  langBtnEn,
  langBtnVi
} from './domRefs.js';

const I18n = (typeof window !== "undefined" && window.Killstreak && window.Killstreak.I18n) || null;

/** @param {*} lang */
export function updateLanguageUI(lang) {
  if (langBtnEn && langBtnVi) {
    if (lang === "vi") {
      langBtnVi.classList.add("active");
      langBtnEn.classList.remove("active");
    } else {
      langBtnEn.classList.add("active");
      langBtnVi.classList.remove("active");
    }
  }
}

/**
 * Registers the two language buttons.
 *
 * Storage is resolved INSIDE the handler rather than captured at module load.
 * js/storage.js publishes it on window and this module evaluates earlier in the
 * graph, so an eager capture could be null where main.js's IIFE saw it populated.
 * By click time it is always there.
 *
 * @param {*} game
 */
export function initLanguageWiring(game) {
  if (langBtnEn) {
    langBtnEn.addEventListener("click", () => {
      if (I18n.getLanguage() !== "en") {
        I18n.setLanguage("en");
        if (game && game.saveData && game.saveData.settings) {
          game.saveData.settings.language = "en";
          const Storage = window.Killstreak && window.Killstreak.Storage;
          Storage.save(game.saveData);
        }
      }
    });
  }

  if (langBtnVi) {
    langBtnVi.addEventListener("click", () => {
      if (I18n.getLanguage() !== "vi") {
        I18n.setLanguage("vi");
        if (game && game.saveData && game.saveData.settings) {
          game.saveData.settings.language = "vi";
          const Storage = window.Killstreak && window.Killstreak.Storage;
          Storage.save(game.saveData);
        }
      }
    });
  }
}
