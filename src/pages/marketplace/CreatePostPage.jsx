import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/ui/PageHeader';
import PostForm from '../../components/marketplace/PostForm';
import { useMarketplace } from '../../hooks/useMarketplace';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { addPost } = useMarketplace();

  async function handleSubmit(values) {
    try {
      const post = await addPost(values);
      toast.success('Đăng tin thành công!');
      navigate(`/marketplace/${post.id}`);
    } catch {
      /* hook đã hiển thị lỗi */
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/marketplace"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại chợ sinh viên
      </Link>

      <PageHeader
        eyebrow="Đăng tin mới"
        title="Món đồ này sẽ về tay ai?"
        subtitle="Chỉ mất 1 phút. Tin của bạn sẽ hiển thị ngay với cộng đồng sinh viên UniSave."
      />

      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/70 p-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-brand-600 shadow-soft">
          <Sparkles className="h-4.5 w-4.5" />
        </span>
        <div>
          <p className="text-sm font-bold text-brand-900">Mẹo đăng tin nhanh bay</p>
          <p className="mt-0.5 text-xs leading-relaxed text-brand-700/80">
            Chụp ảnh đủ sáng, ghi rõ tình trạng và để giá sinh viên. Tin có ảnh thật thường được
            liên hệ nhiều gấp 3 lần.
          </p>
        </div>
      </div>

      <PostForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/marketplace')}
        submitLabel="Đăng tin ngay"
      />
    </div>
  );
}
