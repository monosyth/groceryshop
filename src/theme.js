import { createTheme } from '@mui/material/styles';
import { teal, blue, purple, pink, orange, amber, red, cyan, gray, darkGray, brown, cream, white, ui } from './theme/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: teal.main,
      light: teal.light,
      dark: teal.dark,
      contrastText: '#fff',
    },
    secondary: {
      main: orange.main,
      light: orange.light,
      dark: orange.dark,
      contrastText: '#fff',
    },
    success: {
      main: teal.main,
      light: teal.light,
      dark: teal.dark,
    },
    warning: {
      main: amber.main,
      light: amber.light,
      dark: amber.dark,
    },
    error: {
      main: red.main,
      light: red.light,
      dark: red.dark,
    },
    info: {
      main: blue.main,
      light: blue.light,
      dark: blue.dark,
    },
    background: {
      default: teal.bg,
      paper: white,
    },
    text: {
      primary: darkGray.darker,
      secondary: darkGray.main,
    },
  },
  typography: {
    fontFamily: [
      'Outfit',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.125rem', // 34px
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontSize: '1.75rem', // 28px
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.25rem', // 20px
      fontWeight: 600,
    },
    h4: {
      fontSize: '1rem', // 16px
      fontWeight: 600,
    },
    h5: {
      fontSize: '1rem', // 16px
      fontWeight: 600,
    },
    h6: {
      fontSize: '0.875rem', // 14px
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.875rem', // 14px
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.8125rem', // 13px
      lineHeight: 1.43,
    },
    caption: {
      fontSize: '0.6875rem', // 11px
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          fontSize: '1rem',
          fontFamily: 'Outfit, sans-serif',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: teal.bg,
          },
        },
        sizeSmall: {
          padding: '6px 16px',
          fontSize: '0.875rem',
        },
        sizeLarge: {
          padding: '12px 32px',
          fontSize: '1.125rem',
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.1)',
          border: `2px solid ${ui.border}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontFamily: 'Outfit, sans-serif',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            fontFamily: 'Outfit, sans-serif',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: teal.main,
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
                borderColor: teal.main,
              },
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.08)',
        },
        elevation2: {
          boxShadow: '3px 3px 0px rgba(0, 0, 0, 0.1)',
        },
        elevation3: {
          boxShadow: '6px 6px 0px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: `2px solid ${ui.border}`,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          fontFamily: 'Outfit, sans-serif',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '3px 3px 0px rgba(0, 0, 0, 0.2)',
          fontFamily: 'Outfit, sans-serif',
        },
      },
    },
  },
});

export default theme;
