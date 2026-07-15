import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './formatters';
import { stationWorkDonePct } from './projectFlow';

/** Make text safe for Helvetica PDF fonts (no rupee / unicode gaps). */
function pdfText(value) {
  if (value === null || value === undefined) return '-';
  return String(value)
    .replace(/\u20B9/g, 'Rs.') // rupee
    .replace(/[\u2013\u2014\u2212]/g, '-') // dashes
    .replace(/[\u2022\u00B7]/g, '-') // bullets / middle dot
    .replace(/[\u00A0\u202F\u2009\u2007]/g, ' ') // thin/nbsp spaces that break layout
    .replace(/[^\x20-\x7E]/g, (ch) => {
      // keep common printable latin; drop unsupported glyphs
      const code = ch.charCodeAt(0);
      return code > 255 ? '?' : ch;
    })
    .trim();
}

function dash(value) {
  const text = pdfText(value);
  return text === '' || text === '-' ? '-' : text;
}

function contactLabel(contact) {
  if (!contact) return '-';
  const label = [contact.name, contact.number].filter(Boolean).join(' / ');
  return dash(label);
}

/** PDF-safe Indian currency: Rs. 13,20,000 */
function pdfCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'Rs. 0';

  const negative = amount < 0;
  const abs = Math.abs(Math.round(amount));
  const str = String(abs);

  let formatted;
  if (str.length <= 3) {
    formatted = str;
  } else {
    const last3 = str.slice(-3);
    let rest = str.slice(0, -3);
    const parts = [];
    while (rest.length > 2) {
      parts.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    if (rest) parts.unshift(rest);
    formatted = `${parts.join(',')},${last3}`;
  }

  return `${negative ? '-' : ''}Rs. ${formatted}`;
}

function safeFilePart(value, fallback = 'item') {
  return String(value || fallback).replace(/[^\w\-]+/g, '_');
}

function ensureSpace(doc, y, needed = 28) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - 12) {
    doc.addPage();
    return 14;
  }
  return y;
}

