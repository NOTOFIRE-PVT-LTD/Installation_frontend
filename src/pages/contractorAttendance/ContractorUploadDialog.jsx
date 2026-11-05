import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function ContractorUploadDialog({ open, onClose, onUploadSuccess }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [monthYear, setMonthYear] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setSelectedFile(f);
      setError('');
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      setError('');
      onClose();
    }
  };

  const submit = async () => {
    if (!selectedFile) {
      setError('Please choose an Excel file to upload');
      return;
    }
    setUploading(true);
    setError('');
    try {
      await onUploadSuccess(selectedFile, monthYear);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: '#3A230B' }}>Upload Contractor Attendance Excel</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: '#5C4022' }}>
            Upload attendance (.xlsx, .xls, .csv). Worker details, contractor, present days, rate, and wages will be automatically extracted.
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <Box
            sx={{
              border: '2px dashed #C99846',
              borderRadius: '12px',
              p: 3,
              textAlign: 'center',
              bgcolor: selectedFile ? 'rgba(212, 163, 78, 0.08)' : '#FFFDF8',
              cursor: 'pointer',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" hidden accept=".xlsx,.xls,.csv" onChange={handleFile} />
            <CloudUploadIcon sx={{ fontSize: 44, color: '#8A5D18', mb: 1 }} />
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#3A230B' }}>
              {selectedFile ? selectedFile.name : 'Click to select or drag & drop Excel file'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#8A5D18' }}>
              Max size: 10 MB (.xlsx, .xls, .csv)
            </Typography>
          </Box>
          <TextField
            size="small"
            label="Month / Period (Optional)"
            placeholder="e.g. Nov 2026"
            value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={submit} disabled={!selectedFile || uploading}>
          {uploading ? <CircularProgress size={16} color="inherit" /> : 'Extract & Save Records'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

