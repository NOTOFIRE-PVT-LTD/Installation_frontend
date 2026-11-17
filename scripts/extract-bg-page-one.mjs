import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const utilsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'utils');
const lines = fs.readFileSync(path.join(utilsDir, 'bgApplicationExport.source.js'), 'utf8').split(/\r?\n/);
const body = lines.slice(595, 820).join('\n');

const content = `import { formatDate } from './formatters';
import { pdfText } from './stationReportExport';
import { BG_TYPE_OPTIONS, MARGIN, LABEL_COLOR, VALUE_COLOR, BOX_LINE } from './bgApplicationConstants';
import {
  cols,
  drawFormHeader,
  drawBoxedSection,
  drawLabeledConnectedBoxes,
  drawCheckboxOption,
  drawInlineSegmentedBoxes,
  drawStackedBox,
  drawInlineBox,
  drawNatureGrid,
  drawEvenCheckboxRow,
  drawLeftLabelBox,
  drawSharedLabelBoxes,
  drawInlineDateBoxes,
  drawBgTenor,
} from './bgApplicationDraw';

export function renderBgApplicationPageOne(doc, app) {
  const c = cols(doc);
  let y = drawFormHeader(doc);
${body}
}
`;

fs.writeFileSync(path.join(utilsDir, 'bgApplicationPdfPageOne.js'), content);
console.log('wrote page one', content.split('\n').length, 'lines');