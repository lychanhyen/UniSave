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
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { supabase } from '../lib/supabase';

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
      toast.success(
        `Đã gửi email đặt lại mật khẩu đến ${email}. Vui lòng kiểm tra hộp thư.`
      );
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
    <div className="flex min-h-screen">
      {/* Left showcase */}
      <div className="relative hidden w-1/2 overflow-hidden bg-brand-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="relative flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur">
            <PiggyBank className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xl font-extrabold tracking-tight">UniSave</p>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200">
              Student finance
            </p>
          </div>
        </Link>

        <div className="relative">
          <h2 className="text-balance text-4xl font-extrabold leading-tight tracking-tight">
            Quản lý tiền thông minh,
            <br />
            sống thoải mái hơn.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-100">
            Theo dõi chi tiêu, nuôi heo đất và săn kèo gom đơn cùng hàng nghìn sinh viên khác.
          </p>

          <div className="mt-8 space-y-3">
            {[
              { icon: ShieldCheck, text: 'Quản trị viên duyệt sinh viên thật, chống lừa đảo' },
              { icon: Sparkles, text: 'Heo đất tự động lớn mỗi ngày' },
              { icon: ArrowRight, text: 'Kèo gom đơn tiết kiệm đến 40%' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-brand-50">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/15">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-brand-200">© 2026 UniSave. Dành cho sinh viên Việt Nam.</p>
      </div>

      {/* Form */}
      <div className="flex w-full items-center justify-center px-5 py-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white shadow-soft">
                <PiggyBank className="h-5 w-5" />
              </span>
              <span className="text-xl font-extrabold tracking-tight text-ink-900">UniSave</span>
            </Link>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Chào mừng trở lại 👋</h1>
          <p className="mt-1.5 text-sm text-ink-500">Đăng nhập để tiếp tục hành trình tiết kiệm.</p>

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

            <div className="mb-5 flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 font-medium text-ink-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                />
                Ghi nhớ đăng nhập
              </label>
              <button type="button" onClick={handleResetPassword} className="font-semibold text-brand-600 hover:text-brand-700">
                Quên mật khẩu?
              </button>
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full">
              Đăng nhập
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {demoMode && (
            <div className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-brand-50/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-700">
                Tài khoản demo
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
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
                      className="flex w-full items-center gap-3 rounded-xl border border-white bg-white px-3 py-2.5 text-left shadow-soft transition hover:border-brand-300 disabled:opacity-60"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-ink-900">
                          {account.label}
                        </span>
                        <span className="block truncate text-[10px] text-ink-400">
                          {account.email} · {account.password} · {account.hint}
                        </span>
                      </span>
                      {quickLoading === account.email ? (
                        <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
                      ) : (
                        <ArrowRight className="h-4 w-4 shrink-0 text-brand-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-ink-500">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Đăng ký ngay
            </Link>
          </p>
          <p className="mt-2 text-center text-[11px] text-ink-400">
            Tài khoản bị khóa? Liên hệ quản trị viên UniSave để được hỗ trợ.
          </p>
        </div>
      </div>
    </div>
  );
}