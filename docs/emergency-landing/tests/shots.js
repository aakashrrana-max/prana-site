// usage: node shots.js <outdir> <query> <label> [widths]
const puppeteer = require('puppeteer-core');
const [,, out, query, label, widthsArg] = process.argv;
const widths = (widthsArg || '375,768,1280').split(',').map(Number);
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] });
  for (const w of widths) {
    const p = await b.newPage();
    const h = w === 375 ? 812 : w === 768 ? 1024 : 800;
    await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: w < 768, hasTouch: w < 768 });
    await p.setRequestInterception(true);
    p.on('request', r => { const u = r.url(); if (/facebook|googletagmanager|msgsndr|leadconnector|google\.com\/maps/.test(u)) r.abort(); else r.continue(); });
    await p.goto('http://127.0.0.1:8937/lp/emergency-dentist.html' + (query || ''), { waitUntil: 'networkidle0' });
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); }); await new Promise(r => setTimeout(r, 400));
    await p.screenshot({ path: `${out}/${label}-${w}-fold.png` });
    await p.screenshot({ path: `${out}/${label}-${w}-full.png`, fullPage: true });
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(label, w, 'h-overflow:', overflow);
    await p.close();
  }
  await b.close();
})();
