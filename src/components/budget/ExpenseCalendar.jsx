import { useMemo, useState } from 'react';
import MoneyInput from '../ui/MoneyInput';
import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Receipt,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CATEGORIES, CATEGORY_MAP, TONES } from '../../lib/constants';
import { cn, formatCurrency, monthLabel, todayKey } from '../../lib/utils';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function pad(value) {
  return String(value).padStart(2, '0');
}

function monthKeyOf(year, monthIndex) {
  return `${year}-${pad(monthIndex + 1)}`;
}

function parseMonth(monthKey) {
  const [year, month] = String(monthKey).split('-').map(Number);
  return { year, monthIndex: Math.max(0, (month || 1) - 1) };
}

function daysInMonthOf(monthKey) {
  const { year, monthIndex } = parseMonth(monthKey);
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** Thứ Hai = 0 … CN = 6, để lưới tuần bắt đầu từ T2 như lịch Việt Nam. */
function weekdayOffset(monthKey) {
  const { year, monthIndex } = parseMonth(monthKey);
  const jsDay = new Date(year, monthIndex, 1).getDay();
  return (jsDay + 6) % 7;
}

function shiftMonth(monthKey, delta) {
  const { year, monthIndex } = parseMonth(monthKey);
  const next = new Date(year, monthIndex + delta, 1);
  return monthKeyOf(next.getFullYear(), next.getMonth());
}

function dayKeyOf(monthKey, day) {
  return `${monthKey}-${pad(day)}`;
}

function formatDayLabel(dateKey) {
  const [year, month, day] = String(dateKey).split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][
    date.getDay()
  ];
  return `${weekday}, ${pad(day)}/${pad(month)}/${year}`;
}

/**
 * Lịch chi tiêu theo tháng.
 *
 * - Bấm một ngày: panel ngay dưới lịch liệt kê các khoản chi của ngày đó.
 * - Cạnh tháng: ngân sách, tổng đã chi, tiết kiệm (hoặc quá hạn mức bao nhiêu).
 * - Ngày trống có thể thêm khoản chi cho đúng ngày được chọn.
 */
