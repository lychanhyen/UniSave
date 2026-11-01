import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useBudget() {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBudget();
  }, []);

  async function fetchBudget() {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('current_month', new Date().toISOString().slice(0, 7))
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      setBudget(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function setupBudget(totalAmount, month) {
    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        total_amount: totalAmount,
        total_days: new Date(new Date().getFullYear(), month, 0).getDate(),
        current_month: `${new Date().getFullYear()}-${String(month).padStart(2, '0')}`,
      })
      .select()
      .single();
    if (error) throw error;
    setBudget(data);
    return data;
  }

  return { budget, loading, error, setupBudget };
}