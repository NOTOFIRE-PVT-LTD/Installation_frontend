import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import { createTheme } from '@mui/material/styles';

// Luxury Valuecon Dual Theme: Brown & Yellow Complementary Pairing
// Rule: On yellow bg -> brown text; On brown bg -> yellow text
export const BRAND = {
  // Deep Browns
  brownDeep: '#201204',
  brownDark: '#38200A',
  brownMid: '#563310',
  brownLight: '#7D511E',
  brownMuted: '#6E4D27',

  // Radiant Yellows & Golds
  yellowPale: '#FFFDF8',
  yellowLight: '#FAE2B4',
  yellowMain: '#D4A34E',
  yellowRich: '#C99846',
  yellowVibrant: '#E5B85C',

  // Cards: Very lightest shades of both color gradient
  cardLightYellow: '#FFFDF8',
  cardMidYellow: '#FDF7EB',
  cardLightBrown: '#F7EFE1',
  cardEndBrown: '#F2E7D5',
  cardBorder: '#E2D3BE',
  cardGradient: 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%)',
  cardHoverGradient: 'linear-gradient(135deg, #FFFFFF 0%, #FEF9EE 45%, #F9F1E5 80%, #F4EAD9 100%)',

  // Shell Gradients:
  // 1. Sidebar: Top to bottom (top brown, down yellow)
  sidebarGradient: 'linear-gradient(180deg, #201204 0%, #341D08 25%, #563310 50%, #82521B 72%, #B57F2F 88%, #D4A34E 100%)',

  // 2. Header / AppBar: First (left) yellow, then in right brown
  headerGradient: 'linear-gradient(90deg, #E5B85C 0%, #C99846 15%, #8C591D 45%, #543310 70%, #2A1705 100%)',

  // 3. Active Nav Pill on Sidebar: First (left) yellow, then in right brown
  activePillGradient: 'linear-gradient(90deg, #FAE2B4 0%, #E5B85C 25%, #C99846 60%, #7D511E 85%, #38200A 100%)',
  activePillHover: 'linear-gradient(90deg, #FFF0CB 0%, #F2C76D 25%, #DDA84E 60%, #8F5E24 85%, #46290E 100%)',

  // 4. Contained Primary Button (Yellow gradient with brown text)
  btnGradient: 'linear-gradient(135deg, #E5B85C 0%, #D4A34E 50%, #B8863B 100%)',
  btnGradientHover: 'linear-gradient(135deg, #F2C76D 0%, #DFB059 50%, #C79544 100%)',

  // Text Rules:
  textOnYellow: '#241404', // Deep brown text on yellow background
  textOnBrown: '#FAE2B4',  // Warm yellow text on brown background
  textPrimary: '#241404',  // Primary text for cards & forms
  textSecondary: '#6E4D27',// Secondary warm brown text

  // Line & Shadows
  line: '#E2D3BE',
  shadow: 'rgba(36, 20, 4, 0.18)',
  ring: 'rgba(212, 163, 78, 0.25)',

  // Page background: warm soft wash
  ink: '#F6F0E4',
  panel: '#FDF7EB',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: BRAND.yellowMain,
      light: BRAND.yellowLight,
      dark: BRAND.brownDark,
      contrastText: BRAND.textOnYellow, // Deep brown text on yellow
      gradient: BRAND.btnGradient,
      gradientHover: BRAND.btnGradientHover,
      headerGradient: BRAND.headerGradient,
      sidebarGradient: BRAND.sidebarGradient,
      activePillGradient: BRAND.activePillGradient,
      cardGradient: BRAND.cardGradient,
    },
    secondary: {
      main: '#20b486',
    },
    success: {
      main: '#23b26d',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#b91c1c',
    },
    info: {
      main: BRAND.brownLight,
      light: BRAND.yellowLight,
      dark: BRAND.brownDeep,
      contrastText: BRAND.textOnBrown,
    },
    background: {
      default: BRAND.ink,
      paper: '#FAF5ED',
    },
    text: {
      primary: BRAND.textPrimary,
      secondary: BRAND.textSecondary,
    },
    divider: BRAND.line,
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: ['"DM Sans"', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
    fontSize: 13,
    htmlFontSize: 14,
    h1: { fontWeight: 700, fontSize: '1.75rem', lineHeight: 1.25, color: BRAND.textPrimary },
    h2: { fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.25, color: BRAND.textPrimary },
    h3: { fontWeight: 700, fontSize: '1.25rem', lineHeight: 1.3, color: BRAND.textPrimary },
    h4: { fontWeight: 700, fontSize: '1.125rem', lineHeight: 1.3, color: BRAND.textPrimary },
    h5: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.35, color: BRAND.textPrimary },
    h6: { fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.35, color: BRAND.textPrimary },
    subtitle1: { fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.4, color: BRAND.textPrimary },
    subtitle2: { fontWeight: 600, fontSize: '0.75rem', lineHeight: 1.4, color: BRAND.textSecondary },
    body1: { fontSize: '0.8125rem', lineHeight: 1.45, color: BRAND.textPrimary },
    body2: { fontSize: '0.75rem', lineHeight: 1.45, color: BRAND.textSecondary },
    caption: { fontSize: '0.6875rem', lineHeight: 1.4, color: BRAND.textSecondary },
    button: { fontSize: '0.75rem', fontWeight: 700, textTransform: 'none' },
    overline: { fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.06em', color: BRAND.textSecondary },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          colorScheme: 'light',
        },
        body: {
          background: BRAND.ink,
          color: BRAND.textPrimary,
          overflowX: 'hidden',
          accentColor: BRAND.yellowMain,
          scrollbarColor: `${BRAND.yellowMain} ${BRAND.cardMidYellow}`,
        },
        '*::-webkit-scrollbar': {
          width: 8,
          height: 8,
        },
        '*::-webkit-scrollbar-track': {
          background: BRAND.cardMidYellow,
          borderRadius: 999,
        },
        '*::-webkit-scrollbar-thumb': {
          borderRadius: 999,
          background: BRAND.btnGradient,
        },
        '*::-webkit-scrollbar-thumb:hover': {
          background: BRAND.btnGradientHover,
        },
        'input[type="date"], input[type="month"], input[type="time"]': {
          accentColor: BRAND.yellowMain,
          colorScheme: 'light',
        },
        'input[type="date"]::-webkit-calendar-picker-indicator, input[type="month"]::-webkit-calendar-picker-indicator': {
          filter: 'sepia(0.85) saturate(2.2) hue-rotate(5deg) brightness(0.85)',
          cursor: 'pointer',
          opacity: 0.85,
        },
        '#root': {
          minHeight: '100vh',
          overflowX: 'hidden',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true, size: 'small' },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 999,
          paddingInline: 16,
          fontSize: '0.75rem',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.25s ease, transform 0.15s ease',
          '&:active': {
            transform: 'scale(0.97)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 999,
            background: 'rgba(255, 233, 151, 0.24)',
            transform: 'translateY(50%) scale(0)',
            transformOrigin: 'center bottom',
            transition: 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.35s ease',
            pointerEvents: 'none',
            opacity: 0,
            zIndex: 0,
          },
          '&:hover::before': {
            transform: 'translateY(0) scaleX(1.4) scaleY(2.2)',
            opacity: 1,
          },
          '& > *': {
            position: 'relative',
            zIndex: 1,
          },
        },
        containedPrimary: {
          background: BRAND.btnGradient,
          color: `${BRAND.textOnYellow} !important`, // Deep brown text on yellow button
          boxShadow: `0 4px 14px ${BRAND.shadow}`,
          '&:hover': {
            background: BRAND.btnGradientHover,
            color: '#140A01 !important',
            boxShadow: `0 6px 18px ${BRAND.shadow}`,
          },
          '&.Mui-disabled': {
            background: '#E2D7C8',
            color: '#9C8F7E !important',
            boxShadow: 'none',
          },
        },
        outlinedPrimary: {
          borderColor: BRAND.brownLight,
          color: BRAND.brownDark,
          '&:hover': {
            borderColor: BRAND.brownDeep,
            backgroundColor: BRAND.cardMidYellow,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          background: BRAND.btnGradient,
          color: BRAND.textOnYellow,
          '&:hover': { background: BRAND.btnGradientHover },
        },
      },
    },
    // CARDS: The very lightest shade of both color gradient with deep brown text
    MuiPaper: {
      styleOverrides: {
        root: {
          background: BRAND.cardGradient,
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(36, 20, 4, 0.04)',
          border: `1px solid ${BRAND.cardBorder}`,
          color: BRAND.textPrimary,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: BRAND.cardGradient,
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(36, 20, 4, 0.04)',
          border: `1px solid ${BRAND.cardBorder}`,
          color: BRAND.textPrimary,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: '#FFFFFF',
          fontSize: '0.8125rem',
          color: BRAND.textPrimary,
          transition: 'box-shadow 0.2s ease, background-color 0.2s ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: BRAND.cardBorder,
            transition: 'border-color 0.2s ease, border-width 0.2s ease',
          },
          '&:hover': {
            backgroundColor: BRAND.cardLightYellow,
            boxShadow: `0 3px 10px ${BRAND.ring}`,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: BRAND.yellowMain,
            },
          },
          '&.Mui-focused': {
            backgroundColor: '#FFFFFF',
            boxShadow: `0 0 0 3px ${BRAND.ring}`,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: BRAND.yellowMain,
              borderWidth: 1,
            },
          },
          '&.Mui-disabled': {
            backgroundColor: '#F5EFE6',
            boxShadow: 'none',
          },
          '&.Mui-error:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#b91c1c',
          },
        },
        input: {
          fontSize: '0.8125rem',
          color: BRAND.textPrimary,
        },
        notchedOutline: {
          borderWidth: 1,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          fontSize: '0.8125rem',
          color: BRAND.textPrimary,
        },
        icon: {
          color: BRAND.brownDark,
        },
      },
    },
    MuiNativeSelect: {
      styleOverrides: {
        icon: {
          color: BRAND.brownDark,
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          color: BRAND.textPrimary,
        },
        selectIcon: {
          color: BRAND.brownDark,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: '1px solid rgba(212, 163, 78, 0.45)',
          borderRadius: 16,
          background: 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%)',
          boxShadow: '0 12px 32px rgba(36, 20, 4, 0.2), 0 2px 8px rgba(229, 184, 92, 0.15)',
          color: BRAND.textPrimary,
          padding: '6px',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '2px 4px',
          padding: '8px 14px',
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: '#241404',
          transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
          '& .MuiListItemIcon-root': {
            color: '#8C591D !important',
            minWidth: 32,
            transition: 'color 0.2s ease',
          },
          '&:hover': {
            background: 'linear-gradient(90deg, rgba(229, 184, 92, 0.35) 0%, rgba(212, 163, 78, 0.22) 100%) !important',
            color: '#241404 !important',
            boxShadow: '0 2px 8px rgba(36, 20, 4, 0.08)',
            transform: 'translateX(2px)',
            '& .MuiListItemIcon-root': {
              color: '#543310 !important',
            },
          },
          '&.Mui-selected, &.Mui-selected:hover': {
            background: 'linear-gradient(90deg, #FAE2B4 0%, #E5B85C 25%, #C99846 60%, #7D511E 85%, #38200A 100%) !important',
            color: '#241404 !important',
            fontWeight: 800,
            boxShadow: '0 3px 10px rgba(32, 18, 4, 0.3)',
            '& .MuiListItemIcon-root': {
              color: '#241404 !important',
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem',
          color: BRAND.textPrimary,
        },
      },
    },
    // APPBAR: First (left) yellow, then in right brown
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          background: BRAND.headerGradient,
          boxShadow: '0 2px 10px rgba(32, 18, 4, 0.28)',
          border: 'none',
          borderBottom: '1px solid rgba(226, 211, 190, 0.35)',
        },
      },
    },
    // DRAWER: Warm card-colored background with theme border
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          background: BRAND.cardGradient,
          color: BRAND.textPrimary,
          border: 'none',
          borderLeft: `1.5px solid ${BRAND.yellowMain}`,
          boxShadow: '-4px 0 24px rgba(32, 18, 4, 0.15)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          height: 22,
          fontSize: '0.6875rem',
          fontWeight: 700,
          borderRadius: 999,
        },
        outlined: {
          borderColor: BRAND.yellowMain,
          color: BRAND.brownDark,
        },
        label: {
          paddingInline: 8,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: BRAND.cardBorder,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '52px !important',
        },
      },
    },
    MuiTabs: {
      defaultProps: {
        variant: 'scrollable',
        scrollButtons: 'auto',
        allowScrollButtonsMobile: true,
      },
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 999,
          background: BRAND.btnGradient,
        },
      },
    },
    MuiTab: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          minHeight: 36,
          textTransform: 'none',
          fontWeight: 700,
          color: BRAND.brownDark,
          backgroundColor: 'transparent',
          transition: 'color 0.15s ease, background-color 0.15s ease',
          '&:hover': {
            color: BRAND.brownDeep,
            backgroundColor: BRAND.cardMidYellow,
          },
          '&.Mui-selected': {
            color: BRAND.brownDeep,
            backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
        standardInfo: {
          backgroundColor: BRAND.cardMidYellow,
          color: BRAND.brownDeep,
          border: `1px solid ${BRAND.cardBorder}`,
          '& .MuiAlert-icon': { color: BRAND.brownLight },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: BRAND.brownDark,
          borderColor: BRAND.cardBorder,
          '&.Mui-selected': {
            color: `${BRAND.textOnYellow} !important`,
            background: `${BRAND.btnGradient} !important`,
            '&:hover': { background: `${BRAND.btnGradientHover} !important` },
          },
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          color: BRAND.textPrimary,
          '&.Mui-selected': {
            background: `${BRAND.btnGradient} !important`,
            color: `${BRAND.textOnYellow} !important`,
            fontWeight: 800,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          margin: 12,
          width: 'calc(100% - 24px)',
          borderRadius: 20,
          background: BRAND.cardGradient,
          border: `1px solid ${BRAND.cardBorder}`,
          color: BRAND.textPrimary,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #FFFDF8 0%, #FDF7EB 40%, #FAF1DC 100%) !important',
          borderBottom: '1.5px solid rgba(212, 163, 78, 0.35) !important',
          '& .MuiTableCell-head': {
            fontWeight: 700,
            fontSize: '0.75rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#3A230B !important',
            background: 'transparent !important',
            borderBottom: '1.5px solid rgba(212, 163, 78, 0.35)',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(229, 184, 92, 0.12) !important',
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          minWidth: 0,
          borderRadius: 16,
          borderColor: BRAND.cardBorder,
          background: BRAND.cardGradient,
          color: BRAND.textPrimary,
          '& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader, & .MuiDataGrid-container--top, & .MuiDataGrid-filler, & .MuiDataGrid-scrollbarFiller': {
            background: 'linear-gradient(90deg, #FFFDF8 0%, #FDF7EB 40%, #FAF1DC 100%) !important',
            borderBottom: '1.5px solid rgba(212, 163, 78, 0.4) !important',
            color: '#3A230B !important',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 700,
            fontSize: '0.75rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#3A230B !important',
          },
          '& .MuiDataGrid-columnSeparator': {
            color: BRAND.cardBorder,
          },
          '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:nth-of-type(even)': {
            backgroundColor: 'rgba(253, 247, 235, 0.45)',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(247, 239, 225, 0.85)',
          },
          '& .MuiDataGrid-row.Mui-selected, & .MuiDataGrid-row.Mui-selected:hover': {
            backgroundColor: 'rgba(235, 219, 192, 0.9)',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid ${BRAND.cardBorder}`,
            background: 'transparent',
            color: BRAND.textPrimary,
          },
          '& .MuiDataGrid-sortIcon, & .MuiDataGrid-menuIconButton': {
            color: BRAND.brownDark,
          },
          '& .MuiDataGrid-cell': {
            borderColor: BRAND.cardBorder,
            color: BRAND.textPrimary,
          },
        },
      },
    },
  },
});

export default theme;
