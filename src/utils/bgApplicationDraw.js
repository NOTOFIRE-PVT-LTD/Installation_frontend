import { formatDate } from './formatters';
import { pdfText, dash, pdfCurrency, ensureSpace, safeFilePart } from './stationReportExport';
import { HDFC_LOGO_BASE64 } from '../assets/hdfcLogoBase64';
import {
  BG_TYPE_OPTIONS,
  DECLARATION_ITEMS,
  DECLARATION_ITEMS_AFTER_CLAIM,
  HEADER_BLUE,
  LABEL_COLOR,
  VALUE_COLOR,
  BOX_LINE,
  SECTION_BORDER,
  MARGIN,
  COL_GAP,
  SECTION_GAP,
} from './bgApplicationConstants';

export function cols(doc) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const fullWidth = pageWidth - MARGIN * 2;
  const width = (fullWidth - COL_GAP) / 2;
  return { left: MARGIN, right: MARGIN + width + COL_GAP, width, fullWidth };
}

export function versionFooter(doc) {
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont('times', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(160, 166, 174);
    doc.text('Version 2.0 06-Nov-23', pageWidth - MARGIN, pageHeight - 4, { align: 'right' });
  }
}

export function drawFormHeader(doc) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.addImage(HDFC_LOGO_BASE64, 'PNG', MARGIN, 7, 52, 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...VALUE_COLOR);
  doc.text('APPLICATION FOR BANK GUARANTEE', pageWidth / 2, 26, { align: 'center' });
  return 34;
}

export function drawBoxedSection(doc, number, title, y, contentFn, { bordered = true, gap = SECTION_GAP, contentOffset = 7.5, allowNewPage = true } = {}) {
  if (allowNewPage) y = ensureSpace(doc, y, 18);
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxLeft = MARGIN - 2;
  const boxWidth = pageWidth - (MARGIN - 2) * 2;
  const startY = y;
  const startPage = doc.internal.getNumberOfPages();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...HEADER_BLUE);
  doc.text(pdfText(number ? `${number}. ${title}` : title), boxLeft + 3, y + 4);

  const contentY = contentFn(y + contentOffset);
  const endPage = doc.internal.getNumberOfPages();

  if (bordered) {
    doc.setDrawColor(...SECTION_BORDER);
    doc.setLineWidth(0.25);
    if (endPage === startPage) {
      doc.rect(boxLeft, startY - 1.5, boxWidth, contentY - startY + 2.2);
    } else {
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setPage(startPage);
      doc.rect(boxLeft, startY - 1.5, boxWidth, pageHeight - 10 - (startY - 1.5));
      doc.setPage(endPage);
      doc.rect(boxLeft, 8, boxWidth, contentY - 8 + 2.2);
    }
  }

  return contentY + gap;
}

export function drawPage2BankDetailsBox(doc, number, title, y, nameAddress, ifscSwift, c) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxLeft = MARGIN - 2;
  const boxWidth = pageWidth - (MARGIN - 2) * 2;
  const startY = y;
  const gutter = 6;
  const nameW = c.fullWidth * 0.52;
  const ifscX = c.left + nameW + gutter;
  const ifscW = c.left + c.fullWidth - ifscX;
  const nameH = 14.8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...HEADER_BLUE);
  doc.text(pdfText(`${number}. ${title}`), boxLeft + 3, y + 4);

  const labelY = y + 7.2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(...LABEL_COLOR);
  doc.text('Name & Address', c.left, labelY);
  doc.text('IFSC / SWIFT code', ifscX, labelY);

  const boxY = labelY + 1.3;
  doc.setDrawColor(...BOX_LINE);
  doc.setLineWidth(0.2);
  doc.rect(c.left, boxY, nameW, nameH);
  doc.rect(ifscX, boxY, ifscW, 5.6);

  const nameLines = wrapFieldLines(doc, nameAddress, nameW);
  if (nameLines.length) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.4);
    doc.setTextColor(...VALUE_COLOR);
    doc.text(nameLines.slice(0, 4), c.left + 2, boxY + 3.4);
  }
  const ifscValue = pdfText(ifscSwift);
  if (ifscValue && ifscValue !== '-') {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...VALUE_COLOR);
    doc.text(ifscValue, ifscX + 2, boxY + 3.8, { maxWidth: ifscW - 4 });
  }

  const bottom = boxY + nameH + 2.2;
  doc.setDrawColor(...SECTION_BORDER);
  doc.setLineWidth(0.25);
  doc.rect(boxLeft, startY - 1.5, boxWidth, bottom - startY + 1.2);
  return bottom + 3.4;
}

