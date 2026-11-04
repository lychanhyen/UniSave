import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Apple,
  CheckCircle2,
  ChevronDown,
  Coins,
  Flame,
  RefreshCw,
  ShoppingBasket,
  Sparkles,
  Timer,
  TrendingDown,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';
import MoneyInput from '../components/ui/MoneyInput';
import {
  DAY_PRESETS,
  DISHES,
  INGREDIENTS,
  MEAL_TAG_LABEL,
  buildMealPlan,
  compareShopping,
  dishIngredients,
  recipeSteps,
} from '../lib/nutrition';
import { cn, formatCurrency } from '../lib/utils';

const STORE_KEY = 'unisave:nutrition';
const GROUP_ORDER = ['Đạm', 'Rau củ', 'Tinh bột', 'Gia vị', 'Trái cây'];

function loadSaved() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORE_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function saveSaved(patch) {
  if (typeof window === 'undefined') return;
  try {
    const current = loadSaved();
    window.localStorage.setItem(STORE_KEY, JSON.stringify({ ...current, ...patch }));
  } catch {
    /* bỏ qua khi trình duyệt chặn localStorage */
  }
}

function DishCard({ dish, people, prices, label }) {
  const ingredients = useMemo(() => dishIngredients(dish, people, prices), [dish, people, prices]);
  const steps = useMemo(() => recipeSteps(dish, people), [dish, people]);

  return (
    <details className="group rounded-xl border border-brand-200/70 bg-white px-3 py-2">
      <summary className="flex cursor-pointer list-none items-start gap-2">
        <span className="mt-0.5 shrink-0 text-[10px] font-bold uppercase tracking-wide text-brand-700/70">
          {label}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-bold text-ink-900">{dish.name}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] text-ink-500">
            <span className="inline-flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {dish.minutes} phút
            </span>
            <span className="inline-flex items-center gap-1">
              <Flame className="h-3 w-3" />
              {dish.kcal} kcal · {dish.protein}g đạm
            </span>
            <span className="font-semibold text-brand-700">{formatCurrency(dish.cost || 0)}</span>
          </span>
        </span>
        <ChevronDown className="mt-1 h-3.5 w-3.5 shrink-0 text-ink-400 transition-transform group-open:rotate-180" />
      </summary>

      <div className="mt-2 border-t border-brand-200/50 pt-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">
          Định lượng ({people} người)
        </p>
        <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
          {ingredients.map((item) => (
            <li key={item.key} className="text-[11px] text-ink-700">
              {item.name} <span className="font-semibold text-ink-900">{item.display}</span>
            </li>
          ))}
        </ul>

        <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-ink-400">Cách nấu</p>
        <ol className="mt-1 space-y-1">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-1.5 text-[11px] leading-relaxed text-ink-700">
              <span className="shrink-0 font-bold text-brand-700">{index + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-1.5 flex flex-wrap gap-1">
          {dish.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-ink-50 px-1.5 py-0.5 text-[10px] font-semibold text-ink-500"
            >
              {MEAL_TAG_LABEL[tag] || tag}
            </span>
          ))}
        </div>
      </div>
    </details>
  );
}

