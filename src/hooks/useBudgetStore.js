import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  isRemote,
  newId,
  fetchExpenses,
  createExpense,
  deleteExpense,
  fetchBudget,
  saveBudgetRemote,
} from '../lib/api';
import { loadBudget, saveBudget, loadExpenses, saveExpenses } from '../lib/demoData';
import { computeBudgetState } from '../lib/budget';
import { currentMonthKey, todayKey } from '../lib/utils';
import { useCurrentUser } from './useCurrentUser';

function defaultBudget() {
  const now = new Date();
  return {
    total_amount: 5000000,
    total_days: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
    current_month: currentMonthKey(),
  };
}

const DEFAULT_BUDGET = defaultBudget();

export function useBudgetStore() {
  const currentUser = useCurrentUser();
  const [budget, setBudget] = useState(() =>
    isRemote() ? DEFAULT_BUDGET : loadBudget() || DEFAULT_BUDGET
  );
  const [expenses, setExpenses] = useState(() => (isRemote() ? [] : loadExpenses()));
  const [loading, setLoading] = useState(isRemote());

  useEffect(() => {
    if (!isRemote()) return undefined;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [remoteBudget, remoteExpenses] = await Promise.all([
          fetchBudget(currentUser.id, currentMonthKey()),
          fetchExpenses(currentUser.id),
        ]);
        if (!mounted) return;
        if (remoteBudget) setBudget(remoteBudget);
        setExpenses(remoteExpenses);
      } catch (error) {
        toast.error(`Không tải được dữ liệu ngân sách: ${error.message}`);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [currentUser.id]);

  useEffect(() => {
    const monthKey = currentMonthKey();
    if (budget.current_month === monthKey) return;
    const now = new Date();
    const next = {
      ...budget,
      current_month: monthKey,
      total_days: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
    };
    setBudget(next);
    if (isRemote()) {
      saveBudgetRemote(currentUser.id, next).catch((error) =>
        toast.error(`Không thể chuyển tháng ngân sách: ${error.message}`)
      );
    } else {
      saveBudget(next);
    }
  }, [budget, currentUser.id]);

  const addExpense = useCallback(
    async (expense) => {
      const item = {
        id: newId(),
        date: todayKey(),
        is_unexpected: false,
        unexpected_reason: '',
        ...expense,
      };

      if (!isRemote()) {
        const next = [item, ...loadExpenses()];
        saveExpenses(next);
        setExpenses(next);
        return item;
      }

      setExpenses((prev) => [item, ...prev]);
      try {
        const saved = await createExpense(currentUser.id, item);
        setExpenses((prev) => prev.map((row) => (row.id === item.id ? saved : row)));
        return saved;
      } catch (error) {
        setExpenses((prev) => prev.filter((row) => row.id !== item.id));
        toast.error(`Không thể thêm chi tiêu: ${error.message}`);
        throw error;
      }
    },
    [currentUser.id]
  );

  const removeExpense = useCallback(
    async (id) => {
      if (!isRemote()) {
        const next = loadExpenses().filter((expense) => expense.id !== id);
        saveExpenses(next);
        setExpenses(next);
        return;
      }
      const snapshot = expenses;
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
      try {
        await deleteExpense(id);
      } catch (error) {
        setExpenses(snapshot);
        toast.error(`Không thể xóa chi tiêu: ${error.message}`);
      }
    },
    [expenses]
  );

  const updateBudget = useCallback(
    (totalAmount, month = new Date().getMonth() + 1) => {
      const year = new Date().getFullYear();
      const days = new Date(year, month, 0).getDate();
      const next = {
        total_amount: Number(totalAmount),
        total_days: days,
        current_month: `${year}-${String(month).padStart(2, '0')}`,
      };
      setBudget(next);
      if (isRemote()) {
        saveBudgetRemote(currentUser.id, next).catch((error) =>
          toast.error(`Không thể lưu ngân sách: ${error.message}`)
        );
      } else {
        saveBudget(next);
      }
      return next;
    },
    [currentUser.id]
  );

  const state = useMemo(() => computeBudgetState(budget, expenses), [budget, expenses]);

  return { budget, expenses, state, loading, addExpense, removeExpense, updateBudget };
}
