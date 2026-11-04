import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  Banknote,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Eye,
  Flag,
  PencilLine,
  LogOut,
  Paperclip,
  ShoppingBag,
  Trash2,
  TrendingDown,
  Truck,
  UserPlus,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, formatCurrency, percentOf, timeLeft } from '../../lib/utils';
import { getDealMembers } from '../../lib/demoData';
import { resolveDealBillUrl } from '../../lib/api';
import { compressImageFile } from '../../lib/image';
import Avatar from '../ui/Avatar';
import ReportDialog from '../reports/ReportDialog';

const STATUS = {
  open: { label: 'Đang mở', className: 'bg-brand-50 text-brand-700 ring-brand-100' },
  full: { label: 'Đủ người', className: 'bg-blue-50 text-blue-700 ring-blue-100' },
};

export default function DealDetail({
  deal,
  joined,
  isOwner,
  currentUserId,
  onJoin,
  onLeave,
  onDelete,
  onEdit,
  onDeclarePayment,
  onReviewPayment,
  onAttachBill,
  isAdmin = false,
  detail = false,
}) {
  const [showSplit, setShowSplit] = useState(detail);
  const [billBusy, setBillBusy] = useState(false);
  const [billViewer, setBillViewer] = useState(null);
  const [billSrc, setBillSrc] = useState('');
  const [billLoading, setBillLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const billInputRef = useRef(null);

  async function openBill(member) {
    if (!member.bill_url) return;
    setBillViewer(member);
    setBillSrc('');
    setBillLoading(true);
    try {
      setBillSrc(await resolveDealBillUrl(member.bill_url));
    } catch (error) {
      toast.error(`Không mở được bill: ${error.message}`);
    } finally {
      setBillLoading(false);
    }
  }

  async function handleBillFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBillBusy(true);
    try {
      const dataUrl = await compressImageFile(file, { maxSize: 1400, quality: 0.72 });
      await onAttachBill?.(deal.id, dataUrl);
      toast.success('Đã tải bill. Chủ kèo và quản trị viên xem được để đối chiếu.');
    } catch {
      /* lỗi đã hiển thị */
    } finally {
      setBillBusy(false);
    }
  }
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
  // "Đã thu" chỉ tính phần chủ kèo đã xác nhận nhận tiền.
  const statusOf = (member) =>
    member.payment_status || (member.paid ? 'confirmed' : 'unpaid');
  const confirmedOthers = others.filter((member) => statusOf(member) === 'confirmed');
  const declaredOthers = others.filter((member) => statusOf(member) === 'declared');
  const collected = perMember * confirmedOthers.length;
  const allConfirmed = others.length > 0 && confirmedOthers.length === others.length;
  const pendingCash = perMember * declaredOthers.length;
  const missing = Math.max(0, (Number(deal.min_members) || 0) - memberCount);
  // Bill chỉ hiện với người tải, chủ kèo và quản trị viên.
  const visibleBills = others.filter(
    (member) => member.bill_url && (isOwner || isAdmin || member.id === currentUserId)
  );

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
      <div className="relative border-b border-brand-200/70 bg-ink-50/60 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white">
              <ShoppingBag className="h-4 w-4" />
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
            <span className="chip bg-rose-700 text-white">
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

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-200">
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-700',
              isFull ? 'bg-blue-600' : 'bg-brand-600'
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
            <Link to={`/u/${deal.owner_id}`} className="shrink-0">
              <Avatar size="sm" name={deal.owner_name} />
            </Link>
            <Link
              to={`/u/${deal.owner_id}`}
              className="max-w-[7rem] truncate text-[11px] font-semibold text-ink-500 hover:text-brand-700"
            >
              {deal.owner_name}
            </Link>
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
              : 'border-brand-200/70 bg-white text-ink-600 hover:border-brand-200 hover:text-brand-700'
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

        {visibleBills.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-xl border border-brand-200 bg-white px-2.5 py-2">
            <Paperclip className="h-3 w-3 shrink-0 text-brand-600" />
            <span className="text-[10px] font-bold text-ink-600">Bill chuyển khoản:</span>
            {visibleBills.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => openBill(member)}
                className="inline-flex items-center gap-1 rounded-md bg-ink-900 px-1.5 py-0.5 text-[9px] font-bold text-white transition hover:bg-ink-800"
              >
                <Eye className="h-2.5 w-2.5" />
                {member.name?.split(' ').slice(-1)[0] || 'Xem'}
              </button>
            ))}
          </div>
        )}

        {showSplit && (
          <div className="mt-2 rounded-2xl border border-brand-200/70 bg-ink-50/70 p-3">
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

            <ul className="mt-2 divide-y divide-brand-200/60/70">
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
                        : statusOf(member) === 'confirmed'
                          ? 'Chủ kèo đã xác nhận nhận tiền'
                          : statusOf(member) === 'declared'
                            ? 'Báo đã chuyển · chờ chủ kèo xác nhận'
                            : statusOf(member) === 'disputed'
                              ? 'Chủ kèo báo chưa nhận được tiền'
                              : 'Chưa chuyển khoản'}
                    </p>

                    {(member.bill_url || member.id === currentUserId) && !member.is_owner && (
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {member.bill_url && (isOwner || isAdmin || member.id === currentUserId) && (
                          <button
                            type="button"
                            onClick={() => openBill(member)}
                            className="inline-flex items-center gap-1 rounded-md bg-ink-900 px-1.5 py-0.5 text-[9px] font-bold text-white transition hover:bg-ink-800"
                          >
                            <Eye className="h-2.5 w-2.5" />
                            Xem bill
                          </button>
                        )}
                        {member.id === currentUserId && statusOf(member) !== 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => billInputRef.current?.click()}
                            disabled={billBusy}
                            className="inline-flex items-center gap-1 rounded-md border border-brand-200 bg-white px-1.5 py-0.5 text-[9px] font-bold text-brand-700 transition hover:border-brand-300 disabled:opacity-60"
                          >
                            <Paperclip className="h-2.5 w-2.5" />
                            {billBusy ? 'Đang tải…' : member.bill_url ? 'Đổi bill' : 'Tải bill'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {member.is_owner ? (
                    <span className="chip bg-ink-200 text-[10px] text-ink-600">—</span>
                  ) : isOwner ? (
                    /* Chủ kèo là người duy nhất chốt được "đã nhận tiền". */
                    statusOf(member) === 'confirmed' ? (
                      <span className="chip shrink-0 border border-brand-200 bg-brand-50 text-[10px] text-brand-700">
                        <Check className="h-3 w-3" />
                        Đã nhận
                      </span>
                    ) : statusOf(member) === 'declared' || statusOf(member) === 'disputed' ? (
                      <span className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onReviewPayment?.(deal.id, member.id, true)}
                          className="chip border border-brand-600 bg-brand-600 text-[10px] text-white transition hover:bg-brand-700"
                          title="Tôi đã thấy khoản chuyển này trong tài khoản"
                        >
                          <Check className="h-3 w-3" />
                          Xác nhận
                        </button>
                        {statusOf(member) === 'declared' && (
                          <button
                            type="button"
                            onClick={() => onReviewPayment?.(deal.id, member.id, false)}
                            className="chip border border-rose-200 bg-rose-50 text-[10px] text-rose-700 transition hover:bg-rose-100"
                            title="Chưa thấy tiền trong tài khoản"
                          >
                            Chưa nhận
                          </button>
                        )}
                      </span>
                    ) : (
                      <span className="chip shrink-0 border border-brand-200/70 bg-white text-[10px] text-ink-500">
                        Chưa chuyển
                      </span>
                    )
                  ) : member.id === currentUserId ? (
                    statusOf(member) === 'confirmed' ? (
                      <span className="chip shrink-0 border border-brand-200 bg-brand-50 text-[10px] text-brand-700">
                        <Check className="h-3 w-3" />
                        Đã nhận
                      </span>
                    ) : statusOf(member) === 'declared' ? (
                      <span className="chip shrink-0 border border-amber-200 bg-amber-50 text-[10px] text-amber-700">
                        <Clock3 className="h-3 w-3" />
                        Chờ xác nhận
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onDeclarePayment?.(deal.id)}
                        className="chip shrink-0 border border-brand-600 bg-brand-600 text-[10px] text-white transition hover:bg-brand-700"
                      >
                        Tôi đã chuyển
                      </button>
                    )
                  ) : (
                    <span
                      className={cn(
                        'chip shrink-0 border text-[10px]',
                        statusOf(member) === 'confirmed'
                          ? 'border-brand-200 bg-brand-50 text-brand-700'
                          : statusOf(member) === 'declared'
                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                            : 'border-brand-200/70 bg-white text-ink-500'
                      )}
                    >
                      {statusOf(member) === 'confirmed'
                        ? 'Đã nhận'
                        : statusOf(member) === 'declared'
                          ? 'Chờ xác nhận'
                          : 'Chưa chuyển'}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <div
              className={cn(
                'mt-2 rounded-xl px-2.5 py-2 text-[10px] font-semibold',
                allConfirmed
                  ? 'bg-brand-100/70 text-brand-800'
                  : declaredOthers.length > 0
                    ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-100'
                    : 'bg-white text-ink-500 ring-1 ring-ink-100'
              )}
            >
              {allConfirmed
                ? 'Chủ kèo đã xác nhận nhận đủ tiền. Có thể đặt hàng!'
                : declaredOthers.length > 0
                  ? `${declaredOthers.length} bạn báo đã chuyển (${formatCurrency(pendingCash)}) nhưng chưa được chủ kèo xác nhận. Đã nhận thực tế ${formatCurrency(collected)} / ${formatCurrency(ownerReceives)}.`
                  : `Đã nhận ${formatCurrency(collected)} / ${formatCurrency(ownerReceives)}. ${
                      isFull ? 'Nhắc các bạn còn lại chuyển khoản nhé.' : `Cần thêm ${missing} người để chốt.`
                    }`}
            </div>

            {declaredOthers.length > 0 && (
              <p className="mt-1.5 text-[10px] leading-relaxed text-amber-700">
                Tự báo “đã chuyển” chưa được tính là đã trả. Chủ kèo kiểm tra tài khoản rồi bấm
                “Xác nhận” ở từng bạn.
              </p>
            )}

            <p className="mt-2 text-[10px] leading-relaxed text-ink-400">
              UniSave không giữ tiền. Thành viên chuyển khoản trực tiếp cho chủ kèo
              {owner?.name ? ` ${owner.name}` : ''}.
            </p>
          </div>
        )}

        <p className={cn('mt-3 text-xs leading-relaxed text-ink-500', !detail && 'line-clamp-2')}>{deal.description}</p>

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

          {!isOwner && (
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-brand-200/70 text-ink-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              title="Tố cáo kèo có dấu hiệu lừa đảo"
              aria-label="Tố cáo kèo"
            >
              <Flag className="h-4 w-4" />
            </button>
          )}

          {isOwner && (
            <button
              type="button"
              onClick={() => onEdit?.(deal.id)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-brand-200/70 text-ink-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              title="Sửa kèo"
              aria-label="Sửa kèo"
            >
              <PencilLine className="h-4 w-4" />
            </button>
          )}

          {isOwner && (
            <button
              type="button"
              onClick={() => onDelete?.(deal.id)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-brand-200/70 text-ink-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
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

      <input
        ref={billInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleBillFile}
      />

      {billViewer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink-900/70 backdrop-blur-sm"
            onClick={() => setBillViewer(null)}
          />
          <div className="animate-pop relative w-full max-w-md rounded-3xl bg-white p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-ink-900">Bill chuyển khoản</p>
                <p className="mt-0.5 text-[11px] text-ink-500">
                  {billViewer.name}
                  {billViewer.is_owner ? '' : ` · cần chuyển ${formatCurrency(perMember)}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBillViewer(null)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 overflow-hidden rounded-2xl border border-brand-200 bg-ink-50">
              {billLoading ? (
                <p className="py-16 text-center text-xs font-semibold text-ink-400">Đang tải bill…</p>
              ) : billSrc ? (
                <img
                  src={billSrc}
                  alt="Bill chuyển khoản"
                  className="max-h-[60vh] w-full object-contain"
                />
              ) : (
                <p className="py-16 text-center text-xs text-ink-400">Không mở được bill.</p>
              )}
            </div>

            <p className="mt-2 text-[10px] leading-relaxed text-ink-400">
              Bill được lưu riêng tư: chỉ người tải, chủ kèo và quản trị viên UniSave xem được.
            </p>
          </div>
        </div>
      )}
      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="deal"
        targetId={deal.id}
        targetLabel={`Kèo gom đơn · ${deal.title}`}
        onSubmitted={() => toast.success('Đã gửi tố cáo tới quản trị viên')}
      />
    </article>
  );
}