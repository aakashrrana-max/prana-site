// Renders guide.html -> /2026-miami-dental-implant-price-guide.pdf (repo root = public URL).
// Usage: node ads/funnel/price-guide/render-pdf.mjs [--preview]   (--preview also writes preview/page-N.png)
// Reuses playwright-core from ads/meta/motion/node_modules and launches system Chrome (same as motion/render.mjs).
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdirSync, statSync } from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(HERE, '../../..');
const require = createRequire(path.join(SITE, 'ads/meta/motion/package.json'));
const { chromium } = require('playwright-core');

const OUT = path.join(SITE, '2026-miami-dental-implant-price-guide.pdf');
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 816, height: 1056 } });
await page.goto(pathToFileURL(path.join(HERE, 'guide.html')).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

// overflow check: any .page whose content is taller than the page box
const over = await page.evaluate(() => [...document.querySelectorAll('.page')].map((p, i) => {
  const r = p.getBoundingClientRect(); let max = 0;
  p.querySelectorAll('*').forEach(e => { const b = e.getBoundingClientRect(); if (b.height) max = Math.max(max, b.bottom - r.top); });
  return { page: i + 1, height: Math.round(r.height), contentBottom: Math.round(max) };
}).filter(x => x.contentBottom > x.height + 1));
if (over.length) console.warn('OVERFLOW:', over);

if (process.argv.includes('--preview')) {
  await page.emulateMedia({ media: 'print' });
  mkdirSync(path.join(HERE, 'preview'), { recursive: true });
  const pages = await page.$$('.page');
  for (let i = 0; i < pages.length; i++) await pages[i].screenshot({ path: path.join(HERE, 'preview', `page-${i + 1}.png`) });
}

await page.pdf({ path: OUT, format: 'Letter', printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await browser.close();
console.log(`wrote ${OUT} (${(statSync(OUT).size / 1024).toFixed(0)} KB)`);
