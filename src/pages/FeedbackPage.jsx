import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, MessageSquareQuote, Send, ShieldAlert, Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import StarRating from '../components/feedback/StarRating';
import Avatar from '../components/ui/Avatar';
import { useAppFeedback } from '../hooks/useAppFeedback';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { cn, formatRelativeTime } from '../lib/utils';

/** Trang công khai: xem đánh giá của mọi người và gửi đánh giá của bạn. */
export default function FeedbackPage() {
  const currentUser = useCurrentUser();
  const { items, stats, loading, sending, add, remove, hide } = useAppFeedback();
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [suggestion, setSuggestion] = useState('');

  const isAdmin = currentUser.role === 'admin';

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await add({ user: currentUser, rating, review, suggestion });
      toast.success('Cảm ơn bạn! Đánh giá đã được đăng công khai.');
      setReview('');
      setSuggestion('');
      setRating(5);
    } catch (error) {
      toast.error(error.message || 'Không gửi được đánh giá.');
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-[1.7rem] font-extrabold tracking-[-0.035em] text-ink-900 sm:text-[2.125rem]">
          Đánh giá UniSave
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
          Bạn thấy UniSave thế nào và cần cải thiện gì? Mọi đánh giá và đề xuất đều hiển thị công
          khai để người khác cùng đọc.
        </p>
      </div>

      {/* ------------------------------------------------------------ Tổng quan */}
      <section className="card-strong mb-5 flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-end gap-3">
          <p className="figure-xl text-ink-900">{stats.average || '—'}</p>
          <div className="pb-1">
            <StarRating value={Math.round(stats.average)} size="md" />
            <p className="mt-1 text-[13px] text-ink-500">
              {stats.count} đánh giá · {stats.suggestions} đề xuất
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-1 sm:max-w-xs">
          {[...stats.distribution].reverse().map((row) => {
            const percent = stats.count ? Math.round((row.count / stats.count) * 100) : 0;
            return (
              <div key={row.star} className="flex items-center gap-2 text-[12px]">
                <span className="w-8 shrink-0 tabular-nums text-ink-500">{row.star} sao</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                  <span className="block h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
                </span>
                <span className="w-8 shrink-0 text-right tabular-nums text-ink-400">{row.count}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* --------------------------------------------------------------- Gửi bài */}
      {currentUser.id ? (
        <form onSubmit={handleSubmit} className="card-strong mb-5 px-5 py-5">
          <h2 className="section-title mb-3">Đánh giá của bạn</h2>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[13px] font-semibold text-ink-700">Chấm điểm</span>
            <StarRating value={rating} onChange={setRating} size="lg" label="Chọn số sao" />
            <span className="text-[12px] font-bold text-amber-600">{rating} sao</span>
          </div>

          <div className="mt-3 grid gap-3">
            <div>
              <label className="label" htmlFor="feedback-review">
                Nhận xét của bạn
              </label>
              <textarea
                id="feedback-review"
                rows={3}
                value={review}
                onChange={(event) => setReview(event.target.value)}
                placeholder="Điều bạn thích hoặc chưa hài lòng khi dùng UniSave…"
                className="input resize-none"
                maxLength={800}
              />
            </div>

            <div>
              <label className="label" htmlFor="feedback-suggestion">
                Đề xuất cải thiện
              </label>
              <textarea
                id="feedback-suggestion"
                rows={2}
                value={suggestion}
                onChange={(event) => setSuggestion(event.target.value)}
                placeholder="Ví dụ: mong có nhắc nộp tiền nhà, hoặc xuất báo cáo chi tiêu ra Excel…"
                className="input resize-none"
                maxLength={800}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[12px] text-ink-500">Đánh giá sẽ hiện công khai kèm tên của bạn.</p>
            <button type="submit" disabled={sending} className="btn-primary py-2 text-xs disabled:opacity-60">
              <Send className="h-3.5 w-3.5" />
              {sending ? 'Đang gửi…' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      ) : (
        <div className="card-strong mb-5 flex items-start gap-3 px-5 py-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Star className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[13px] font-bold text-ink-900">Đăng nhập để gửi đánh giá</p>
            <p className="mt-0.5 text-[12px] text-ink-500">
              Bạn vẫn đọc được tất cả đánh giá bên dưới mà không cần tài khoản.
            </p>
            <Link to="/login" className="btn-primary mt-2 py-2 text-xs">
              Đăng nhập
            </Link>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- Danh sách */}
      <section className="card-strong px-5 py-5">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="section-title">Mọi người nói gì</h2>
          <span className="text-[12px] font-semibold text-ink-500">{items.length} đánh giá</span>
        </div>

        {loading ? (
          <p className="rounded-xl bg-ink-50 px-3 py-8 text-center text-[13px] font-medium text-ink-400">
            Đang tải đánh giá…
          </p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-100 text-ink-400">
              <MessageSquareQuote className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-semibold text-ink-700">Chưa có đánh giá nào</p>
            <p className="mt-1 text-xs text-ink-400">Hãy là người đầu tiên chia sẻ cảm nhận.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => {
              const canDelete = item.user_id === currentUser.id || isAdmin;
              return (
                <li key={item.id} className="rounded-2xl border border-brand-200/60 px-3.5 py-3">
                  <div className="flex items-start gap-3">
                    <Avatar size="sm" name={item.author_name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-[13px] font-bold text-ink-900">{item.author_name}</span>
                        <StarRating value={Number(item.rating)} size="sm" />
                        <span className="text-[12px] text-ink-500">
                          {formatRelativeTime(item.created_at)}
                        </span>
                      </div>

                      {item.review && (
                        <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-ink-700">
                          {item.review}
                        </p>
                      )}

                      {item.suggestion && (
                        <p className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2 py-1.5 text-[12px] leading-relaxed text-amber-900">
                          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>{item.suggestion}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col gap-1">
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          className="grid h-7 w-7 place-items-center rounded-md text-ink-300 transition hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Xoá đánh giá"
                          title="Xoá đánh giá"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {isAdmin && item.user_id !== currentUser.id && (
                        <button
                          type="button"
                          onClick={() => hide(item.id)}
                          className="grid h-7 w-7 place-items-center rounded-md text-ink-300 transition hover:bg-amber-50 hover:text-amber-600"
                          aria-label="Ẩn đánh giá"
                          title="Ẩn khỏi trang công khai"
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className={cn('mt-4 rounded-2xl border border-brand-200/60 bg-brand-50/50 px-4 py-3 text-[11px] leading-relaxed text-ink-500')}>
        Đánh giá được công khai kèm tên và trường của bạn để tránh tài khoản ảo. Quản trị viên có thể
        ẩn đánh giá không phù hợp.
      </p>
    </div>
  );
}
