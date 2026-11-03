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
  fetchIncomes,
  createIncome,
  deleteIncome,
} from '../lib/api';
import { loadBudget, saveBudget, loadExpenses, saveExpenses, loadIncomes, saveIncomes } from '../lib/demoData';
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
  const [incomes, setIncomes] = useState(() => (isRemote() ? [] : loadIncomes()));
  const [loading, setLoading] = useState(isRemote());

  useEffect(() => {
    if (!isRemote()) return undefined;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [remoteBudget, remoteExpenses, remoteIncomes] = await Promise.all([
          fetchBudget(currentUser.id, currentMonthKey()),
          fetchExpenses(currentUser.id),
          fetchIncomes(currentUser.id),
        ]);
        if (!mounted) return;
        if (remoteBudget) setBudget(remoteBudget);
        setExpenses(remoteExpenses);
        setIncomes(remoteIncomes);
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


  /** Thêm thu nhập: ghi một dòng riêng rồi cộng thẳng vào ngân sách tháng. */
  const addIncome = useCallback(
    async (income) => {
      const item = {
        amount: Number(income.amount) || 0,
        source: income.source || 'other',
        note: String(income.note || '').trim(),
        date: income.date || todayKey(),
      };
      if (item.amount <= 0) throw new Error('Số tiền thu nhập phải lớn hơn 0.');

      const nextBudget = {
        ...budget,
        total_amount: (Number(budget.total_amount) || 0) + item.amount,
      };

      if (!isRemote()) {
        const saved = { ...item, id: newId(), created_at: new Date().toISOString() };
        const nextIncomes = [saved, ...loadIncomes()];
        saveIncomes(nextIncomes);
        setIncomes(nextIncomes);
        saveBudget(nextBudget);
        setBudget(nextBudget);
        return saved;
      }

      const saved = await createIncome(currentUser.id, item);
      setIncomes((prev) => [saved, ...prev]);
      setBudget(nextBudget);
      saveBudgetRemote(currentUser.id, nextBudget).catch((error) =>
        toast.error(`Không lưu được ngân sách: ${error.message}`)
      );
      return saved;
    },
    [budget, currentUser.id]
  );

  /** Xoá thu nhập: trừ lại đúng số tiền đã cộng vào ngân sách. */
  const removeIncome = useCallback(
    async (id) => {
      const target = incomes.find((item) => item.id === id);
      if (!target) return;
      const nextBudget = {
        ...budget,
        total_amount: Math.max(0, (Number(budget.total_amount) || 0) - (Number(target.amount) || 0)),
      };

      const snapshot = incomes;
      setIncomes((prev) => prev.filter((item) => item.id !== id));
      setBudget(nextBudget);

      try {
        await deleteIncome(id);
        if (isRemote()) {
          await saveBudgetRemote(currentUser.id, nextBudget);
        } else {
          saveBudget(nextBudget);
        }
      } catch (error) {
        setIncomes(snapshot);
        setBudget(budget);
        toast.error(`Không xoá được thu nhập: ${error.message}`);
      }
    },
    [budget, currentUser.id, incomes]
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

  return {
    budget,
    expenses,
    incomes,
    state,
    loading,
    addExpense,
    removeExpense,
    addIncome,
    removeIncome,
    updateBudget,
  };
}
