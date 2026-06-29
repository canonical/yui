Building
========

This is a security-maintained fork of YUI 3. The original `grunt`/`yogi`/`bower`
toolchain targeted Node 0.10/0.11 and is dead; it is no longer installed or run.

## build/ is hand-synced

Built artifacts under `build/` are committed and must stay in sync with their
`src/` counterparts. When you change a module's source, update the matching
`build/<module>/<module>.js`, `-debug.js`, and `-min.js` by hand and commit them
together. No build step runs on `npm install`.

The legacy `Gruntfile.js` is retained for historical reference only.

## Testing

Tests run on Vitest (unit/node) and Playwright (browser):

- `npm test` / `npm run test:node` — Vitest, `tests/node/**`. Covers CommonJS
  consumption, browser combo asset integrity, `YUI().use()` bootstrap, and a
  `yql-nodejs._send` transport regression.
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
Node 18, 20, and 26 LTS, plus a production-dependency `npm audit`.