export default function NutritionPage() {
  const saved = useMemo(loadSaved, []);
  const [budget, setBudget] = useState(saved.budget || 900000);
  const [days, setDays] = useState(saved.days || 7);
  const [people, setPeople] = useState(saved.people || 1);
  const [seed, setSeed] = useState(saved.seed || 0);
  const [prices, setPrices] = useState(saved.prices || {});
  const [actual, setActual] = useState(saved.actual || '');
  const [excluded, setExcluded] = useState(saved.excluded || []);
  const [showPrices, setShowPrices] = useState(false);
  const [showAllMeals, setShowAllMeals] = useState(false);

  const plan = useMemo(
    () => buildMealPlan({ days, budget, people, seed, prices }),
    [days, budget, people, seed, prices]
  );

  const shopping = useMemo(
    () => plan.shopping.filter((item) => !excluded.includes(item.key)),
    [plan.shopping, excluded]
  );
  const shoppingTotal = useMemo(
    () => shopping.reduce((sum, item) => sum + item.cost, 0),
    [shopping]
  );
  const comparison = useMemo(() => compareShopping(shoppingTotal, actual), [shoppingTotal, actual]);

  useEffect(() => {
    saveSaved({ budget, days, people, seed, prices, actual, excluded });
  }, [budget, days, people, seed, prices, actual, excluded]);

  function toggleExcluded(key) {
    setExcluded((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );
  }

  function updatePrice(key, value) {
    const next = { ...prices };
    const number = Number(value);
    if (!value || !Number.isFinite(number) || number <= 0) delete next[key];
    else next[key] = number;
    setPrices(next);
  }

  const shoppingByGroup = useMemo(() => {
    const map = new Map();
    for (const item of shopping) {
      if (!map.has(item.group)) map.set(item.group, []);
      map.get(item.group).push(item);
    }
    return GROUP_ORDER.filter((group) => map.has(group)).map((group) => ({
      group,
      items: map.get(group),
      total: map.get(group).reduce((sum, item) => sum + item.cost, 0),
    }));
  }, [shopping]);

  const visibleMeals = showAllMeals ? plan.meals : plan.meals.slice(0, 3);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <p className="eyebrow-accent">Đi chợ một lần</p>
        <h1 className="mt-2 text-[1.7rem] font-extrabold tracking-[-0.035em] text-ink-900 sm:text-[2.125rem]">
          Thực đơn {plan.days} ngày · {plan.days * 2} bữa
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-500">
          Mỗi ngày 2 bữa (trưa và tối), mỗi bữa có{' '}
          <strong className="font-semibold text-ink-700">1 món mặn + 1 món canh</strong> ăn kèm cơm.
          Bấm vào từng món để xem định lượng và cách nấu. Giá tham khảo Bách Hoá Xanh.
        </p>
      </div>

      {/* ------------------------------------------------------------ Cấu hình */}
      <section className="card-strong mb-5 px-5 py-5 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <label className="label" htmlFor="nutrition-budget">
              Ngân sách đi chợ (VND)
            </label>
            <div className="relative">
              <Wallet className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <MoneyInput
                id="nutrition-budget"
                value={budget}
                onChange={(value) => setBudget(value || 0)}
                className="pl-10"
                placeholder="900.000"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-ink-400">
              {formatCurrency(plan.perDayBudget)} mỗi ngày · {formatCurrency(plan.perDayBudget / 2)} mỗi
              bữa
            </p>
          </div>

          <div>
            <label className="label">Số người ăn</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPeople((value) => Math.max(1, value - 1))}
                className="grid h-10 w-10 place-items-center rounded-xl border-2 border-brand-200 font-bold text-ink-700 hover:border-brand-300"
                aria-label="Giảm số người"
              >
                −
              </button>
              <span className="flex h-10 min-w-12 items-center justify-center gap-1 rounded-xl bg-brand-50 px-3 text-sm font-bold text-brand-800">
                <Users className="h-3.5 w-3.5" />
                {people}
              </span>
              <button
                type="button"
                onClick={() => setPeople((value) => Math.min(6, value + 1))}
                className="grid h-10 w-10 place-items-center rounded-xl border-2 border-brand-200 font-bold text-ink-700 hover:border-brand-300"
                aria-label="Tăng số người"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="label">Số ngày cần nấu</label>
          <div className="flex flex-wrap gap-2">
            {DAY_PRESETS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setDays(value)}
                className={cn(
                  'chip border transition',
                  days === value
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-brand-200 bg-white text-ink-600 hover:border-brand-300'
                )}
              >
                {value} ngày
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSeed((value) => value + 1)}
            className="btn-primary py-2.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Đổi thực đơn khác
          </button>
          <Link to="/expenses" className="btn-secondary py-2.5 text-xs">
            <Coins className="h-3.5 w-3.5" />
            Ghi chi tiêu thật
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------------- Tổng kết */}
      <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/60 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-700/80">Cần mua</p>
          <p className="figure-md mt-1 text-brand-800">{formatCurrency(shoppingTotal)}</p>
          {excluded.length > 0 && (
            <p className="mt-0.5 text-[10px] text-ink-400">đã bỏ {excluded.length} món</p>
          )}
        </div>
        <div className="rounded-2xl border-2 border-ink-200 bg-ink-50 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-500">Ngân sách</p>
          <p className="figure-md mt-1 text-ink-900">{formatCurrency(plan.budget)}</p>
        </div>
        <div
          className={cn(
            'rounded-2xl border-2 px-4 py-3',
            shoppingTotal <= plan.budget
              ? 'border-emerald-200 bg-emerald-50/70'
              : 'border-rose-200 bg-rose-50/70'
          )}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-500">
            {shoppingTotal <= plan.budget ? 'Tiết kiệm' : 'Vượt'}
          </p>
          <p
            className={cn(
              'figure-md mt-1',
              shoppingTotal <= plan.budget ? 'text-emerald-700' : 'text-rose-700'
            )}
          >
            {formatCurrency(Math.abs(plan.budget - shoppingTotal))}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/70 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-amber-700/80">Mỗi ngày</p>
          <p className="figure-md mt-1 text-amber-800">
            {plan.kcalPerDay} kcal · {plan.proteinPerDay}g đạm
          </p>
        </div>
      </section>

      {/* -------------------------------------------------------------- Thực đơn */}
      <section className="card-strong mb-5 px-5 py-5 sm:px-6">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="section-title flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-brand-600" />
            Thực đơn {plan.days} ngày
          </h2>
          <span className="text-[11px] font-semibold text-ink-400">
            {plan.dishCount} món · bấm để xem cách nấu
          </span>
        </div>

        <div className="space-y-3">
          {visibleMeals.map((meal) => (
            <div key={meal.day} className="rounded-2xl border-2 border-brand-200/70 px-3.5 py-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-600 text-[12px] font-extrabold text-white">
                  {meal.day}
                </span>
                <p className="text-[12px] font-bold uppercase tracking-wide text-ink-500">
                  Ngày {meal.day}
                </p>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-ink-400">
                    Bữa trưa
                  </p>
                  <div className="space-y-1.5">
                    <DishCard dish={meal.lunch.main} people={plan.people} prices={prices} label="Mặn" />
                    <DishCard dish={meal.lunch.soup} people={plan.people} prices={prices} label="Canh" />
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-ink-400">
                    Bữa tối
                  </p>
                  <div className="space-y-1.5">
                    <DishCard
                      dish={meal.dinner.main}
                      people={plan.people}
                      prices={prices}
                      label="Mặn"
                    />
                    <DishCard
                      dish={meal.dinner.soup}
                      people={plan.people}
                      prices={prices}
                      label="Canh"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {plan.meals.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAllMeals((value) => !value)}
            className="btn-secondary mt-3 w-full justify-center py-2 text-xs"
          >
            <ChevronDown
              className={cn('h-3.5 w-3.5 transition-transform', showAllMeals && 'rotate-180')}
            />
            {showAllMeals ? 'Thu gọn' : `Xem thêm ${plan.meals.length - 3} ngày`}
          </button>
        )}
      </section>

      {/* ---------------------------------------------------------- Đi chợ */}
      <section className="card-strong mb-5 px-5 py-5 sm:px-6">
        <div className="mb-1 flex items-baseline justify-between gap-3">
          <h2 className="section-title flex items-center gap-2">
            <ShoppingBasket className="h-4 w-4 text-brand-600" />
            Danh sách đi chợ
          </h2>
          <span className="text-[11px] font-semibold tabular-nums text-ink-400">
            {shopping.length} món · {formatCurrency(shoppingTotal)}
          </span>
        </div>
        <p className="mb-3 text-[11px] leading-relaxed text-ink-500">
          Nhà đã có gì thì tích bỏ — tổng tiền tự trừ theo.
        </p>

        <div className="space-y-4">
          {shoppingByGroup.map((group) => (
            <div key={group.group}>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-400">
                {group.group} · {formatCurrency(group.total)}
              </p>
              <ul>
                {group.items.map((item) => (
                  <li
                    key={item.key}
                    className="flex items-center gap-2.5 border-t border-brand-200/50 py-1.5 text-[13px] first:border-t-0"
                  >
                    <button
                      type="button"
                      onClick={() => toggleExcluded(item.key)}
                      className="group/check grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 border-brand-300 text-white transition hover:border-brand-500 hover:bg-brand-600"
                      aria-label={`Bỏ ${item.name} khỏi danh sách`}
                      title="Nhà đã có — bỏ khỏi danh sách"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 opacity-0 transition group-hover/check:opacity-100" />
                    </button>
                    <span className="min-w-0 flex-1 truncate text-ink-800">{item.name}</span>
                    <span className="shrink-0 tabular-nums text-ink-500">
                      {item.qty} {item.unit}
                    </span>
                    <span className="w-20 shrink-0 text-right font-semibold tabular-nums text-ink-900">
                      {formatCurrency(item.cost)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {excluded.length > 0 && (
          <div className="mt-3 rounded-xl bg-ink-50 px-3 py-2">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-500">
              Đã bỏ ({excluded.length}) — bấm để thêm lại
            </p>
            <div className="flex flex-wrap gap-1.5">
              {excluded.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleExcluded(key)}
                  className="inline-flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5 text-[11px] font-medium text-ink-600 line-through transition hover:text-brand-700"
                >
                  {INGREDIENTS[key]?.name || key}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------- Thực tế vs dự toán */}
      <section className="card-strong mb-5 px-5 py-5 sm:px-6">
        <h2 className="section-title mb-1">Mua rẻ hơn hay đắt hơn?</h2>
        <p className="mb-3 text-[13px] leading-relaxed text-ink-500">
          Nhập tổng tiền bạn thực sự đã trả để so với dự toán.
        </p>

        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-52 flex-1">
            <label className="label" htmlFor="nutrition-actual">
              Số tiền đã mua (VND)
            </label>
            <MoneyInput
              id="nutrition-actual"
              value={actual}
              onChange={setActual}
              placeholder={String(shoppingTotal)}
            />
          </div>
          {actual ? (
            <button
              type="button"
              onClick={() => setActual('')}
              className="btn-secondary mb-0.5 py-2.5 text-xs"
            >
              Xoá
            </button>
          ) : null}
        </div>

        {comparison && (
          <div
            className={cn(
              'mt-3 flex items-start gap-3 rounded-2xl border-2 px-4 py-3',
              comparison.cheaper
                ? 'border-emerald-200 bg-emerald-50/70'
                : 'border-rose-200 bg-rose-50/70'
            )}
          >
            <span
              className={cn(
                'grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white',
                comparison.cheaper ? 'text-emerald-600' : 'text-rose-600'
              )}
            >
              {comparison.cheaper ? (
                <TrendingDown className="h-4 w-4" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
            </span>
            <div>
              <p
                className={cn(
                  'text-[14px] font-bold',
                  comparison.cheaper ? 'text-emerald-800' : 'text-rose-800'
                )}
              >
                {comparison.cheaper
                  ? `Rẻ hơn dự toán ${formatCurrency(comparison.cheaperAmount)} (${comparison.percent}%)`
                  : `Đắt hơn dự toán ${formatCurrency(comparison.overAmount)} (${comparison.percent}%)`}
              </p>
              <p className="mt-0.5 text-[12px] text-ink-600">
                Dự toán {formatCurrency(comparison.estimate)} · thực tế{' '}
                {formatCurrency(comparison.spent)}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------ Bảng giá */}
      <section className="card-strong mb-5 px-5 py-5 sm:px-6">
        <button
          type="button"
          onClick={() => setShowPrices((value) => !value)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span>
            <span className="section-title block">Bảng giá tham khảo</span>
            <span className="mt-0.5 block text-[12px] text-ink-500">
              Giá Bách Hoá Xanh, sửa được — dự toán tính lại theo giá bạn nhập.
            </span>
          </span>
          <ChevronDown
            className={cn('h-4 w-4 shrink-0 text-ink-400 transition-transform', showPrices && 'rotate-180')}
          />
        </button>

        {showPrices && (
          <div className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {Object.entries(INGREDIENTS).map(([key, ingredient]) => (
              <label key={key} className="flex items-center gap-2 text-[12px]">
                <span className="min-w-0 flex-1 truncate text-ink-700">
                  {ingredient.name}
                  <span className="text-ink-400"> /{ingredient.unit}</span>
                </span>
                <span className="w-24 shrink-0">
                  <MoneyInput
                    value={prices[key] ?? ingredient.price}
                    onChange={(value) => updatePrice(key, value)}
                    className="px-2 py-1 text-right text-[12px]"
                  />
                </span>
              </label>
            ))}
          </div>
        )}
      </section>

      <p className="rounded-2xl border border-brand-200/60 bg-brand-50/50 px-4 py-3 text-[11px] leading-relaxed text-ink-500">
        <Sparkles className="mr-1 inline h-3 w-3 text-brand-600" />
        Thực đơn chọn từ {DISHES.length} món Việt có sẵn trong ứng dụng — không gọi AI, không tốn phí.
        Giá là tham khảo để dự toán; dinh dưỡng tính cho món + cơm, chưa gồm bữa sáng và ăn vặt.
      </p>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        <Link
          to="/dashboard"
          className="group flex items-center gap-3 card-strong px-4 py-3 transition-colors hover:border-brand-300"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
            <Apple className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-bold text-ink-900">Về tổng quan</span>
            <span className="block truncate text-[10px] text-ink-400">Xem lịch và ngân sách tháng</span>
          </span>
        </Link>

        <Link
          to="/marketplace"
          className="group flex items-center gap-3 card-strong px-4 py-3 transition-colors hover:border-brand-300"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
            <ShoppingBasket className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-bold text-ink-900">Chợ sinh viên</span>
            <span className="block truncate text-[10px] text-ink-400">Mua nồi, bát, đồ bếp giá rẻ</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
