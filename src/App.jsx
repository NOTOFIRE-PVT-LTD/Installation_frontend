import { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { BrowserRouter } from 'react-router-dom';
import theme from './theme/theme';
import './theme/appGlass.css';
import AppRoutes from './routes/AppRoutes';
import AppToastHost from './components/common/AppToastHost';
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
          <AppToastHost />
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
