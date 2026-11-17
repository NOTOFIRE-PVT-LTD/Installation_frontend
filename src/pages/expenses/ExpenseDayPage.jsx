import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import PageHeader from '../../components/common/PageHeader';
import { VISIT_EXPENSE_STATUS } from '../../utils/constants';
import { computeExpenseDayTotals } from './expenseDayCalculations';
import { useExpenseDayPage } from './useExpenseDayPage';
import ExpenseDayClaimModeSection from './ExpenseDayClaimModeSection';
import ExpensePerVisitItems from './ExpensePerVisitItems';
import ExpenseDayTotalSection from './ExpenseDayTotalSection';
import ExpenseSummarySection from './ExpenseSummarySection';
import ExpenseDayDraftActions from './ExpenseDayDraftActions';

export default function ExpenseDayPage() {
  const {
    expense,
    busy,
    draft,
    items,
    claimMode,
    isAdmin,
    patchItem,
    setClaimMode,
    setDayTotalAmount,
    setGstAmount,
    save,
    submit,
    uploadTicket,
  } = useExpenseDayPage();

  if (!expense) return null;

  const totals = computeExpenseDayTotals(expense, items, claimMode);

  return (
    <>
      <PageHeader
        title={`Expenses · ${expense.date}`}
        subtitle={`${items.length} visits · ${totals.liveTotalKm || 0} km · ₹${Number(totals.liveTotal || 0).toLocaleString('en-IN')}`}
      />
      <Chip
        label={expense.status.replaceAll('_', ' ')}
        sx={{ mb: 2 }}
        color={expense.status === VISIT_EXPENSE_STATUS.APPROVED ? 'success' : 'default'}
      />
      {expense.adminComment && (
        <Typography sx={{ mb: 2 }} color="error">
          Admin: {expense.adminComment}
        </Typography>
      )}
      <ExpenseDayClaimModeSection
        draft={draft}
        isAdmin={isAdmin}
        claimMode={claimMode}
        perVisitMode={totals.perVisitMode}
        onClaimModeChange={setClaimMode}
      />
      {totals.perVisitMode ? (
        <ExpensePerVisitItems
          liveItems={totals.liveItems}
          draft={draft}
          onPatchItem={patchItem}
          onUploadTicket={uploadTicket}
        />
      ) : (
        <ExpenseDayTotalSection
          draft={draft}
          isAdmin={isAdmin}
          itemsLength={items.length}
          liveTotalKm={totals.liveTotalKm}
          dayTotalAmount={totals.dayTotalAmount}
          expenseDayTotalRaw={expense.dayTotalAmount}
          onDayTotalChange={setDayTotalAmount}
        />
      )}
      <ExpenseSummarySection
        expense={expense}
        itemsLength={items.length}
        liveTotalKm={totals.liveTotalKm}
        perVisitMode={totals.perVisitMode}
        privateKm={totals.privateKm}
        privateAmount={totals.privateAmount}
        publicAmount={totals.publicAmount}
        dayTotalAmount={totals.dayTotalAmount}
        gstAmount={totals.gstAmount}
        liveTotal={totals.liveTotal}
        draft={draft}
        isAdmin={isAdmin}
        expenseGstRaw={expense.gstAmount}
        onGstChange={setGstAmount}
      />
      {draft && !isAdmin && <ExpenseDayDraftActions busy={busy} onSave={save} onSubmit={submit} />}
    </>
  );
}