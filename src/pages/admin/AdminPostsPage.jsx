import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  Clock3,
  ExternalLink,
  Flag,
  Lock,
  LockOpen,
  RotateCcw,
  Search,
  ShieldAlert,
  Store,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/ui/PageHeader';
import Avatar from '../../components/ui/Avatar';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useReports } from '../../hooks/useReports';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { sendUserNotification } from '../../lib/api';
import { POST_CATEGORIES, POST_CATEGORY_MAP } from '../../lib/constants';
import { useCampuses } from '../../context/CampusContext';
import { cn, formatCurrency, formatRelativeTime, isPostExpired } from '../../lib/utils';

const STATUS_TABS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Đang bán' },
  { value: 'sold', label: 'Đã bán' },
  { value: 'reported', label: 'Có tố cáo' },
  { value: 'deleted', label: 'Đã xoá' },
  { value: 'expired', label: 'Hết hạn' },
];

const ACTION_META = {
  remove: {
    title: 'Gỡ bài đăng',
    description: 'Bài đăng sẽ bị xóa khỏi chợ sinh viên và người đăng nhận thông báo kèm lý do.',
    confirm: 'Gỡ bài đăng',
    tone: 'btn-danger',
    noteLabel: 'Lý do gửi cho người đăng',
    defaultNote: 'Tin đăng vi phạm quy định cộng đồng UniSave nên đã bị gỡ.',
  },
  lock: {
    title: 'Khóa tài khoản người đăng',
    description: 'Tài khoản bị đăng xuất và không thể đăng nhập cho đến khi admin mở khóa.',
    confirm: 'Khóa tài khoản',
    tone: 'btn-danger',
    noteLabel: 'Lý do khóa tài khoản',
    defaultNote: 'Tài khoản bị khóa do đăng tin vi phạm quy định cộng đồng UniSave.',
  },
  unlock: {
    title: 'Mở khóa tài khoản',
    description: 'Người dùng có thể đăng nhập và sử dụng lại UniSave.',
    confirm: 'Mở khóa',
    tone: 'btn-primary',
    noteLabel: 'Ghi chú xử lý',
    defaultNote: 'Đã xem xét và mở khóa tài khoản. Hãy tuân thủ quy định cộng đồng.',
  },
};

