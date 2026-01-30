/**
 * Analytics utility functions for calculating statistics from receipts
 */

/**
 * Calculate total spending
 */
export const calculateTotalSpending = (receipts) => {
  return receipts.reduce((total, receipt) => {
    return total + (receipt.summary?.total || 0);
  }, 0);
};

/**
 * Calculate average receipt amount
 */
export const calculateAverageReceipt = (receipts) => {
  if (receipts.length === 0) return 0;
  return calculateTotalSpending(receipts) / receipts.length;
};

/**
 * Group spending by date for trend chart
 */
export const getSpendingByDate = (receipts) => {
  const spendingMap = new Map();

  receipts.forEach((receipt) => {
    const date = receipt.storeInfo?.date?.toDate?.() || receipt.createdAt?.toDate?.();
    if (!date) return;

    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    const current = spendingMap.get(dateKey) || 0;
    spendingMap.set(dateKey, current + (receipt.summary?.total || 0));
  });

  // Convert to array and sort by date
  return Array.from(spendingMap.entries())
    .map(([date, amount]) => ({
      date,
      amount: Number(amount.toFixed(2)),
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * Calculate spending by category
 */
export const getSpendingByCategory = (receipts) => {
  const categoryMap = new Map();

  receipts.forEach((receipt) => {
    receipt.items?.forEach((item) => {
      const category = item.category || 'other';
      const current = categoryMap.get(category) || 0;
      categoryMap.set(category, current + (item.totalPrice || 0));
    });
  });

  // Convert to array and sort by amount
  return Array.from(categoryMap.entries())
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Number(value.toFixed(2)),
    }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Calculate spending by store
 */
export const getSpendingByStore = (receipts) => {
  const storeMap = new Map();

  receipts.forEach((receipt) => {
    const store = receipt.storeInfo?.name || 'Unknown Store';
    const current = storeMap.get(store) || 0;
    storeMap.set(store, current + (receipt.summary?.total || 0));
  });

  // Convert to array and sort by amount
  return Array.from(storeMap.entries())
    .map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 stores
};

/**
 * Get monthly spending totals
 */
export const getMonthlySpending = (receipts) => {
  const monthlyMap = new Map();

  receipts.forEach((receipt) => {
    const date = receipt.storeInfo?.date?.toDate?.() || receipt.createdAt?.toDate?.();
    if (!date) return;

    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = monthlyMap.get(monthKey) || 0;
    monthlyMap.set(monthKey, current + (receipt.summary?.total || 0));
  });

  // Convert to array and sort
  return Array.from(monthlyMap.entries())
    .map(([month, amount]) => ({
      month,
      amount: Number(amount.toFixed(2)),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

/**
 * Calculate statistics summary
 */
export const calculateSummaryStats = (receipts) => {
  const total = calculateTotalSpending(receipts);
  const average = calculateAverageReceipt(receipts);

  // Find highest and lowest receipt
  const amounts = receipts.map((r) => r.summary?.total || 0).filter((a) => a > 0);
  const highest = amounts.length > 0 ? Math.max(...amounts) : 0;
  const lowest = amounts.length > 0 ? Math.min(...amounts) : 0;

  // Count unique stores
  const uniqueStores = new Set(receipts.map((r) => r.storeInfo?.name).filter(Boolean));

  return {
    totalSpending: total,
    averageReceipt: average,
    highestReceipt: highest,
    lowestReceipt: lowest,
    receiptCount: receipts.length,
    storeCount: uniqueStores.size,
  };
};