function drawHeader(doc, title, subtitle) {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, pageWidth, 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(pdfText(title), 12, 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(pdfText(subtitle), 12, 14);

  doc.setFontSize(6.5);
  doc.text(`Generated: ${formatDate(new Date())}`, pageWidth - 12, 14, { align: 'right' });

  return 22;
}

function drawSectionTitle(doc, title, y) {
  y = ensureSpace(doc, y, 10);
  const width = doc.internal.pageSize.getWidth() - 24;
  doc.setFillColor(15, 118, 110);
  doc.rect(12, y - 3, width, 5.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(pdfText(title), 14, y + 0.8);
  return y + 5.5;
}

const VALUE_STYLES = {
  fontSize: 7,
  cellPadding: { top: 1.2, right: 2, bottom: 1.2, left: 2 },
  textColor: [15, 23, 42],
  lineColor: [203, 213, 225],
  lineWidth: 0.2,
  valign: 'middle',
  overflow: 'linebreak',
  font: 'helvetica',
};

function drawKeyValueTable(doc, rows, startY) {
  autoTable(doc, {
    startY,
    theme: 'grid',
    styles: VALUE_STYLES,
    columnStyles: {
      0: {
        fontStyle: 'bold',
        cellWidth: 48,
        fillColor: [241, 245, 249],
        textColor: [51, 65, 85],
        fontSize: 6.5,
      },
      1: {
        cellWidth: 'auto',
        fontStyle: 'normal',
        textColor: [15, 23, 42],
        fontSize: 7,
      },
    },
    body: rows.map(([label, value]) => [pdfText(label), pdfText(value)]),
    margin: { left: 12, right: 12 },
  });
  return doc.lastAutoTable.finalY + 3.5;
}

function drawMaterialsTable(doc, materials, startY) {
  const rows =
    materials?.length > 0
      ? materials.map((m, index) => [String(index + 1), dash(m.item), dash(m.qty ?? 0), dash(m.unit || 'Nos')])
      : [['-', 'No materials logged', '-', '-']];

  autoTable(doc, {
    startY,
    head: [['#', 'Item', 'Qty', 'Unit']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: 255,
      fontSize: 6.5,
      fontStyle: 'bold',
      cellPadding: 1.2,
    },
    styles: VALUE_STYLES,
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 12, right: 12 },
  });
  return doc.lastAutoTable.finalY + 3.5;
}

function drawDailyReportsTable(doc, dailyReports, startY) {
  const sorted = [...(dailyReports || [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const rows =
    sorted.length > 0
      ? sorted.map((entry, index) => [
          String(index + 1),
          formatDate(entry.createdAt),
          String(entry.photos?.length || 0),
          String(entry.videos?.length || 0),
          dash(entry.comment || 'None'),
          dash(entry.issue || 'None'),
        ])
      : [['-', '-', '-', '-', 'No daily entries', '-']];

  autoTable(doc, {
    startY,
    head: [['#', 'Date', 'Photos', 'Videos', 'Comment', 'Issue']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: 255,
      fontSize: 6.5,
      fontStyle: 'bold',
      cellPadding: 1.2,
    },
    styles: { ...VALUE_STYLES, fontSize: 6.5 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 58 },
      5: { cellWidth: 48 },
    },
    margin: { left: 12, right: 12 },
  });
  return doc.lastAutoTable.finalY + 3.5;
}

function addFooter(doc) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.line(12, pageHeight - 8, pageWidth - 12, pageHeight - 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text('NF Site Installation Report', 12, pageHeight - 4.5);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 12, pageHeight - 4.5, { align: 'right' });
  }
}

function renderStationSections(doc, project, station, startY) {
  let y = startY;
  const workDone = stationWorkDonePct(station);
  const dailyReports = station.dailyReports || [];
  const dailyPhotos = dailyReports.reduce((sum, r) => sum + (r.photos?.length || 0), 0);
  const dailyVideos = dailyReports.reduce((sum, r) => sum + (r.videos?.length || 0), 0);

  y = drawSectionTitle(doc, '1. Project Information', y);
  y = drawKeyValueTable(
    doc,
    [
      ['Project Name', dash(project.projectName)],
      ['Panel Serial No.', dash(project.panelSerialNo)],
      ['LOA No.', dash(project.loaNo)],
      ['Railway Zone', dash(project.railwayZone)],
      ['Assigned Installer', dash(project.installerName)],
      ['Contractor', dash(project.contractor)],
      ['Project Target Date', formatDate(project.targetDate)],
    ],
    y
  );

  y = drawSectionTitle(doc, '2. Station Details', y);
  y = drawKeyValueTable(
    doc,
    [
      ['Station Name', dash(station.name)],
      ['Site Type', dash(station.type || 'Station')],
      ['Work Done', `${workDone}%`],
      ['SSE', contactLabel(station.sse)],
      ['Installer (Site)', contactLabel(station.installer)],
      ['Supervisor', contactLabel(station.supervisor)],
    ],
    y
  );

  y = drawSectionTitle(doc, '3. Timeline', y);
  y = drawKeyValueTable(
    doc,
    [
      ['Installation Start Date', formatDate(station.startDate)],
      ['Installation Completion Date', formatDate(station.completionDate)],
      ['Commissioning Date', formatDate(station.commissioningDate)],
      ['Reason for Delay', dash(station.reasonForDelay || 'None')],
    ],
    y
  );

  y = drawSectionTitle(doc, '4. Materials Used', y);
  y = drawMaterialsTable(doc, station.materials, y);

  y = drawSectionTitle(doc, '5. Documentation & Media', y);
  y = drawKeyValueTable(
    doc,
    [
      ['Checklist Uploaded', station.checklistFile ? 'Yes' : 'No'],
      ['Checklist Signed', station.checklistSignedFile ? 'Yes' : 'No'],
      ['CAD Drawing', station.cadDrawingFile ? 'Yes' : 'No'],
      ['Work Photos', String(station.workPhotos?.length || 0)],
      ['Complete Photos', String(station.completePhotos?.length || 0)],
      ['Remaining Photos', String(station.remainingPhotos?.length || 0)],
      ['Daily Report Entries', String(dailyReports.length)],
      ['Daily Photos', String(dailyPhotos)],
      ['Daily Videos', String(dailyVideos)],
    ],
    y
  );

  y = drawSectionTitle(doc, '6. Claim & Bonus', y);
  y = drawKeyValueTable(
    doc,
    [
      ['Installation Amount Allocated', pdfCurrency(station.installationAmount || 0)],
      ['Claim Date', formatDate(station.claimDate)],
      ['Amount Requested', pdfCurrency(station.amountClaimed || 0)],
      ['After TDS (2%)', pdfCurrency(station.amountAfterTds || Math.round((Number(station.amountClaimed) || 0) * 0.98))],
      ['Amount Cleared', pdfCurrency(station.amountCleared || 0)],
      ['Claim Status', dash(station.claimStatus || 'Not Submitted')],
      ['Bonus Eligible', station.bonusEligible ? 'Yes' : 'No'],
      ['Bonus Percent', `${station.bonusPercent ?? 0}%`],
      ['Bonus Amount', pdfCurrency(station.bonusAmount || 0)],
    ],
    y
  );

  y = drawSectionTitle(doc, '7. Daily Photos & Videos Log', y);
  y = drawDailyReportsTable(doc, dailyReports, y);

  y = drawSectionTitle(doc, '8. Remarks', y);
  y = drawKeyValueTable(doc, [['Remarks', dash(station.remarks || 'No remarks recorded.')]], y);

  return y;
}

function buildStationPdf(project, stations, { title, subtitle }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  stations.forEach((station, index) => {
    if (index > 0) doc.addPage();
    let y = drawHeader(doc, title, subtitle);
    if (stations.length > 1) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 118, 110);
      doc.text(pdfText(`Station ${index + 1} of ${stations.length}: ${station.name || 'Untitled'}`), 12, y);
      y += 5;
    }
    renderStationSections(doc, project, station, y);
  });

  addFooter(doc);
  return doc;
}

/** Download a structured PDF for one particular station. */
export function downloadSingleStationReport(project, station) {
  if (!project || !station) return;

  const doc = buildStationPdf(project, [station], {
    title: 'Station Installation Report',
    subtitle: `${project.projectName || 'Project'} | ${station.name || 'Station'}`,
  });

  const filename = `${safeFilePart(project.projectName, 'project')}_${safeFilePart(station.name, 'station')}_report.pdf`;
  doc.save(filename);
}

/** Download a structured PDF for all stations (or a filtered subset). */
export function downloadStationWiseReport(project, stationIds = null) {
  const allStations = project?.stations || [];
  const stations =
    Array.isArray(stationIds) && stationIds.length > 0
      ? allStations.filter((s) => stationIds.map(String).includes(String(s._id)))
      : allStations;

  if (!stations.length) return;

  if (stations.length === 1) {
    downloadSingleStationReport(project, stations[0]);
    return;
  }

  const doc = buildStationPdf(project, stations, {
    title: 'Station-Wise Installation Report',
    subtitle: `${project.projectName || 'Project'} | ${stations.length} stations`,
  });

  doc.save(`${safeFilePart(project.projectName, 'project')}_station_wise_report.pdf`);
}
