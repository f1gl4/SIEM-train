import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary:  { main: '#d32f2f' },
    secondary:{ main: '#00c853' },
    background: {
      default: '#111315',
      paper:   '#1b1d1f',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {


        },
        '::before': {
          content: '""',
          position: 'fixed',
          inset: 0,
          opacity: 0.04,
          pointerEvents: 'none',
          zIndex: -1,
        },
      },
    },
  },
  typography: {
    fontFamily: 'Roboto Mono, monospace',
    h4: { fontWeight: 700 },
  },
});