export default function ExpenseCalendar({
  expenses = [],
  budget = {},
  currentMonthKey: activeMonthKey,
  onAdd,
  onDelete,
}) {
  const currentMonth = activeMonthKey || budget.current_month || monthKeyOf(new Date().getFullYear(), new Date().getMonth());
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const [selectedDay, setSelectedDay] = useState(todayKey());
  const [formOpen, setFormOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]?.value || 'food');
  const [unexpected, setUnexpected] = useState(false);
  const [saving, setSaving] = useState(false);

  const isCurrentMonth = viewMonth === currentMonth;
  const daysInMonth = daysInMonthOf(viewMonth);
  const offset = weekdayOffset(viewMonth);
  const budgetAmount = isCurrentMonth ? Number(budget.total_amount) || 0 : 0;
  const dailyReference = budgetAmount > 0 ? budgetAmount / daysInMonth : 0;

  const monthExpenses = useMemo(
    () => expenses.filter((item) => String(item.date || '').startsWith(viewMonth)),
    [expenses, viewMonth]
  );

  const spentByDay = useMemo(() => {
    const map = new Map();
    for (const item of monthExpenses) {
      const key = String(item.date).slice(0, 10);
      map.set(key, (map.get(key) || 0) + (Number(item.amount) || 0));
    }
    return map;
  }, [monthExpenses]);

  const monthSpent = useMemo(
    () => monthExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [monthExpenses]
  );

  const selectedExpenses = useMemo(
    () =>
      monthExpenses
        .filter((item) => String(item.date).slice(0, 10) === selectedDay)
        .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || ''))),
    [monthExpenses, selectedDay]
  );

  const selectedSpent = selectedExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const dayKeyForPicker = selectedDay;

  function goMonth(delta) {
    const next = shiftMonth(viewMonth, delta);
    setViewMonth(next);
    // Giữ ngày đang chọn nếu còn trong tháng mới, ngược lại chọn ngày 1.
    setSelectedDay(next === currentMonth ? todayKey() : `${next}-01`);
    setFormOpen(false);
  }

  function pickDay(day) {
    setSelectedDay(dayKeyOf(viewMonth, day));
    setFormOpen(false);
  }

  async function handleAdd(event) {
    event.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error('Nhập số tiền hợp lệ');
      return;
    }
    if (note.trim().length < 2) {
      toast.error('Ghi chú cần ít nhất 2 ký tự');
      return;
    }
    setSaving(true);
    try {
      await onAdd?.({
        amount: value,
        note: note.trim(),
        category,
        is_unexpected: unexpected,
        unexpected_reason: unexpected ? 'Chi từ lịch' : '',
        date: selectedDay,
      });
      toast.success('Đã thêm khoản chi');
      setAmount('');
      setNote('');
      setUnexpected(false);
      setCategory(CATEGORIES[0]?.value || 'food');
      setFormOpen(false);
    } catch {
      /* lỗi đã hiển thị ở nơi gọi */
    } finally {
      setSaving(false);
    }
  }

  const cells = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const monthSaving = budgetAmount - monthSpent;
  const isOver = monthSaving < 0;

  return (
    <section className="card-strong px-5 py-5 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-brand-600" />
            Lịch chi tiêu
          </h2>
          <p className="mt-1 text-[11px] text-ink-400">
            Bấm một ngày để xem khoản chi của ngày đó.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => goMonth(-1)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-brand-200/70 text-ink-500 transition hover:border-brand-300 hover:text-brand-700"
            aria-label="Tháng trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[7.5rem] text-center text-[12px] font-bold tabular-nums text-ink-800">
            {monthLabel(viewMonth)}
          </span>
          <button
            type="button"
            onClick={() => goMonth(1)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-brand-200/70 text-ink-500 transition hover:border-brand-300 hover:text-brand-700"
            aria-label="Tháng sau"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* ------------------------------------------------------------- Lịch */}
        <div>
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((label) => (
              <div
                key={label}
                className="pb-1 text-center text-[10px] font-bold uppercase tracking-wide text-ink-400"
              >
                {label}
              </div>
            ))}

            {cells.map((day, index) => {
              if (!day) return <div key={`blank-${index}`} />;

              const key = dayKeyOf(viewMonth, day);
              const spent = spentByDay.get(key) || 0;
              const isSelected = key === selectedDay;
              const isToday = key === todayKey();
              const ratio = dailyReference > 0 ? spent / dailyReference : 0;
              const tone =
                spent === 0
                  ? 'text-ink-500'
                  : ratio <= 1
                    ? 'text-brand-700'
                    : ratio <= 2
                      ? 'text-amber-700'
                      : 'text-rose-600';

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => pickDay(day)}
                  aria-pressed={isSelected}
                  aria-label={`${day}/${parseMonth(viewMonth).monthIndex + 1}${
                    spent ? `, đã chi ${formatCurrency(spent)}` : ', chưa chi'
                  }`}
                  className={cn(
                    'relative flex aspect-square flex-col items-center justify-center rounded-xl border text-center transition',
                    isSelected
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : isToday
                        ? 'border-brand-300 bg-brand-50/70 hover:border-brand-400'
                        : 'border-transparent hover:border-brand-200 hover:bg-brand-50/50'
                  )}
                >
                  <span
                    className={cn(
                      'text-[12px] font-bold tabular-nums',
                      isSelected ? 'text-white' : 'text-ink-800'
                    )}
                  >
                    {day}
                  </span>
                  {spent > 0 && (
                    <span
                      className={cn(
                        'mt-0.5 text-[8.5px] font-bold leading-none tabular-nums',
                        isSelected ? 'text-white/85' : tone
                      )}
                    >
                      {spent >= 1000 ? `${Math.round(spent / 1000)}k` : spent}
                    </span>
                  )}
                  {spent === 0 && (
                    <span
                      className={cn(
                        'mt-1 h-1 w-1 rounded-full',
                        isSelected ? 'bg-white/50' : 'bg-transparent'
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* -------------------------------------------------- Chi tiết một ngày */}
          <div className="mt-4 rounded-2xl border border-brand-200 bg-white p-3.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-[12px] font-bold text-ink-900">{formatDayLabel(dayKeyForPicker)}</p>
                <p className="mt-0.5 text-[10px] text-ink-400">
                  {selectedExpenses.length} khoản · {formatCurrency(selectedSpent)}
                  {dailyReference > 0 && !isOver && (
                    <> · hạn mức ngày {formatCurrency(Math.round(dailyReference))}</>
                  )}
                </p>
              </div>
              {!formOpen && (
                <button
                  type="button"
                  onClick={() => setFormOpen(true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-2 py-1 text-[10px] font-bold text-brand-700 transition hover:border-brand-300"
                >
                  <Plus className="h-3 w-3" />
                  Thêm khoản chi
                </button>
              )}
            </div>

            {selectedExpenses.length === 0 ? (
              <p className="mt-3 rounded-xl bg-ink-50 px-3 py-4 text-center text-[11px] font-medium text-ink-400">
                Ngày này chưa có khoản chi nào.
              </p>
            ) : (
              <ul className="mt-3">
                {selectedExpenses.map((item) => {
                  const meta = CATEGORY_MAP[item.category] || CATEGORY_MAP.other;
                  const Icon = meta.icon;
                  return (
                    <li
                      key={item.id}
                      className="group flex items-center gap-2.5 border-t border-brand-200/60 py-2 first:border-t-0 first:pt-0"
                    >
                      <span
                        className={cn(
                          'grid h-7 w-7 shrink-0 place-items-center rounded-lg',
                          item.is_unexpected
                            ? 'bg-amber-50 text-amber-700'
                            : TONES[meta.tone] || TONES.slate
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-semibold text-ink-900">{item.note}</p>
                        <p className="text-[10px] text-ink-400">
                          {item.is_unexpected ? 'Đột xuất' : meta.label}
                        </p>
                      </div>
                      <span className="shrink-0 text-[12px] font-bold tabular-nums text-ink-900">
                        −{formatCurrency(item.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDelete?.(item.id)}
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-ink-300 transition hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Xoá khoản chi"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {formOpen && (
              <form onSubmit={handleAdd} className="mt-3 rounded-xl bg-ink-50 p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="label mb-1 text-[10px]" htmlFor="cal-amount">
                      Số tiền (VND)
                    </label>
                    <MoneyInput
                      id="cal-amount"
                      value={amount}
                      onChange={setAmount}
                      placeholder="25.000"
                      className="py-2 text-[12px]"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="label mb-1 text-[10px]" htmlFor="cal-category">
                      Danh mục
                    </label>
                    <select
                      id="cal-category"
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className="input py-2 text-[12px]"
                    >
                      {CATEGORIES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-2">
                  <label className="label mb-1 text-[10px]" htmlFor="cal-note">
                    Ghi chú
                  </label>
                  <input
                    id="cal-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Ăn trưa căn tin"
                    className="input py-2 text-[12px]"
                    maxLength={80}
                  />
                </div>

                <label className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-ink-600">
                  <input
                    type="checkbox"
                    checked={unexpected}
                    onChange={(event) => setUnexpected(event.target.checked)}
                    className="h-3.5 w-3.5 rounded border-ink-300 text-brand-600"
                  />
                  Khoản đột xuất
                </label>

                <div className="mt-2.5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="btn-secondary flex-1 justify-center py-2 text-[11px]"
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex-1 justify-center py-2 text-[11px] disabled:opacity-60"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {saving ? 'Đang lưu…' : 'Lưu khoản chi'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* --------------------------------------------------- Tổng kết cạnh tháng */}
        <aside className="rounded-2xl border border-brand-200 bg-brand-50/50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700/70">
            Tổng kết {monthLabel(viewMonth)}
          </p>

          {isCurrentMonth ? (
            <>
              <div className="mt-3 space-y-2.5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                    Ngân sách tháng
                  </p>
                  <p className="figure-md mt-0.5 text-ink-900">{formatCurrency(budgetAmount)}</p>
                </div>
                <div className="border-t border-brand-200/70 pt-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                    Tổng đã chi
                  </p>
                  <p className="figure-md mt-0.5 text-ink-900">{formatCurrency(monthSpent)}</p>
                </div>
                <div className="border-t border-brand-200/70 pt-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                    {isOver ? 'Vượt hạn mức tháng' : 'Tiết kiệm được'}
                  </p>
                  <p
                    className={cn(
                      'figure-md mt-0.5',
                      isOver ? 'text-rose-600' : 'text-brand-700'
                    )}
                  >
                    {isOver ? `−${formatCurrency(-monthSaving)}` : formatCurrency(monthSaving)}
                  </p>
                </div>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
                <div
                  className={cn('h-full rounded-full transition-[width]', isOver ? 'bg-rose-500' : 'bg-brand-600')}
                  style={{
                    width: `${budgetAmount > 0 ? Math.min(100, Math.max(2, (monthSpent / budgetAmount) * 100)) : 0}%`,
                  }}
                />
              </div>

              <p
                className={cn(
                  'mt-2 flex items-start gap-1.5 text-[10px] leading-relaxed',
                  isOver ? 'text-rose-700' : 'text-ink-500'
                )}
              >
                {isOver ? (
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                ) : (
                  <Receipt className="mt-0.5 h-3 w-3 shrink-0 text-brand-600" />
                )}
                {isOver
                  ? `Đã chi vượt ngân sách tháng ${formatCurrency(-monthSaving)}.`
                  : budgetAmount > 0
                    ? `Còn lại ${formatCurrency(monthSaving)} tính đến hết ${monthLabel(viewMonth)}.`
                    : 'Chưa đặt ngân sách cho tháng này.'}
              </p>
            </>
          ) : (
            <>
              <div className="mt-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                  Tổng đã chi
                </p>
                <p className="figure-md mt-0.5 text-ink-900">{formatCurrency(monthSpent)}</p>
                <p className="mt-1 text-[10px] text-ink-400">
                  {monthExpenses.length} khoản chi trong tháng
                </p>
              </div>
              <p className="mt-3 rounded-lg bg-white px-2.5 py-2 text-[10px] leading-relaxed text-ink-500">
                Tháng này chưa có ngân sách được lưu nên chỉ hiển thị chi tiêu, không tính tiết kiệm
                hay vượt hạn mức.
              </p>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
