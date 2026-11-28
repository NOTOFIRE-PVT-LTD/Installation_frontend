import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_BULK_SELECTION,
  allowedSourceStatusesFor,
  capBulkSelectionIds,
  computeBalanceAmount,
  formatInr,
  isAdvancePayment,
  isSelectableRequestStatus,
  partitionBulkSelection,
  roundCurrency,
} from './payflowRequestConfig.js';

test('isSelectableRequestStatus disables terminal statuses only', () => {
  assert.equal(isSelectableRequestStatus('Pending'), true);
  assert.equal(isSelectableRequestStatus('Approved'), true);
  assert.equal(isSelectableRequestStatus('Query'), true);
  assert.equal(isSelectableRequestStatus('Postponed'), true);
  assert.equal(isSelectableRequestStatus('Processed'), false);
  assert.equal(isSelectableRequestStatus('Rejected'), false);
});

test('partitionBulkSelection splits eligible and skipped rows per target status', () => {
  const rows = [
    { _id: '1', srNo: 101, status: 'Pending' },
    { _id: '2', srNo: 102, status: 'Approved' },
    { _id: '3', srNo: 103, status: 'Postponed' },
  ];

  const approve = partitionBulkSelection(rows, 'Approved');
  assert.deepEqual(approve.eligible.map((r) => r._id), ['1', '3']);
  assert.deepEqual(approve.skipped.map((r) => r._id), ['2']);

  const process = partitionBulkSelection(rows, 'Processed');
  assert.deepEqual(process.eligible.map((r) => r._id), ['2']);
  assert.deepEqual(process.skipped.map((r) => r._id), ['1', '3']);

  const reject = partitionBulkSelection(rows, 'Rejected');
  assert.equal(reject.eligible.length, 3);
  assert.equal(reject.skipped.length, 0);
});

test('capBulkSelectionIds caps at MAX_BULK_SELECTION while preserving existing picks', () => {
  const prev = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const next = [...prev, '11'];
  const res = capBulkSelectionIds(next, prev, MAX_BULK_SELECTION);
  assert.equal(res.exceeded, true);
  assert.equal(res.ids.length, 10);
  assert.deepEqual(res.ids, prev);

  const ok = capBulkSelectionIds(['1', '2', '2'], ['1'], MAX_BULK_SELECTION);
  assert.equal(ok.exceeded, false);
  assert.deepEqual(ok.ids, ['1', '2']);
});

test('allowedSourceStatusesFor lists valid incoming statuses', () => {
  assert.deepEqual(allowedSourceStatusesFor('Processed'), ['Approved']);
  assert.deepEqual(allowedSourceStatusesFor('Query'), ['Pending']);
});

test('amount helpers compute balance, detect advances, and format negative INR cleanly', () => {
  assert.equal(roundCurrency(100.1 - 50.2), 49.9);
  assert.equal(computeBalanceAmount(514506, 500000), 14506);
  assert.equal(computeBalanceAmount(0, 19607), -19607);
  assert.equal(isAdvancePayment('Advance'), true);
  assert.equal(isAdvancePayment('Tax Invoice'), false);
  assert.equal(formatInr(500000), '₹5,00,000');
  assert.equal(formatInr(-19607), '-₹19,607');
});
