import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Coins,
  MapPin,
  PiggyBank,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: Wallet,
    title: 'Ngân sách thông minh',
    description:
      'Hạn mức mỗi ngày tự co giãn theo số tiền còn lại. Khoản đột xuất được trải đều cả tháng, không đánh sập quỹ ăn uống.',
    tone: 'from-brand-500 to-emerald-600',
    to: '/dashboard',
  },
  {
    icon: Store,
    title: 'Chợ sinh viên',
    description:
      'Pass lại đồ cũ, thuê đồ học tập theo trường hoặc ký túc xá. Tin gần bạn được ưu tiên, giao dịch không phí ship.',
    tone: 'from-amber-500 to-orange-500',
    to: '/marketplace',
  },
  {
    icon: ShoppingBag,
    title: 'Gom đơn tiết kiệm',
    description:
      'Rủ bạn cùng lớp gom đơn để được giá sỉ, freeship. Công cụ chia tiền cho biết từng người cần chuyển bao nhiêu.',
    tone: 'from-blue-500 to-indigo-600',
    to: '/deals',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Đặt ngân sách tháng',
    description: 'Nhập số tiền bạn có. UniSave tự trích 10% vào heo đất và chia hạn mức cho từng ngày.',
  },
  {
    number: '02',
    title: 'Ghi chi tiêu mỗi ngày',
    description: 'Thêm khoản chi trong vài giây. Thẻ quỹ đổi màu xanh – vàng – đỏ để bạn biết mình đang ở đâu.',
  },
  {
    number: '03',
    title: 'Cuối tháng nhận heo đất',
    description: 'Phần chưa tiêu tự chảy vào heo đất. Dự báo cuối tháng cho bạn thấy mình sắp tiết kiệm được bao nhiêu.',
  },
];

