import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { exportToCsv } from '../../utils/csvExport';
import { formatDate } from '../../utils/formatters';
import { pdfText, dash, drawHeader, drawKeyValueTable, addFooter } from '../../utils/stationReportExport';

const TABLE_STYLES = {
  fontSize: 7,
  cellPadding: { top: 1.2, right: 2, bottom: 1.2, left: 2 },
  textColor: [15, 23, 42],
  lineColor: [203, 213, 225],
  lineWidth: 0.2,
  valign: 'middle',
  overflow: 'linebreak',
  font: 'helvetica',
};

const HEAD_STYLES = {
  fillColor: [15, 118, 110],
  textColor: 255,
  fontSize: 6.5,
  fontStyle: 'bold',
  cellPadding: 1.2,
};

function itemLabel(item) {
  if (!item) return '-';
  return (
    [item.categoryName, item.componentName, item.subComponentName || item.name].filter(Boolean).join(' / ') ||
    item.name ||
    '-'
  );
}

function safeFileName(value) {
  return String(value || 'bom')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .trim();
}

export function downloadBomCsv(bom) {
  if (!bom) return;
  const rows = (bom.components || []).map((component, index) => ({
    sno: index + 1,
    item: itemLabel(component.stockItem),
    qtyPerPcs: component.qtyPerPcs ?? '',
    unit: component.stockItem?.unit || 'Nos',
  }));

  exportToCsv(
    `bom-${safeFileName(bom.name)}-v${safeFileName(bom.version || '1.0')}`,
    rows,
    [
      { field: 'sno', headerName: 'S.No' },
      { field: 'item', headerName: 'Item' },
      { field: 'qtyPerPcs', headerName: 'Qty for 1 PCS' },
      { field: 'unit', headerName: 'Unit' },
    ]
  );
}

export function downloadProductionCsv(production) {
  if (!production) return;
  const bomName = production.bomName || production.bom?.name || 'bom';
  const rows = (production.lines || []).map((line, index) => ({
    sno: index + 1,
    item: line.itemName || '-',
    qtyPerPcs: line.qtyPerPcs ?? '',
    requiredQty: line.requiredQty ?? '',
    unit: line.unit || 'Nos',
    availableQty: line.availableQty ?? '',
    productionQty: production.productionQty ?? '',
    person: production.person || '',
    productionDate: formatDate(production.productionDate),
    referenceNo: production.referenceNo || '',
  }));

  exportToCsv(
    `bom-production-${safeFileName(bomName)}-${safeFileName(formatDate(production.productionDate))}`,
    rows,
    [
      { field: 'sno', headerName: 'S.No' },
      { field: 'item', headerName: 'Item' },
      { field: 'qtyPerPcs', headerName: 'Qty for 1 PCS' },
      { field: 'requiredQty', headerName: 'Required Qty' },
      { field: 'unit', headerName: 'Unit' },
      { field: 'availableQty', headerName: 'Available Then' },
      { field: 'productionQty', headerName: 'Production Qty' },
      { field: 'person', headerName: 'Person' },
      { field: 'productionDate', headerName: 'Date' },
      { field: 'referenceNo', headerName: 'Reference' },
    ]
  );
}

export function downloadBomPdf(bom) {
  if (!bom) return;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = drawHeader(doc, `BOM: ${pdfText(bom.name)}`, 'Bill of Materials — qty required for 1 PCS');

  y = drawKeyValueTable(
    doc,
    [
      ['BOM Name', dash(bom.name)],
      ['Version', dash(bom.version)],
      ['Finished Item', itemLabel(bom.finishedItem)],
      ['Effective Date', formatDate(bom.effectiveDate)],
      ['Status', bom.isActive === false ? 'Inactive' : 'Active'],
      ['Components', String(bom.components?.length || 0)],
      ['Remarks', dash(bom.remarks)],
    ],
    y
  );

  const rows =
    bom.components?.length > 0
      ? bom.components.map((component, index) => [
          String(index + 1),
          itemLabel(component.stockItem),
          dash(component.qtyPerPcs ?? 0),
          dash(component.stockItem?.unit || 'Nos'),
        ])
      : [['-', 'No components', '-', '-']];

  autoTable(doc, {
    startY: y,
    head: [['#', 'Item', 'Qty for 1 PCS', 'Unit']],
    body: rows,
    theme: 'grid',
    headStyles: HEAD_STYLES,
    styles: TABLE_STYLES,
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 28, halign: 'right' },
      3: { cellWidth: 18, halign: 'center' },
    },
    margin: { left: 12, right: 12 },
  });

  addFooter(doc);
  doc.save(`bom-${safeFileName(bom.name)}-v${safeFileName(bom.version || '1.0')}.pdf`);
}

export function downloadProductionPdf(production) {
  if (!production) return;
  const bomName = production.bomName || production.bom?.name || 'BOM';
  const bomVersion = production.bomVersion || production.bom?.version || '';

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = drawHeader(
    doc,
    `BOM Production: ${pdfText(bomName)}`,
    'Items consumed from warehouse for this production'
  );

  y = drawKeyValueTable(
    doc,
    [
      ['BOM', `${dash(bomName)}${bomVersion ? ` v${bomVersion}` : ''}`],
      ['Production Qty', dash(production.productionQty)],
      ['Person', dash(production.person)],
      ['Date', formatDate(production.productionDate)],
      ['Reference', dash(production.referenceNo)],
      ['Remarks', dash(production.remarks)],
    ],
    y
  );

  const rows =
    production.lines?.length > 0
      ? production.lines.map((line, index) => [
          String(index + 1),
          dash(line.itemName),
          dash(line.qtyPerPcs ?? 0),
          `${dash(line.requiredQty ?? 0)} ${pdfText(line.unit || 'Nos')}`,
          dash(line.availableQty ?? 0),
        ])
      : [['-', 'No consumed items', '-', '-', '-']];

  autoTable(doc, {
    startY: y,
    head: [['#', 'Item', 'Qty / 1 PCS', 'Required', 'Available Then']],
    body: rows,
    theme: 'grid',
    headStyles: HEAD_STYLES,
    styles: TABLE_STYLES,
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 24, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 28, halign: 'right' },
    },
    margin: { left: 12, right: 12 },
  });

  addFooter(doc);
  doc.save(
    `bom-production-${safeFileName(bomName)}-${safeFileName(formatDate(production.productionDate))}.pdf`
  );
}
