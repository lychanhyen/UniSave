#!/usr/bin/env node
/**
 * Công cụ DB cho UniSave.
 *
 *   node scripts/db.mjs check              # kiểm tra kết nối + tóm tắt schema
 *   node scripts/db.mjs run supabase/schema.sql
 *
 * Chuỗi kết nối đọc từ .env.local (biến SUPABASE_DB_URL, không có tiền tố VITE_).
 * Dùng session pooler của Supabase; mật khẩu chỉ nằm trên máy, không lên trình duyệt.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';

function loadEnv() {
  const path = resolve(process.cwd(), '.env.local');
  const env = {};
  let raw = '';
  try {
    raw = readFileSync(path, 'utf8');
  } catch {
    return env;
  }
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = loadEnv();
const connectionString = env.SUPABASE_DB_URL || process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error('Thiếu SUPABASE_DB_URL trong .env.local');
  process.exit(1);
}

const [command = 'check', file] = process.argv.slice(2);

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

try {
  await client.connect();

  if (command === 'check') {
    const info = await client.query(
      'select version() as version, current_database() as database, current_user as "user"'
    );
    const tables = await client.query(
      "select table_name from information_schema.tables where table_schema = 'public' order by 1"
    );
    const buckets = await client.query(
      "select id, public from storage.buckets where id in ('post-images','student-cards') order by id"
    );
    const functions = await client.query(
      "select routine_name from information_schema.routines where routine_schema = 'public' and routine_name in ('handle_new_user','is_admin','can_post','request_verification','admin_set_verification','admin_set_locked') order by 1"
    );

    const row = info.rows[0];
    console.log('Kết nối OK');
    console.log('  database :', row.database);
    console.log('  user     :', row.user);
    console.log('  server   :', row.version.split(',')[0]);
    console.log(
      '  bảng     :',
      tables.rows.length ? tables.rows.map((r) => r.table_name).join(', ') : '(chưa có)'
    );
    console.log(
      '  bucket   :',
      buckets.rows.length ? buckets.rows.map((r) => `${r.id}${r.public ? ' (public)' : ' (private)'}`).join(', ') : '(chưa có)'
    );
    console.log(
      '  hàm      :',
      functions.rows.length ? functions.rows.map((r) => r.routine_name).join(', ') : '(chưa có)'
    );
  } else if (command === 'run') {
    if (!file) {
      console.error('Cách dùng: node scripts/db.mjs run <đường-dẫn-file.sql>');
      process.exit(1);
    }
    const sql = readFileSync(resolve(process.cwd(), file), 'utf8');
    console.log(`Đang chạy ${file} (${sql.length} ký tự)…`);
    await client.query(sql);
    console.log('Chạy SQL thành công.');
  } else {
    console.error(`Lệnh không hợp lệ: ${command}. Dùng "check" hoặc "run <file.sql>".`);
    process.exit(1);
  }
} catch (error) {
  console.error('Lỗi:', error.message);
  if (error.code) console.error('  code:', error.code);
  if (error.detail) console.error('  detail:', error.detail);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
