Building
========

This is a security-maintained fork of YUI 3. The original `grunt`/`yogi`/`bower`
toolchain targeted Node 0.10/0.11 and is dead; it is no longer installed or run.

## build/ is hand-synced

Built artifacts under `build/` are committed and must stay in sync with their
`src/` counterparts. When you change a module's source, update the matching
`build/<module>/<module>.js`, `-debug.js`, and `-min.js` by hand and commit them
together. No build step runs on `npm install`.

## Native networking (no `request` dependency)

The deprecated `request` module (which transitively pulled vulnerable
`form-data`, advisory 1109540) has been removed entirely. All Node transports
now use native `fetch` + `AbortSignal.timeout`, so the package ships with **zero**
runtime dependencies. Affected modules — keep `src/` and `build/` in sync:

- `yql-nodejs` — `Y.YQLRequest._send`.
- `io-nodejs` — `Y.IO.request` is a fetch shim returning `(err, {statusCode,
  headers, body})`, preserving the legacy transport surface.
- `get-nodejs` (also bundled in `build/yui-nodejs/*`) — remote module loading.

Requires a runtime with global `fetch`/`AbortSignal.timeout` (Node 20+).

## Testing

Tests run on Vitest (unit/node) and Playwright (browser):

- `npm test` / `npm run test:node` — Vitest, `tests/node/**`. Covers CommonJS
  consumption, browser combo asset integrity, `YUI().use()` bootstrap, and a
  `yql-nodejs._send` fetch-transport regression.
- `npm run test:browser` — Playwright, `tests/browser/**`. Boots the committed
  minified seed in Chromium (mirrors Launchpad's combo loading). Requires
  `npx playwright install chromium` first.
- `npm run test:legacy` — Playwright, runs a curated subset of the **frozen**
  upstream YUITest harnesses (`src/<mod>/tests/unit/*.html`) unmodified through
  `build/yui`. Do not edit the harnesses; extend the list in
  `tests/legacy/legacy.spec.js` only. The subset is deterministic (pure logic);
  network/touch/iframe/animation harnesses are excluded as flaky.
- `node tests/legacy/survey.mjs` — diagnostic sweep of all 315 unit harnesses
  (not in CI). Baseline: 288 pass, 8 fail, 19 timeout — the failures/timeouts are
  io/pjax (XHR), gestures/tap (touch), node-scroll-info, widget/anim/transition/
  get (timing), and assets/page-*/test-frame/xframe (iframe fixtures).
- `npm run test:all` — everything.

## CI

GitHub Actions (`.github/workflows/ci.yml`) installs deps and runs tests on
Node 20 and 26 LTS, plus a production-dependency `npm audit`.

## Publishing (flattened npm layout)

The published package must mirror the historical `yui` npm package: every module
sits at the **tarball root** (e.g. `yui/yui-min.js`, `loader/loader-min.js`,
`cssreset/cssreset.css`) with **no `build/` prefix**. Downstream consumers such as
Launchpad symlink `node_modules/yui` and serve files by these root-relative paths
via their combo loader (`yui/<module>/<module>-min.js`) and `combo.scss`
(`cssreset/cssreset.css`, `<module>/assets/skins/sam/*.css`).

`build/` is **not** moved in the repo (it stays under `build/` so the layout is
obvious and diffable). Instead `npm run stage-npm` copies the committed `build/`
output into a `npm-dist/` staging dir whose root *is* the build output, and the
package is published from there:

- `npm run stage-npm` — stage `npm-dist/` from `build/`. Strips `*-coverage.js`
  and any `*.swf` (Flash; Launchpad deletes these, keep it a no-op), writes a
  flattened `index.js` (`require("./yui-nodejs/yui-nodejs.js")` → `{ YUI }`) and a
  trimmed `package.json` (`main: index.js`, no scripts/devDependencies).
- `npm run publish-npm` — `stage-npm` then `npm publish ./npm-dist`.

CI publishes the same way: `.github/workflows/publish.yml` runs `stage-npm` and
`npm publish ./npm-dist` via npm OIDC trusted publishing (no `NPM_TOKEN`).

Verify the contract before tagging:

```sh
npm run stage-npm && cd npm-dist \
  && npm pack --dry-run | grep -E 'yui/yui-min.js|loader/loader-min.js|cssreset/cssreset.css'
```

All three must appear with **no** `build/` prefix.
