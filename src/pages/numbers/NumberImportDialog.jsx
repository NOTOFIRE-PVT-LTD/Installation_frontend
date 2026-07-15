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

export default function NumberImportDialog({ open, category, onClose, onSubmit, submitting, result, error }) {
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
    formData.append('category', category);
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Import {category} Numbers from Excel</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            The file must have column headers <strong>Name</strong>, <strong>Number</strong>, and{' '}
            <strong>Region</strong> (.xlsx, .xls, or .csv). Rows with a number already in this category are skipped.
          </Typography>

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
