export const TRAVEL_MODES = [
  'Flight',
  'Train',
  'Bus',
  'Cab / Car',
  'Own Vehicle',
  'Metro / Local',
  'Other',
];

export const TRAVEL_REQUEST_STATUSES = ['All', 'Pending', 'Approved', 'Rejected'];

export const STATUS_CHIP_STYLES = {
  Pending: { bg: '#fef3c7', color: '#b45309' },
  Approved: { bg: '#dcfce7', color: '#15803d' },
  Rejected: { bg: '#fee2e2', color: '#b91c1c' },
};

export const MAX_PROOF_SIZE_MB = 20;
export const ACCEPTED_PROOF_TYPES = 'image/jpeg,image/png,image/webp,application/pdf';

export const inr = (value) =>
  `₹${(Number(value) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

function toDateInput(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function emptyPersonToMeet() {
  return {
    name: '',
    designation: '',
    company: '',
    city: '',
    contactNumber: '',
    email: '',
    nextAction: '',
    purposeOfMeeting: '',
    notesAboutPerson: '',
    meetingOutcome: '',
  };
}

export function emptyItineraryRow() {
  return {
    date: '',
    from: '',
    to: '',
    modeOfTravel: '',
    availability: 'Available',
    cost: 0,
    trainOrFlightDetails: '',
  };
}

export function emptyTripExpenseRow() {
  return {
    date: '',
    amount: 0,
    expenseDetail: '',
    existingProof: null,
  };
}

export function emptySalesTravelForm(defaultTravellerName = '') {
  return {
    travelFrom: '',
    travelTo: '',
    cityTravellingTo: '',
    travellerName: defaultTravellerName || '',
    agenda: '',
    personsToMeet: [emptyPersonToMeet()],
    travelItinerary: [emptyItineraryRow()],
    tripExpenses: [emptyTripExpenseRow()],
    expectedRoi: '',
  };
}

export function requestToForm(request) {
  if (!request) return emptySalesTravelForm();
  return {
    travelFrom: toDateInput(request.travelFrom),
    travelTo: toDateInput(request.travelTo),
    cityTravellingTo: request.cityTravellingTo || '',
    travellerName: request.travellerName || '',
    agenda: request.agenda || '',
    personsToMeet:
      request.personsToMeet?.length > 0
        ? request.personsToMeet.map((p) => ({
            name: p.name || '',
            designation: p.designation || '',
            company: p.company || '',
            city: p.city || '',
            contactNumber: p.contactNumber || '',
            email: p.email || '',
            nextAction: p.nextAction || '',
            purposeOfMeeting: p.purposeOfMeeting || '',
            notesAboutPerson: p.notesAboutPerson || '',
            meetingOutcome: p.meetingOutcome || '',
          }))
        : [emptyPersonToMeet()],
    travelItinerary:
      request.travelItinerary?.length > 0
        ? request.travelItinerary.map((row) => ({
            date: toDateInput(row.date),
            from: row.from || '',
            to: row.to || '',
            modeOfTravel: row.modeOfTravel || '',
            availability: row.availability || '',
            cost: row.cost ?? 0,
            trainOrFlightDetails: row.trainOrFlightDetails || '',
          }))
        : [emptyItineraryRow()],
    tripExpenses:
      request.tripExpenses?.length > 0
        ? request.tripExpenses.map((row) => ({
            date: toDateInput(row.date),
            amount: row.amount ?? 0,
            expenseDetail: row.expenseDetail || '',
            existingProof: row.proof || null,
          }))
        : [emptyTripExpenseRow()],
    expectedRoi: request.expectedRoi || '',
  };
}

export function computeSalesTravelTotals(values = {}) {
  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  const travelCostSubtotal = (values.travelItinerary || []).reduce(
    (sum, row) => sum + num(row?.cost),
    0
  );
  const dayWiseTotal = (values.tripExpenses || []).reduce(
    (sum, row) => sum + num(row?.amount),
    0
  );
  const grandTotal = travelCostSubtotal + dayWiseTotal;

  return {
    travelCostSubtotal,
    dayWiseTotal,
    grandTotal,
  };
}

export function formToSalesTravelPayload(values, expenseFieldIds = [], filesByRowId = {}) {
  const proofFiles = [];
  const tripExpenses = (values.tripExpenses || []).map((row, idx) => {
    const fieldId = expenseFieldIds[idx];
    const pickedFile = fieldId ? filesByRowId[fieldId] : null;
    let newProofIndex;
    let keepProofId;

    if (pickedFile) {
      newProofIndex = proofFiles.length;
      proofFiles.push(pickedFile);
    } else if (row.existingProof?._id) {
      keepProofId = row.existingProof._id;
    }

    return {
      date: row.date || null,
      amount: Number(row.amount) || 0,
      expenseDetail: row.expenseDetail || '',
      ...(newProofIndex !== undefined ? { newProofIndex } : {}),
      ...(keepProofId ? { keepProofId } : {}),
    };
  });

  const payload = {
    travelFrom: values.travelFrom || null,
    travelTo: values.travelTo || null,
    cityTravellingTo: values.cityTravellingTo || '',
    travellerName: values.travellerName || '',
    agenda: values.agenda || '',
    personsToMeet: values.personsToMeet || [],
    travelItinerary: values.travelItinerary || [],
    tripExpenses,
    expectedRoi: values.expectedRoi || '',
  };

  return { payload, proofFiles };
}

