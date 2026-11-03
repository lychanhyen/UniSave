#!/usr/bin/env node
/**
 * Soát import còn thiếu giữa các module trong src.
 *
 * Vì sao cần: Vite/rolldown chỉ kiểm cú pháp, không phát hiện một hàm được dùng
 * mà chưa import. Lỗi đó chỉ nổ khi mở đúng màn hình (trang trắng) và rất khó
 * thấy khi build vẫn xanh.
 *
 * Cách làm:
 *  1. Thu tên export của từng file trong src.
 *  2. Chỉ xét những tên duy nhất do đúng một file export (tránh trùng tên phổ biến).
 *  3. Trong mỗi file khác, nếu tên đó xuất hiện mà file không import và cũng không
 *     tự khai báo thì báo thiếu.
 *
 * Chạy: node scripts/check-imports.mjs
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(process.cwd(), 'src');
const EXT = /\.(js|jsx)$/;
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'assets', 'public']);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue;
      walk(full, out);
    } else if (EXT.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

/** Bỏ comment và chuỗi để không bắt nhầm "line-clamp", "read:" hay tên trong import. */
function stripNoise(code) {
  return code
    .replace(/import\s+[\s\S]*?\s+from\s+['"][^'"]+['"]\s*;?/g, '')
    .replace(/export\s+(?:type\s+)?\{[\s\S]*?\}\s+from\s+['"][^'"]+['"]\s*;?/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');
}
function exportsOf(code) {
  const names = new Set();
  const patterns = [
    /\bexport\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g,
    /\bexport\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g,
    /\bexport\s+class\s+([A-Za-z_$][\w$]*)/g,
    /\bexport\s+default\s+function\s+([A-Za-z_$][\w$]*)/g,
  ];
  for (const pattern of patterns) {
    for (const match of code.matchAll(pattern)) names.add(match[1]);
  }
  return names;
}

function importedNames(code) {
  const names = new Set();
  for (const match of code.matchAll(/import\s+([\s\S]*?)\s+from\s+['"][^'"]+['"]/g)) {
    const clause = match[1];
    const defaultMatch = clause.match(/^([A-Za-z_$][\w$]*)/);
    if (defaultMatch) names.add(defaultMatch[1]);
    const braces = clause.match(/\{([\s\S]*?)\}/);
    if (braces) {
      for (const part of braces[1].split(',')) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        const alias = trimmed.split(/\s+as\s+/);
        names.add((alias[1] || alias[0]).trim());
      }
    }
  }
  return names;
}

function localNames(code) {
  const names = new Set();
  const patterns = [
    /\b(?:function|class)\s+([A-Za-z_$][\w$]*)/g,
    /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/g,
    /\b(?:const|let|var)\s*\{([^}]*)\}\s*=/g,
  ];
  for (const pattern of patterns) {
    for (const match of code.matchAll(pattern)) {
      if (pattern.source.includes('{')) {
        for (const part of match[1].split(',')) {
          const name = part.split(':').pop().split('=').pop().trim();
          if (/^[A-Za-z_$][\w$]*$/.test(name)) names.add(name);
        }
      } else {
        names.add(match[1]);
      }
    }
  }
  return names;
}

const files = walk(ROOT);
const sources = new Map(files.map((file) => [file, readFileSync(file, 'utf8')]));

// Tên export -> danh sách file export tên đó
const owners = new Map();
for (const [file, code] of sources) {
  for (const name of exportsOf(code)) {
    if (!owners.has(name)) owners.set(name, []);
    owners.get(name).push(file);
  }
}

const problems = [];
for (const [file, code] of sources) {
  const body = stripNoise(code);
  const imported = importedNames(code);
  const local = localNames(code);
  for (const [name, from] of owners) {
    if (name.length < 3) continue;
    if (from.includes(file)) continue; // chính file định nghĩa
    if (from.length !== 1) continue; // trùng tên ở nhiều file: bỏ qua cho chắc
    if (imported.has(name) || local.has(name)) continue;
    const used = new RegExp(`(?<![-.:\\w$])${name}(?![\\w$:=])`).test(body);
    if (!used) continue;
    problems.push({
      file: relative(process.cwd(), file),
      name,
      definedIn: relative(process.cwd(), from[0]),
    });
  }
}

if (problems.length === 0) {
  console.log('OK: không phát hiện import thiếu.');
  process.exit(0);
}

console.log(`Phát hiện ${problems.length} chỗ dùng mà chưa import:\n`);
for (const item of problems) {
  console.log(`  ${item.file}\n      dùng "${item.name}" nhưng chưa import (định nghĩa ở ${item.definedIn})`);
}
process.exit(1);
