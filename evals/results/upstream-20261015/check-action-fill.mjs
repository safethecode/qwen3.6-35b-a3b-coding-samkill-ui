import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { createServer } from 'node:http';
import { chromium } from 'playwright';
import { sourceBinding } from '../../../scripts/source-binding.mjs';
import { harnessBinding } from '../../../scripts/harness-binding.mjs';
import { inspectLayoutContract } from '../../../scripts/layout-contract.mjs';
import { inspectTextStress } from '../../../scripts/text-stress.mjs';
const [target, evidence] = process.argv.slice(2);
await mkdir(evidence, { recursive: true });
const binding = await sourceBinding(target);
const server = createServer(async (req, res) => { try { const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html'; if (!binding[name]) throw Error(); res.setHeader('content-type', ({ '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' })[extname(name)] || 'application/octet-stream'); res.end(await readFile(resolve(target, name))); } catch { res.writeHead(404).end(); } });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
const contract = { rules: [{ id: 'primary-action-allocated-width', kind: 'fillRemainder', subject: '#book', reference: '#favorite', container: '#booking-actions' }] };
const results = [];
try {
  for (const width of [296, 320, 390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.evaluate(() => document.fonts.ready);
    results.push({ width, mode: 'normal', ...await inspectLayoutContract(page, contract) });
    await inspectTextStress(page, async mode => { results.push({ width, mode, ...await inspectLayoutContract(page, contract) }); });
    await page.close();
  }
} finally { await browser.close(); await new Promise(r => server.close(r)); }
await writeFile(`${evidence}/report.json`, JSON.stringify({ status: results.some(r => r.results.some(s => s.status === 'FAIL')) ? 'FAIL' : 'SCOPED_CHECKS_PASS_NOT_VISUAL_PARITY', sourceHashes: binding, harnessHashes: await harnessBinding(), note: 'Post-generation diagnostic rule added after visual discovery; not predeclared compliance', results }, null, 2));
console.log(results.map(r => ({ width: r.width, mode: r.mode, status: r.results[0].status, actual: r.results[0].observed.subject?.width, expected: r.results[0].observed.expectedWidth })));
