import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EXPENSE_FIELDS, computeTotals, percentOfBasic, entryTotalExpense } from './atlantaUtils';

const RED = [220, 38, 38]; // #dc2626
const DARK = [30, 41, 59]; // #1e293b
const MUTED = [100, 116, 139]; // #64748b
const LIGHT_BG = [248, 250, 252]; // #f8fafc
const BORDER_LIGHT = [226, 232, 240]; // #e2e8f0
const BLUE = [37, 99, 235]; // #2563eb
const BLUE_LIGHT = [239, 246, 255]; // #eff6ff
const BLUE_BORDER = [147, 197, 253]; // #93c5fd
const AMBER = [180, 83, 9]; // #b45309
const AMBER_LIGHT = [254, 249, 195]; // #fef9c3
const AMBER_BORDER = [253, 224, 71]; // #fde047
const GREEN = [22, 163, 74]; // #16a34a
const GREEN_LIGHT = [240, 253, 244]; // #f0fdf4
const PINK_BG = [254, 242, 242]; // #fef2f2
const PINK_BORDER = [254, 202, 202]; // #fecaca

function fmtNumber(value) {
  const n = Number(value) || 0;
  return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function fmtMoney(value) {
  return `Rs. ${fmtNumber(value)}`;
}

function fmtDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtDateTime(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${dateStr}, ${hours}:${minutes} ${ampm}`;
}

function safeFileName(payment) {
  const parts = [payment.consigneeName || payment.fileName || 'AtlantaPayment', payment.employeeName].filter(Boolean);
  const name = parts.join('_').replace(/[\\/:*?"<>|]+/g, '_').trim();
  return `${name}_Payment_Details.pdf`;
}

function ensureSpace(doc, neededHeight, currentY, onNewPage) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomLimit = pageHeight - 16;
  if (currentY + neededHeight > bottomLimit) {
    doc.addPage();
    const newY = 16;
    if (onNewPage) onNewPage(newY);
    return newY;
  }
  return currentY;
}

/**
 * Generates and downloads a high-fidelity PDF report of the Atlanta Payment details,
 * matching the visual design with metric cards, employee details, hotel/TADA expenses,
 * invoice breakdown, travel expenses table, and payment received summary.
 */
export async function downloadAtlantaPaymentPdf(payment) {
  if (!payment) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth(); // 210
  const left = 12;
  const contentWidth = 186;
  const right = left + contentWidth; // 198
  const center = pageWidth / 2;

  // Compute live totals to guarantee consistency
  const liveTotals = computeTotals(payment);
  const totalBasic = payment.totalBasicAmount || liveTotals.totalBasic || 0;
  const totalInvoice = payment.totalInvoiceAmount || liveTotals.totalInvoice || 0;
  const totalTada = payment.totalTada ?? liveTotals.totalTada ?? 0;
  const travelDaysCount = payment.travelDays ?? liveTotals.days ?? 0;
  const totalExpense = payment.totalExpense || liveTotals.totalExpense || 0;
  const totalTravel = payment.totalTravelExpenses || liveTotals.totalTravel || 0;
  const totalSpent = totalTada + totalExpense + totalTravel;
  const totalReceived = payment.totalReceivedAmount ?? liveTotals.totalReceived ?? 0;
  const amountToGive = payment.amountToGive ?? (totalSpent - totalReceived);

  const tadaPct = percentOfBasic(totalTada, totalBasic) || '0.000';
  const expensePct = percentOfBasic(totalExpense, totalBasic) || '0.000';
  const travelPct = percentOfBasic(totalTravel, totalBasic) || '0.000';
  const spentPct = percentOfBasic(totalSpent, totalBasic) || '0.000';

  let y = 14;

  // ==========================================
  // HEADER
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  const title1 = 'Atlanta Tele ';
  const title2 = 'Cables';
  const w1 = doc.getTextWidth(title1);
  const w2 = doc.getTextWidth(title2);
  const totalTitleW = w1 + w2;
  const startTitleX = center - totalTitleW / 2;

  doc.setTextColor(...DARK);
  doc.text(title1, startTitleX, y);
  doc.setTextColor(...RED);
  doc.text(title2, startTitleX + w1, y);

  y += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('Payment Management System', center, y, { align: 'center' });

  // Consignee / Zone Pill Badge
  y += 4;
  const badgeLabel = (payment.consigneeName || payment.fileName || 'NER').trim();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  const badgeTextW = doc.getTextWidth(badgeLabel);
  const badgePadX = 5;
  const badgeW = Math.max(badgeTextW + badgePadX * 2, 16);
  const badgeH = 5.2;
  const badgeX = center - badgeW / 2;

  doc.setFillColor(...RED);
  doc.roundedRect(badgeX, y, badgeW, badgeH, 2.6, 2.6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(badgeLabel, center, y + 3.7, { align: 'center' });

  // Red separator line
  y += badgeH + 4;
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.9);
  doc.line(left, y, right, y);
  y += 5;

  // ==========================================
  // 6 SUMMARY METRIC CARDS
  // ==========================================
  const gap = 2.4;
  const cardW = (contentWidth - gap * 5) / 6;
  const cardH = 21;

  const cards = [
    {
      value: fmtMoney(totalInvoice),
      label: 'Invoice Amount',
      sub: null,
      bg: LIGHT_BG,
      border: BORDER_LIGHT,
      textCol: DARK,
      subCol: MUTED,
    },
    {
      value: fmtMoney(totalBasic),
      label: 'Basic Invoice Amount',
      sub: null,
      bg: LIGHT_BG,
      border: BORDER_LIGHT,
      textCol: DARK,
      subCol: MUTED,
    },
    {
      value: fmtMoney(totalTada),
      label: `TADA (${travelDaysCount} days)`,
      sub: `(${tadaPct}%)`,
      bg: RED,
      border: null,
      textCol: [255, 255, 255],
      subCol: [255, 255, 255],
    },
    {
      value: fmtMoney(totalExpense),
      label: 'Total Expense',
      sub: `(${expensePct}%)`,
      bg: [255, 255, 255],
      border: [252, 165, 165],
      textCol: RED,
      subCol: RED,
    },
    {
      value: fmtMoney(totalTravel),
      label: 'Travel Expenses',
      sub: `(${travelPct}%)`,
      bg: [255, 255, 255],
      border: BLUE_BORDER,
      textCol: BLUE,
      subCol: BLUE,
    },
    {
      value: fmtMoney(totalSpent),
      label: 'Total Spent',
      sub: `(${spentPct}%)`,
      bg: AMBER_LIGHT,
      border: AMBER_BORDER,
      textCol: AMBER,
      subCol: AMBER,
    },
  ];

  cards.forEach((card, idx) => {
    const cx = left + idx * (cardW + gap);
    if (card.bg) {
      doc.setFillColor(...card.bg);
    }
    if (card.border) {
      doc.setDrawColor(...card.border);
      doc.setLineWidth(0.3);
      doc.roundedRect(cx, y, cardW, cardH, 2, 2, 'FD');
    } else {
      doc.roundedRect(cx, y, cardW, cardH, 2, 2, 'F');
    }

    const cardCenterX = cx + cardW / 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(card.value.length > 13 ? 6.8 : 7.6);
    doc.setTextColor(...card.textCol);
    doc.text(card.value, cardCenterX, y + 6.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(...(card.border ? MUTED : card.textCol));
    doc.text(card.label, cardCenterX, y + 11.5, { align: 'center' });

    if (card.sub) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.6);
      doc.setTextColor(...card.subCol);
      doc.text(card.sub, cardCenterX, y + 16.5, { align: 'center' });
    }
  });

  y += cardH + 4.5;

  // Helper to draw section container with left red bar
  function drawSectionFrame(startY, height, title) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...BORDER_LIGHT);
    doc.setLineWidth(0.3);
    doc.roundedRect(left, startY, contentWidth, height, 2, 2, 'FD');

    // Left red bar
    doc.setFillColor(...RED);
    doc.roundedRect(left, startY, 2.4, height, 1.2, 1.2, 'F');

    // Section title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...RED);
    doc.text(title.toUpperCase(), left + 5, startY + 5.5);

    // Section header divider
    doc.setDrawColor(...BORDER_LIGHT);
    doc.setLineWidth(0.2);
    doc.line(left + 5, startY + 7.5, right - 3, startY + 7.5);
  }

  // ==========================================
  // EMPLOYEE DETAILS
  // ==========================================
  const empH = 19;
  y = ensureSpace(doc, empH, y);
  drawSectionFrame(y, empH, 'Employee Details');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...MUTED);
  doc.text('EMPLOYEE NAME', left + 6, y + 11.5);
  doc.text('DESIGNATION', left + 95, y + 11.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  doc.text(payment.employeeName || '-', left + 6, y + 16);
  doc.text(payment.designation || '-', left + 95, y + 16);

  y += empH + 3.5;

  // ==========================================
  // HOTEL EXPENSE
  // ==========================================
  const hotelH = 28;
  y = ensureSpace(doc, hotelH, y);
  drawSectionFrame(y, hotelH, 'Hotel Expense');

  // Row 1: Start, Reached, Exit
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(...MUTED);
  doc.text('TRAVELLING START', left + 6, y + 11.5);
  doc.text('REACHED DESTINATION', left + 68, y + 11.5);
  doc.text('EXIT DESTINATION', left + 130, y + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...DARK);
  doc.text(fmtDateTime(payment.travelStartAt), left + 6, y + 16);
  doc.text(fmtDateTime(payment.reachedAt), left + 68, y + 16);
  doc.text(fmtDateTime(payment.exitAt), left + 130, y + 16);

  // Row 2: Travel Days, TADA Amount
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(...MUTED);
  doc.text('TRAVEL DAYS', left + 6, y + 21);
  doc.text('TADA AMOUNT', left + 68, y + 21);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  doc.text(`${travelDaysCount} days`, left + 6, y + 25.5);

  doc.setTextColor(...RED);
  doc.text(`${fmtMoney(totalTada)} (${tadaPct}%)`, left + 68, y + 25.5);

  y += hotelH + 4;

  // ==========================================
  // INVOICE & TOTAL EXPENSE DETAILS
  // ==========================================
  const entries = payment.invoiceEntries || [];
  const entriesCount = entries.length;

  y = ensureSpace(doc, 20, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...RED);
  doc.text(`INVOICE & TOTAL EXPENSE DETAILS (${entriesCount})`, left, y);
  y += 2.5;

  doc.setDrawColor(...BORDER_LIGHT);
  doc.setLineWidth(0.3);
  doc.line(left, y, right, y);
  y += 3.5;

  entries.forEach((entry, idx) => {
    const entryH = 34;
    y = ensureSpace(doc, entryH + 3, y);

    // Entry container with red left bar
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...BORDER_LIGHT);
    doc.setLineWidth(0.3);
    doc.roundedRect(left, y, contentWidth, entryH, 2, 2, 'FD');

    doc.setFillColor(...RED);
    doc.roundedRect(left, y, 2.2, entryH, 1, 1, 'F');

    // Header: Entry #X on left, Invoice No & Date on right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...RED);
    doc.text(`Entry #${idx + 1}`, left + 5, y + 5);

    if (entry.invoiceNoDate) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...DARK);
      doc.text(entry.invoiceNoDate, right - 4, y + 5, { align: 'right' });
    }

    // Top metrics: Basic Amount, Quantity, Invoice Total, Expense Total
    const eBasic = Number(entry.basicAmount) || 0;
    const eQty = entry.quantity !== undefined && entry.quantity !== null && entry.quantity !== '' ? entry.quantity : '-';
    const eTotal = Number(entry.totalAmount) || 0;
    const eExpense = entryTotalExpense(entry) || Number(entry.totalExpense) || 0;
    const ePct = percentOfBasic(eExpense, eBasic) || '0.000';

    const colW = (contentWidth - 10) / 4;
    const mY = y + 9.5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(...MUTED);
    doc.text('BASIC AMOUNT', left + 5, mY);
    doc.text('QUANTITY', left + 5 + colW, mY);
    doc.text('INVOICE TOTAL', left + 5 + colW * 2, mY);
    doc.text('EXPENSE TOTAL', left + 5 + colW * 3, mY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    doc.text(fmtMoney(eBasic), left + 5, mY + 4.2);

    const qtyStr = typeof eQty === 'number' || !Number.isNaN(Number(eQty)) ? `${eQty}km` : String(eQty);
    doc.text(qtyStr, left + 5 + colW, mY + 4.2);
    doc.text(fmtMoney(eTotal), left + 5 + colW * 2, mY + 4.2);

    doc.setTextColor(...RED);
    doc.text(`${fmtMoney(eExpense)} (${ePct}%)`, left + 5 + colW * 3, mY + 4.2);

    // Inner divider
    const divY = y + 19.5;
    doc.setDrawColor(...BORDER_LIGHT);
    doc.setLineWidth(0.2);
    doc.line(left + 5, divY, right - 4, divY);

    // Expense breakdown title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(...MUTED);
    doc.text('EXPENSE BREAKDOWN', left + 5, divY + 3.5);

    // Expense breakdown 8 items: 4 columns x 2 rows
    const bColW = (contentWidth - 10) / 4;
    const bRow1Y = divY + 7.5;
    const bRow2Y = divY + 11.5;

    const breakdownItems = [
      { label: 'SSE', val: entry.sseAmount },
      { label: 'SSE Babu', val: entry.sseBabu },
      { label: 'Meggering', val: entry.meggeringCharge },
      { label: 'ADSTE', val: entry.adste },
      { label: 'Budget+Acc', val: entry.budgetAccounts },
      { label: 'Dy.CSTE OS', val: entry.dyCsteOs },
      { label: 'Dy.CSTE', val: entry.dyCste },
      {
        label: entry.miscRecipientName ? `Misc (${entry.miscRecipientName})` : 'Misc',
        val: entry.miscellaneous,
      },
    ];

    breakdownItems.forEach((bItem, bIdx) => {
      const bCol = bIdx % 4;
      const bRow = Math.floor(bIdx / 4);
      const bx = left + 5 + bCol * bColW;
      const by = bRow === 0 ? bRow1Y : bRow2Y;

      const amt = Number(bItem.val) || 0;
      const pct = percentOfBasic(amt, eBasic) || '0.000';

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(...DARK);
      doc.text(`${bItem.label}: ${fmtMoney(amt)} (${pct}%)`, bx, by);
    });

    y += entryH + 3;
  });

  // Invoice Summary Bar
  const summaryH = 13;
  y = ensureSpace(doc, summaryH + 2, y);

  doc.setFillColor(...PINK_BG);
  doc.setDrawColor(...PINK_BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(left, y, contentWidth, summaryH, 2, 2, 'FD');

  const sumColW = contentWidth / 3;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...MUTED);
  doc.text('Basic Invoice Amount', left + 8, y + 4.5);
  doc.text('Total Invoice Amount', left + sumColW + 8, y + 4.5);
  doc.text('Expense Total', left + sumColW * 2 + 8, y + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...DARK);
  doc.text(fmtMoney(totalBasic), left + 8, y + 9.8);
  doc.text(fmtMoney(totalInvoice), left + sumColW + 8, y + 9.8);

  doc.setTextColor(...RED);
  doc.text(`${fmtMoney(totalExpense)} (${expensePct}%)`, left + sumColW * 2 + 8, y + 9.8);

  y += summaryH + 5;

  // ==========================================
  // TRAVEL EXPENSES
  // ==========================================
  const travelList = payment.travelExpenses || [];
  y = ensureSpace(doc, 30, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...RED);
  doc.text(`TRAVEL EXPENSES (${travelList.length})`, left, y);
  y += 2.5;

  doc.setDrawColor(...BORDER_LIGHT);
  doc.setLineWidth(0.3);
  doc.line(left, y, right, y);
  y += 3;

  const travelTableBody = travelList.length
    ? travelList.map((row, idx) => {
        const amt = Number(row.amount) || 0;
        const pct = percentOfBasic(amt, totalBasic) || '0.000';
        return [
          String(idx + 1),
          fmtDate(row.date),
          row.detail || '-',
          `${fmtMoney(amt)} (${pct}%)`,
          row.transactionDone ? 'Completed' : 'Pending',
        ];
      })
    : [['1', '-', '-', 'Rs. 0 (0.000%)', 'Pending']];

  autoTable(doc, {
    startY: y,
    margin: { left, right: pageWidth - right },
    head: [['#', 'Date', 'Details', 'Amount', 'Status']],
    body: travelTableBody,
    foot: [['', '', 'Total Travel Expenses:', `${fmtMoney(totalTravel)} (${travelPct}%)`, '']],
    showFoot: 'lastPage',
    theme: 'grid',
    headStyles: {
      fillColor: BLUE,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2,
    },
    bodyStyles: {
      textColor: DARK,
      fontSize: 7.5,
      cellPadding: 2,
    },
    footStyles: {
      fillColor: BLUE_LIGHT,
      textColor: BLUE,
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.2,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 32 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 44, halign: 'right' },
      4: { cellWidth: 26, halign: 'center' },
    },
    didDrawCell: (data) => {
      // Custom status styling
      if (data.section === 'body' && data.column.index === 4) {
        const text = String(data.cell.raw || '');
        if (text === 'Pending') {
          doc.setTextColor(180, 83, 9);
        } else if (text === 'Completed') {
          doc.setTextColor(22, 163, 74);
        }
      }
    },
  });

  y = doc.lastAutoTable.finalY + 6;

  // ==========================================
  // PAYMENT RECEIVED DETAILS
  // ==========================================
  const paymentsList = payment.paymentsReceived || [];
  y = ensureSpace(doc, 30, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...RED);
  doc.text(`PAYMENT RECEIVED DETAILS (${paymentsList.length})`, left, y);
  y += 2.5;

  doc.setDrawColor(...BORDER_LIGHT);
  doc.setLineWidth(0.3);
  doc.line(left, y, right, y);
  y += 3;

  const paymentTableBody = paymentsList.length
    ? paymentsList.map((row, idx) => {
        const amt = Number(row.amount) || 0;
        const deduct = Number(row.deductAmount) || 0;
        const net = Math.max(amt - deduct, 0);
        return [
          String(idx + 1),
          fmtDate(row.paymentDate),
          row.details || '-',
          fmtMoney(amt),
          deduct > 0 ? fmtMoney(deduct) : 'Rs. 0',
          fmtMoney(net),
        ];
      })
    : [['1', '-', '-', 'Rs. 0', 'Rs. 0', 'Rs. 0']];

  autoTable(doc, {
    startY: y,
    margin: { left, right: pageWidth - right },
    head: [['#', 'Date', 'Details', 'Amount', 'Deduct', 'Net']],
    body: paymentTableBody,
    foot: [
      ['', '', 'Total Received:', fmtMoney(totalReceived), 'Balance to Give:', fmtMoney(amountToGive)],
    ],
    showFoot: 'lastPage',
    theme: 'grid',
    headStyles: {
      fillColor: GREEN,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2,
    },
    bodyStyles: {
      textColor: DARK,
      fontSize: 7.5,
      cellPadding: 2,
    },
    footStyles: {
      fillColor: GREEN_LIGHT,
      textColor: GREEN,
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.2,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 32 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' },
    },
    didDrawCell: (data) => {
      // Deduct column highlight in red if > 0
      if (data.section === 'body' && data.column.index === 4) {
        const val = String(data.cell.raw || '');
        if (val !== 'Rs. 0' && val !== '-') {
          doc.setTextColor(...RED);
        }
      }
    },
  });

  // ==========================================
  // PAGE NUMBERS & RUNNING FOOTER
  // ==========================================
  const totalPages = doc.internal.getNumberOfPages();
  const nowStr = fmtDate(new Date());

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const pageH = doc.internal.pageSize.getHeight();

    // Footer divider line
    doc.setDrawColor(...BORDER_LIGHT);
    doc.setLineWidth(0.3);
    doc.line(left, pageH - 9, right, pageH - 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    const footerLeft = `Atlanta Tele Cables · Payment Report · Generated on ${nowStr}`;
    doc.text(footerLeft, left, pageH - 5);
    doc.text(`Page ${p} of ${totalPages}`, right, pageH - 5, { align: 'right' });
  }

  // Save PDF file
  const fileName = safeFileName(payment);
  doc.save(fileName);
}
