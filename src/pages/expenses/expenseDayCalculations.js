import { PRIVATE_KM_RATE, TRANSPORT_MODE, VISIT_EXPENSE_CLAIM_MODE } from '../../utils/constants';

export function itemAmount(row) {
  if (row.transportMode === TRANSPORT_MODE.PRIVATE) {
    return Math.round((Number(row.distanceKm) || 0) * PRIVATE_KM_RATE);
  }
  return Math.max(0, Number(row.fare) || 0);
}

function sumByMode(liveItems, isPrivate) {
  return liveItems
    .filter((row) => (isPrivate ? row.transportMode === TRANSPORT_MODE.PRIVATE : row.transportMode !== TRANSPORT_MODE.PRIVATE))
    .reduce(
      (acc, row) => ({
        km: acc.km + (Number(row.distanceKm) || 0),
        amount: acc.amount + row.amount,
      }),
      { km: 0, amount: 0 },
    );
}

export function computeExpenseDayTotals(expense, items, claimMode) {
  const liveItems = items.map((row) => ({ ...row, amount: itemAmount(row) }));
  const privateTotals = sumByMode(liveItems, true);
  const publicTotals = sumByMode(liveItems, false);
  const liveTotalKm = liveItems.reduce((sum, row) => sum + (Number(row.distanceKm) || 0), 0);
  const gstAmount = Math.max(0, Number(expense.gstAmount) || 0);
  const dayTotalAmount = Math.max(0, Number(expense.dayTotalAmount) || 0);
  const perVisitMode = claimMode === VISIT_EXPENSE_CLAIM_MODE.PER_VISIT;
  const liveTravel = privateTotals.amount + publicTotals.amount;
  const liveTotal =
    (claimMode === VISIT_EXPENSE_CLAIM_MODE.DAY_TOTAL ? dayTotalAmount : liveTravel) + gstAmount;

  return {
    liveItems,
    privateKm: privateTotals.km,
    privateAmount: privateTotals.amount,
    publicAmount: publicTotals.amount,
    liveTotalKm,
    gstAmount,
    dayTotalAmount,
    liveTotal,
    perVisitMode,
  };
}