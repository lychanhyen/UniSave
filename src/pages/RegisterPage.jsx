import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  UserRound,
  GraduationCap,
  ArrowRight,
  PiggyBank,
  Check,
  ShieldCheck,
  ShieldPlus,
  KeyRound,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCampuses } from '../context/CampusContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import StudentCardUpload from '../components/verification/StudentCardUpload';

const DEMO_ADMIN_INVITE = 'UNISAVE-ADMIN';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, demoMode } = useAuth();
  const { active: campusOptions } = useCampuses();
  const [role, setRole] = useState('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mssv, setMssv] = useState('');
  const [campus, setCampus] = useState(() => campusOptions[0]?.value || 'khac');
  const [studentCard, setStudentCard] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Danh sách khu vực có thể thay đổi sau khi tải xong (hoặc admin vừa sửa):
  // nếu lựa chọn hiện tại không còn, quay về khu vực đầu tiên đang hoạt động.
  const selectedCampus = campusOptions.some((item) => item.value === campus)
    ? campus
    : campusOptions[0]?.value || 'khac';

  const isAdmin = role === 'admin';

  async function handleSubmit(e) {
    e.preventDefault();
    if (isAdmin && !demoMode) {
      toast.error('Tài khoản quản trị được tạo bằng SQL trong Supabase. Xem supabase/README.md.');
      return;
    }
    setLoading(true);
    try {
      const result = await register({
        fullName,
        email,
        password,
        studentCode: isAdmin ? '' : mssv.trim(),
        campus: isAdmin ? 'khac' : selectedCampus,
        role,
        studentCardUrl: isAdmin ? '' : studentCard,
        inviteCode: isAdmin ? inviteCode.trim() : '',
      });
      if (result?.needsConfirmation) {
        toast.success('Đăng ký thành công! Kiểm tra email để xác nhận tài khoản.');
        navigate('/login');
        return;
      }
      if (isAdmin) {
        toast.success('Đã tạo tài khoản quản trị viên.');
        navigate('/admin');
        return;
      }
      toast.success(
        studentCard
          ? 'Đăng ký thành công! Hồ sơ đang chờ quản trị viên duyệt.'
          : 'Đăng ký thành công! Hãy tải ảnh thẻ sinh viên trong Hồ sơ để được duyệt.'
      );
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left showcase */}
      <div className="relative hidden w-1/2 overflow-hidden bg-brand-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="relative flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 backdrop-blur">
            <PiggyBank className="h-6 w-6 text-brand-300" />
          </span>
          <div>
            <p className="text-xl font-extrabold tracking-tight">UniSave</p>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
              Student finance
            </p>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-balance text-4xl font-extrabold leading-tight tracking-tight">
            Bắt đầu hành trình
            <br />
            tiết kiệm của bạn.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-100">
            Tạo tài khoản miễn phí, xác thực sinh viên và nhận ngay heo đất thông minh đầu tiên.
          </p>

          <div className="mt-8 space-y-3">
            {[
              'Miễn phí hoàn toàn cho sinh viên',
              'Đồng bộ chi tiêu mọi lúc mọi nơi',
              'Kết nối cộng đồng mua bán, gom đơn',
            ].map((text) => (
              <div key={text} className="flex items-center gap-3 text-sm text-brand-50">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-500/20 text-brand-300">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-brand-200">© 2026 UniSave. Dành cho sinh viên Việt Nam.</p>
      </div>

      {/* Form */}
      <div className="flex w-full items-center justify-center px-5 py-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white shadow-soft">
                <PiggyBank className="h-5 w-5" />
              </span>
              <span className="text-xl font-extrabold tracking-tight text-ink-900">UniSave</span>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Tạo tài khoản mới</h1>
          <p className="mt-1.5 text-sm text-ink-500">Chỉ mất 30 giây để bắt đầu tiết kiệm.</p>

          {/* Role switch */}
          <div className="mt-5 grid grid-cols-2 gap-1 rounded-2xl bg-ink-100 p-1">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                !isAdmin ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-800'
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              Sinh viên
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              disabled={!demoMode}
              title={demoMode ? 'Tạo tài khoản quản trị bằng mã mời' : 'Tạo quản trị viên bằng SQL trong Supabase'}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isAdmin ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-800'
              }`}
            >
              <ShieldPlus className="h-3.5 w-3.5" />
              Quản trị viên
            </button>
          </div>

          {isAdmin ? (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-brand-200/70 bg-ink-50 p-3.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ink-600" />
              <p className="text-[11px] leading-relaxed text-ink-600">
                Quản trị viên <strong>không cần mã số sinh viên</strong>. Tài khoản được kích hoạt
                ngay và có quyền duyệt hồ sơ, quản lý bài đăng, xử lý tố cáo.
                {demoMode && (
                  <>
                    {' '}
                    Mã mời demo: <strong>{DEMO_ADMIN_INVITE}</strong>
                  </>
                )}
              </p>
            </div>
          ) : (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber-100 bg-amber-50/80 p-3.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-[11px] leading-relaxed text-amber-800">
                Sau khi đăng ký, hồ sơ ở trạng thái <strong>chờ duyệt</strong>. Quản trị viên kiểm
                tra MSSV và ảnh thẻ sinh viên rồi gán huy hiệu xác minh. Khi đó bạn mới có thể đăng
                bài và tạo kèo gom đơn.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6">
            <Input
              label="Họ và tên"
              icon={UserRound}
              placeholder={isAdmin ? 'Quản trị UniSave' : 'Nguyễn Văn A'}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            {isAdmin ? (
              <Input
                label="Mã mời quản trị"
                icon={KeyRound}
                placeholder="UNISAVE-ADMIN"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                hint="Mã mời được cấp bởi quản trị viên hệ thống. Không chia sẻ công khai."
                required
              />
            ) : (
              <>
                <Input
                  label="Mã số sinh viên"
                  icon={GraduationCap}
                  placeholder="12345678"
                  value={mssv}
                  onChange={(e) => setMssv(e.target.value)}
                  hint="Không bắt buộc — có thể bổ sung sau trong Hồ sơ."
                />
                <div className="mb-4">
                  <label className="label" htmlFor="campus">
                    Trường / khu vực
                  </label>
                  <select
                    id="campus"
                    value={selectedCampus}
                    onChange={(e) => setCampus(e.target.value)}
                    className="input"
                    required
                  >
                    {campusOptions.length ? (
                      campusOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                          {item.area ? ` · ${item.area}` : ''}
                        </option>
                      ))
                    ) : (
                      <option value="khac">Chưa có khu vực – liên hệ quản trị viên</option>
                    )}
                  </select>
                  <p className="mt-1.5 text-xs text-ink-400">
                    Giúp ưu tiên tin đăng và kèo gom đơn gần bạn.
                  </p>
                </div>

                <div className="mb-4">
                  <StudentCardUpload value={studentCard} onChange={setStudentCard} compact />
                </div>
              </>
            )}

            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="ban@sinhvien.edu.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Mật khẩu"
              type="password"
              icon={Lock}
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />

            <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
              {isAdmin ? 'Tạo tài khoản quản trị' : 'Đăng ký'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {demoMode && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-ink-50 px-3 py-2.5">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
              <p className="text-[11px] leading-relaxed text-ink-500">
                Chế độ demo lưu tài khoản trong <strong>trình duyệt này</strong>. Đăng ký và đăng
                nhập quản trị trên cùng một trình duyệt để thấy hồ sơ mới; muốn đồng bộ nhiều máy
                cần cấu hình Supabase.
              </p>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-ink-500">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}