import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
  Plus,
  ShoppingBag,
  Search,
  X,
  Users,
  Sparkles,
  TrendingDown,
  Flame,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import DealCard from '../../components/group/DealCard';
import { useDeals } from '../../hooks/useDeals';
import { DEAL_VISIBLE_DAYS, isDealArchived } from '../../lib/utils';
import { cn, formatCompact } from '../../lib/utils';

const TABS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'open', label: 'Đang mở' },
  { value: 'full', label: 'Đủ người' },
  { value: 'mine', label: 'Kèo của tôi' },
];

export default function GroupDealsPage() {
  const navigate = useNavigate();
  const { deals, currentUser, joinDeal, leaveDeal, declarePayment, reviewPayment, attachBill, removeDeal } = useDeals();
  // Quản trị viên chỉ kiểm duyệt, không đăng tin hay tạo kèo.
  const canPost = currentUser.role !== 'admin' && Boolean(currentUser.is_verified);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');

  // Kèo đã kết thúc quá 7 ngày thì tự ẩn khỏi danh sách (dữ liệu vẫn giữ).
  const visibleDeals = useMemo(() => deals.filter((deal) => !isDealArchived(deal)), [deals]);

  const stats = useMemo(() => {
    const active = visibleDeals.filter((d) => d.status === 'open');
    const members = visibleDeals.reduce((sum, d) => sum + (d.current_members || 0), 0);
    const maxDiscount = visibleDeals.reduce((max, d) => {
      if (!d.original_price) return max;
      return Math.max(max, Math.round((1 - d.deal_price / d.original_price) * 100));
    }, 0);
    return { open: active.length, members, maxDiscount };
  }, [visibleDeals]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visibleDeals
      .filter((deal) => {
        if (tab === 'open' && deal.status !== 'open') return false;
        if (tab === 'full' && deal.status !== 'full') return false;
        if (
          tab === 'mine' &&
          deal.owner_id !== currentUser.id &&
          !(deal.joined_ids || []).includes(currentUser.id)
        )
          return false;
        if (!q) return true;
        return `${deal.title} ${deal.description} ${deal.owner_name}`.toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [visibleDeals, query, tab, currentUser.id]);

  async function handleJoin(id) {
    const next = await joinDeal(id);
    if (next) {
      toast.success('Đã tham gia kèo, nhớ theo dõi hạn chót nhé!');
      if (next.status === 'full') {
        toast('Kèo đã đủ người, mở công cụ chia tiền để xem số tiền cần chuyển.', { icon: '💰' });
      }
    }
  }

  async function handleLeave(id) {
    await leaveDeal(id);
    toast('Bạn đã rời kèo gom đơn', { icon: '👋' });
  }

  function handleEditDeal(id) {
    navigate(`/deals/${id}/edit`);
  }

  async function handleDelete(id) {
    if (!window.confirm('Xóa kèo gom đơn này? Hành động không thể hoàn tác.')) return;
    await removeDeal(id);
    toast.success('Đã xóa kèo');
  }

  async function handleDeclarePayment(dealId) {
    await declarePayment(dealId);
    toast.success('Đã báo chuyển khoản, chờ chủ kèo xác nhận');
  }

  async function handleReviewPayment(dealId, memberId, accept) {
    await reviewPayment(dealId, memberId, accept);
    toast.success(
      accept ? 'Đã xác nhận nhận tiền' : 'Đã báo chưa nhận được tiền'
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Gom đơn"
        title="Mua chung, rẻ hơn một nửa"
        subtitle={`Rủ bạn cùng lớp gom đơn để được giá sỉ, freeship và nhiều ưu đãi hơn. Kèo đã kết thúc quá ${DEAL_VISIBLE_DAYS} ngày sẽ tự ẩn.`}
        actions={
          canPost ? (
            <Link to="/deals/new" className="btn-primary">
              <Plus className="h-4 w-4" />
              Tạo kèo
            </Link>
          ) : (
            <Link to="/profile" className="btn-secondary">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              Cần xác minh để tạo kèo
            </Link>
          )
        }
      />

      <div className="animate-in relative mb-6 overflow-hidden rounded-3xl bg-brand-600 p-6 text-white sm:p-7">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-lg">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
              Kèo đang hot
            </span>
            <h2 className="mt-2.5 text-[clamp(1.5rem,3vw,1.9rem)] font-extrabold leading-[1.06] tracking-[-0.035em]">
              Một người mua thì đắt,
              <br className="hidden sm:block" /> cả nhóm mua thì hời.
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-white/70">
              Tham gia kèo có sẵn hoặc tự tạo kèo cho lớp, ký túc xá của bạn.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: 'Kèo đang mở', value: stats.open, icon: ShoppingBag },
              { label: 'Người tham gia', value: stats.members, icon: Users },
              { label: 'Giảm tối đa', value: `${stats.maxDiscount}%`, icon: TrendingDown },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-xl border border-white/15 bg-white/10 px-4 py-3"
              >
                <Icon className="h-4 w-4 text-white/60" />
                <p className="mt-2 figure-lg text-[20px]">
                  {typeof value === 'number' ? formatCompact(value) : value}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/50">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="animate-in-delay-1 card mb-6 space-y-4 p-4 sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kèo trà sữa, giáo trình, đồ ăn vặt…"
            className="input pl-11 pr-10"
            aria-label="Tìm kèo gom đơn"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-ink-400 hover:bg-ink-100 hover:text-ink-700"
              aria-label="Xóa tìm kiếm"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl bg-ink-100 p-1">
            {TABS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setTab(item.value)}
                className={cn(
                  'shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all',
                  tab === item.value
                    ? 'bg-white text-ink-900 shadow-soft'
                    : 'text-ink-500 hover:text-ink-800'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <span className="hidden shrink-0 text-xs font-medium text-ink-400 sm:block">
            {filtered.length} kèo phù hợp
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card animate-in-delay-2">
          <EmptyState
            icon={ShoppingBag}
            title={tab === 'mine' ? 'Bạn chưa tạo kèo nào' : 'Chưa có kèo phù hợp'}
            description={
              tab === 'mine'
                ? 'Tạo kèo đầu tiên và rủ bạn bè cùng tham gia để tiết kiệm hơn.'
                : 'Thử đổi từ khóa hoặc chuyển sang tab khác xem sao.'
            }
            action={
              canPost ? (
                <Link to="/deals/new" className="btn-primary">
                  <Plus className="h-4 w-4" />
                  Tạo kèo ngay
                </Link>
              ) : (
                <Link to="/profile" className="btn-secondary">
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  Gửi yêu cầu xác minh
                </Link>
              )
            }
          />
        </div>
      ) : (
        <div className="animate-in-delay-2 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              joined={(deal.joined_ids || []).includes(currentUser.id)}
              isOwner={deal.owner_id === currentUser.id}
              currentUserId={currentUser.id}
              onJoin={handleJoin}
              onLeave={handleLeave}
              onDelete={handleDelete}
              onEdit={handleEditDeal}
              onDeclarePayment={handleDeclarePayment}
              onReviewPayment={handleReviewPayment}
              onAttachBill={attachBill}
              isAdmin={currentUser.role === 'admin'}
            />
          ))}
        </div>
      )}

      <div className="mt-8 flex items-start gap-3 rounded-3xl border border-brand-200/60 bg-white/70 p-5 backdrop-blur-sm">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-600">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-ink-900">Bí kíp gom đơn an toàn</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-500">
            Chỉ tham gia kèo có người tạo rõ ràng, thống nhất cách chia tiền trước khi đặt hàng và
            ưu tiên thanh toán khi nhận hàng. Khi kèo đủ người, mở “Chia tiền” trên thẻ kèo để xem
            đúng số tiền mỗi thành viên cần chuyển cho chủ kèo. UniSave không giữ tiền của bạn.
          </p>
        </div>
      </div>
    </div>
  );
}
