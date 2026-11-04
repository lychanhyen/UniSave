import { Link } from 'react-router-dom';
import { BadgeCheck, ChevronRight, Users } from 'lucide-react';
import { cn, formatCurrency, timeLeft } from '../../lib/utils';

/**
 * Thẻ tóm tắt kèo gom đơn trong danh sách.
 *
 * Chỉ hiện những gì cần để quyết định có mở hay không: giá, số người, hạn chót,
 * trạng thái. Mọi chi tiết (mô tả, thành viên, chia tiền, thanh toán, bill) nằm
 * ở trang chi tiết — bấm vào thẻ để mở, giống cách Chợ đang làm.
 */
export default function DealCard({ deal }) {
  const isFull = deal.status === 'full';
  const members = deal.current_members || 0;
  const target = deal.min_members || 1;
  const percent = Math.min(100, Math.round((members / target) * 100));
  const savings = Math.max(0, Number(deal.original_price || 0) - Number(deal.deal_price || 0));

  return (
    <Link
      to={`/deals/${deal.id}`}
      className="card card-hover flex flex-col justify-between p-4 transition-colors hover:border-brand-300"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
              isFull ? 'bg-ink-900 text-white' : 'bg-brand-50 text-brand-700'
            )}
          >
            {isFull ? 'Đã đủ người' : 'Đang nhận người'}
          </span>
          <span className="shrink-0 text-[10px] font-semibold tabular-nums text-ink-400">
            {deal.deadline ? timeLeft(deal.deadline) : 'Không hạn'}
          </span>
        </div>

        <h3 className="mt-2.5 line-clamp-2 min-h-[2.6rem] text-[15px] font-bold leading-snug tracking-tight text-ink-900">
          {deal.title}
        </h3>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="figure-md text-brand-700">{formatCurrency(deal.deal_price)}</span>
          {Number(deal.original_price) > 0 && (
            <span className="text-[11px] font-medium text-ink-400 line-through">
              {formatCurrency(deal.original_price)}
            </span>
          )}
          {savings > 0 && (
            <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
              −{formatCurrency(savings)}
            </span>
          )}
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-200">
          <div
            className={cn(
              'h-full rounded-full transition-[width]',
              isFull ? 'bg-ink-900' : 'bg-brand-600'
            )}
            style={{ width: `${Math.max(4, percent)}%` }}
          />
        </div>
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-ink-500">
          <Users className="h-3.5 w-3.5 text-brand-600" />
          {members}/{target} người
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-brand-200/60 pt-2.5">
        <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-ink-500">
          <span className="truncate">{deal.owner_name}</span>
          {deal.owner_verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand-600" />}
        </span>
        <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-bold text-brand-700">
          Xem chi tiết
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
