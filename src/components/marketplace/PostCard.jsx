import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  MapPin,
  Navigation,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { cn, formatCurrency, formatRelativeTime } from '../../lib/utils';
import { POST_CATEGORY_MAP, POST_GRADIENTS } from '../../lib/constants';
import { useCampuses } from '../../context/CampusContext';
import Avatar from '../ui/Avatar';

export default function PostCard({
  post,
  isOwner = false,
  nearby = false,
  onDelete,
  onMarkDone,
  onRelist,
}) {
  const { labelOf } = useCampuses();
  const category = POST_CATEGORY_MAP[post.category] || POST_CATEGORY_MAP.other;
  const Icon = category.icon;
  const gradient = POST_GRADIENTS[category.tone] || POST_GRADIENTS.slate;
  const cover = post.images?.[0];
  const isSold = post.status === 'sold' || post.status === 'done';
  const isRent = post.type === 'rent';
  const campusLabel = labelOf(post.location);

  return (
    <article className="card card-hover group flex flex-col overflow-hidden p-0">
      <Link to={`/marketplace/${post.id}`} className="relative block">
        <div className={cn('relative h-44 overflow-hidden bg-gradient-to-br', gradient)}>
          {cover ? (
            <img
              src={cover}
              alt={post.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="relative grid h-full place-items-center text-white/95">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
              <div className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-black/10 blur-2xl" />
              <Icon className="h-14 w-14 drop-shadow-sm" strokeWidth={1.4} />
            </div>
          )}

          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-ink-800 shadow-soft backdrop-blur">
            {isRent ? 'Cho thuê' : 'Pass đồ'}
          </span>

          {isSold && (
            <div className="absolute inset-0 grid place-items-center bg-ink-900/45 backdrop-blur-[1px]">
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ink-900 shadow-soft">
                Đã bán
              </span>
            </div>
          )}

          {isOwner && !isSold && (
            <span className="absolute right-3 top-3 rounded-full bg-ink-900/70 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
              Tin của bạn
            </span>
          )}

          {nearby && !isSold && (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-brand-600/95 px-2.5 py-1 text-[10px] font-bold text-white shadow-soft">
              <Navigation className="h-3 w-3" />
              Gần bạn
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/marketplace/${post.id}`}>
          <h3 className="line-clamp-2 min-h-[2.6rem] text-[15px] font-bold leading-snug tracking-tight text-ink-900 transition group-hover:text-brand-700">
            {post.title}
          </h3>
        </Link>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-ink-400">
          <span className="chip bg-ink-100 text-ink-600">{category.label}</span>
          <span className="chip bg-ink-50 text-ink-500 ring-1 ring-ink-100">
            <MapPin className="h-3 w-3" />
            {campusLabel}
          </span>
          <span className="truncate">{formatRelativeTime(post.created_at)}</span>
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p
              className={cn(
                'text-lg font-extrabold tracking-tight',
                isSold ? 'text-ink-500' : 'text-brand-700'
              )}
            >
              {formatCurrency(post.price)}
              {isRent && <span className="text-xs font-semibold text-ink-400">/tháng</span>}
            </p>
            {isSold && (
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                Giá tham khảo
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-ink-100 pt-3">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar size="sm" name={post.owner_name} src={post.owner_avatar} />
            <div className="min-w-0">
              <p className="flex items-center gap-1 truncate text-xs font-semibold text-ink-700">
                {post.owner_name}
                {post.owner_verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand-600" />}
              </p>
              <p className="text-[10px] font-medium text-ink-400">
                {post.owner_verified ? 'Đã xác minh sinh viên' : 'Sinh viên'}
              </p>
            </div>
          </div>

          {isOwner ? (
            <div className="flex shrink-0 items-center gap-1">
              {isSold ? (
                <button
                  type="button"
                  onClick={() => onRelist?.(post.id)}
                  className="grid h-8 w-8 place-items-center rounded-xl text-ink-500 transition hover:bg-brand-50 hover:text-brand-600"
                  title="Đăng bán lại"
                  aria-label="Đăng bán lại"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onMarkDone?.(post.id)}
                  className="grid h-8 w-8 place-items-center rounded-xl text-ink-500 transition hover:bg-brand-50 hover:text-brand-600"
                  title="Đánh dấu đã bán"
                  aria-label="Đánh dấu đã bán"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onDelete?.(post.id)}
                className="grid h-8 w-8 place-items-center rounded-xl text-ink-500 transition hover:bg-rose-50 hover:text-rose-600"
                title="Xóa tin"
                aria-label="Xóa tin"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to={`/marketplace/${post.id}`}
              className="inline-flex shrink-0 items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-bold text-brand-600 transition hover:bg-brand-50"
            >
              Xem
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
