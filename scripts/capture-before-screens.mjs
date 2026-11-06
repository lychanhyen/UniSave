/**
 * Chụp ảnh giao diện TRƯỚC khi sửa (bản mã nguồn cũ chạy ở cổng 5175).
 * Dùng để làm cặp minh chứng trước/sau trong báo cáo.
 *
 *   node scripts/capture-before-screens.mjs 5175
 */

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PORT_APP = process.argv[2] || '5175';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT_CDP = 9337;
const OUT = join('docs', 'assets', 'screens');

const PAGES = [
  { file: 'before-gom-don.png', path: '/deals' },
  { file: 'before-cho-do-cu.png', path: '/marketplace' },
  { file: 'before-tong-quan.png', path: '/dashboard' },
];

const profile = mkdtempSync(join(tmpdir(), 'unisave-before-shot-'));
const browser = spawn(EDGE, [
  '--headless=new',
  `--remote-debugging-port=${PORT_CDP}`,
  `--user-data-dir=${profile}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  '--hide-scrollbars',
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
  await client.send('Page.navigate', { url: `${base}/login` });
  await sleep(2500);
  console.log(
    'đăng nhập demo:',
    await client.evaluate(`(() => {
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
    })()`)
  );
  await sleep(3500);
  console.log('sau đăng nhập:', await client.evaluate('location.pathname'));

  for (const item of PAGES) {
    await client.send('Page.navigate', { url: `${base}${item.path}` });
    await sleep(2600);
    const shot = await client.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(OUT, item.file), Buffer.from(shot.data, 'base64'));
    const title = await client.evaluate(
      'document.querySelector("h1")?.textContent || document.querySelector("h2")?.textContent || ""'
    );
    console.log(`đã chụp: ${item.file} | ${title.slice(0, 40)}`);
  }

  client.close();
} finally {
  browser.kill();
  await sleep(400);
  rmSync(profile, { recursive: true, force: true });
}
