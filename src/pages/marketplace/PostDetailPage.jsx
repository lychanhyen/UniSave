import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  Flag,
  MapPin,
  MessageCircle,
  MessageSquare,
  Navigation,
  Phone,
  RotateCcw,
  Send,
  ShieldCheck,
  Store,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../components/ui/EmptyState';
import Avatar from '../../components/ui/Avatar';
import VerifiedBadge from '../../components/ui/VerifiedBadge';
import PostCard from '../../components/marketplace/PostCard';
import ReportDialog from '../../components/reports/ReportDialog';
import { useMarketplace } from '../../hooks/useMarketplace';
import { POST_CATEGORY_MAP, POST_GRADIENTS } from '../../lib/constants';
import { useCampuses } from '../../context/CampusContext';
import {
  cn,
  formatCurrency,
  formatDateTime,
  formatRelativeTime,
  zaloLink,
} from '../../lib/utils';

const QUICK_QUESTIONS = [
  'Món này còn hàng không bạn?',
  'Có bớt chút không bạn?',
  'Mình ở gần, qua xem trực tiếp được không?',
];

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    posts,
    loading,
    currentUser,
    removePost,
    markSold,
    relistPost,
    sendInquiry,
  } = useMarketplace();
  const [activeImage, setActiveImage] = useState(0);
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiryText, setInquiryText] = useState('');
  const [sending, setSending] = useState(false);
  const { itemOf } = useCampuses();
  const [reportTarget, setReportTarget] = useState(null);

  const post = posts.find((p) => p.id === id);

  const related = useMemo(() => {
    if (!post) return [];
    return posts
      .filter((p) => p.id !== post.id && p.status === 'active' && p.category === post.category)
      .slice(0, 3);
  }, [posts, post]);

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

  const category = POST_CATEGORY_MAP[post.category] || POST_CATEGORY_MAP.other;
  const Icon = category.icon;
  const gradient = POST_GRADIENTS[category.tone] || POST_GRADIENTS.slate;
  const campus = itemOf(post.location) || { label: 'Khu vực khác', area: '' };
  const isOwner = post.owner_id === currentUser.id;
  const isSold = post.status === 'sold' || post.status === 'done';
  const isNearby = post.location === currentUser.campus;
  const images = post.images || [];
  const current = images[Math.min(activeImage, Math.max(0, images.length - 1))];

  async function handleDelete() {
    if (!window.confirm('Xóa tin đăng này? Hành động không thể hoàn tác.')) return;
    await removePost(post.id);
    toast.success('Đã xóa tin đăng');
    navigate('/marketplace');
  }

  async function handleMarkSold() {
    await markSold(post.id);
    toast.success('Đã chuyển tin sang “Đã bán”, vẫn giữ lại để tham khảo giá');
  }

  async function handleRelist() {
    await relistPost(post.id);
    toast.success('Đã đăng bán lại tin này');
  }

  async function copyContact() {
    try {
      await navigator.clipboard.writeText(post.contact);
      toast.success('Đã sao chép số liên hệ');
    } catch {
      toast.error('Không thể sao chép, vui lòng chọn thủ công');
    }
  }

  async function handleSendInquiry(event) {
    event.preventDefault();
    if (inquiryText.trim().length < 5) {
      toast.error('Nhập câu hỏi ít nhất 5 ký tự nhé');
      return;
    }
    setSending(true);
    try {
      await sendInquiry(post.id, inquiryText);
      toast.success('Đã gửi câu hỏi. Người bán sẽ nhận thông báo realtime!');
      setShowInquiry(false);
      setInquiryText('');
    } catch (error) {
      toast.error(`Không gửi được câu hỏi: ${error.message}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        to="/marketplace"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại chợ sinh viên
      </Link>

      {isSold && (
        <div className="animate-in mb-5 flex flex-col gap-3 rounded-3xl border border-ink-200 bg-gradient-to-r from-ink-900 to-ink-800 p-4 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/10 text-amber-300">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold">Tin này đã bán</p>
              <p className="mt-0.5 text-xs text-ink-300">
                Giá {formatCurrency(post.price)} được giữ lại làm dữ liệu tham khảo cho cộng đồng.
              </p>
            </div>
          </div>
          {isOwner ? (
            <button type="button" onClick={handleRelist} className="btn-secondary shrink-0 py-2.5 text-xs">
              <RotateCcw className="h-4 w-4" />
              Đăng bán lại
            </button>
          ) : (
            <Link to="/marketplace" className="btn-secondary shrink-0 py-2.5 text-xs">
              Tìm món tương tự
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="card animate-in overflow-hidden p-0">
            <div
              className={cn(
                'relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br sm:aspect-[16/10]',
                gradient
              )}
            >
              {current ? (
                <img src={current} alt={post.title} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-white">
                  <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
                  <Icon className="h-24 w-24 drop-shadow" strokeWidth={1.2} />
                </div>
              )}

              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-ink-800 shadow-soft">
                  {post.type === 'rent' ? 'Cho thuê' : 'Pass đồ'}
                </span>
                {isSold && (
                  <span className="rounded-full bg-ink-900/80 px-3 py-1.5 text-xs font-bold text-white">
                    Đã bán
                  </span>
                )}
                {isNearby && !isSold && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-bold text-white shadow-soft">
                    <Navigation className="h-3.5 w-3.5" />
                    Gần bạn
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <span className="absolute bottom-4 right-4 rounded-full bg-ink-900/70 px-3 py-1 text-xs font-semibold text-white">
                  {Math.min(activeImage + 1, images.length)}/{images.length}
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="no-scrollbar flex gap-3 overflow-x-auto p-4">
                {images.map((src, index) => (
                  <button
                    key={`${index}-${src.slice(-10)}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={cn(
                      'h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition',
                      activeImage === index
                        ? 'border-brand-500 ring-2 ring-brand-500/20'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    )}
                  >
                    <img src={src} alt={`Ảnh ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card animate-in-delay-1 p-5 sm:p-6">
            <h2 className="section-title">Mô tả sản phẩm</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-600">
              {post.description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl bg-ink-50 p-3.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-ink-500 shadow-soft">
                  <Tag className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">
                    Danh mục
                  </p>
                  <p className="text-sm font-semibold text-ink-800">{category.label}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-ink-50 p-3.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-ink-500 shadow-soft">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">
                    Đăng lúc
                  </p>
                  <p className="text-sm font-semibold text-ink-800">
                    {formatDateTime(post.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-brand-50/70 p-3.5 ring-1 ring-brand-100">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-brand-600 shadow-soft">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-brand-600/80">
                    Khu vực nhận hàng
                  </p>
                  <p className="text-sm font-semibold text-ink-800">{campus.label}</p>
                  <p className="text-[10px] text-ink-400">{campus.area}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-ink-50 p-3.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-ink-500 shadow-soft">
                  <Clock3 className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">
                    Trạng thái
                  </p>
                  <p className={cn('text-sm font-semibold', isSold ? 'text-ink-500' : 'text-brand-700')}>
                    {isSold ? `Đã bán${post.sold_at ? ` · ${formatDateTime(post.sold_at)}` : ''}` : 'Đang bán'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card animate-in-delay-1 p-5 sm:p-6 lg:sticky lg:top-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink-400">
              <Clock3 className="h-3.5 w-3.5" />
              Đăng {formatRelativeTime(post.created_at)}
            </div>

            <h1 className="mt-2 text-balance text-xl font-extrabold leading-snug tracking-tight text-ink-900 sm:text-2xl">
              {post.title}
            </h1>

            <div className="mt-4 flex items-end gap-2">
              <p
                className={cn(
                  'text-3xl font-extrabold tracking-tight',
                  isSold ? 'text-ink-500' : 'text-brand-700'
                )}
              >
                {formatCurrency(post.price)}
              </p>
              {post.type === 'rent' && (
                <span className="pb-1 text-sm font-semibold text-ink-400">/tháng</span>
              )}
              {isSold && (
                <span className="mb-1 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-500">
                  Giá tham khảo
                </span>
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-ink-200/80 bg-ink-50/60 p-3.5">
              <div className="flex items-center gap-3">
                <Avatar
                  size="md"
                  name={post.owner_name}
                  src={post.owner_avatar}
                  verified={post.owner_verified}
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-bold text-ink-900">
                    {post.owner_name}
                    {post.owner_verified && <BadgeCheck className="h-4 w-4 shrink-0 text-brand-600" />}
                  </p>
                  <p className="text-xs text-ink-400">
                    {isOwner ? 'Tin của bạn' : `Sinh viên · ${campus.label}`}
                  </p>
                </div>
              </div>
              <div className="mt-2.5">
                {post.owner_verified ? (
                  <VerifiedBadge
                    label="Đã xác minh sinh viên"
                    className="w-full justify-center bg-white"
                  />
                ) : (
                  <span className="chip w-full justify-center bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Chưa xác minh sinh viên
                  </span>
                )}
              </div>
            </div>

            {isSold ? (
              <div className="mt-4 rounded-2xl border border-ink-200 bg-ink-50 p-4 text-center">
                <p className="text-sm font-bold text-ink-700">Tin đã bán</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-500">
                  Người bán đã chốt đơn. Bạn có thể xem các tin cùng danh mục bên dưới.
                </p>
                <Link to="/marketplace" className="btn-secondary mt-3 w-full py-2.5 text-xs">
                  <Store className="h-4 w-4" />
                  Xem tin đang bán
                </Link>
              </div>
            ) : (
              <>
                <div className="mt-4 space-y-2.5">
                  <a
                    href={zaloLink(post.contact)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary w-full bg-gradient-to-r from-brand-600 to-emerald-600 py-3"
                  >
                    <MessageCircle className="h-4.5 w-4.5" />
                    Nhắn Zalo người bán
                  </a>
                  <div className="grid grid-cols-2 gap-2.5">
                    <a href={`tel:${post.contact}`} className="btn-secondary py-3">
                      <Phone className="h-4 w-4" />
                      Gọi điện
                    </a>
                    <button type="button" onClick={copyContact} className="btn-secondary py-3">
                      <Copy className="h-4 w-4" />
                      Số liên hệ
                    </button>
                  </div>
                  {!isOwner && (
                    <button
                      type="button"
                      onClick={() => setShowInquiry(true)}
                      className="btn-secondary w-full py-3"
                    >
                      <MessageSquare className="h-4 w-4 text-brand-600" />
                      Hỏi người bán
                    </button>
                  )}
                </div>

                <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-400">
                  Giao dịch an toàn: gặp trực tiếp ở nơi đông người, kiểm tra hàng trước khi thanh
                  toán.
                </p>
              </>
            )}

            {!isOwner && (
              <div className="mt-4 flex items-center justify-center gap-5 border-t border-ink-100 pt-3">
                <button
                  type="button"
                  onClick={() => setReportTarget({ type: 'post', label: post.title })}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-400 transition hover:text-rose-600"
                >
                  <Flag className="h-3.5 w-3.5" />
                  Tố cáo tin đăng
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setReportTarget({ type: 'user', label: post.owner_name, id: post.owner_id })
                  }
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-400 transition hover:text-rose-600"
                >
                  <Flag className="h-3.5 w-3.5" />
                  Tố cáo người bán
                </button>
              </div>
            )}

            {isOwner && (
              <div className="mt-5 space-y-2.5 border-t border-ink-100 pt-5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">
                  Quản lý tin của bạn
                </p>
                {isSold ? (
                  <button type="button" onClick={handleRelist} className="btn-secondary w-full">
                    <RotateCcw className="h-4 w-4 text-brand-600" />
                    Đăng bán lại
                  </button>
                ) : (
                  <button type="button" onClick={handleMarkSold} className="btn-secondary w-full">
                    <CheckCircle2 className="h-4 w-4 text-brand-600" />
                    Đánh dấu đã bán
                  </button>
                )}
                <button type="button" onClick={handleDelete} className="btn-danger w-full">
                  <Trash2 className="h-4 w-4" />
                  Xóa tin đăng
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
                Cùng danh mục
              </p>
              <h2 className="mt-1 text-lg font-extrabold tracking-tight text-ink-900">
                Có thể bạn cũng thích
              </h2>
            </div>
            <Link to="/marketplace" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              Xem tất cả
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {related.map((item) => (
              <PostCard
                key={item.id}
                post={item}
                isOwner={item.owner_id === currentUser.id}
                nearby={item.location === currentUser.campus}
                onDelete={async (postId) => {
                  if (!window.confirm('Xóa tin đăng này?')) return;
                  await removePost(postId);
                  toast.success('Đã xóa tin đăng');
                }}
                onMarkDone={async (postId) => {
                  await markSold(postId);
                  toast.success('Đã chuyển tin sang “Đã bán”');
                }}
                onRelist={async (postId) => {
                  await relistPost(postId);
                  toast.success('Đã đăng bán lại');
                }}
              />
            ))}
          </div>
        </div>
      )}

      {showInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">          <div
            className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
            onClick={() => setShowInquiry(false)}
          />
          <form
            onSubmit={handleSendInquiry}
            className="animate-in relative w-full max-w-md rounded-3xl bg-white p-5 shadow-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                  <MessageSquare className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink-900">Hỏi người bán</p>
                  <p className="text-[11px] text-ink-400">Người bán nhận thông báo ngay lập tức.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInquiry(false)}
                className="grid h-8 w-8 place-items-center rounded-xl text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 line-clamp-2 rounded-xl bg-ink-50 px-3 py-2 text-xs font-medium text-ink-600">
              {post.title}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => setInquiryText(question)}
                  className="chip border border-ink-200 bg-white text-[11px] text-ink-600 transition hover:border-brand-300 hover:text-brand-700"
                >
                  {question}
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              value={inquiryText}
              onChange={(event) => setInquiryText(event.target.value)}
              placeholder="Ví dụ: Bạn còn bảo hành không? Mình ở KTX Khu A, qua xem được không?"
              className="input mt-3 resize-none"
              maxLength={400}
            />
            <div className="mt-1 text-right text-[10px] text-ink-400">
              {inquiryText.length}/400
            </div>

            <button type="submit" disabled={sending} className="btn-primary mt-2 w-full py-3">
              {sending ? 'Đang gửi…' : 'Gửi câu hỏi'}
              {!sending && <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      )}

      <ReportDialog
        open={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        targetType={reportTarget?.type || 'post'}
        targetId={reportTarget?.type === 'user' ? reportTarget.id : post.id}
        targetLabel={reportTarget?.label}
      />
    </div>
  );
}
