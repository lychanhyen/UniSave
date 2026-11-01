import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  Check,
  Clock3,
  ImageOff,
  Lock,
  LockOpen,
  Mail,
  Search,
  ShieldCheck,
  ShieldX,
  UserRound,
  X,
  ZoomIn,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/ui/PageHeader';
import Avatar from '../../components/ui/Avatar';
import StudentCardImage from '../../components/verification/StudentCardImage';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useDeals } from '../../hooks/useDeals';
import { useCampuses } from '../../context/CampusContext';
import { cn, formatRelativeTime } from '../../lib/utils';

const TABS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã xác minh' },
  { value: 'rejected', label: 'Bị từ chối' },
  { value: 'locked', label: 'Bị khóa' },
  { value: 'no-card', label: 'Thiếu ảnh thẻ' },
];

const ACTION_META = {
  approve: {
    title: 'Duyệt hồ sơ sinh viên',
    description: 'Gắn huy hiệu xác minh và mở khóa quyền đăng bài, tạo kèo.',
    confirm: 'Duyệt sinh viên',
    tone: 'btn-primary',
  },
  reject: {
    title: 'Từ chối / thu hồi xác minh',
    description: 'Sinh viên sẽ nhận thông báo kèm lý do và có thể gửi lại hồ sơ.',
    confirm: 'Xác nhận từ chối',
    tone: 'btn-danger',
  },
  lock: {
    title: 'Khóa tài khoản',
    description: 'Tài khoản bị đăng xuất và không thể đăng nhập cho đến khi mở khóa.',
    confirm: 'Khóa tài khoản',
    tone: 'btn-danger',
  },
  unlock: {
    title: 'Mở khóa tài khoản',
    description: 'Sinh viên có thể đăng nhập và sử dụng lại UniSave.',
    confirm: 'Mở khóa',
    tone: 'btn-primary',
  },
};

function defaultNote(type) {
  if (type === 'approve') return 'Đã đối chiếu họ tên, MSSV và thẻ sinh viên. Hồ sơ hợp lệ.';
  if (type === 'reject') return 'Thông tin chưa khớp với thẻ sinh viên, vui lòng kiểm tra và gửi lại.';
  if (type === 'lock') return 'Tài khoản bị khóa do vi phạm quy định cộng đồng của UniSave.';
  return 'Đã xem xét và mở khóa tài khoản. Hãy tuân thủ quy định cộng đồng.';
}

