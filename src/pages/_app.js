import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import '@/styles/globals.css';

// Create a theme instance.
const theme = createTheme({
  // You can customize your theme here. For more details, check out https://mui.com/customization/theming/
});

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}