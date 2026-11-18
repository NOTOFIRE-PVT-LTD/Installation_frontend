# Graph Report - pages  (2026-11-17)

## Corpus Check
- 256 files · ~131,797 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 3)

## Summary
- 1387 nodes · 4139 edges · 64 communities (61 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5e91d552`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useVisitPlanForm.js
- AtlantaPaymentDrawer.jsx
- ext_utils_formatters_js
- usePortalApps.js
- BomPage.jsx
- StockItemsPage.jsx
- ref_react
- ItemsMasterPage.jsx
- ProfilePage.jsx
- QuotationFormPage.jsx
- ProformaInvoiceDrawer.jsx
- BgApplicationDrawer.jsx
- DeliveryChallanDrawer.jsx
- ComplaintRegisterPage.jsx
- ref_mui_material
- UsersListPage.jsx
- useExpenseDayPage.js
- ComplaintDetailDrawer.jsx
- ref_react_router_dom
- ext_utils_constants_js
- c_users_admin_desktop_centralisatian_installation_workspace_copy_installation_frontend_src_hooks_useauth_useauth
- ref_react_hook_form
- StockItemsPanel.jsx
- ProjectDetailPage.jsx
- adminVisitsDayBoardHelpers.js
- AttendancePage.jsx
- apiErrorMessage
- SalespersonTrackingPage.jsx
- UserFormDrawer.jsx
- ComplaintDetailPage.jsx
- ComplaintDashboardPage.jsx
- StationDetailPage.jsx
- ProjectDrawer.jsx
- VisitApprovalsPage.jsx
- ProjectDetailsTab.jsx
- useVisitDetailPage.js
- ref_mui_icons_material
- ComplaintsPage.jsx
- BillingPage.jsx
- NumbersPage.jsx
- proformaInvoicePdf.js
- AdminAttendanceRoster.jsx
- InspectionDrawer.jsx
- DailyVisitsDateRow.jsx
- ContractorAttendancePage.jsx
- ProjectCadDrawingDrawer.jsx
- FinancialDocumentDrawer.jsx
- FinancialDocumentsListPage.jsx
- PaymentsListPage.jsx
- ApprovalsQueuePage.jsx
- PaymentDrawer.jsx
- ext_utils_readlocation_js
- NitTenderDrawer.jsx
- ComplaintIntakePage.jsx
- DailyVisitsSummaryVisitCard.jsx
- CustomersListPage.jsx
- TenderFormDrawer.jsx
- buildTicketStatusLogs
- ContractAgreementDrawer.jsx
- DailyVisitsSummary.jsx
- UseBomDrawer.jsx
- CallLetterDrawer.jsx
- AuditLogDetailDrawer.jsx

## God Nodes (most connected - your core abstractions)
1. `apiErrorMessage()` - 29 edges
2. `AtlantaPaymentDrawer()` - 20 edges
3. `useVisitPlanForm()` - 17 edges
4. `downloadAtlantaPaymentPdf()` - 14 edges
5. `MasterItemDialog()` - 14 edges
6. `money()` - 14 edges
7. `ProformaInvoiceDrawer()` - 13 edges
8. `QuotationFormPage()` - 13 edges
9. `ComplaintDetailPage()` - 12 edges
10. `DeliveryChallanDrawer()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `ProjectsListPage()` --calls--> `ProjectDrawer()`  [EXTRACTED]
  src/pages/projects/ProjectsListPage.jsx → src/pages/projects/ProjectDrawer.jsx
- `AccountsListPage()` --calls--> `BgApplicationDrawer()`  [EXTRACTED]
  src/pages/accounts/AccountsListPage.jsx → src/pages/accounts/BgApplicationDrawer.jsx
- `AtlantaPaymentDrawer()` --calls--> `apiErrorMessage()`  [EXTRACTED]
  src/pages/atlantaPayments/AtlantaPaymentDrawer.jsx → src/pages/quotations/quotationUtils.js
- `AtlantaPaymentsPage()` --calls--> `apiErrorMessage()`  [EXTRACTED]
  src/pages/atlantaPayments/AtlantaPaymentsPage.jsx → src/pages/quotations/quotationUtils.js
- `SectionBody()` --calls--> `AdminAttendanceRoster()`  [EXTRACTED]
  src/pages/salespersonTracking/SalespersonTrackingPage.jsx → src/pages/attendance/AdminAttendanceRoster.jsx

## Import Cycles
- None detected.

## Communities (64 total, 3 thin omitted)

### Community 0 - "useVisitPlanForm.js"
Cohesion: 0.07
Nodes (43): MultiVisitPlanDrawer(), loadCustomerOptions(), loadSalespeopleOptions(), useVisitPlanForm(), VisitCreatePage(), VisitPlanAdminSalespersonField(), VisitPlanFormBody(), addDays() (+35 more)

### Community 1 - "AtlantaPaymentDrawer.jsx"
Cohesion: 0.08
Nodes (54): AddButton(), AtlantaPaymentDrawer(), Field(), FieldLabel(), getError(), inputSx, InvoiceEntry(), RowCard() (+46 more)

### Community 2 - "ext_utils_formatters_js"
Cohesion: 0.07
Nodes (10): AccountsListPage(), COLUMNS, firstLine(), COLUMNS, COLUMNS, COLUMNS, COLUMNS, COLUMNS (+2 more)

### Community 3 - "usePortalApps.js"
Cohesion: 0.08
Nodes (26): getLoginCopy(), LOGIN_COPY, CentralLoginEmailForm(), CentralLoginForm(), CentralLoginLangSwitch(), CentralLoginVisual(), CentralLoginWhatsappOtp(), pad() (+18 more)

### Community 4 - "BomPage.jsx"
Cohesion: 0.07
Nodes (24): BomComponentsImportDialog(), BomDrawer(), componentSchema, ComponentUnitField(), emptyComponent(), itemLabel(), mapBomToForm(), schema (+16 more)

### Community 5 - "StockItemsPage.jsx"
Cohesion: 0.08
Nodes (21): CatalogField(), mapItemToForm(), schema, StockItemDrawer(), upsertOption(), bulkDeleteMessage(), emptySelectionModel(), ITEM_COLUMNS (+13 more)

### Community 6 - "ref_react"
Cohesion: 0.09
Nodes (12): AuditLogsPage(), cardSx, EmptyState(), StatusChip(), CadDrawingPage(), PAGE_SIZE_OPTIONS, DivisionFormDialog(), ManageDivisionsDialog() (+4 more)

### Community 7 - "ItemsMasterPage.jsx"
Cohesion: 0.09
Nodes (27): CATALOG_FIELDS, newNameField(), OTHER, CardsToolbar(), COLUMNS, FILTER_FIELDS, ItemsMasterPage(), attachmentCountLabel() (+19 more)

### Community 8 - "ProfilePage.jsx"
Cohesion: 0.09
Nodes (27): PortalAppsCards(), PortalAppsNav(), PortalAppsPage(), PortalMain(), PortalProfilePanel(), PortalSidebar(), AppsIcon(), ChartIcon() (+19 more)

### Community 9 - "QuotationFormPage.jsx"
Cohesion: 0.11
Nodes (32): ContactDetails(), defaultValues(), emptyItem(), itemSchema, QuotationFormPage(), schema, Section(), SummaryRow() (+24 more)

### Community 10 - "ProformaInvoiceDrawer.jsx"
Cohesion: 0.14
Nodes (25): companyBank(), computePiTotals(), dateInput(), DEFAULT_PI_TERMS, EMPTY_BANK, emptyItem(), emptyPiForm(), formToPayload() (+17 more)

### Community 11 - "BgApplicationDrawer.jsx"
Cohesion: 0.08
Nodes (17): APPLICANT_PROFILES, APPLICATION_TYPES, BG_NATURES, BG_TYPE_OPTIONS, BgApplicationDrawer(), BORDERLESS_FIELD_SX, BoxedSection(), CheckboxSingleSelect() (+9 more)

### Community 12 - "DeliveryChallanDrawer.jsx"
Cohesion: 0.15
Nodes (24): dateInput(), dcToForm(), dcTotal(), emptyDcForm(), emptyDcItem(), formToDcPayload(), round2(), compactInput (+16 more)

### Community 13 - "ComplaintRegisterPage.jsx"
Cohesion: 0.12
Nodes (15): ComplaintRegisterFormFields(), ComplaintRegisterPage(), categorySelectOptions, defaultRegisterValues, MAX_PHOTO_MB, MAX_PHOTOS, PHONE_RE, PUBLIC_PRIORITIES (+7 more)

### Community 14 - "ref_mui_material"
Cohesion: 0.16
Nodes (14): computeExpenseDayTotals(), itemAmount(), sumByMode(), ExpenseDayClaimModeSection(), ExpenseDayDraftActions(), ExpenseDayPage(), ExpenseDayTotalSection(), ExpensePerVisitItemCard() (+6 more)

### Community 15 - "UsersListPage.jsx"
Cohesion: 0.09
Nodes (9): ADMIN_LABELS, PermissionsDialog(), USER_LABELS, USER_PERMISSION_KEYS, avatarColor(), SetPasswordDialog(), AVATAR_COLORS, COLUMNS (+1 more)

### Community 16 - "useExpenseDayPage.js"
Cohesion: 0.13
Nodes (15): saveExpenseDay(), submitExpenseDay(), updatePayload(), uploadExpenseTicket(), buildExpenseUpdatePayload(), useExpenseDayLoad(), useExpenseDayPage(), IMPORT_TABS (+7 more)

### Community 17 - "ComplaintDetailDrawer.jsx"
Cohesion: 0.15
Nodes (17): buildPayload(), ComplaintDetailDrawer(), WORKER_STATUS_OPTIONS, ComplaintDetailHeader(), ComplaintDetailOverview(), ComplaintDetailResolutionSection(), ALL_PRIORITY_OPTIONS, ComplaintDetailStatusSection() (+9 more)

### Community 18 - "ref_react_router_dom"
Cohesion: 0.12
Nodes (4): Field(), ReportDetailPage(), schema, COLUMNS

### Community 19 - "ext_utils_constants_js"
Cohesion: 0.17
Nodes (13): MissedVisitDialog(), getVisitDetailCapabilities(), CheckInButton(), VisitDetailCheckInActions(), CheckOutButton(), CheckOutProximityAlert(), VisitDetailCheckOutActions(), VisitCheckInSummary() (+5 more)

### Community 20 - "c_users_admin_desktop_centralisatian_installation_workspace_copy_installation_frontend_src_hooks_useauth_useauth"
Cohesion: 0.13
Nodes (3): ssoInflight, useWorkspaceApps(), WorkspaceHomePage()

### Community 21 - "ref_react_hook_form"
Cohesion: 0.16
Nodes (8): schema, schema, schema, EMPTY, schema, schema, AVATAR_COLORS, schema

### Community 22 - "StockItemsPanel.jsx"
Cohesion: 0.19
Nodes (13): StockItemImportDialog(), bulkDeleteMessage(), emptySelectionModel(), ITEM_COLUMNS, movementColumns(), movementItemLabel(), STOCK_DEFAULT_PAGE_SIZE, STOCK_MAX_PAGE_SIZE (+5 more)

### Community 23 - "ProjectDetailPage.jsx"
Cohesion: 0.13
Nodes (8): AddStationDialog(), ADD_BTN_SX, computeProjectStageStatuses(), PROJECT_STAGES, SQUARE_PAPER, PhotoThumb(), ProjectStationsTab(), StationFormDialog()

### Community 24 - "adminVisitsDayBoardHelpers.js"
Cohesion: 0.22
Nodes (14): AdminVisitsDayBoard(), AdminVisitsDayBoardDayHeader(), NameChips(), AdminVisitsDayBoardDayRow(), AdminVisitsDayBoardDayTable(), AdminVisitsDayBoardFilters(), adminVisitsDayBoardFieldSx, formatDateLabel() (+6 more)

### Community 25 - "AttendancePage.jsx"
Cohesion: 0.14
Nodes (5): ATTENDANCE_COLUMNS, AttendanceFilterBar(), formatMonthLabel(), getMonthBounds(), SalespersonActivityDrawer()

### Community 26 - "apiErrorMessage"
Cohesion: 0.20
Nodes (14): BANK_FIELDS, EMPTY, EMPTY_BANK, MASTER_LABELS, QuotationMasterDialog(), KINDS, MasterRecordsPanel(), PAGE_SIZE_OPTIONS (+6 more)

### Community 27 - "SalespersonTrackingPage.jsx"
Cohesion: 0.16
Nodes (9): AttendancePage(), AttendanceDashboardPanel(), AttendanceStatCard(), ADMIN_SECTION_IDS, SalespersonTrackingPage(), SectionBody(), SUPER_ADMIN_TABS, TrackingApprovalsPage() (+1 more)

### Community 28 - "UserFormDrawer.jsx"
Cohesion: 0.16
Nodes (10): formToPayload(), PeopleListPage(), ACCOUNT_LEVEL_OPTIONS, accountLevelFromUser(), appAccessFromUser(), buildSchema(), DetailRow(), GENDER_OPTIONS (+2 more)

### Community 29 - "ComplaintDetailPage.jsx"
Cohesion: 0.23
Nodes (12): AssignModal(), ReopenModal(), ResolveModal(), StatusModal(), WorkLogModal(), ComplaintDetailNotesTab(), ComplaintDetailOverviewTab(), InfoField() (+4 more)

### Community 30 - "ComplaintDashboardPage.jsx"
Cohesion: 0.19
Nodes (13): ComplaintDashboardPage(), usePagedComplaints(), ComplaintQrDialog(), publicComplaintLink(), publicTrackLink(), cellSx, DashboardEngineerWorkloadTable(), HeadLabel() (+5 more)

### Community 31 - "StationDetailPage.jsx"
Cohesion: 0.12
Nodes (6): DailyReportFormDialog(), StationDailyReportingSection(), buildClaimRequestsFromStation(), defaultValues, schema, StationDetailPage()

### Community 32 - "ProjectDrawer.jsx"
Cohesion: 0.20
Nodes (11): DashboardPage(), FIELD_SALES_CARDS, SUMMARY_CARDS, SummaryStat(), TONE, ProjectCadDrawingTab(), ProjectDailyReportingTab(), ProjectDetailPage() (+3 more)

### Community 33 - "VisitApprovalsPage.jsx"
Cohesion: 0.27
Nodes (11): useVisitApprovalsPage(), VisitApprovalDecideCell(), VisitApprovalKindCell(), VisitApprovalReasonCell(), VisitApprovalStatusCell(), VisitApprovalViewCell(), baseVisitApprovalColumns(), buildVisitApprovalsColumns() (+3 more)

### Community 34 - "ProjectDetailsTab.jsx"
Cohesion: 0.13
Nodes (8): DATE_FIELDS, defaultValues, NUMBER_FIELDS, PROJECT_TYPE_OPTIONS, RATING_OPTIONS, schema, SERIAL_TYPE_OPTIONS, TEXT_FIELDS

### Community 35 - "useVisitDetailPage.js"
Cohesion: 0.30
Nodes (9): useVisitDetailPage(), appendLocationToForm(), appendProceedAnyway(), checkInSnackbar(), checkOutSnackbar(), requireGpsLocation(), runVisitCheckIn(), runVisitCheckOut() (+1 more)

### Community 36 - "ref_mui_icons_material"
Cohesion: 0.27
Nodes (8): useVisitDayPage(), VisitDaySubmitCard(), VisitDaySubmittedExpenseCard(), VisitDayPage(), isSelectionLocked(), VisitDayPlannedVisitOption(), VisitDayProgressAlert(), VisitDaySelectionCard()

### Community 37 - "ComplaintsPage.jsx"
Cohesion: 0.22
Nodes (10): ComplaintReassignDialog(), CATEGORY_FILTER_OPTIONS, ComplaintsPage(), EMPTY_STATS, PRIORITY_FILTER_OPTIONS, STATUS_FILTER_OPTIONS, ComplaintStatsHeader(), StatCard() (+2 more)

### Community 38 - "BillingPage.jsx"
Cohesion: 0.18
Nodes (7): BillingPage(), DOC_COLUMNS, ITEM_COLUMNS, money(), PARTIES, PartyPanel(), SummaryBlock()

### Community 39 - "NumbersPage.jsx"
Cohesion: 0.18
Nodes (5): NumberFormDialog(), NumberImportDialog(), CATEGORIES, COLUMNS, NumbersPage()

### Community 40 - "proformaInvoicePdf.js"
Cohesion: 0.20
Nodes (10): amount(), BODY, downloadProformaInvoicePdf(), HIGHLIGHT, INK, longDate(), safeFileName(), TEXT (+2 more)

### Community 41 - "AdminAttendanceRoster.jsx"
Cohesion: 0.32
Nodes (9): AdminAttendanceDetailView(), AdminAttendanceRoster(), mapDetailRows(), mapRosterRows(), DETAIL_COLUMNS, istTodayYmd(), monthBounds(), MONTHS (+1 more)

### Community 42 - "InspectionDrawer.jsx"
Cohesion: 0.23
Nodes (10): emptyChecklistItem(), INSPECTION_CHARGE_BORN_BY, InspectionDrawer(), mapInspectionToForm(), schema, STATUS_OPTIONS, toDateInput(), toDocList() (+2 more)

### Community 43 - "DailyVisitsDateRow.jsx"
Cohesion: 0.41
Nodes (9): DailyVisitsDateRow(), DateRowExpenseCell(), DateRowTravelCell(), DateRowVisitSummary(), DailyVisitsDateRowDetails(), DailyVisitsDateRowExpenseBlock(), ExpenseBlockAction(), expenseStatusColor() (+1 more)

### Community 44 - "ContractorAttendancePage.jsx"
Cohesion: 0.27
Nodes (5): getContractorColumns(), ContractorAttendancePage(), ContractorStatCards(), StatCard(), ContractorUploadDialog()

### Community 45 - "ProjectCadDrawingDrawer.jsx"
Cohesion: 0.24
Nodes (4): DetailItem(), ProjectCadDrawingDrawer(), TenderDetailDrawer(), TenderFormDrawer()

### Community 46 - "FinancialDocumentDrawer.jsx"
Cohesion: 0.27
Nodes (7): addDaysIso(), buildPayload(), FinancialDocumentDrawer(), mapDocToForm(), PARTY_OPTIONS, schema, toDateInput()

### Community 47 - "FinancialDocumentsListPage.jsx"
Cohesion: 0.24
Nodes (5): CallLettersListPage(), ContractAgreementsListPage(), BG_COLUMNS, BgDocumentsPanel(), FinancialDocumentsListPage()

### Community 48 - "PaymentsListPage.jsx"
Cohesion: 0.20
Nodes (3): PaymentDrawer(), COLUMNS, PaymentsListPage()

### Community 50 - "PaymentDrawer.jsx"
Cohesion: 0.18
Nodes (4): METHOD_OPTIONS, schema, schema, TYPE_OPTIONS

### Community 51 - "ext_utils_readlocation_js"
Cohesion: 0.36
Nodes (5): stateColor(), stateLabel(), visitQueueFlags(), VisitDayVisitQueueBody(), VisitDayVisitQueueItem()

### Community 52 - "NitTenderDrawer.jsx"
Cohesion: 0.27
Nodes (7): buildPayload(), emptyItem(), mapTenderToForm(), NitTenderDrawer(), schema, toDateInput(), TendersListPage()

### Community 53 - "ComplaintIntakePage.jsx"
Cohesion: 0.29
Nodes (7): ComplaintIntakeCustomerSection(), filter, ComplaintIntakeEquipmentSection(), ComplaintIntakePage(), todayInputValue(), ComplaintIntakeResolutionSection(), DELIVERY_STATUS_OPTIONS

### Community 54 - "DailyVisitsSummaryVisitCard.jsx"
Cohesion: 0.38
Nodes (8): visitStatusColor(), DailyVisitsSummaryVisitCard(), VisitCardHeader(), VisitMissedNotes(), VisitOutcomeNotes(), DailyVisitsSummaryVisitCheckBox(), VisitCheckBoxEmpty(), VisitCheckBoxTimeDetails()

### Community 55 - "CustomersListPage.jsx"
Cohesion: 0.25
Nodes (3): CustomerDrawer(), COLUMNS, CustomersListPage()

### Community 57 - "buildTicketStatusLogs"
Cohesion: 0.39
Nodes (4): buildTicketStatusLogs(), isStatusActivity(), personMatchesLog(), priya

### Community 58 - "ContractAgreementDrawer.jsx"
Cohesion: 0.36
Nodes (5): buildPayload(), ContractAgreementDrawer(), mapDocToForm(), schema, toDateInput()

### Community 59 - "DailyVisitsSummary.jsx"
Cohesion: 0.46
Nodes (5): DailyVisitsPhotoPreviewDialog(), DailyVisitsSummary(), DailyVisitsSummaryEmpty(), isDateToday(), useDailyVisitsSummary()

### Community 60 - "UseBomDrawer.jsx"
Cohesion: 0.33
Nodes (3): defaultValues(), schema, UseBomDrawer()

### Community 61 - "CallLetterDrawer.jsx"
Cohesion: 0.38
Nodes (4): buildPayload(), CallLetterDrawer(), mapDocToForm(), schema

### Community 63 - "AuditLogDetailDrawer.jsx"
Cohesion: 0.60
Nodes (4): ACTION_COLORS, AuditLogDetailDrawer(), formatExactDate(), InfoItem()

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildTicketStatusLogs()` connect `buildTicketStatusLogs` to `ref_react`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Should `useVisitPlanForm.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07322068612391193 - nodes in this community are weakly interconnected._
- **Should `AtlantaPaymentDrawer.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07650273224043716 - nodes in this community are weakly interconnected._
- **Should `ext_utils_formatters_js` be split into smaller, more focused modules?**
  _Cohesion score 0.06753246753246753 - nodes in this community are weakly interconnected._
- **Should `usePortalApps.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07993966817496229 - nodes in this community are weakly interconnected._
- **Should `BomPage.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0700354609929078 - nodes in this community are weakly interconnected._
- **Should `StockItemsPage.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07712765957446809 - nodes in this community are weakly interconnected._