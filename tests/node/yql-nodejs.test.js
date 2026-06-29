/**
 * Regression test pinning the behavior of yql-nodejs `_send`, which has no
 * upstream coverage. Phase 3 swapped the transport from `request` to native
 * `fetch`; the contract is unchanged:
 *   - GET with timeout = o.timeout || 30000.
 *   - success: o.on.success(JSON.parse(<response body>)).
 *   - error:   o.on.success({ error: err }).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Capture transport options and drive responses deterministically (no network).
const calls = [];
const realFetch = globalThis.fetch;
const realTimeout = AbortSignal.timeout;

beforeEach(() => {
    calls.length = 0;
    AbortSignal.timeout = (ms) => ({ timeout: ms });
    globalThis.fetch = (url, opts) =>
        new Promise((resolve, reject) => {
            calls.push({ url, opts, resolve, reject });
        });
});

afterEach(() => {
    globalThis.fetch = realFetch;
    AbortSignal.timeout = realTimeout;
});

const { YUI } = require(join(root, "build/yui-nodejs/yui-nodejs.js"));
const withYql = () => new Promise((res) => YUI().use("yql", res));

describe("yql-nodejs _send (native fetch transport)", () => {
    it("issues a GET with default 30s timeout", async () => {
        const Y = await withYql();
        Y.YQLRequest.prototype._send("https://example/yql", {
            on: { success() {} }
        });
        expect(calls).toHaveLength(1);
        expect(calls[0].url).toBe("https://example/yql");
        expect(calls[0].opts.method).toBe("GET");
        expect(calls[0].opts.signal.timeout).toBe(30000);
    });

    it("honours an explicit timeout", async () => {
        const Y = await withYql();
        Y.YQLRequest.prototype._send("https://example/yql", {
            timeout: 5000,
            on: { success() {} }
        });
        expect(calls[0].opts.signal.timeout).toBe(5000);
    });

    it("parses body and calls success on a good response", async () => {
        const Y = await withYql();
        const success = vi.fn();
        Y.YQLRequest.prototype._send("https://example/yql", {
            on: { success }
        });
        calls[0].resolve({
            text: () => Promise.resolve('{"query":{"count":1}}')
        });
        await vi.waitFor(() => expect(success).toHaveBeenCalled());
        expect(success).toHaveBeenCalledWith({ query: { count: 1 } });
    });

    it("routes errors to success with an {error} payload", async () => {
        const Y = await withYql();
        const success = vi.fn();
        const err = new Error("boom");
        Y.YQLRequest.prototype._send("https://example/yql", {
            on: { success }
        });
        calls[0].reject(err);
        await vi.waitFor(() => expect(success).toHaveBeenCalled());
        expect(success).toHaveBeenCalledWith({ error: err });
    });
});