export function drawMarginDetailsBox(doc, app, y, c) {
  // Stay on the current page — page 2 must not spill onto a third sheet.
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxLeft = MARGIN - 2;
  const boxWidth = pageWidth - (MARGIN - 2) * 2;
  const startY = y;
  const midX = MARGIN + c.fullWidth * 0.58;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...HEADER_BLUE);
  doc.text('9. Margin Details', boxLeft + 3, y + 4);
  doc.text('New FD', midX + 4, y + 4);

  const contentY = y + 8;
  const contentLeft = c.left + 8;
  const leftColW = midX - contentLeft - 4;
  const fdW = (leftColW - COL_GAP) / 2;
  const stay = { allowNewPage: false };
  let leftY = drawInlineBox(doc, contentLeft, contentY, fdW, 'FD No', app.marginFdNo, { labelWidth: 14, height: 5.5, ...stay });
  const amtY = drawInlineBox(
    doc,
    contentLeft + fdW + COL_GAP,
    contentY,
    fdW,
    'Amount',
    pdfCurrency(app.marginFdAmount),
    { labelWidth: 16, height: 5.5, ...stay }
  );
  leftY = Math.max(leftY, amtY);
  leftY = drawInlineBox(doc, contentLeft, leftY, fdW, 'Other', app.marginOther, { labelWidth: 14, height: 5.5, ...stay });

  const rightW = c.left + c.fullWidth - midX - 4;
  let rightY = drawInlineBox(doc, midX + 4, contentY, rightW, 'Debit A/C', app.marginNewFdDebitAccount, {
    labelWidth: 20,
    height: 5.5,
    ...stay,
  });
  rightY = drawInlineBox(doc, midX + 4, rightY, rightW, 'Amount', pdfCurrency(app.marginNewFdAmount), {
    labelWidth: 20,
    height: 5.5,
    ...stay,
  });

  const bottom = Math.max(leftY, rightY);
  doc.setDrawColor(...SECTION_BORDER);
  doc.setLineWidth(0.25);
  doc.rect(boxLeft, startY - 1.5, boxWidth, bottom - startY + 3);
  doc.line(midX, startY - 1.5, midX, bottom + 1.5);
  return bottom + 3.5;
}

export function drawParagraphs(doc, paragraphs, y, fontSize = 6.2, indent = MARGIN, { lineHeight = 2.6, paraGap = 1.3, allowNewPage = true, color = LABEL_COLOR, fontStyle = 'normal' } = {}) {
  const width = doc.internal.pageSize.getWidth() - indent - MARGIN;
  doc.setFont('helvetica', fontStyle);
  doc.setFontSize(fontSize);
  doc.setTextColor(...color);
  paragraphs.forEach((text) => {
    const lines = doc.splitTextToSize(text, width);
    const block = lines.length * lineHeight + paraGap;
    if (allowNewPage) y = ensureSpace(doc, y, block);
    doc.text(lines, indent, y);
    y += block;
  });
  return y;
}

export function measureDeclarationList(doc, clauses, fontSize, lineHeight, paraGap, { listLeft = 6 } = {}) {
  const textW = doc.internal.pageSize.getWidth() - MARGIN * 2 - listLeft;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);
  return clauses.reduce((sum, text, idx) => {
    const gap = idx === clauses.length - 1 ? 0 : paraGap;
    return sum + doc.splitTextToSize(text, textW).length * lineHeight + gap;
  }, 0);
}

export function drawDeclarationList(doc, clauses, y, { fontSize = 6.2, lineHeight = 2.7, paraGap = 2.6, listLeft = 6 } = {}) {
  const textX = MARGIN + listLeft;
  const textW = doc.internal.pageSize.getWidth() - MARGIN - textX;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);
  doc.setTextColor(...VALUE_COLOR);
  clauses.forEach((text, idx) => {
    const lines = doc.splitTextToSize(text, textW);
    doc.text(lines, textX, y);
    y += lines.length * lineHeight + (idx === clauses.length - 1 ? 0 : paraGap);
  });
  return y;
}

// A bordered box with its label ABOVE it — used for multi-line fields like Name & Address.
export function wrapFieldLines(doc, value, width, fontSize = 6.4) {
  const rawValue = pdfText(value);
  if (!rawValue || rawValue === '-') return [];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(rawValue, Math.max(12, width - 4));
}

export function stackedBoxHeight(doc, width, value, minHeight) {
  const lines = wrapFieldLines(doc, value, width);
  return Math.max(minHeight, 3.6 + Math.max(lines.length, 1) * 2.85);
}

