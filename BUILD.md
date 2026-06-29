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

Tests are being migrated to Vitest (unit/node) and Playwright (browser). Run:

`npm test`

## CI

GitHub Actions (`.github/workflows/ci.yml`) installs deps and runs tests on
Node 18, 20, and 26 LTS, plus a production-dependency `npm audit`.
