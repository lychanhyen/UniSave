/**
 * Kiểm tra bố cục thật của trang đăng nhập bằng Chrome DevTools Protocol.
 *
 * Mở Edge ở chế độ headless, đo kích thước các khối ở 3 khổ màn hình và báo cáo:
 * - khối giới thiệu và biểu mẫu có chồng lên nhau không,
 * - chữ có bị cắt hoặc tràn ngang không,
 * - nút Google và ba tính năng có hiện đủ không.
 */

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL_PAGE = 'http://127.0.0.1:5173/login';
const PORT = 9333;
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const profile = mkdtempSync(join(tmpdir(), 'unisave-cdp-'));
const browser = spawn(EDGE, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  'about:blank',
]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJson(pathname) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}${pathname}`);
      if (response.ok) return await response.json();
    } catch {
      // Trình duyệt chưa kịp mở cổng gỡ lỗi.
    }
    await sleep(250);
  }
  throw new Error('Không kết nối được cổng gỡ lỗi của Edge');
}

class Client {
  constructor(wsUrl) {
    this.socket = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      const entry = this.pending.get(message.id);
      if (entry) {
        this.pending.delete(message.id);
        if (message.error) entry.reject(new Error(message.error.message));
        else entry.resolve(message.result);
      }
    });
  }

  ready() {
    return new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.socket.close();
  }
}

const MEASURE = `(() => {
  const round = (value) => Math.round(value * 10) / 10;
  const box = (element) => {
    if (!element) return null;
    const r = element.getBoundingClientRect();
    return { x: round(r.x), y: round(r.y), w: round(r.width), h: round(r.height) };
  };
  const hero = document.querySelector('section');
  const form = document.querySelector('section.animate-in-delay-1');
  const h2 = hero?.querySelector('h2');
  const paragraphs = hero ? Array.from(hero.querySelectorAll('p')) : [];
  const features = hero ? Array.from(hero.querySelectorAll('ul li')) : [];
  const logo = hero?.querySelector('a');
  const googleButton = Array.from(document.querySelectorAll('button')).find((b) =>
    b.textContent.includes('Google')
  );
  const footer = paragraphs.find((p) => p.textContent.includes('©'));
  const heroImage = hero?.querySelector('img');
  let imageInfo = null;
  if (heroImage && heroImage.naturalWidth) {
    const box = heroImage.getBoundingClientRect();
    const scale = Math.max(box.width / heroImage.naturalWidth, box.height / heroImage.naturalHeight);
    const renderedW = heroImage.naturalWidth * scale;
    const renderedH = heroImage.naturalHeight * scale;
    imageInfo = {
      natural: heroImage.naturalWidth + 'x' + heroImage.naturalHeight,
      visibleWidthPercent: Math.round((box.width / renderedW) * 100),
      visibleHeightPercent: Math.round((box.height / renderedH) * 100),
      currentSrc: heroImage.currentSrc.split('/').pop(),
    };
  }

  const textOverflow = [];
  if (hero) {
    for (const element of hero.querySelectorAll('h2, p, li, a, span')) {
      if (element.scrollWidth - element.clientWidth > 1) {
        textOverflow.push(element.tagName + ': ' + element.textContent.trim().slice(0, 30));
      }
    }
  }

  const overlaps = (a, b) => {
    if (!a || !b) return false;
    return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
  };

  return JSON.stringify({
    viewport: { w: innerWidth, h: innerHeight },
    documentWidth: document.documentElement.scrollWidth,
    horizontalScroll: document.documentElement.scrollWidth > innerWidth + 1,
    hero: box(hero),
    logo: box(logo),
    headline: box(h2),
    headlineText: h2 ? h2.textContent.trim() : null,
    headlineLines: h2 ? Math.round(h2.getBoundingClientRect().height / parseFloat(getComputedStyle(h2).lineHeight)) : 0,
    description: box(paragraphs[0]),
    features: features.map((li) => ({ box: box(li), text: li.textContent.trim().slice(0, 40) })),
    footer: box(footer),
    form: box(form),
    googleButton: box(googleButton),
    heroOverlapsForm: overlaps(box(hero), box(form)),
    featuresBelowHeadline: features.length ? features[0].getBoundingClientRect().top > h2.getBoundingClientRect().bottom : null,
    textOverflow,
    imageInfo,
    heroResources: performance.getEntriesByType('resource')
      .filter((entry) => entry.name.includes('login-hero'))
      .map((entry) => ({
        file: entry.name.split('/').pop(),
        transferKB: Math.round(entry.transferSize / 1024),
        encodedKB: Math.round(entry.encodedBodySize / 1024),
      })),
  });
})()`;

try {
  const targets = await getJson('/json/list');
  let page = targets.find((target) => target.type === 'page');
  if (!page) {
    await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' });
    await sleep(500);
    const again = await getJson('/json/list');
    page = again.find((target) => target.type === 'page');
  }

  const client = new Client(page.webSocketDebuggerUrl);
  await client.ready();
  await client.send('Page.enable');
  await client.send('Runtime.enable');

  for (const viewport of VIEWPORTS) {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: viewport.width < 500,
    });
    await client.send('Page.navigate', { url: `${URL_PAGE}?v=${Date.now()}` });
    await sleep(1800);
    const result = await client.send('Runtime.evaluate', {
      expression: MEASURE,
      returnByValue: true,
      awaitPromise: false,
    });
    const data = JSON.parse(result.result.value);
    console.log(`\n=== ${viewport.name} ${viewport.width}x${viewport.height}`);
    console.log(`  tràn ngang: ${data.horizontalScroll ? 'CÓ' : 'không'} | rộng tài liệu: ${data.documentWidth}`);
    console.log(`  khối giới thiệu: ${JSON.stringify(data.hero)}`);
    console.log(`  logo: ${JSON.stringify(data.logo)}`);
    console.log(`  tiêu đề: ${JSON.stringify(data.headline)} | ${data.headlineLines} dòng | "${data.headlineText}"`);
    console.log(`  mô tả: ${JSON.stringify(data.description)}`);
    console.log(`  ba tính năng: ${data.features.length} | khối đầu: ${JSON.stringify(data.features[0]?.box)}`);
    data.features.forEach((item, index) => {
      console.log(`    ${index + 1}. ${JSON.stringify(item.box)} ${item.text}`);
    });
    console.log(`  chân khối: ${JSON.stringify(data.footer)}`);
    console.log(`  biểu mẫu: ${JSON.stringify(data.form)} | nút Google: ${JSON.stringify(data.googleButton)}`);
    console.log(`  chồng lấn khối giới thiệu/biểu mẫu: ${data.heroOverlapsForm ? 'CÓ' : 'không'}`);
    console.log(`  chữ bị cắt: ${data.textOverflow.length ? data.textOverflow.join(' | ') : 'không'}`);
    console.log(`  ảnh nền: ${JSON.stringify(data.imageInfo)}`);
    console.log(`  dữ liệu tải: ${JSON.stringify(data.heroResources)}`);
  }

  client.close();
} finally {
  browser.kill();
  await sleep(400);
  rmSync(profile, { recursive: true, force: true });
}
