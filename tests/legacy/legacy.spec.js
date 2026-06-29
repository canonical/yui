/**
 * Legacy YUITest harness runner.
 *
 * The upstream suite under src/<mod>/tests/unit/*.html is FROZEN reference (see
 * AGENTS.md / BUILD.md) and must not be modified. We run a curated, fast subset
 * here so the original assertions still execute alongside the new Vitest +
 * Playwright tests, driving each unmodified .html through build/yui exactly as
 * the upstream/Launchpad combo loader does. We never edit the harnesses; we only
 * load them and read the test-console verdict.
 *
 * Adding a module is a one-liner in HARNESSES; it must finish within `timeout`.
 */
const { test, expect } = require("@playwright/test");

// Curated deterministic subset (pure-logic, no network/touch/iframe/animation).
// Flaky harnesses are excluded by design: io/pjax (XHR), gestures/tap
// (touch), node-scroll-info (scroll), widget/anim/transition/get (timing),
// and assets/page-*/test-frame/xframe (iframe fixtures, not standalone).
// Run `node tests/legacy/survey.mjs` to re-classify the full set.
const HARNESSES = [
    "src/yql/tests/unit/yql.html",
    "src/oop/tests/unit/oop.html",
    "src/json/tests/unit/json.html",
    "src/color/tests/unit/color-base.html",
    "src/collection/tests/unit/array-extras.html",
    "src/escape/tests/unit/escape.html",
    "src/querystring/tests/unit/querystring.html",
    "src/cache/tests/unit/cache.html",
    "src/cookie/tests/unit/cookie.html",
    "src/promise/tests/unit/promise.html",
    "src/base/tests/unit/base.html",
    "src/attribute/tests/unit/attribute.html"
];

for (const path of HARNESSES) {
    test(`legacy: ${path}`, async ({ page }) => {
        await page.goto(`/${path}`);
        await page.waitForFunction(
            () =>
                /Passed:\d+ Failed:\d+ Total:\d+/.test(
                    document.body.innerText
                ),
            undefined,
            { timeout: 30_000 }
        );
        const verdict = (await page.innerText("body")).match(
            /Passed:(\d+) Failed:(\d+) Total:(\d+)/
        );
        expect(verdict, "test-console produced no verdict").not.toBeNull();
        const [, passed, failed, total] = verdict.map(Number);
        expect(total, "no tests ran").toBeGreaterThan(0);
        expect(failed, `${failed} legacy assertions failed`).toBe(0);
        expect(passed).toBe(total);
    });
}
