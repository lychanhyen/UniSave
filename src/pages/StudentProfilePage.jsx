import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Flag,
  GraduationCap,
  Store,
  Ticket,
  UserRound,
} from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import EmptyState from '../components/ui/EmptyState';
import { usePublicProfile } from '../hooks/usePublicProfile';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { POST_CATEGORY_MAP } from '../lib/constants';
import { cn, formatCurrency, formatDate, isPostExpired } from '../lib/utils';

function StatCard({ icon: Icon, label, value, hint, tone = 'brand' }) {
  const tones = {
    brand: 'border-brand-200 bg-brand-50/60 text-brand-700',
    amber: 'border-amber-200 bg-amber-50/70 text-amber-700',
    ink: 'border-ink-200 bg-ink-50 text-ink-700',
  };
  return (
    <div className={cn('rounded-2xl border-2 px-4 py-4', tones[tone])}>
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/80">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.1em]">{label}</span>
      </div>
      <p className="mt-2 text-[26px] font-extrabold leading-none tabular-nums">{value}</p>
      {hint && <p className="mt-1.5 text-[11px] font-medium opacity-80">{hint}</p>}
    </div>
  );
}

export default function StudentProfilePage() {
  const { id } = useParams();
  const currentUser = useCurrentUser();
  const { profile, stats, posts, deals, loading, error } = usePublicProfile(id);
  const isSelf = profile?.id && currentUser?.id === profile.id;

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="card p-12 text-center text-sm font-medium text-ink-500">
          Đang tải trang cá nhân…
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card">
          <EmptyState
            icon={UserRound}
            title="Không tìm thấy sinh viên này"
            description={error || 'Đường dẫn có thể sai hoặc tài khoản đã bị xoá.'}
            action={
              <Link to="/marketplace" className="btn-primary">
                Về chợ sinh viên
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const joined = profile.created_at ? formatDate(profile.created_at) : '';
  const roleLabel = profile.role === 'admin' ? 'Quản trị viên' : 'Sinh viên';

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        to="/marketplace"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </Link>

      {/* ------------------------------------------------------------ Thẻ hồ sơ */}
      <section className="card-strong animate-in px-5 py-6 sm:px-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar src={profile.avatar_url} name={profile.full_name} size="xl" verified={profile.is_verified} />
            <div className="min-w-0">
              <h1 className="flex flex-wrap items-center gap-2 text-[1.5rem] font-extrabold leading-tight tracking-[-0.03em] text-ink-900 sm:text-[1.75rem]">
                {profile.full_name || 'Sinh viên UniSave'}
                {profile.is_verified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-brand-300 bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                    <BadgeCheck className="h-3 w-3" />
                    Đã xác minh
                  </span>
                )}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] font-semibold text-ink-500">
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-brand-600" />
                  {profile.campus || 'Chưa cập nhật trường'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <UserRound className="h-3.5 w-3.5 text-brand-600" />
                  {roleLabel}
                </span>
                {joined && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-brand-600" />
                    Tham gia {joined}
                  </span>
                )}
              </div>
            </div>
          </div>

          {isSelf && (
            <Link to="/profile" className="btn-secondary shrink-0 py-2 text-xs">
              Chỉnh sửa hồ sơ
            </Link>
          )}
        </div>

        {/* ---------------------------------------------------------- Số liệu */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatCard
            icon={Store}
            label="Tin đã đăng"
            value={stats?.posts_total ?? 0}
            hint={`${stats?.posts_active ?? 0} đang bán · ${stats?.posts_sold ?? 0} đã bán`}
          />
          <StatCard
            icon={Ticket}
            label="Kèo đã đăng"
            value={stats?.deals_total ?? 0}
            hint="Kèo gom đơn làm người tạo"
            tone="ink"
          />
          <StatCard
            icon={Flag}
            label="Báo cáo đã nhận"
            value={stats?.reports_received ?? 0}
            hint="Gồm báo cáo trên tài khoản, tin và kèo của họ"
            tone={stats?.reports_received > 0 ? 'amber' : 'brand'}
          />
        </div>
      </section>

      {/* ------------------------------------------------------- Tin và kèo gần đây */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="card-strong px-5 py-5">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="section-title">Tin gần đây</h2>
            <Link to="/marketplace" className="text-[11px] font-bold text-brand-700 hover:text-brand-800">
              Xem chợ
            </Link>
          </div>

          {posts.length === 0 ? (
            <p className="rounded-xl bg-ink-50 px-3 py-6 text-center text-[13px] font-medium text-ink-400">
              Chưa đăng tin nào.
            </p>
          ) : (
            <ul className="space-y-2">
              {posts.map((post) => {
                const expired = isPostExpired(post);
                return (
                  <li key={post.id}>
                    <Link
                      to={`/marketplace/${post.id}`}
                      className="flex items-center gap-3 rounded-xl border border-brand-200/60 px-2.5 py-2 transition hover:border-brand-300 hover:bg-brand-50/50"
                    >
                      <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                        {post.images?.[0] ? (
                          <img src={post.images[0]} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-bold text-ink-900">
                          {post.title}
                        </span>
                        <span className="block truncate text-[11px] text-ink-500">
                          {POST_CATEGORY_MAP[post.category]?.label || 'Khác'} · {formatCurrency(post.price)}
                        </span>
                      </span>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                          post.status === 'sold'
                            ? 'bg-ink-100 text-ink-600'
                            : expired
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-brand-50 text-brand-700'
                        )}
                      >
                        {post.status === 'sold' ? 'Đã bán' : expired ? 'Hết hạn' : 'Đang bán'}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card-strong px-5 py-5">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="section-title">Kèo gần đây</h2>
            <Link to="/deals" className="text-[11px] font-bold text-brand-700 hover:text-brand-800">
              Xem kèo
            </Link>
          </div>

          {deals.length === 0 ? (
            <p className="rounded-xl bg-ink-50 px-3 py-6 text-center text-[13px] font-medium text-ink-400">
              Chưa tạo kèo gom đơn nào.
            </p>
          ) : (
            <ul className="space-y-2">
              {deals.map((deal) => (
                <li key={deal.id}>
                  <Link
                    to={`/deals/${deal.id}`}
                    className="flex items-center gap-3 rounded-xl border border-brand-200/60 px-2.5 py-2 transition hover:border-brand-300 hover:bg-brand-50/50"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                      <Ticket className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-bold text-ink-900">
                        {deal.title}
                      </span>
                      <span className="block truncate text-[11px] text-ink-500">
                        {formatCurrency(deal.deal_price)}
                        {deal.original_price
                          ? ` · gốc ${formatCurrency(deal.original_price)}`
                          : ''}
                        {deal.deadline ? ` · hạn ${formatDate(deal.deadline)}` : ''}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="mt-5 rounded-2xl border border-brand-200/60 bg-brand-50/50 px-4 py-3 text-[11px] leading-relaxed text-ink-500">
        Số liệu được tổng hợp từ hoạt động trên UniSave. Báo cáo đã nhận chỉ hiển thị số lượng, không
        công khai người báo cáo hay nội dung báo cáo.
      </p>
    </div>
  );
}
