import { jsPDF } from 'jspdf';
import { formatDate } from './formatters';
import { pdfText, dash, pdfCurrency, ensureSpace, safeFilePart } from './stationReportExport';
import { HDFC_LOGO_BASE64 } from '../assets/hdfcLogoBase64';

const APPLICATION_TYPES = ['Fresh Issuance', 'Amendment'];
const BG_NATURES = ['Financial Guarantee', 'Performance Guarantee', 'Deferred Payment Guarantee', 'Advance Payment Guarantee', 'Others'];
const BG_TYPE_OPTIONS = ['Physical BG', 'FCY BG', 'e-BG', 'GEM BG'];

const MARGIN = 10;
const COL_GAP = 5;
const HEADER_BLUE = [30, 58, 138];
const LABEL_COLOR = [51, 65, 85];
const VALUE_COLOR = [15, 23, 42];
const BOX_LINE = [148, 163, 184];

const DECLARATION_ITEMS = [
  'i) I/We hereby authorise HDFC Bank Ltd to mark lien on Deposit accounts which are /will be kept as margin money against the Bank Guarantee.',
  'ii) I/We hereby agree and confirm that the above Bank Guarantee is subject to the terms and conditions as contained herein and in the sanction letter for the bank Guarantee entered into between the applicant and The Bank.',
  'iii) I /We, am/are fully aware that in the event of invocation of Bank Guarantee (BG) by beneficiary, HDFC Bank Ltd is entitled to make the payment immediately to the beneficiary by debiting my/our operative account (CC/OD/CA), notwithstanding any dispute that I/we might have with the beneficiary.',
  'iv) I/We hereby agree that margin money would be released by the Bank only on receipt of the Original Bank Guarantee along with discharge letter/ no claim letter from the Beneficiary.',
];
const DECLARATION_ITEMS_AFTER_CLAIM = [
  'vi) In case said BG is issued with Continuing clause, we authorize the bank to keep guarantee active for a further period of six months from earlier expiry date on every subsequent expiry date till the time original guarantee (including all amendments) along with beneficiary discharge letter is submitted to the bank for cancellation.',
  'vii) In case of the said BG being issued on an auto renewal basis, I/We hereby authorize the Bank to debit My/Our account(s) with the Bank towards commission for renewal of the said BG.',
  'viii) In case said BG is having governing law as URDG 758, we understand the implications related to the same and authorising bank to issue the bank guarantee with governing rule as URDG 758. We also confirm that the underlying text of the BG has beneficiary consent.',
  'ix) In case said BG is issued in Foreign Currency with Foreign Jurisdiction Clause whether in bank guarantee or counter bank guarantee, we will indemnify bank against all cost/ charges/ damages/ expenses which bank may incur in contesting any legal proceeding before foreign court.',
  'x) I am/ We are aware that Bank is required to provide 1-year additional claim period over the expiry date or the claim period as mentioned in the Bank Guarantee, whichever is later as per law. Accordingly, Bank is liable to make payment to Beneficiary if the claim is made within the above additional claim period. Hence, I/we authorize the Bank to block/continue the limit and hold margin/security provided by us during the additional claim period',
  'xi) I/We further confirm that all the documents/fixed deposit/margin submitted/furnished by us for issuance of the Bank Guarantee in favor of the Bank will continue to be in force and effect and shall be binding on me/us till I/we submit the Original Bank Guarantee and discharge letter from the Beneficiary to the Bank for cancellation.',
  'xii) I/We acknowledge and agree that the Bank shall be entitled to recover the commission for the additional claim period by debiting my/our account.',
];

function cols(doc) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const fullWidth = pageWidth - MARGIN * 2;
  const width = (fullWidth - COL_GAP) / 2;
  return { left: MARGIN, right: MARGIN + width + COL_GAP, width, fullWidth };
}

function versionFooter(doc) {
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...LABEL_COLOR);
    doc.text('Version 2.0 06-Nov-23', pageWidth - MARGIN, pageHeight - 4, { align: 'right' });
  }
}

function drawFormHeader(doc) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.addImage(HDFC_LOGO_BASE64, 'PNG', MARGIN, 6, 24, 4.8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(...VALUE_COLOR);
  doc.text('APPLICATION FOR BANK GUARANTEE', pageWidth / 2, 18, { align: 'center' });
  return 24;
}

