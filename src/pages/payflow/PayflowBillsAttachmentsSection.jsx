import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { FormTextField } from './PayflowRequestFields';
import { ACCEPTED_FILES, EMPTY_BILL } from './payflowRequestFormSchema';

const GRID_SX = { display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } };

export function BillsFieldSection({ control, billFields, onAppend, onRemove }) {
  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
        Bills <span style={{ color: '#d32f2f' }}>*</span>
      </Typography>
      <Stack spacing={1.5}>
        {billFields.map((bill, i) => (
          <Box key={bill.id} sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2, position: 'relative' }}>
            <Box sx={GRID_SX}>
              <FormTextField control={control} name={`bills.${i}.billNumber`} label="Bill Number" extra={{ required: true }} />
              <FormTextField control={control} name={`bills.${i}.billDate`} label="Bill Date" extra={{ type: 'date', required: true }} />
            </Box>
            {billFields.length > 1 && (
              <IconButton
                size="small"
                aria-label="Remove bill"
                onClick={() => onRemove(i)}
                sx={{ position: 'absolute', top: 4, right: 4, color: 'error.main' }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ))}
      </Stack>
      <Button startIcon={<AddIcon />} variant="outlined" color="inherit" sx={{ mt: 1.5, fontWeight: 600 }} onClick={() => onAppend({ ...EMPTY_BILL })}>
        Add Another Bill
      </Button>
    </Box>
  );
}

export function AttachmentsFieldSection({ files, fileInputRef, onAddFiles, onRemoveFile }) {
  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
        Attachments
      </Typography>
      {files.length > 0 && (
        <Stack spacing={0.5} sx={{ mb: 1.5 }}>
          {files.map((f, i) => (
            <Stack key={`${f.name}-${i}`} direction="row" alignItems="center" justifyContent="space-between" sx={{ bgcolor: 'action.hover', borderRadius: 1.5, pl: 1.5 }}>
              <Typography variant="body2" noWrap sx={{ maxWidth: '85%' }}>
                {f.name}
              </Typography>
              <IconButton size="small" aria-label="Remove attachment" onClick={() => onRemoveFile(i)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      )}
      <input ref={fileInputRef} type="file" hidden multiple accept={ACCEPTED_FILES} onChange={onAddFiles} />
      <Button startIcon={<AddIcon />} variant="outlined" color="inherit" sx={{ fontWeight: 600 }} onClick={() => fileInputRef.current?.click()}>
        Add Attachment
      </Button>
    </Box>
  );
}
