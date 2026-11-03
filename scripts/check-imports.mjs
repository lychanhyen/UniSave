#!/usr/bin/env node
/**
 * Soát import còn thiếu trong src.
 *
 * Vì sao cần: Vite/rolldown chỉ kiểm cú pháp, không phát hiện một tên được dùng
 * mà chưa import. Lỗi đó chỉ nổ khi mở đúng màn hình (trang trắng) và rất khó
 * thấy khi build vẫn xanh. Đã từng xảy ra với hasPostCoords và Link.
 *
 * Hai nhóm kiểm tra:
 *  1. Tên do chính src export (ví dụ hasPostCoords) dùng ở file khác mà chưa import.
 *  2. Tên quen thuộc từ thư viện ngoài (Link, useState, toast...) dùng mà chưa import.
 *
 * Chạy: node scripts/check-imports.mjs   (hoặc npm run check:imports)
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(process.cwd(), 'src');
const EXT = /\.(js|jsx)$/;
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'assets', 'public']);

const EXTERNALS = [
  'Link',
  'NavLink',
  'Navigate',
  'Outlet',
  'useNavigate',
  'useParams',
  'useLocation',
  'useSearchParams',
  'useState',
  'useEffect',
  'useMemo',
  'useCallback',
  'useRef',
  'useReducer',
  'useContext',
  'createContext',
  'useLayoutEffect',
  'useId',
  'memo',
  'lazy',
  'Suspense',
  'forwardRef',
  'createRoot',
  'toast',
];

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

/** Bỏ comment, chuỗi và câu import để không bắt nhầm tên trong đó. */
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

function isUsed(body, name) {
  return new RegExp(`(?<![-.:\\w$])${name}(?![\\w$:=])`).test(body);
}

const files = walk(ROOT);
const sources = new Map(files.map((file) => [file, readFileSync(file, 'utf8')]));

// Tên export -> file định nghĩa
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

  // 1. Tên do src export, dùng ở file khác mà chưa import.
  for (const [name, from] of owners) {
    if (name.length < 3) continue;
    if (from.includes(file)) continue;
    if (from.length !== 1) continue;
    if (imported.has(name) || local.has(name)) continue;
    if (!isUsed(body, name)) continue;
    problems.push({
      file: relative(process.cwd(), file),
      name,
      definedIn: relative(process.cwd(), from[0]),
    });
  }

  // 2. Tên từ thư viện ngoài.
  for (const name of EXTERNALS) {
    if (imported.has(name) || local.has(name)) continue;
    if (!isUsed(body, name)) continue;
    problems.push({
      file: relative(process.cwd(), file),
      name,
      definedIn: 'thư viện ngoài (react / react-router-dom / react-hot-toast)',
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
