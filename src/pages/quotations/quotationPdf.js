import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from '../../utils/formatters';
import { pdfText } from '../../utils/stationReportExport';
import { computeTotals, serialNumbers } from './quotationUtils';

const INK = [17, 17, 17];
const BODY = [55, 55, 55];
const RULE = [200, 200, 200];
const TABLE_HEAD = [52, 73, 94];

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function safeFileName(value) {
  return String(value || 'quotation')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .trim();
}

function txt(value) {
  if (value === null || value === undefined || value === '') return '';
  return pdfText(value);
}

function amount(value) {
  return (Number(value) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function twoDigitWords(n) {
  if (n < 20) return ONES[n];
  return [TENS[Math.floor(n / 10)], ONES[n % 10]].filter(Boolean).join(' ');
}

function threeDigitWords(n) {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  return [hundreds ? `${ONES[hundreds]} Hundred` : '', rest ? twoDigitWords(rest) : ''].filter(Boolean).join(' ');
}

function integerWords(n) {
  if (n === 0) return 'Zero';
  const parts = [];
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;
  if (crore) parts.push(`${integerWords(crore)} Crore`);
  if (lakh) parts.push(`${twoDigitWords(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigitWords(thousand)} Thousand`);
  if (rest) parts.push(threeDigitWords(rest));
  return parts.join(' ');
}

export function amountInWords(value) {
  const total = Math.round(Math.abs(Number(value) || 0) * 100);
  const rupees = Math.floor(total / 100);
  const paise = total % 100;
  const words = `${integerWords(rupees)} Rupees`;
  return paise ? `${words} and ${twoDigitWords(paise)} Paise Only` : `${words} Only`;
}

export function downloadQuotationPdf(quotation) {
  if (!quotation) return;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 17;
  const contentWidth = pageWidth - margin * 2;
  const center = pageWidth / 2;
  const rightCol = 119;
  const items = quotation.items || [];
  const totals = computeTotals(quotation);
  const serials = serialNumbers(items);
  const company = quotation.company || {};
  const party = quotation.party || {};

  const footerTop = pageHeight - 24;
  const ensureSpace = (needed, y) => {
    if (y + needed <= footerTop - 4) return y;
    doc.addPage();
    return 18;
  };

  // Letterhead
  let y = 18;
  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(txt(company.name).toUpperCase() || 'QUOTATION', center, y, { align: 'center' });
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const headerLines = [
    ...doc.splitTextToSize(txt(company.address).toUpperCase(), contentWidth),
    company.gstin ? `GST: ${txt(company.gstin)}` : '',
    company.contactPerson ? `Contact: ${txt(company.contactPerson).toUpperCase()}` : '',
    [txt(company.phone), txt(company.email)].filter(Boolean).join(' | '),
  ].filter(Boolean);
  headerLines.forEach((line) => {
    doc.text(line, center, y, { align: 'center' });
    y += 3.7;
  });

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('QUOTATION', center, y, { align: 'center' });
  y += 3;
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);

  // Quotation details
  y += 8;
  doc.setFontSize(8);
  const leftRows = [
    ['Quotation No:', quotation.quotationNo || 'Draft'],
    ['Date:', formatDate(quotation.quotationDate || new Date())],
    ['Project:', quotation.projectName],
    ['Tech Spec Checked By:', quotation.techSpecCheckedBy],
  ];
  const rightRows = [
    ['Prepared By:', quotation.preparedBy],
    ['Salesperson:', quotation.salesperson],
    ['Checked By:', quotation.checkedBy],
  ];
  const drawDetail = ([label, value], x, valueX, rowY) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...INK);
    doc.text(label, x, rowY);
    const labelEnd = x + doc.getTextWidth(label) + 3;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BODY);
    doc.text(txt(value) || '-', Math.max(valueX, labelEnd), rowY);
  };
  const rowGap = 5.6;
  leftRows.forEach((row, index) => drawDetail(row, margin, margin + 33, y + index * rowGap));
  rightRows.forEach((row, index) => drawDetail(row, rightCol, rightCol + 29, y + index * rowGap));
  y += (leftRows.length - 1) * rowGap + 6;

  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);

  // Bill To
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...INK);
  doc.text('Bill To:', margin, y);
  y += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BODY);
  const billWidth = 92;
  const billLines = [
    ...doc.splitTextToSize(txt(party.name), billWidth),
    ...doc.splitTextToSize(txt(party.address), billWidth),
  ].filter(Boolean);
  billLines.forEach((line, index) => doc.text(line, margin, y + index * 4.2));
  const contact = [txt(party.contactPerson), txt(party.phone), txt(party.email)].filter(Boolean).join(', ');
  const rightWidth = pageWidth - margin - rightCol;
  const gstLines = doc.splitTextToSize(`GST: ${txt(party.gstin)}`, rightWidth);
  const contactLines = doc.splitTextToSize(`Contact: ${contact}`, rightWidth);
  doc.text(gstLines, rightCol, y);
  doc.text(contactLines, rightCol, y + gstLines.length * 4.2 + 1.8);
  const rightHeight = (gstLines.length + contactLines.length) * 4.2 + 1.8;
  y += Math.max(billLines.length * 4.2, rightHeight) + 2;

  doc.line(margin, y, pageWidth - margin, y);

  // Products
  autoTable(doc, {
    startY: y + 8,
    margin: { left: margin, right: margin, top: 18, bottom: pageHeight - footerTop + 4 },
    theme: 'grid',
    head: [['Sr.\nNo.', 'Model No.', 'Description', 'Qty', 'Unit Price\n(Rs.)', 'Total (Rs.)']],
    body: items.length
      ? items.map((row, index) => [
          serials[index],
          txt(row.modelNo),
          txt(row.description),
          `${Number(row.qty) || 0} ${txt(row.unit || 'Nos').toLowerCase()}.`,
          amount(row.price),
          amount((Number(row.qty) || 0) * (Number(row.price) || 0)),
        ])
      : [['-', '-', 'No products', '-', '-', '-']],
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2.4,
      textColor: BODY,
      lineColor: RULE,
      lineWidth: 0.2,
      valign: 'middle',
      halign: 'center',
    },
    headStyles: {
      fillColor: TABLE_HEAD,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
      lineColor: TABLE_HEAD,
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 25 },
      2: { halign: 'left' },
      3: { cellWidth: 20 },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 26, halign: 'right' },
    },
    didParseCell: (data) => {
      if (data.section === 'head' && data.column.index === 2) data.cell.styles.halign = 'center';
      if (data.section === 'body' && items[data.row.index]?.lineType === 'sub' && data.column.index === 2) {
        data.cell.styles.cellPadding = { top: 2.4, bottom: 2.4, left: 6, right: 2.4 };
      }
    },
  });

  // Totals
  const discountPercent = Number(quotation.discountPercent) || 0;
  const totalRows = [
    ['Subtotal:', totals.subtotal],
    ...(discountPercent > 0 ? [[`Discount (${discountPercent}%):`, -totals.discountAmount]] : []),
    [`GST (${Number(quotation.gstRate) || 0}%):`, totals.gstAmount],
    ['Packing & Freight:', totals.packingFreight],
  ];
  y = ensureSpace(14 + totalRows.length * 6.5 + 18, doc.lastAutoTable.finalY + 10);
  const labelX = 106;
  const valueX = pageWidth - margin - 3;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BODY);
  totalRows.forEach(([label, value]) => {
    doc.text(label, labelX, y);
    doc.text(`${value < 0 ? '- ' : ''}Rs. ${amount(Math.abs(value))}`, valueX, y, { align: 'right' });
    y += 6.5;
  });
  y -= 2.5;
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.4);
  doc.line(labelX - 4, y, pageWidth - margin, y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text('Total Amount:', labelX, y);
  doc.text(`Rs. ${amount(totals.totalAmount)}`, valueX, y, { align: 'right' });

  y += 9;
  doc.setFontSize(7.5);
  const wordsLines = doc.splitTextToSize(
    `Total Amount (In Words): ${amountInWords(totals.totalAmount)}`,
    contentWidth
  );
  doc.text(wordsLines, margin, y);
  y += wordsLines.length * 3.6 + 9;

  const addBlock = (title, body) => {
    if (!body) return;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const lines = doc.splitTextToSize(txt(body), contentWidth);
    y = ensureSpace(10 + Math.min(lines.length, 6) * 3.6, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(title, margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...BODY);
    lines.forEach((line) => {
      y = ensureSpace(4, y);
      doc.text(line, margin, y);
      y += 3.6;
    });
    y += 6;
  };
  addBlock('Terms & Conditions:', quotation.terms?.content);
  addBlock('Notes:', quotation.notes);

  const generatedOn = new Date().toLocaleString('en-IN');
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.3);
    doc.line(margin, footerTop, pageWidth - margin, footerTop);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(110, 110, 110);
    doc.text('This is a computer-generated quotation', center, footerTop + 6, { align: 'center' });
    doc.text(`Generated on: ${generatedOn}`, center, footerTop + 11, { align: 'center' });
    if (pageCount > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, footerTop + 11, { align: 'right' });
    }
  }

  doc.save(`${safeFileName(quotation.quotationNo || 'quotation-draft')}.pdf`);
}