function drawBoxedSection(doc, number, title, y, contentFn, { bordered = true } = {}) {
  // Reserve a modest buffer so a section header isn't orphaned alone at the bottom of a
  // page; if a section still ends up spilling onto a later page, the border-closing logic
  // below handles that correctly rather than needing a large up-front safety margin.
  y = ensureSpace(doc, y, 18);
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxLeft = MARGIN - 2;
  const boxWidth = pageWidth - (MARGIN - 2) * 2;
  const startY = y;
  const startPage = doc.internal.getNumberOfPages();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...HEADER_BLUE);
  doc.text(pdfText(number ? `${number}. ${title}` : title), boxLeft + 2, y + 3);

  const contentY = contentFn(y + 6.5);
  const endPage = doc.internal.getNumberOfPages();

  if (bordered) {
    doc.setDrawColor(...VALUE_COLOR);
    doc.setLineWidth(0.3);
    if (endPage === startPage) {
      doc.rect(boxLeft, startY - 2, boxWidth, contentY - startY + 1.5);
    } else {
      // Content spilled onto a later page — close the box on each page it touches rather
      // than drawing a single rect with coordinates that span pages (which jsPDF can't do).
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setPage(startPage);
      doc.rect(boxLeft, startY - 2, boxWidth, pageHeight - 10 - (startY - 2));
      doc.setPage(endPage);
      doc.rect(boxLeft, 8, boxWidth, contentY - 8 + 1.5);
    }
  }

  return contentY + 2.5;
}

function drawParagraphs(doc, paragraphs, y, fontSize = 6.2, indent = MARGIN) {
  const width = doc.internal.pageSize.getWidth() - indent - MARGIN;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);
  doc.setTextColor(...LABEL_COLOR);
  paragraphs.forEach((text) => {
    const lines = doc.splitTextToSize(text, width);
    y = ensureSpace(doc, y, lines.length * 2.6 + 1.3);
    doc.text(lines, indent, y);
    y += lines.length * 2.6 + 1.3;
  });
  return y;
}

// A bordered box with its label ABOVE it — used for multi-line fields like Name & Address.
function drawStackedBox(doc, x, y, width, height, label, value) {
  y = ensureSpace(doc, y, height + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(...LABEL_COLOR);
  doc.text(pdfText(label), x, y);
  const boxY = y + 1;
  doc.setDrawColor(...BOX_LINE);
  doc.setLineWidth(0.2);
  doc.rect(x, boxY, width, height);
  const rawValue = pdfText(value);
  if (rawValue && rawValue !== '-') {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...VALUE_COLOR);
    const lines = doc.splitTextToSize(rawValue, width - 4).slice(0, Math.floor((height - 2.5) / 2.9));
    doc.text(lines, x + 2, boxY + 3.5);
  }
  return boxY + height + 3;
}

// A bordered box with its label to the LEFT — used for short single-line fields.
function drawInlineBox(doc, x, y, width, label, value, { labelWidth = 34, height = 5.2 } = {}) {
  y = ensureSpace(doc, y, height + 3);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(...LABEL_COLOR);
  const labelLines = doc.splitTextToSize(pdfText(label), labelWidth - 2);
  doc.text(labelLines, x, y + height / 2 + (labelLines.length > 1 ? -1 : 1.1));
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

function drawSegmentedBoxes(doc, label, value, boxes, y, { x = MARGIN, boxSize = 4.6 } = {}) {
  y = ensureSpace(doc, y, 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(...LABEL_COLOR);
  doc.text(pdfText(label), x, y);
  y += 2.5;

  const chars = String(value || '').split('');
  const gap = 0.5;
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
function drawDateBoxes(doc, label, isoValue, y, opts = {}) {
  const match = isoValue ? String(isoValue).match(/^(\d{4})-(\d{2})-(\d{2})/) : null;
  const digits = match ? `${match[3]}${match[2]}${match[1]}` : '';
  return drawSegmentedBoxes(doc, label, digits, 8, y, opts);
}

function drawCheckboxGroup(doc, options, selected, y, { columns = null, x = MARGIN } = {}) {
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
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.25);
    doc.rect(bx, y - boxSize, boxSize, boxSize);
    if (checked) {
      doc.setLineWidth(0.45);
      doc.line(bx + 0.4, y - boxSize + 0.4, bx + boxSize - 0.4, y - 0.4);
      doc.line(bx + boxSize - 0.4, y - boxSize + 0.4, bx + 0.4, y - 0.4);
    }
    doc.setTextColor(...VALUE_COLOR);
    doc.text(label, bx + boxSize + 1.5, y - 0.5);
    bx += itemWidth;
  });

  return y + 4;
}

