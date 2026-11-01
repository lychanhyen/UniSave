import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { isRemote, fetchReports, resolveReport } from '../lib/api';
import { loadReports } from '../lib/demoData';
import { useCurrentUser } from './useCurrentUser';

export function useReports() {
  const currentUser = useCurrentUser();
  const channelName = useRef(`unisave-reports-${Math.random().toString(36).slice(2, 9)}`).current;
  const [reports, setReports] = useState(() => (isRemote() ? [] : loadReports()));
  const [loading, setLoading] = useState(isRemote());

  const reload = useCallback(async () => {
    if (!isRemote()) {
      setReports(loadReports());
      return;
    }
    setLoading(true);
    try {
      setReports(await fetchReports());
    } catch (error) {
      toast.error(`Không tải được tố cáo: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    if (!isRemote()) {
      const handler = () => reload();
      window.addEventListener('unisave:reports', handler);
      return () => window.removeEventListener('unisave:reports', handler);
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, reload)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, reload]);

  const resolve = useCallback(
    async (reportId, patch) => {
      const snapshot = reports;
      setReports((prev) =>
        prev.map((report) => (report.id === reportId ? { ...report, ...patch } : report))
      );
      try {
        await resolveReport(reportId, patch, currentUser);
        if (!isRemote()) reload();
      } catch (error) {
        setReports(snapshot);
        toast.error(`Không xử lý được tố cáo: ${error.message}`);
        throw error;
      }
    },
    [currentUser, reload, reports]
  );

  return {
    reports,
    loading,
    reload,
    resolve,
    openCount: reports.filter((report) => report.status === 'open').length,
  };
}
