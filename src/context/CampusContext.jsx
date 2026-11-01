import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  createCampus as createCampusRemote,
  deleteCampus as deleteCampusRemote,
  fetchCampuses,
  updateCampus as updateCampusRemote,
} from '../lib/api';
import {
  DEFAULT_CAMPUSES,
  buildCampusMap,
  campusLabelOf,
  normalizeCampus,
  sortCampuses,
} from '../lib/campuses';
import { loadCampuses } from '../lib/demoData';

/**
 * Khu vực dùng chung toàn ứng dụng.
 *
 * Quản trị viên sửa danh sách ở /admin/campuses; form đăng ký, form đăng tin,
 * bộ lọc chợ và các bảng quản trị đều đọc từ đây nên chỉ cần cấu hình một lần.
 */
const CampusContext = createContext(null);

export function CampusProvider({ children }) {
  const remote = isSupabaseConfigured();
  const channelName = useRef(`unisave-campuses-${Math.random().toString(36).slice(2, 9)}`).current;

  const [campuses, setCampuses] = useState(() =>
    sortCampuses((remote ? DEFAULT_CAMPUSES : loadCampuses()).map(normalizeCampus))
  );
  const [loading, setLoading] = useState(remote);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setCampuses(sortCampuses(loadCampuses()));
      setLoading(false);
      return;
    }
    try {
      const list = await fetchCampuses();
      setCampuses(sortCampuses(list));
      setError('');
    } catch (err) {
      setError(err.message || 'Không tải được danh sách khu vực.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();

    if (!isSupabaseConfigured()) {
      const handler = () => reload();
      window.addEventListener('unisave:campuses', handler);
      return () => window.removeEventListener('unisave:campuses', handler);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'campuses' },
        () => reload()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, reload]);

  const active = useMemo(() => campuses.filter((item) => item.is_active), [campuses]);
  const map = useMemo(() => buildCampusMap(campuses), [campuses]);

  const create = useCallback(async (input) => {
    const created = await createCampusRemote(input);
    if (!isSupabaseConfigured()) {
      setCampuses(sortCampuses(loadCampuses()));
    } else {
      setCampuses((prev) => sortCampuses([...prev, created]));
    }
    return created;
  }, []);

  const update = useCallback(async (value, patch) => {
    const updated = await updateCampusRemote(value, patch);
    if (!isSupabaseConfigured()) {
      setCampuses(sortCampuses(loadCampuses()));
    } else {
      setCampuses((prev) =>
        sortCampuses(prev.map((item) => (item.value === value ? { ...item, ...updated } : item)))
      );
    }
    return updated;
  }, []);

  const remove = useCallback(async (value) => {
    await deleteCampusRemote(value);
    if (!isSupabaseConfigured()) {
      setCampuses(sortCampuses(loadCampuses()));
    } else {
      setCampuses((prev) => prev.filter((item) => item.value !== value));
    }
  }, []);

  /** Đổi thứ tự bằng cách đặt sort_order ngay trước/sau khu vực liền kề. */
  const move = useCallback(
    async (value, direction) => {
      const list = [...campuses].sort(
        (a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label, 'vi')
      );
      const index = list.findIndex((item) => item.value === value);
      const targetIndex = index + (direction === 'up' ? -1 : 1);
      if (index === -1 || targetIndex < 0 || targetIndex >= list.length) return;
      const neighbour = list[targetIndex];
      const nextOrder =
        direction === 'up' ? neighbour.sort_order - 5 : neighbour.sort_order + 5;
      await updateCampusRemote(value, { sort_order: nextOrder });
      if (!isSupabaseConfigured()) {
        setCampuses(sortCampuses(loadCampuses()));
      } else {
        await reload();
      }
    },
    [campuses, reload]
  );

  const value = useMemo(
    () => ({
      campuses,
      active,
      map,
      loading,
      error,
      reload,
      create,
      update,
      remove,
      move,
      labelOf: (campus) => campusLabelOf(map, campus),
      itemOf: (campus) => map[campus] || null,
      count: campuses.length,
      activeCount: active.length,
    }),
    [campuses, active, map, loading, error, reload, create, update, remove, move]
  );

  return <CampusContext.Provider value={value}>{children}</CampusContext.Provider>;
}

export function useCampuses() {
  const ctx = useContext(CampusContext);
  if (!ctx) throw new Error('useCampuses must be used within CampusProvider');
  return ctx;
}
