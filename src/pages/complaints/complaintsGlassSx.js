/** Complaint header actions — bubble glass (pairs with appGlass.css). */

export const glassIcon3dSx = { color: '#8B5A1A' };

const iconBgCard = {
  border: '1.5px solid transparent !important',
  backgroundImage:
    'linear-gradient(145deg, #FFFDF8 0%, #F8F0E2 40%, #EFE0C4 100%), linear-gradient(135deg, #FFE9A8 0%, #E5B85C 35%, #D4A34E 65%, #8C591D 100%) !important',
  backgroundOrigin: 'border-box !important',
  backgroundClip: 'padding-box, border-box !important',
  boxShadow:
    '5px 6px 12px rgba(120,85,40,0.16), inset 0 1px 1px rgba(255,252,245,0.65) !important',
};

export const glassIconBtnSx = {
  width: 46,
  height: 46,
  borderRadius: '14px',
  color: '#8B5A1A',
  ...iconBgCard,
};

export const glassBtnSx = {
  borderRadius: '16px',
  textTransform: 'none',
  fontWeight: 600,
  color: '#593714',
  px: 2.5,
  minHeight: 44,
};

export const glassPrimaryBtnSx = {
  borderRadius: '999px',
  textTransform: 'none',
  fontWeight: 700,
  color: '#241404',
  px: 2.5,
  minHeight: 44,
  background: 'linear-gradient(165deg, #ffe9a8 0%, #f0c86a 45%, #d4a34e 100%)',
  borderStyle: 'solid',
  borderWidth: '1.5px 1px 1px 1.5px',
  borderColor:
    'rgba(255,233,168,0.75) rgba(184,134,59,0.5) rgba(140,89,29,0.4) rgba(245,208,120,0.55)',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.85), inset 0 -1px 0 rgba(120,70,20,0.18), 0 6px 16px rgba(88,55,20,0.28)',
};
