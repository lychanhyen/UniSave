import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BadgeCheck,
  Check,
  CheckCircle2,
  ExternalLink,
  Flag,
  Lock,
  Search,
  ShieldAlert,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/ui/PageHeader';
import Avatar from '../../components/ui/Avatar';
import { useReports } from '../../hooks/useReports';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { sendUserNotification } from '../../lib/api';
import { cn, formatRelativeTime } from '../../lib/utils';

const TABS = [
  { value: 'open', label: 'Chờ xử lý' },
  { value: 'resolved', label: 'Đã xử lý' },
  { value: 'dismissed', label: 'Đã bỏ qua' },
  { value: 'all', label: 'Tất cả' },
];

const ACTIONS = [
  {
    value: 'none',
    label: 'Chỉ nhắc nhở',
    description: 'Giữ nguyên bài đăng và tài khoản, gửi thông báo nhắc nhở.',
  },
  {
    value: 'remove_post',
    label: 'Gỡ bài đăng',
    description: 'Xóa tin đăng khỏi chợ sinh viên và thông báo cho người đăng.',
  },
  {
    value: 'lock_user',
    label: 'Khóa tài khoản',
    description: 'Khóa tài khoản bị tố cáo nếu xác định sai phạm.',
  },
  {
    value: 'remove_and_lock',
    label: 'Gỡ bài + khóa tài khoản',
    description: 'Áp dụng cả hai biện pháp với vi phạm nghiêm trọng.',
  },
];

function statusChip(status) {
  if (status === 'resolved') {
    return (
      <span className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-100">
        <CheckCircle2 className="h-3.5 w-3.5" /> Đã xử lý
      </span>
    );
  }
  if (status === 'dismissed') {
    return (
      <span className="chip bg-ink-100 text-ink-600 ring-1 ring-ink-200">
        <X className="h-3.5 w-3.5" /> Đã bỏ qua
      </span>
    );
  }
  return (
    <span className="chip bg-amber-50 text-amber-700 ring-1 ring-amber-100">
      <ShieldAlert className="h-3.5 w-3.5" /> Chờ xử lý
    </span>
  );
}

