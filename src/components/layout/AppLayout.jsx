import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Wallet,
  ShoppingBag,
  UserRound,
  PiggyBank,
  Plus,
  Menu,
  X,
  Sparkles,
  LogOut,
  UsersRound,
  Flag,
  ShieldAlert,
  MapPin,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { isSupabaseConfigured } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import Avatar from '../ui/Avatar';
import NotificationBell from './NotificationBell';

const STUDENT_NAV = [
  { to: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/expenses', label: 'Chi tiêu', icon: Wallet },
  { to: '/marketplace', label: 'Chợ sinh viên', icon: Store },
  { to: '/deals', label: 'Gom đơn', icon: ShoppingBag },
  { to: '/profile', label: 'Hồ sơ', icon: UserRound },
];

const ADMIN_NAV = [
  { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/admin/students', label: 'Sinh viên', icon: UsersRound },
  { to: '/admin/posts', label: 'Bài đăng', icon: Store },
  { to: '/admin/reports', label: 'Tố cáo', icon: Flag },
  { to: '/admin/campuses', label: 'Khu vực', icon: MapPin },
  { to: '/profile', label: 'Hồ sơ', icon: UserRound },
];

function Logo({ compact = false, to = '/dashboard' }) {
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white">
        <PiggyBank className="h-4 w-4" strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-extrabold tracking-[-0.02em] text-ink-900">UniSave</span>
          <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-ink-400">
            Student finance
          </span>
        </span>
      )}
    </Link>
  );
}

function NavItem({ item, onClick }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-colors duration-150',
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              'h-[18px] w-[18px] shrink-0',
              isActive ? 'text-brand-600' : 'text-ink-400 group-hover:text-brand-600'
            )}
            strokeWidth={2}
          />
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function AppLayout({ children }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const currentUser = useCurrentUser();
  const demoMode = !isSupabaseConfigured();
  const isAdmin = currentUser.role === 'admin';
  const navItems = isAdmin ? ADMIN_NAV : STUDENT_NAV;
  const home = isAdmin ? '/admin' : '/dashboard';
  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    setOpen(false);
    try {
      await logout();
    } finally {
      navigate('/');
    }
  }

  if (isPublicPage) {
    return <>{children}</>;
  }

  const verificationStatus = currentUser.verification_status;
  const showVerificationBanner = !isAdmin && !currentUser.is_verified;

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-y-auto border-r border-brand-200/70 bg-white px-4 py-6 lg:flex">
        <div className="flex items-center justify-between gap-2">
          <Logo to={home} />
          <NotificationBell surface="desktop" />
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1.5">
          {isAdmin && (
            <p className="px-3.5 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">
              Quản trị hệ thống
            </p>
          )}
          {navItems.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </nav>
        <div className="rounded-2xl border border-brand-200 bg-brand-50/70 p-4">
          <div className="flex items-center gap-2 text-brand-700">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wide">
              {isAdmin ? 'Quy trình duyệt' : 'Mẹo tiết kiệm'}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-600">
            {isAdmin
              ? 'Kiểm tra MSSV và thẻ sinh viên trước khi duyệt. Tài khoản vi phạm có thể bị khóa và bài đăng bị gỡ.'
              : 'Ghi chi tiêu mỗi ngày để heo đất của bạn lớn nhanh hơn.'}
          </p>
        </div>

        <div className="mt-3 rounded-2xl border border-brand-200/60 bg-white p-3">
          <div className="flex items-center gap-2.5">
            <Avatar
              size="sm"
              name={currentUser.full_name}
              src={currentUser.avatar_url}
              verified={currentUser.is_verified}
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-xs font-bold text-ink-900">
                {currentUser.full_name}
                {isAdmin && (
                  <span className="rounded-full bg-ink-900 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                    Admin
                  </span>
                )}
              </p>
              <p className="truncate text-[10px] font-medium text-ink-400">
                {currentUser.email || (demoMode ? 'Tài khoản demo' : '')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-bold text-ink-500 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut className="h-3.5 w-3.5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="animate-in absolute inset-y-0 left-0 flex w-72 flex-col bg-white px-4 py-6 shadow-lg">
            <div className="flex items-center justify-between">
              <Logo to={home} />
              <button
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl text-ink-500 hover:bg-ink-100"
                aria-label="Đóng menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-8 flex flex-1 flex-col gap-1.5">
              {isAdmin && (
                <p className="px-3.5 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">
                  Quản trị hệ thống
                </p>
              )}
              {navItems.map((item) => (
                <NavItem key={item.to} item={item} onClick={() => setOpen(false)} />
              ))}
            </nav>

            <div className="mt-6 border-t border-ink-100 pt-4">
              <div className="flex items-center gap-2.5">
                <Avatar
                  size="sm"
                  name={currentUser.full_name}
                  src={currentUser.avatar_url}
                  verified={currentUser.is_verified}
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-xs font-bold text-ink-900">
                    {currentUser.full_name}
                    {isAdmin && (
                      <span className="rounded-full bg-ink-900 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                        Admin
                      </span>
                    )}
                  </p>
                  <p className="truncate text-[10px] font-medium text-ink-400">
                    {currentUser.email || (demoMode ? 'Tài khoản demo' : '')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-ink-50 px-3 py-2.5 text-xs font-bold text-ink-600 transition hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-brand-200/70 bg-ink-50/90 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-xl text-ink-600 hover:bg-ink-100"
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Logo to={home} />
          <div className="flex items-center gap-1">
            <NotificationBell surface="mobile" />
            <Link
              to={isAdmin ? '/admin/reports' : '/dashboard'}
              className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-soft"
              aria-label={isAdmin ? 'Tố cáo cần xử lý' : 'Thêm chi tiêu'}
            >
              {isAdmin ? <Flag className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
          {showVerificationBanner && (
            <div
              className={cn(
                'mb-5 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between',
                verificationStatus === 'rejected'
                  ? 'border-rose-200 bg-rose-50/80'
                  : 'border-amber-200 bg-amber-50/80'
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white shadow-soft',
                    verificationStatus === 'rejected' ? 'text-rose-600' : 'text-amber-600'
                  )}
                >
                  <ShieldAlert className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p
                    className={cn(
                      'text-sm font-bold',
                      verificationStatus === 'rejected' ? 'text-rose-900' : 'text-amber-900'
                    )}
                  >
                    {verificationStatus === 'rejected'
                      ? 'Yêu cầu xác minh sinh viên bị từ chối'
                      : verificationStatus === 'pending'
                        ? 'Hồ sơ đang chờ quản trị viên duyệt'
                        : 'Bạn chưa xác minh sinh viên'}
                  </p>
                  <p
                    className={cn(
                      'mt-0.5 text-xs leading-relaxed',
                      verificationStatus === 'rejected' ? 'text-rose-700/80' : 'text-amber-800/80'
                    )}
                  >
                    {currentUser.verification_note ||
                      'Bạn vẫn xem được chợ và kèo gom đơn, nhưng cần được duyệt để đăng bài và tạo kèo.'}
                  </p>
                </div>
              </div>
              <Link
                to="/profile"
                className="btn-secondary shrink-0 justify-center py-2.5 text-xs"
              >
                Xem hồ sơ
              </Link>
            </div>
          )}

          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-brand-200/70 bg-ink-50/95 px-2 pb-2 pt-1.5 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-md items-center justify-around">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-semibold transition-colors',
                    active ? 'text-brand-600' : 'text-ink-400'
                  )}
                >
                  <span
                    className={cn(
                      'grid h-9 w-9 place-items-center rounded-xl transition-all',
                      active ? 'bg-brand-50 text-brand-600' : 'text-ink-400'
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
