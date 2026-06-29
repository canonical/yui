/**
 * Regression test pinning the CURRENT (request-based) behavior of
 * yql-nodejs `_send`, which has no upstream coverage. This locks the contract
 * before Phase 3 swaps the transport to native fetch:
 *   - GET with timeout = o.timeout || 30000.
 *   - success: o.on.success(JSON.parse(res.body)).
 *   - error:   o.on.success({ error: err }).
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Replace the deprecated `request` module in the cache so we capture transport
// options and drive the callback deterministically (no network).
const calls = [];
const reqId = require.resolve("request");
require.cache[reqId] = {
    id: reqId,
    exports: (url, opts, cb) => calls.push({ url, opts, cb }),
    loaded: true
};

const { YUI } = require(join(root, "build/yui-nodejs/yui-nodejs.js"));
const withYql = () => new Promise((res) => YUI().use("yql", res));

describe("yql-nodejs _send (current request transport)", () => {
    beforeEach(() => {
        calls.length = 0;
    });

    it("issues a GET with default 30s timeout", async () => {
        const Y = await withYql();
        Y.YQLRequest.prototype._send("https://example/yql", {
            on: { success() {} }
        });
        expect(calls).toHaveLength(1);
        expect(calls[0].url).toBe("https://example/yql");
        expect(calls[0].opts.method).toBe("GET");
        expect(calls[0].opts.timeout).toBe(30000);
    });

    it("honours an explicit timeout", async () => {
        const Y = await withYql();
        Y.YQLRequest.prototype._send("https://example/yql", {
            timeout: 5000,
            on: { success() {} }
        });
        expect(calls[0].opts.timeout).toBe(5000);
    });

    it("parses body and calls success on a good response", async () => {
        const Y = await withYql();
        const success = vi.fn();
        Y.YQLRequest.prototype._send("https://example/yql", {
            on: { success }
        });
        calls[0].cb(null, { body: '{"query":{"count":1}}' });
        expect(success).toHaveBeenCalledWith({ query: { count: 1 } });
    });

    it("routes errors to success with an {error} payload", async () => {
        const Y = await withYql();
        const success = vi.fn();
        const err = new Error("boom");
        Y.YQLRequest.prototype._send("https://example/yql", {
            on: { success }
        });
        calls[0].cb(err, null);
        expect(success).toHaveBeenCalledWith({ error: err });
    });
});
