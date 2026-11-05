import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  ArrowRight,
  PiggyBank,
  ShieldCheck,
  TrendingUp,
  UsersRound,
  Users,
  BadgeCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { isGoogleProviderEnabled, isSupabaseConfigured, supabase } from '../lib/supabase';

/** Biểu tượng Google bốn màu, vẽ trực tiếp bằng SVG để không thêm thư viện. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-[18px] w-[18px] shrink-0" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.1 0 24 0 14.6 0 6.4 5.4 2.5 13.2l7.8 6.1C12.2 13.3 17.6 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v8.5h12.5c-.3 2.1-1.5 5.2-4.3 7.3l7.6 5.9c4.5-4.2 6.3-10.3 6.3-17.6z"
      />
      <path
        fill="#FBBC05"
        d="M10.3 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.5 10.8l7.8-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.1 0 11.2-2 14.9-5.5l-7.6-5.9c-2 1.4-4.7 2.4-7.3 2.4-6.4 0-11.8-3.8-13.7-9.3l-7.8 6.1C6.4 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}

const DEMO_ACCOUNTS = [
  {
    label: 'Sinh viên đã duyệt',
    email: 'sinhvien@unisave.vn',
    password: '123456',
    hint: 'Dùng đầy đủ 3 chức năng',
    icon: BadgeCheck,
  },
  {
    label: 'Sinh viên chờ duyệt',
    email: 'cho@unisave.vn',
    password: '123456',
    hint: 'Bị chặn đăng bài đến khi admin duyệt',
    icon: UsersRound,
  },
  {
    label: 'Quản trị viên',
    email: 'admin@unisave.vn',
    password: '123456',
    hint: 'Duyệt sinh viên, xử lý tố cáo',
    icon: ShieldCheck,
  },
];

/**
 * Màu chủ đạo của trang đăng nhập: #00834a.
 * Ghi đè thang brand trong phạm vi trang nên nút, liên kết, viền đều đổi theo
 * mà không ảnh hưởng các màn khác đang dùng xanh emerald.
 */
const BRAND_SCALE = {
  '--color-brand-50': '#e9f7f0',
  '--color-brand-100': '#ccefdd',
  '--color-brand-200': '#a2e0c1',
  '--color-brand-300': '#6ccfa1',
  '--color-brand-400': '#26b276',
  '--color-brand-500': '#0a9c5a',
  '--color-brand-600': '#00834a',
  '--color-brand-700': '#006b3c',
  '--color-brand-800': '#00552f',
  '--color-brand-900': '#004226',
};

/**
 * Ảnh nền minh hoạ khuôn viên trường, neo đáy giữa khung.
 * CSS tương đương: background: #00834a url(...) center bottom / 100% auto no-repeat.
 */
const HERO_IMAGE = '/assets/images/login/login-hero.png';

/**
 * Ảnh riêng cho điện thoại (khung dọc cao hơn nhiều so với desktop).
 * Đặt tệp vào public/assets/images/login/login-hero-mobile.png rồi bật cờ dưới lên true
 * là trình duyệt điện thoại tự dùng ảnh này; desktop vẫn dùng ảnh chính.
 */
const HERO_IMAGE_MOBILE = '/assets/images/login/login-hero-mobile.png';
const HAS_HERO_IMAGE_MOBILE = false;

