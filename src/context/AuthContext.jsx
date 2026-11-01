import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { uploadStudentCard } from '../lib/api';
import {
  clearSession,
  getSessionAccount,
  loginDemo,
  publicAccount,
  registerDemo,
} from '../lib/demoAuth';

const AuthContext = createContext(null);

function normalizeRemoteUser(authUser, profile) {
  const meta = authUser?.user_metadata || {};
  return {
    id: authUser?.id,
    email: authUser?.email || profile?.email || '',
    full_name: profile?.full_name || meta.full_name || 'Sinh viên UniSave',
    student_code: profile?.student_code || meta.student_code || '',
    campus: profile?.campus || meta.campus || 'khac',
    avatar_url: profile?.avatar_url || '',
    student_card_url: profile?.student_card_url || '',
    role: profile?.role === 'admin' ? 'admin' : 'student',
    is_verified: Boolean(profile?.is_verified),
    verification_status: profile?.verification_status || (profile?.is_verified ? 'approved' : 'none'),
    verification_note: profile?.verification_note || '',
    is_locked: Boolean(profile?.is_locked),
    created_at: profile?.created_at || null,
  };
}

export function AuthProvider({ children }) {
  const demoMode = !isSupabaseConfigured();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ------------------------------ Demo mode ------------------------------ */
  useEffect(() => {
    if (!demoMode) return undefined;

    function sync() {
      const account = getSessionAccount();
      if (!account) {
        setUser(null);
        return;
      }
      if (account.is_locked) {
        clearSession();
        setUser(null);
        toast.error('Tài khoản của bạn đã bị khóa do vi phạm quy định.');
        return;
      }
      setUser(publicAccount(account));
    }

    sync();
    setLoading(false);

    const onStorage = (event) => {
      if (!event.key || event.key.startsWith('unisave:')) sync();
    };
    window.addEventListener('unisave:accounts', sync);
    window.addEventListener('unisave:session', sync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('unisave:accounts', sync);
      window.removeEventListener('unisave:session', sync);
      window.removeEventListener('storage', onStorage);
    };
  }, [demoMode]);

  /* ----------------------------- Supabase mode --------------------------- */
  useEffect(() => {
    if (demoMode) return undefined;

    let mounted = true;

    async function hydrate(authUser) {
      if (!authUser) {
        if (mounted) setUser(null);
        return;
      }
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (!mounted) return;

        if (profile?.is_locked) {
          await supabase.auth.signOut();
          setUser(null);
          toast.error('Tài khoản của bạn đã bị khóa do vi phạm quy định.');
          return;
        }
        setUser(normalizeRemoteUser(authUser, profile));
      } catch {
        if (mounted) setUser(normalizeRemoteUser(authUser, null));
      }
    }

    async function init() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        await hydrate(session?.user || null);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }
      // Tránh deadlock: không await supabase bên trong callback này.
      setTimeout(() => {
        if (mounted) hydrate(session.user);
      }, 0);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [demoMode]);

  /* ------------------- Theo dõi thay đổi hồ sơ của chính mình ------------------- */
  useEffect(() => {
    if (demoMode || !user?.id) return undefined;

    const channel = supabase
      .channel(`unisave-my-profile-${user.id}-${Math.random().toString(36).slice(2, 8)}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        async (payload) => {
          if (payload.new?.is_locked) {
            await supabase.auth.signOut();
            setUser(null);
            toast.error('Tài khoản của bạn đã bị khóa do vi phạm quy định.');
            return;
          }
          setUser((prev) => (prev ? { ...prev, ...payload.new } : prev));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [demoMode, user?.id]);

  async function login(email, password) {
    if (demoMode) {
      const account = loginDemo(email, password);
      setUser(account);
      return account;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profile?.is_locked) {
      await supabase.auth.signOut();
      throw new Error('Tài khoản của bạn đã bị khóa do vi phạm quy định.');
    }

    const next = normalizeRemoteUser(data.user, profile);
    setUser(next);
    return next;
  }

  async function register({
    fullName,
    email,
    password,
    studentCode,
    campus = 'khac',
    role = 'student',
    studentCardUrl = '',
    inviteCode = '',
  }) {
    if (demoMode) {
      const account = registerDemo({
        fullName,
        email,
        password,
        studentCode,
        campus,
        role,
        studentCardUrl,
        inviteCode,
      });
      setUser(account);
      return { user: account, needsConfirmation: false };
    }

    if (role === 'admin') {
      throw new Error(
        'Tài khoản quản trị được tạo bằng SQL trong Supabase. Xem hướng dẫn trong supabase/README.md.'
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, student_code: studentCode, campus } },
    });
    if (error) throw error;

    if (data.session?.user) {
      let cardPath = '';
      if (studentCardUrl) {
        try {
          cardPath = await uploadStudentCard(data.session.user.id, studentCardUrl);
          if (cardPath) {
            await supabase
              .from('profiles')
              .update({ student_card_url: cardPath })
              .eq('id', data.session.user.id);
          }
        } catch {
          toast.error('Chưa tải được ảnh thẻ sinh viên. Bạn có thể tải lại trong Hồ sơ.');
        }
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .maybeSingle();
      const next = normalizeRemoteUser(data.session.user, profile);
      setUser(next);
      return { user: next, needsConfirmation: false };
    }

    return { user: null, needsConfirmation: true };
  }

  async function logout() {
    if (demoMode) {
      clearSession();
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
  }

  async function refreshUser() {
    if (demoMode) {
      const account = getSessionAccount();
      if (!account) {
        setUser(null);
        return null;
      }
      const next = publicAccount(account);
      setUser(next);
      return next;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setUser(null);
      return null;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
    if (profile?.is_locked) {
      await supabase.auth.signOut();
      setUser(null);
      throw new Error('Tài khoản đã bị khóa.');
    }
    const next = normalizeRemoteUser(session.user, profile);
    setUser(next);
    return next;
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      demoMode,
      login,
      register,
      logout,
      refreshUser,
      isAdmin: user?.role === 'admin',
      isVerified: Boolean(user?.is_verified),
      isLocked: Boolean(user?.is_locked),
    }),
    [user, loading, demoMode]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
