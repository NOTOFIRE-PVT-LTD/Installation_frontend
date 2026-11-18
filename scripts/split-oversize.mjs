import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const utilsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'utils');
const drawLines = fs.readFileSync(path.join(utilsDir, 'bgApplicationDraw.js'), 'utf8').split(/\r?\n/);
const drawHeader = drawLines.slice(0, 18).join('\n');
const partA = drawLines.slice(18, 268).join('\n');
const partB = drawLines.slice(268).join('\n');
const exportFn = (content) => content.replace(/^export function /gm, 'function ').replace(/^function ([a-zA-Z0-9_]+)\(/gm, 'export function $1(');

fs.writeFileSync(path.join(utilsDir, 'bgApplicationDrawLayout.js'), `${drawHeader}\n${exportFn(partA)}\n`);
fs.writeFileSync(path.join(utilsDir, 'bgApplicationDrawFields.js'), `${drawHeader}\n${exportFn(partB)}\n`);

fs.writeFileSync(
  path.join(utilsDir, 'bgApplicationDraw.js'),
  `export {
  cols,
  versionFooter,
  drawFormHeader,
  drawBoxedSection,
  drawPage2BankDetailsBox,
  drawMarginDetailsBox,
} from './bgApplicationDrawLayout';
export {
  drawParagraphs,
  measureDeclarationList,
  drawDeclarationList,
  wrapFieldLines,
  stackedBoxHeight,
  drawStackedBox,
  drawInlineBox,
  drawSegmentedBoxes,
  drawDateBoxes,
  drawCheckboxGroup,
  drawCheckbox,
  drawNatureGrid,
  drawBgTenor,
  drawCheckboxOption,
  drawInlineSegmentedBoxes,
  drawLeftLabelBox,
  drawEvenCheckboxRow,
  drawSharedLabelBoxes,
  drawInlineDateBoxes,
  drawLabeledConnectedBoxes,
} from './bgApplicationDrawFields';
`
);

console.log('bg draw oversize split complete');