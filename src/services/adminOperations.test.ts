import assert from 'node:assert/strict';
import test from 'node:test';
import {
  recordManualPayment,
  getPaymentRecords,
  createLeaseAgreement,
  getLeaseAgreements,
  updateLeaseStatus,
  submitPropertyInspection,
  getInspections,
  reviewInspection,
  getAuditLogs,
  logAuditEvent
} from './adminOperations';

test('manual payment recording creates auditable record with reference', async () => {
  const payment = await recordManualPayment('app-test-999', {
    paymentType: 'application_fee',
    method: 'Zelle',
    amount: 55,
    handle: '404-555-1234',
    referenceCode: 'ZELLE-TEST-88192',
    status: 'verified',
    verifiedBy: 'Carol Taylor (Staff)',
    notes: 'Verified via test runner'
  });

  assert.equal(payment.applicationId, 'app-test-999');
  assert.equal(payment.referenceCode, 'ZELLE-TEST-88192');
  assert.equal(payment.amount, 55);

  const records = await getPaymentRecords('app-test-999');
  assert.equal(records.length, 1);
  assert.equal(records[0].method, 'Zelle');
});

test('lease lifecycle supports creation, delivery, and countersigning', async () => {
  const lease = await createLeaseAgreement({
    applicationId: 'app-test-999',
    propertyId: 'coppell-tx-782',
    propertyAddress: '782 Sandy Lake Rd, Coppell, TX 75019',
    tenantName: 'Elena Rostova',
    tenantEmail: 'elena@example.test',
    monthlyRent: 2495,
    securityDeposit: 2495,
    leaseTermMonths: 12,
    startDate: '2026-12-01',
    endDate: '2027-11-30'
  });

  assert.equal(lease.status, 'sent_to_tenant');
  assert.equal(lease.tenantName, 'Elena Rostova');

  await updateLeaseStatus(lease.id, 'countersigned');
  const userLeases = await getLeaseAgreements('elena@example.test');
  assert.equal(userLeases[0].status, 'countersigned');
  assert.ok(userLeases[0].countersignedAt);
});

test('inspection submission logs room checkpoints and staff review', async () => {
  const inspection = await submitPropertyInspection({
    propertyId: 'marietta-ga-1420',
    propertyAddress: '1420 Roswell Rd, Marietta, GA 30062',
    tenantName: 'Marcus Vance',
    tenantEmail: 'm.vance@example.test',
    type: 'move_in',
    inspectionDate: '2026-11-15',
    checklist: [
      { name: 'Front Porch & Keypad', condition: 'excellent', notes: 'All clear', photosCount: 1 },
      { name: 'Kitchen Sink', condition: 'good', notes: 'No leaks', photosCount: 1 }
    ],
    overallCondition: 'excellent',
    notes: 'Move-in inspection verified by resident'
  });

  assert.equal(inspection.status, 'submitted');
  assert.equal(inspection.checklist.length, 2);

  await reviewInspection(inspection.id, 'reviewed');
  const insps = await getInspections('m.vance@example.test');
  const found = insps.find((i) => i.id === inspection.id);
  assert.equal(found?.status, 'reviewed');
});

test('audit log records immutable operational events', async () => {
  await logAuditEvent('application', 'app-test-999', 'TEST_ACTION', { foo: 'bar' });
  const logs = await getAuditLogs();
  const testLog = logs.find((l) => l.entityId === 'app-test-999' && l.action === 'TEST_ACTION');
  assert.ok(testLog);
  assert.equal(testLog?.metadata.foo, 'bar');
});
