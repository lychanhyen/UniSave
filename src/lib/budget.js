import { currentMonthKey } from './utils.js';

function daysInMonthOf(monthKey) {
  const [year, month] = String(monthKey).split('-').map(Number);
  return new Date(year, month, 0).getDate();
}

function sumAmount(list) {
  return (list || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

/**
 * Core budget engine.
 *
 * M  = tổng ngân sách tháng
 * S0 = 10% M đưa vào heo đất ngay từ đầu
 * D  = số ngày trong tháng
 *
 * Hạn mức mỗi ngày được tính lại liên tục dựa trên số tiền còn lại và số
 * ngày còn lại. Ngày nào chi ít hơn hạn mức thì phần dư chảy vào heo đất;
 * ngày nào vượt hạn mức thì phần vượt bị trừ vào quỹ những ngày sau.
 *
 * Khoản phát sinh đột xuất (sửa xe, y tế...) được tách khỏi hạn mức
 * ăn uống/sinh hoạt: tổng đột xuất của tháng được trừ đều vào quỹ chung
 * ngay từ đầu, tương đương mỗi ngày giảm một phần nhỏ bằng
 * tổng đột xuất / số ngày trong tháng. Nhờ vậy một khoản 500.000đ phát
 * sinh cuối tháng không làm hạn mức những ngày cuối sụp về 0; phần đã chi
 * trước đó được bù bằng heo đất.
 */
export function computeBudgetState(budget = {}, expenses = [], now = new Date()) {
  const monthKey = budget?.current_month || currentMonthKey();
  const D = Number(budget?.total_days) || daysInMonthOf(monthKey);
  const M = Number(budget?.total_amount) || 0;
  const S0 = Math.round(M * 0.1);

  const monthExpenses = (expenses || []).filter((e) =>
    String(e.date || '').startsWith(monthKey)
  );
  const regularExpenses = monthExpenses.filter((e) => !e.is_unexpected);
  const unexpectedExpenses = monthExpenses.filter((e) => e.is_unexpected);

  const regularSpentTotal = sumAmount(regularExpenses);
  const unexpectedTotal = sumAmount(unexpectedExpenses);
  const totalSpent = regularSpentTotal + unexpectedTotal;

  const regularByDay = Array.from({ length: D + 1 }, () => 0);
  const unexpectedByDay = Array.from({ length: D + 1 }, () => 0);
  let firstSpendDay = D;

  for (const e of monthExpenses) {
    const day = Number(String(e.date).slice(8, 10));
    if (day >= 1 && day <= D) {
      if (e.is_unexpected) unexpectedByDay[day] += Number(e.amount) || 0;
      else regularByDay[day] += Number(e.amount) || 0;
      firstSpendDay = Math.min(firstSpendDay, day);
    }
  }

  const thisMonthKey = currentMonthKey();
  const isCurrentMonth = monthKey === thisMonthKey;
  const today = isCurrentMonth ? Math.min(now.getDate(), D) : D;

  // Trừ toàn bộ khoản đột xuất của tháng khỏi quỹ chi tiêu ngay từ đầu.
  // Hạn mức mỗi ngày vì thế chỉ giảm một phần nhỏ, đều nhau cho cả tháng.
  let pool = M - S0 - unexpectedTotal;
  let piggy = S0;
  if (pool < 0) {
    piggy += pool;
    pool = 0;
  }
  let overspendTotal = 0;
  let todayLimit = 0;
  let todaySpent = 0;
  let todayUnexpected = 0;

  for (let day = 1; day <= today; day += 1) {
    const daysLeftIncludingToday = D - day + 1;
    const limit = daysLeftIncludingToday > 0 ? pool / daysLeftIncludingToday : 0;
    const spent = regularByDay[day] || 0;
    // Ngày hôm nay chưa kết thúc nên phần dư chỉ được chuyển vào heo đất
    // khi sang ngày mới. Nhờ vậy "Heo đất hiện tại" không cộng trước tiền
    // chưa tiêu, còn dự báo cuối tháng vẫn tính đủ phần dư hôm nay.
    const isElapsedDay = day < today || !isCurrentMonth;

    pool -= limit;

    if (spent <= limit) {
      if (isElapsedDay) piggy += limit - spent;
    } else {
      const over = spent - limit;
      overspendTotal += over;
      pool -= over;
      if (pool < 0) {
        piggy += pool;
        pool = 0;
      }
    }

    if (day === today) {
      todayLimit = Math.max(0, limit);
      todaySpent = spent;
      todayUnexpected = unexpectedByDay[day] || 0;
    }
  }

  const daysLeft = Math.max(0, D - today);
  const dailyLimit = daysLeft > 0 ? Math.max(0, pool) / daysLeft : 0;
  const remaining = M - totalSpent;
  const percent = M > 0 ? Math.min(100, (totalSpent / M) * 100) : 0;

  const todayRemaining = Math.max(0, todayLimit - todaySpent);
  const todayRemainingRatio = todayLimit > 0 ? todayRemaining / todayLimit : todaySpent > 0 ? 0 : 1;
  const todayPercentUsed =
    todayLimit > 0 ? Math.min(100, (todaySpent / todayLimit) * 100) : todaySpent > 0 ? 100 : 0;
  const overspendToday = Math.max(0, todaySpent - todayLimit);

  let fundStatus = 'safe';
  if (todayLimit <= 0) fundStatus = todaySpent > 0 ? 'over' : 'empty';
  else if (todaySpent > todayLimit) fundStatus = 'over';
  else if (todayRemainingRatio <= 0.3) fundStatus = 'warning';

  // Dự báo heo đất cuối tháng:
  // - Heo đất hiện tại chưa gồm phần dư của hôm nay (ngày chưa kết thúc).
  // - Nếu giữ đúng hạn mức mỗi ngày: heo đất + phần dư còn lại hôm nay.
  // - Nếu giữ mức chi trung bình hiện tại: phần dư mỗi ngày còn lại chảy thêm.
  const observedDays =
    regularSpentTotal > 0 ? Math.max(1, today - Math.min(firstSpendDay, today) + 1) : 0;
  const avgDailySpend = observedDays > 0 ? regularSpentTotal / observedDays : 0;
  const projectedDailySpend =
    regularSpentTotal > 0 ? Math.min(avgDailySpend, dailyLimit || avgDailySpend) : 0;
  const forecastExtra = Math.max(0, dailyLimit - projectedDailySpend) * daysLeft;
  const pendingToday = isCurrentMonth ? todayRemaining : 0;
  const forecastPiggy = Math.round(piggy + pendingToday + forecastExtra);
  const forecastIfOnBudget = Math.round(piggy + pendingToday);
  const forecastReward = Math.max(0, forecastPiggy - Math.round(piggy));

  return {
    monthKey,
    M,
    D,
    S0,
    totalSpent,
    regularSpentTotal,
    unexpectedTotal,
    remaining,
    percent,
    today,
    daysLeft,
    todayLimit,
    todaySpent,
    todayUnexpected,
    todaySpentAll: todaySpent + todayUnexpected,
    todayRemaining,
    todayRemainingRatio,
    todayPercentUsed,
    fundStatus,
    overspendToday,
    overspendTotal,
    dailyLimit,
    pool: Math.max(0, pool),
    piggyBank: Math.round(piggy),
    savingsTarget: Math.round(M * 0.25),
    avgDailySpend: Math.round(avgDailySpend),
    projectedDailySpend: Math.round(projectedDailySpend),
    forecastPiggy,
    forecastIfOnBudget,
    forecastReward,
    isOverBudget: totalSpent > M,
    isOverSafeBudget: totalSpent > M - S0,
    monthExpenses,
    regularExpenses,
    unexpectedExpenses,
    regularByDay,
    unexpectedByDay,
  };
}
