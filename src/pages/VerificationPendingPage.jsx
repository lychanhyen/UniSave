import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  FileCheck2,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { requestVerification } from '../lib/api';

export default function VerificationPendingPage() {
  const currentUser = useCurrentUser();
  const { refreshUser } = useAuth();
  const [sending, setSending] = useState(false);

  const status = currentUser.verification_status;
  const rejected = status === 'rejected';
  const pending = status === 'pending';

  async function handleRequest() {
    setSending(true);
    try {
      await requestVerification(currentUser.id);
      await refreshUser();
      toast.success('Đã gửi yêu cầu xác minh. Quản trị viên sẽ duyệt sớm nhất.');
    } catch (error) {
      toast.error(error.message || 'Không gửi được yêu cầu xác minh.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/dashboard"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Về tổng quan
      </Link>

      <div className="card overflow-hidden p-0">
        <div
          className={`relative overflow-hidden px-6 py-10 text-center text-white sm:px-10 ${
            rejected ? 'bg-rose-700' : pending ? 'bg-amber-600' : 'bg-brand-600'
          }`}
        >
          <div className="relative">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/15">
              {rejected ? (
                <XCircle className="h-7 w-7" />
              ) : pending ? (
                <Clock3 className="h-7 w-7" />
              ) : (
                <ShieldAlert className="h-7 w-7" />
              )}
            </span>
            <h1 className="mt-4 text-[clamp(1.4rem,3vw,1.9rem)] font-extrabold tracking-[-0.035em]">
              {rejected
                ? 'Hồ sơ chưa được duyệt'
                : pending
                  ? 'Đang chờ quản trị viên duyệt'
                  : 'Cần xác minh sinh viên'}
            </h1>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-white/85">
              {rejected
                ? currentUser.verification_note ||
                  'Thông tin chưa khớp với thẻ sinh viên. Bạn có thể kiểm tra lại và gửi yêu cầu mới.'
                : pending
                  ? 'Hồ sơ của bạn đã được gửi. Quản trị viên sẽ kiểm tra MSSV và thẻ sinh viên trước khi gật đầu.'
                  : 'Chỉ sinh viên đã xác minh mới được đăng bài và tạo kèo gom đơn để tránh lừa đảo.'}
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: FileCheck2,
                title: '1. Gửi hồ sơ',
                text: 'Đăng ký bằng email và mã số sinh viên.',
              },
              {
                icon: ShieldCheck,
                title: '2. Admin kiểm tra',
                text: 'Đối chiếu MSSV, thẻ sinh viên và thông tin trường.',
              },
              {
                icon: BadgeCheck,
                title: '3. Nhận huy hiệu',
                text: 'Được đăng bài, tạo kèo và nhận badge xác minh.',
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-brand-200/60 bg-ink-50/50 p-4">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-brand-600 shadow-soft">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <p className="mt-3 text-xs font-extrabold text-ink-900">{title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-500">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-brand-200/60 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-400">
              Trạng thái hồ sơ
            </p>
            <div className="mt-2 flex items-center gap-2">
              {pending ? (
                <span className="chip bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                  <Clock3 className="h-3.5 w-3.5" /> Chờ duyệt
                </span>
              ) : rejected ? (
                <span className="chip bg-rose-50 text-rose-700 ring-1 ring-rose-100">
                  <XCircle className="h-3.5 w-3.5" /> Bị từ chối
                </span>
              ) : (
                <span className="chip bg-ink-100 text-ink-600 ring-1 ring-ink-200">
                  <ShieldAlert className="h-3.5 w-3.5" /> Chưa gửi
                </span>
              )}
              <span className="text-xs text-ink-400">
                MSSV: {currentUser.student_code || 'Chưa cập nhật'}
              </span>
            </div>
            {rejected && currentUser.verification_note && (
              <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs leading-relaxed text-rose-700">
                Lý do: {currentUser.verification_note}
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {(rejected || status === 'none') && (
              <button
                type="button"
                onClick={handleRequest}
                disabled={sending}
                className="btn-primary flex-1 justify-center py-3"
              >
                <CheckCircle2 className="h-4 w-4" />
                {sending ? 'Đang gửi…' : 'Gửi lại yêu cầu xác minh'}
              </button>
            )}
            <Link to="/marketplace" className="btn-secondary flex-1 justify-center py-3">
              Xem chợ sinh viên
            </Link>
            <Link to="/profile" className="btn-secondary flex-1 justify-center py-3">
              Cập nhật hồ sơ
            </Link>
          </div>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-ink-400">
            Bạn vẫn xem được chợ và kèo gom đơn khi chờ duyệt. Chỉ thao tác đăng bài, tạo kèo mới bị
            tạm khóa cho đến khi hồ sơ được duyệt.
          </p>
        </div>
      </div>
    </div>
  );
}
