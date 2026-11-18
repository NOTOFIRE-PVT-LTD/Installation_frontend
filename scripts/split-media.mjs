import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const utilsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'utils');
const sourcePath = path.join(utilsDir, 'stationReportExport.source.js');
if (!fs.existsSync(sourcePath)) {
  fs.copyFileSync(path.join(utilsDir, 'stationReportExport.js'), sourcePath);
}
const lines = fs.readFileSync(sourcePath, 'utf8').split(/\r?\n/);
const slice = (from, to) => lines.slice(from - 1, to).join('\n');

const loadChunk = slice(239, 366);
const drawChunk = slice(367, 599);

fs.writeFileSync(
  path.join(utilsDir, 'stationReportMediaLoad.js'),
  `import { ensureSpace, pdfText } from './stationReportPdfCore';
import { formatDate } from './formatters';
import { getDocument } from 'pdfjs-dist';

${loadChunk}
`
);

fs.writeFileSync(
  path.join(utilsDir, 'stationReportMediaDraw.js'),
  `import { drawSubheading, ensureSpace, pdfText } from './stationReportPdfCore';
import { formatDate } from './formatters';
import { loadMediaRenders } from './stationReportMediaLoad';

${drawChunk}
`
);

fs.writeFileSync(
  path.join(utilsDir, 'stationReportMedia.js'),
  `export { loadMediaRenders } from './stationReportMediaLoad';
export {
  drawMissingMediaNote,
  drawImageGallery,
  drawSingleAttachment,
  drawPhotoSection,
  drawDailyReportMedia,
} from './stationReportMediaDraw';
`
);

console.log('media split ok', {
  load: loadChunk.split('\n').length,
  draw: drawChunk.split('\n').length,
});