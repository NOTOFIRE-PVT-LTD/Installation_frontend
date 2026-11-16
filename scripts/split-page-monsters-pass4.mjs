import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const src = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'pages');
const slice = (lines, from, to) => lines.slice(from - 1, to).join('\n');
const read = (rel) => fs.readFileSync(path.join(src, rel), 'utf8').split(/\r?\n/);
const write = (rel, c) => fs.writeFileSync(path.join(src, rel), `${c.trim()}\n`, 'utf8');

const projImports = slice(read('projects/ProjectDetailsTabSections.jsx'), 1, 60);

write(
  'projects/ProjectDetailsTabSectionsCore.jsx',
  `${projImports.replace('export default function ProjectDetailsTabSections', 'export default function ProjectDetailsTabSectionsCore')}
  return (
    <>
${slice(read('projects/ProjectDetailsTabSections.jsx'), 64, 236)}
    </>
  );
}`
);

write(
  'projects/ProjectDetailsTabSectionsLoa.jsx',
  `${slice(read('projects/ProjectDetailsTabSections.jsx'), 1, 23)}
export default function ProjectDetailsTabSectionsLoa(vm) {
  const {
    readOnly,
    loaItemsArray,
    additionalOfficersArray,
    loaFromTender,
    loaFieldsLocked,
    canManage,
    isAdmin,
    methods,
    tenderSelectOptions,
    selectedTenderId,
    applyTenderLoa,
    loadingTenders,
    checklistPdf,
    setChecklistPdf,
    commissioningVideos,
    setCommissioningVideos,
    installationInvoiceDoc,
    setInstallationInvoiceDoc,
    supplyInvoiceDoc,
    setSupplyInvoiceDoc,
    installationPoDoc,
    setInstallationPoDoc,
    onSubmit,
    submitting,
    isEdit,
  } = vm;
  return (
    <>
${slice(read('projects/ProjectDetailsTabSections.jsx'), 237, 494)}
    </>
  );
}`
);

write(
  'projects/ProjectDetailsTabSections.jsx',
  `import ProjectDetailsTabSectionsCore from './ProjectDetailsTabSectionsCore';
import ProjectDetailsTabSectionsLoa from './ProjectDetailsTabSectionsLoa';

export default function ProjectDetailsTabSections(vm) {
  return (
  <>
    <ProjectDetailsTabSectionsCore {...vm} />
    <ProjectDetailsTabSectionsLoa {...vm} />
  </>
  );
}`
);

// Station top split
const topLines = read('projects/StationDetailTopSection.jsx');
const topHead = slice(topLines, 1, 49);
write(
  'projects/StationDetailFormGridSection.jsx',
  `${topHead.replace('StationDetailTopSection', 'StationDetailFormGridSection')}
  return (
    <>
${slice(topLines, 52, 155)}
    </>
  );
}`
);
write(
  'projects/StationDetailMaterialsDocsSection.jsx',
  `${topHead.replace('StationDetailTopSection', 'StationDetailMaterialsDocsSection')}
  return (
    <>
${slice(topLines, 156, 252)}
    </>
  );
}`
);
write(
  'projects/StationDetailTopSection.jsx',
  `${slice(topLines, 1, 35)}
import StationDetailFormGridSection from './StationDetailFormGridSection';
import StationDetailMaterialsDocsSection from './StationDetailMaterialsDocsSection';

export default function StationDetailTopSection(props) {
  return (
    <>
      <StationDetailFormGridSection {...props} />
      <StationDetailMaterialsDocsSection {...props} />
    </>
  );
}`
);

const claimLines = read('projects/StationDetailClaimBonusSection.jsx');
write(
  'projects/StationDetailClaimSection.jsx',
  `${slice(claimLines, 1, 48)}
  return (
    <Grid item xs={12} md={6}>
${slice(claimLines, 52, 298)}
    </Grid>
  );
}`
);
write(
  'projects/StationDetailBonusRemarksSection.jsx',
  `${slice(claimLines, 1, 48)}
  return (
    <>
${slice(claimLines, 299, 323)}
    </>
  );
}`
);
write(
  'projects/StationDetailClaimBonusSection.jsx',
  `${slice(claimLines, 1, 11)}
import StationDetailClaimSection from './StationDetailClaimSection';
import StationDetailBonusRemarksSection from './StationDetailBonusRemarksSection';

export default function StationDetailClaimBonusSection(props) {
  return (
    <Grid container spacing={2.5}>
      <StationDetailClaimSection {...props} />
      <StationDetailBonusRemarksSection {...props} />
    </Grid>
  );
}`
);

console.log('pass4');