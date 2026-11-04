import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import DealDetail from '../../components/group/DealDetail';
import EmptyState from '../../components/ui/EmptyState';
import { useDeals } from '../../hooks/useDeals';

/**
 * Trang chi tiết một kèo gom đơn: mô tả đầy đủ, thành viên, chia tiền,
 * xác nhận thanh toán, bill chuyển khoản, tố cáo và sửa/xoá kèo.
 */
export default function DealDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    deals,
    loading,
    currentUser,
    joinDeal,
    leaveDeal,
    declarePayment,
    reviewPayment,
    editDeal,
    attachBill,
    removeDeal,
  } = useDeals();

  const deal = deals.find((item) => item.id === id);
  const isAdmin = currentUser.role === 'admin';

  if (loading && !deal) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card p-12 text-center text-sm font-medium text-ink-500">Đang tải kèo…</div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card">
          <EmptyState
            icon={ShoppingBag}
            title="Kèo không tồn tại"
            description="Kèo có thể đã bị xoá, hoặc đã kết thúc quá 7 ngày nên được ẩn."
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
  const joined = (deal.joined_ids || []).includes(currentUser.id);

  async function handleJoin(dealId) {
    const next = await joinDeal(dealId);
    if (next) {
      toast.success('Đã tham gia kèo, nhớ theo dõi hạn chót nhé!');
      if (next.status === 'full') {
        toast('Kèo đã đủ người, xem bảng chia tiền bên dưới.', { icon: '💰' });
      }
    }
  }

  async function handleDelete(dealId) {
    await removeDeal(dealId);
    toast.success('Đã xoá kèo');
    navigate('/deals');
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

      <DealDetail
        deal={deal}
        currentUserId={currentUser.id}
        joined={joined}
        isOwner={isOwner}
        isAdmin={isAdmin}
        detail
        onJoin={handleJoin}
        onLeave={leaveDeal}
        onDelete={handleDelete}
        onEdit={(dealId) => navigate(`/deals/${dealId}/edit`)}
        onDeclarePayment={declarePayment}
        onReviewPayment={reviewPayment}
        onAttachBill={attachBill}
      />
    </div>
  );
}
