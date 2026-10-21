import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertApplicationTransition,
  assertCanActivatePropertyHold,
  assertCanExecuteLease,
  assertCanFinalizeDepositDisposition,
  assertCanIssueLeaseOffer,
  assertCanRecordSecurityDeposit,
  assertScreeningTransition
} from './leasingWorkflow';

test('application and screening transitions reject invalid state changes', () => {
  assert.doesNotThrow(() => assertApplicationTransition('under_review', 'approved'));
  assert.throws(() => assertApplicationTransition('denied', 'approved'), /Invalid application transition/);
  assert.doesNotThrow(() => assertScreeningTransition('staff_review', 'eligible_with_conditions'));
  assert.throws(() => assertScreeningTransition('clear', 'staff_review'), /Invalid screening transition/);
});

test('lease offer requires an approved application, completed screening, and approved policy', () => {
  assert.doesNotThrow(() => assertCanIssueLeaseOffer({
    applicationStatus: 'conditionally_approved',
    requiredScreeningStatuses: ['clear', 'eligible_with_conditions'],
    policyApproved: true
  }));
  assert.throws(() => assertCanIssueLeaseOffer({
    applicationStatus: 'under_review',
    requiredScreeningStatuses: ['clear'],
    policyApproved: true
  }), /not approved/);
  assert.throws(() => assertCanIssueLeaseOffer({
    applicationStatus: 'approved',
    requiredScreeningStatuses: ['staff_review'],
    policyApproved: true
  }), /incomplete or requires review/);
  assert.throws(() => assertCanIssueLeaseOffer({
    applicationStatus: 'approved',
    requiredScreeningStatuses: ['clear'],
    policyApproved: false
  }), /approved market policy/);
});

test('property hold requires accepted terms, approved policy, and confirmed payment', () => {
  assert.doesNotThrow(() => assertCanActivatePropertyHold({
    termsAccepted: true,
    policyApproved: true,
    paymentStatus: 'succeeded'
  }));
  assert.throws(() => assertCanActivatePropertyHold({
    termsAccepted: true,
    policyApproved: true,
    paymentStatus: 'processing'
  }), /not confirmed/);
  assert.throws(() => assertCanActivatePropertyHold({
    termsAccepted: false,
    policyApproved: true,
    paymentStatus: 'succeeded'
  }), /terms must be accepted/);
});

test('lease execution requires provider confirmation and every required signature', () => {
  assert.doesNotThrow(() => assertCanExecuteLease({
    leaseStatus: 'partially_signed',
    policyApproved: true,
    providerDocumentStatus: 'executed',
    requiredSignerStatuses: ['signed', 'signed']
  }));
  assert.throws(() => assertCanExecuteLease({
    leaseStatus: 'offered',
    policyApproved: true,
    providerDocumentStatus: 'executed',
    requiredSignerStatuses: ['signed', 'pending']
  }), /Every required signer/);
  assert.throws(() => assertCanExecuteLease({
    leaseStatus: 'offered',
    policyApproved: true,
    providerDocumentStatus: 'sent',
    requiredSignerStatuses: ['signed']
  }), /provider has not confirmed/);
});

test('security deposit receipt requires an executed lease, approved policy, and successful payment', () => {
  assert.doesNotThrow(() => assertCanRecordSecurityDeposit({
    leaseStatus: 'executed',
    policyApproved: true,
    paymentStatus: 'succeeded',
    amount: 1800
  }));
  assert.throws(() => assertCanRecordSecurityDeposit({
    leaseStatus: 'offered',
    policyApproved: true,
    paymentStatus: 'succeeded',
    amount: 1800
  }), /lease must be executed/);
});

test('deposit disposition requires lease end, delivered notice, and reconciled amounts', () => {
  assert.doesNotThrow(() => assertCanFinalizeDepositDisposition({
    leaseStatus: 'ended',
    noticeDelivered: true,
    depositAmount: 1800,
    refundAmount: 1200,
    retainedAmount: 600
  }));
  assert.throws(() => assertCanFinalizeDepositDisposition({
    leaseStatus: 'ended',
    noticeDelivered: false,
    depositAmount: 1800,
    refundAmount: 1800,
    retainedAmount: 0
  }), /notice must be delivered/);
  assert.throws(() => assertCanFinalizeDepositDisposition({
    leaseStatus: 'ended',
    noticeDelivered: true,
    depositAmount: 1800,
    refundAmount: 1700,
    retainedAmount: 0
  }), /must reconcile/);
});