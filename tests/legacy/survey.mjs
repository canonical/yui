/**
 * One-off survey: run EVERY legacy unit harness to classify pass/fail/timeout/
 * no-verdict. Diagnostic only — NOT wired into CI. Frozen harnesses untouched.
 *   node tests/legacy/survey.mjs            # all
 *   node tests/legacy/survey.mjs <n>        # cap concurrency (default 6)
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PORT = 8749, TIMEOUT = 20_000;
const CONC = Number(process.argv[2]) || 6;

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\/tests\/unit\/.*\.html$/.test(p)) out.push(p);
  }
  return out;
}
const harnesses = walk('src').sort();

const srv = spawn('npx', ['http-server', '-p', String(PORT), '-c-1', '.'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1200));

const browser = await chromium.launch();
const results = { pass: [], fail: [], timeout: [], error: [] };
let i = 0;
async function worker() {
  while (i < harnesses.length) {
    const h = harnesses[i++];
    const page = await browser.newPage();
    try {
      await page.goto(`http://localhost:${PORT}/${h}`, { timeout: TIMEOUT });
      await page.waitForFunction(() => /Passed:\d+ Failed:\d+ Total:\d+/.test(document.body.innerText), undefined, { timeout: TIMEOUT });
      const m = (await page.innerText('body')).match(/Passed:(\d+) Failed:(\d+) Total:(\d+)/);
      const [, p, f] = m.map(Number);
      (f === 0 ? results.pass : results.fail).push(`${h} (P${p}/F${f})`);
    } catch (e) {
      (/Timeout/.test(e.message) ? results.timeout : results.error).push(h);
    } finally { await page.close(); }
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
await browser.close();
srv.kill();

const r = results;
console.log(`\nTOTAL ${harnesses.length}  pass ${r.pass.length}  fail ${r.fail.length}  timeout ${r.timeout.length}  error ${r.error.length}`);
for (const k of ['fail', 'timeout', 'error']) if (r[k].length) console.log(`\n${k.toUpperCase()}:\n  ${r[k].join('\n  ')}`);
