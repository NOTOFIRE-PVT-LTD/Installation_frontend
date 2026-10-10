import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from '../../utils/formatters';
import { pdfText } from '../../utils/stationReportExport';
import { amountInWords } from '../quotations/quotationPdf';
import { computePiTotals } from './piUtils';

const INK = [17, 17, 17];
const BODY = [55, 55, 55];
const RULE = [200, 200, 200];
const TABLE_HEAD = [52, 73, 94];

function txt(value) {
  if (value === null || value === undefined || value === '') return '';
  return pdfText(value);
}

function amount(value) {
  return (Number(value) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function safeFileName(value) {
  return String(value || 'proforma-invoice')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .trim();
}

export function downloadProformaInvoicePdf(pi) {
  if (!pi) return;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const center = pageWidth / 2;
  const rightCol = 119;
  const items = pi.items || [];
  const totals = computePiTotals(pi);
  const company = pi.company || {};
  const party = pi.party || {};
  const bank = pi.bank || {};

  const footerTop = pageHeight - 22;
  const ensureSpace = (needed, y) => {
    if (y + needed <= footerTop - 4) return y;
    doc.addPage();
    return 18;
  };

  // Letterhead
  let y = 17;
  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(txt(company.name).toUpperCase() || 'PROFORMA INVOICE', center, y, { align: 'center' });
  y += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const headerLines = [
    ...doc.splitTextToSize(txt(company.address).toUpperCase(), contentWidth),
    company.gstin ? `GST: ${txt(company.gstin)}` : '',
    [txt(company.phone), txt(pi.email || company.email)].filter(Boolean).join(' | '),
  ].filter(Boolean);
  headerLines.forEach((line) => {
    doc.text(line, center, y, { align: 'center' });
    y += 3.7;
  });

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('PROFORMA INVOICE', center, y, { align: 'center' });
  y += 3;
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);

  // PI details
  y += 7;
  doc.setFontSize(8);
  const drawDetail = ([label, value], x, valueX, rowY) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...INK);
    doc.text(label, x, rowY);
    const labelEnd = x + doc.getTextWidth(label) + 3;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BODY);
    doc.text(txt(value) || '-', Math.max(valueX, labelEnd), rowY);
  };
  const leftRows = [
    ['PI Number:', pi.piNumber || 'Draft'],
    ['Date:', formatDate(pi.piDate || new Date())],
  ];
  const rightRows = [
    ['PO Number:', pi.poNumber],
    ['Quotation Ref:', pi.quotation?.quotationNo],
  ];
  const rowGap = 5.6;
  leftRows.forEach((row, index) => drawDetail(row, margin, margin + 22, y + index * rowGap));
  rightRows.forEach((row, index) => drawDetail(row, rightCol, rightCol + 25, y + index * rowGap));
  y += (leftRows.length - 1) * rowGap + 5;
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);

  // To / delivery
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...INK);
  doc.text('To:', margin, y);
  doc.text('Delivery Address:', rightCol, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BODY);
  const leftWidth = rightCol - margin - 6;
  const rightWidth = pageWidth - margin - rightCol;
  const toLines = [
    ...doc.splitTextToSize(txt(party.name), leftWidth),
    ...(party.gstin ? doc.splitTextToSize(`GST: ${txt(party.gstin)}`, leftWidth) : []),
    ...(pi.kindAttention ? doc.splitTextToSize(`Kind Attn: ${txt(pi.kindAttention)}`, leftWidth) : []),
  ];
  const deliveryLines = doc.splitTextToSize(txt(pi.deliveryAddress) || '-', rightWidth);
  toLines.forEach((line, index) => doc.text(line, margin, y + index * 4.2));
  deliveryLines.forEach((line, index) => doc.text(line, rightCol, y + index * 4.2));
  y += Math.max(toLines.length, deliveryLines.length) * 4.2 + 1;
  doc.line(margin, y, pageWidth - margin, y);

  // Items
  autoTable(doc, {
    startY: y + 6,
    margin: { left: margin, right: margin, top: 18, bottom: pageHeight - footerTop + 4 },
    theme: 'grid',
    head: [['S.No', 'Description', 'Model No', 'Qty', 'Unit', 'Unit Rate\n(Rs.)', 'Amount (Rs.)']],
    body: items.length
      ? items.map((row, index) => [
          index + 1,
          txt(row.description),
          txt(row.modelNo),
          Number(row.qty) || 0,
          txt(row.unit || 'Nos'),
          amount(row.rate),
          amount((Number(row.qty) || 0) * (Number(row.rate) || 0)),
        ])
      : [['-', 'No items', '-', '-', '-', '-', '-']],
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: BODY,
      lineColor: RULE,
      lineWidth: 0.2,
      valign: 'middle',
      halign: 'center',
    },
    headStyles: { fillColor: TABLE_HEAD, textColor: 255, fontStyle: 'bold', fontSize: 8, lineColor: TABLE_HEAD },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { halign: 'left' },
      2: { cellWidth: 28 },
      3: { cellWidth: 14 },
      4: { cellWidth: 15 },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 28, halign: 'right' },
    },
    didParseCell: (data) => {
      if (data.section === 'head') data.cell.styles.halign = 'center';
    },
  });

  // Totals
  const gstRate = Number(pi.gstRate) || 0;
  const totalRows = [
    ['Total (Excluding GST):', totals.totalExGst],
    ['Freight:', totals.freight],
    ['Total Amount:', totals.totalAmount],
    [`GST ${gstRate}%:`, totals.gstAmount],
  ];
  y = ensureSpace(totalRows.length * 6 + 26, doc.lastAutoTable.finalY + 9);
  const labelX = 104;
  const valueX = pageWidth - margin - 3;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BODY);
  totalRows.forEach(([label, value]) => {
    doc.text(label, labelX, y);
    doc.text(`Rs. ${amount(value)}`, valueX, y, { align: 'right' });
    y += 6;
  });
  y -= 2.5;
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.4);
  doc.line(labelX - 4, y, pageWidth - margin, y);
  y += 7.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text('Net Amount To Be Received:', labelX, y);
  doc.text(`Rs. ${amount(totals.netAmount)}`, valueX, y, { align: 'right' });

  y += 8;
  doc.setFontSize(7.5);
  const wordsLines = doc.splitTextToSize(`Amount (In Words): ${amountInWords(totals.netAmount)}`, contentWidth);
  doc.text(wordsLines, margin, y);
  y += wordsLines.length * 3.6 + 7;

  const blockTitle = (title) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(title, margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...BODY);
  };

  const addTextBlock = (title, body) => {
    if (!String(body || '').trim()) return;
    doc.setFontSize(7.5);
    const lines = doc.splitTextToSize(txt(body), contentWidth);
    y = ensureSpace(10 + Math.min(lines.length, 6) * 3.6, y);
    blockTitle(title);
    lines.forEach((line) => {
      y = ensureSpace(4, y);
      doc.text(line, margin, y);
      y += 3.6;
    });
    y += 5;
  };

  addTextBlock('Terms & Conditions:', pi.terms);

  const bankRows = [
    ['Account Name:', bank.accountName],
    ['A/C No.:', bank.accountNo],
    ['Bank Name:', bank.bankName],
    ['IFSC Code:', bank.ifsc],
    ['Branch:', bank.branch],
  ].filter(([, value]) => String(value || '').trim());
  if (bankRows.length) {
    y = ensureSpace(10 + bankRows.length * 4.4, y);
    blockTitle('Bank Details:');
    bankRows.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin, y);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(txt(value), contentWidth - 26);
      doc.text(lines, margin + 26, y);
      y += lines.length * 3.8 + 0.6;
    });
    y += 5;
  }

  addTextBlock('Remarks:', pi.remarks);

  // Sign-off
  y = ensureSpace(19, y + 2);
  doc.setFontSize(8);
  drawDetail(['Prepared By:', pi.preparedBy], margin, margin + 22, y);
  drawDetail(['Checked By:', pi.checkedBy], margin, margin + 22, y + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...INK);
  doc.text(`For ${txt(company.name).toUpperCase()}`, pageWidth - margin, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BODY);
  doc.text('Authorised Signatory', pageWidth - margin, y + 16, { align: 'right' });
  if (pi.email) {
    drawDetail(['Email:', pi.email], margin, margin + 22, y + 11);
  }

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
    doc.text('This is a computer-generated Proforma Invoice', center, footerTop + 6, { align: 'center' });
    doc.text(`Generated on: ${generatedOn}`, center, footerTop + 11, { align: 'center' });
    if (pageCount > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, footerTop + 11, { align: 'right' });
    }
  }

  doc.save(`${safeFileName(pi.piNumber || 'proforma-invoice-draft')}.pdf`);
}
