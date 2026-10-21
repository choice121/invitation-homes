export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'identity_verification'
  | 'screening'
  | 'information_requested'
  | 'under_review'
  | 'approved'
  | 'conditionally_approved'
  | 'denied'
  | 'withdrawn'
  | 'expired';

export type ScreeningStatus =
  | 'queued'
  | 'submitted'
  | 'processing'
  | 'action_required'
  | 'staff_review'
  | 'clear'
  | 'eligible_with_conditions'
  | 'ineligible'
  | 'failed'
  | 'cancelled';

export type LeaseStatus =
  | 'draft'
  | 'offered'
  | 'partially_signed'
  | 'executed'
  | 'active'
  | 'ended'
  | 'void';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'reversed';

const applicationTransitions: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  draft: ['submitted', 'withdrawn', 'expired'],
  submitted: ['identity_verification', 'screening', 'information_requested', 'under_review', 'withdrawn', 'expired'],
  identity_verification: ['screening', 'information_requested', 'under_review', 'withdrawn', 'expired'],
  screening: ['information_requested', 'under_review', 'withdrawn', 'expired'],
  information_requested: ['screening', 'under_review', 'withdrawn', 'expired'],
  under_review: ['screening', 'information_requested', 'approved', 'conditionally_approved', 'denied', 'withdrawn'],
  approved: [],
  conditionally_approved: ['approved', 'denied', 'withdrawn', 'expired'],
  denied: [],
  withdrawn: [],
  expired: []
};

const screeningTransitions: Record<ScreeningStatus, readonly ScreeningStatus[]> = {
  queued: ['submitted', 'cancelled', 'failed'],
  submitted: ['processing', 'action_required', 'staff_review', 'clear', 'eligible_with_conditions', 'ineligible', 'failed', 'cancelled'],
  processing: ['action_required', 'staff_review', 'clear', 'eligible_with_conditions', 'ineligible', 'failed', 'cancelled'],
  action_required: ['processing', 'failed', 'cancelled'],
  staff_review: ['clear', 'eligible_with_conditions', 'ineligible', 'failed', 'cancelled'],
  clear: [],
  eligible_with_conditions: [],
  ineligible: [],
  failed: [],
  cancelled: []
};

function assertTransition<T extends string>(
  entity: string,
  current: T,
  next: T,
  transitions: Record<T, readonly T[]>
): void {
  if (!transitions[current].includes(next)) {
    throw new Error(`Invalid ${entity} transition: ${current} -> ${next}`);
  }
}

export function assertApplicationTransition(current: ApplicationStatus, next: ApplicationStatus): void {
  assertTransition('application', current, next, applicationTransitions);
}

export function assertScreeningTransition(current: ScreeningStatus, next: ScreeningStatus): void {
  assertTransition('screening', current, next, screeningTransitions);
}

export function assertCanIssueLeaseOffer(input: {
  applicationStatus: ApplicationStatus;
  requiredScreeningStatuses: ScreeningStatus[];
  policyApproved: boolean;
}): void {
  if (!input.policyApproved) throw new Error('An approved market policy is required.');
  if (!['approved', 'conditionally_approved'].includes(input.applicationStatus)) {
    throw new Error('The application is not approved for an offer.');
  }
  if (input.requiredScreeningStatuses.length === 0) {
    throw new Error('Required screening results are missing.');
  }
  if (input.requiredScreeningStatuses.some((status) => !['clear', 'eligible_with_conditions'].includes(status))) {
    throw new Error('Required screening is incomplete or requires review.');
  }
}

export function assertCanActivatePropertyHold(input: {
  termsAccepted: boolean;
  policyApproved: boolean;
  paymentStatus: PaymentStatus;
}): void {
  if (!input.policyApproved) throw new Error('An approved holding policy is required.');
  if (!input.termsAccepted) throw new Error('The holding terms must be accepted.');
  if (input.paymentStatus !== 'succeeded') throw new Error('The holding payment is not confirmed.');
}

export function assertCanExecuteLease(input: {
  leaseStatus: LeaseStatus;
  policyApproved: boolean;
  providerDocumentStatus: 'draft' | 'sent' | 'partially_signed' | 'executed' | 'declined' | 'void';
  requiredSignerStatuses: Array<'pending' | 'sent' | 'signed' | 'declined' | 'void'>;
}): void {
  if (!input.policyApproved) throw new Error('An approved lease policy is required.');
  if (!['offered', 'partially_signed'].includes(input.leaseStatus)) {
    throw new Error('The lease is not ready for execution.');
  }
  if (input.providerDocumentStatus !== 'executed') {
    throw new Error('The signing provider has not confirmed execution.');
  }
  if (input.requiredSignerStatuses.length === 0 || input.requiredSignerStatuses.some((status) => status !== 'signed')) {
    throw new Error('Every required signer must complete signing.');
  }
}

export function assertCanRecordSecurityDeposit(input: {
  leaseStatus: LeaseStatus;
  policyApproved: boolean;
  paymentStatus: PaymentStatus;
  amount: number;
}): void {
  if (!input.policyApproved) throw new Error('An approved security-deposit policy is required.');
  if (!['executed', 'active'].includes(input.leaseStatus)) {
    throw new Error('The lease must be executed before recording a security deposit.');
  }
  if (input.paymentStatus !== 'succeeded') throw new Error('The deposit payment is not confirmed.');
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error('The deposit amount must be positive.');
}

export function assertCanFinalizeDepositDisposition(input: {
  leaseStatus: LeaseStatus;
  noticeDelivered: boolean;
  depositAmount: number;
  refundAmount: number;
  retainedAmount: number;
}): void {
  if (input.leaseStatus !== 'ended') throw new Error('The lease must end before deposit disposition.');
  if (!input.noticeDelivered) throw new Error('The required disposition notice must be delivered.');
  const amounts = [input.depositAmount, input.refundAmount, input.retainedAmount];
  if (amounts.some((amount) => !Number.isFinite(amount) || amount < 0)) {
    throw new Error('Deposit disposition amounts must be valid non-negative amounts.');
  }
  if (Math.round((input.refundAmount + input.retainedAmount) * 100) !== Math.round(input.depositAmount * 100)) {
    throw new Error('Refund and retained amounts must reconcile to the deposit.');
  }
}
