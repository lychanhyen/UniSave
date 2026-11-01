import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import {
  isRemote,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../lib/api';
import { loadNotifications } from '../lib/demoData';
import { useCurrentUser } from './useCurrentUser';

export function useNotifications({ surface = 'all' } = {}) {
  const currentUser = useCurrentUser();
  const channelName = useRef(
    `unisave-notifications-${currentUser.id}-${Math.random().toString(36).slice(2, 8)}`
  ).current;
  const [notifications, setNotifications] = useState(() =>
    isRemote() ? [] : loadNotifications().filter((item) => item.recipient_id === currentUser.id)
  );
  const [loading, setLoading] = useState(isRemote());

  const refresh = useCallback(async () => {
    if (!currentUser.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    if (!isRemote()) {
      setNotifications(
        loadNotifications().filter((item) => item.recipient_id === currentUser.id)
      );
      return;
    }
    try {
      setNotifications(await fetchNotifications(currentUser.id));
    } catch (error) {
      toast.error(`Không tải được thông báo: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    refresh();
    if (!currentUser.id) return undefined;
    if (!isRemote()) {
      const handler = () => refresh();
      window.addEventListener('unisave:notifications', handler);
      return () => window.removeEventListener('unisave:notifications', handler);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${currentUser.id}`,
        },
        (payload) => {
          setNotifications((prev) => [
            payload.new,
            ...prev.filter((item) => item.id !== payload.new.id),
          ]);
          const isDesktop =
            typeof window !== 'undefined' &&
            window.matchMedia('(min-width: 1024px)').matches;
          const shouldToast =
            surface === 'all' || (surface === 'desktop' ? isDesktop : !isDesktop);
          if (shouldToast) {
            toast(payload.new.title || 'Bạn có thông báo mới', { icon: '🔔' });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${currentUser.id}`,
        },
        (payload) => {
          setNotifications((prev) =>
            prev.map((item) => (item.id === payload.new.id ? { ...item, ...payload.new } : item))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser.id, refresh, surface]);

  const markRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    try {
      await markNotificationRead(id);
    } catch {
      /* giữ trạng thái lạc quan, lần refresh sau sẽ đồng bộ lại */
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    try {
      await markAllNotificationsRead(currentUser.id);
    } catch {
      /* ignore */
    }
  }, [currentUser.id]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  return { notifications, unreadCount, loading, refresh, markRead, markAllRead };
}
