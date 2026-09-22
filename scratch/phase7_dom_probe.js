/**
 * Phase 7 DOM-equivalence probe (NOT part of the automated suite).
 *
 * Phase 7 rewrites innerHTML interpolation into DOM-API writes. Its safety
 * argument is "the rendered DOM is unchanged", so it needs an oracle. This probe
 * is that oracle, but it needs a real DOM, and the rest of scratch/ runs under
 * bare Node — so it cannot be wired into the verifier sweep. Run it by pasting
 * the body of probe() into the browser console (or via the Playwright browser
 * tools) with the dev server up.
 *
 * CANONICAL FORM, and why it is not a raw innerHTML hash:
 *   tag + sorted attributes + whitespace-collapsed visible text.
 * A raw innerHTML hash would flag insignificant whitespace (e.g. the blank
 * source lines that used to hold the ${scaledRow}/${notifRow} placeholders) as a
 * regression, which is noise. Collapsing whitespace in BOTH attribute values and
 * text nodes makes the oracle sensitive to structure, attributes and content, and
 * blind to formatting.
 *
 * Determinism: call game.resetAllProgress() first, then click each sword tab.
 * After a reset only the active sword has a `current` card, and `scaledRow` needs
 * isCurrent && isSwordEquipped — devourer satisfies both, so it is the tab that
 * exercises the conditional rows.
 *
 * Baselines captured 2026-09-23 BEFORE the renderLibrarySwords rewrite
 * (77 cards across 7 tabs), all reproduced identically AFTER:
 *   lib-tab-devourer  4c33d6dc  len 7604  cards 17  hasScaled true
 *   lib-tab-overdrive afa112e7  len 3774  cards  7
 *   lib-tab-aquatic   6c119dc7  len 7036  cards 13
 *   lib-tab-soil      f0bf58fe  len 5812  cards 10
 *   lib-tab-metallic  3ce90c61  len 5565  cards 10
 *   lib-tab-flora     58837983  len 5673  cards 10
 *   lib-tab-hellfire  386b78d5  len 5480  cards 10
 */
export function probe() {
  const canon = (root) => {
    const parts = [];
    const walk = (node) => {
      if (node.nodeType === 3) {
        const t = node.nodeValue.replace(/\s+/g, ' ').trim();
        if (t) parts.push('T:' + t);
        return;
      }
      if (node.nodeType !== 1) return;
      const attrs = Array.from(node.attributes)
        .map(a => a.name + '=' + a.value.replace(/\s+/g, ' ').trim()).sort().join('|');
      parts.push('<' + node.tagName + ' ' + attrs + '>');
      node.childNodes.forEach(walk);
    };
    walk(root);
    return parts.join('\n');
  };
  const hash = (s) => {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16).padStart(8, '0');
  };

  window.Killstreak.game.resetAllProgress();

  const res = {};
  for (const tab of document.querySelectorAll('[id^="lib-tab"]')) {
    tab.click();
    const c = document.getElementById('library-phases-container');
    const s = canon(c);
    res[tab.id] = {
      hash: hash(s),
      len: s.length,
      cards: c.querySelectorAll('.library-phase-card').length,
      hasScaled: s.includes('Active Scaled')
    };
  }
  return res;
}