export function drawStackedBox(doc, x, y, width, height, label, value, { maxHeight, allowNewPage = true, labelIndent = 0 } = {}) {
  const lines = wrapFieldLines(doc, value, width);
  let boxHeight = Math.max(height, 3.6 + Math.max(lines.length, 1) * 2.85);
  if (maxHeight) boxHeight = Math.min(boxHeight, maxHeight);
  if (allowNewPage) y = ensureSpace(doc, y, boxHeight + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(...LABEL_COLOR);
  doc.text(pdfText(label), x + labelIndent, y);
  const boxY = y + 1.2;
  doc.setDrawColor(...BOX_LINE);
  doc.setLineWidth(0.2);
  doc.rect(x, boxY, width, boxHeight);
  if (lines.length) {
    const maxLines = Math.max(1, Math.floor((boxHeight - 2) / 2.85));
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.4);
    doc.setTextColor(...VALUE_COLOR);
    doc.text(lines.slice(0, maxLines), x + 2, boxY + 3.4);
  }
  return boxY + boxHeight + 3;
}

// A bordered box with its label to the LEFT — used for short single-line fields.
export function drawInlineBox(doc, x, y, width, label, value, { labelWidth = 34, height = 5.2, allowNewPage = true } = {}) {
  if (allowNewPage) y = ensureSpace(doc, y, height + 3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(...LABEL_COLOR);
  const labelText = pdfText(label);
  if (doc.getTextWidth(labelText) <= labelWidth) {
    doc.text(labelText, x, y + height / 2 + 1.1);
  } else {
    const labelLines = doc.splitTextToSize(labelText, Math.max(8, labelWidth - 1));
    doc.text(labelLines, x, y + height / 2 + (labelLines.length > 1 ? -1 : 1.1));
  }
  const boxX = x + labelWidth;
  const boxWidth = width - labelWidth;
  doc.setDrawColor(...BOX_LINE);
  doc.setLineWidth(0.2);
  doc.rect(boxX, y, boxWidth, height);
  const rawValue = pdfText(value);
  if (rawValue && rawValue !== '-') {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...VALUE_COLOR);
    doc.text(rawValue, boxX + 2, y + height / 2 + 1.1, { maxWidth: boxWidth - 4 });
  }
  return y + height + 2.2;
}

export function drawSegmentedBoxes(doc, label, value, boxes, y, { x = MARGIN, boxSize = 4.6 } = {}) {
  y = ensureSpace(doc, y, 12);
  if (label) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(...LABEL_COLOR);
    doc.text(pdfText(label), x, y);
    y += 2.5;
  }

  const chars = String(value || '').split('');
  const gap = 0;
  let bx = x;

  doc.setDrawColor(...BOX_LINE);
  doc.setLineWidth(0.2);
  for (let i = 0; i < boxes; i += 1) {
    doc.rect(bx, y, boxSize, boxSize);
    const ch = chars[i] || '';
    if (ch) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...VALUE_COLOR);
      doc.text(pdfText(ch), bx + boxSize / 2, y + boxSize / 2 + 1.2, { align: 'center' });
    }
    bx += boxSize + gap;
  }
  return y + boxSize + 3;
}

// Renders a date value as D D M M Y Y Y Y single-character boxes.
export function drawDateBoxes(doc, label, isoValue, y, opts = {}) {
  const match = isoValue ? String(isoValue).match(/^(\d{4})-(\d{2})-(\d{2})/) : null;
  const digits = match ? `${match[3]}${match[2]}${match[1]}` : '';
  return drawSegmentedBoxes(doc, label, digits, 8, y, opts);
}

export function drawCheckboxGroup(doc, options, selected, y, { columns = null, x = MARGIN } = {}) {
  y = ensureSpace(doc, y, 10);
  const boxSize = 3.4;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxX = pageWidth - MARGIN;
  let bx = x;

  options.forEach((option, idx) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const label = pdfText(option);
    const labelWidth = doc.getTextWidth(label);
    const itemWidth = boxSize + 1.5 + labelWidth + 8;

    const forceBreak = columns ? idx % columns === 0 && idx !== 0 : bx + itemWidth > maxX;
    if (forceBreak) {
      bx = x;
      y += 6;
      y = ensureSpace(doc, y, 8);
    }

    const checked = option === selected;
    drawCheckbox(doc, bx, y, checked);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...VALUE_COLOR);
    doc.text(label, bx + boxSize + 1.5, y - 0.5);
    bx += itemWidth;
  });

  return y + 4;
}

