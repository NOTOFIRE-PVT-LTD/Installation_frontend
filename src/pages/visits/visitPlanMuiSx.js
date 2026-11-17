export const visitPlanFieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#FFFDF8',
    borderRadius: '10px',
    '& fieldset': { borderColor: 'rgba(212, 163, 78, 0.4)' },
  },
};

export const visitPlanAdminFieldSx = {
  ...visitPlanFieldSx,
  '& .MuiOutlinedInput-root fieldset': { borderColor: 'rgba(212, 163, 78, 0.5)' },
};

export const visitPlanScopeToggleSx = {
  bgcolor: 'rgba(255, 233, 151, 0.22)',
  borderRadius: '10px',
  p: 0.5,
  border: '1px solid rgba(212, 163, 78, 0.4)',
  '& .MuiToggleButton-root': {
    border: 'none',
    borderRadius: '8px !important',
    px: 2,
    py: 0.75,
    fontWeight: 700,
    fontSize: '0.8125rem',
    color: '#583714',
    '&.Mui-selected': {
      background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)',
      color: '#3A230B',
      boxShadow: '0 2px 6px rgba(88, 55, 20, 0.15)',
    },
  },
};

export const visitPlanWeekDayToggleSx = {
  flexWrap: 'wrap',
  bgcolor: 'rgba(255, 233, 151, 0.18)',
  borderRadius: '8px',
  p: 0.25,
  border: '1px solid rgba(212, 163, 78, 0.35)',
  '& .MuiToggleButton-root': {
    border: 'none',
    borderRadius: '6px !important',
    py: 0.35,
    px: 1.25,
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#583714',
    '&.Mui-selected': {
      background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)',
      color: '#3A230B',
    },
  },
};

export const visitPlanSaveButtonSx = {
  px: 3.5,
  py: 1,
  fontWeight: 800,
  borderRadius: '10px',
  textTransform: 'none',
  background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)',
  color: '#3A230B',
  boxShadow: '0 4px 14px rgba(88, 55, 20, 0.2)',
  '&:hover': {
    background: 'linear-gradient(90deg, #FFF0B3 0%, #DEA954 60%, #B8853D 100%)',
    boxShadow: '0 6px 18px rgba(88, 55, 20, 0.25)',
  },
};