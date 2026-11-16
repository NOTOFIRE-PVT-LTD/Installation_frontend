import fs from 'fs';
import path from 'path';

const utilsDir = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..', 'src', 'utils');
const src = fs.readFileSync(path.join(utilsDir, 'stationReportExport.js'), 'utf8').split(/\r?\n/);
const slice = (from, to) => src.slice(from - 1, to).join('\n');

fs.writeFileSync(
  path.join(utilsDir, 'stationReportPdfCore.js'),
  `${slice(1, 8)}\n\n${slice(10, 237)}\n`
);

fs.writeFileSync(
  path.join(utilsDir, 'stationReportMedia.js'),
  `import { ensureSpace, pdfText } from './stationReportPdfCore';
import { formatDate } from './formatters';
import { getDocument } from 'pdfjs-dist';
import { drawSubheading } from './stationReportPdfCore';

${slice(239, 512)}

export { drawImageGallery, loadMediaRenders, drawMissingMediaNote, drawSingleAttachment, drawPhotoSection, drawDailyReportMedia };
`
);

// drawSubheading is in pdfCore - drawSingleAttachment uses drawSubheading - export drawSingleAttachment from media

fs.writeFileSync(
  path.join(utilsDir, 'stationReportTables.js'),
  `import autoTable from 'jspdf-autotable';
import { formatDate } from './formatters';
import { dash, pdfText } from './stationReportPdfCore';

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

${slice(155, 219)}
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
  pdfCurrency,
  pdfText,
} from './stationReportPdfCore';
import { VALUE_STYLES, drawMaterialsTable, drawDailyReportsTable } from './stationReportTables';
import {
  drawDailyReportMedia,
  drawPhotoSection,
  drawSingleAttachment,
  drawSubheading,
} from './stationReportMedia';
import { drawSubheading as drawSubheadingCore } from './stationReportPdfCore';

function contactLabel(contact) {
  if (!contact) return '-';
  const label = [contact.name, contact.number].filter(Boolean).join(' / ');
  return dash(label);
}

${slice(601, 754)}

export { renderStationSections };
`
);