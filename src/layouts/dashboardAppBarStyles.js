export function getDashboardAppBarSx() {
  return {
    zIndex: (t) => t.zIndex.drawer + 1,
    width: '100%',
    left: 0,
    borderRadius: 0,
    boxShadow: '0 2px 10px rgba(26, 17, 7, 0.25)',
    border: 'none',
    borderBottom: '1px solid rgba(212, 167, 85, 0.35)',
    background: 'linear-gradient(90deg, #E5B85C 0%, #C99846 15%, #8C591D 45%, #543310 70%, #2A1705 100%)',
    color: '#FFFFFF',
  };
}

export function getDashboardDrawerPaperBase() {
  return {
    borderRadius: 0,
    border: 'none',
    borderRight: '1px solid rgba(212, 167, 85, 0.25)',
    background:
      'linear-gradient(180deg, #201204 0%, #341D08 25%, #563310 50%, #82521B 72%, #B57F2F 88%, #D4A34E 100%)',
    top: 52,
    height: 'calc(100% - 52px)',
  };
}