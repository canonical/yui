/**
 * Browser consumption smoke test. Launchpad loads the committed minified seed
 * (build/yui/yui-min.js) + modules via its combo loader. This injects those
 * exact artifacts into a real Chromium page and confirms the seed boots, a YUI
 * sandbox initializes, and the yql module exposes its public API in-browser.
 */
const { test, expect } = require("@playwright/test");
const { join } = require("node:path");

const root = join(__dirname, "..", "..");
const f = (p) => join(root, "build", p);

test("minified seed boots and loads yql + oop in-browser", async ({
    page
}) => {
    await page.setContent("<!doctype html><title>yui</title>");
    for (const p of [
        "yui/yui-min.js",
        "oop/oop-min.js",
        "jsonp/jsonp-min.js",
        "yql/yql-min.js"
    ]) {
        await page.addScriptTag({ path: f(p) });
    }

    const ok = await page.evaluate(
        () =>
            new Promise((res, rej) => {
                if (typeof window.YUI !== "function")
                    return rej("no YUI global");
                YUI().use("yql", (Y) =>
                    res(
                        typeof Y.YQL === "function" &&
                            typeof Y.YQLRequest === "function"
                    )
                );
                setTimeout(() => rej("use timeout"), 5000);
            })
    );
    expect(ok).toBe(true);
});
