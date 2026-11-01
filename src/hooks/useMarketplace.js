import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import {
  isRemote,
  newId,
  fetchPosts,
  createPost,
  updatePost,
  deletePost,
  createInquiry,
  restorePost,
  pushNotification,
} from '../lib/api';
import { loadPosts, savePosts } from '../lib/demoData';
import { uploadDataUrl } from '../lib/upload';
import { useCurrentUser } from './useCurrentUser';

export function useMarketplace() {
  const currentUser = useCurrentUser();
  const channelName = useRef(`unisave-posts-${Math.random().toString(36).slice(2, 10)}`).current;
  // Đọc đồng bộ từ localStorage để trang chi tiết không bị nháy "không tồn tại".
  const [posts, setPosts] = useState(() => (isRemote() ? [] : loadPosts()));
  const [loading, setLoading] = useState(isRemote());

  const reload = useCallback(async () => {
    if (!isRemote()) {
      setPosts(loadPosts());
      return;
    }
    setLoading(true);
    try {
      setPosts(await fetchPosts());
    } catch (error) {
      toast.error(`Không tải được tin đăng: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    if (!isRemote()) return undefined;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, reload)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [reload]);

  const persistDemo = useCallback((next) => {
    savePosts(next);
    setPosts(next);
  }, []);

  const addPost = useCallback(
    async (post) => {
      const item = {
        id: newId(),
        status: 'active',
        images: [],
        location: 'khac',
        owner_id: currentUser.id,
        owner_name: currentUser.full_name,
        owner_verified: currentUser.is_verified,
        owner_avatar: currentUser.avatar_url,
        owner_campus: currentUser.campus,
        created_at: new Date().toISOString(),
        ...post,
      };

      if (!isRemote()) {
        persistDemo([item, ...loadPosts()]);
        return item;
      }

      setPosts((prev) => [item, ...prev]);
      try {
        // Ảnh nén dạng data URL được đẩy lên Supabase Storage để không phình JSON.
        let uploadFailed = false;
        const images = await Promise.all(
          (item.images || []).map(async (src) => {
            if (!String(src).startsWith('data:')) return src;
            try {
              return await uploadDataUrl('post-images', currentUser.id, src);
            } catch {
              uploadFailed = true;
              return src;
            }
          })
        );
        if (uploadFailed) {
          toast('Không upload được ảnh lên Storage, ảnh được lưu tạm trong bài đăng.', {
            icon: '⚠️',
          });
        }
        const saved = await createPost({ ...item, images });
        setPosts((prev) => prev.map((row) => (row.id === item.id ? { ...item, ...saved } : row)));
        return { ...item, ...saved };
      } catch (error) {
        setPosts((prev) => prev.filter((row) => row.id !== item.id));
        toast.error(`Không thể đăng tin: ${error.message}`);
        throw error;
      }
    },
    [currentUser, persistDemo]
  );

  /** Sửa tin đăng: ảnh mới (data URL) được đẩy lên Storage trước khi ghi DB. */
  const editPost = useCallback(
    async (id, patch) => {
      if (!isRemote()) {
        persistDemo(loadPosts().map((post) => (post.id === id ? { ...post, ...patch } : post)));
        return { id, ...patch };
      }

      const snapshot = posts;
      setPosts((prev) => prev.map((post) => (post.id === id ? { ...post, ...patch } : post)));
      try {
        let uploadFailed = false;
        const images = await Promise.all(
          (patch.images || []).map(async (src) => {
            if (!String(src).startsWith('data:')) return src;
            try {
              return await uploadDataUrl('post-images', currentUser.id, src);
            } catch {
              uploadFailed = true;
              return src;
            }
          })
        );
        if (uploadFailed) {
          toast('Không upload được ảnh mới lên Storage, ảnh được lưu tạm trong bài đăng.', {
            icon: '⚠️',
          });
        }
        const saved = await updatePost(id, { ...patch, images });
        setPosts((prev) =>
          prev.map((post) => (post.id === id ? { ...post, ...patch, ...saved } : post))
        );
        return saved;
      } catch (error) {
        setPosts(snapshot);
        toast.error(`Không thể cập nhật tin: ${error.message}`);
        throw error;
      }
    },
    [currentUser.id, persistDemo, posts]
  );

  /**
   * Xoá tin: chuyển sang trạng thái 'deleted' để giữ lịch sử đăng tin.
   * deleted_by ghi nhận ai xoá (sinh viên tự xoá hay quản trị viên xoá).
   */
  const removePost = useCallback(
    async (id) => {
      const patch = {
        status: 'deleted',
        deleted_at: new Date().toISOString(),
        deleted_by: currentUser.id || null,
      };
      if (!isRemote()) {
        persistDemo(loadPosts().map((post) => (post.id === id ? { ...post, ...patch } : post)));
        return;
      }
      const snapshot = posts;
      setPosts((prev) => prev.map((post) => (post.id === id ? { ...post, ...patch } : post)));
      try {
        await deletePost(id, currentUser.id);
      } catch (error) {
        setPosts(snapshot);
        toast.error(`Không thể xóa tin: ${error.message}`);
      }
    },
    [currentUser.id, persistDemo, posts]
  );

  /** Đăng lại tin đã xoá: quay về trạng thái chưa bán. */
  const undeletePost = useCallback(
    async (id) => {
      const patch = { status: 'active', deleted_at: null, deleted_by: null };
      if (!isRemote()) {
        persistDemo(loadPosts().map((post) => (post.id === id ? { ...post, ...patch } : post)));
        return;
      }
      const snapshot = posts;
      setPosts((prev) => prev.map((post) => (post.id === id ? { ...post, ...patch } : post)));
      try {
        await restorePost(id);
      } catch (error) {
        setPosts(snapshot);
        toast.error(`Không thể đăng lại tin: ${error.message}`);
      }
    },
    [persistDemo, posts]
  );

  const setStatus = useCallback(
    async (id, status) => {
      const patch = {
        status,
        sold_at: status === 'sold' ? new Date().toISOString() : null,
      };
      if (!isRemote()) {
        persistDemo(loadPosts().map((post) => (post.id === id ? { ...post, ...patch } : post)));
        return;
      }
      setPosts((prev) => prev.map((post) => (post.id === id ? { ...post, ...patch } : post)));
      try {
        await updatePost(id, patch);
      } catch (error) {
        toast.error(`Không thể cập nhật trạng thái: ${error.message}`);
        reload();
      }
    },
    [persistDemo, reload]
  );

  const markSold = useCallback((id) => setStatus(id, 'sold'), [setStatus]);
  const relistPost = useCallback((id) => setStatus(id, 'active'), [setStatus]);

  const sendInquiry = useCallback(
    async (postId, message) => {
      const post = (isRemote() ? posts : loadPosts()).find((item) => item.id === postId);
      if (!post) throw new Error('Không tìm thấy tin đăng');
      const inquiry = await createInquiry({
        post,
        buyer: currentUser,
        message: message.trim(),
      });
      if (post.owner_id && post.owner_id !== currentUser.id) {
        await pushNotification({
          id: newId(),
          recipient_id: post.owner_id,
          actor_id: currentUser.id,
          actor_name: currentUser.full_name,
          type: 'post_inquiry',
          title: `${currentUser.full_name} hỏi mua ${post.title}`,
          body: message.trim(),
          link: `/marketplace/${post.id}`,
          read: false,
          created_at: new Date().toISOString(),
        });
      }
      return inquiry;
    },
    [currentUser, posts]
  );

  return {
    posts,
    loading,
    currentUser,
    reload,
    addPost,
    editPost,
    removePost,
    undeletePost,
    markSold,
    relistPost,
    sendInquiry,
  };
}
