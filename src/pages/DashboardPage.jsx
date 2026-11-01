import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  Coins,
  Info,
  PiggyBank,
  Plus,
  Receipt,
  Settings2,
  ShoppingBag,
  Sparkles,
  Store,
  Target,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useBudgetStore } from '../hooks/useBudgetStore';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { CATEGORY_MAP, FUND_STATUS, TONES } from '../lib/constants';
import { cn, formatCurrency, formatDate, monthLabel } from '../lib/utils';
import BudgetForm from '../components/budget/BudgetForm';
import ExpenseForm from '../components/budget/ExpenseForm';
import PiggyBankCard from '../components/budget/PiggyBankCard';
import PiggyForecast from '../components/budget/PiggyForecast';
import DailyFundStatus from '../components/budget/DailyFundStatus';
import WeekChart from '../components/budget/WeekChart';
import OverspendAlert from '../components/budget/OverspendAlert';
import StatCards from '../components/budget/StatCards';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

export default function DashboardPage() {
  const currentUser = useCurrentUser();
  const { budget, expenses, state, addExpense, removeExpense, updateBudget } = useBudgetStore();
  const [showBudget, setShowBudget] = useState(false);
  const formRef = useRef(null);

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
      <div className="animate-in mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
            <CalendarDays className="h-3.5 w-3.5" />
            {monthLabel(state.monthKey)}
          </p>
          <h1 className="text-balance text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            {greeting()}, {shortName}! 👋
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">{headerCopy}</p>
        </div>

        <div className="flex items-center gap-2">
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Hero */}
          <div className="animate-in relative overflow-hidden rounded-4xl bg-gradient-to-br from-brand-600 via-brand-600 to-emerald-700 p-6 text-white shadow-glow sm:p-8">
            <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-emerald-300/20 blur-2xl" />

            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-brand-100">Ngân sách tháng này</p>
                  <p className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
                    {formatCurrency(state.M)}
                  </p>
                </div>
                <span className="chip bg-white/15 text-white backdrop-blur">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Còn {Math.max(0, 100 - Math.round(state.percent))}%
                </span>
              </div>

              <div className="mt-7">
                <div className="flex items-center justify-between text-xs font-medium text-brand-100">
                  <span>Đã chi {formatCurrency(state.totalSpent)}</span>
                  <span>{Math.round(state.percent)}% ngân sách</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700"
                    style={{ width: `${Math.max(2, state.percent)}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: 'Hạn mức hôm nay', value: state.todayLimit },
                  { label: 'Chi sinh hoạt hôm nay', value: state.todaySpent },
                  { label: 'Còn lại tháng', value: state.remaining },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-white/10 px-3 py-2.5 ring-1 ring-white/10 backdrop-blur-sm"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-100/80">
                      {item.label}
                    </p>
                    <p className="mt-1 truncate text-sm font-extrabold tracking-tight">
                      {formatCurrency(item.value)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="chip bg-white/15 text-white backdrop-blur">
                  <span className={cn('h-1.5 w-1.5 rounded-full', fundStatus.dot)} />
                  Quỹ hôm nay: {fundStatus.label}
                </span>
                <span className="chip bg-white/15 text-white backdrop-blur">
                  <Target className="h-3.5 w-3.5" />
                  {state.daysLeft > 0 ? `${state.daysLeft} ngày còn lại` : 'Ngày cuối tháng'}
                </span>
                <span className="chip bg-white/15 text-white backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5" />
                  Heo đất {formatCurrency(state.piggyBank)}
                </span>
                {state.unexpectedTotal > 0 && (
                  <span className="chip bg-amber-300/25 text-amber-50 backdrop-blur">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Đột xuất {formatCurrency(state.unexpectedTotal)}
                  </span>
                )}
                <span className="chip bg-white/15 text-white backdrop-blur">
                  <Coins className="h-3.5 w-3.5" />
                  Đã tiết kiệm 10%
                </span>
              </div>
            </div>
          </div>

          <div ref={formRef}>
            <ExpenseForm onAdd={handleAdd} />
          </div>

          {/* Recent */}
          <div className="card animate-in-delay-2 p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="section-title">Chi tiêu gần đây</h2>
              <span className="chip bg-ink-100 text-ink-500">{expenses.length} khoản</span>
            </div>

            {recent.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 text-ink-400">
                  <Receipt className="h-6 w-6" />
                </span>
                <p className="mt-3 text-sm font-semibold text-ink-700">Chưa có chi tiêu nào</p>
                <p className="mt-1 text-xs text-ink-400">
                  Thêm khoản chi đầu tiên để bắt đầu theo dõi.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-ink-100">
                {recent.map((expense) => {
                  const category = CATEGORY_MAP[expense.category] || CATEGORY_MAP.other;
                  const Icon = category.icon;
                  return (
                    <li key={expense.id} className="group flex items-center gap-3 py-3.5">
                      <span
                        className={cn(
                          'grid h-10 w-10 shrink-0 place-items-center rounded-2xl',
                          expense.is_unexpected
                            ? 'bg-amber-50 text-amber-600'
                            : TONES[category.tone] || TONES.slate
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink-900">{expense.note}</p>
                        <p className="text-xs text-ink-400">
                          {expense.is_unexpected ? (
                            <span className="font-semibold text-amber-600">
                              Đột xuất · {expense.unexpected_reason || 'Khác'}
                            </span>
                          ) : (
                            category.label
                          )}{' '}
                          · {formatDate(expense.date)}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-ink-900">
                        -{formatCurrency(expense.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(expense.id)}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-ink-300 transition hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Xóa khoản chi"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <WeekChart expenses={expenses} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <StatCards
            fund={state.pool + state.todayRemaining}
            spent={state.totalSpent}
            piggy={state.piggyBank}
            unexpected={state.unexpectedTotal}
          />

          <DailyFundStatus state={state} />

          <OverspendAlert
            overspendToday={state.overspendToday}
            overspendTotal={state.overspendTotal}
          />

          <PiggyBankCard piggyBank={state.piggyBank} target={state.savingsTarget} />

          <PiggyForecast state={state} />

          <div className="card p-5">
            <div className="flex items-center gap-2 text-ink-500">
              <Info className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm font-bold text-ink-900">Cách UniSave tính toán</h2>
            </div>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-ink-500">
              <li>
                · Trích <b className="text-ink-700">10%</b> ngân sách vào heo đất ngay đầu tháng.
              </li>
              <li>· Hạn mức mỗi ngày = phần còn lại ÷ số ngày còn lại.</li>
              <li>· Chi ít hơn hạn mức thì phần dư tự chảy vào heo đất.</li>
              <li>· Chi vượt hạn mức sẽ bị trừ vào quỹ những ngày sau.</li>
              <li>
                · Tổng khoản <b className="text-amber-700">đột xuất</b> được trải đều cả tháng,
                không đè nặng hạn mức ăn uống hôm nay.
              </li>
            </ul>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link
              to="/marketplace"
              className="group flex items-center gap-3 rounded-3xl border border-ink-200/70 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                <Store className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink-900">Chợ sinh viên</p>
                <p className="text-[11px] text-ink-400">Pass đồ, thuê đồ giá rẻ</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-ink-300 transition group-hover:text-brand-600" />
            </Link>

            <Link
              to="/deals"
              className="group flex items-center gap-3 rounded-3xl border border-ink-200/70 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-600">
                <ShoppingBag className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink-900">Gom đơn</p>
                <p className="text-[11px] text-ink-400">Mua chung, giảm đến 40%</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-ink-300 transition group-hover:text-brand-600" />
            </Link>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-ink-900 to-ink-800 p-5 text-white">
            <div className="flex items-center gap-2 text-brand-300">
              <PiggyBank className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em]">Mục tiêu tháng</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-300">
              Tiết kiệm thêm{' '}
              <b className="text-white">
                {formatCurrency(Math.max(0, state.savingsTarget - state.piggyBank))}
              </b>{' '}
              để đạt mục tiêu 25% ngân sách.
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-300"
                style={{
                  width: `${Math.min(100, Math.round((state.piggyBank / Math.max(1, state.savingsTarget)) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {showBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
            onClick={() => setShowBudget(false)}
          />
          <div className="animate-in relative w-full max-w-lg">
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
