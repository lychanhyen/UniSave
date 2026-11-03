import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { isRemote, fetchComments, createComment, deleteComment } from '../lib/api';
import { useCurrentUser } from './useCurrentUser';

/**
 * Bình luận của một tin đăng.
 *
 * Chế độ Supabase nghe realtime để hai người đang mở cùng tin thấy bình luận
 * của nhau ngay; chế độ demo đọc/ghi localStorage qua lớp api.
 */
export function usePostComments(postId) {
  const currentUser = useCurrentUser();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(Boolean(postId));
  const [sending, setSending] = useState(false);

  const reload = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      setComments(await fetchComments(postId));
    } catch (error) {
      toast.error(`Không tải được bình luận: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    reload();
    if (!isRemote() || !postId) return undefined;
    const channel = supabase
      .channel(`unisave-comments-${postId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_comments', filter: `post_id=eq.${postId}` },
        reload
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, reload]);

  const addComment = useCallback(
    async (body) => {
      const text = String(body || '').trim();
      if (!text) return;
      setSending(true);
      try {
        const saved = await createComment({ postId, author: currentUser, body: text });
        setComments((prev) => {
          if (prev.some((item) => item.id === saved.id)) return prev;
          return [...prev, saved];
        });
        return saved;
      } catch (error) {
        toast.error(error.message || 'Không gửi được bình luận.');
        throw error;
      } finally {
        setSending(false);
      }
    },
    [postId, currentUser]
  );

  const removeComment = useCallback(
    async (id) => {
      const snapshot = comments;
      setComments((prev) => prev.filter((item) => item.id !== id));
      try {
        await deleteComment(id);
      } catch (error) {
        setComments(snapshot);
        toast.error(error.message || 'Không xoá được bình luận.');
      }
    },
    [comments]
  );

  return { comments, loading, sending, addComment, removeComment, currentUser };
}
