import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  PiggyBank,
  ShoppingBag,
  Store,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/feedback/StarRating';
import Avatar from '../components/ui/Avatar';
import { useAppFeedback } from '../hooks/useAppFeedback';
import { formatRelativeTime } from '../lib/utils';

/* --------------------------------------------------------------------------
   Reveal on scroll. Transform + opacity only; reduced motion shows content.
   -------------------------------------------------------------------------- */
function useReveal() {
  const root = useRef(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    const targets = Array.from(el.querySelectorAll('[data-reveal]'));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      targets.forEach((t) => t.classList.add('is-in'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);
  return root;
}

/* --------------------------------------------------------------------------
   Cropped interface fragments — the product showing itself.
   -------------------------------------------------------------------------- */
function LedgerFragment() {
  return (
    <div data-ui className="rounded-2xl border border-brand-200 bg-white shadow-card">
      <div className="flex items-center justify-between px-5 pb-1 pt-5">
        <p className="text-[13px] font-semibold text-ink-500">Tháng 11 · còn 85%</p>
        <span className="rounded-md bg-brand-50 px-2 py-1 text-[12px] font-bold text-brand-700">
          An toàn
        </span>
      </div>

      <div className="px-5 pb-4 pt-2">
        <p className="text-[13px] text-ink-500">Ngân sách còn lại</p>
        <p className="mt-1 text-[38px] font-extrabold leading-none tracking-[-0.045em] tabular-nums text-ink-900">
          4.235.000<span className="ml-1 text-[20px] font-bold text-ink-500">₫</span>
        </p>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink-100">
          <div className="h-full w-[15%] rounded-full bg-brand-600" />
        </div>
        <p className="mt-2 text-[13px] text-ink-500">Đã chi 765.000 ₫ trên 5.000.000 ₫</p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            ['Hạn mức hôm nay', '137.226'],
            ['Chi hôm nay', '30.000'],
            ['Heo đất', '4.127.774'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-ink-50 px-2.5 py-2">
              <p className="text-[12px] leading-tight text-ink-500">{k}</p>
              <p className="mt-1 text-[14px] font-bold tabular-nums text-ink-900">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-ink-100 px-5 py-3">
        {[
          ['Ăn trưa căn tin', 'Ăn uống', '35.000'],
          ['Photo giáo trình', 'Sách vở', '12.000'],
          ['Gửi xe tháng', 'Đi lại', '5.000'],
        ].map(([note, cat, amount]) => (
          <div key={note} className="flex items-center gap-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-ink-900">{note}</p>
              <p className="text-[12px] text-ink-500">{cat}</p>
            </div>
            <span className="text-[13px] font-bold tabular-nums text-ink-900">−{amount} ₫</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketFragment() {
  return (
    <div data-ui className="rounded-2xl border border-brand-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ink-500">Chợ KTX Khu A</p>
        <span className="text-[12px] font-bold text-brand-700">12 tin mới</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {[
          ['Giáo trình Kinh tế vĩ mô', '120.000', 'Sách vở'],
          ['Áo khoác gió size L', '150.000', 'Quần áo'],
        ].map(([title, price, cat]) => (
          <div key={title} className="rounded-xl bg-ink-50 p-3">
            <div className="grid h-16 place-items-center rounded-lg bg-brand-100 text-brand-700">
              <Store className="h-6 w-6" />
            </div>
            <p className="mt-2 line-clamp-2 text-[13px] font-semibold leading-snug text-ink-900">
              {title}
            </p>
            <p className="mt-1 text-[14px] font-bold tabular-nums text-brand-700">{price} ₫</p>
            <p className="text-[12px] text-ink-500">{cat}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DealFragment() {
  return (
    <div data-ui className="rounded-2xl border border-brand-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white">
            <ShoppingBag className="h-4 w-4" />
          </span>
          <div>
            <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">
              Đang mở
            </span>
            <p className="mt-1 text-[12px] text-ink-500">Còn 2 ngày 14 giờ</p>
          </div>
        </div>
        <span className="rounded-md bg-rose-700 px-2 py-1 text-[12px] font-bold text-white">
          −30%
        </span>
      </div>
      <p className="mt-3 text-[14px] font-bold text-ink-900">Gom đơn cơm văn phòng</p>
      <p className="mt-1 text-[13px] text-ink-500">8/12 người · mỗi người 42.000 ₫</p>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
        <div className="h-full w-2/3 rounded-full bg-brand-600" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {['TH', 'MQ', 'BN', 'AL'].map((n) => (
            <span
              key={n}
              className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700 ring-2 ring-white"
            >
              {n.charAt(0)}
            </span>
          ))}
        </div>
        <span className="text-[12px] text-ink-500">còn 4 suất</span>
      </div>
    </div>
  );
}

function ChartFragment() {
  const bars = [42, 18, 65, 30, 88, 14, 26];
  const max = Math.max(...bars);
  return (
    <div data-ui className="rounded-2xl border border-brand-200 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-[13px] font-semibold text-ink-500">7 ngày qua</p>
        <p className="text-[14px] font-bold tabular-nums text-ink-900">283.000 ₫</p>
      </div>
      <div className="mt-4 flex h-32 items-end gap-2">
        {bars.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={
                'w-full rounded-sm ' +
                (i === 4 ? 'bg-brand-600' : v > 0 ? 'bg-ink-300' : 'bg-ink-200')
              }
              style={{ height: `${Math.max(8, Math.round((v / max) * 100))}%` }}
            />
            <span className="text-[12px] text-ink-500">{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SplitBillFragment() {
  const rows = [
    ['Thu Hà', '42.000'],
    ['Minh Quân', '42.000'],
    ['Bảo Ngọc', '42.000'],
  ];
  return (
    <div data-ui className="rounded-2xl border border-brand-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ink-500">Chia tiền kèo gom đơn</p>
        <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[12px] font-bold text-brand-700">
          126.000 ₫
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {rows.map(([name, amount]) => (
          <div key={name} className="flex items-center gap-3 rounded-lg bg-ink-50 px-3 py-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-brand-100 text-[13px] font-bold text-brand-700">
              {name.charAt(0)}
            </span>
            <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink-900">{name}</p>
            <span className="text-[13px] font-bold tabular-nums text-ink-900">{amount} ₫</span>
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[12px] text-ink-500">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
        Mỗi người chuyển đúng số tiền của mình
      </p>
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const {
    items: feedbackItems,
    stats: feedbackStats,
    loading: feedbackLoading,
  } = useAppFeedback();
  const loggedIn = Boolean(user);
  const isAdmin = user?.role === 'admin';
  const reveal = useReveal();

  const primaryTo = loggedIn ? (isAdmin ? '/admin' : '/dashboard') : '/register';
  const primaryLabel = loggedIn
    ? isAdmin
      ? 'Vào trang quản trị'
      : 'Vào Dashboard'
    : 'Đăng ký miễn phí';
  const secondaryTo = loggedIn ? '/marketplace' : '/login';
  const secondaryLabel = loggedIn ? 'Khám phá chợ sinh viên' : 'Đăng nhập';

  return (
    <div ref={reveal} className="min-h-screen bg-ink-50 text-ink-900">
      {/* ------------------------------------------------------------------ Bar */}
      <header className="sticky top-0 z-30 bg-ink-50/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white">
              <PiggyBank className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <span className="text-[17px] font-extrabold tracking-[-0.03em]">UniSave</span>
          </Link>

          <div className="flex items-center gap-1.5">
            {loggedIn ? (
              <Link to={primaryTo} className="btn-primary px-4 py-2.5 text-[15px]">
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost px-3 py-2.5 text-[15px]">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2.5 text-[15px]">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ----------------------------------------------------------------- Hero */}
      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-16">
        <div>
          <h1 className="text-balance text-[clamp(2.4rem,4.3vw,3.5rem)] font-extrabold leading-[0.98] tracking-[-0.05em]">
            Rõ từng đồng
            <br />
            Nhẹ cả tháng
          </h1>

          <p className="mt-5 max-w-lg text-[18px] leading-relaxed text-ink-700">
            Ghi một khoản chi là hạn mức hôm nay tự tính lại, 10% ngân sách tự chảy vào heo đất —
            cuối tháng không phải ngồi đếm lại. Kèm chợ đồ cũ trong trường, kèo gom đơn và thực đơn
            đi chợ cho sinh viên Việt Nam.
          </p>

          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
            <Link to={primaryTo} className="btn-primary justify-center px-7 py-4 text-[16px]">
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={secondaryTo}
              className="btn-secondary justify-center px-7 py-4 text-[16px]"
            >
              {secondaryLabel}
            </Link>
          </div>

          <p className="mt-6 text-[14px] leading-relaxed text-ink-500">
            Miễn phí hoàn toàn. Hồ sơ sinh viên được quản trị viên duyệt trước khi đăng bài.
          </p>
        </div>

        <div className="animate-in">
          <LedgerFragment />
        </div>
      </section>

      {/* ---------------------------------------------------------------- Stats */}
      <section className="bg-ink-900 py-14 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 px-5 sm:px-8 md:grid-cols-4">
          {[
            ['10%', 'ngân sách tự vào heo đất'],
            ['0 ₫', 'chi phí sử dụng'],
            ['3', 'tầng quyền: khách, sinh viên, admin'],
            ['24/7', 'ghi chi tiêu mọi lúc'],
          ].map(([value, label], i) => (
            <div
              key={label}
              data-reveal
              className="reveal border-l-2 border-brand-400/40 pl-4 first:border-l-0 first:pl-0 md:first:border-l-0"
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              <p className="text-[clamp(2.2rem,4vw,3rem)] font-extrabold leading-none tracking-[-0.04em] tabular-nums text-brand-300">
                {value}
              </p>
              <p className="mt-2 max-w-[16ch] text-[14px] leading-snug text-white/60">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- The product */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2
            data-reveal
            className="reveal max-w-3xl text-balance text-[clamp(1.7rem,3.6vw,2.4rem)] font-extrabold leading-[1.02] tracking-[-0.04em]"
          >
            Mở app là thấy hạn mức của hôm nay.
          </h2>
          <p data-reveal className="reveal mt-3 max-w-xl text-[16px] leading-relaxed text-ink-700">
            Sổ chi tiêu theo ngày, chợ đồ cũ trong trường, kèo gom đơn và thực đơn đi chợ — không
            phải mở thêm app nào khác.
          </p>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div data-reveal className="reveal">
              <MarketFragment />
            </div>
            <div data-reveal className="reveal space-y-5" style={{ transitionDelay: '80ms' }}>
              <DealFragment />
              <div data-ui className="rounded-2xl border-2 border-brand-700 bg-brand-600 p-5 text-white">
                <p className="text-[13px] font-semibold text-white/70">Dự báo cuối tháng</p>
                <p className="mt-1.5 text-[30px] font-extrabold leading-none tracking-[-0.04em] tabular-nums">
                  4.235.000<span className="ml-1 text-[17px] font-bold text-white/60">₫</span>
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-white/75">
                  Nếu giữ đúng hạn mức, heo đất của bạn chạm mốc này trước ngày chốt sổ.
                </p>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full w-4/5 rounded-full bg-white" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-white/10 px-2.5 py-2">
                    <p className="text-[12px] text-white/60">Heo đất hiện tại</p>
                    <p className="mt-0.5 text-[14px] font-bold tabular-nums">4.127.774</p>
                  </div>
                  <div className="rounded-lg bg-white/10 px-2.5 py-2">
                    <p className="text-[12px] text-white/60">Thưởng dự kiến</p>
                    <p className="mt-0.5 text-[14px] font-bold tabular-nums">+107.226</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div data-reveal className="reveal">
              <ChartFragment />
            </div>
            <div data-reveal className="reveal" style={{ transitionDelay: '80ms' }}>
              <SplitBillFragment />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- Features */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2
            data-reveal
            className="reveal max-w-2xl text-balance text-[clamp(1.7rem,3.6vw,2.4rem)] font-extrabold leading-[1.02] tracking-[-0.04em]"
          >
            Bốn việc, gọn trong một chỗ.
          </h2>

          <div className="card-strong mt-10 space-y-6 p-6 sm:p-8">
            {[
              {
                title: 'Ngân sách co giãn',
                body: 'Hạn mức mỗi ngày tự tính lại theo số tiền còn lại. Khoản đột xuất được trải đều cả tháng nên quỹ ăn uống không sụp.',
                link: '/dashboard',
                label: 'Xem sổ chi tiêu',
              },
              {
                title: 'Chợ trong trường',
                body: 'Pass lại giáo trình, thuê đồ học tập theo trường hoặc ký túc xá. Tin gần bạn được xếp trước, không phí ship.',
                link: '/marketplace',
                label: 'Xem chợ sinh viên',
              },
              {
                title: 'Gom đơn cho rẻ',
                body: 'Rủ bạn cùng lớp gom đơn lấy giá sỉ. Công cụ chia tiền nói rõ từng người chuyển bao nhiêu.',
                link: '/deals',
                label: 'Xem kèo đang mở',
              },
              {
                title: 'Đi chợ một lần',
                body: 'Nhập ngân sách và số ngày, app chọn món Việt rẻ, dễ nấu rồi gộp nguyên liệu thành một danh sách đi chợ kèm giá tham khảo.',
                link: '/nutrition',
                label: 'Xem thực đơn',
              },
            ].map((item, i) => (
              <div
                key={item.title}
                data-reveal
                className="reveal grid gap-2 md:grid-cols-[0.85fr_1.15fr] md:items-center md:gap-10"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <h3 className="text-[20px] font-bold leading-snug tracking-[-0.02em]">
                  {item.title}
                </h3>
                <div>
                  <p className="max-w-xl text-[16px] leading-relaxed text-ink-700">{item.body}</p>
                  <Link
                    to={loggedIn ? item.link : '/login'}
                    className="mt-2 inline-flex items-center gap-1.5 text-[15px] font-bold text-brand-600 transition-colors hover:text-brand-700"
                  >
                    {loggedIn ? item.label : 'Đăng nhập để xem'}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- How it works */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <h2
                data-reveal
                className="reveal text-balance text-[clamp(1.7rem,3.6vw,2.4rem)] font-extrabold leading-[1.02] tracking-[-0.04em]"
              >
                Bắt đầu trong ba bước.
              </h2>
              <p data-reveal className="reveal mt-3 text-[16px] leading-relaxed text-ink-700">
                Không cần bảng tính. Chỉ cần số tiền bạn có và một khoản chi mỗi ngày.
              </p>
            </div>

            <ol className="card-strong space-y-6 p-6 sm:p-8">
              {[
                [
                  'Đặt ngân sách tháng',
                  'Nhập số tiền bạn có. UniSave trích 10% vào heo đất và chia hạn mức cho từng ngày còn lại.',
                ],
                [
                  'Ghi chi tiêu mỗi ngày',
                  'Thêm một khoản chi trong vài giây. Quỹ hôm nay đổi sang vàng khi gần hết, đỏ khi vượt mức.',
                ],
                [
                  'Chốt sổ cuối tháng',
                  'Phần chưa tiêu tự chảy vào heo đất. Bạn thấy trước mình sẽ tiết kiệm được bao nhiêu.',
                ],
              ].map(([title, body], i) => (
                <li
                  key={title}
                  data-reveal
                  className="reveal"
                  style={{ transitionDelay: `${i * 70}ms` }}
                >
                  <h3 className="text-[19px] font-bold leading-snug tracking-[-0.02em]">{title}</h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-ink-700">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ Why */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2
            data-reveal
            className="reveal max-w-2xl text-balance text-[clamp(1.7rem,3.6vw,2.4rem)] font-extrabold leading-[1.02] tracking-[-0.04em]"
          >
            Làm cho sinh viên, không phải cho ngân hàng.
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: 'Minh bạch từng đồng',
                body: 'Mọi khoản chi hiện theo ngày, danh mục và lý do đột xuất. Không có phí ẩn.',
              },
              {
                title: 'Cùng trường, cùng kèo',
                body: 'Tin đăng và kèo gom đơn ưu tiên khu vực của bạn, giảm thời gian đi lại.',
              },
              {
                title: 'Sinh viên thật được duyệt',
                body: 'Quản trị viên đối chiếu MSSV và thẻ sinh viên trước khi gán huy hiệu.',
              },
              {
                title: 'Không giữ tiền của bạn',
                body: 'UniSave không làm trung gian thanh toán. Mọi chuyển khoản diễn ra trực tiếp.',
              },
            ].map((item, i) => (
              <div
                key={item.title}
                data-reveal
                className="reveal card-edge p-5"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <h3 className="text-[17px] font-bold leading-snug tracking-[-0.015em] text-brand-800">
                  {item.title}
                </h3>
                <p className="mt-1.5 max-w-md text-[16px] leading-relaxed text-ink-700">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Đánh giá công khai */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div data-reveal className="reveal grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <h2 className="text-balance text-[clamp(1.6rem,3vw,2.25rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-ink-900">
                Sinh viên đã dùng và nói gì về UniSave.
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-600">
                Điểm và đề xuất bên dưới do chính người dùng gửi, hiển thị công khai để người mới có
                cái nhìn tổng quan trước khi tạo tài khoản.
              </p>

              <div className="mt-6 flex items-end gap-3 rounded-2xl border-2 border-brand-200 bg-brand-50/70 px-4 py-3">
                <p className="text-[34px] font-extrabold leading-none tracking-[-0.04em] text-ink-900">
                  {feedbackStats.average || '—'}
                </p>
                <div className="pb-0.5">
                  <StarRating value={Math.round(feedbackStats.average)} size="sm" />
                  <p className="mt-1 text-[13px] font-semibold text-ink-600">
                    {feedbackStats.count > 0
                      ? `${feedbackStats.count} đánh giá · ${feedbackStats.suggestions} đề xuất`
                      : 'Chưa có đánh giá nào'}
                  </p>
                </div>
              </div>

              <Link
                to="/feedback"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl border-2 border-brand-600 bg-white px-5 py-3 text-[15px] font-bold text-brand-700 transition hover:bg-brand-600 hover:text-white"
              >
                Đánh giá UniSave
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-3">
              {feedbackLoading ? (
                <div className="rounded-2xl border-2 border-brand-200/60 bg-white px-4 py-8 text-center text-[13px] font-medium text-ink-400">
                  Đang tải đánh giá…
                </div>
              ) : feedbackItems.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/40 px-5 py-8 text-center">
                  <p className="text-[14px] font-bold text-ink-800">Chưa có đánh giá nào</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
                    Hãy là người đầu tiên chia sẻ cảm nhận, để sinh viên khác biết UniSave có ích thế
                    nào.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 rounded-2xl bg-brand-50/60 p-4 sm:p-5">
                  {feedbackItems.slice(0, 3).map((item, index) => (
                    <article
                      key={item.id}
                      className={index > 0 ? 'pt-1' : ''}
                    >
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Avatar size="sm" name={item.author_name} src={item.author_avatar} />
                        <span className="text-[13px] font-bold text-ink-900">{item.author_name}</span>
                        <StarRating value={Number(item.rating)} size="sm" />
                        <span className="text-[13px] text-ink-500">
                          {formatRelativeTime(item.created_at)}
                        </span>
                      </div>
                      {item.review && (
                        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-700">{item.review}</p>
                      )}
                      {item.suggestion && (
                        <p className="mt-2 rounded-xl bg-amber-50 px-2.5 py-1.5 text-[13px] leading-relaxed text-amber-900">
                          <span className="font-bold">Đề xuất: </span>
                          {item.suggestion}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-20">
        <div
          data-reveal
          className="reveal grid gap-10 rounded-3xl bg-brand-600 px-6 py-12 sm:px-12 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center"
        >
          <div>
            <h2 className="max-w-2xl text-balance text-[clamp(1.8rem,3.4vw,2.5rem)] font-extrabold leading-[1.02] tracking-[-0.045em] text-white">
              Bắt đầu từ tháng này.
            </h2>
            <p className="mt-3 max-w-lg text-[16px] leading-relaxed text-white/75">
              Đặt ngân sách hôm nay, ghi khoản chi đầu tiên, và xem heo đất lớn lên mỗi ngày.
            </p>
            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
              <Link
                to={primaryTo}
                className="btn justify-center bg-white px-7 py-4 text-[16px] font-bold text-brand-700 hover:bg-brand-50"
              >
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {!loggedIn && (
                <Link
                  to="/login"
                  className="btn justify-center border border-white/30 px-7 py-4 text-[16px] font-bold text-white hover:bg-white/10"
                >
                  Đã có tài khoản
                </Link>
              )}
            </div>
          </div>

          <ul className="space-y-3">
            {[
              'Miễn phí, không quảng cáo',
              'Hồ sơ sinh viên được duyệt',
              'Không giữ tiền, không phí ẩn',
              'Dùng được trên điện thoại',
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-[16px] text-white">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/50" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --------------------------------------------------------------- Footer */}
      <footer className="bg-ink-900 pb-10 pt-14 text-white">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="text-[clamp(2.2rem,6vw,4rem)] font-extrabold leading-none tracking-[-0.05em]">
            UniSave
          </p>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/60">
            Ứng dụng quản lý tiền dành cho sinh viên Việt Nam. Miễn phí, không quảng cáo.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-white/60">
            <Link to="/register" className="transition-colors hover:text-white">
              Tạo tài khoản
            </Link>
            <Link to="/login" className="transition-colors hover:text-white">
              Đăng nhập
            </Link>
            <span>© 2026 UniSave</span>
          </div>
        </div>
      </footer>
    </div>
  );
}