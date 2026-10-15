import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { sourceBinding } from '../../../scripts/source-binding.mjs';

const [target, output] = process.argv.slice(2);
await mkdir(output, { recursive: true });
const binding = await sourceBinding(target);
const server = createServer(async (req, res) => { try { const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html'; if (!Object.hasOwn(binding, name)) throw Error(); res.setHeader('content-type', ({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' })[extname(name)] || 'application/octet-stream'); res.end(await readFile(resolve(target, name))); } catch { res.writeHead(404).end(); } });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
const checks = [];
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 }, timezoneId: 'Asia/Seoul' });
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const fixture = { id: '4a725fc8-3214-4c94-b040-ce6e4cac9a58', title: '<img src=x onerror=alert(1)>', category: 'study', date: '2026-10-15', completed: true };
  for (const [name, state] of [['empty', { tasks: [], selectedDate: fixture.date, error: null }], ['filled', { tasks: [fixture, { ...fixture, id: 'other', date: '2026-10-16' }], selectedDate: fixture.date, error: '저장하지 못했어요' }], ['clear', { tasks: [], selectedDate: fixture.date, error: null }]]) {
    try {
      await page.evaluate(async state => { const { renderPlanner } = await import('./render.js'); renderPlanner(state); }, state);
      assert.equal(await page.locator('.day-button').count(), 7);
      assert.equal(await page.locator('.day-button[aria-pressed=true]').getAttribute('data-date'), fixture.date);
      assert.match(await page.locator('#selected-date').textContent(), /10.*15/);
      assert.equal(await page.locator('#empty-state').evaluate(e => e.hidden), name === 'filled');
      assert.equal(await page.locator('.task-row').count(), name === 'filled' ? 1 : 0);
      assert.equal(await page.locator('#page-error').textContent(), state.error || '');
      if (name === 'filled') {
        assert.equal(await page.locator('#study-items .task-name').textContent(), fixture.title);
        assert.equal(await page.locator('#life-items .task-row').count(), 0);
        assert.equal(await page.locator('.task-name img').count(), 0);
        assert.equal(await page.locator('.task-check').isChecked(), true);
        assert.equal(await page.locator('.task-row').getAttribute('data-id'), fixture.id);
        assert.equal(await page.locator('.task-row').evaluate(e => e.classList.contains('is-complete')), true);
        assert.ok((await page.locator('.delete-task').getAttribute('aria-label')).includes(fixture.title));
      }
      checks.push({ name, status: 'PASS' });
    } catch (e) { checks.push({ name, status: 'FAIL', detail: e.message.slice(0, 1500) }); }
  }
  assert.deepEqual(await sourceBinding(target), binding);
  const report = { status: checks.some(c => c.status === 'FAIL') ? 'FAIL' : 'PASS', sourceHashes: binding, checks, scope: 'Actual renderer with ISO-string state, repeated empty/filled/clear, day selection, category/date filtering and safe user text. Not app or design approval.' };
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.checks));
  process.exitCode = report.status === 'PASS' ? 0 : 1;
} finally { await browser.close(); await new Promise(r => server.close(r)); }
