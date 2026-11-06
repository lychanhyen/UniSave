/**
 * Chụp ảnh màn hình bản đã deploy (dữ liệu thật) để đưa vào báo cáo.
 *
 *   node scripts/capture-deployed-screens.mjs [baseUrl]
 *
 * Trang công khai luôn chụp được. Muốn chụp các trang cần đăng nhập, đặt biến môi trường:
 *   $env:DEPLOY_EMAIL='...'; $env:DEPLOY_PASSWORD='...'
 */

import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = (process.argv[2] || 'https://unisave.vercel.app').replace(/\/$/, '');
const EMAIL = process.env.DEPLOY_EMAIL || '';
const PASSWORD = process.env.DEPLOY_PASSWORD || '';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT_CDP = 9337;
const OUT = join('docs', 'assets', 'deployed');

const PUBLIC_PAGES = [
  { file: 'trang-chu.png', path: '/', note: 'trang giới thiệu' },
  { file: 'dang-nhap.png', path: '/login', note: 'trang đăng nhập' },
  { file: 'danh-gia.png', path: '/feedback', note: 'trang đánh giá công khai' },
];

const PRIVATE_PAGES = [
  { file: 'tong-quan.png', path: '/dashboard', note: 'tổng quan' },
  { file: 'chi-tieu.png', path: '/expenses', note: 'chi tiêu' },
  { file: 'cho-do-cu.png', path: '/marketplace', note: 'chợ đồ cũ' },
  { file: 'gom-don.png', path: '/deals', note: 'gom đơn' },
  { file: 'dinh-duong.png', path: '/nutrition', note: 'dinh dưỡng' },
];

mkdirSync(OUT, { recursive: true });
const profile = mkdtempSync(join(tmpdir(), 'unisave-deploy-'));
const browser = spawn(EDGE, [
  '--headless=new',
  `--remote-debugging-port=${PORT_CDP}`,
  `--user-data-dir=${profile}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  '--hide-scrollbars',
  '--force-device-scale-factor=2',
  'about:blank',
]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJson(pathname) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT_CDP}${pathname}`);
      if (response.ok) return await response.json();
    } catch {
      // chờ cổng mở
    }
    await sleep(250);
  }
  throw new Error('không kết nối được Edge');
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
  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }
  close() {
    this.socket.close();
  }
}

try {
  const targets = await getJson('/json/list');
  const page = targets.find((target) => target.type === 'page');
  const client = new Client(page.webSocketDebuggerUrl);
  await client.ready();
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const shoot = async (file, note) => {
    const shot = await client.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(OUT, file), Buffer.from(shot.data, 'base64'));
    const heading = await client.evaluate(
      'document.querySelector("h1")?.textContent || document.querySelector("h2")?.textContent || ""',
    );
    console.log(`đã chụp: ${file} (${note}) | tiêu đề: ${String(heading).trim().slice(0, 45)}`);
  };

  for (const item of PUBLIC_PAGES) {
    await client.send('Page.navigate', { url: `${BASE}${item.path}` });
    await sleep(3500);
    await shoot(item.file, item.note);
  }

  if (!EMAIL || !PASSWORD) {
    console.log('không có DEPLOY_EMAIL/DEPLOY_PASSWORD nên bỏ qua các trang cần đăng nhập');
  } else {
    await client.send('Page.navigate', { url: `${BASE}/login` });
    await sleep(3000);
    const filled = await client.evaluate(`(() => {
      const inputs = document.querySelectorAll('input');
      if (inputs.length < 2) return 'không thấy ô nhập';
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      const setValue = (input, value) => {
        setter.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      };
      setValue(inputs[0], ${JSON.stringify(EMAIL)});
      setValue(inputs[1], ${JSON.stringify(PASSWORD)});
      document.querySelector('form').requestSubmit();
      return 'đã gửi';
    })()`);
    console.log('đăng nhập:', filled);
    await sleep(5000);
    const where = await client.evaluate('location.pathname');
    console.log('sau đăng nhập ở:', where);
    if (where === '/login') {
      console.log('đăng nhập thất bại, dừng phần cần tài khoản');
    } else {
      for (const item of PRIVATE_PAGES) {
        await client.send('Page.navigate', { url: `${BASE}${item.path}` });
        await sleep(4000);
        await shoot(item.file, item.note);
      }
    }
  }

  client.close();
} finally {
  browser.kill();
  await sleep(400);
  rmSync(profile, { recursive: true, force: true });
}
