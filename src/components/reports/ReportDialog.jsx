import { useState } from 'react';
import { AlertTriangle, Flag, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { createReport } from '../../lib/api';

const REASONS = [
  'Lừa đảo / chiếm đoạt tiền',
  'Hàng giả, không đúng mô tả',
  'Spam, quảng cáo',
  'Thông tin xúc phạm, quấy rối',
  'Tài khoản giả mạo sinh viên',
  'Khác',
];

export default function ReportDialog({ open, onClose, targetType, targetId, targetLabel, onSubmitted }) {
  const currentUser = useCurrentUser();
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);

  if (!open) return null;

  const isUser = targetType === 'user';
  const isDeal = targetType === 'deal';

  async function handleSubmit(event) {
    event.preventDefault();
    if (details.trim().length < 10) {
      toast.error('Vui lòng mô tả rõ hơn (ít nhất 10 ký tự) để admin có căn cứ xử lý.');
      return;
    }
    setSending(true);
    try {
      await createReport({
        reporter: currentUser,
        targetType,
        targetId,
        targetLabel,
        reason,
        details,
      });
      toast.success('Đã gửi tố cáo. Quản trị viên sẽ xem xét và xử lý.');
      setDetails('');
      setReason(REASONS[0]);
      onSubmitted?.();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Không gửi được tố cáo.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="animate-in relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-card"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-50 text-rose-600">
              <Flag className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-ink-900">
                {isUser ? 'Tố cáo người dùng' : isDeal ? 'Tố cáo kèo gom đơn' : 'Tố cáo tin đăng'}
              </p>
              <p className="text-[11px] text-ink-400">
                Gửi tới quản trị viên UniSave để xem xét.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-xl text-ink-400 hover:bg-ink-100 hover:text-ink-700"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 line-clamp-2 rounded-xl bg-ink-50 px-3 py-2 text-xs font-medium text-ink-600">
          {targetLabel || (isUser ? 'Người dùng UniSave' : isDeal ? 'Kèo gom đơn' : 'Tin đăng')}
        </p>

        <label className="label mt-4">Lý do tố cáo</label>
        <select value={reason} onChange={(e) => setReason(e.target.value)} className="input">
          {REASONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label className="label mt-4">Mô tả chi tiết</label>
        <textarea
          rows={4}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Ví dụ: Bạn này nhận cọc 200.000đ rồi chặn tin nhắn. Mình có ảnh chụp chuyển khoản..."
          className="input resize-none"
          maxLength={600}
        />
        <div className="mt-1 text-right text-[10px] text-ink-400">{details.length}/600</div>

        <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-[11px] leading-relaxed text-amber-800">
            Tố cáo sai sự thật có thể khiến tài khoản của bạn bị nhắc nhở. Hãy cung cấp thông tin
            chính xác và bằng chứng nếu có.
          </p>
        </div>

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center py-3">
            Hủy
          </button>
          <button type="submit" disabled={sending} className="btn-danger flex-1 justify-center py-3">
            <Send className="h-4 w-4" />
            {sending ? 'Đang gửi…' : 'Gửi tố cáo'}
          </button>
        </div>
      </form>
    </div>
  );
}
