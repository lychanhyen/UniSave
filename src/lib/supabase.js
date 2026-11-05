import { createClient } from '@supabase/supabase-js';

const URL = import.meta.env.VITE_SUPABASE_URL || '';
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Avoid throwing at module load when the project has not been configured yet.
const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_KEY = 'public-anon-key-placeholder';

// Giá trị mẫu trong .env.example không được coi là cấu hình thật.
const PLACEHOLDER_PATTERN = /your-project|placeholder|your-anon|example\.com/i;

export function isSupabaseConfigured() {
  return Boolean(
    URL &&
      KEY &&
      /^https?:\/\//.test(URL) &&
      !PLACEHOLDER_PATTERN.test(URL) &&
      !PLACEHOLDER_PATTERN.test(KEY)
  );
}

export const supabase = createClient(URL || FALLBACK_URL, KEY || FALLBACK_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Kiểm tra Google đã được bật trong Supabase chưa.
 *
 * Gọi tới /auth/v1/settings (công khai) để đọc danh sách nhà cung cấp đang bật. Nhờ vậy
 * nút Google báo đúng lý do thay vì đẩy người dùng sang một trang JSON lỗi của Supabase.
 * Kết quả được nhớ trong phạm vi trang để không gọi lại nhiều lần.
 */
let googleProviderCache;

export async function isGoogleProviderEnabled() {
  if (!isSupabaseConfigured()) return false;
  if (googleProviderCache !== undefined) return googleProviderCache;

  try {
    const response = await fetch(`${URL}/auth/v1/settings`, {
      headers: { apikey: KEY },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const settings = await response.json();
    googleProviderCache = Boolean(settings?.external?.google);
  } catch {
    googleProviderCache = false;
  }
  return googleProviderCache;
}