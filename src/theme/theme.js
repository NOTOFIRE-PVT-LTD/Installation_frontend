import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import { createTheme } from '@mui/material/styles';

// White shell, red actions. Logo copper stays in the asset.
const BRAND = {
  red: '#DC1F2E',
  redDark: '#9B1520',
  redDeep: '#6E0E16',
  flame: '#F2554A',
  wash: '#FBECEE',
  washHover: '#FDEFF1',
  line: '#DC1F2E',
  gradient: 'linear-gradient(135deg, #8B1420 0%, #DC1F2E 52%, #F2554A 100%)',
  gradient60: 'linear-gradient(135deg, #8B1420 0%, #DC1F2E 60%, #F2554A 100%)',
  gradientHover: 'linear-gradient(135deg, #6E0E16 0%, #C41A27 52%, #E03A34 100%)',
  ring: 'rgba(220, 31, 46, 0.16)',
  shadow: 'rgba(220, 31, 46, 0.22)',
  tableHeader: '#F8E0E3',
  tableHeaderText: '#9B1520',
  tableEven: '#FFF8F8',
  tableHover: '#FBECEE',
  ink: '#FFFFFF',
  panel: '#FFFFFF',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: BRAND.red,
      light: BRAND.wash,
      dark: BRAND.redDark,
      contrastText: '#ffffff',
      gradient: BRAND.gradient,
      gradient60: BRAND.gradient60,
      gradientHover: BRAND.gradientHover,
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
      main: '#06b6d4',
    },
    background: {
      default: BRAND.ink,
      paper: BRAND.panel,
    },
    text: {
      primary: '#1A1F26',
      secondary: '#6E3A40',
    },
    divider: BRAND.line,
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: ['"DM Sans"', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
    fontSize: 13,
    htmlFontSize: 14,
    h1: { fontWeight: 700, fontSize: '1.75rem', lineHeight: 1.25 },
    h2: { fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.25 },
    h3: { fontWeight: 700, fontSize: '1.25rem', lineHeight: 1.3 },
    h4: { fontWeight: 700, fontSize: '1.125rem', lineHeight: 1.3 },
    h5: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.35 },
    h6: { fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.35 },
    subtitle1: { fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.4 },
    subtitle2: { fontWeight: 600, fontSize: '0.75rem', lineHeight: 1.4 },
    body1: { fontSize: '0.8125rem', lineHeight: 1.45 },
    body2: { fontSize: '0.75rem', lineHeight: 1.45 },
    caption: { fontSize: '0.6875rem', lineHeight: 1.4 },
    button: { fontSize: '0.75rem', fontWeight: 600, textTransform: 'none' },
    overline: { fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.06em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          colorScheme: 'light',
        },
        body: {
          background: BRAND.ink,
          color: '#1A1F26',
          overflowX: 'hidden',
          accentColor: BRAND.red,
          scrollbarColor: `${BRAND.red} ${BRAND.wash}`,
        },
        '*::-webkit-scrollbar': {
          width: 8,
          height: 8,
        },
        '*::-webkit-scrollbar-track': {
          background: BRAND.wash,
          borderRadius: 999,
        },
        '*::-webkit-scrollbar-thumb': {
          borderRadius: 999,
          background: BRAND.gradient60,
        },
        '*::-webkit-scrollbar-thumb:hover': {
          background: BRAND.gradientHover,
        },
        'input[type="date"]': {
          accentColor: BRAND.red,
          colorScheme: 'light',
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
          fontWeight: 600,
          borderRadius: 999,
          paddingInline: 16,
          fontSize: '0.75rem',
        },
        containedPrimary: {
          background: BRAND.gradient,
          boxShadow: `0 8px 18px ${BRAND.shadow}`,
          '&:hover': {
            background: BRAND.gradientHover,
            boxShadow: `0 10px 22px ${BRAND.shadow}`,
          },
          '&.Mui-disabled': {
            background: '#C5B4B6',
            color: '#fff',
            boxShadow: 'none',
          },
        },
        outlinedPrimary: {
          borderColor: BRAND.red,
          color: BRAND.red,
          '&:hover': {
            borderColor: BRAND.flame,
            backgroundColor: BRAND.wash,
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
          background: BRAND.gradient,
          '&:hover': { background: BRAND.gradientHover },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: BRAND.panel,
          borderRadius: 18,
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: 18,
          backgroundColor: BRAND.panel,
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
        root: ({ ownerState }) => ({
          borderRadius: ownerState.multiline ? 18 : 999,
          backgroundColor: '#FFF8F8',
          fontSize: '0.8125rem',
          transition: 'box-shadow 0.2s ease, background-color 0.2s ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: BRAND.line,
            transition: 'border-color 0.2s ease, border-width 0.2s ease',
          },
          '&:hover': {
            backgroundColor: BRAND.wash,
            boxShadow: `0 4px 14px ${BRAND.ring}`,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: BRAND.flame,
            },
          },
          '&.Mui-focused': {
            backgroundColor: '#FFF8F8',
            boxShadow: `0 0 0 3px ${BRAND.ring}`,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: BRAND.red,
              borderWidth: 1,
            },
          },
          '&.Mui-disabled': {
            backgroundColor: BRAND.ink,
            boxShadow: 'none',
          },
          '&.Mui-error:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#b91c1c',
          },
        }),
        input: {
          fontSize: '0.8125rem',
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
        },
        icon: {
          color: BRAND.red,
        },
      },
    },
    MuiNativeSelect: {
      styleOverrides: {
        icon: {
          color: BRAND.red,
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        selectIcon: {
          color: BRAND.red,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: `1px solid ${BRAND.line}`,
          borderRadius: 16,
          backgroundColor: BRAND.panel,
          boxShadow: '0 8px 24px rgba(220, 31, 46, 0.14)',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: BRAND.panel,
          backgroundImage: 'none',
          boxShadow: 'none',
          border: 'none',
          borderBottom: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          background: BRAND.ink,
          border: 'none',
          borderRight: 'none',
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          height: 22,
          fontSize: '0.6875rem',
          fontWeight: 600,
          borderRadius: 999,
        },
        outlined: {
          borderColor: BRAND.red,
        },
        label: {
          paddingInline: 8,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: BRAND.red,
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
          background: BRAND.gradient,
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
          fontWeight: 600,
          color: BRAND.redDark,
          backgroundColor: 'transparent',
          transition: 'color 0.15s ease, background-color 0.15s ease',
          '&:hover': {
            color: BRAND.flame,
            backgroundColor: BRAND.wash,
          },
          '&.Mui-selected': {
            color: BRAND.red,
            backgroundColor: 'transparent',
          },
          '&.Mui-selected:hover': {
            color: BRAND.flame,
            backgroundColor: BRAND.wash,
          },
          '&.Mui-focusVisible': {
            backgroundColor: BRAND.wash,
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
          borderRadius: 16,
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        ol: {
          flexWrap: 'wrap',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          margin: 12,
          width: 'calc(100% - 24px)',
          borderRadius: 20,
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          minWidth: 640,
          borderRadius: 18,
          borderColor: BRAND.line,
          backgroundColor: BRAND.panel,
          color: '#1A1F26',
          '& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader, & .MuiDataGrid-container--top, & .MuiDataGrid-filler, & .MuiDataGrid-scrollbarFiller': {
            backgroundColor: `${BRAND.tableHeader} !important`,
            color: BRAND.tableHeaderText,
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 700,
            color: BRAND.tableHeaderText,
          },
          '& .MuiDataGrid-columnSeparator': {
            color: BRAND.line,
          },
          '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:nth-of-type(even)': {
            backgroundColor: BRAND.tableEven,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: BRAND.tableHover,
          },
          '& .MuiDataGrid-row.Mui-selected, & .MuiDataGrid-row.Mui-selected:hover': {
            backgroundColor: BRAND.tableHover,
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid ${BRAND.line}`,
            backgroundColor: BRAND.panel,
          },
          '& .MuiDataGrid-sortIcon, & .MuiDataGrid-menuIconButton': {
            color: BRAND.tableHeaderText,
          },
          '& .MuiDataGrid-cell': {
            borderColor: BRAND.line,
          },
        },
      },
    },
  },
});

export default theme;