/** Ba tính năng nổi bật bên trái trang đăng nhập. */
const LOGIN_FEATURES = [
  { icon: TrendingUp, title: 'Theo dõi chi tiêu', note: 'Dễ dàng, trực quan' },
  { icon: PiggyBank, title: 'Tiết kiệm thông minh', note: 'Tích lũy cho tương lai' },
  { icon: Users, title: 'Kèo gom đơn', note: 'Cùng bạn bè, tiết kiệm hơn' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, demoMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  function goTo(user) {
    navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const account = await login(email, password);
      toast.success('Đăng nhập thành công!');
      goTo(account);
    } catch (error) {
      toast.error(error.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!email) {
      toast.error('Vui lòng nhập email trước.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        emailRedirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success(`Đã gửi email đặt lại mật khẩu đến ${email}. Vui lòng kiểm tra hộp thư.`);
    } catch (error) {
      toast.error(error.message || 'Không gửi được email đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  }

  async function handleQuick(account) {
    setQuickLoading(account.email);
    setEmail(account.email);
    setPassword(account.password);
    try {
      const user = await login(account.email, account.password);
      toast.success(`Đăng nhập với ${account.label.toLowerCase()}`);
      goTo(user);
    } catch (error) {
      toast.error(error.message || 'Đăng nhập thất bại');
    } finally {
      setQuickLoading('');
    }
  }

  /**
   * Đăng nhập bằng Google qua Supabase OAuth.
   *
   * Sau khi bấm, trình duyệt chuyển sang trang chọn tài khoản của Google rồi quay lại
   * /dashboard. Supabase tự đọc phiên trong URL và AuthContext tự cập nhật người dùng,
   * nên ở đây không cần xử lý thêm bước đăng nhập.
   */
  async function handleGoogle() {
    if (!isSupabaseConfigured()) {
      toast.error('Chưa cấu hình Supabase nên chưa dùng được đăng nhập Google.');
      return;
    }
    setGoogleLoading(true);
    const enabled = await isGoogleProviderEnabled();
    if (!enabled) {
      setGoogleLoading(false);
      toast.error('Google chưa được bật trong Supabase (Authentication → Providers → Google).');
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) throw error;
      // Trình duyệt sẽ chuyển hướng sang Google, giữ trạng thái chờ cho tới lúc đó.
    } catch (error) {
      setGoogleLoading(false);
      const message = String(error?.message || '');
      if (/provider is not enabled|unsupported provider/i.test(message)) {
        toast.error('Google chưa được bật trong Supabase. Vào Authentication → Providers để bật.');
        return;
      }
      toast.error('Không đăng nhập được bằng Google. Vui lòng thử lại.');
    }
  }

  return (
    <div style={BRAND_SCALE} className="min-h-screen bg-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
          {/* ----------------------------------------------------- Khối hình ảnh */}
                    <section className="animate-in relative isolate flex min-h-[620px] flex-col overflow-hidden text-white sm:min-h-[660px] lg:min-h-screen lg:w-1/2">
            {/* 1. Ảnh nền do người dùng cung cấp, giữ nguyên nội dung ảnh */}
            <picture>
              {HAS_HERO_IMAGE_MOBILE && (
                <source media="(max-width: 639px)" srcSet={HERO_IMAGE_MOBILE} />
              )}
              <img
                src={HERO_IMAGE}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-center brightness-[0.72] saturate-[1.05]"
              />
            </picture>

            {/* 2. Lớp phủ gradient xanh đậm để chữ trắng đủ tương phản */}
            <div className="absolute inset-0 bg-[#00371f]/45" />
            <div className="absolute inset-0 bg-black/25" />

            {/* 3. Nội dung trên ảnh */}
            <div className="relative z-10 flex min-h-full flex-1 flex-col gap-8 p-7 sm:p-10 lg:p-12 xl:p-14">
              <Link to="/" className="flex items-center gap-3 self-start">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/30">
                  <PiggyBank className="h-6 w-6 text-[#8bf3c7]" />
                </span>
                <span className="text-[1.45rem] font-extrabold leading-none tracking-[-0.03em]">
                  <span className="text-white">Uni</span>
                  <span className="text-[#8bf3c7]">Save</span>
                </span>
              </Link>

              <div className="my-auto max-w-[34rem]">
                <h2 className="text-balance text-[clamp(1.55rem,5.4vw,2.6rem)] font-extrabold uppercase leading-[1.08] tracking-[-0.02em]">
                  <span className="block text-white">Quản lý tiền gọn,</span>
                  <span className="mt-1 block text-[#8bf3c7]">Sống thoải mái.</span>
                </h2>

                <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/85 sm:text-[16px]">
                  Cùng UniSave quản lý chi tiêu thông minh, tiết kiệm hiệu quả và hiện thực hóa mục
                  tiêu tài chính của bạn ngay hôm nay!
                </p>

                <ul className="mt-8 space-y-4">
                  {LOGIN_FEATURES.map(({ icon: Icon, title, note }) => (
                    <li key={title} className="flex items-start gap-3.5">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/25 text-[#8bf3c7]">
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[14px] font-bold leading-snug text-white sm:text-[15px]">
                          {title}
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-relaxed text-white/70">
                          {note}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-[12px] font-medium text-white/60">
                UniSave © 2025. Tiết kiệm hôm nay, vững vàng tương lai.
              </p>
            </div>
          </section>

          {/* ------------------------------------------------------------ Biểu mẫu */}
          <section className="animate-in-delay-1 flex flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:w-1/2 lg:px-14 xl:px-20">
            <div className="w-full max-w-md">

              <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-ink-900 sm:text-[2.25rem]">
                Chào mừng trở lại
              </h1>
              <p className="mt-2 text-[16px] leading-relaxed text-ink-700">
                Đăng nhập để tiếp tục hành trình tiết kiệm.
              </p>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading || loading}
                className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-[15px] font-bold text-ink-800 transition hover:border-ink-300 hover:bg-ink-50 disabled:opacity-60"
              >
                <GoogleMark />
                {googleLoading ? 'Đang chuyển sang Google…' : 'Đăng nhập bằng Google'}
              </button>

              <p className="my-4 text-center text-[12px] font-semibold uppercase tracking-wide text-ink-500">
                hoặc đăng nhập bằng email
              </p>

              <form onSubmit={handleSubmit} className="mt-0">
                <Input
                  label="Email"
                  type="email"
                  icon={Mail}
                  placeholder="ban@sinhvien.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Mật khẩu"
                  type="password"
                  icon={Lock}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <div className="mb-5 flex items-center justify-between text-[13px]">
                  <label className="flex items-center gap-2 font-medium text-ink-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                    />
                    Ghi nhớ đăng nhập
                  </label>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="font-bold text-brand-700 transition-colors hover:text-brand-800"
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                <Button type="submit" size="lg" loading={loading} className="w-full">
                  Đăng nhập
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              {demoMode && (
                <div className="mt-6 rounded-2xl border-2 border-brand-200 bg-brand-50/60 p-4">
                  <p className="text-[13px] font-bold uppercase tracking-wide text-brand-800">
                    Tài khoản demo
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-700">
                    Chưa cấu hình Supabase nên app dùng tài khoản mẫu. Bấm để đăng nhập nhanh:
                  </p>
                  <div className="mt-3 space-y-2">
                    {DEMO_ACCOUNTS.map((account) => {
                      const Icon = account.icon;
                      return (
                        <button
                          key={account.email}
                          type="button"
                          onClick={() => handleQuick(account)}
                          disabled={Boolean(quickLoading)}
                          className="flex w-full items-center gap-3 rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-left transition hover:border-brand-400 disabled:opacity-60"
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13px] font-bold text-ink-900">
                              {account.label}
                            </span>
                            <span className="block truncate text-[13px] text-ink-700">
                              {account.email} · {account.password} · {account.hint}
                            </span>
                          </span>
                          {quickLoading === account.email ? (
                            <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
                          ) : (
                            <ArrowRight className="h-4 w-4 shrink-0 text-brand-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="mt-6 text-center text-[15px] text-ink-700">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="font-bold text-brand-700 hover:text-brand-800">
                  Đăng ký ngay
                </Link>
              </p>
              <p className="mt-2 text-center text-[13px] text-ink-700">
                Tài khoản bị khóa? Liên hệ quản trị viên UniSave để được hỗ trợ.
              </p>
            </div>
          </section>
      </div>
    </div>
  );
}
