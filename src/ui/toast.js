/**
 * Toast notification UI.
 *
 * Phase 6, slice 6. Replaces the earlier speculative version of this module,
 * which re-queried the DOM on every call while js/main.js closure-captured the
 * refs. The body below is main.js's original, moved verbatim, so the captured-ref
 * semantics are preserved exactly and the two implementations no longer diverge.
 */
import {
  toast,
  toastIcon,
  toastTitle,
  toastDesc
} from './domRefs.js';

let toastTimeout = null;

/** @param {*} title @param {*} desc @param {*} icon */
export function showToast(title, desc, icon = "👁️") {
  if (!toast || !toastTitle || !toastDesc) return;
  toastTitle.textContent = title;
  toastDesc.textContent = desc;
  if (toastIcon) toastIcon.textContent = icon;
  toast.classList.remove("hidden");
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}
