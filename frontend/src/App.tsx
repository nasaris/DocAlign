import { ThemeProvider, CssBaseline } from '@mui/material';
import { monochromeTheme } from './theme/monochromeTheme';
import { Layout } from './components/Layout';

function App() {
  return (
    <ThemeProvider theme={monochromeTheme}>
      <CssBaseline />
      <Layout />
    </ThemeProvider>
  );
}

export default App;
