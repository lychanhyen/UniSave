import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  createAppFeedback,
  deleteAppFeedback,
  fetchAppFeedback,
  hideAppFeedback,
} from '../lib/api';

/**
 * Đánh giá công khai của người dùng.
 *
 * Đọc được cả khi chưa đăng nhập (trang chủ dùng hook này), nhưng gửi thì cần
 * tài khoản. Trả kèm thống kê điểm trung bình và phân bố số sao.
 */
export function useAppFeedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await fetchAppFeedback());
    } catch (error) {
      toast.error(`Không tải được đánh giá: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const stats = useMemo(() => {
    const count = items.length;
    const sum = items.reduce((total, item) => total + (Number(item.rating) || 0), 0);
    const distribution = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: items.filter((item) => Number(item.rating) === star).length,
    }));
    return {
      count,
      average: count ? Math.round((sum / count) * 10) / 10 : 0,
      distribution,
      suggestions: items.filter((item) => item.suggestion).length,
    };
  }, [items]);

  const add = useCallback(async ({ user, rating, review, suggestion }) => {
    if (!user?.id) throw new Error('Bạn cần đăng nhập để gửi đánh giá.');
    if (!rating) throw new Error('Hãy chọn số sao trước khi gửi.');
    if (!String(review || '').trim() && !String(suggestion || '').trim()) {
      throw new Error('Hãy viết một dòng nhận xét hoặc đề xuất.');
    }
    setSending(true);
    try {
      const saved = await createAppFeedback({ user, rating, review, suggestion });
      setItems((current) => [saved, ...current]);
      return saved;
    } finally {
      setSending(false);
    }
  }, []);

  const remove = useCallback(async (id) => {
    const snapshot = items;
    setItems((current) => current.filter((item) => item.id !== id));
    try {
      await deleteAppFeedback(id);
    } catch (error) {
      setItems(snapshot);
      toast.error(`Không xoá được đánh giá: ${error.message}`);
    }
  }, [items]);

  const hide = useCallback(async (id) => {
    const snapshot = items;
    setItems((current) => current.filter((item) => item.id !== id));
    try {
      await hideAppFeedback(id);
    } catch (error) {
      setItems(snapshot);
      toast.error(`Không ẩn được đánh giá: ${error.message}`);
    }
  }, [items]);

  return { items, stats, loading, sending, reload, add, remove, hide };
}
