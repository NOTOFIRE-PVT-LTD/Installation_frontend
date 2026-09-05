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
import { downloadStockItemsTemplate } from '../../utils/stockItemsImport';

export default function StockItemImportDialog({ open, onClose, onSubmit, submitting, result, error }) {
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
      <DialogTitle>Import Stock Items from Excel</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Download the Excel template and fill these columns only:
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
            {`Component Name | Sub Component Name | Type
Cable          | 6mm wire           | Single Use
Bracket        |                    | Reusable`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Sub Component Name</strong> is optional. <strong>Type</strong> must be{' '}
            <em>Single Use</em> or <em>Reusable</em>. Upload .xlsx, .xls, or .csv.
          </Typography>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => {
              downloadStockItemsTemplate().catch(() => {});
            }}
          >
            Download Excel Template
          </Button>

          {error && <Alert severity="error">{error}</Alert>}
          {result && (
            <Alert severity="success">
              Imported {result.inserted} of {result.total} rows ({result.skipped} skipped as duplicates).
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
