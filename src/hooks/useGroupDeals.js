import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useGroupDeals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    try {
      const { data, error } = await supabase
        .from('group_deals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDeals(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { deals, loading, error, fetchDeals };
}