export default function AdminReportsPage() {
  const { reports, loading, resolve, openCount } = useReports();
  const { posts, removePost } = useMarketplace();
  const { users, lock, unlock } = useAdminUsers();
  const [tab, setTab] = useState('open');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null);
  const [action, setAction] = useState('none');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const counts = useMemo(
    () => ({
      all: reports.length,
      open: reports.filter((report) => report.status === 'open').length,
      resolved: reports.filter((report) => report.status === 'resolved').length,
      dismissed: reports.filter((report) => report.status === 'dismissed').length,
    }),
    [reports]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter((report) => {
      if (tab !== 'all' && report.status !== tab) return false;
      if (!q) return true;
      return `${report.reason} ${report.details} ${report.target_label} ${report.reporter_name}`
        .toLowerCase()
        .includes(q);
    });
  }, [reports, tab, query]);

  function targetOwner(report) {
    if (report.target_type === 'user') {
      return users.find((user) => user.id === report.target_id) || null;
    }
    const post = posts.find((item) => item.id === report.target_id);
    if (!post) return null;
    return users.find((user) => user.id === post.owner_id) || null;
  }

  function targetPost(report) {
    if (report.target_type !== 'post') return null;
    return posts.find((item) => item.id === report.target_id) || null;
  }

  function openResolve(report) {
    setModal(report);
    setAction('none');
    setNote(
      report.status === 'open'
        ? 'Đã kiểm tra thông tin và xử lý theo quy định cộng đồng UniSave.'
        : report.admin_note || ''
    );
  }

  async function handleResolve(status) {
    if (!modal) return;
    if (note.trim().length < 5) {
      toast.error('Vui lòng nhập ghi chú xử lý (ít nhất 5 ký tự).');
      return;
    }
    const owner = targetOwner(modal);
    const post = targetPost(modal);
    const shouldRemove = action === 'remove_post' || action === 'remove_and_lock';
    const shouldLock = action === 'lock_user' || action === 'remove_and_lock';

    if (shouldRemove && !post) {
      toast.error('Bài đăng không còn tồn tại, chỉ có thể cập nhật trạng thái tố cáo.');
      return;
    }
    if (shouldLock && !owner) {
      toast.error('Không tìm thấy tài khoản bị tố cáo để khóa.');
      return;
    }

    setSubmitting(true);
    try {
      if (shouldRemove && post) {
        await removePost(post.id);
        await sendUserNotification(post.owner_id, {
          type: 'system',
          title: 'Bài đăng của bạn đã bị gỡ',
          body: `“${post.title}” đã bị gỡ sau khi xem xét tố cáo. Lý do: ${note.trim()}`,
          link: '/marketplace',
        });
      }
      if (shouldLock && owner) {
        await lock(owner.id, note.trim());
      }

      await resolve(modal.id, {
        status,
        admin_note: note.trim(),
        action_taken: action,
      });
      toast.success(
        status === 'resolved' ? 'Đã xử lý tố cáo và thông báo cho người tố cáo.' : 'Đã bỏ qua tố cáo.'
      );
      setModal(null);
    } catch (error) {
      toast.error(error.message || 'Không xử lý được tố cáo.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUnlock(report) {
    const owner = targetOwner(report);
    if (!owner) {
      toast.error('Không tìm thấy tài khoản để mở khóa.');
      return;
    }
    try {
      await unlock(owner.id, 'Đã xem xét lại và mở khóa tài khoản.');
      toast.success('Đã mở khóa tài khoản.');
    } catch (error) {
      toast.error(error.message || 'Không mở khóa được tài khoản.');
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Quản trị · An toàn cộng đồng"
        title="Tố cáo tin đăng & người dùng"
        subtitle="Xem xét bằng chứng, gỡ nội dung vi phạm và khóa tài khoản khi cần thiết."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Tổng tố cáo', value: counts.all, tone: 'text-ink-900' },
          { label: 'Chờ xử lý', value: openCount, tone: 'text-amber-600' },
          { label: 'Đã xử lý', value: counts.resolved, tone: 'text-brand-700' },
          { label: 'Đã bỏ qua', value: counts.dismissed, tone: 'text-ink-500' },
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
            placeholder="Tìm theo lý do, nội dung hoặc người tố cáo…"
            className="input pl-11 pr-10"
            aria-label="Tìm tố cáo"
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

      {loading ? (
        <div className="card p-12 text-center text-sm font-medium text-ink-500">
          Đang tải tố cáo…
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Flag className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-3 text-sm font-bold text-ink-700">Không có tố cáo phù hợp</p>
          <p className="mt-1 text-xs text-ink-400">Cộng đồng đang yên bình, không có gì cần xử lý.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => {
            const post = targetPost(report);
            const owner = targetOwner(report);
            return (
              <div key={report.id} className="card p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose-50 text-rose-600">
                    <Flag className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-extrabold text-ink-900">{report.reason}</p>
                      {statusChip(report.status)}
                      <span className="chip bg-ink-50 text-ink-500">
                        {report.target_type === 'post' ? 'Tin đăng' : 'Người dùng'}
                      </span>
                    </div>

                    <div className="mt-2 rounded-xl bg-ink-50 px-3 py-2">
                      <p className="text-[11px] font-semibold text-ink-700">
                        {report.target_type === 'post' ? 'Tin bị tố cáo: ' : 'Người bị tố cáo: '}
                        {post ? (
                          <Link
                            to={`/marketplace/${post.id}`}
                            className="text-brand-700 underline-offset-2 hover:underline"
                          >
                            {post.title}
                          </Link>
                        ) : (
                          report.target_label || report.target_id
                        )}
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
                        {report.details}
                      </p>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-400">
                      <span className="inline-flex items-center gap-1.5">
                        <UserRound className="h-3.5 w-3.5" />
                        Người tố cáo: <strong className="text-ink-600">{report.reporter_name}</strong>
                      </span>
                      <span>{formatRelativeTime(report.created_at)}</span>
                      {owner && (
                        <span className="inline-flex items-center gap-1.5">
                          <Avatar size="sm" name={owner.full_name} src={owner.avatar_url} />
                          <span className="font-semibold text-ink-600">{owner.full_name}</span>
                          {owner.is_verified && <BadgeCheck className="h-3.5 w-3.5 text-brand-600" />}
                          {owner.is_locked && (
                            <span className="chip bg-rose-50 text-rose-700 ring-1 ring-rose-100">
                              <Lock className="h-3 w-3" /> Đang bị khóa
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    {report.admin_note && (
                      <p className="mt-2 rounded-xl bg-brand-50/70 px-3 py-2 text-[11px] leading-relaxed text-brand-800">
                        <strong>Ghi chú xử lý:</strong> {report.admin_note}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2 sm:w-44 sm:flex-col">
                    {report.status === 'open' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => openResolve(report)}
                          className="btn-primary justify-center py-2 text-xs"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Xử lý tố cáo
                        </button>
                        <button
                          type="button"
                          onClick={() => openResolve(report)}
                          className="btn-secondary justify-center py-2 text-xs"
                        >
                          <X className="h-3.5 w-3.5" />
                          Bỏ qua
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openResolve(report)}
                        className="btn-secondary justify-center py-2 text-xs"
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Xem lại / cập nhật
                      </button>
                    )}
                    {owner?.is_locked && (
                      <button
                        type="button"
                        onClick={() => handleUnlock(report)}
                        className="btn-ghost justify-center py-2 text-xs text-brand-700"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        Mở khóa tài khoản
                      </button>
                    )}
                    {post && (
                      <Link
                        to={`/marketplace/${post.id}`}
                        className="btn-ghost justify-center py-2 text-xs"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Xem tin đăng
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
            onClick={() => !submitting && setModal(null)}
          />
          <div className="animate-in relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-ink-900">Xử lý tố cáo</p>
                <p className="mt-0.5 text-[11px] text-ink-400">
                  Chọn biện pháp phù hợp và ghi chú để lưu lại lịch sử.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !submitting && setModal(null)}
                className="grid h-8 w-8 place-items-center rounded-xl text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 rounded-2xl bg-ink-50 p-3">
              <p className="text-xs font-bold text-ink-900">{modal.reason}</p>
              <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-ink-500">
                {modal.details}
              </p>
              <p className="mt-2 text-[10px] font-semibold text-ink-400">
                {modal.target_type === 'post' ? 'Tin đăng' : 'Người dùng'}:{' '}
                {modal.target_label || modal.target_id}
              </p>
            </div>

            <label className="label mt-4">Biện pháp xử lý</label>
            <div className="space-y-2">
              {ACTIONS.map((item) => (
                <label
                  key={item.value}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition',
                    action === item.value
                      ? 'border-brand-300 bg-brand-50/60'
                      : 'border-ink-200 hover:border-ink-300'
                  )}
                >
                  <input
                    type="radio"
                    name="report-action"
                    value={item.value}
                    checked={action === item.value}
                    onChange={() => setAction(item.value)}
                    className="mt-0.5 h-4 w-4 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-ink-900">{item.label}</span>
                    <span className="mt-0.5 block text-[10px] leading-relaxed text-ink-500">
                      {item.description}
                    </span>
                  </span>
                  {item.value === 'remove_and_lock' && (
                    <Trash2 className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                  )}
                </label>
              ))}
            </div>

            <label className="label mt-4">Ghi chú xử lý</label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input resize-none"
              maxLength={400}
            />

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => handleResolve('dismissed')}
                disabled={submitting}
                className="btn-secondary flex-1 justify-center py-2.5"
              >
                Bỏ qua tố cáo
              </button>
              <button
                type="button"
                onClick={() => handleResolve('resolved')}
                disabled={submitting}
                className="btn-primary flex-1 justify-center py-2.5"
              >
                {submitting ? 'Đang xử lý…' : 'Xác nhận xử lý'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
