import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { visitExpenseApi } from '../../api/visitExpenseApi';

export function useExpenseDayLoad(setExpense) {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    visitExpenseApi
      .getById(id)
      .then(({ data }) => setExpense(data.data))
      .catch((err) => {
        dispatch(showSnackbar({ message: err.response?.data?.message || 'Expense not found', severity: 'error' }));
        navigate('/expenses');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
}