export function drawCheckbox(doc, x, y, checked) {
  const boxSize = 3.4;
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.25);
  doc.rect(x, y - boxSize, boxSize, boxSize);
  if (checked) {
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.55);
    doc.line(x + 0.55, y - boxSize + 1.75, x + 1.35, y - 0.65);
    doc.line(x + 1.35, y - 0.65, x + boxSize - 0.45, y - boxSize + 0.55);
  }
  return boxSize;
}

export function drawNatureGrid(doc, selected, y, { x = MARGIN, width }) {
  // Official form: compact 3 columns (not stretched edge-to-edge), 2 rows.
  const colWidth = Math.min(width / 3, 56);
  const rowGap = 7.2;
  const columns = [
    ['Financial Guarantee', 'Advance Payment Guarantee'],
    ['Performance Guarantee', 'Others'],
    ['Deferred Payment Guarantee'],
  ];
  let maxY = y;
  columns.forEach((col, colIdx) => {
    let cy = y;
    const cx = x + colIdx * colWidth;
    col.forEach((option) => {
      drawCheckboxOption(doc, cx, cy, option, option === selected);
      cy += rowGap;
    });
    maxY = Math.max(maxY, cy);
  });
  return maxY;
}

export function drawBgTenor(doc, x, y, years, months) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(...LABEL_COLOR);
  doc.text('BG Tenor', x, y + 3.4);
  const boxesX = x + 22;
  const boxSize = 4.2;
  const rowY = y + boxSize;
  let bx = drawInlineSegmentedBoxes(
    doc,
    String(years ?? '').padStart(2, '0'),
    2,
    boxesX,
    rowY,
    { boxSize }
  );
  const monthsX = bx + 5;
  drawInlineSegmentedBoxes(doc, String(months ?? '').padStart(2, '0'), 2, monthsX, rowY, { boxSize });

  // Labels below boxes (no border) — Year / Months
  const labelY = rowY + 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...VALUE_COLOR);
  doc.text('Year', boxesX + boxSize, labelY, { align: 'center' });
  doc.text('Months', monthsX + boxSize, labelY, { align: 'center' });
  return labelY + 2.2;
}

// A single checkbox + label on one line (baseline-anchored at y). Returns the x position
// right after the label, so a caller can continue drawing on the same row (e.g. digit boxes).
export function drawCheckboxOption(doc, x, y, label, checked) {
  const boxSize = drawCheckbox(doc, x, y, checked);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...VALUE_COLOR);
  const text = pdfText(label);
  doc.text(text, x + boxSize + 1.5, y - 0.5);
  return x + boxSize + 1.5 + doc.getTextWidth(text);
}

// Digit boxes drawn inline on the same baseline as a preceding checkbox option (no own label).
export function drawInlineSegmentedBoxes(doc, value, boxes, x, y, { boxSize = 4.2, placeholders = [] } = {}) {
  const chars = String(value || '').split('');
  const gap = 0;
  const boxY = y - boxSize + 0.6;
  let bx = x;

  doc.setDrawColor(...BOX_LINE);
  doc.setLineWidth(0.2);
  for (let i = 0; i < boxes; i += 1) {
    doc.rect(bx, boxY, boxSize, boxSize);
    const ch = chars[i] || '';
    if (ch) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...VALUE_COLOR);
      doc.text(pdfText(ch), bx + boxSize / 2, boxY + boxSize / 2 + 1.2, { align: 'center' });
    } else if (placeholders[i]) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.2);
      doc.setTextColor(190, 196, 204);
      doc.text(placeholders[i], bx + boxSize / 2, boxY + boxSize / 2 + 1.1, { align: 'center' });
    }
    bx += boxSize + gap;
  }
  return bx;
}

export function drawLeftLabelBox(doc, x, y, width, label, value, { labelWidth = 28, height = 10, maxHeight, allowNewPage = true } = {}) {
  const boxWidth = width - labelWidth;
  const lines = wrapFieldLines(doc, value, boxWidth);
  let boxHeight = Math.max(height, 3.6 + Math.max(lines.length, 1) * 2.85);
  if (maxHeight) boxHeight = Math.min(boxHeight, maxHeight);
  if (allowNewPage) y = ensureSpace(doc, y, boxHeight + 3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(...LABEL_COLOR);
  doc.text(pdfText(label), x, y + 3.2);
  const boxX = x + labelWidth;
  doc.setDrawColor(...BOX_LINE);
  doc.setLineWidth(0.2);
  doc.rect(boxX, y, boxWidth, boxHeight);
  if (lines.length) {
    const maxLines = Math.max(1, Math.floor((boxHeight - 2) / 2.85));
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.4);
    doc.setTextColor(...VALUE_COLOR);
    doc.text(lines.slice(0, maxLines), boxX + 2, y + 3.4);
  }
  return y + boxHeight + 2.2;
}

