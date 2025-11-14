import { createTheme } from '@mui/material/styles';

/**
 * Strict Monochrome Theme for DocAlign
 * Colors: Black, white, and shades of gray only
 * No colored accents allowed
 */
export const monochromeTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
      light: '#333333',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#666666',
      light: '#999999',
      dark: '#333333',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
      disabled: '#999999',
    },
    divider: '#e0e0e0',
    error: {
      main: '#000000',
      light: '#666666',
      dark: '#000000',
    },
    warning: {
      main: '#000000',
      light: '#666666',
      dark: '#000000',
    },
    info: {
      main: '#000000',
      light: '#666666',
      dark: '#000000',
    },
    success: {
      main: '#000000',
      light: '#666666',
      dark: '#000000',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#000000',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#000000',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#000000',
    },
    body1: {
      fontSize: '1rem',
      color: '#000000',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#666666',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
        },
        contained: {
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333',
          },
        },
        outlined: {
          borderColor: '#000000',
          color: '#000000',
          '&:hover': {
            borderColor: '#333333',
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: 4,
        },
        outlined: {
          border: '1px solid #e0e0e0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          color: '#ffffff',
        },
      },
    },
  },
});

/**
 * Severity-based highlight classes for inconsistencies
 * Monochrome only - using varying opacity levels of black
 */
export const highlightStyles = {
  critical: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: '#ffffff',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
    },
  },
  high: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    color: '#ffffff',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
    },
  },
  medium: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    color: '#ffffff',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
    },
  },
  low: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    color: '#000000',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
  },
  selected: {
    outline: '2px solid #000000',
    outlineOffset: '2px',
  },
};
