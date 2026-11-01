import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Flag,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Store,
  UsersRound,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Avatar from '../../components/ui/Avatar';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { useReports } from '../../hooks/useReports';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useDeals } from '../../hooks/useDeals';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { formatRelativeTime } from '../../lib/utils';

export default function AdminDashboardPage() {
  const admin = useCurrentUser();
  const { users, pendingCount, verifiedCount, lockedCount } = useAdminUsers();
  const { reports, openCount } = useReports();
  const { posts } = useMarketplace();
  const { deals } = useDeals();

  const pending = users.filter((user) => user.verification_status === 'pending').slice(0, 4);
  const recentReports = reports.filter((report) => report.status === 'open').slice(0, 4);

  const cards = [
    {
      label: 'Chờ duyệt',
      value: pendingCount,
      icon: UsersRound,
      tone: 'bg-amber-50 text-amber-600',
      to: '/admin/students',
    },
    {
      label: 'Đã xác minh',
      value: verifiedCount,
      icon: BadgeCheck,
      tone: 'bg-brand-50 text-brand-600',
      to: '/admin/students',
    },
    {
      label: 'Tài khoản bị khóa',
      value: lockedCount,
      icon: Lock,
      tone: 'bg-rose-50 text-rose-600',
      to: '/admin/students',
    },
    {
      label: 'Tố cáo chờ xử lý',
      value: openCount,
      icon: Flag,
      tone: 'bg-rose-50 text-rose-600',
      to: '/admin/reports',
    },
    {
      label: 'Bài đăng',
      value: posts.length,
      icon: Store,
      tone: 'bg-blue-50 text-blue-600',
      to: '/admin/posts',
    },
    {
      label: 'Kèo gom đơn',
      value: deals.length,
      icon: ShoppingBag,
      tone: 'bg-violet-50 text-violet-600',
      to: '/deals',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Quản trị hệ thống"
        title={`Xin chào, ${admin.full_name || 'quản trị viên'}`}
        subtitle="Duyệt sinh viên, kiểm tra bài đăng và xử lý tố cáo để giữ cộng đồng an toàn."
      />

      <div className="mb-6 flex flex-col gap-3 rounded-3xl bg-ink-900 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10">
            <ShieldCheck className="h-4 w-4 text-white/70" />
          </span>
          <div>
            <p className="text-[13px] font-bold">Nguyên tắc duyệt hồ sơ</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-white/60">
              Đối chiếu họ tên, MSSV và ảnh thẻ sinh viên. Chỉ duyệt khi thông tin khớp; từ chối kèm
              lý do rõ ràng để sinh viên gửi lại.
            </p>
          </div>
        </div>
        <Link
          to="/admin/students"
          className="btn bg-white px-4 py-2.5 text-xs font-bold text-ink-900 hover:bg-brand-50"
        >
          Duyệt ngay
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, tone, to }) => (
          <Link
            key={label}
            to={to}
            className="card card-hover flex items-center gap-4 p-4"
          >
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${tone}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-extrabold tracking-tight text-ink-900">{value}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                {label}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-ink-300" />
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
                Hồ sơ mới
              </p>
              <h2 className="mt-1 text-lg font-extrabold tracking-tight text-ink-900">
                Sinh viên chờ duyệt
              </h2>
            </div>
            <Link to="/admin/students" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              Xem tất cả
            </Link>
          </div>

          {pending.length === 0 ? (
            <p className="mt-5 rounded-2xl bg-ink-50 px-4 py-6 text-center text-xs text-ink-400">
              Không có hồ sơ nào đang chờ duyệt.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {pending.map((user) => (
                <li key={user.id}>
                  <Link
                    to="/admin/students"
                    className="flex items-center gap-3 rounded-2xl border border-brand-200/60 p-3 transition hover:border-brand-200 hover:bg-brand-50/40"
                  >
                    <Avatar size="sm" name={user.full_name} src={user.avatar_url} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-ink-900">{user.full_name}</p>
                      <p className="truncate text-[10px] text-ink-400">
                        {user.student_code || 'Chưa có MSSV'} · {user.email}
                      </p>
                    </div>
                    {!user.student_card_url && (
                      <span className="chip bg-rose-50 text-rose-600 ring-1 ring-rose-100">
                        Thiếu ảnh thẻ
                      </span>
                    )}
                    <span className="chip bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                      Chờ duyệt
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-rose-600">
                An toàn cộng đồng
              </p>
              <h2 className="mt-1 text-lg font-extrabold tracking-tight text-ink-900">
                Tố cáo chờ xử lý
              </h2>
            </div>
            <Link to="/admin/reports" className="text-xs font-bold text-rose-600 hover:text-rose-700">
              Xem tất cả
            </Link>
          </div>

          {recentReports.length === 0 ? (
            <p className="mt-5 rounded-2xl bg-ink-50 px-4 py-6 text-center text-xs text-ink-400">
              Không có tố cáo nào đang chờ.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {recentReports.map((report) => (
                <li key={report.id}>
                  <Link
                    to="/admin/reports"
                    className="flex items-start gap-3 rounded-2xl border border-brand-200/60 p-3 transition hover:border-rose-200 hover:bg-rose-50/40"
                  >
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600">
                      <Flag className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-ink-900">{report.reason}</p>
                      <p className="truncate text-[10px] text-ink-400">
                        {report.target_label} · {formatRelativeTime(report.created_at)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
