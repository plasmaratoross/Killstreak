/**
 * Cutscene overlay UI wiring.
 *
 * Phase 6 wiring relocation (the option-2 rule), moved out of js/main.js.
 *
 * WHY THIS IS NOT IN src/systems/CutsceneSystem.js: that module is deliberately
 * DOM-free so scratch/verify_cutscenes.mjs can import it under plain Node and test
 * it behaviour-for-behaviour. Adding a domRefs import there made that harness throw
 * "document.getElementById is not a function". The overlay listeners belong to the
 * UI layer; the system stays pure.
 */
import { cutsceneOverlay, cutsceneSkipBtn } from './domRefs.js';
import * as CutsceneSystem from '../systems/CutsceneSystem.js';

/** @param {*} game */
export function initCutsceneWiring(game) {
  cutsceneOverlay.addEventListener("click", (e) => {
    if (e.target === cutsceneSkipBtn) return;
    CutsceneSystem.advance(game);
  });

  cutsceneSkipBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    CutsceneSystem.skip(game);
  });
}
