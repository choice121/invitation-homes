import assert from 'node:assert/strict';
import test from 'node:test';
import { createTenantWorkflowState, TENANT_MOVE_IN_TASKS, TENANT_MOVE_OUT_TASKS, reduceTenantWorkflowState } from './tenantWorkflow';

test('tenant lifecycle completes application, screening, hold, lease, residency, maintenance, move-out, and deposit disposition', () => {
  let state = createTenantWorkflowState('sample-home');
  state = reduceTenantWorkflowState(state, {
    type: 'update_applicant',
    applicantName: 'Jordan Example',
    applicantEmail: 'jordan@example.com',
    moveInDate: '2026-12-01'
  });
  state = reduceTenantWorkflowState(state, { type: 'submit_application' });
  assert.equal(state.applicationStatus, 'submitted');
  assert.equal(state.stage, 'screening');

  state = reduceTenantWorkflowState(state, { type: 'complete_screening' });
  assert.equal(state.applicationStatus, 'under_review');
  assert.equal(state.stage, 'holding');
  assert.equal(state.screeningComplete, true);

  state = reduceTenantWorkflowState(state, { type: 'accept_holding_terms' });
  state = reduceTenantWorkflowState(state, { type: 'complete_holding_step' });
  assert.equal(state.holdingStepComplete, true);
  assert.equal(state.stage, 'lease');

  state = reduceTenantWorkflowState(state, { type: 'complete_lease_review' });
  assert.equal(state.leaseReviewComplete, true);
  assert.equal(state.stage, 'deposit');

  state = reduceTenantWorkflowState(state, { type: 'complete_deposit_step', amount: 1800 });
  assert.equal(state.depositStepComplete, true);
  assert.equal(state.stage, 'move_in');

  for (const task of TENANT_MOVE_IN_TASKS) {
    state = reduceTenantWorkflowState(state, { type: 'toggle_checklist', key: task.key });
  }
  assert.equal(state.stage, 'residency');

  state = reduceTenantWorkflowState(state, { type: 'submit_maintenance_request', category: 'plumbing', description: 'Kitchen faucet is leaking.' });
  assert.equal(state.maintenanceStatus, 'submitted');
  state = reduceTenantWorkflowState(state, { type: 'complete_maintenance_request' });
  assert.equal(state.maintenanceStatus, 'completed');
  assert.equal(state.stage, 'renewal');

  state = reduceTenantWorkflowState(state, { type: 'respond_to_renewal', decision: 'declined' });
  assert.equal(state.stage, 'move_out');
  state = reduceTenantWorkflowState(state, { type: 'submit_move_out_notice', noticeDate: '2027-11-30' });
  for (const task of TENANT_MOVE_OUT_TASKS) {
    state = reduceTenantWorkflowState(state, { type: 'toggle_move_out_checklist', key: task.key });
  }
  assert.equal(state.stage, 'deposit_disposition');
  state = reduceTenantWorkflowState(state, { type: 'finalize_deposit_disposition', refundAmount: 1800, retainedAmount: 0 });
  assert.equal(state.stage, 'complete');
  assert.equal(state.depositRefundAmount, 1800);
  assert.equal(state.notifications.length, 12);
});

test('renewal acceptance closes the renewal path without creating a move-out notice', () => {
  let state = createTenantWorkflowState('sample-home');
  state = { ...state, stage: 'renewal', renewalDecision: 'pending' };
  state = reduceTenantWorkflowState(state, { type: 'respond_to_renewal', decision: 'accepted' });
  assert.equal(state.stage, 'complete');
  assert.equal(state.renewalDecision, 'accepted');
  assert.equal(state.moveOutNoticeDate, '');
});

test('application cannot be submitted with missing or invalid data', () => {
  const state = createTenantWorkflowState('sample-home');
  assert.throws(() => reduceTenantWorkflowState(state, { type: 'submit_application' }), /applicant name/);
  assert.throws(() => reduceTenantWorkflowState({
    ...state,
    applicantName: 'Jordan Example',
    applicantEmail: 'not-an-email',
    moveInDate: '2026-12-01'
  }, { type: 'submit_application' }), /valid email/);
});

test('holding terms must be acknowledged before continuing and lease review makes no signature', () => {
  let state = createTenantWorkflowState('sample-home');
  state = reduceTenantWorkflowState(state, {
    type: 'update_applicant',
    applicantName: 'Jordan Example',
    applicantEmail: 'jordan@example.com',
    moveInDate: '2026-12-01'
  });
  state = reduceTenantWorkflowState(state, { type: 'submit_application' });
  state = reduceTenantWorkflowState(state, { type: 'complete_screening' });
  assert.throws(() => reduceTenantWorkflowState(state, { type: 'complete_holding_step' }), /terms before continuing/);

  state = reduceTenantWorkflowState(state, { type: 'accept_holding_terms' });
  state = reduceTenantWorkflowState(state, { type: 'complete_holding_step' });
  state = reduceTenantWorkflowState(state, { type: 'complete_lease_review' });
  assert.equal(state.leaseReviewComplete, true);
  assert.equal('leaseSigned' in state, false);
});