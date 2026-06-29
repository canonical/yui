/**
 * Import-mechanism / consumption regression tests.
 *
 * Pins the ways real downstreams (notably Launchpad) consume the published
 * package so future changes can't silently break installation/loading:
 *   1. CommonJS `require('@canonical/yui')` -> { YUI }  (Node seed path).
 *   2. Direct require of build/yui-nodejs seed -> { YUI }.
 *   3. package.json `main` resolves to a real file.
 *   4. Browser combo files exist (Launchpad serves build/yui + build/loader).
 *   5. YUI().use(...) bootstraps and loads modules in Node, incl. yql-nodejs.
 */
import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const pkg = require(join(root, 'package.json'));

describe('package metadata', () => {
  it('declares a main entry that exists', () => {
    expect(pkg.main).toBeTruthy();
    expect(existsSync(join(root, pkg.main))).toBe(true);
  });

  it('is named @canonical/yui', () => {
    expect(pkg.name).toBe('@canonical/yui');
  });
});

describe('CommonJS consumption (package main)', () => {
  it('require(package) exposes the YUI constructor', () => {
    const mod = require(join(root, pkg.main));
    expect(typeof mod.YUI).toBe('function');
  });

  it('require(build/yui-nodejs) exposes the YUI constructor', () => {
    const { YUI } = require(join(root, 'build/yui-nodejs/yui-nodejs.js'));
    expect(typeof YUI).toBe('function');
  });
});

describe('browser combo assets (Launchpad consumption)', () => {
  // Launchpad combos: yui/yui-min.js + loader/loader-min.js, then modules.
  const required = [
    'build/yui/yui.js',
    'build/yui/yui-min.js',
    'build/yui/yui-debug.js',
    'build/loader/loader-min.js',
    'build/yql/yql.js',
    'build/yql/yql-min.js',
  ];
  it.each(required)('ships %s', (p) => {
    expect(existsSync(join(root, p))).toBe(true);
  });

  it('seed defines the global YUI factory', () => {
    const src = readFileSync(join(root, 'build/yui/yui.js'), 'utf8');
    expect(src).toMatch(/this\.YUI\s*=\s*YUI|var\s+YUI/);
  });
});

describe('YUI().use bootstraps modules in Node', () => {
  it('loads yql and conditionally loads yql-nodejs', () => new Promise((done) => {
    const { YUI } = require(join(root, 'build/yui-nodejs/yui-nodejs.js'));
    YUI().use('yql', (Y) => {
      expect(Y.UA.nodejs).toBeTruthy();
      expect(typeof Y.YQL).toBe('function');
      // yql-nodejs plugin overrides _send for Node.
      expect(typeof Y.YQLRequest.prototype._send).toBe('function');
      done();
    });
  }));
});
