import { useState } from 'react';
import {
  BadgeCheck,
  Banknote,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  LogOut,
  ShoppingBag,
  Trash2,
  TrendingDown,
  Truck,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, formatCurrency, percentOf, timeLeft } from '../../lib/utils';
import { getDealMembers } from '../../lib/demoData';
import Avatar from '../ui/Avatar';

const STATUS = {
  open: { label: 'Đang mở', className: 'bg-brand-50 text-brand-700 ring-brand-100' },
  full: { label: 'Đủ người', className: 'bg-blue-50 text-blue-700 ring-blue-100' },
};

export default function DealCard({
  deal,
  joined,
  isOwner,
  currentUserId,
  onJoin,
  onLeave,
  onDelete,
  onTogglePayment,
}) {
  const [showSplit, setShowSplit] = useState(false);
  const progress = Math.min(100, percentOf(deal.current_members, deal.min_members));
  const discount =
    deal.original_price > 0
      ? Math.max(0, Math.round((1 - deal.deal_price / deal.original_price) * 100))
      : 0;
  const savings = Math.max(0, deal.original_price - deal.deal_price);
  const shipSaving = Number(deal.ship_saving) || 0;
  const expired = new Date(deal.deadline).getTime() < Date.now();
  const isFull = deal.status === 'full' || deal.current_members >= deal.min_members;
  const remaining = timeLeft(deal.deadline);
  const urgent = !expired && new Date(deal.deadline).getTime() - Date.now() < 12 * 3_600_000;
  const status = expired
    ? { label: 'Hết hạn', className: 'bg-ink-100 text-ink-500 ring-ink-200' }
    : STATUS[isFull ? 'full' : 'open'];

  const members = deal.members?.length ? deal.members : getDealMembers(deal);
  const memberCount = members.length || deal.current_members || 0;
  const owner = members.find((member) => member.is_owner);
  const others = members.filter((member) => !member.is_owner);
  const perMember = Number(deal.deal_price) || 0;
  const ownerReceives = perMember * others.length;
  const paidOthers = others.filter((member) => member.paid);
  const collected = perMember * paidOthers.length;
  const allPaid = others.length > 0 && paidOthers.length === others.length;
  const missing = Math.max(0, (Number(deal.min_members) || 0) - memberCount);

  function canToggle(member) {
    return isOwner || member.id === currentUserId;
  }

  async function copyBank() {
    try {
      await navigator.clipboard.writeText(deal.owner_bank);
      toast.success('Đã sao chép thông tin chuyển khoản');
    } catch {
      toast.error('Không thể sao chép, vui lòng chọn thủ công');
    }
  }

  return (
    <article className="card card-hover flex flex-col overflow-hidden p-0">
      <div className="relative bg-gradient-to-br from-brand-50 via-white to-blue-50/60 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <div>
              <span className={cn('chip ring-1', status.className)}>{status.label}</span>
              <p
                className={cn(
                  'mt-1 flex items-center gap-1 text-[11px] font-medium',
                  urgent ? 'text-rose-600' : 'text-ink-400'
                )}
              >
                <Clock3 className="h-3 w-3" />
                {expired ? 'Đã kết thúc' : `Còn ${remaining}`}
              </p>
            </div>
          </div>

          {discount > 0 && (
            <span className="chip bg-rose-500 text-white shadow-soft">
              <TrendingDown className="h-3.5 w-3.5" />
              -{discount}%
            </span>
          )}
        </div>

        <h3 className="mt-3.5 line-clamp-2 min-h-[2.6rem] text-[15px] font-bold leading-snug tracking-tight text-ink-900">
          {deal.title}
        </h3>

        <div className="mt-3 flex items-end gap-2">
          <p className="text-xl font-extrabold tracking-tight text-brand-700">
            {formatCurrency(deal.deal_price)}
          </p>
          <p className="pb-0.5 text-xs font-medium text-ink-400 line-through">
            {formatCurrency(deal.original_price)}
          </p>
        </div>

        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {savings > 0 && (
            <span className="chip bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <TrendingDown className="h-3 w-3" />
              Tiết kiệm {formatCurrency(savings)}/người
            </span>
          )}
          {shipSaving > 0 && (
            <span className="chip bg-amber-50 text-amber-700 ring-1 ring-amber-100">
              <Truck className="h-3 w-3" />
              Tiết kiệm {formatCurrency(shipSaving)} phí ship
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 pt-4">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 text-ink-600">
            <Users className="h-3.5 w-3.5 text-ink-400" />
            {memberCount}/{deal.min_members} người
          </span>
          <span className={cn('font-bold', isFull ? 'text-blue-600' : 'text-brand-600')}>
            {progress}%
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-700',
              isFull
                ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                : 'bg-gradient-to-r from-brand-400 to-brand-600'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex -space-x-2">
            {Array.from({ length: Math.min(4, memberCount) }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  'grid h-7 w-7 place-items-center rounded-full border-2 border-white text-[10px] font-bold text-white',
                  ['bg-brand-500', 'bg-blue-500', 'bg-amber-500', 'bg-violet-500'][index % 4]
                )}
              >
                {index === 0
                  ? (owner?.name || deal.owner_name)?.charAt(0)?.toUpperCase()
                  : 'SV'}
              </span>
            ))}
            {memberCount > 4 && (
              <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-ink-200 text-[10px] font-bold text-ink-600">
                +{memberCount - 4}
              </span>
            )}
          </div>

          <div className="flex min-w-0 items-center gap-1.5">
            <Avatar size="sm" name={deal.owner_name} />
            <span className="max-w-[7rem] truncate text-[11px] font-semibold text-ink-500">
              {deal.owner_name}
            </span>
            {deal.owner_verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand-600" />}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSplit((value) => !value)}
          className={cn(
            'mt-3 flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-[11px] font-bold transition',
            isFull
              ? 'border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100/70'
              : 'border-ink-200 bg-white text-ink-600 hover:border-brand-200 hover:text-brand-700'
          )}
          aria-expanded={showSplit}
        >
          <span className="inline-flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5" />
            {isFull
              ? `Chia tiền · chủ kèo nhận ${formatCurrency(ownerReceives)}`
              : `Chia tiền dự kiến · còn ${missing} người`}
          </span>
          <ChevronDown
            className={cn('h-3.5 w-3.5 transition-transform', showSplit && 'rotate-180')}
          />
        </button>

        {showSplit && (
          <div className="mt-2 rounded-2xl border border-ink-200 bg-ink-50/70 p-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white px-2 py-2 ring-1 ring-ink-100">
                <p className="text-[9px] font-bold uppercase tracking-wide text-ink-400">Mỗi người</p>
                <p className="mt-0.5 text-xs font-extrabold text-ink-900">
                  {formatCurrency(perMember)}
                </p>
              </div>
              <div className="rounded-xl bg-white px-2 py-2 ring-1 ring-ink-100">
                <p className="text-[9px] font-bold uppercase tracking-wide text-ink-400">
                  Chủ kèo nhận
                </p>
                <p className="mt-0.5 text-xs font-extrabold text-brand-700">
                  {formatCurrency(ownerReceives)}
                </p>
              </div>
              <div className="rounded-xl bg-white px-2 py-2 ring-1 ring-ink-100">
                <p className="text-[9px] font-bold uppercase tracking-wide text-ink-400">Đã nhận</p>
                <p className="mt-0.5 text-xs font-extrabold text-ink-900">
                  {formatCurrency(collected)}
                </p>
              </div>
            </div>

            {deal.owner_bank && (
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 ring-1 ring-ink-100">
                <Banknote className="h-3.5 w-3.5 shrink-0 text-brand-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-ink-400">
                    Chuyển khoản cho chủ kèo
                  </p>
                  <p className="truncate text-[11px] font-semibold text-ink-800">{deal.owner_bank}</p>
                </div>
                <button
                  type="button"
                  onClick={copyBank}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ink-400 transition hover:bg-brand-50 hover:text-brand-600"
                  aria-label="Sao chép số tài khoản"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <ul className="mt-2 divide-y divide-ink-200/70">
              {members.map((member) => (
                <li key={member.id} className="flex items-center gap-2 py-2">
                  <Avatar size="sm" name={member.name} verified={member.verified} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 truncate text-[11px] font-semibold text-ink-800">
                      {member.name}
                      {member.id === currentUserId && (
                        <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-brand-700">
                          Bạn
                        </span>
                      )}
                      {member.is_owner && (
                        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-amber-700">
                          Chủ kèo
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-ink-400">
                      {member.is_owner
                        ? 'Tự trả phần của mình'
                        : member.paid
                          ? 'Đã chuyển cho chủ kèo'
                          : 'Chưa chuyển khoản'}
                    </p>
                  </div>
                  {member.is_owner ? (
                    <span className="chip bg-ink-200 text-[10px] text-ink-600">—</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onTogglePayment?.(deal.id, member.id, !member.paid)}
                      disabled={!canToggle(member)}
                      className={cn(
                        'chip shrink-0 border text-[10px] transition',
                        member.paid
                          ? 'border-brand-200 bg-brand-50 text-brand-700'
                          : 'border-ink-200 bg-white text-ink-500',
                        canToggle(member)
                          ? 'hover:border-brand-300 hover:text-brand-700'
                          : 'cursor-not-allowed opacity-60'
                      )}
                    >
                      {member.paid ? (
                        <>
                          <Check className="h-3 w-3" />
                          Đã chuyển
                        </>
                      ) : (
                        'Chưa chuyển'
                      )}
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <div
              className={cn(
                'mt-2 rounded-xl px-2.5 py-2 text-[10px] font-semibold',
                allPaid
                  ? 'bg-brand-100/70 text-brand-800'
                  : 'bg-white text-ink-500 ring-1 ring-ink-100'
              )}
            >
              {allPaid
                ? 'Đã thu đủ tiền. Chủ kèo có thể đặt hàng!'
                : `Đã thu ${formatCurrency(collected)} / ${formatCurrency(ownerReceives)}. ${
                    isFull ? 'Nhắc các bạn còn lại chuyển khoản nhé.' : `Cần thêm ${missing} người để chốt.`
                  }`}
            </div>

            <p className="mt-2 text-[10px] leading-relaxed text-ink-400">
              UniSave không giữ tiền. Thành viên chuyển khoản trực tiếp cho chủ kèo
              {owner?.name ? ` ${owner.name}` : ''}.
            </p>
          </div>
        )}

        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-ink-500">{deal.description}</p>

        <div className="mt-4 flex items-center gap-2 border-t border-ink-100 pt-4">
          {joined ? (
            <button
              type="button"
              onClick={() => onLeave?.(deal.id)}
              className="btn-secondary flex-1 py-2.5 text-xs"
            >
              <LogOut className="h-4 w-4" />
              Rời kèo
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onJoin?.(deal.id)}
              disabled={isFull || expired}
              className={cn(
                'flex-1 py-2.5 text-xs',
                isFull || expired ? 'btn-secondary opacity-60' : 'btn-primary'
              )}
            >
              <UserPlus className="h-4 w-4" />
              {expired ? 'Đã hết hạn' : isFull ? 'Đã đủ người' : 'Tham gia'}
            </button>
          )}

          {isOwner && (
            <button
              type="button"
              onClick={() => onDelete?.(deal.id)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-ink-200 text-ink-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              title="Xóa kèo"
              aria-label="Xóa kèo"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {isOwner && (
          <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-wide text-ink-400">
            Kèo của bạn
          </p>
        )}
      </div>
    </article>
  );
}
