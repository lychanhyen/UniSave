import { MapPin, Navigation, Search, SlidersHorizontal, UserRound, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCampuses } from '../../context/CampusContext';
import { POST_CATEGORIES, POST_STATUSES } from '../../lib/constants';

const TYPES = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pass', label: 'Pass đồ' },
  { value: 'rent', label: 'Cho thuê' },
];

export default function FilterTabs({
  query,
  onQuery,
  type,
  onType,
  category,
  onCategory,
  status,
  onStatus,
  location,
  onLocation,
  mine,
  onMine,
  nearby,
  onNearby,
  resultCount,
}) {
  const { active: campusOptions } = useCampuses();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Tìm sách, xe đạp, đồ điện tử…"
            className="input pl-11 pr-10"
            aria-label="Tìm kiếm tin đăng"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQuery('')}
              className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-ink-400 hover:bg-ink-100 hover:text-ink-700"
              aria-label="Xóa tìm kiếm"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNearby(!nearby)}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-2xl border px-3.5 py-3 text-sm font-semibold transition',
              nearby
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:bg-ink-50'
            )}
            aria-pressed={nearby}
            title="Ưu tiên tin cùng trường/KTX với bạn"
          >
            <Navigation className={cn('h-4 w-4', nearby && 'fill-brand-600/20')} />
            Gần tôi
          </button>
          <button
            type="button"
            onClick={() => onMine(!mine)}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-2xl border px-3.5 py-3 text-sm font-semibold transition',
              mine
                ? 'border-brand-600 bg-brand-600 text-white shadow-glow'
                : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:bg-ink-50'
            )}
          >
            <UserRound className="h-4 w-4" />
            Tin của tôi
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 pr-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Loại
        </span>
        <div className="flex rounded-2xl bg-ink-100 p-1">
          {TYPES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onType(item.value)}
              className={cn(
                'rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all',
                type === item.value
                  ? 'bg-white text-ink-900 shadow-soft'
                  : 'text-ink-500 hover:text-ink-800'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex rounded-2xl bg-ink-100 p-1">
          {POST_STATUSES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onStatus(item.value)}
              className={cn(
                'rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all',
                status === item.value
                  ? 'bg-white text-ink-900 shadow-soft'
                  : 'text-ink-500 hover:text-ink-800'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs font-medium text-ink-400">
          {resultCount} tin phù hợp
        </span>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <span className="inline-flex shrink-0 items-center gap-1.5 pr-1 text-xs font-semibold text-ink-400">
          <MapPin className="h-3.5 w-3.5" />
          Khu vực
        </span>
        <button
          type="button"
          onClick={() => onLocation('all')}
          className={cn(
            'chip shrink-0 border transition',
            location === 'all'
              ? 'border-ink-900 bg-ink-900 text-white'
              : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
          )}
        >
          Tất cả
        </button>
        {campusOptions.map((campus) => {
          const active = location === campus.value;
          return (
            <button
              key={campus.value}
              type="button"
              onClick={() => onLocation(active ? 'all' : campus.value)}
              className={cn(
                'chip shrink-0 border transition',
                active
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300'
              )}
              title={campus.area}
            >
              <MapPin className="h-3.5 w-3.5" />
              {campus.label}
            </button>
          );
        })}
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <button
          type="button"
          onClick={() => onCategory('all')}
          className={cn(
            'chip shrink-0 border transition',
            category === 'all'
              ? 'border-ink-900 bg-ink-900 text-white'
              : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
          )}
        >
          Tất cả danh mục
        </button>
        {POST_CATEGORIES.map((c) => {
          const Icon = c.icon;
          const active = category === c.value;
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => onCategory(active ? 'all' : c.value)}
              className={cn(
                'chip shrink-0 border transition',
                active
                  ? 'border-ink-900 bg-ink-900 text-white'
                  : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
