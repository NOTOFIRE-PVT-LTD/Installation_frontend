import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const utilsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'utils');
const lines = fs.readFileSync(path.join(utilsDir, 'stationReportExport.js'), 'utf8').split(/\r?\n/);
const slice = (from, to) => lines.slice(from - 1, to).join('\n');

fs.writeFileSync(path.join(utilsDir, 'stationReportPdfCore.js'), slice(1, 237));

fs.writeFileSync(
  path.join(utilsDir, 'stationReportMedia.js'),
  `import { drawSubheading, ensureSpace, pdfText } from './stationReportPdfCore';
import { formatDate } from './formatters';
import { getDocument } from 'pdfjs-dist';

${slice(239, 599)}
`
);

fs.writeFileSync(
  path.join(utilsDir, 'stationReportTables.js'),
  `import autoTable from 'jspdf-autotable';
import { formatDate } from './formatters';
import { dash, pdfText } from './stationReportPdfCore';

export ${slice(118, 127).replace(/^const /, 'const ')}

${slice(155, 219)
  .replace(/^function drawMaterialsTable/gm, 'export function drawMaterialsTable')
  .replace(/^function drawDailyReportsTable/gm, 'export function drawDailyReportsTable')}
`
);

fs.writeFileSync(
  path.join(utilsDir, 'stationReportRender.js'),
  `import autoTable from 'jspdf-autotable';
import { formatDate } from './formatters';
import { stationWorkDonePct } from './projectFlow';
import {
  dash,
  drawKeyValueTable,
  drawSectionTitle,
  drawSubheading,
  pdfCurrency,
  pdfText,
} from './stationReportPdfCore';
import { drawDailyReportMedia, drawPhotoSection, drawSingleAttachment } from './stationReportMedia';
import { drawDailyReportsTable, drawMaterialsTable, VALUE_STYLES } from './stationReportTables';

function contactLabel(contact) {
  if (!contact) return '-';
  const label = [contact.name, contact.number].filter(Boolean).join(' / ');
  return dash(label);
}

export async function renderStationSections(doc, project, station, startY) {
${slice(602, 753)}
}
`
);

fs.writeFileSync(
  path.join(utilsDir, 'stationReportBuild.js'),
  `import { jsPDF } from 'jspdf';
import { addFooter, drawHeader, pdfText, safeFilePart } from './stationReportPdfCore';
import { renderStationSections } from './stationReportRender';

${slice(756, 775)}

${slice(777, 811)}
`
);

fs.writeFileSync(
  path.join(utilsDir, 'stationReportExport.js'),
  `export {
  pdfText,
  dash,
  pdfCurrency,
  safeFilePart,
  ensureSpace,
  drawHeader,
  drawSectionTitle,
  drawSubheading,
  drawKeyValueTable,
  addFooter,
} from './stationReportPdfCore';
export { downloadSingleStationReport, downloadStationWiseReport } from './stationReportBuild';
`
);

console.log('station-only split complete');