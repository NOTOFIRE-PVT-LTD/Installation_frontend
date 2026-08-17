import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { formatDate } from '../../utils/formatters';
import { downloadProductionCsv, downloadProductionPdf } from './bomExport';

function Field({ label, value }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value || '-'}
      </Typography>
    </Stack>
  );
}

export default function ProductionDetailDialog({ open, production, loading, onClose }) {
  const lines = production?.lines || [];
  const bomLabel = production
    ? `${production.bomName || production.bom?.name || '-'}${
        production.bomVersion || production.bom?.version
          ? ` v${production.bomVersion || production.bom?.version}`
          : ''
      }`
    : '-';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Production Details
        <IconButton onClick={onClose} aria-label="Close" sx={{ position: 'absolute', right: 12, top: 12 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress size={28} />
          </Box>
        )}

        {!loading && production && (
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Field label="BOM" value={bomLabel} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Field label="Production Qty" value={production.productionQty} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Field label="Person" value={production.person} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Field label="Date" value={formatDate(production.productionDate)} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Field label="Reference" value={production.referenceNo} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Field label="Remarks" value={production.remarks} />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Consumed Items ({lines.length})
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Qty / 1 PCS</TableCell>
                      <TableCell align="right">Required</TableCell>
                      <TableCell align="right">Available Then</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lines.map((line, index) => (
                      <TableRow key={`${String(line.stockItem)}-${index}`}>
                        <TableCell>{line.itemName || '-'}</TableCell>
                        <TableCell align="right">{line.qtyPerPcs}</TableCell>
                        <TableCell align="right">
                          {line.requiredQty} {line.unit}
                        </TableCell>
                        <TableCell align="right">{line.availableQty}</TableCell>
                      </TableRow>
                    ))}
                    {lines.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                            No consumed items recorded.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Stack>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button
          startIcon={<DownloadIcon />}
          onClick={() => downloadProductionCsv(production)}
          disabled={loading || !production}
        >
          Download CSV
        </Button>
        <Button
          startIcon={<PictureAsPdfIcon />}
          onClick={() => downloadProductionPdf(production)}
          disabled={loading || !production}
        >
          Download PDF
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
