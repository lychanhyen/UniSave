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
