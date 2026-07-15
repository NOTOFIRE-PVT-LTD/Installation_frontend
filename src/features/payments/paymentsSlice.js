import { createResourceSlice } from '../../app/createResourceSlice';
import {
  fetchPayments,
  fetchPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  updatePaymentStatus,
} from './paymentsThunks';

const { slice } = createResourceSlice('payments', { fetchList: fetchPayments, fetchOne: fetchPaymentById });

export const { clearCurrent } = slice.actions;
export default slice.reducer;

export { fetchPayments, fetchPaymentById, createPayment, updatePayment, deletePayment, updatePaymentStatus };
