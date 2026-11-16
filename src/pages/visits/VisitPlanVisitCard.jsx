import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import VisitPlanVisitCardHeader from './VisitPlanVisitCardHeader';
import VisitPlanVisitCardFields from './VisitPlanVisitCardFields';

export default function VisitPlanVisitCard({
  item,
  index,
  scope,
  visitsCount,
  customers,
  pageLayout,
  onUpdate,
  onRemove,
  onOpenCustomerModal,
}) {
  const contentPad = pageLayout ? { p: 2.5, '&:last-child': { pb: 2.5 } } : { p: 2, '&:last-child': { pb: 2 } };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: '1.5px solid #D4A34E',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 14px rgba(56, 32, 10, 0.05)',
        overflow: 'visible',
      }}
    >
      <CardContent sx={contentPad}>
        <VisitPlanVisitCardHeader
          index={index}
          item={item}
          scope={scope}
          visitsCount={visitsCount}
          pageLayout={pageLayout}
          onRemove={onRemove}
        />
        <VisitPlanVisitCardFields
          item={item}
          scope={scope}
          customers={customers}
          pageLayout={pageLayout}
          onUpdate={onUpdate}
          onOpenCustomerModal={onOpenCustomerModal}
        />
      </CardContent>
    </Card>
  );
}