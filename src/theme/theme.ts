import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#E6A954', // Krem-amber tonu
      light: '#F2C288',
      dark: '#C18933',
    },
    secondary: {
      main: '#D9795B', // Krem-mercan tonu
      light: '#E6A084',
      dark: '#B25642',
    },
    background: {
      default: '#FEF8EE', // Çok açık krem
      paper: '#FFFFFF',
    },
    text: {
      primary: '#5D4037', // Koyu kahverengi
      secondary: '#8D6E63', // Orta kahverengi
    },
    divider: 'rgba(93, 64, 55, 0.08)',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          boxShadow: '0 4px 10px rgba(230, 169, 84, 0.2)',
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#C18933',
            boxShadow: '0 6px 15px rgba(230, 169, 84, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
          transition: 'box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-5px)',
          }
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
        },
        elevation1: {
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
        }
      }
    }
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0 2px 5px rgba(0, 0, 0, 0.05)',
    '0 3px 8px rgba(0, 0, 0, 0.07)',
    '0 4px 10px rgba(0, 0, 0, 0.09)',
    '0 5px 15px rgba(0, 0, 0, 0.1)',
    '0 6px 18px rgba(0, 0, 0, 0.12)',
    '0 7px 20px rgba(0, 0, 0, 0.14)',
    '0 8px 22px rgba(0, 0, 0, 0.15)',
    '0 9px 25px rgba(0, 0, 0, 0.16)',
    '0 10px 28px rgba(0, 0, 0, 0.17)',
    '0 11px 30px rgba(0, 0, 0, 0.18)',
    '0 12px 32px rgba(0, 0, 0, 0.19)',
    '0 13px 35px rgba(0, 0, 0, 0.2)',
    '0 14px 38px rgba(0, 0, 0, 0.21)',
    '0 15px 40px rgba(0, 0, 0, 0.22)',
    '0 16px 42px rgba(0, 0, 0, 0.23)',
    '0 17px 45px rgba(0, 0, 0, 0.24)',
    '0 18px 48px rgba(0, 0, 0, 0.25)',
    '0 19px 50px rgba(0, 0, 0, 0.26)',
    '0 20px 52px rgba(0, 0, 0, 0.27)',
    '0 21px 55px rgba(0, 0, 0, 0.28)',
    '0 22px 58px rgba(0, 0, 0, 0.29)',
    '0 23px 60px rgba(0, 0, 0, 0.3)',
    '0 24px 62px rgba(0, 0, 0, 0.31)',
    '0 25px 65px rgba(0, 0, 0, 0.32)',
  ],
});

export default theme; 