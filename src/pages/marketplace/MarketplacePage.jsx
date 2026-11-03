import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  List,
  Map as MapIcon,
  Plus,
  Store,
  BadgeCheck,
  Clock3,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import PostCard from '../../components/marketplace/PostCard';
import PostMap from '../../components/marketplace/PostMap';
import FilterTabs from '../../components/marketplace/FilterTabs';
import { useMarketplace } from '../../hooks/useMarketplace';
import { POST_CATEGORY_MAP } from '../../lib/constants';
import { formatCompact, isPostExpired, POST_VISIBLE_DAYS } from '../../lib/utils';
import { hasPostCoords } from '../../lib/location';

export default function MarketplacePage() {
  const { posts, loading, currentUser, removePost, markSold, relistPost } = useMarketplace();
  const navigate = useNavigate();
  // Quản trị viên chỉ kiểm duyệt, không đăng tin hay tạo kèo.
  const canPost = currentUser.role !== 'admin' && Boolean(currentUser.is_verified);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [location, setLocation] = useState('all');
  const [mine, setMine] = useState(false);
  const [nearby, setNearby] = useState(true);
  const [view, setView] = useState('list');

  // Chợ chỉ hiện tin còn hạn 7 ngày và chưa bị xoá.
  const livePosts = useMemo(
    () => posts.filter((post) => post.status !== 'deleted' && !isPostExpired(post)),
    [posts]
  );

  const stats = useMemo(() => {
    const active = livePosts.filter((p) => p.status !== 'sold' && p.status !== 'done');
    return {
      total: livePosts.length,
      active: active.length,
      sold: livePosts.length - active.length,
      mine: livePosts.filter((p) => p.owner_id === currentUser.id).length,
    };
  }, [livePosts, currentUser.id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return livePosts
      .filter((post) => {
        const isSold = post.status === 'sold' || post.status === 'done';
        if (mine && post.owner_id !== currentUser.id) return false;
        if (type !== 'all' && post.type !== type) return false;
        if (category !== 'all' && post.category !== category) return false;
        if (status === 'active' && isSold) return false;
        if (status === 'sold' && !isSold) return false;
        if (location !== 'all' && post.location !== location) return false;
        if (!q) return true;
        const categoryLabel = POST_CATEGORY_MAP[post.category]?.label || '';
        return `${post.title} ${post.description} ${categoryLabel} ${post.location}`.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const aSold = a.status === 'sold' || a.status === 'done';
        const bSold = b.status === 'sold' || b.status === 'done';
        if (aSold !== bSold) return aSold ? 1 : -1;
        if (nearby) {
          const aNear = a.location === currentUser.campus;
          const bNear = b.location === currentUser.campus;
          if (aNear !== bNear) return aNear ? -1 : 1;
        }
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [livePosts, query, type, category, status, location, mine, nearby, currentUser.id, currentUser.campus]);

  async function handleDelete(id) {
    if (!window.confirm('Xóa tin khỏi chợ? Tin vẫn được lưu trong lịch sử đăng tin.')) return;
    await removePost(id);
    toast.success('Đã xoá tin khỏi chợ, lịch sử vẫn được giữ');
  }

  async function handleMarkSold(id) {
    await markSold(id);
    toast.success('Đã chuyển tin sang “Đã bán”, vẫn giữ lại để tham khảo giá');
  }

  async function handleRelist(id) {
    await relistPost(id);
    toast.success('Đã đăng bán lại tin này');
  }

  function handleEdit(id) {
    navigate(`/marketplace/${id}/edit`);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Chợ sinh viên"
        title="Đồ cũ qua tay, tiền mới về ví"
        subtitle={`Mua bán, pass lại đồ dùng học tập và thuê đồ giá sinh viên trong cùng trường. Tin tự ẩn sau ${POST_VISIBLE_DAYS} ngày để chợ dễ tìm.`}
        actions={
          canPost ? (
            <Link to="/marketplace/new" className="btn-primary">
              <Plus className="h-4 w-4" />
              Đăng tin
            </Link>
          ) : (
            <Link to="/profile" className="btn-secondary">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              Cần xác minh để đăng
            </Link>
          )
        }
      />

      <div className="animate-in relative mb-6 overflow-hidden rounded-3xl bg-ink-900 p-6 text-white sm:p-7">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-lg">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
              Cộng đồng sinh viên
            </span>
            <h2 className="mt-2.5 text-[clamp(1.5rem,3vw,1.9rem)] font-extrabold leading-[1.06] tracking-[-0.035em]">
              Món đồ bạn không dùng,
              <br className="hidden sm:block" /> là bảo bối của người khác.
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-white/60">
              Lọc theo trường/KTX để giao dịch gần, không phát sinh phí vận chuyển.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-3">
            {[
              { label: 'Tin đăng', value: stats.total, icon: Store },
              { label: 'Đang bán', value: stats.active, icon: Clock3 },
              { label: 'Đã bán', value: stats.sold, icon: CheckCircle2 },
              { label: 'Tin của tôi', value: stats.mine, icon: BadgeCheck },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-xl border border-white/15 bg-white/10 px-4 py-3"
              >
                <Icon className="h-4 w-4 text-white/60" />
                <p className="mt-2 figure-lg text-[20px]">{formatCompact(value)}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/50">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="animate-in-delay-1 card mb-6 p-4 sm:p-5">
        <FilterTabs
          query={query}
          onQuery={setQuery}
          type={type}
          onType={setType}
          category={category}
          onCategory={setCategory}
          status={status}
          onStatus={setStatus}
          location={location}
          onLocation={setLocation}
          mine={mine}
          onMine={setMine}
          nearby={nearby}
          onNearby={setNearby}
          resultCount={filtered.length}
        />
      </div>

      <div className="animate-in-delay-1 mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] font-semibold text-ink-600">
          {filtered.length} tin phù hợp
          <span className="ml-2 font-normal text-ink-400">
            · {filtered.filter((post) => hasPostCoords(post)).length} tin có ghim vị trí
          </span>
        </p>
        <div className="flex items-center gap-1 rounded-xl border border-brand-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition ${
              view === 'list' ? 'bg-brand-600 text-white' : 'text-ink-600 hover:text-brand-700'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            Danh sách
          </button>
          <button
            type="button"
            onClick={() => setView('map')}
            aria-pressed={view === 'map'}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition ${
              view === 'map' ? 'bg-brand-600 text-white' : 'text-ink-600 hover:text-brand-700'
            }`}
          >
            <MapIcon className="h-3.5 w-3.5" />
            Bản đồ
          </button>
        </div>
      </div>
      {loading ? (
        <div className="card animate-in-delay-2 p-12 text-center text-sm font-medium text-ink-500">
          Đang tải tin đăng…
        </div>
      ) : filtered.length === 0 ? (
        <div className="card animate-in-delay-2">
          <EmptyState
            icon={Store}
            title={mine ? 'Bạn chưa có tin đăng nào' : 'Không tìm thấy tin phù hợp'}
            description={
              mine
                ? 'Đăng món đồ đầu tiên của bạn để mọi người cùng xem nhé.'
                : 'Thử đổi từ khóa, loại tin, khu vực hoặc danh mục khác xem sao.'
            }
            action={
              canPost ? (
                <Link to="/marketplace/new" className="btn-primary">
                  <Plus className="h-4 w-4" />
                  Đăng tin ngay
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
      ) : view === 'map' ? (
        <div className="animate-in-delay-2">
          <PostMap posts={filtered} currentUserId={currentUser.id} />
        </div>
      ) : (
        <div className="animate-in-delay-2 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isOwner={post.owner_id === currentUser.id}
              nearby={nearby && post.location === currentUser.campus}
              onDelete={handleDelete}
              onMarkDone={handleMarkSold}
              onRelist={handleRelist}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {canPost && (
        <FloatingActionButton to="/marketplace/new" label="Đăng tin" className="lg:hidden" />
      )}
    </div>
  );
}
