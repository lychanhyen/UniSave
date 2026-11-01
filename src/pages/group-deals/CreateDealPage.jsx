import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/ui/PageHeader';
import DealForm from '../../components/group/DealForm';
import { useDeals } from '../../hooks/useDeals';

export default function CreateDealPage() {
  const navigate = useNavigate();
  const { addDeal } = useDeals();

  async function handleSubmit(values) {
    try {
      await addDeal(values);
      toast.success('Tạo kèo thành công! Chia sẻ cho bạn bè ngay.');
      navigate('/deals');
    } catch {
      /* hook đã hiển thị lỗi */
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/deals"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách kèo
      </Link>

      <PageHeader
        eyebrow="Tạo kèo mới"
        title="Rủ cả nhóm cùng tiết kiệm"
        subtitle="Đặt giá gốc, giá gom và số người tối thiểu. Kèo sẽ tự chuyển sang “Đủ người” khi đạt mục tiêu."
      />

      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-amber-600 shadow-soft">
          <Lightbulb className="h-4.5 w-4.5" />
        </span>
        <div>
          <p className="text-sm font-bold text-amber-900">Kèo hấp dẫn cần gì?</p>
          <p className="mt-0.5 text-xs leading-relaxed text-amber-800/80">
            Mức giảm ít nhất 15–20%, hạn chót rõ ràng và mô tả minh bạch về cách chia tiền, thời
            gian nhận hàng.
          </p>
        </div>
      </div>

      <DealForm onSubmit={handleSubmit} onCancel={() => navigate('/deals')} />
    </div>
  );
}
