function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function dateInput(value) {
  const d = value ? new Date(value) : new Date();
  const valid = Number.isNaN(d.getTime()) ? new Date() : d;
  const offset = valid.getTimezoneOffset() * 60000;
  return new Date(valid.getTime() - offset).toISOString().slice(0, 10);
}

export function emptyDcItem() {
  return { name: '', hsnCode: '', qty: 1, uom: 'Nos', rate: 0 };
}

export function dcTotal(items = []) {
  return round2(items.reduce((sum, row) => sum + (Number(row.qty) || 0) * (Number(row.rate) || 0), 0));
}

export function emptyDcForm(company = null) {
  return {
    companyRef: company?._id || '',
    dcNumber: '',
    dcDate: dateInput(),
    receiverName: '',
    receiverNumber: '',
    recipientRef: '',
    recipientName: '',
    placeOfSupply: '',
    recipientAddress: '',
    deliveryAddress: '',
    items: [emptyDcItem()],
    rateOfTax: 'GST not applicable',
    taxAmount: 'NA',
    modeOfDispatch: '',
    vehicleTransporter: '',
    expectedDuration: '',
    originalInvoiceRef: '',
    panelNo: '',
    complaintNo: '',
    fault: '',
    requestedBy: '',
    approvedBy: '',
    notes: '',
  };
}

export function dcToForm(dc) {
  return {
    companyRef: dc.company?.ref || '',
    dcNumber: dc.dcNumber || '',
    dcDate: dateInput(dc.dcDate),
    receiverName: dc.receiverName || '',
    receiverNumber: dc.receiverNumber || '',
    recipientRef: dc.recipient?.ref || '',
    recipientName: dc.recipient?.name || '',
    placeOfSupply: dc.placeOfSupply || '',
    recipientAddress: dc.recipient?.address || '',
    deliveryAddress: dc.deliveryAddress || '',
    items: (dc.items || []).map((row) => ({
      name: row.name || '',
      hsnCode: row.hsnCode || '',
      qty: row.qty ?? 1,
      uom: row.uom || 'Nos',
      rate: row.rate ?? 0,
    })),
    rateOfTax: dc.rateOfTax || '',
    taxAmount: dc.taxAmount || '',
    modeOfDispatch: dc.modeOfDispatch || '',
    vehicleTransporter: dc.vehicleTransporter || '',
    expectedDuration: dc.expectedDuration || '',
    originalInvoiceRef: dc.originalInvoiceRef || '',
    panelNo: dc.panelNo || '',
    complaintNo: dc.complaintNo || '',
    fault: dc.fault || '',
    requestedBy: dc.requestedBy || '',
    approvedBy: dc.approvedBy || '',
    notes: dc.notes || '',
  };
}

export function formToDcPayload(values, amountInWords, keepAttachmentIds) {
  return {
    company: { ref: values.companyRef },
    dcNumber: String(values.dcNumber || '').trim(),
    dcDate: values.dcDate || undefined,
    receiverName: values.receiverName,
    receiverNumber: values.receiverNumber,
    recipient: { ref: values.recipientRef || null, name: values.recipientName, address: values.recipientAddress },
    placeOfSupply: values.placeOfSupply,
    deliveryAddress: values.deliveryAddress,
    items: values.items.map((row) => ({
      name: row.name,
      hsnCode: row.hsnCode,
      qty: Number(row.qty) || 0,
      uom: row.uom || 'Nos',
      rate: Number(row.rate) || 0,
    })),
    amountInWords,
    rateOfTax: values.rateOfTax,
    taxAmount: values.taxAmount,
    modeOfDispatch: values.modeOfDispatch,
    vehicleTransporter: values.vehicleTransporter,
    expectedDuration: values.expectedDuration,
    originalInvoiceRef: values.originalInvoiceRef,
    panelNo: values.panelNo,
    complaintNo: values.complaintNo,
    fault: values.fault,
    requestedBy: values.requestedBy,
    approvedBy: values.approvedBy,
    notes: values.notes,
    keepAttachmentIds,
  };
}
