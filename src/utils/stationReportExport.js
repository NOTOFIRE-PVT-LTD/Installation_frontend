import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { formatDate } from './formatters';
import { stationWorkDonePct } from './projectFlow';

GlobalWorkerOptions.workerSrc = pdfWorker;

/** Make text safe for Helvetica PDF fonts (no rupee / unicode gaps). */
function pdfText(value) {
  if (value === null || value === undefined) return '-';
  return String(value)
    .replace(/\u20B9/g, 'Rs.') // rupee
    .replace(/[\u2013\u2014\u2212]/g, '-') // dashes
    .replace(/[\u2022\u00B7]/g, '-') // bullets / middle dot
    .replace(/[\u00A0\u202F\u2009\u2007]/g, ' ') // thin/nbsp spaces that break layout
    .replace(/[^\x20-\x7E]/g, (ch) => {
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

function drawSubheading(doc, title, y) {
  y = ensureSpace(doc, y, 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 118, 110);
  doc.text(pdfText(title), 12, y);
  return y + 3.5;
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

/** Convert Cloudinary PDF/raw URLs into a first-page JPEG preview when possible. */
function toEmbeddableImageUrl(url) {
  if (!url) return null;
  const lower = url.toLowerCase();

  if (/\.(jpe?g|png|gif|webp|bmp)(\?|$)/i.test(url)) return url;

  if (url.includes('res.cloudinary.com')) {
    if (url.includes('/raw/upload/')) {
      return url.replace('/raw/upload/', '/image/upload/f_jpg,pg_1,q_auto/');
    }
    if (url.includes('/image/upload/')) {
      if (/\.pdf(\?|$)/i.test(lower) || !/\/upload\/(?:[^/]+,)*f_/.test(url)) {
        return url.replace('/image/upload/', '/image/upload/f_jpg,pg_1,q_auto/');
      }
    }
    if (url.includes('/upload/') && !url.includes('f_jpg')) {
      return url.replace('/upload/', '/upload/f_jpg,pg_1,q_auto/');
    }
  }

  return url;
}

function loadImageElement(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

function isLikelyPdf(url = '') {
  const lower = String(url).toLowerCase();
  return lower.includes('.pdf') || lower.includes('/raw/upload/');
}

/**
 * Renders each page of a remote PDF into JPEG data URLs (via pdf.js).
 */
async function loadPdfPagesAsJpegs(url, { maxPages = 12 } = {}) {
  const loadingTask = getDocument({
    url,
    withCredentials: false,
    // Avoid pdf.js range requests that can fail on some CDNs
    disableRange: true,
    disableStream: true,
  });
  const pdf = await loadingTask.promise;
  const pageCount = Math.min(pdf.numPages || 0, maxPages);
  const pages = [];

  for (let pageNum = 1; pageNum <= pageCount; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.35 });
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    pages.push({
      dataUrl: canvas.toDataURL('image/jpeg', 0.84),
      width: canvas.width,
      height: canvas.height,
      sourceUrl: url,
      pageLabel: `Page ${pageNum}`,
    });
  }

  return pages;
}

/**
 * Loads a remote media URL into JPEG data URL(s) usable by jsPDF.
 * Images → one JPEG. PDFs → one JPEG per page (up to maxPages).
 */
async function loadMediaRenders(media) {
  const originalUrl = media?.url;
  if (!originalUrl) return [];

  if (isLikelyPdf(originalUrl)) {
    try {
      return await loadPdfPagesAsJpegs(originalUrl);
    } catch {
      // fall through to image/Cloudinary preview attempts
    }
  }

  const candidates = [toEmbeddableImageUrl(originalUrl), originalUrl].filter(
    (url, index, arr) => url && arr.indexOf(url) === index
  );

  for (const candidate of candidates) {
    try {
      const img = await loadImageElement(candidate);
      const maxSide = 1600;
      const scale = Math.min(1, maxSide / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height, 1));
      const width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
      const height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      return [
        {
          dataUrl: canvas.toDataURL('image/jpeg', 0.82),
          width,
          height,
          sourceUrl: originalUrl,
        },
      ];
    } catch {
      // try next candidate
    }
  }

  return [];
}

function drawMissingMediaNote(doc, label, media, y) {
  y = ensureSpace(doc, y, 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);

  if (media?.url) {
    const line = pdfText(`${label}: attached (preview unavailable)`);
    doc.text(line, 12, y);
    try {
      doc.setTextColor(47, 111, 237);
      doc.textWithLink('Open original file', 12, y + 3.5, { url: media.url });
    } catch {
      doc.setTextColor(47, 111, 237);
      doc.text(pdfText(media.url), 12, y + 3.5);
    }
    return y + 8;
  }

  doc.text(pdfText(`${label}: Not uploaded`), 12, y);
  return y + 5;
}

/**
 * Draws attached images in a responsive 2-column gallery.
 * PDF attachments expand to one image per page.
 * @returns {Promise<number>} next Y
 */
async function drawImageGallery(doc, items, startY, { columns = 2, maxHeight = 58 } = {}) {
  const list = (items || []).filter((item) => item?.url);
  if (!list.length) return startY;

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 12;
  const gap = 4;
  const usableWidth = pageWidth - marginX * 2;
  const cellWidth = (usableWidth - gap * (columns - 1)) / columns;

  let y = startY;
  let col = 0;
  let rowMaxHeight = 0;
  let attachmentIndex = 0;

  for (const item of list) {
    attachmentIndex += 1;
    const renders = await loadMediaRenders(item);

    if (!renders.length) {
      if (col !== 0) {
        y += rowMaxHeight + gap;
        col = 0;
        rowMaxHeight = 0;
      }
      y = drawMissingMediaNote(doc, `Attachment ${attachmentIndex}`, item, y);
      continue;
    }

    for (const loaded of renders) {
      const ratio = loaded.height / loaded.width;
      let drawW = cellWidth;
      let drawH = drawW * ratio;
      if (drawH > maxHeight) {
        drawH = maxHeight;
        drawW = drawH / ratio;
      }

      if (col === 0) {
        y = ensureSpace(doc, y, drawH + 8);
      } else if (y + drawH > doc.internal.pageSize.getHeight() - 12) {
        doc.addPage();
        y = 14;
        col = 0;
        rowMaxHeight = 0;
      }

      const x = marginX + col * (cellWidth + gap);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.rect(x, y, drawW, drawH);
      doc.addImage(loaded.dataUrl, 'JPEG', x, y, drawW, drawH, undefined, 'FAST');

      rowMaxHeight = Math.max(rowMaxHeight, drawH);
      col += 1;

      if (col >= columns) {
        y += rowMaxHeight + gap;
        col = 0;
        rowMaxHeight = 0;
      }
    }
  }

  if (col !== 0) {
    y += rowMaxHeight + gap;
  }

  return y + 1;
}

async function drawSingleAttachment(doc, label, media, y) {
  y = drawSubheading(doc, label, y);
  if (!media?.url) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Not uploaded', 12, y);
    return y + 5;
  }

  const renders = await loadMediaRenders(media);
  if (!renders.length) {
    return drawMissingMediaNote(doc, label, media, y);
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const maxW = pageWidth - 24;
  const maxH = 100;

  for (let i = 0; i < renders.length; i += 1) {
    const loaded = renders[i];
    if (renders.length > 1) {
      y = ensureSpace(doc, y, 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(pdfText(loaded.pageLabel || `Page ${i + 1}`), 12, y);
      y += 3;
    }

    const ratio = loaded.height / loaded.width;
    let drawW = maxW;
    let drawH = drawW * ratio;
    if (drawH > maxH) {
      drawH = maxH;
      drawW = drawH / ratio;
    }

    y = ensureSpace(doc, y, drawH + 6);
    doc.setDrawColor(226, 232, 240);
    doc.rect(12, y, drawW, drawH);
    doc.addImage(loaded.dataUrl, 'JPEG', 12, y, drawW, drawH, undefined, 'FAST');
    y += drawH + 4;
  }

  return y;
}

async function drawPhotoSection(doc, title, photos, y) {
  y = drawSubheading(doc, `${title} (${photos?.length || 0})`, y);
  if (!photos?.length) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('None', 12, y);
    return y + 5;
  }
  return drawImageGallery(doc, photos, y, { columns: 2, maxHeight: 55 });
}

async function drawDailyReportMedia(doc, dailyReports, startY) {
  let y = startY;
  const sorted = [...(dailyReports || [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  if (!sorted.length) {
    y = drawSubheading(doc, 'Daily Report Photos', y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('No daily entries', 12, y);
    return y + 5;
  }

  for (let i = 0; i < sorted.length; i += 1) {
    const entry = sorted[i];
    const photos = entry.photos || [];
    const videos = entry.videos || [];
    y = drawSubheading(
      doc,
      `Daily Entry ${i + 1} — ${formatDate(entry.createdAt)} (${photos.length} photo(s), ${videos.length} video(s))`,
      y
    );

    if (entry.comment || entry.issue) {
      y = ensureSpace(doc, y, 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(51, 65, 85);
      if (entry.comment) {
        const lines = doc.splitTextToSize(pdfText(`Comment: ${entry.comment}`), doc.internal.pageSize.getWidth() - 24);
        doc.text(lines, 12, y);
        y += lines.length * 3 + 1;
      }
      if (entry.issue) {
        const lines = doc.splitTextToSize(pdfText(`Issue: ${entry.issue}`), doc.internal.pageSize.getWidth() - 24);
        doc.text(lines, 12, y);
        y += lines.length * 3 + 1;
      }
    }

    if (photos.length) {
      y = await drawImageGallery(doc, photos, y, { columns: 2, maxHeight: 50 });
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text('No photos in this entry', 12, y);
      y += 5;
    }

    if (videos.length) {
      y = ensureSpace(doc, y, 6 + videos.length * 3.5);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(15, 118, 110);
      doc.text('Videos (open link):', 12, y);
      y += 3.5;
      videos.forEach((video, idx) => {
        y = ensureSpace(doc, y, 4);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(47, 111, 237);
        try {
          doc.textWithLink(`Video ${idx + 1}`, 14, y, { url: video.url });
        } catch {
          doc.text(pdfText(`Video ${idx + 1}: ${video.url}`), 14, y);
        }
        y += 3.5;
      });
      y += 1;
    }
  }

  return y;
}

async function renderStationSections(doc, project, station, startY) {
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

  y = drawSectionTitle(doc, '5. Documentation Summary', y);
  y = drawKeyValueTable(
    doc,
    [
      ['Checklist Uploaded', station.checklistFile ? 'Yes' : 'No'],
      ['Checklist Signed', station.checklistSignedFile ? 'Yes' : 'No'],
      ['CAD Drawing Installer', station.cadDrawingFile ? 'Yes' : 'No'],
      ['CAD File Notofire', String(station.cadDrawingFiles?.length || 0)],
      ['Work Photos', String(station.workPhotos?.length || 0)],
      ['Complete Photos', String(station.completePhotos?.length || 0)],
      ['Remaining Photos', String(station.remainingPhotos?.length || 0)],
      ['Daily Report Entries', String(dailyReports.length)],
      ['Daily Photos', String(dailyPhotos)],
      ['Daily Videos', String(dailyVideos)],
    ],
    y
  );

  y = drawSectionTitle(doc, '6. Attached Documents & Photos', y);
  y = await drawSingleAttachment(doc, 'Checklist Uploaded', station.checklistFile, y);
  y = await drawSingleAttachment(doc, 'Checklist Signed', station.checklistSignedFile, y);
  y = await drawSingleAttachment(doc, 'CAD Drawing Installer', station.cadDrawingFile, y);
  {
    const cadFiles = station.cadDrawingFiles || [];
    if (cadFiles.length === 0) {
      y = await drawSingleAttachment(doc, 'CAD File Notofire', null, y);
    } else {
      for (let i = 0; i < cadFiles.length; i += 1) {
        y = await drawSingleAttachment(doc, `CAD File Notofire ${i + 1}`, cadFiles[i], y);
      }
    }
  }
  y = await drawPhotoSection(doc, 'Photos of Work Done', station.workPhotos, y);
  y = await drawPhotoSection(doc, 'Complete Photos', station.completePhotos, y);
  y = await drawPhotoSection(doc, 'Remaining Photos', station.remainingPhotos, y);

  y = drawSectionTitle(doc, '7. Claim & Bonus', y);
  y = drawKeyValueTable(
    doc,
    [
      ['Installation Amount Allocated', pdfCurrency(station.installationAmount || 0)],
      ['Total Amount Requested', pdfCurrency(station.amountClaimed || 0)],
      ['Total After TDS (2%)', pdfCurrency(station.amountAfterTds || Math.round((Number(station.amountClaimed) || 0) * 0.98))],
      ['Total Amount Cleared', pdfCurrency(station.amountCleared || 0)],
      ['Latest Claim Date', formatDate(station.claimDate)],
      ['Claim Status', dash(station.claimStatus || 'Not Submitted')],
      ['Bonus Eligible', station.bonusEligible ? 'Yes' : 'No'],
      ['Bonus Percent', `${station.bonusPercent ?? 0}%`],
      ['Bonus Amount', pdfCurrency(station.bonusAmount || 0)],
    ],
    y
  );

  const claimRequests = Array.isArray(station.claimRequests) ? station.claimRequests : [];
  if (claimRequests.length > 0) {
    y = drawSubheading(doc, `Amount Requests (${claimRequests.length})`, y);
    autoTable(doc, {
      startY: y,
      head: [['#', 'Date', 'Requested', 'After TDS', 'Cleared', 'Note']],
      body: claimRequests.map((r, index) => [
        String(index + 1),
        formatDate(r.date),
        pdfCurrency(r.amountRequested || 0),
        pdfCurrency(r.amountAfterTds || Math.round((Number(r.amountRequested) || 0) * 0.98)),
        pdfCurrency(r.amountCleared || 0),
        dash(r.note || '—'),
      ]),
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
      margin: { left: 12, right: 12 },
    });
    y = doc.lastAutoTable.finalY + 3.5;
  } else if (station.amountClaimed > 0 || station.claimDate) {
    y = drawSubheading(doc, 'Amount Requests (1)', y);
    y = drawKeyValueTable(
      doc,
      [
        ['Date', formatDate(station.claimDate)],
        ['Requested', pdfCurrency(station.amountClaimed || 0)],
        ['After TDS', pdfCurrency(station.amountAfterTds || Math.round((Number(station.amountClaimed) || 0) * 0.98))],
        ['Cleared', pdfCurrency(station.amountCleared || 0)],
      ],
      y
    );
  }

  y = drawSectionTitle(doc, '8. Daily Photos & Videos Log', y);
  y = drawDailyReportsTable(doc, dailyReports, y);
  y = await drawDailyReportMedia(doc, dailyReports, y);

  y = drawSectionTitle(doc, '9. Remarks', y);
  y = drawKeyValueTable(doc, [['Remarks', dash(station.remarks || 'No remarks recorded.')]], y);

  return y;
}

async function buildStationPdf(project, stations, { title, subtitle }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  for (let index = 0; index < stations.length; index += 1) {
    const station = stations[index];
    if (index > 0) doc.addPage();
    let y = drawHeader(doc, title, subtitle);
    if (stations.length > 1) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 118, 110);
      doc.text(pdfText(`Station ${index + 1} of ${stations.length}: ${station.name || 'Untitled'}`), 12, y);
      y += 5;
    }
    await renderStationSections(doc, project, station, y);
  }

  addFooter(doc);
  return doc;
}

/** Download a structured PDF for one particular station (includes attached docs/photos). */
export async function downloadSingleStationReport(project, station) {
  if (!project || !station) return;

  const doc = await buildStationPdf(project, [station], {
    title: 'Station Installation Report',
    subtitle: `${project.projectName || 'Project'} | ${station.name || 'Station'}`,
  });

  const filename = `${safeFilePart(project.projectName, 'project')}_${safeFilePart(station.name, 'station')}_report.pdf`;
  doc.save(filename);
}

/** Download a structured PDF for all stations (or a filtered subset). */
export async function downloadStationWiseReport(project, stationIds = null) {
  const allStations = project?.stations || [];
  const stations =
    Array.isArray(stationIds) && stationIds.length > 0
      ? allStations.filter((s) => stationIds.map(String).includes(String(s._id)))
      : allStations;

  if (!stations.length) return;

  if (stations.length === 1) {
    await downloadSingleStationReport(project, stations[0]);
    return;
  }

  const doc = await buildStationPdf(project, stations, {
    title: 'Station-Wise Installation Report',
    subtitle: `${project.projectName || 'Project'} | ${stations.length} stations`,
  });

  doc.save(`${safeFilePart(project.projectName, 'project')}_station_wise_report.pdf`);
}
