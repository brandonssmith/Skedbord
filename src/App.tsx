import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Board from './components/Board';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Board />
    </ThemeProvider>
  );
}

export default App;
