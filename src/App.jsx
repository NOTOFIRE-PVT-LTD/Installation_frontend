import { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { BrowserRouter } from 'react-router-dom';
import theme from './theme/theme';
import AppRoutes from './routes/AppRoutes';
import { useAppDispatch } from './app/hooks';
import { fetchMe } from './features/auth/authThunks';

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || undefined}>
          <AppRoutes />
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
