import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * Two build targets.
 *
 *   vite build              → dist/ as ordinary web output: hashed assets, multiple
 *                             files, must be served over HTTP.
 *   vite build --mode offline → dist/index.html: ONE self-contained file that can be
 *                             double-clicked. This is not a convenience — it is the
 *                             only shape that runs from file://.
 *
 * Why: the app is an ES module graph. Browsers refuse to fetch a module script over
 * file:// (the page's origin is `null`), so opening index.html from disk gives a
 * fully rendered menu and a completely dead script — no error the user can see.
 * The pre-refactor build used 30+ plain <script> tags, which file:// does allow,
 * so "double-click and play" regressed when the entry became a single module.
 * Inlining collapses the graph into one classic script, which file:// permits.
 */
export default defineConfig(({ mode }) => {
  const offline = mode === 'offline';

  return {
    root: '.',
    publicDir: 'public',
    // Relative asset URLs, so the offline file works from any path. Kept at the
    // default '/' for the web build, where an absolute base is correct.
    base: offline ? './' : '/',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    // viteSingleFile() inlines the JS and CSS and, with its default recommended
    // build config, also forces inlineDynamicImports + a single non-split CSS file.
    plugins: offline ? [viteSingleFile()] : [],
    server: {
      open: true,
      port: 5173,
    },
  };
});