export default function AdminPostsPage() {
  const { posts, loading, removePost, undeletePost } = useMarketplace();
  const { reports } = useReports();
  const { users, lock, unlock } = useAdminUsers();
  const { labelOf } = useCampuses();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [category, setCategory] = useState('all');
  const [action, setAction] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reportCounts = useMemo(() => {
    const map = {};
    reports.forEach((report) => {
      if (report.target_type !== 'post') return;
      map[report.target_id] = (map[report.target_id] || 0) + 1;
    });
    return map;
  }, [reports]);

  const openReportCounts = useMemo(() => {
    const map = {};
    reports.forEach((report) => {
      if (report.target_type !== 'post' || report.status !== 'open') return;
      map[report.target_id] = (map[report.target_id] || 0) + 1;
    });
    return map;
  }, [reports]);

  // Tin đã xoá (status 'deleted') chỉ hiện ở tab "Đã xoá", không lẫn vào tab kiểm duyệt.
  const livePosts = useMemo(() => posts.filter((post) => post.status !== 'deleted'), [posts]);
  const deletedPosts = useMemo(() => posts.filter((post) => post.status === 'deleted'), [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (tab === 'deleted') {
        if (post.status !== 'deleted') return false;
      } else if (post.status === 'deleted') {
        return false;
      }
      if (tab === 'active' && post.status !== 'active') return false;
      if (tab === 'sold' && post.status !== 'sold' && post.status !== 'done') return false;
      if (tab === 'reported' && !openReportCounts[post.id]) return false;
      if (tab === 'expired' && !(post.status !== 'deleted' && isPostExpired(post))) return false;
      if (category !== 'all' && post.category !== category) return false;
      if (!q) return true;
      return `${post.title} ${post.owner_name} ${post.description || ''}`
        .toLowerCase()
        .includes(q);
    });
  }, [posts, tab, category, query, openReportCounts]);

  const stats = useMemo(
    () => ({
      total: livePosts.length,
      active: livePosts.filter((post) => post.status === 'active').length,
      sold: livePosts.filter((post) => post.status === 'sold' || post.status === 'done').length,
      reported: livePosts.filter((post) => openReportCounts[post.id]).length,
      deleted: deletedPosts.length,
      expired: livePosts.filter((post) => isPostExpired(post)).length,
    }),
    [livePosts, deletedPosts, openReportCounts]
  );

  const counts = useMemo(
    () => ({
      all: livePosts.length,
      active: stats.active,
      sold: stats.sold,
      reported: stats.reported,
      deleted: stats.deleted,
      expired: stats.expired,
    }),
    [livePosts.length, stats]
  );

  function openAction(type, post) {
    const owner = users.find((user) => user.id === post.owner_id);
    setAction({ type, post, owner });
    setNote(ACTION_META[type].defaultNote);
  }

  async function handleConfirm() {
    if (!action) return;
    const { type, post, owner } = action;
    if (note.trim().length < 5) {
      toast.error('Vui lòng nhập lý do rõ ràng (ít nhất 5 ký tự).');
      return;
    }
    setSubmitting(true);
    try {
      if (type === 'remove') {
        await removePost(post.id);
        await sendUserNotification(post.owner_id, {
          type: 'system',
          title: 'Bài đăng của bạn đã bị gỡ',
          body: `“${post.title}” đã bị gỡ. Lý do: ${note.trim()}`,
          link: '/marketplace',
        });
        toast.success('Đã gỡ bài đăng và thông báo cho người đăng.');
      } else if (type === 'lock') {
        if (!owner) throw new Error('Không tìm thấy tài khoản người đăng.');
        await lock(owner.id, note.trim());
        toast.success('Đã khóa tài khoản người đăng.');
      } else if (type === 'unlock') {
        if (!owner) throw new Error('Không tìm thấy tài khoản người đăng.');
        await unlock(owner.id, note.trim());
        toast.success('Đã mở khóa tài khoản người đăng.');
      }
      setAction(null);
    } catch (error) {
      toast.error(error.message || 'Không thực hiện được thao tác.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Quản trị · Bài đăng"
        title="Quản lý bài đăng sinh viên"
        subtitle="Theo dõi tin đăng, gỡ nội dung vi phạm và khóa tài khoản người đăng khi cần."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Tổng bài đăng', value: stats.total, tone: 'text-ink-900' },
          { label: 'Đang bán', value: stats.active, tone: 'text-brand-700' },
          { label: 'Đã bán', value: stats.sold, tone: 'text-ink-500' },
          { label: 'Có tố cáo chờ', value: stats.reported, tone: 'text-rose-600' },
      { label: 'Quá 7 ngày', value: stats.expired, tone: 'text-amber-600' },
        ].map((item) => (
          <div key={item.label} className="card p-4">
            <p className={`text-2xl font-extrabold tracking-tight ${item.tone}`}>{item.value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <div className="card mb-5 space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tiêu đề, người đăng hoặc mô tả…"
              className="input pl-11 pr-10"
              aria-label="Tìm bài đăng"
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
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input sm:w-56"
            aria-label="Lọc danh mục"
          >
            <option value="all">Tất cả danh mục</option>
            {POST_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl bg-ink-100 p-1">
          {STATUS_TABS.map((item) => (
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
              <span className="ml-1.5 text-[10px] text-ink-400">{counts[item.value]}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card p-12 text-center text-sm font-medium text-ink-500">
          Đang tải bài đăng…
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Store className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-3 text-sm font-bold text-ink-700">Không có bài đăng phù hợp</p>
          <p className="mt-1 text-xs text-ink-400">Thử đổi từ khóa hoặc bộ lọc trạng thái.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => {
            const categoryMeta = POST_CATEGORY_MAP[post.category] || POST_CATEGORY_MAP.other;
            const CategoryIcon = categoryMeta.icon;
            const owner = users.find((user) => user.id === post.owner_id);
            const isSold = post.status === 'sold' || post.status === 'done';
            const isDeleted = post.status === 'deleted';
            const isExpired = !isDeleted && isPostExpired(post);
            const deletedByAdmin =
              isDeleted && post.deleted_by && post.deleted_by !== post.owner_id;
            const openReports = openReportCounts[post.id] || 0;
            const totalReports = reportCounts[post.id] || 0;
            return (
              <div key={post.id} className="card p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                    <CategoryIcon className="h-6 w-6" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/marketplace/${post.id}`}
                        className="text-sm font-extrabold text-ink-900 transition hover:text-brand-700"
                      >
                        {post.title}
                      </Link>
                      {isDeleted ? (
                        <span className="chip bg-rose-50 text-rose-700 ring-1 ring-rose-100">
                          <Trash2 className="h-3.5 w-3.5" />
                          {deletedByAdmin ? 'Admin đã xoá' : 'Sinh viên tự xoá'}
                        </span>
                      ) : isSold ? (
                        <span className="chip bg-ink-100 text-ink-600 ring-1 ring-ink-200">
                          <Clock3 className="h-3.5 w-3.5" /> Đã bán
                        </span>
                      ) : (
                        <span className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                          <BadgeCheck className="h-3.5 w-3.5" /> Đang bán
                        </span>
                      )}
                      {isExpired && (
                        <span className="chip bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                          <Clock3 className="h-3.5 w-3.5" /> Quá 7 ngày
                        </span>
                      )}
                      {openReports > 0 && (
                        <span className="chip bg-rose-50 text-rose-700 ring-1 ring-rose-100">
                          <Flag className="h-3.5 w-3.5" /> {openReports} tố cáo chờ
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Avatar size="sm" name={post.owner_name} src={post.owner_avatar} />
                        <span className="font-semibold text-ink-600">{post.owner_name}</span>
                        {post.owner_verified && (
                          <BadgeCheck className="h-3.5 w-3.5 text-brand-600" />
                        )}
                      </span>
                      <span>{post.owner_email || owner?.email || 'Chưa có email'}</span>
                      <span>{labelOf(post.location)}</span>
                      <span>{formatRelativeTime(post.created_at)}</span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-ink-500">
                      <span className="rounded-full bg-ink-50 px-2.5 py-1">
                        {categoryMeta.label}
                      </span>
                      <span className="rounded-full bg-brand-50 px-2.5 py-1 text-brand-700">
                        {formatCurrency(post.price)}
                        {post.type === 'rent' ? '/tháng' : ''}
                      </span>
                      <span className="rounded-full bg-ink-50 px-2.5 py-1">
                        {totalReports} tố cáo tổng cộng
                      </span>
                      {owner?.is_locked && (
                        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-600">
                          Người đăng đang bị khóa
                        </span>
                      )}
                    </div>

                    {openReports > 0 && (
                      <p className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-[11px] font-medium text-rose-700">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Có tố cáo đang chờ xử lý ở trang Tố cáo.
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2 sm:w-48 sm:flex-col">
                    <Link
                      to={`/marketplace/${post.id}`}
                      className="btn-secondary justify-center py-2 text-xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Xem tin
                    </Link>
                    {isDeleted ? (
                      <button
                        type="button"
                        onClick={async () => {
                          await undeletePost(post.id);
                          toast.success('Đã đăng lại tin lên chợ');
                        }}
                        className="btn-secondary justify-center py-2 text-xs text-brand-700"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Đăng lại tin
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openAction('remove', post)}
                        className="btn-ghost justify-center py-2 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Gỡ bài đăng
                      </button>
                    )}
                    {owner ? (
                      owner.is_locked ? (
                        <button
                          type="button"
                          onClick={() => openAction('unlock', post)}
                          className="btn-secondary justify-center py-2 text-xs text-brand-700"
                        >
                          <LockOpen className="h-3.5 w-3.5" />
                          Mở khóa người đăng
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openAction('lock', post)}
                          className="btn-ghost justify-center py-2 text-xs text-rose-600 hover:bg-rose-50"
                        >
                          <Lock className="h-3.5 w-3.5" />
                          Khóa người đăng
                        </button>
                      )
                    ) : (
                      <span className="rounded-xl bg-ink-50 px-3 py-2 text-center text-[10px] text-ink-400">
                        Không tìm thấy tài khoản người đăng
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
            onClick={() => !submitting && setAction(null)}
          />
          <div className="animate-in relative w-full max-w-md rounded-3xl bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-ink-900">{ACTION_META[action.type].title}</p>
                <p className="mt-0.5 text-[11px] text-ink-400">
                  {ACTION_META[action.type].description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => !submitting && setAction(null)}
                className="grid h-8 w-8 place-items-center rounded-xl text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 rounded-2xl bg-ink-50 p-3">
              <p className="line-clamp-2 text-xs font-bold text-ink-900">{action.post.title}</p>
              <p className="mt-1 text-[10px] text-ink-400">
                {action.post.owner_name} · {formatCurrency(action.post.price)}
              </p>
            </div>

            <label className="label mt-4">{ACTION_META[action.type].noteLabel}</label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input resize-none"
              maxLength={400}
            />

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setAction(null)}
                disabled={submitting}
                className="btn-secondary flex-1 justify-center py-2.5"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className={`${ACTION_META[action.type].tone} flex-1 justify-center py-2.5`}
              >
                {submitting ? 'Đang xử lý…' : ACTION_META[action.type].confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
