import QuickCustomerDialog from '../../components/customers/QuickCustomerDialog';
import VisitPlanAdminSalespersonField from './VisitPlanAdminSalespersonField';
import VisitPlanScopeControls from './VisitPlanScopeControls';
import VisitPlanVisitsEditor from './VisitPlanVisitsEditor';
import VisitPlanSaveFooter from './VisitPlanSaveFooter';

export default function VisitPlanFormBody({
  form,
  compact,
  scrollable,
  pageLayout,
  onCancel,
}) {
  const {
    isAdmin,
    selectedSalesperson,
    setSelectedSalesperson,
    salespeople,
    scope,
    planDate,
    weekStart,
    customers,
    customerModal,
    setCustomerModal,
    submitting,
    visits,
    handleScopeChange,
    handlePlanDateChange,
    handleWeekStartChange,
    addVisitRow,
    removeVisitRow,
    updateVisit,
    openCustomerModal,
    handleCustomerCreated,
    handleSaveAll,
  } = form;

  return (
    <>
      {isAdmin ? (
        <VisitPlanAdminSalespersonField
          salespeople={salespeople}
          selectedSalesperson={selectedSalesperson}
          onChange={setSelectedSalesperson}
          compact={compact}
        />
      ) : null}

      <VisitPlanScopeControls
        compact={compact}
        pageLayout={pageLayout}
        scope={scope}
        planDate={planDate}
        weekStart={weekStart}
        onScopeChange={handleScopeChange}
        onPlanDateChange={handlePlanDateChange}
        onWeekStartChange={handleWeekStartChange}
      />

      <VisitPlanVisitsEditor
        scrollable={scrollable}
        pageLayout={pageLayout}
        visits={visits}
        scope={scope}
        customers={customers}
        onAdd={addVisitRow}
        onUpdate={updateVisit}
        onRemove={removeVisitRow}
        onOpenCustomerModal={openCustomerModal}
      />

      <VisitPlanSaveFooter
        submitting={submitting}
        visitCount={visits.length}
        onCancel={onCancel}
        onSave={handleSaveAll}
        footerMt={compact ? 2 : 3}
      />

      <QuickCustomerDialog
        open={customerModal}
        onClose={() => setCustomerModal(false)}
        onCreated={handleCustomerCreated}
      />
    </>
  );
}