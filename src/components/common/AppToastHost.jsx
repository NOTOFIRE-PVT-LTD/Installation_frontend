import { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { hideSnackbar } from '../../features/ui/uiSlice';

/** Bridges existing showSnackbar() calls into react-toastify toasts. */
function SnackbarBridge() {
  const dispatch = useAppDispatch();
  const snackbar = useAppSelector((s) => s.ui.snackbar);

  useEffect(() => {
    if (!snackbar.open || !snackbar.message) return;
    const severity = snackbar.severity || 'success';
    const opts = { autoClose: 4000 };
    if (severity === 'error') toast.error(snackbar.message, opts);
    else if (severity === 'warning') toast.warn(snackbar.message, opts);
    else if (severity === 'info') toast.info(snackbar.message, opts);
    else toast.success(snackbar.message, opts);
    dispatch(hideSnackbar());
  }, [snackbar.open, snackbar.message, snackbar.severity, dispatch]);

  return null;
}

export default function AppToastHost() {
  return (
    <>
      <SnackbarBridge />
      <ToastContainer
        position="bottom-right"
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
        style={{ zIndex: 2000 }}
      />
    </>
  );
}
