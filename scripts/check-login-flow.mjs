/**
 * Kiểm tra luồng đăng nhập bằng trình duyệt thật:
 * 1. Bấm nút Google khi nhà cung cấp chưa bật -> phải hiện thông báo, không rời trang.
 * 2. Đăng nhập bằng email/mật khẩu -> phải chuyển vào /dashboard.
 */

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9334;
const profile = mkdtempSync(join(tmpdir(), 'unisave-flow-'));
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

  await client.send('Page.navigate', { url: 'http://127.0.0.1:5173/login' });
  await sleep(2000);

  console.log('trang hiện tại:', await client.evaluate('location.pathname'));

  // 1. Bấm nút Google
  const clicked = await client.evaluate(`(() => {
    const button = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Google'));
    if (!button) return 'không thấy nút';
    button.click();
    return 'đã bấm';
  })()`);
  console.log('nút Google:', clicked);
  await sleep(2500);
  const afterGoogle = await client.evaluate(`(() => ({
    path: location.pathname,
    coThongBao: document.body.innerText.includes('Google chưa được bật'),
    doanCuoi: document.body.innerText.slice(-160),
  }))()`);
  console.log('sau khi bấm Google:', JSON.stringify(afterGoogle));

  // 2. Đăng nhập bằng email
  await client.evaluate(`(() => {
    const setValue = (input, value) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const inputs = document.querySelectorAll('input');
    setValue(inputs[0], 'sinhvien@unisave.vn');
    setValue(inputs[1], '123456');
    const form = document.querySelector('form');
    form.requestSubmit();
    return 'đã gửi';
  })()`);
  await sleep(4000);
  const afterLogin = await client.evaluate(`(() => ({
    path: location.pathname,
    heading: document.querySelector('h1')?.textContent || '',
    coLoi: document.body.innerText.includes('thất bại') || document.body.innerText.includes('Không'),
    doanCuoi: document.body.innerText.slice(-220),
    soLanTai: performance.getEntriesByType('navigation').length,
  }))()`);
  console.log('sau khi đăng nhập:', JSON.stringify(afterLogin));

  client.close();
} finally {
  browser.kill();
  await sleep(400);
  rmSync(profile, { recursive: true, force: true });
}
