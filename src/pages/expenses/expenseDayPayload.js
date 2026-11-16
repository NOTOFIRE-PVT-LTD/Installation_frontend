export function buildExpenseUpdatePayload(expense, items, claimMode) {
  return {
    claimMode,
    dayTotalAmount: expense.dayTotalAmount || 0,
    items: items.map((row) => ({
      visit: row.visit?._id || row.visit,
      transportMode: row.transportMode,
      fare: row.fare,
    })),
    gstAmount: expense.gstAmount || 0,
  };
}