export function drawEvenCheckboxRow(doc, options, selected, y, x, width) {
  // Official form Type of BG: left-aligned with even gaps (not full-width columns).
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  const boxSize = 3.4;
  const labelGap = 1.5;
  const itemGap = 18;
  const widths = options.map((option) => boxSize + labelGap + doc.getTextWidth(pdfText(option)));
  const total = widths.reduce((sum, w) => sum + w, 0) + itemGap * Math.max(options.length - 1, 0);
  const gap = total <= width ? itemGap : Math.max(6, (width - widths.reduce((sum, w) => sum + w, 0)) / Math.max(options.length - 1, 1));
  let bx = x;
  options.forEach((option, idx) => {
    drawCheckboxOption(doc, bx, y, option, option === selected);
    bx += widths[idx] + gap;
  });
  return y + 5;
}

// A label to the left spanning the full height of several stacked single-line boxes to its
// right — matches the original form's "Amount (Rs/FCY) in figures & in words" field.
export function drawSharedLabelBoxes(doc, x, width, label, values, y, { labelWidth = 46, heights = [5.5, 8], gap = 1.4, allowNewPage = true } = {}) {
  const boxHeights = values.map((_, i) => heights[i] ?? heights[heights.length - 1] ?? 5.5);
  const totalHeight = boxHeights.reduce((sum, h) => sum + h, 0) + gap * Math.max(values.length - 1, 0);
  if (allowNewPage) y = ensureSpace(doc, y, totalHeight + 3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(...LABEL_COLOR);
  const labelLines = Array.isArray(label) ? label : doc.splitTextToSize(pdfText(label), labelWidth - 2);
  const lineH = 2.7;
  const textStartY = y + totalHeight / 2 - ((labelLines.length - 1) * lineH) / 2 + 1;
  doc.text(labelLines, x, textStartY);

  const boxX = x + labelWidth;
  const boxWidth = width - labelWidth;
  doc.setDrawColor(...BOX_LINE);
  doc.setLineWidth(0.2);
  let by = y;
  values.forEach((val, idx) => {
    const h = boxHeights[idx];
    doc.rect(boxX, by, boxWidth, h);
    const rawValue = pdfText(val);
    if (rawValue && rawValue !== '-') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...VALUE_COLOR);
      if (idx === 0) {
        doc.text(rawValue, boxX + 2, by + h / 2 + 1.1, { maxWidth: boxWidth - 4 });
      } else {
        const lines = doc.splitTextToSize(rawValue, boxWidth - 4);
        doc.text(lines.slice(0, 2), boxX + 2, by + 3.2);
      }
    }
    by += h + gap;
  });

  return y + totalHeight + 2.2;
}

// A date's D D M M Y Y Y Y digit boxes drawn on the same row as its label (label to the
// left), matching the on-screen SegmentedDateField's `inline` mode.
export function drawInlineDateBoxes(doc, x, y, label, isoValue, { labelWidth = 30, boxSize = 4.2, allowNewPage = true } = {}) {
  if (allowNewPage) y = ensureSpace(doc, y, boxSize + 3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(...LABEL_COLOR);
  doc.text(pdfText(label), x, y + boxSize / 2 + 1.1);

  const match = isoValue ? String(isoValue).match(/^(\d{4})-(\d{2})-(\d{2})/) : null;
  const digits = match ? `${match[3]}${match[2]}${match[1]}` : '';
  drawInlineSegmentedBoxes(doc, digits, 8, x + labelWidth, y + boxSize, {
    boxSize,
    placeholders: ['D', 'D', 'M', 'M', 'Y', 'Y', 'Y', 'Y'],
  });

  return y + boxSize + 0.8;
}

export function drawLabeledConnectedBoxes(doc, x, y, label, value, boxes, { boxSize = 4.4 } = {}) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...LABEL_COLOR);
  doc.text(pdfText(label), x, y + boxSize / 2 + 1.3);
  const startX = x + doc.getTextWidth(pdfText(label)) + 3;
  drawInlineSegmentedBoxes(doc, value, boxes, startX, y + boxSize, { boxSize });
  return y + boxSize;
}
