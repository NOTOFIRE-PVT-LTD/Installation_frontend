import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTicketStatusLogs, personMatchesLog } from './ticketAudit.js';

const priya = { _id: 'u1', name: 'Priya Singh' };

describe('ticketAudit', () => {
  it('matches logs by person id', () => {
    assert.equal(personMatchesLog({ changedBy: 'u1', changedByName: 'Priya Singh' }, priya), true);
    assert.equal(personMatchesLog({ changedBy: 'u2', changedByName: 'Other' }, priya), false);
  });

  it('keeps status history for that person only', () => {
    const logs = buildTicketStatusLogs(
      {
        statusHistory: [
          { _id: '1', fromStatus: 'ASSIGNED', toStatus: 'IN_PROGRESS', changedBy: 'u1', changedByName: 'Priya Singh', timestamp: '2026-11-02T11:29:00Z' },
          { _id: '2', fromStatus: 'IN_PROGRESS', toStatus: 'PENDING', changedBy: 'u2', changedByName: 'Other', timestamp: '2026-11-02T11:31:00Z' },
        ],
      },
      priya
    );
    assert.equal(logs.length, 1);
    assert.equal(logs[0].to, 'IN_PROGRESS');
  });
});