function drawCheckbox(doc, x, y, checked) {
  const boxSize = 3.4;
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.25);
  doc.rect(x, y - boxSize, boxSize, boxSize);
  if (checked) {
    doc.setLineWidth(0.45);
    doc.line(x + 0.4, y - boxSize + 0.4, x + boxSize - 0.4, y - 0.4);
    doc.line(x + boxSize - 0.4, y - boxSize + 0.4, x + 0.4, y - 0.4);
  }
  return boxSize;
}

export function downloadBgApplicationPdf(app) {
  if (!app) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const c = cols(doc);
  let y = drawFormHeader(doc);

  y = drawSegmentedBoxes(doc, 'Account number', app.accountNumber, 15, y);
  y += 2;
  {
    const rightY = drawInlineBox(doc, c.right, y + 2.5, c.width, 'Branch Name', app.branchName, { labelWidth: 24 });
    const leftY = drawSegmentedBoxes(doc, 'Branch Code', app.branchCode, 6, y, { boxSize: 4.2 });
    y = Math.max(leftY, rightY);
  }

  y = drawBoxedSection(doc, 1, 'Type of Application', y, (cy) => {
    cy = drawCheckboxGroup(doc, APPLICATION_TYPES, app.typeOfApplication, cy + 2.5);
    return drawSegmentedBoxes(doc, 'Amendment (Existing Guarantee Number)', app.amendmentExistingGuaranteeNumber, 15, cy + 1.5);
  });

  y = drawBoxedSection(doc, 2, 'Applicant Details', y, (cy) => {
    const leftY = drawStackedBox(doc, c.left, cy, c.width, 9, 'Name & Address', app.applicantNameAddress);
    const rightY = drawStackedBox(doc, c.right, cy, c.width, 9, 'Contact Person Name & Mobile No.', app.applicantContactPersonMobile);
    cy = Math.max(leftY, rightY);

    const thirdWidth = (c.fullWidth - COL_GAP * 2) / 3;
    const x2 = c.left + thirdWidth + COL_GAP;
    const x3 = x2 + thirdWidth + COL_GAP;
    const r1a = drawInlineBox(doc, c.left, cy, thirdWidth, 'PAN No', app.applicantPan, { labelWidth: 15 });
    const r1b = drawDateBoxes(doc, 'Date of Incorporation', app.applicantDateOfIncorporation, cy, { x: x2, boxSize: 3.6 });
    const r1c = drawInlineBox(doc, x3, cy, thirdWidth, 'LEI Code', app.applicantLeiCode, { labelWidth: 16 });
    cy = Math.max(r1a, r1b, r1c);

    const leftY2 = drawInlineBox(doc, c.left, cy, c.width, 'Email ID', app.applicantEmail, { labelWidth: 18 });
    const rightY2 = drawStackedBox(doc, c.right, cy, c.width, 7.5, 'Registered Address', app.applicantRegisteredAddress);
    return Math.max(leftY2, rightY2);
  });

  y = drawBoxedSection(doc, 3, 'Nature of Bank Guarantee', y, (cy) =>
    drawCheckboxGroup(doc, BG_NATURES, app.natureOfBankGuarantee, cy + 2.5, { columns: 3 })
  );

  y = drawBoxedSection(doc, 4, 'Type of BG', y, (cy) => drawCheckboxGroup(doc, BG_TYPE_OPTIONS, app.typeOfBG, cy + 2.5));

  y = drawBoxedSection(doc, 5, 'Details of Bank Guarantee', y, (cy) => {
    cy = drawStackedBox(doc, c.left, cy, c.fullWidth, 6.5, 'Purpose', app.purpose);
    cy = drawInlineBox(doc, c.left, cy, c.fullWidth, 'Amount (Rs/FCY) in figures', app.bgAmountFigures, { labelWidth: 46 });
    cy = drawInlineBox(doc, c.left, cy, c.fullWidth, 'Amount (Rs/FCY) in words', app.bgAmountWords, { labelWidth: 46 });

    const leftY = drawDateBoxes(doc, 'Expiry Date', app.expiryDate, cy, { x: c.left });
    const tenorLabelY = cy;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(...LABEL_COLOR);
    doc.text('BG Tenor', c.right, tenorLabelY);
    const halfWidth = (c.width - COL_GAP) / 2;
    const t1 = drawInlineBox(doc, c.right, tenorLabelY + 1.5, halfWidth, 'Months', `${app.bgTenorMonths || 0}`, { labelWidth: 18 });
    const t2 = drawInlineBox(doc, c.right + halfWidth + COL_GAP, tenorLabelY + 1.5, halfWidth, 'Days', `${app.bgTenorDays || 0}`, { labelWidth: 14 });
    cy = Math.max(leftY, t1, t2);

    return drawDateBoxes(doc, 'Claim Expiry Date', app.claimExpiryDate, cy, { x: c.left });
  });

  y = drawBoxedSection(doc, 6, 'Beneficiary Details', y, (cy) => {
    const leftY = drawStackedBox(doc, c.left, cy, c.width, 9, 'Name & Address', app.beneficiaryNameAddress);
    const rightY = drawStackedBox(doc, c.right, cy, c.width, 9, 'Contact Person Name & Mobile No', app.beneficiaryContactPersonMobile);
    cy = Math.max(leftY, rightY);

    const leftY2 = drawInlineBox(doc, c.left, cy, c.width, 'EMail ID', app.beneficiaryEmail, { labelWidth: 18 });
    const rightY2 = drawInlineBox(doc, c.right, cy, c.width, 'GST Number', app.beneficiaryGstNumber, { labelWidth: 22 });
    cy = Math.max(leftY2, rightY2);

    const thirdWidth = (c.fullWidth - COL_GAP * 2) / 3;
    const x2 = c.left + thirdWidth + COL_GAP;
    const x3 = x2 + thirdWidth + COL_GAP;
    const r1a = drawInlineBox(doc, c.left, cy, thirdWidth, 'PAN No', app.beneficiaryPan, { labelWidth: 15 });
    const r1b = drawDateBoxes(doc, 'Date of Incorporation', app.beneficiaryDateOfIncorporation, cy, { x: x2, boxSize: 3.6 });
    const r1c = drawInlineBox(doc, x3, cy, thirdWidth, 'LEI Code', app.beneficiaryLeiCode, { labelWidth: 16 });
    cy = Math.max(r1a, r1b, r1c);

    return drawParagraphs(doc, ['*If e-BG with NeSL, please provide UIN allotted to Beneficiary by NeSL'], cy, 5.6);
  });

  y = drawBoxedSection(doc, 7, 'Beneficiary Bank Details for SFMS', y, (cy) => {
    const leftY = drawStackedBox(doc, c.left, cy, c.width, 7.5, 'Name & Address', app.beneficiaryBankNameAddress);
    const rightY = drawInlineBox(doc, c.right, cy, c.width, 'IFSC / SWIFT code', app.beneficiaryBankIfscSwift, { labelWidth: 30 });
    return Math.max(leftY, rightY);
  });

  y = drawBoxedSection(doc, 8, 'Advising Bank Details (if Advising Bank is other than Beneficiary Bank)', y, (cy) => {
    const leftY = drawStackedBox(doc, c.left, cy, c.width, 7.5, 'Name & Address', app.advisingBankNameAddress);
    const rightY = drawInlineBox(doc, c.right, cy, c.width, 'IFSC / SWIFT code', app.advisingBankIfscSwift, { labelWidth: 30 });
    return Math.max(leftY, rightY);
  });

  y = drawBoxedSection(doc, 9, 'Margin Details', y, (cy) => {
    const halfWidth = (c.width - COL_GAP) / 2;
    let leftY = drawInlineBox(doc, c.left, cy, halfWidth, 'FD No', app.marginFdNo, { labelWidth: 15 });
    const amountY = drawInlineBox(doc, c.left + halfWidth + COL_GAP, cy, halfWidth, 'Amount', pdfCurrency(app.marginFdAmount), { labelWidth: 17 });
    leftY = Math.max(leftY, amountY);
    leftY = drawInlineBox(doc, c.left, leftY, c.width, 'Other', app.marginOther, { labelWidth: 15 });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(...LABEL_COLOR);
    doc.text('New FD', c.right, cy);
    let rightY = drawInlineBox(doc, c.right, cy + 1.5, c.width, 'Debit A/C', app.marginNewFdDebitAccount, { labelWidth: 18 });
    rightY = drawInlineBox(doc, c.right, rightY, c.width, 'Amount', pdfCurrency(app.marginNewFdAmount), { labelWidth: 17 });

    return Math.max(leftY, rightY);
  });

  y = drawBoxedSection(
    doc,
    10,
    'Instruction on Bank Charges',
    y,
    (cy) =>
      drawParagraphs(
        doc,
        [
          '"I/We agree to pay all applicable taxes, duties (including stamp duty), cesses, fees and charges for issuance of this Guarantee and consent that necessary deductions in this regard may be made from my/our account number"',
        ],
        cy,
        6
      ),
    { bordered: false }
  );

  y = drawBoxedSection(
    doc,
    11,
    'General Declaration',
    y,
    (cy) => {
      cy = drawParagraphs(doc, DECLARATION_ITEMS, cy, 6);
      cy = drawParagraphs(
        doc,
        [
          'v) We hereby authorize you to debit our account number to make the payment immediately in case of receipt of any claim from the beneficiary. You are also authorised to debit our account with the interest towards delayed payment claimed by the beneficiary.',
        ],
        cy,
        6
      );
      const leftY = drawInlineBox(doc, c.left, cy, c.width, 'Debit Account Number (for claims)', app.claimDebitAccountNumber, { labelWidth: 46 });
      const rightY = drawInlineBox(doc, c.right, cy, c.width, 'Delayed Payment Interest %', `${app.delayedPaymentInterestPercent || 0}%`, { labelWidth: 46 });
      cy = Math.max(leftY, rightY);
      cy = drawParagraphs(doc, DECLARATION_ITEMS_AFTER_CLAIM, cy, 6);
      cy = drawDateBoxes(doc, 'Date', app.declarationDate, cy + 1.5, { x: c.left });
      cy = ensureSpace(doc, cy + 1.5, 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.2);
      doc.setTextColor(...LABEL_COLOR);
      doc.text('Authorized Signatory', c.left, cy);
      doc.text('(Stamp to be affixed by firm/ Company)', c.left, cy + 3);
      return cy + 4;
    },
    { bordered: false }
  );

  y = drawBoxedSection(
    doc,
    null,
    'Details of documents enclosed: (please tick all that are relevant)',
    y,
    (cy) => {
      cy += 2.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...VALUE_COLOR);

      let boxSize = drawCheckbox(doc, c.left, cy, Boolean(app.documentsContractAgreementCopy));
      doc.text('Contract/Agreement copy', c.left + boxSize + 1.5, cy - 0.5);
      boxSize = drawCheckbox(doc, c.right, cy, Boolean(app.documentsCounterGuarantee));
      doc.text('Counter Guarantee', c.right + boxSize + 1.5, cy - 0.5);
      cy += 5;

      boxSize = drawCheckbox(doc, c.left, cy, Boolean(app.documentsBankGuaranteeText));
      doc.text('Bank Guarantee Text', c.left + boxSize + 1.5, cy - 0.5);
      cy += 5;

      boxSize = drawCheckbox(doc, c.left, cy, Boolean(app.documentsOther));
      doc.text(`Other documents if any, please specify ${dash(app.otherDocumentsSpecify)}`, c.left + boxSize + 1.5, cy - 0.5);
      cy += 2.5;
      return cy;
    },
    { bordered: false }
  );

  y = drawParagraphs(doc, ['*Please note that in case of e-BG, the stamp duty will be procured through NeSL'], y, 5.6);

  versionFooter(doc);
  doc.save(`${safeFilePart(app.applicantNameAddress, 'bg-application')}_bank_guarantee.pdf`);
}
