import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UserRound,
  GraduationCap,
  Mail,
  Camera,
  LogOut,
  ShieldCheck,
  Save,
  Clock3,
  XCircle,
  CheckCircle2,
  LayoutDashboard,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import VerifiedBadge from '../components/ui/VerifiedBadge';
import PageHeader from '../components/ui/PageHeader';
import StudentCardUpload from '../components/verification/StudentCardUpload';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useMarketplace } from '../hooks/useMarketplace';
import { useDeals } from '../hooks/useDeals';
import { requestVerification, updateOwnProfile, uploadStudentCard } from '../lib/api';
import { useCampuses } from '../context/CampusContext';

export default function ProfilePage() {
  const { logout, refreshUser, demoMode } = useAuth();
  const navigate = useNavigate();
  const profile = useCurrentUser();
  const { posts } = useMarketplace();
  const { deals } = useDeals();
  const { labelOf } = useCampuses();
  const [fullName, setFullName] = useState(profile.full_name || 'Sinh viên');
  const [mssv, setMssv] = useState(profile.student_code || '');
  const [saving, setSaving] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [cardSaving, setCardSaving] = useState(false);

  const stats = useMemo(() => {
    const ownerId = profile.id;
    return {
      posts: posts.filter((p) => p.owner_id === ownerId).length,
      deals: deals.filter((d) => d.owner_id === ownerId).length,
    };
  }, [profile.id, posts, deals]);

  const status = profile.verification_status;
  const isPending = status === 'pending';
  const isRejected = status === 'rejected';
  const isApproved = profile.is_verified;

  async function handleSave(e) {
    e.preventDefault();
    const name = fullName.trim();
    if (name.length < 2) {
      toast.error('Họ tên cần ít nhất 2 ký tự');
      return;
    }
    setSaving(true);
    try {
      const patch =
        profile.role === 'admin'
          ? { full_name: name }
          : { full_name: name, student_code: mssv.trim() };
      await updateOwnProfile(profile.id, patch);
      await refreshUser();
      toast.success('Đã lưu thông tin cá nhân');
    } catch (error) {
      toast.error(`Không lưu được thông tin: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleCardChange(dataUrl) {
    setCardSaving(true);
    try {
      const stored = dataUrl ? await uploadStudentCard(profile.id, dataUrl) : '';
      await updateOwnProfile(profile.id, { student_card_url: stored });
      await refreshUser();
      toast.success(dataUrl ? 'Đã lưu ảnh thẻ sinh viên.' : 'Đã xóa ảnh thẻ sinh viên.');
    } catch (error) {
      toast.error(error.message || 'Không lưu được ảnh thẻ sinh viên.');
    } finally {
      setCardSaving(false);
    }
  }

  async function handleRequestVerification() {
    if (!profile.student_card_url) {
      toast.error('Vui lòng tải ảnh thẻ sinh viên trước khi gửi yêu cầu xác minh.');
      return;
    }
    setRequesting(true);
    try {
      await requestVerification(profile.id);
      await refreshUser();
      toast.success('Đã gửi yêu cầu xác minh tới quản trị viên.');
    } catch (error) {
      toast.error(error.message || 'Không gửi được yêu cầu xác minh.');
    } finally {
      setRequesting(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate('/');
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Cá nhân"
        title="Hồ sơ của bạn"
        subtitle="Cập nhật thông tin và theo dõi trạng thái xác minh sinh viên do quản trị viên duyệt."
      />

      <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
        {/* Identity card */}
        <div className="card flex flex-col items-center p-6 text-center">
          <div className="relative">
            <Avatar
              size="xl"
              name={fullName}
              src={profile.avatar_url}
              verified={isApproved}
            />
            <button
              type="button"
              className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-glow transition hover:bg-brand-700"
              aria-label="Đổi ảnh đại diện"
              onClick={() => toast('Tính năng tải ảnh sẽ mở khi cấu hình Supabase Storage')}
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mt-4 text-lg font-extrabold tracking-tight text-ink-900">{fullName}</h2>
          <p className="mt-1 text-xs text-ink-400">{profile.email || 'Chưa cập nhật email'}</p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
            <span
              className={`chip ${
                profile.role === 'admin'
                  ? 'bg-ink-900 text-white'
                  : 'bg-ink-100 text-ink-600'
              }`}
            >
              {profile.role === 'admin' ? 'Quản trị viên' : 'Sinh viên'}
            </span>
            <span className="chip bg-ink-50 text-ink-500">
              {labelOf(profile.campus)}
            </span>
          </div>

          <div className="mt-3">
            {isApproved ? (
              <VerifiedBadge label="Đã xác minh sinh viên" />
            ) : isPending ? (
              <span className="chip bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                <Clock3 className="h-3.5 w-3.5" /> Chờ duyệt
              </span>
            ) : isRejected ? (
              <span className="chip bg-rose-50 text-rose-700 ring-1 ring-rose-100">
                <XCircle className="h-3.5 w-3.5" /> Bị từ chối
              </span>
            ) : (
              <span className="chip bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                <ShieldCheck className="h-3.5 w-3.5" /> Chưa xác thực
              </span>
            )}
          </div>

          {profile.role === 'admin' && (
            <Link to="/admin" className="btn-secondary mt-4 w-full py-2.5 text-xs">
              <LayoutDashboard className="h-4 w-4" />
              Mở trang quản trị
            </Link>
          )}

          <Button
            variant="secondary"
            className="mt-3 w-full"
            onClick={handleLogout}
            icon={LogOut}
          >
            Đăng xuất
          </Button>

          <div className="mt-5 grid w-full grid-cols-2 gap-3">
            <div className="rounded-2xl bg-ink-50 p-3 text-center">
              <p className="text-lg font-extrabold tracking-tight text-ink-900">{stats.posts}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                Tin đăng
              </p>
            </div>
            <div className="rounded-2xl bg-ink-50 p-3 text-center">
              <p className="text-lg font-extrabold tracking-tight text-ink-900">{stats.deals}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                Kèo gom đơn
              </p>
            </div>
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-ink-400">
            {demoMode ? 'Tài khoản demo · ' : ''}
            Thành viên UniSave từ tháng 10/2026
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="card p-5 sm:p-6">
          <h3 className="section-title mb-5">Thông tin cá nhân</h3>

          <Input
            label="Họ và tên"
            icon={UserRound}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          {profile.role === 'admin' ? (
            <div className="mb-4 rounded-xl bg-ink-50 px-3 py-2.5 text-[11px] leading-relaxed text-ink-500">
              Tài khoản quản trị viên không cần mã số sinh viên. Quyền quản trị được gắn với
              email đăng nhập.
            </div>
          ) : (
            <Input
              label="Mã số sinh viên"
              icon={GraduationCap}
              value={mssv}
              onChange={(e) => setMssv(e.target.value)}
              placeholder="Ví dụ: 12345678"
            />
          )}
          <Input
            label="Email"
            icon={Mail}
            value={profile.email || ''}
            disabled
            hint={
              demoMode
                ? 'Tài khoản demo: email mẫu, sẽ thay bằng email thật khi đăng nhập Supabase.'
                : 'Email không thể thay đổi sau khi đăng ký.'
            }
          />

          {/* Verification status */}
          {profile.role !== 'admin' && (
            <div
              className={`mb-5 rounded-2xl border p-4 ${
                isApproved
                  ? 'border-brand-100 bg-brand-50/70'
                  : isRejected
                    ? 'border-rose-100 bg-rose-50/70'
                    : 'border-amber-100 bg-amber-50/70'
              }`}
            >
              <div className="flex items-center gap-2">
                {isApproved ? (
                  <CheckCircle2 className="h-4 w-4 text-brand-600" />
                ) : isRejected ? (
                  <XCircle className="h-4 w-4 text-rose-600" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                )}
                <span className="text-sm font-semibold text-ink-800">
                  {isApproved
                    ? 'Đã xác minh sinh viên'
                    : isPending
                      ? 'Đang chờ quản trị viên duyệt'
                      : isRejected
                        ? 'Yêu cầu xác minh bị từ chối'
                        : 'Xác thực thẻ sinh viên'}
                </span>
              </div>

              <p className="mt-1 text-xs leading-relaxed text-ink-500">
                {isApproved
                  ? 'Huy hiệu xác minh đã được gắn vào hồ sơ, tin đăng và kèo gom đơn của bạn.'
                  : isPending
                    ? 'Quản trị viên sẽ đối chiếu MSSV và ảnh thẻ sinh viên. Bạn sẽ nhận thông báo khi có kết quả.'
                    : isRejected
                      ? 'Hồ sơ chưa đạt yêu cầu. Kiểm tra lại thông tin rồi gửi lại yêu cầu.'
                      : 'Tải ảnh thẻ sinh viên rồi gửi yêu cầu để quản trị viên kiểm tra. Sau khi duyệt, bạn mới có thể đăng bài và tạo kèo.'}
              </p>

              {isRejected && profile.verification_note && (
                <p className="mt-2 rounded-xl bg-white/80 px-3 py-2 text-xs leading-relaxed text-rose-700">
                  Lý do: {profile.verification_note}
                </p>
              )}

              <div className="mt-3">
                <StudentCardUpload
                  value={profile.student_card_url}
                  onChange={handleCardChange}
                  disabled={cardSaving}
                  compact
                />
              </div>

              {!isApproved && !isPending && (
                <button
                  type="button"
                  onClick={handleRequestVerification}
                  disabled={requesting}
                  className="btn-primary mt-3 w-full py-2.5 text-xs"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {requesting ? 'Đang gửi…' : 'Gửi yêu cầu xác minh'}
                </button>
              )}

              {!isApproved && !isPending && !profile.student_card_url && (
                <p className="mt-2 text-[11px] font-semibold text-rose-600">
                  Cần tải ảnh thẻ sinh viên trước khi gửi yêu cầu.
                </p>
              )}

              {isPending && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
                  <Clock3 className="h-3.5 w-3.5" />
                  Hồ sơ đã được gửi, vui lòng chờ duyệt.
                </p>
              )}
            </div>
          )}

          <Button type="submit" loading={saving} icon={Save} className="w-full">
            Lưu thay đổi
          </Button>
        </form>
      </div>
    </div>
  );
}
