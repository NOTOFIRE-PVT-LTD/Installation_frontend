import { useRef, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import UploadFileIcon from '@mui/icons-material/UploadFileOutlined';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import { downloadBomComponentsImportTemplate } from '../../utils/bomComponentsImport';

export default function BomComponentsImportDialog({ open, onClose, onSubmit, submitting, result, error }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);

  const handleClose = () => {
    setFile(null);
    onClose();
  };

  const handleSubmit = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Import BOM Components</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Download the Excel template and fill these columns:
          </Typography>
          <Typography
            component="pre"
            variant="body2"
            sx={{
              m: 0,
              p: 1.25,
              borderRadius: 1.5,
              bgcolor: 'action.hover',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '0.75rem',
              overflowX: 'auto',
            }}
          >
            {`Components                 | Part No. | Qty Req. for 1 pcs.
Fire Alarm Control Panel | FACP-001 | 1
Smoke Detector           | SD-100   | 4`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Match stock by <strong>Part No.</strong> (SKU) and/or <strong>Components</strong> name. Items must
            already exist under Stock Items. <strong>Qty Req. for 1 pcs.</strong> is required. Upload .xlsx,
            .xls, or .csv.
          </Typography>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => {
              downloadBomComponentsImportTemplate().catch(() => {});
            }}
          >
            Download Excel Template
          </Button>

          {error && <Alert severity="error">{error}</Alert>}
          {result && (
            <Alert severity={result.inserted ? 'success' : 'warning'}>
              Matched {result.inserted} of {result.total} rows
              {result.skipped ? ` (${result.skipped} failed)` : ''}.
              {result.failed?.length > 0 && (
                <Typography component="div" variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {result.failed
                    .slice(0, 5)
                    .map((f) => `Row ${f.row}: ${f.message}`)
                    .join(' · ')}
                  {result.failed.length > 5 ? ` · +${result.failed.length - 5} more` : ''}
                </Typography>
              )}
            </Alert>
          )}

          <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => inputRef.current?.click()}>
            {file ? file.name : 'Choose File'}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            hidden
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!file || submitting}>
          {submitting ? 'Importing…' : 'Import'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
