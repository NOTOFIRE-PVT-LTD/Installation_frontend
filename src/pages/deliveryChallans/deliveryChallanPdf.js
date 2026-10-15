import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { loadCompanyLogo } from '../../utils/companyLogo';
import { pdfText } from '../../utils/stationReportExport';
import { amountInWords } from '../quotations/quotationPdf';
import { dcTotal } from './dcUtils';

const INK = [0, 0, 0];
const GREY = [70, 70, 70];
const WHITE = [255, 255, 255];
const LINE_WIDTH = 0.35;
const MARGIN = 8;
const TOP = 12;
const BOTTOM = 12;
const LINE_STEP = 4.6;
const FOOTER_STEP = 5;
const BODY_SIZE = 9;
const RULE_55_TEXT =
  'For Movement of goods under Rule 55 of GST Rules, 2017 from the registered premises of supplier in the premises of recipient for approval of goods .';

function txt(value) {
  if (value === null || value === undefined || value === '') return '';
  return pdfText(value);
}

function amount(value) {
  return (Number(value) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function dmy(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}

function titleCase(value) {
  return txt(value)
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function safeFileName(value) {
  return String(value || 'delivery-challan')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .trim();
}

export async function downloadDeliveryChallanPdf(dc) {
  if (!dc) return;
  const company = dc.company || {};
  const recipient = dc.recipient || {};
  const items = dc.items || [];
  const total = dcTotal(items);
  const logo = await loadCompanyLogo(company.name);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = MARGIN;
  const right = pageWidth - MARGIN;
  const width = right - left;
  const center = pageWidth / 2;
  const pageBottom = pageHeight - BOTTOM;

  const setFont = (size, style = 'bold') => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(...INK);
  };
  const rule = (atY) => {
    doc.setDrawColor(...INK);
    doc.setLineWidth(LINE_WIDTH);
    doc.line(left, atY, right, atY);
  };

  let y = TOP;
  const ensureSpace = (needed) => {
    if (y + needed <= pageBottom) return;
    doc.addPage();
    y = TOP;
  };
  const writeText = (text, { style = 'bold', rightText = '', step = LINE_STEP } = {}) => {
    setFont(BODY_SIZE, 'bold');
    const reserved = rightText ? doc.getTextWidth(rightText) + 8 : 0;
    setFont(BODY_SIZE, style);
    const lines = doc.splitTextToSize(text, width - 4 - reserved);
    lines.forEach((line, index) => {
      ensureSpace(step);
      setFont(BODY_SIZE, style);
      doc.text(line, left + 2, y + step / 2 + 1.1);
      if (index === 0 && rightText) {
        setFont(BODY_SIZE, 'bold');
        doc.text(rightText, right - 2, y + step / 2 + 1.1, { align: 'right' });
      }
      y += step;
    });
  };
  const section = (write) => {
    y += 0.3;
    write();
    y += 0.3;
    rule(y);
  };

  // Header: logo on the left, company details centred on the right
  const headerTop = y;
  const textCenter = logo ? right - 54 : center;
  const textWidth = logo ? 98 : width - 8;
  setFont(11);
  let textY = y + 5.2;
  doc.text(txt(company.name).toUpperCase(), textCenter, textY, { align: 'center' });
  setFont(7.9);
  const addressLines = doc.splitTextToSize(txt(company.address), textWidth);
  addressLines.forEach((line, index) => {
    textY += index === 0 ? 4.2 : 3.1;
    doc.text(line, textCenter, textY, { align: 'center' });
  });
  const idLine = [company.gstin && `GSTIN : ${txt(company.gstin)}`, company.cin && `CIN: ${txt(company.cin)}`]
    .filter(Boolean)
    .join('     ');
  if (idLine) {
    textY += 3.5;
    doc.text(idLine, textCenter, textY, { align: 'center' });
  }
  y += Math.max(18, textY - y + 2.2);
  if (logo) {
    // Fixed logo box (narrower than the artwork's own proportions) to match the company's DC letterhead.
    const props = doc.getImageProperties(logo);
    doc.addImage(logo, props.fileType || 'PNG', left + 18.8, headerTop + 2.8, 49, 13.2);
  }
  rule(y);

  setFont(12);
  doc.text('DELIVERY CHALLAN', center, y + 5, { align: 'center' });
  y += 7.2;
  rule(y);

  setFont(7.8, 'normal');
  const ruleLines = doc.splitTextToSize(RULE_55_TEXT, width - 4);
  ruleLines.forEach((line, index) => doc.text(line, center, y + 3.5 + index * 3.1, { align: 'center' }));
  y += 5.2 + (ruleLines.length - 1) * 3.1;
  rule(y);

  section(() => {
    writeText(`DC NO :${txt(dc.dcNumber) || 'Draft'}`);
    writeText(`DATE - ${dmy(dc.dcDate)}`);
  });
  section(() => {
    writeText(`Receiver Name / Visitor Name : ${txt(dc.receiverName)}`);
    writeText(`Receiver Number / Visitor Number : ${txt(dc.receiverNumber)}`);
  });
  section(() => writeText('Name and Address of the Recipient:'));
  y += 0.8;
  writeText(txt(recipient.name), { step: 5 });
  if (recipient.address) writeText(`ADD : ${txt(recipient.address)}`, { style: 'normal', step: 5 });
  if (dc.deliveryAddress) writeText(`Delivery Address : ${txt(dc.deliveryAddress)}`, { style: 'normal', step: 5 });
  y += 0.8;

  const tableStyles = {
    font: 'helvetica',
    fontSize: 8.6,
    textColor: INK,
    fillColor: WHITE,
    lineColor: INK,
    lineWidth: LINE_WIDTH,
    valign: 'middle',
  };

  autoTable(doc, {
    startY: y,
    margin: { left, right: MARGIN, top: TOP, bottom: BOTTOM },
    theme: 'grid',
    head: [['S.NO', 'Name of Item', 'HSN CODE', 'QTY', 'UOM', 'RATE', 'VALUE']],
    body: [
      ...(items.length
        ? items.map((row, index) => [
            index + 1,
            txt(row.name),
            txt(row.hsnCode),
            Number(row.qty) || 0,
            txt(row.uom || 'Nos'),
            amount(row.rate),
            amount((Number(row.qty) || 0) * (Number(row.rate) || 0)),
          ])
        : [['-', 'No items', '-', '-', '-', '-', '-']]),
      [
        { content: 'Total', colSpan: 6, styles: { halign: 'center', fontStyle: 'bold' } },
        { content: amount(total), styles: { halign: 'right', fontStyle: 'bold', textColor: INK } },
      ],
    ],
    styles: { ...tableStyles, halign: 'center', cellPadding: { top: 2, bottom: 2, left: 1.5, right: 1.5 } },
    headStyles: { fillColor: WHITE, textColor: INK, fontStyle: 'bold', fontSize: 8.8 },
    bodyStyles: { textColor: GREY },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { fontStyle: 'bold' },
      2: { cellWidth: 24.5 },
      3: { cellWidth: 13.5 },
      4: { cellWidth: 16 },
      5: { cellWidth: 22 },
      6: { cellWidth: 24 },
    },
  });
  y = doc.lastAutoTable.finalY + 0.6;

  writeText(`Amount In Word- ${txt(dc.amountInWords) || amountInWords(total)} .`, { step: 5 });

  const taxRows = [
    ['Rate of Tax', dc.rateOfTax || 'GST not applicable'],
    ['Tax Amount a) IGST and CGST/SGST', dc.taxAmount || 'NA'],
    ['Place of supply', dc.placeOfSupply || 'NA'],
    ['Mode of Dispatch', dc.modeOfDispatch || 'NA'],
    ['Expected duration of process of goods', dc.expectedDuration || 'NA'],
  ];
  autoTable(doc, {
    startY: y + 1.8,
    margin: { left: left + 18, right: MARGIN + 8.3, top: TOP, bottom: BOTTOM },
    theme: 'grid',
    body: taxRows.map(([label, value], index) => [index + 1, label, `: ${txt(value)}`]),
    styles: { ...tableStyles, cellPadding: { top: 1.15, bottom: 1.15, left: 1.8, right: 1.8 } },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 80, fontStyle: 'bold' },
    },
  });
  y = doc.lastAutoTable.finalY + 4.2;

  const forCompany = company.name ? `For ${titleCase(company.name)}` : '';
  const footerLine = (text, options = {}) => writeText(text, { step: FOOTER_STEP, ...options });
  if (dc.originalInvoiceRef) {
    footerLine(`NOTE: MATERIAL DELIVERED UNDER GUARANTEE CLAUSE, ORIGINAL INV. NO.${txt(dc.originalInvoiceRef)}`);
  }
  if (dc.panelNo) footerLine(`Panel No :${txt(dc.panelNo)}`);
  footerLine(`COMPLAINT NO. ${txt(dc.complaintNo) || 'NA'}`, { rightText: forCompany });
  footerLine(`Fault/Vision : ${txt(dc.fault) || 'NA'}`);

  ensureSpace(FOOTER_STEP * 2 + 10);
  y += 4.2;
  footerLine(`DELIVERY CHALLAN APPROVED BY : ${txt(dc.approvedBy)}`, { rightText: 'Authorised signatory' });
  y += 1.2;
  footerLine(`DELIVERY CHALLAN REQUESTED BY :${txt(dc.requestedBy)}`);
  if (dc.vehicleTransporter) footerLine(`VEHICLE / TRANSPORTER : ${txt(dc.vehicleTransporter)}`);
  if (dc.notes) footerLine(`Notes : ${txt(dc.notes)}`, { style: 'normal' });
  y += 2.2;

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(...INK);
    doc.setLineWidth(LINE_WIDTH);
    doc.rect(left, TOP, width, (i === pageCount ? y : pageBottom) - TOP);
    if (pageCount > 1) {
      setFont(6.5, 'normal');
      doc.text(`Page ${i} of ${pageCount}`, right, pageHeight - 6, { align: 'right' });
    }
  }

  doc.save(`${safeFileName(dc.dcNumber || 'delivery-challan-draft')}.pdf`);
}