function Brand({ light = false }) {
  return (
    <Link to="/" className="group flex items-center gap-3">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-glow transition-transform group-hover:scale-105">
        <PiggyBank className="h-5 w-5" strokeWidth={2.2} />
      </span>
      <span className="flex flex-col leading-none">
        <span className={light ? 'text-lg font-extrabold tracking-tight text-white' : 'text-lg font-extrabold tracking-tight text-ink-900'}>
          UniSave
        </span>
        <span className={light ? 'mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-200' : 'mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-600'}>
          Student finance
        </span>
      </span>
    </Link>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const loggedIn = Boolean(user);
  const isAdmin = user?.role === 'admin';

  const primaryTo = loggedIn ? (isAdmin ? '/admin' : '/dashboard') : '/register';
  const primaryLabel = loggedIn
    ? isAdmin
      ? 'Vào trang quản trị'
      : 'Vào Dashboard'
    : 'Đăng ký miễn phí';
  const secondaryTo = loggedIn ? '/marketplace' : '/login';
  const secondaryLabel = loggedIn ? 'Khám phá chợ sinh viên' : 'Đăng nhập';

  return (
    <div className="min-h-screen bg-[#f7faf8] text-ink-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-ink-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Brand />
          <nav className="hidden items-center gap-6 text-sm font-semibold text-ink-500 md:flex">
            <a href="#tinh-nang" className="transition hover:text-brand-600">Tính năng</a>
            <a href="#cach-hoat-dong" className="transition hover:text-brand-600">Cách hoạt động</a>
            <a href="#vi-sao" className="transition hover:text-brand-600">Vì sao UniSave</a>
          </nav>
          <div className="flex items-center gap-2">
            {loggedIn ? (
              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                className="btn-primary px-4 py-2 text-xs sm:text-sm"
              >
                {isAdmin ? 'Trang quản trị' : 'Vào Dashboard'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost px-3 py-2 text-xs sm:text-sm">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2 text-xs sm:text-sm">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-24 lg:pt-20">
          <div className="animate-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700 shadow-soft">
              <Sparkles className="h-3.5 w-3.5" />
              Dành cho sinh viên Việt Nam
            </span>

            <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-ink-900 sm:text-5xl lg:text-[3.4rem]">
              Tiền về đúng ví,
              <br />
              <span className="bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">
                cuối tháng vẫn dư.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-500 sm:text-base">
              UniSave giúp bạn chia ngân sách, nuôi heo đất, pass đồ và gom đơn cùng sinh viên
              cùng trường — tất cả trong một ứng dụng nhẹ nhàng, dễ dùng mỗi ngày.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to={primaryTo} className="btn-primary justify-center px-6 py-3.5 text-sm sm:text-base">
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to={secondaryTo} className="btn-secondary justify-center px-6 py-3.5 text-sm sm:text-base">
                {secondaryLabel}
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-ink-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-600" />
                Miễn phí cho sinh viên
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-brand-600" />
                Quản trị viên duyệt sinh viên thật
              </span>
            </div>
          </div>

          {/* Mock dashboard */}
          <div className="animate-in-delay-1 relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -right-4 -top-4 hidden rounded-2xl border border-white/70 bg-white/90 p-3 shadow-card backdrop-blur sm:block">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-50 text-amber-600">
                  <PiggyBank className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">Heo đất</p>
                  <p className="text-sm font-extrabold text-ink-900">4.127.774 ₫</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/80 bg-white p-3 shadow-[0_30px_80px_-30px_rgba(5,150,105,0.45)] sm:p-4">
              <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-brand-600 via-brand-600 to-emerald-700 p-5 text-white sm:p-6">
                <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-emerald-300/20 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-brand-100">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Tháng 10/2026
                    </span>
                    <span className="rounded-full bg-white/15 px-2.5 py-1">Còn 85%</span>
                  </div>

                  <p className="mt-4 text-[11px] font-medium text-brand-100">Ngân sách tháng này</p>
                  <p className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">5.000.000 ₫</p>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full w-[15%] rounded-full bg-white" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-brand-100">
                    <span>Đã chi 765.000 ₫</span>
                    <span>15% ngân sách</span>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {[
                      { label: 'Hạn mức hôm nay', value: '137.226 ₫' },
                      { label: 'Chi hôm nay', value: '30.000 ₫' },
                      { label: 'Còn lại tháng', value: '4.235.000 ₫' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl bg-white/10 px-2.5 py-2 ring-1 ring-white/10">
                        <p className="text-[8px] font-bold uppercase tracking-wide text-brand-100">{item.label}</p>
                        <p className="mt-0.5 text-[11px] font-extrabold">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      Quỹ hôm nay: An toàn
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1">
                      <PiggyBank className="h-3 w-3" />
                      Heo đất 4.127.774 ₫
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-ink-100 bg-ink-50/60 p-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-100 text-brand-700">
                      <TrendingUp className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">Dự báo heo đất</p>
                  </div>
                  <p className="mt-2 text-lg font-extrabold tracking-tight text-ink-900">4.235.000 ₫</p>
                  <p className="mt-0.5 text-[10px] text-ink-400">Nếu giữ đúng hạn mức</p>
                </div>
                <div className="rounded-2xl border border-ink-100 bg-ink-50/60 p-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-100 text-amber-700">
                      <ShoppingBag className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">Kèo gom đơn</p>
                  </div>
                  <p className="mt-2 text-lg font-extrabold tracking-tight text-ink-900">-30%</p>
                  <p className="mt-0.5 text-[10px] text-ink-400">Tiết kiệm 18.000 ₫/người</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-white/70 bg-white/95 p-3 shadow-card backdrop-blur sm:block">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">Gần bạn</p>
                  <p className="text-xs font-extrabold text-ink-900">KTX Khu A · 2 giờ trước</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-ink-200/60 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4">
          {[
            { value: '10%', label: 'ngân sách tự vào heo đất' },
            { value: '3', label: 'tầng quyền: khách, sinh viên, admin' },
            { value: '0 ₫', label: 'chi phí sử dụng' },
            { value: '24/7', label: 'cập nhật chi tiêu' },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-2xl font-extrabold tracking-tight text-brand-700 sm:text-3xl">{item.value}</p>
              <p className="mt-1 text-xs font-medium text-ink-500">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="tinh-nang" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Tính năng</p>
          <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Một ứng dụng, đủ cho đời sống sinh viên.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-500">
            Không cần bảng tính phức tạp. Mọi thứ bạn cần để giữ tiền trong ví đều nằm ở đây.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description, tone, to }) => (
            <article key={title} className="card card-hover p-6">
              <span className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-soft`}>
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-extrabold tracking-tight text-ink-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{description}</p>
              <Link to={loggedIn ? to : '/login'} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-600 transition hover:gap-2">
                {loggedIn ? 'Xem thử' : 'Đăng nhập để xem'}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="cach-hoat-dong" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Cách hoạt động</p>
              <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                Bắt đầu trong 3 bước.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                Không cần nhập liệu phức tạp. Chỉ cần số tiền bạn có và một khoản chi mỗi ngày.
              </p>
              <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
                <div className="flex items-center gap-2 text-brand-700">
                  <Zap className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-wide">Mẹo nhỏ</p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-ink-600">
                  Bật “Đột xuất” cho sửa xe, y tế hoặc thiết bị học tập. Khoản đó sẽ được trải đều
                  cả tháng thay vì làm hạn mức ăn uống hôm nay sụp về 0.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {STEPS.map((step) => (
                <div key={step.number} className="flex gap-4 rounded-3xl border border-ink-200/70 bg-ink-50/40 p-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-sm font-extrabold text-brand-700 shadow-soft ring-1 ring-brand-100">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-ink-900">{step.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-ink-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section id="vi-sao" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: ShieldCheck,
              title: 'Minh bạch từng đồng',
              text: 'Mọi khoản chi đều hiện rõ theo ngày, danh mục và lý do đột xuất. Không có chi phí ẩn.',
            },
            {
              icon: Users,
              title: 'Cùng trường, cùng kèo',
              text: 'Ưu tiên tin đăng và kèo gom đơn gần khu vực của bạn, giảm phí ship và thời gian đi lại.',
            },
            {
              icon: BadgeCheck,
              title: 'Xác minh bởi admin',
              text: 'Quản trị viên kiểm tra MSSV và thẻ sinh viên trước khi gán huy hiệu. Tài khoản vi phạm bị khóa, bài đăng bị gỡ.',
            },
            {
              icon: ShieldCheck,
              title: 'An toàn hơn khi giao dịch',
              text: 'Người bán có badge xác minh sinh viên. UniSave không giữ tiền, mọi chuyển khoản đều trực tiếp.',
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-sm font-extrabold text-ink-900">{title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:pb-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-600 to-emerald-700 px-6 py-12 text-center text-white shadow-[0_30px_80px_-30px_rgba(5,150,105,0.5)] sm:px-12">
          <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em]">
              <Coins className="h-3.5 w-3.5" />
              Bắt đầu hôm nay
            </span>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
              Để tháng sau bạn không phải nói “hết tiền rồi”.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-brand-100">
              Đặt ngân sách, ghi khoản chi đầu tiên và xem heo đất lớn lên mỗi ngày.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to={primaryTo} className="btn bg-white px-6 py-3.5 text-sm font-bold text-brand-700 shadow-soft transition hover:bg-brand-50">
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {!loggedIn && (
                <Link to="/login" className="btn border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/20">
                  Đã có tài khoản
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-200/60 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6">
          <Brand />
          <p className="text-center text-xs text-ink-400 sm:text-right">
            © 2026 UniSave · Dành cho sinh viên Việt Nam.
            <br className="sm:hidden" />
            <span className="ml-1">Quản lý tiền nhẹ nhàng hơn mỗi ngày.</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
