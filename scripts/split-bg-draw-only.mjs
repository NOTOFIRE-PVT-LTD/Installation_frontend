import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const utilsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'utils');
const bgLines = fs.readFileSync(path.join(utilsDir, 'bgApplicationExport.source.js'), 'utf8').split(/\r?\n/);
const bgSlice = (from, to) => bgLines.slice(from - 1, to).join('\n');

fs.writeFileSync(path.join(utilsDir, 'bgApplicationConstants.js'), `${bgSlice(1, 31)}\n`);

fs.writeFileSync(
  path.join(utilsDir, 'bgApplicationDraw.js'),
  `import { formatDate } from './formatters';
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

${bgSlice(33, 587)}
`
);

const exportNames = [
  'cols',
  'versionFooter',
  'drawFormHeader',
  'drawBoxedSection',
  'drawPage2BankDetailsBox',
  'drawMarginDetailsBox',
  'drawParagraphs',
  'measureDeclarationList',
  'drawDeclarationList',
  'wrapFieldLines',
  'stackedBoxHeight',
  'drawStackedBox',
  'drawInlineBox',
  'drawSegmentedBoxes',
  'drawDateBoxes',
  'drawCheckboxGroup',
  'drawCheckbox',
  'drawNatureGrid',
  'drawBgTenor',
  'drawCheckboxOption',
  'drawInlineSegmentedBoxes',
  'drawLeftLabelBox',
  'drawEvenCheckboxRow',
  'drawSharedLabelBoxes',
  'drawInlineDateBoxes',
  'drawLabeledConnectedBoxes',
];

let drawContent = fs.readFileSync(path.join(utilsDir, 'bgApplicationDraw.js'), 'utf8');
exportNames.forEach((name) => {
  drawContent = drawContent.replace(new RegExp(`^function ${name}\\(`, 'm'), `export function ${name}(`);
});
fs.writeFileSync(path.join(utilsDir, 'bgApplicationDraw.js'), drawContent);

let constContent = fs.readFileSync(path.join(utilsDir, 'bgApplicationConstants.js'), 'utf8');
constContent = constContent
  .replace(/^const BG_TYPE_OPTIONS/gm, 'export const BG_TYPE_OPTIONS')
  .replace(/^const MARGIN/gm, 'export const MARGIN')
  .replace(/^const COL_GAP/gm, 'export const COL_GAP')
  .replace(/^const SECTION_GAP/gm, 'export const SECTION_GAP')
  .replace(/^const HEADER_BLUE/gm, 'export const HEADER_BLUE')
  .replace(/^const LABEL_COLOR/gm, 'export const LABEL_COLOR')
  .replace(/^const VALUE_COLOR/gm, 'export const VALUE_COLOR')
  .replace(/^const BOX_LINE/gm, 'export const BOX_LINE')
  .replace(/^const SECTION_BORDER/gm, 'export const SECTION_BORDER')
  .replace(/^const DECLARATION_ITEMS = \[/m, 'export const DECLARATION_ITEMS = [')
  .replace(/^const DECLARATION_ITEMS_AFTER_CLAIM = \[/m, 'export const DECLARATION_ITEMS_AFTER_CLAIM = [');
fs.writeFileSync(path.join(utilsDir, 'bgApplicationConstants.js'), constContent);

fs.writeFileSync(path.join(utilsDir, 'bgApplicationExport.js'), `export { downloadBgApplicationPdf } from './bgApplicationPdf';\n`);

console.log('bg draw split complete');