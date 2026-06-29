/**
 * Port of src/yql/tests/unit/assets/yql-tests.js to Vitest. Mocks the Node
 * transport (`_send`) instead of JSONP so query logic is exercised without
 * network. Mirrors the original mock-driven cases.
 */
import { describe, it, expect, vi } from "vitest";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { YUI } = require(join(root, "build/yui-nodejs/yui-nodejs.js"));

function ready(mock) {
    return new Promise((res) =>
        YUI().use("yql", (Y) => {
            Y.YQLRequest.prototype._send = function (url, o) {
                setTimeout(() => o.on.success(mock()), 0);
            };
            res(Y);
        })
    );
}

describe("YQL", () => {
    it("exposes YQL/YQLRequest", async () => {
        const Y = await ready(() => ({}));
        expect(typeof Y.YQL).toBe("function");
        expect(typeof Y.YQLRequest).toBe("function");
    });

    it("returns a query object", async () => {
        const Y = await ready(() => ({ query: { count: 1 } }));
        const r = await new Promise((res) =>
            Y.YQL("select * from weather.forecast where location=62896", res)
        );
        expect(r.query.count).toBe(1);
    });

    it("surfaces an error object on failure", async () => {
        const Y = await ready(() => ({ error: {} }));
        const r = await new Promise((res) =>
            Y.YQL("select * from weatherFOO.forecast", res)
        );
        expect(typeof r.error).toBe("object");
    });

    it("handles escaped queries", async () => {
        const Y = await ready(() => ({ query: {} }));
        const r = await new Promise((res) =>
            Y.YQL('select * from html where url = "http://x/genres/506"', res)
        );
        expect(typeof r.query).toBe("object");
    });

    it("re-sends on demand", async () => {
        const Y = await ready(() => ({ query: {} }));
        let n = 0;
        await new Promise((res) => {
            const q = Y.YQL("select * from weather.forecast", () => {
                n += 1;
                if (n === 1) q.send();
                else res();
            });
        });
        expect(n).toBe(2);
    });

    it("runs callback with provided context", async () => {
        const Y = await ready(() => ({ query: {} }));
        const ctx = await new Promise((res) =>
            Y.YQL(
                "select * from weather.forecast",
                function () {
                    res(this);
                },
                { context: Y }
            )
        );
        expect(ctx).toBe(Y);
    });
});
