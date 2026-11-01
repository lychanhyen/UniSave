import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import {
  isRemote,
  fetchAccounts,
  adminSetLocked,
  adminSetVerification,
} from '../lib/api';
import { listStudents } from '../lib/demoAuth';
import { useCurrentUser } from './useCurrentUser';

export function useAdminUsers() {
  const currentUser = useCurrentUser();
  const channelName = useRef(`unisave-admin-users-${Math.random().toString(36).slice(2, 9)}`)
    .current;
  const [users, setUsers] = useState(() => (isRemote() ? [] : listStudents()));
  const [loading, setLoading] = useState(isRemote());

  const reload = useCallback(async () => {
    if (!isRemote()) {
      setUsers(listStudents());
      return;
    }
    setLoading(true);
    try {
      setUsers(await fetchAccounts());
    } catch (error) {
      toast.error(`Không tải được danh sách sinh viên: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    if (!isRemote()) {
      const handler = () => reload();
      window.addEventListener('unisave:accounts', handler);
      return () => window.removeEventListener('unisave:accounts', handler);
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, reload)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, reload]);

  const setVerification = useCallback(
    async (userId, status, note) => {
      await adminSetVerification(userId, status, note, currentUser);
      await reload();
    },
    [currentUser, reload]
  );

  const approve = useCallback(
    (userId, note) => setVerification(userId, 'approved', note),
    [setVerification]
  );

  const reject = useCallback(
    (userId, note) => setVerification(userId, 'rejected', note),
    [setVerification]
  );

  const setLocked = useCallback(
    async (userId, locked, note) => {
      await adminSetLocked(userId, locked, note, currentUser);
      await reload();
    },
    [currentUser, reload]
  );

  const lock = useCallback((userId, note) => setLocked(userId, true, note), [setLocked]);
  const unlock = useCallback((userId, note) => setLocked(userId, false, note), [setLocked]);

  return {
    users,
    loading,
    reload,
    approve,
    reject,
    lock,
    unlock,
    pendingCount: users.filter((user) => user.verification_status === 'pending').length,
    verifiedCount: users.filter((user) => user.is_verified).length,
    lockedCount: users.filter((user) => user.is_locked).length,
  };
}