export default function AdminStudentsPage() {
  const { users, loading, approve, reject, lock, unlock, pendingCount, verifiedCount, lockedCount } =
    useAdminUsers();
  const { posts } = useMarketplace();
  const { deals } = useDeals();
  const { labelOf } = useCampuses();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [action, setAction] = useState(null);
  const [preview, setPreview] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const counts = useMemo(
    () => ({
      all: users.length,
      pending: users.filter((user) => user.verification_status === 'pending').length,
      approved: users.filter((user) => user.is_verified).length,
      rejected: users.filter((user) => user.verification_status === 'rejected').length,
      locked: users.filter((user) => user.is_locked).length,
      'no-card': users.filter((user) => !user.student_card_url).length,
    }),
    [users]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      if (tab === 'pending' && user.verification_status !== 'pending') return false;
      if (tab === 'approved' && !user.is_verified) return false;
      if (tab === 'rejected' && user.verification_status !== 'rejected') return false;
      if (tab === 'locked' && !user.is_locked) return false;
      if (tab === 'no-card' && user.student_card_url) return false;
      if (!q) return true;
      return `${user.full_name} ${user.email} ${user.student_code}`.toLowerCase().includes(q);
    });
  }, [users, tab, query]);

  function openAction(type, user) {
    setAction({ type, user });
    setNote(defaultNote(type));
  }

  async function handleConfirm() {
    if (!action) return;
    const { type, user } = action;
    if (type === 'reject' && note.trim().length < 5) {
      toast.error('Vui lòng nhập lý do từ chối để sinh viên biết cách sửa.');
      return;
    }
    setSubmitting(true);
    try {
      if (type === 'approve') await approve(user.id, note.trim());
      if (type === 'reject') await reject(user.id, note.trim());
      if (type === 'lock') await lock(user.id, note.trim());
      if (type === 'unlock') await unlock(user.id, note.trim());
      toast.success(
        type === 'approve'
          ? 'Đã duyệt và gắn huy hiệu xác minh.'
          : type === 'reject'
            ? 'Đã từ chối hồ sơ và gửi thông báo.'
            : type === 'lock'
              ? 'Đã khóa tài khoản.'
              : 'Đã mở khóa tài khoản.'
      );
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
        eyebrow="Quản trị · Sinh viên"
        title="Duyệt và quản lý sinh viên"
        subtitle="Kiểm tra hồ sơ, gán huy hiệu xác minh và khóa tài khoản vi phạm."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Tổng sinh viên', value: counts.all, tone: 'text-ink-900' },
          { label: 'Chờ duyệt', value: pendingCount, tone: 'text-amber-600' },
          { label: 'Đã xác minh', value: verifiedCount, tone: 'text-brand-700' },
          { label: 'Bị khóa', value: lockedCount, tone: 'text-rose-600' },
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
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên, email hoặc MSSV…"
            className="input pl-11 pr-10"
            aria-label="Tìm sinh viên"
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
              <span className="ml-1.5 text-[10px] text-ink-400">{counts[item.value]}</span>
            </button>
          ))}
        </div>
      </div>

      {counts['no-card'] > 0 && (
        <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
          <ImageOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-[11px] leading-relaxed text-amber-800">
            <strong>{counts['no-card']} hồ sơ chưa có ảnh thẻ sinh viên.</strong> Hãy nhắc sinh viên
            tải ảnh trong Hồ sơ trước khi duyệt.{' '}
            <button
              type="button"
              onClick={() => setTab('no-card')}
              className="font-bold underline underline-offset-2"
            >
              Xem danh sách
            </button>
          </p>
        </div>
      )}

      {loading ? (
        <div className="card p-12 text-center text-sm font-medium text-ink-500">
          Đang tải danh sách sinh viên…
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <UserRound className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-3 text-sm font-bold text-ink-700">Không có sinh viên phù hợp</p>
          <p className="mt-1 text-xs text-ink-400">Thử đổi từ khóa hoặc bộ lọc trạng thái.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user) => {
            const postCount = posts.filter((post) => post.owner_id === user.id).length;
            const dealCount = deals.filter((deal) => deal.owner_id === user.id).length;
            return (
              <div key={user.id} className="card p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex shrink-0 items-start gap-2">
                    <Avatar
                      size="md"
                      name={user.full_name}
                      src={user.avatar_url}
                      verified={user.is_verified}
                    />
                    {user.student_card_url ? (
                      <button
                        type="button"
                        onClick={() =>
                          setPreview({ url: user.student_card_url, name: user.full_name })
                        }
                        className="group relative overflow-hidden rounded-xl border border-brand-200/70"
                        aria-label={`Xem ảnh thẻ của ${user.full_name}`}
                      >
                        <StudentCardImage value={user.student_card_url} className="h-14 w-20" />
                        <span className="absolute inset-0 grid place-items-center bg-ink-900/0 text-white opacity-0 transition group-hover:bg-ink-900/40 group-hover:opacity-100">
                          <ZoomIn className="h-4 w-4" />
                        </span>
                      </button>
                    ) : (
                      <span
                        className="grid h-14 w-20 place-items-center rounded-xl border border-dashed border-amber-200 bg-amber-50 text-amber-500"
                        title="Chưa có ảnh thẻ sinh viên"
                      >
                        <ImageOff className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-extrabold text-ink-900">{user.full_name}</p>
                      {user.is_locked ? (
                        <span className="chip bg-rose-50 text-rose-700 ring-1 ring-rose-100">
                          <Lock className="h-3.5 w-3.5" /> Đã khóa
                        </span>
                      ) : user.is_verified ? (
                        <span className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                          <BadgeCheck className="h-3.5 w-3.5" /> Đã xác minh
                        </span>
                      ) : user.verification_status === 'pending' ? (
                        <span className="chip bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                          <Clock3 className="h-3.5 w-3.5" /> Chờ duyệt
                        </span>
                      ) : user.verification_status === 'rejected' ? (
                        <span className="chip bg-rose-50 text-rose-700 ring-1 ring-rose-100">
                          <ShieldX className="h-3.5 w-3.5" /> Bị từ chối
                        </span>
                      ) : (
                        <span className="chip bg-ink-100 text-ink-600 ring-1 ring-ink-200">
                          <ShieldCheck className="h-3.5 w-3.5" /> Chưa gửi
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-400">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {user.email}
                      </span>
                      <span>MSSV: {user.student_code || '—'}</span>
                      <span>{labelOf(user.campus)}</span>
                      <span>Tham gia {formatRelativeTime(user.created_at)}</span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold text-ink-500">
                      <span className="rounded-full bg-ink-50 px-2.5 py-1">{postCount} tin đăng</span>
                      <span className="rounded-full bg-ink-50 px-2.5 py-1">{dealCount} kèo</span>
                      {!user.student_card_url && (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                          Chưa có ảnh thẻ
                        </span>
                      )}
                      {user.is_locked && (
                        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-600">
                          Không thể đăng nhập
                        </span>
                      )}
                    </div>

                    {user.verification_note && (
                      <p className="mt-2 rounded-xl bg-ink-50 px-3 py-2 text-[11px] leading-relaxed text-ink-500">
                        <strong>Ghi chú admin:</strong> {user.verification_note}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2 sm:w-52 sm:flex-col">
                    {!user.is_verified && (
                      <button
                        type="button"
                        onClick={() => openAction('approve', user)}
                        className="btn-primary justify-center py-2 text-xs"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Duyệt hồ sơ
                      </button>
                    )}
                    {user.verification_status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => openAction('reject', user)}
                        className="btn-secondary justify-center py-2 text-xs text-rose-600"
                      >
                        <X className="h-3.5 w-3.5" />
                        Từ chối
                      </button>
                    )}
                    {user.is_verified && (
                      <button
                        type="button"
                        onClick={() => openAction('reject', user)}
                        className="btn-secondary justify-center py-2 text-xs text-rose-600"
                      >
                        <ShieldX className="h-3.5 w-3.5" />
                        Thu hồi xác minh
                      </button>
                    )}
                    {user.is_locked ? (
                      <button
                        type="button"
                        onClick={() => openAction('unlock', user)}
                        className="btn-secondary justify-center py-2 text-xs text-brand-700"
                      >
                        <LockOpen className="h-3.5 w-3.5" />
                        Mở khóa
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openAction('lock', user)}
                        className="btn-ghost justify-center py-2 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        Khóa tài khoản
                      </button>
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

            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-ink-50 p-3">
              <Avatar
                size="sm"
                name={action.user.full_name}
                src={action.user.avatar_url}
                verified={action.user.is_verified}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-ink-900">{action.user.full_name}</p>
                <p className="truncate text-[10px] text-ink-400">
                  {action.user.email} · {action.user.student_code || 'Chưa có MSSV'}
                </p>
              </div>
            </div>

            {action.user.student_card_url ? (
              <button
                type="button"
                onClick={() =>
                  setPreview({
                    url: action.user.student_card_url,
                    name: action.user.full_name,
                  })
                }
                className="mt-3 block w-full overflow-hidden rounded-2xl border border-brand-200/70"
                aria-label="Phóng to ảnh thẻ sinh viên"
              >
                <StudentCardImage
                  value={action.user.student_card_url}
                  className="max-h-52 w-full object-contain"
                />
              </button>
            ) : (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
                <ImageOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Sinh viên chưa tải ảnh thẻ. Hãy nhắc họ bổ sung trong Hồ sơ trước khi duyệt.
              </div>
            )}

            <label className="label mt-4">
              {action.type === 'reject' || action.type === 'lock'
                ? 'Lý do gửi cho sinh viên'
                : 'Ghi chú xử lý'}
            </label>
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

      {preview && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/80 p-4 backdrop-blur-sm"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-h-[90vh] max-w-[92vw]">
            <StudentCardImage
              value={preview.url}
              alt={`Ảnh thẻ sinh viên của ${preview.name}`}
              className="max-h-[85vh] max-w-[92vw] rounded-2xl object-contain shadow-card"
            />
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full bg-white text-ink-700 shadow-card"
              aria-label="Đóng ảnh"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="mt-2 text-center text-xs font-semibold text-white/90">{preview.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
