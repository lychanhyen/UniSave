import { useCallback, useEffect, useState } from 'react';
import { fetchPublicProfile } from '../lib/api';

/** Hồ sơ công khai của một sinh viên: thông tin, số liệu, tin và kèo gần đây. */
export function usePublicProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchPublicProfile(userId);
      setProfile(data.profile);
      setStats(data.stats);
      setPosts(data.posts);
      setDeals(data.deals);
    } catch (problem) {
      setProfile(null);
      setError(problem.message || 'Không tải được trang cá nhân.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { profile, stats, posts, deals, loading, error, reload: load };
}
