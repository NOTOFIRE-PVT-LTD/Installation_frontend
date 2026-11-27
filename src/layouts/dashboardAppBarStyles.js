/** Light brown→gold wash: 4 stops, bottom near 0 opacity. Buttons keep their own color. */
const SHELL_HEADER_GRADIENT =
  'linear-gradient(180deg, rgba(229, 184, 92, 0.48) 0%, rgba(201, 152, 70, 0.26) 34%, rgba(125, 81, 30, 0.1) 68%, rgba(86, 51, 16, 0.03) 100%)';
const SHELL_SIDEBAR_GRADIENT =
  'linear-gradient(180deg, rgba(86, 51, 16, 0.4) 0%, rgba(125, 81, 30, 0.2) 34%, rgba(181, 127, 47, 0.08) 68%, rgba(212, 163, 78, 0.03) 100%)';

export function getDashboardAppBarSx() {
  return {
    zIndex: (t) => t.zIndex.drawer + 1,
    width: '100%',
    left: 0,
    borderRadius: 0,
    boxShadow: '0 1px 6px rgba(26, 17, 7, 0.08)',
    border: 'none',
    borderBottom: '1px solid rgba(212, 167, 85, 0.28)',
    background: SHELL_HEADER_GRADIENT,
    color: '#241404',
  };
}

export function getDashboardDrawerPaperBase() {
  return {
    borderRadius: 0,
    border: 'none',
    borderRight: '1px solid rgba(212, 167, 85, 0.22)',
    background: SHELL_SIDEBAR_GRADIENT,
    top: 52,
    height: 'calc(100% - 52px)',
  };
}