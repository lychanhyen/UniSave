import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
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
import FilterTabs from '../../components/marketplace/FilterTabs';
import { useMarketplace } from '../../hooks/useMarketplace';
import { POST_CATEGORY_MAP } from '../../lib/constants';
import { formatCompact } from '../../lib/utils';

export default function MarketplacePage() {
  const { posts, loading, currentUser, removePost, markSold, relistPost } = useMarketplace();
  const canPost = Boolean(currentUser.is_verified);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [location, setLocation] = useState('all');
  const [mine, setMine] = useState(false);
  const [nearby, setNearby] = useState(true);

  const stats = useMemo(() => {
    const active = posts.filter((p) => p.status !== 'sold' && p.status !== 'done');
    return {
      total: posts.length,
      active: active.length,
      sold: posts.length - active.length,
      mine: posts.filter((p) => p.owner_id === currentUser.id).length,
    };
  }, [posts, currentUser.id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts
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
  }, [posts, query, type, category, status, location, mine, nearby, currentUser.id, currentUser.campus]);

  async function handleDelete(id) {
    if (!window.confirm('Xóa tin đăng này? Hành động không thể hoàn tác.')) return;
    await removePost(id);
    toast.success('Đã xóa tin đăng');
  }

  async function handleMarkSold(id) {
    await markSold(id);
    toast.success('Đã chuyển tin sang “Đã bán”, vẫn giữ lại để tham khảo giá');
  }

  async function handleRelist(id) {
    await relistPost(id);
    toast.success('Đã đăng bán lại tin này');
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Chợ sinh viên"
        title="Đồ cũ qua tay, tiền mới về ví"
        subtitle="Mua bán, pass lại đồ dùng học tập và thuê đồ giá sinh viên trong cùng trường."
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

      <div className="animate-in relative mb-6 overflow-hidden rounded-4xl bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900 p-6 text-white shadow-card sm:p-7">
        <div className="absolute -right-10 -top-16 h-52 w-52 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-lg">
            <span className="chip bg-white/10 text-brand-200 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Cộng đồng sinh viên
            </span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Món đồ bạn không dùng,
              <br className="hidden sm:block" /> là bảo bối của người khác.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-300">
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
                className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm ring-1 ring-white/10"
              >
                <Icon className="h-4 w-4 text-brand-300" />
                <p className="mt-2 text-xl font-extrabold tracking-tight">{formatCompact(value)}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-300">
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
