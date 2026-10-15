import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { pdfText } from '../../utils/stationReportExport';
import { loadCompanyLogo } from '../../utils/companyLogo';
import { computePiTotals } from './piUtils';

const INK = [0, 0, 0];
const TEXT = [20, 20, 20];
const BODY = [55, 55, 55];
const HIGHLIGHT = [255, 255, 0];
const LINE_WIDTH = 0.3;

function txt(value) {
  if (value === null || value === undefined || value === '') return '';
  return pdfText(value);
}

function amount(value) {
  return (Number(value) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function longDate(value) {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function titleCase(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function safeFileName(value) {
  return String(value || 'proforma-invoice')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .trim();
}

export async function downloadProformaInvoicePdf(pi) {
  if (!pi) return;
  const company = pi.company || {};
  const logo = await loadCompanyLogo(company.name);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 10;
  const width = 190;
  const right = left + width;
  const split = 115;
  const infoLabelWidth = 30;
  const pad = 2.2;
  const party = pi.party || {};
  const bank = pi.bank || {};
  const items = pi.items || [];
  const totals = computePiTotals(pi);
  const gstRate = Number(pi.gstRate) || 0;

  const font = (style, size, color = TEXT) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };
  const resetLines = () => {
    doc.setLineWidth(LINE_WIDTH);
    doc.setDrawColor(...INK);
  };
  const ensureSpace = (needed, y) => {
    if (y + needed <= pageHeight - 8) return y;
    doc.addPage();
    resetLines();
    return 10;
  };
  resetLines();

  // Title row
  let y = 10;
  doc.rect(left, y, width, 9);
  font('bold', 14, INK);
  doc.text('PROFORMA INVOICE', left + width / 2, y + 6.5, { align: 'center' });
  y += 9;

  // Company name + address | logo
  font('bold', 13.5, INK);
  const nameLines = doc.splitTextToSize(txt(company.name).toUpperCase(), split - left - 6).slice(0, 2);
  font('bold', 8.5, INK);
  const addressLines = doc.splitTextToSize(txt(company.address), split - left - 6).slice(0, 3);
  const headerHeight = Math.max(19.5, 8 + nameLines.length * 5.5 + addressLines.length * 4);
  doc.rect(left, y, split - left, headerHeight);
  doc.rect(split, y, right - split, headerHeight);
  const leftCenter = (left + split) / 2;
  font('bold', 13.5, INK);
  nameLines.forEach((line, index) => doc.text(line, leftCenter, y + 7.5 + index * 5.5, { align: 'center' }));
  font('bold', 8.5, INK);
  const addressTop = y + 7.5 + nameLines.length * 5.5 + 1;
  addressLines.forEach((line, index) => {
    const lineY = addressTop + index * 4;
    doc.text(line, leftCenter, lineY, { align: 'center' });
    const lineWidth = doc.getTextWidth(line);
    doc.line(leftCenter - lineWidth / 2, lineY + 0.8, leftCenter + lineWidth / 2, lineY + 0.8);
  });

  const markCenter = (split + right) / 2;
  if (logo) {
    // Fixed logo box (narrower than the artwork's own proportions) to match the company's PI letterhead.
    const props = doc.getImageProperties(logo);
    const w = Math.min(57, right - split - 8);
    const h = Math.min(16, headerHeight - 3);
    doc.addImage(logo, props.fileType || 'PNG', markCenter - w / 2, y + (headerHeight - h) / 2, w, h);
  }
  y += headerHeight;

  // To | Date / PI No. / GST
  const infoRows = [
    ['Date:', longDate(pi.piDate)],
    ['PI No.:', pi.piNumber || 'Draft'],
    ...(pi.poNumber ? [['PO No.:', pi.poNumber]] : []),
    ['GST:', company.gstin],
  ];
  font('bold', 9);
  const partyLines = doc.splitTextToSize(txt(party.name), split - left - pad * 2);
  const toTextHeight = 12 + (partyLines.length + (party.gstin ? 1 : 0)) * 4.6;
  const toHeight = Math.max(infoRows.length * 7.3, toTextHeight);
  const infoRowHeight = toHeight / infoRows.length;
  doc.rect(left, y, split - left, toHeight);
  font('normal', 9);
  doc.text('To,', left + pad, y + 4.8);
  font('bold', 9);
  partyLines.forEach((line, index) => doc.text(line, left + pad, y + 10.5 + index * 4.6));
  if (party.gstin) doc.text(`GST :- ${txt(party.gstin)}`, left + pad, y + 10.5 + partyLines.length * 4.6);
  infoRows.forEach(([label, value], index) => {
    const rowY = y + index * infoRowHeight;
    doc.rect(split, rowY, infoLabelWidth, infoRowHeight);
    doc.rect(split + infoLabelWidth, rowY, right - split - infoLabelWidth, infoRowHeight);
    const baseline = rowY + infoRowHeight / 2 + 1.2;
    doc.text(label, split + pad, baseline);
    doc.text(txt(value), right - pad, baseline, { align: 'right' });
  });
  y += toHeight;

  // Items + totals
  const totalRow = (label, value) => [
    {
      content: label,
      colSpan: 6,
      styles: { halign: 'center', fontStyle: 'bold', fontSize: 9, fillColor: HIGHLIGHT, textColor: INK },
    },
    {
      content: amount(value),
      styles: { halign: 'right', fontStyle: 'bold', fontSize: 9, fillColor: HIGHLIGHT, textColor: INK },
    },
  ];
  autoTable(doc, {
    startY: y,
    margin: { left, right: 210 - right, top: 10, bottom: 10 },
    theme: 'grid',
    head: [['S.\nNo.', 'DESCRIPTION', 'Model No.', 'BOQ Qty', 'Unit', 'Basic Unit\nRate (INR)', 'Basic Amount\n(INR)']],
    body: [
      ...(items.length
        ? items.map((row, index) => [
            index + 1,
            txt(row.description),
            txt(row.modelNo),
            amount(row.qty),
            txt(row.unit),
            amount(row.rate),
            amount((Number(row.qty) || 0) * (Number(row.rate) || 0)),
          ])
        : [['', 'No items', '', '', '', '', '']]),
      totalRow(`Total Value of Supply Excluding ${gstRate}% GST`, totals.totalExGst),
      totalRow('Freight', totals.freight),
      totalRow('Total Amount', totals.totalAmount),
      totalRow(`GST ${gstRate}%`, totals.gstAmount),
      totalRow('Net Amount To Be Received', totals.netAmount),
    ],
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 },
      textColor: BODY,
      lineColor: INK,
      lineWidth: LINE_WIDTH,
      valign: 'top',
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: INK,
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
      valign: 'middle',
      lineColor: INK,
      lineWidth: LINE_WIDTH,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { halign: 'left' },
      2: { cellWidth: 22.5, halign: 'center' },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 12.5, halign: 'center' },
      5: { cellWidth: 27.5, halign: 'right' },
      6: { cellWidth: 27.5, halign: 'right' },
    },
  });
  y = doc.lastAutoTable.finalY;

  // Terms & Conditions
  const termsText = String(pi.terms || '').trim();
  if (termsText) {
    font('normal', 8.5);
    const termLines = doc.splitTextToSize(txt(termsText), width - pad * 2);
    const termsHeight = 9 + termLines.length * 3.8 + 2;
    y = ensureSpace(termsHeight, y);
    doc.rect(left, y, width, termsHeight);
    font('bold', 9);
    doc.text('Terms & Conditions:', left + pad, y + 5);
    font('normal', 8.5);
    termLines.forEach((line, index) => doc.text(line, left + pad, y + 9.8 + index * 3.8));
    y += termsHeight;
  }

  // Destination address | bank details
  font('normal', 8.5);
  const destLines = doc.splitTextToSize(txt(pi.deliveryAddress) || '-', split - left - pad * 2);
  const bankLines = [
    ['bold', bank.accountName],
    ['normal', bank.accountNo ? `A/C No.: ${bank.accountNo}` : ''],
    ['normal', bank.bankName ? `BANK NAME: ${bank.bankName}` : ''],
    ['normal', bank.ifsc ? `IFSC CODE: ${bank.ifsc}` : ''],
    ['normal', bank.branch ? `BRANCH: ${bank.branch}` : ''],
  ]
    .filter(([, value]) => String(value || '').trim())
    .flatMap(([style, value]) => {
      font(style, style === 'bold' ? 9 : 8.5);
      return doc.splitTextToSize(txt(value), right - split - pad * 2).map((line) => [style, line]);
    });
  const addressHeight = 10 + Math.max(destLines.length, bankLines.length) * 3.8 + 3;
  y = ensureSpace(addressHeight, y);
  doc.rect(left, y, split - left, addressHeight);
  doc.rect(split, y, right - split, addressHeight);
  font('bold', 9);
  doc.text('Destination Address:', left + pad, y + 5);
  doc.text('Bank Details:', split + pad, y + 5);
  font('normal', 8.5);
  destLines.forEach((line, index) => doc.text(line, left + pad, y + 9.3 + index * 3.8));
  bankLines.forEach(([style, line], index) => {
    font(style, style === 'bold' ? 9 : 8.5);
    doc.text(line, split + pad, y + 9.3 + index * 3.8);
  });
  y += addressHeight;

  // Thanking you | sign-off table
  const labelWidth = 34;
  const valueWidth = right - split - labelWidth - pad * 2;
  font('normal', 8.5);
  const signRows = [
    ['Prepared By', pi.preparedBy],
    ['Checked By', pi.checkedBy],
    ['Kindly Attention', pi.kindAttention],
    ['Remarks (If Any):', pi.remarks],
    ['Email:', pi.email],
  ].map(([label, value]) => {
    const lines = doc.splitTextToSize(txt(value), valueWidth);
    return { label, lines, height: Math.max(9, lines.length * 4 + 4.5) };
  });
  const signHeight = signRows.reduce((sum, row) => sum + row.height, 0);
  y = ensureSpace(signHeight, y);
  doc.rect(left, y, split - left, signHeight);
  font('normal', 9);
  doc.text('Thanking you', left + pad, y + 8);
  doc.text(`For ${titleCase(company.name)}`, left + pad, y + signHeight - 4);
  let rowY = y;
  signRows.forEach((row) => {
    doc.rect(split, rowY, labelWidth, row.height);
    doc.rect(split + labelWidth, rowY, right - split - labelWidth, row.height);
    font('bold', 9);
    doc.text(row.label, split + pad, rowY + 5.3);
    font('normal', 8.5);
    row.lines.forEach((line, index) => doc.text(line, split + labelWidth + pad, rowY + 5.3 + index * 3.8));
    rowY += row.height;
  });

  const pageCount = doc.getNumberOfPages();
  if (pageCount > 1) {
    for (let i = 1; i <= pageCount; i += 1) {
      doc.setPage(i);
      font('normal', 7, [110, 110, 110]);
      doc.text(`Page ${i} of ${pageCount}`, right, pageHeight - 5, { align: 'right' });
    }
  }

  doc.save(`${safeFileName(pi.piNumber || 'proforma-invoice-draft')}.pdf`);
}
