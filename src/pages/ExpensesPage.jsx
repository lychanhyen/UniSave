import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Info, PiggyBank, Plus, Receipt, Target, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBudgetStore } from '../hooks/useBudgetStore';
import { CATEGORY_MAP, TONES } from '../lib/constants';
import { cn, formatCurrency, formatDate, monthLabel } from '../lib/utils';
import ExpenseForm from '../components/budget/ExpenseForm';
import IncomeCard from '../components/budget/IncomeCard';
import PiggyForecast from '../components/budget/PiggyForecast';
import WeekChart from '../components/budget/WeekChart';

function SummaryCell({ label, value, tone = 'text-ink-900' }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-400">{label}</p>
      <p className={cn('mt-1 truncate text-[13px] font-bold tabular-nums', tone)}>{value}</p>
    </div>
  );
}

export default function ExpensesPage() {
  const {
    budget,
    expenses,
    incomes,
    state,
    addExpense,
    removeExpense,
    addIncome,
    removeIncome,
  } = useBudgetStore();
  const formRef = useRef(null);

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

  const recent = expenses.slice(0, 20);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow-accent">{monthLabel(state.monthKey)}</p>
          <h1 className="mt-2 text-[1.7rem] font-extrabold tracking-[-0.035em] text-ink-900 sm:text-[2.125rem]">
            Chi tiêu của bạn
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">
            Ghi khoản chi, thêm thu nhập và xem lại lịch sử chi tiêu.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link to="/dashboard" className="btn-secondary">
            <ArrowUpRight className="h-4 w-4" />
            Tổng quan
          </Link>
          <Link to="/dashboard" className="btn-primary">
            <Target className="h-4 w-4" />
            Lịch tháng
          </Link>
        </div>
      </div>

      <section className="card-strong mb-5 px-5 py-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCell label="Ngân sách tháng" value={formatCurrency(state.M)} />
          <SummaryCell label="Hạn mức hôm nay" value={formatCurrency(state.todayLimit)} />
          <SummaryCell
            label="Đã chi hôm nay"
            value={formatCurrency(state.todaySpent)}
            tone={state.todaySpent > state.todayLimit ? 'text-rose-600' : 'text-ink-900'}
          />
          <SummaryCell label="Còn lại tháng" value={formatCurrency(state.remaining)} tone="text-brand-700" />
        </div>
      </section>

      <div ref={formRef} className="space-y-5">
        <ExpenseForm onAdd={handleAdd} />

        <IncomeCard
          incomes={incomes}
          monthKey={state.monthKey}
          onAdd={addIncome}
          onRemove={removeIncome}
        />

        <section className="card-strong px-5 py-5 sm:px-6">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="section-title">Chi tiêu gần đây</h2>
            <span className="shrink-0 text-[11px] font-semibold tabular-nums text-ink-400">
              {expenses.length} khoản
            </span>
          </div>

          {recent.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-100 text-ink-400">
                <Receipt className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-ink-700">Chưa có chi tiêu nào</p>
              <p className="mt-1 text-xs text-ink-400">Thêm khoản chi đầu tiên để bắt đầu theo dõi.</p>
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
                      <p className="truncate text-[13px] font-semibold text-ink-900">{expense.note}</p>
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

        <PiggyForecast state={state} />

        <section className="card-strong px-5 py-4">
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
        </section>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <Link
            to="/dashboard"
            className="group flex items-center gap-3 card-strong px-4 py-3 transition-colors hover:border-brand-300"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
              <Target className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold text-ink-900">Lịch chi tiêu</span>
              <span className="block truncate text-[10px] text-ink-400">Xem theo từng ngày trong tháng</span>
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-300 group-hover:text-brand-600" />
          </Link>

          <Link
            to="/dashboard"
            className="group flex items-center gap-3 card-strong px-4 py-3 transition-colors hover:border-brand-300"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
              <PiggyBank className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold text-ink-900">Heo đất</span>
              <span className="block truncate text-[10px] text-ink-400">
                Đang có {formatCurrency(state.piggyBank)}
              </span>
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-300 group-hover:text-brand-600" />
          </Link>
        </div>
      </div>
    </div>
  );
}
