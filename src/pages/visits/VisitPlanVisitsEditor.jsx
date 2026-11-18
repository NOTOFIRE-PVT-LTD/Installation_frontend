import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import VisitPlanVisitCard from './VisitPlanVisitCard';

const addButtonSx = (pageLayout) => ({
  mt: pageLayout ? 2.5 : 2,
  py: 1.25,
  border: '1.5px dashed #D4A34E',
  bgcolor: 'rgba(255, 233, 151, 0.22)',
  color: '#452A0E',
  fontWeight: 700,
  borderRadius: '12px',
  textTransform: 'none',
  fontSize: '0.875rem',
  '&:hover': { bgcolor: 'rgba(255, 233, 151, 0.4)', borderColor: '#A37836', transform: 'translateY(-1px)' },
});

export default function VisitPlanVisitsEditor({
  scrollable,
  pageLayout,
  visits,
  scope,
  customers,
  onAdd,
  onUpdate,
  onRemove,
  onOpenCustomerModal,
}) {
  const list = (
    <Stack spacing={pageLayout ? 2.5 : 2}>
      {visits.map((item, index) => (
        <VisitPlanVisitCard
          key={item.id}
          item={item}
          index={index}
          scope={scope}
          visitsCount={visits.length}
          customers={customers}
          pageLayout={pageLayout}
          onUpdate={(field, value) => onUpdate(index, field, value)}
          onRemove={() => onRemove(index)}
          onOpenCustomerModal={() => onOpenCustomerModal(index)}
        />
      ))}
    </Stack>
  );

  const addBtn = (
    <Button fullWidth variant="outlined" startIcon={<AddIcon />} onClick={onAdd} sx={addButtonSx(pageLayout)}>
      {`+ Add Another Visit (Visit ${visits.length + 1})`}
    </Button>
  );

  if (scrollable) {
    return (
      <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
        {list}
        {addBtn}
      </Box>
    );
  }

  return (
    <>
      {list}
      {addBtn}
    </>
  );
}