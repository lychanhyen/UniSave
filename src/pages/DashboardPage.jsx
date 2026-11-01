import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  Info,
  PiggyBank,
  Plus,
  Receipt,
  Settings2,
  ShoppingBag,
  Store,
  Target,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useBudgetStore } from '../hooks/useBudgetStore';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useMarketplace } from '../hooks/useMarketplace';
import { CATEGORY_MAP, FUND_STATUS, TONES } from '../lib/constants';
import { cn, formatCurrency, formatDate, formatRelativeTime, monthLabel } from '../lib/utils';
import BudgetForm from '../components/budget/BudgetForm';
import ExpenseForm from '../components/budget/ExpenseForm';
import PiggyBankCard from '../components/budget/PiggyBankCard';
import PiggyForecast from '../components/budget/PiggyForecast';
import DailyFundStatus from '../components/budget/DailyFundStatus';
import WeekChart from '../components/budget/WeekChart';
import OverspendAlert from '../components/budget/OverspendAlert';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

/** Hàng số liệu gọn: nhãn nhỏ phía trên, số đậm phía dưới. */
function Figure({ label, value, tone = 'text-ink-900', note }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">{label}</p>
      <p className={cn('figure-md mt-1', tone)}>{value}</p>
      {note && <p className="mt-0.5 text-[10px] text-ink-400">{note}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const currentUser = useCurrentUser();
  const { budget, expenses, state, addExpense, removeExpense, updateBudget } = useBudgetStore();
  const { posts } = useMarketplace();
  const [showBudget, setShowBudget] = useState(false);
  const formRef = useRef(null);

  /** Lịch sử đăng tin: giữ cả tin đã bán và tin đã xoá khỏi chợ. */
  const myPosts = useMemo(
    () =>
      posts
        .filter((post) => post.owner_id === currentUser.id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [posts, currentUser.id]
  );

  const historyCounts = useMemo(
    () =>
      myPosts.reduce(
        (acc, post) => {
          acc.total += 1;
          if (post.status === 'deleted') acc.deleted += 1;
          else if (post.status === 'sold' || post.status === 'done') acc.sold += 1;
          else acc.active += 1;
          return acc;
        },
        { total: 0, active: 0, sold: 0, deleted: 0 }
      ),
    [myPosts]
  );

  const displayName = currentUser.full_name || 'Sinh viên';
  const shortName = displayName.trim().split(/\s+/).slice(-1)[0];
  const recent = expenses.slice(0, 6);
  const budgetMonth = Number(String(state.monthKey).split('-')[1]);
  const fundStatus = FUND_STATUS[state.fundStatus] || FUND_STATUS.safe;
  const headerCopy =
    state.fundStatus === 'over'
      ? `Hôm nay bạn đã vượt hạn mức ${formatCurrency(state.overspendToday)}. Cùng cân lại chi tiêu nhé.`
      : state.fundStatus === 'warning'
        ? `Quỹ hôm nay chỉ còn ${formatCurrency(state.todayRemaining)}. Ưu tiên khoản cần thiết thôi nhé.`
        : `Hôm nay bạn còn ${formatCurrency(state.todayRemaining)} trong hạn mức.`;

  async function handleAdd(expense) {
    try {
      await addExpense(expense);
    } catch {
      /* lỗi đã được hook hiển thị toast */
    }
  }

  async function handleDelete(id) {
    await removeExpense(id);
    toast.success('Đã xóa khoản chi');
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* ---------------------------------------------------------------- Đầu trang */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow-accent">{monthLabel(state.monthKey)}</p>
          <h1 className="mt-2 text-[1.75rem] font-extrabold tracking-[-0.035em] text-ink-900 sm:text-[2.125rem]">
            {greeting()}, {shortName}.
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">{headerCopy}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => setShowBudget(true)} className="btn-secondary">
            <Settings2 className="h-4 w-4" />
            Ngân sách
          </button>
          <button type="button" onClick={scrollToForm} className="btn-primary">
            <Plus className="h-4 w-4" />
            Thêm chi tiêu
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
        {/* -------------------------------------------------------------- Cột chính */}
        <div className="min-w-0 space-y-5">
          {/* Khối nhấn duy nhất của màn: quỹ tháng. */}
          <section className="rounded-3xl bg-brand-600 px-5 py-6 text-white sm:px-7 sm:py-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                  Ngân sách tháng
                </p>
                <p className="figure-xl mt-2">{formatCurrency(state.M)}</p>
              </div>
              <span className="mt-1 shrink-0 rounded-md bg-white/15 px-2 py-1 text-[11px] font-bold tabular-nums">
                đã chi {Math.round(state.percent)}%
              </span>
            </div>

            {/* Thanh tiến độ mảnh, sắc. */}
            <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-[width] duration-700"
                style={{ width: `${Math.max(1.5, Math.min(100, state.percent))}%` }}
              />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-0">
              {[
                { label: 'Hạn mức hôm nay', value: state.todayLimit },
                { label: 'Đã chi hôm nay', value: state.todaySpent },
                { label: 'Còn lại tháng', value: state.remaining },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className={cn(
                    'pr-3',
                    i > 0 && 'border-l border-white/15 pl-3'
                  )}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/55">
                    {item.label}
                  </p>
                  <p className="mt-1 truncate text-[13px] font-bold tabular-nums">
                    {formatCurrency(item.value)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/15 pt-4 text-[11px] font-semibold text-white/75">
              <span className="inline-flex items-center gap-1.5">
                <span className={cn('h-1.5 w-1.5 rounded-full', fundStatus.dot)} />
                {fundStatus.label}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" />
                {state.daysLeft > 0 ? `${state.daysLeft} ngày còn lại` : 'Ngày cuối tháng'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <PiggyBank className="h-3.5 w-3.5" />
                Heo đất {formatCurrency(state.piggyBank)}
              </span>
              {state.unexpectedTotal > 0 && (
                <span className="inline-flex items-center gap-1.5 text-amber-200">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Đột xuất {formatCurrency(state.unexpectedTotal)}
                </span>
              )}
            </div>
          </section>

          <div ref={formRef}>
            <ExpenseForm onAdd={handleAdd} />
          </div>

          {/* Sổ chi tiêu gần đây */}
          <section className="card-strong px-5 py-5 sm:px-6">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="section-title">Chi tiêu gần đây</h2>
              <span className="text-[11px] font-semibold tabular-nums text-ink-400">
                {expenses.length} khoản
              </span>
            </div>

            {recent.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-100 text-ink-400">
                  <Receipt className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-ink-700">Chưa có chi tiêu nào</p>
                <p className="mt-1 text-xs text-ink-400">
                  Thêm khoản chi đầu tiên để bắt đầu theo dõi.
                </p>
              </div>
            ) : (
              <ul>
                {recent.map((expense) => {
                  const category = CATEGORY_MAP[expense.category] || CATEGORY_MAP.other;
                  const Icon = category.icon;
                  return (
                    <li
                      key={expense.id}
                      className="group flex items-center gap-3 border-t border-brand-200/60 py-3 first:border-t-0 first:pt-0"
                    >
                      <span
                        className={cn(
                          'grid h-9 w-9 shrink-0 place-items-center rounded-lg',
                          expense.is_unexpected
                            ? 'bg-amber-50 text-amber-700'
                            : TONES[category.tone] || TONES.slate
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-ink-900">
                          {expense.note}
                        </p>
                        <p className="text-[11px] text-ink-400">
                          {expense.is_unexpected ? (
                            <span className="font-semibold text-amber-700">
                              Đột xuất · {expense.unexpected_reason || 'Khác'}
                            </span>
                          ) : (
                            category.label
                          )}
                          {' · '}
                          {formatDate(expense.date)}
                        </p>
                      </div>
                      <span className="figure-md shrink-0 text-ink-900">
                        −{formatCurrency(expense.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(expense.id)}
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-ink-300 transition hover:bg-rose-50 hover:text-rose-700"
                        aria-label="Xóa khoản chi"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <WeekChart expenses={expenses} />

          {/* Lịch sử đăng tin: giữ lại cả tin đã xoá khỏi chợ. */}
          <section className="card-strong px-5 py-5 sm:px-6">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <h2 className="section-title">Lịch sử đăng tin</h2>
                <p className="mt-1 text-[11px] text-ink-400">
                  Tin đã xoá khỏi chợ vẫn được lưu ở đây để bạn xem lại và đăng lại.
                </p>
              </div>
              <Link
                to="/marketplace"
                className="text-[11px] font-bold text-brand-600 transition-colors hover:text-brand-700"
              >
                Xem chợ
              </Link>
            </div>

            {myPosts.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-100 text-ink-400">
                  <Store className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-ink-700">Chưa đăng tin nào</p>
                <p className="mt-1 text-xs text-ink-400">
                  Pass lại đồ cũ hoặc cho thuê đồ học tập ngay trong trường.
                </p>
                <Link to="/marketplace/new" className="btn-secondary mt-4 py-2 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  Đăng tin đầu tiên
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-3 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                  <span className="chip bg-ink-100 text-ink-600">{historyCounts.total} tin</span>
                  <span className="chip bg-brand-50 text-brand-700">
                    {historyCounts.active} chưa bán
                  </span>
                  <span className="chip bg-ink-100 text-ink-500">{historyCounts.sold} đã bán</span>
                  {historyCounts.deleted > 0 && (
                    <span className="chip bg-rose-50 text-rose-700">
                      {historyCounts.deleted} đã xoá
                    </span>
                  )}
                </div>

                <ul>
                  {myPosts.slice(0, 8).map((post) => {
                    const deleted = post.status === 'deleted';
                    const sold = post.status === 'sold' || post.status === 'done';
                    const deletedByAdmin =
                      deleted && post.deleted_by && post.deleted_by !== post.owner_id;
                    const label = deleted
                      ? deletedByAdmin
                        ? 'Admin đã xoá'
                        : 'Bạn đã xoá'
                      : sold
                        ? 'Đã bán'
                        : 'Chưa bán';
                    const chipTone = deleted
                      ? 'bg-rose-50 text-rose-700'
                      : sold
                        ? 'bg-ink-100 text-ink-500'
                        : 'bg-brand-50 text-brand-700';
                    return (
                      <li
                        key={post.id}
                        className="flex items-center gap-3 border-t border-brand-200/60 py-3 first:border-t-0 first:pt-0"
                      >
                        <span className={cn('chip shrink-0 text-[10px]', chipTone)}>{label}</span>
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/marketplace/${post.id}`}
                            className={cn(
                              'block truncate text-[13px] font-semibold transition-colors hover:text-brand-700',
                              deleted ? 'text-ink-400 line-through' : 'text-ink-900'
                            )}
                          >
                            {post.title}
                          </Link>
                          <p className="text-[11px] text-ink-400">
                            {formatRelativeTime(post.created_at)} · {formatCurrency(post.price)}
                            {deleted && ' · không hiện trên chợ'}
                          </p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-300" />
                      </li>
                    );
                  })}
                </ul>

                {myPosts.length > 8 && (
                  <Link
                    to="/marketplace"
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700"
                  >
                    Xem tất cả {myPosts.length} tin
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </>
            )}
          </section>
        </div>

        {/* ------------------------------------------------------------- Cột phụ */}
        <aside className="space-y-5">
          <DailyFundStatus state={state} />

          <OverspendAlert
            overspendToday={state.overspendToday}
            overspendTotal={state.overspendTotal}
          />

          {/* Các con số phụ gộp vào 1 khối, ngăn bằng đường kẻ. */}
          <section className="card-strong px-5 py-4">
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-400">
              Tổng quan
            </h2>
            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-3 border-t border-brand-200/60 pt-3 first:border-t-0 first:pt-0">
                <Figure label="Đã chi cả tháng" value={formatCurrency(state.totalSpent)} />
                <span className="text-[10px] font-semibold text-ink-400">/ {Math.round(state.percent)}%</span>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t border-brand-200/60 pt-3">
                <Figure
                  label="Heo đất"
                  value={formatCurrency(state.piggyBank)}
                  tone="text-brand-700"
                />
                <span className="text-[10px] font-semibold text-ink-400">10% tự trích</span>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t border-brand-200/60 pt-3">
                <Figure
                  label="Đột xuất"
                  value={formatCurrency(state.unexpectedTotal)}
                  tone={state.unexpectedTotal > 0 ? 'text-amber-700' : 'text-ink-500'}
                />
                <span className="text-[10px] font-semibold text-ink-400">trải đều tháng</span>
              </div>
            </div>
          </section>

          <PiggyBankCard piggyBank={state.piggyBank} target={state.savingsTarget} />

          <PiggyForecast state={state} />

          <div className="card-strong px-5 py-4">
            <div className="flex items-center gap-2 text-ink-500">
              <Info className="h-3.5 w-3.5 text-brand-600" />
              <h2 className="text-[12px] font-bold text-ink-900">Cách UniSave tính</h2>
            </div>
            <ul className="mt-2.5 space-y-1.5 text-[11px] leading-relaxed text-ink-500">
              <li>· Trích 10% ngân sách vào heo đất ngay đầu tháng.</li>
              <li>· Hạn mức ngày = phần còn lại ÷ số ngày còn lại.</li>
              <li>· Chi ít hơn hạn mức: phần dư chảy vào heo đất.</li>
              <li>· Khoản đột xuất được trải đều cả tháng.</li>
            </ul>
          </div>

          <div className="grid gap-2.5">
            <Link
              to="/marketplace"
              className="group flex items-center gap-3 card-strong px-4 py-3 transition-colors hover:border-brand-300"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-100 text-ink-600">
                <Store className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-ink-900">Chợ sinh viên</p>
                <p className="text-[10px] text-ink-400">Pass đồ, thuê đồ giá rẻ</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-ink-300 transition-colors group-hover:text-brand-600" />
            </Link>

            <Link
              to="/deals"
              className="group flex items-center gap-3 card-strong px-4 py-3 transition-colors hover:border-brand-300"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-100 text-ink-600">
                <ShoppingBag className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-ink-900">Gom đơn</p>
                <p className="text-[10px] text-ink-400">Mua chung, giảm đến 40%</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-ink-300 transition-colors group-hover:text-brand-600" />
            </Link>
          </div>
        </aside>
      </div>

      {showBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
            onClick={() => setShowBudget(false)}
          />
          <div className="animate-pop relative w-full max-w-lg">
            <button
              type="button"
              onClick={() => setShowBudget(false)}
              className="absolute -right-2 -top-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-white text-ink-500 shadow-card transition hover:text-ink-900"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
            <BudgetForm
              initialAmount={budget.total_amount}
              initialMonth={budgetMonth}
              onComplete={({ amount, month }) => {
                updateBudget(amount, month);
                setShowBudget(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}