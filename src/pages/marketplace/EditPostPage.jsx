import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, PencilLine, ShieldAlert, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/ui/PageHeader';
import PostForm from '../../components/marketplace/PostForm';
import EmptyState from '../../components/ui/EmptyState';
import { useMarketplace } from '../../hooks/useMarketplace';

export default function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts, loading, currentUser, editPost } = useMarketplace();

  const post = posts.find((item) => item.id === id);

  async function handleSubmit(values) {
    try {
      await editPost(post.id, values);
      toast.success('Đã cập nhật tin đăng');
      navigate(`/marketplace/${post.id}`);
    } catch {
      /* hook đã hiển thị lỗi */
    }
  }

  if (loading && !post) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card p-12 text-center text-sm font-medium text-ink-500">
          Đang tải tin đăng…
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card">
          <EmptyState
            icon={Store}
            title="Tin đăng không tồn tại"
            description="Có thể tin đã bị xóa hoặc đường dẫn không đúng."
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

  const isOwner = post.owner_id === currentUser.id;
  const isAdmin = currentUser.role === 'admin';

  if (!isOwner && !isAdmin) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card">
          <EmptyState
            icon={ShieldAlert}
            title="Bạn không sửa được tin này"
            description="Chỉ người đăng tin mới có quyền chỉnh sửa."
            action={
              <Link to={`/marketplace/${post.id}`} className="btn-secondary">
                Xem tin đăng
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
        to={`/marketplace/${post.id}`}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại tin đăng
      </Link>

      <PageHeader
        eyebrow="Sửa tin đăng"
        title="Chỉnh lại cho khớp thực tế"
        subtitle="Cập nhật giá, tình trạng hay ảnh mới. Tin đã chỉnh sẽ hiện ngay với người mua."
      />

      <div className="mb-5 flex items-start gap-3 rounded-2xl border-2 border-brand-200 bg-brand-50/70 p-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-brand-600 shadow-soft">
          <PencilLine className="h-4.5 w-4.5" />
        </span>
        <div>
          <p className="text-sm font-bold text-brand-900">Đang sửa: {post.title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-brand-700/80">
            Thay đổi được lưu ngay khi bấm cập nhật. Ngày đăng gốc và lượt quan tâm vẫn được giữ.
          </p>
        </div>
      </div>

      <PostForm
        initial={post}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/marketplace/${post.id}`)}
        submitLabel="Lưu thay đổi"
      />
    </div>
  );
}
