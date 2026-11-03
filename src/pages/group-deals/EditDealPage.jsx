import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, PencilLine, ShieldAlert, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/ui/PageHeader';
import DealForm from '../../components/group/DealForm';
import EmptyState from '../../components/ui/EmptyState';
import { useDeals } from '../../hooks/useDeals';
import { formatDateTime } from '../../lib/utils';

export default function EditDealPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deals, currentUser, editDeal } = useDeals();

  const deal = deals.find((item) => item.id === id);

  async function handleSubmit(values) {
    try {
      await editDeal(deal.id, values);
      toast.success('Đã cập nhật kèo gom đơn');
      navigate('/deals');
    } catch {
      /* hook đã hiển thị lỗi */
    }
  }

  if (!deal) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card">
          <EmptyState
            icon={Store}
            title="Kèo không tồn tại"
            description="Kèo có thể đã bị xoá hoặc đường dẫn không đúng."
            action={
              <Link to="/deals" className="btn-primary">
                Về trang gom đơn
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const isOwner = deal.owner_id === currentUser.id;

  if (!isOwner) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card">
          <EmptyState
            icon={ShieldAlert}
            title="Bạn không sửa được kèo này"
            description="Chỉ người tạo kèo mới có quyền chỉnh sửa nội dung kèo."
            action={
              <Link to="/deals" className="btn-secondary">
                Xem các kèo khác
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/deals"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại gom đơn
      </Link>

      <PageHeader
        eyebrow="Sửa kèo"
        title="Chỉnh lại cho khớp thực tế"
        subtitle="Cập nhật giá, số người tối thiểu, thông tin chuyển khoản hoặc hạn chót."
      />

      <div className="mb-5 flex items-start gap-3 rounded-2xl border-2 border-brand-200 bg-brand-50/70 p-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-brand-600 shadow-soft">
          <PencilLine className="h-4.5 w-4.5" />
        </span>
        <div>
          <p className="text-sm font-bold text-brand-900">Đang sửa: {deal.title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-brand-700/80">
            Thành viên đã tham gia và số tiền đã báo chuyển vẫn được giữ nguyên. Hạn chót hiện tại:{' '}
            {deal.deadline ? formatDateTime(deal.deadline) : 'không đặt'}.
          </p>
        </div>
      </div>

      <DealForm
        initial={deal}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/deals')}
        submitLabel="Lưu thay đổi"
      />
    </div>
  );
}
