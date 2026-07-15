import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import DivisionFormDialog from './DivisionFormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchDivisions, createDivision, updateDivision, deleteDivision } from '../../features/divisions/divisionsThunks';
import { showSnackbar } from '../../features/ui/uiSlice';

export default function ManageDivisionsDialog({ open, onClose, onChanged }) {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.divisions);

  const [formState, setFormState] = useState({ open: false, mode: 'create', division: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) dispatch(fetchDivisions({ pageSize: 100 }));
  }, [open, dispatch]);

  const refresh = () => {
    dispatch(fetchDivisions({ pageSize: 100 }));
    onChanged?.();
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (formState.mode === 'create') {
        await dispatch(createDivision(values)).unwrap();
        dispatch(showSnackbar({ message: 'Division created successfully' }));
      } else {
        await dispatch(updateDivision({ id: formState.division._id, payload: values })).unwrap();
        dispatch(showSnackbar({ message: 'Division updated successfully' }));
      }
      setFormState({ open: false, mode: 'create', division: null });
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Something went wrong', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteDivision(confirmDelete._id)).unwrap();
      dispatch(showSnackbar({ message: 'Division deleted' }));
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete division', severity: 'error' }));
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Divisions</DialogTitle>
        <DialogContent>
          <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
            <Button startIcon={<AddIcon />} onClick={() => setFormState({ open: true, mode: 'create', division: null })}>
              Add Division
            </Button>
          </Stack>
          <List dense>
            {items.length === 0 && (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                No divisions yet
              </Typography>
            )}
            {items.map((division) => (
              <ListItem
                key={division._id}
                secondaryAction={
                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" onClick={() => setFormState({ open: true, mode: 'edit', division })}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setConfirmDelete(division)}>
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemText primary={division.name} secondary={`Zone: ${division.zone}`} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <DivisionFormDialog
        open={formState.open}
        mode={formState.mode}
        division={formState.division}
        submitting={submitting}
        onClose={() => setFormState({ open: false, mode: 'create', division: null })}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Division"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? All tenders and files inside it will be permanently deleted too.`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}
