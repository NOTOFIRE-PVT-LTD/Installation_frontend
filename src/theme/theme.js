import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2f6fed',
      light: '#eef3ff',
      dark: '#1746b7',
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
      main: '#ef4444',
    },
    info: {
      main: '#06b6d4',
    },
    background: {
      default: '#f4f6f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a2332',
      secondary: '#6b7793',
    },
    divider: '#e4e9f2',
  },
  shape: {
    borderRadius: 10,
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
        body: {
          background: '#f4f6f9',
          color: '#1a2332',
        },
        '#root': {
          minHeight: '100vh',
          overflowX: 'hidden',
        },
        body: {
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
          borderRadius: 8,
          paddingInline: 12,
          fontSize: '0.75rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 10,
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: 10,
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
          borderRadius: ownerState.multiline ? 16 : 999,
          backgroundColor: '#ffffff',
          fontSize: '0.8125rem',
          transition: 'box-shadow 0.2s ease, background-color 0.2s ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e4e9f2',
            transition: 'border-color 0.2s ease, border-width 0.2s ease',
          },
          '&:hover': {
            backgroundColor: '#f8fafc',
            boxShadow: '0 4px 14px rgba(47, 111, 237, 0.08)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#93b4f8',
            },
          },
          '&.Mui-focused': {
            backgroundColor: '#ffffff',
            boxShadow: '0 0 0 3px rgba(47, 111, 237, 0.12)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2f6fed',
              borderWidth: 1,
            },
          },
          '&.Mui-disabled': {
            backgroundColor: '#f4f6f9',
            boxShadow: 'none',
          },
          '&.Mui-error:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ef4444',
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
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          background: '#ffffff',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          height: 22,
          fontSize: '0.6875rem',
          fontWeight: 600,
          borderRadius: 6,
        },
        label: {
          paddingInline: 8,
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
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          minWidth: 640,
        },
      },
    },
  },
});

export default theme;
