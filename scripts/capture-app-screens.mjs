/**
 * Chụp ảnh màn hình thật của ứng dụng UniSave ở chế độ demo để đưa vào báo cáo.
 *
 * Chạy khi dev server đang ở chế độ demo (không có .env.local):
 *   node scripts/capture-app-screens.mjs 5174
 */

import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PORT_APP = process.argv[2] || '5174';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT_CDP = 9336;
const OUT = join('docs', 'assets', 'screens');

const PAGES = [
  { file: 'dang-nhap.png', path: '/login', note: 'trang đăng nhập' },
  { file: 'tong-quan.png', path: '/dashboard', note: 'trang tổng quan' },
  { file: 'chi-tieu.png', path: '/expenses', note: 'trang chi tiêu' },
  { file: 'cho-do-cu.png', path: '/marketplace', note: 'trang chợ đồ cũ' },
  { file: 'gom-don.png', path: '/deals', note: 'trang gom đơn' },
  { file: 'dinh-duong.png', path: '/nutrition', note: 'trang dinh dưỡng' },
  { file: 'danh-gia.png', path: '/feedback', note: 'trang đánh giá công khai' },
];

mkdirSync(OUT, { recursive: true });
const profile = mkdtempSync(join(tmpdir(), 'unisave-shot-'));
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
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT_CDP}${pathname}`);
      if (response.ok) return await response.json();
    } catch {
      // chờ cổng gỡ lỗi
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
    const result = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
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

  const base = `http://127.0.0.1:${PORT_APP}`;

  // 1. Ảnh trang đăng nhập (chưa đăng nhập)
  await client.send('Page.navigate', { url: `${base}/login` });
  await sleep(2500);
  let shot = await client.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(OUT, 'dang-nhap.png'), Buffer.from(shot.data, 'base64'));
  console.log('đã chụp: dang-nhap.png');

  // 2. Đăng nhập bằng tài khoản demo
  const filled = await client.evaluate(`(() => {
    const inputs = document.querySelectorAll('input');
    if (inputs.length < 2) return 'không thấy ô nhập';
    const setValue = (input, value) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    };
    setValue(inputs[0], 'sinhvien@unisave.vn');
    setValue(inputs[1], '123456');
    document.querySelector('form').requestSubmit();
    return 'đã gửi';
  })()`);
  console.log('đăng nhập demo:', filled);
  await sleep(3500);
  console.log('sau đăng nhập:', await client.evaluate('location.pathname'));

  // 3. Chụp các trang còn lại
  for (const item of PAGES.slice(1)) {
    await client.send('Page.navigate', { url: `${base}${item.path}` });
    await sleep(2600);
    shot = await client.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(OUT, item.file), Buffer.from(shot.data, 'base64'));
    const title = await client.evaluate('document.querySelector("h1")?.textContent || document.querySelector("h2")?.textContent || ""');
    console.log(`đã chụp: ${item.file} (${item.note}) | tiêu đề: ${title.slice(0, 40)}`);
  }

  client.close();
} finally {
  browser.kill();
  await sleep(400);
  rmSync(profile, { recursive: true, force: true });
}
