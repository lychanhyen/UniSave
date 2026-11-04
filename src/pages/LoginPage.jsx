import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  ArrowRight,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  UsersRound,
  BadgeCheck,
  Landmark,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import coinsBg from '../assets/coins-bg.webp';

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
const CAMPUS_IMAGE = '/assets/images/uda-dashboard/sidebar-campus-v2.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, demoMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState('');

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

  return (
    <div style={BRAND_SCALE} className="min-h-screen bg-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
          {/* ----------------------------------------------------- Khối hình ảnh */}
          <section
            className="animate-in relative isolate flex min-h-[360px] flex-col justify-between overflow-hidden p-8 text-white sm:p-10 lg:min-h-screen lg:w-1/2 lg:p-14 xl:p-16"
            style={{ backgroundColor: '#00834a' }}
          >
            {/* 1. Ảnh khuôn viên neo đáy giữa khung, rộng 100% */}
            <img
              src={CAMPUS_IMAGE}
              alt="Khuôn viên trường đại học với toà nhà, tháp đồng hồ và cây xanh"
              className="pointer-events-none absolute inset-x-0 bottom-0 w-full select-none"
            />

            {/* 2. Đồng xu rơi, hoà dưới lớp nền */}
            <img
              src={coinsBg}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover opacity-60 mix-blend-screen"
            />

            {/* 3. Lớp phủ xanh xuyên thấu: ảnh chỉ còn gợi ý dưới nền */}
            <div className="absolute inset-0 bg-[#00834a]/72" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[#00351d]/35" />

            {/* 4. Nội dung nằm trên cùng */}
            <div className="relative z-10 flex h-full flex-col justify-between gap-12">
              <Link to="/" className="flex items-center gap-3.5">
                <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/30 bg-white/15 backdrop-blur">
                  <PiggyBank className="h-7 w-7" />
                </span>
                <span className="text-2xl font-extrabold tracking-tight">UniSave</span>
              </Link>

              <div className="max-w-xl">
                <p className="hero-eyebrow mb-5">Chào mừng đến với UniSave</p>

                <h2 className="text-balance text-[clamp(1.6rem,6.6vw,3.4rem)] font-extrabold uppercase leading-[1.03] tracking-[-0.02em]">
                  Quản lý tiền gọn,
                  <br />
                  <span className="text-[#ffb48f]">sống thoải mái.</span>
                </h2>
                <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-white/90">
                  Theo dõi chi tiêu, nuôi heo đất và săn kèo gom đơn cùng hàng nghìn sinh viên khác.
                </p>

                <ul className="mt-9 space-y-4">
                  {[
                    { icon: ShieldCheck, text: 'Quản trị viên duyệt sinh viên thật, chống lừa đảo' },
                    { icon: Sparkles, text: 'Heo đất tự động lớn mỗi ngày' },
                    { icon: Landmark, text: 'Kèo gom đơn tiết kiệm đến 40%' },
                  ].map(({ icon: Icon, text }) => (
                    <li
                      key={text}
                      className="flex items-start gap-3.5 text-[16px] leading-relaxed text-white/95"
                    >
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-white/80" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-[13px] font-medium text-white/75">
                © 2026 UniSave. Dành cho sinh viên Việt Nam.
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

              <form onSubmit={handleSubmit} className="mt-7">
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
