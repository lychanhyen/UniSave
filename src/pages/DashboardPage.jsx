import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Info,
  PiggyBank,
  Plus,
  Settings2,
  ShoppingBag,
  Store,
  Target,
  UserRound,
  X,
} from 'lucide-react';
import { useBudgetStore } from '../hooks/useBudgetStore';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { FUND_STATUS } from '../lib/constants';
import { cn, formatCurrency, monthLabel } from '../lib/utils';
import BudgetForm from '../components/budget/BudgetForm';
import PiggyBankCard from '../components/budget/PiggyBankCard';
import DailyFundStatus from '../components/budget/DailyFundStatus';
import ExpenseCalendar from '../components/budget/ExpenseCalendar';
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

const QUICK_LINKS = [
  { to: '/expenses', label: 'Ghi chi tiêu', hint: 'Thêm khoản chi, thu nhập', icon: Plus },
  { to: '/marketplace', label: 'Chợ sinh viên', hint: 'Pass đồ, thuê đồ giá rẻ', icon: Store },
  { to: '/deals', label: 'Gom đơn', hint: 'Mua chung, giảm đến 40%', icon: ShoppingBag },
];

export default function DashboardPage() {
  const currentUser = useCurrentUser();
  const { budget, expenses, state, addExpense, removeExpense, updateBudget } = useBudgetStore();
  const [showBudget, setShowBudget] = useState(false);

  const displayName = currentUser.full_name || 'Sinh viên';
  const shortName = displayName.trim().split(/\s+/).slice(-1)[0];
  const budgetMonth = Number(String(state.monthKey).split('-')[1]);
  const fundStatus = FUND_STATUS[state.fundStatus] || FUND_STATUS.safe;

  async function handleAdd(expense) {
    try {
      await addExpense(expense);
    } catch {
      /* lỗi đã được hook hiển thị toast */
    }
  }

  async function handleDelete(id) {
    await removeExpense(id);
  }

  const profileLink = currentUser.id ? `/u/${currentUser.id}` : '/profile';
  const links = [...QUICK_LINKS, { to: profileLink, label: 'Trang cá nhân', hint: 'Tin, kèo, số liệu của bạn', icon: UserRound }];

  return (
    <div className="mx-auto max-w-6xl">
      {/* ---------------------------------------------------------------- Đầu trang */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow-accent">{monthLabel(state.monthKey)}</p>
          <h1 className="mt-2 text-[1.7rem] font-extrabold tracking-[-0.035em] text-ink-900 sm:text-[2.125rem]">
            {greeting()}, {shortName}.
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">
            {state.fundStatus === 'over'
              ? `Hôm nay vượt hạn mức ${formatCurrency(state.overspendToday)}.`
              : `Hôm nay bạn còn ${formatCurrency(state.todayRemaining)} trong hạn mức.`}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button type="button" onClick={() => setShowBudget(true)} className="btn-secondary">
            <Settings2 className="h-4 w-4" />
            Ngân sách
          </button>
          <Link to="/expenses" className="btn-primary">
            <Plus className="h-4 w-4" />
            Ghi chi tiêu
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
        <div className="min-w-0 space-y-5">
          {/* Quỹ tháng: khối nhấn duy nhất của màn tổng quan. */}
          <section className="rounded-3xl bg-brand-600 px-5 py-6 text-white sm:px-7 sm:py-7">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                  Ngân sách tháng
                </p>
                <p className="figure-xl mt-2 break-words">{formatCurrency(state.M)}</p>
              </div>
              <span className="shrink-0 whitespace-nowrap rounded-md bg-white/15 px-2 py-1 text-[11px] font-bold tabular-nums">
                đã chi {Math.round(state.percent)}%
              </span>
            </div>

            <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-[width] duration-700"
                style={{ width: `${Math.max(1.5, Math.min(100, state.percent))}%` }}
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-0">
              {[
                { label: 'Hạn mức hôm nay', value: state.todayLimit },
                { label: 'Đã chi hôm nay', value: state.todaySpent },
                { label: 'Còn lại tháng', value: state.remaining },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className={cn(
                    'min-w-0',
                    index > 0 && 'border-t border-white/15 pt-3 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0'
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
            </div>
          </section>

          {/* Lịch chi tiêu: phần chính của tổng quan. */}
          <ExpenseCalendar
            expenses={expenses}
            budget={budget}
            currentMonthKey={state.monthKey}
            onAdd={handleAdd}
            onDelete={handleDelete}
          />

          {/* Lối tắt sang các trang khác, thay cho việc nhồi hết vào một màn. */}
          <section className="grid gap-2.5 sm:grid-cols-2">
            {links.map(({ to, label, hint, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-3 card-strong px-4 py-3 transition-colors hover:border-brand-300"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-bold text-ink-900">{label}</span>
                  <span className="block truncate text-[10px] text-ink-400">{hint}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-300 transition-colors group-hover:text-brand-600" />
              </Link>
            ))}
          </section>
        </div>

        {/* ------------------------------------------------------------- Cột phụ */}
        <aside className="space-y-5">
          <DailyFundStatus state={state} />
          <OverspendAlert overspendToday={state.overspendToday} overspendTotal={state.overspendTotal} />

          <section className="card-strong px-5 py-4">
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-400">
              Tổng quan
            </h2>
            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <Figure label="Đã chi cả tháng" value={formatCurrency(state.totalSpent)} />
                <span className="shrink-0 whitespace-nowrap text-[10px] font-semibold text-ink-400">
                  / {Math.round(state.percent)}%
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t border-brand-200/60 pt-3">
                <Figure label="Heo đất" value={formatCurrency(state.piggyBank)} tone="text-brand-700" />
                <span className="shrink-0 text-[10px] font-semibold text-ink-400">10% tự trích</span>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t border-brand-200/60 pt-3">
                <Figure
                  label="Đột xuất"
                  value={formatCurrency(state.unexpectedTotal)}
                  tone={state.unexpectedTotal > 0 ? 'text-amber-700' : 'text-ink-500'}
                />
                <span className="shrink-0 text-[10px] font-semibold text-ink-400">trải đều tháng</span>
              </div>
            </div>
          </section>

          <PiggyBankCard piggyBank={state.piggyBank} target={state.savingsTarget} />

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
