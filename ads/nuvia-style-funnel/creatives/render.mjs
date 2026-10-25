// Renders creative.html -> out/{c1,c2,c3}-{1080x1080,1080x1920}.png
// Usage: node ads/nuvia-style-funnel/creatives/render.mjs [--only c1,c3]
// Reuses playwright-core from ads/meta/motion/node_modules and launches system Chrome (same as motion/render.mjs).
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(HERE, '../../..');
const require = createRequire(path.join(SITE, 'ads/meta/motion/package.json'));
const { chromium } = require('playwright-core');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const ids = (arg('only') || 'c1,c2,c3').split(',');
const sizes = [[1080, 1080], [1080, 1920]];
mkdirSync(path.join(HERE, 'out'), { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of sizes) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  for (const c of ids) {
    const url = pathToFileURL(path.join(HERE, 'creative.html')).href + `?c=${c}&size=${w}x${h}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const out = path.join(HERE, 'out', `${c}-${w}x${h}.png`);
    await page.screenshot({ path: out });
    console.log('wrote', path.relative(SITE, out));
  }
  await page.close();
}
await browser.close();
