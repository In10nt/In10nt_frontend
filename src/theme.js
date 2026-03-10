import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#D32F2F',
      light: '#EF5350',
      dark: '#C62828',
      contrastText: '#fff',
    },
    secondary: {
      main: '#666666',
      light: '#999999',
      dark: '#333333',
      contrastText: '#fff',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    error: {
      main: '#D32F2F',
    },
    success: {
      main: '#388E3C',
    },
    warning: {
      main: '#F57C00',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#333333',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#333333',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#333333',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
        contained: {
          boxShadow: '0 2px 8px rgba(211, 47, 47, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e0e0e0',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#333333',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #e0e0e0',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#D32F2F',
        },
      },
    },
  },
})

export default theme
