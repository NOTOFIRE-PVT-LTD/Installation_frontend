import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ImageIcon from '@mui/icons-material/ImageOutlined';

const catalogName = (value) => value?.name || '';

function formatPrice(value) {
  if (value === null || value === undefined || value === '') return '-';
  return `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatQuantity(item) {
  const unit = catalogName(item.qtyType);
  return [item.quantity ?? 0, unit].filter((part) => part !== '').join(' ');
}

function DetailRow({ label, value, emphasis }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={1.5}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          fontSize: emphasis ? '0.8125rem' : '0.75rem',
          fontWeight: emphasis ? 700 : 600,
          textAlign: 'right',
          wordBreak: 'break-word',
          color: emphasis ? 'primary.main' : 'text.primary',
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

export default function MasterItemCard({ item, onView, onEdit, onDelete }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const actions = [
    { label: 'View', onClick: onView },
    { label: 'Edit', onClick: onEdit },
    { label: 'Delete', onClick: onDelete, danger: true },
  ];

  // Quantity, Price and Total Amount always show; the rest only when the item has them.
  const rows = [
    { label: 'Quantity', value: formatQuantity(item) },
    { label: 'Price', value: formatPrice(item.price) },
    { label: 'Total Amount', value: formatPrice(item.totalAmount), emphasis: true },
    { label: 'Payment', value: catalogName(item.payment) },
    { label: 'End Use', value: item.endUse || '' },
    { label: 'Person Asked', value: item.personAsked || '' },
    { label: 'Price Guarantee', value: item.priceGuarantee || '' },
  ].filter((row) => row.value !== '');

  return (
    <Card
      variant="outlined"
      onClick={onView}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        cursor: 'pointer',
        transition: 'box-shadow 150ms ease, transform 150ms ease',
        '&:hover': { boxShadow: '0 12px 28px rgba(31, 42, 68, 0.12)', transform: 'translateY(-2px)' },
      }}
    >
      <Stack spacing={1} sx={{ p: 2, pb: 1.5 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Stack sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.3, wordBreak: 'break-word' }}>
              {item.itemName || '-'}
            </Typography>
            {catalogName(item.itemCategory) && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.6875rem' }}
              >
                {catalogName(item.itemCategory)}
              </Typography>
            )}
          </Stack>
          <IconButton
            size="small"
            aria-label="More actions"
            onClick={(event) => {
              event.stopPropagation();
              setAnchorEl(event.currentTarget);
            }}
            sx={{ color: 'text.secondary', mt: -0.5, mr: -0.5 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Box
          sx={{
            width: '100%',
            aspectRatio: '4 / 3',
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.disabled',
          }}
        >
          {item.image?.url ? (
            <Box
              component="img"
              src={item.image.url}
              alt={item.itemName}
              loading="lazy"
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <ImageIcon />
          )}
        </Box>

        {item.itemDescription && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: '0.75rem',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.itemDescription}
          </Typography>
        )}
      </Stack>

      <Divider />

      <Stack spacing={0.75} sx={{ p: 2, pt: 1.5 }}>
        {rows.map((row) => (
          <DetailRow key={row.label} label={row.label} value={row.value} emphasis={row.emphasis} />
        ))}
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        onClick={(event) => event.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '10px',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 12px 28px rgba(31, 42, 68, 0.1)',
              minWidth: 150,
            },
          },
        }}
      >
        {actions.map((action) => (
          <MenuItem
            key={action.label}
            dense
            onClick={() => {
              setAnchorEl(null);
              action.onClick?.(item);
            }}
            sx={{ fontSize: '0.75rem', py: 0.85, color: action.danger ? 'error.main' : 'text.primary' }}
          >
            <ListItemText primary={action.label} primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 500 }} />
          </MenuItem>
        ))}
      </Menu>
    </Card>
  );
}
