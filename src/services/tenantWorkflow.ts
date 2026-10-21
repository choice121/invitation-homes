import {
  ApplicationStatus,
  assertApplicationTransition
} from './leasingWorkflow';

export type TenantWorkflowStage = 'application' | 'screening' | 'holding' | 'lease' | 'deposit' | 'move_in' | 'residency' | 'maintenance' | 'renewal' | 'move_out' | 'deposit_disposition' | 'complete';

export interface WorkflowNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

export interface TenantWorkflowState {
  version: 2;
  propertySlug: string;
  stage: TenantWorkflowStage;
  applicationStatus: ApplicationStatus;
  applicantName: string;
  applicantEmail: string;
  moveInDate: string;
  screeningComplete: boolean;
  holdingTermsAccepted: boolean;
  holdingStepComplete: boolean;
  leaseReviewComplete: boolean;
  depositStepComplete: boolean;
  securityDepositAmount: number;
  maintenanceCategory: string;
  maintenanceDescription: string;
  maintenanceStatus: 'none' | 'submitted' | 'completed';
  renewalDecision: 'pending' | 'accepted' | 'declined';
  moveOutNoticeDate: string;
  moveOutChecklist: Record<string, boolean>;
  depositRefundAmount: number | null;
  depositRetainedAmount: number | null;
  checklist: Record<string, boolean>;
  notifications: WorkflowNotification[];
}

export type TenantWorkflowAction =
  | { type: 'update_applicant'; applicantName: string; applicantEmail: string; moveInDate: string }
  | { type: 'submit_application' }
  | { type: 'complete_screening' }
  | { type: 'accept_holding_terms' }
  | { type: 'complete_holding_step' }
  | { type: 'complete_lease_review' }
  | { type: 'complete_deposit_step'; amount: number }
  | { type: 'toggle_checklist'; key: string }
  | { type: 'submit_maintenance_request'; category: string; description: string }
  | { type: 'complete_maintenance_request' }
  | { type: 'respond_to_renewal'; decision: 'accepted' | 'declined' }
  | { type: 'submit_move_out_notice'; noticeDate: string }
  | { type: 'toggle_move_out_checklist'; key: string }
  | { type: 'finalize_deposit_disposition'; refundAmount: number; retainedAmount: number };

export const TENANT_MOVE_IN_TASKS = [
  { key: 'utilities', label: 'Review utility setup for the home' },
  { key: 'inspection', label: 'Complete the move-in condition checklist' },
  { key: 'household', label: 'Confirm household and emergency-contact details' }
] as const;

export const TENANT_MOVE_OUT_TASKS = [
  { key: 'inspection', label: 'Review the sample move-out inspection' },
  { key: 'keys', label: 'Confirm keys and access devices are returned' },
  { key: 'forwarding', label: 'Confirm a forwarding address is on file (do not enter it here)' }
] as const;

export function createTenantWorkflowState(propertySlug: string): TenantWorkflowState {
  return {
    version: 2,
    propertySlug,
    stage: 'application',
    applicationStatus: 'draft',
    applicantName: '',
    applicantEmail: '',
    moveInDate: '',
    screeningComplete: false,
    holdingTermsAccepted: false,
    holdingStepComplete: false,
    leaseReviewComplete: false,
    depositStepComplete: false,
    securityDepositAmount: 0,
    maintenanceCategory: '',
    maintenanceDescription: '',
    maintenanceStatus: 'none',
    renewalDecision: 'pending',
    moveOutNoticeDate: '',
    moveOutChecklist: {},
    depositRefundAmount: null,
    depositRetainedAmount: null,
    checklist: {},
    notifications: []
  };
}

function addNotification(state: TenantWorkflowState, title: string, message: string): TenantWorkflowState {
  return {
    ...state,
    notifications: [{
      id: `${Date.now()}-${state.notifications.length}`,
      title,
      message,
      createdAt: new Date().toISOString()
    }, ...state.notifications]
  };
}

export function reduceTenantWorkflowState(state: TenantWorkflowState, action: TenantWorkflowAction): TenantWorkflowState {
  if (action.type === 'update_applicant') {
    if (state.stage !== 'application') throw new Error('The application is already submitted.');
    return { ...state, applicantName: action.applicantName, applicantEmail: action.applicantEmail, moveInDate: action.moveInDate };
  }

  if (action.type === 'submit_application') {
    if (!state.applicantName.trim()) throw new Error('Enter the applicant name to continue.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.applicantEmail.trim())) throw new Error('Enter a valid email address.');
    if (!state.moveInDate) throw new Error('Choose a preferred move-in date.');
    assertApplicationTransition(state.applicationStatus, 'submitted');
    return addNotification({ ...state, applicationStatus: 'submitted', stage: 'screening' }, 'Application recorded locally', 'Your local application details are ready for the screening-status step.');
  }

  if (action.type === 'complete_screening') {
    if (state.stage !== 'screening') throw new Error('Screening is not the current step.');
    assertApplicationTransition(state.applicationStatus, 'screening');
    assertApplicationTransition('screening', 'under_review');
    return addNotification({ ...state, applicationStatus: 'under_review', screeningComplete: true, stage: 'holding' }, 'Screening step reviewed', 'This is not a screening result or eligibility decision. No screening provider was contacted.');
  }

  if (action.type === 'accept_holding_terms') {
    if (state.stage !== 'holding') throw new Error('Holding terms are not available at this step.');
    if (!state.screeningComplete || state.applicationStatus !== 'under_review') throw new Error('Complete the screening workflow step first.');
    return { ...state, holdingTermsAccepted: true };
  }

  if (action.type === 'complete_holding_step') {
    if (state.stage !== 'holding') throw new Error('The holding terms are not available at this step.');
    if (!state.holdingTermsAccepted) throw new Error('Review the holding terms before continuing.');
    return addNotification({ ...state, holdingStepComplete: true, stage: 'lease' }, 'Holding terms reviewed', 'This did not reserve a home or collect money.');
  }

  if (action.type === 'complete_lease_review') {
    if (state.stage !== 'lease') throw new Error('The lease summary is not available at this step.');
    return addNotification({ ...state, leaseReviewComplete: true, stage: 'deposit' }, 'Lease summary reviewed', 'This did not sign or execute a legal document.');
  }

  if (action.type === 'complete_deposit_step') {
    if (state.stage !== 'deposit') throw new Error('The deposit information is not available at this step.');
    if (!Number.isFinite(action.amount) || action.amount <= 0) throw new Error('Enter a valid informational deposit amount.');
    return addNotification({ ...state, depositStepComplete: true, securityDepositAmount: action.amount, stage: 'move_in' }, 'Deposit information reviewed', 'This did not collect money or establish a deposit.');
  }

  if (action.type === 'toggle_checklist') {
    if (state.stage !== 'move_in' && state.stage !== 'residency') throw new Error('The move-in checklist is not available yet.');
    const checklist = { ...state.checklist, [action.key]: !state.checklist[action.key] };
    const allComplete = TENANT_MOVE_IN_TASKS.every((task) => checklist[task.key]);
    const nextState = { ...state, checklist, stage: allComplete ? 'residency' as const : 'move_in' as const };
    if (allComplete && state.stage !== 'residency') return addNotification(nextState, 'Move-in checklist complete', 'This did not activate a resident account.');
    return nextState;
  }

  if (action.type === 'submit_maintenance_request') {
    if (state.stage !== 'residency') throw new Error('Maintenance requests are available after move-in.');
    if (!action.category.trim()) throw new Error('Choose a maintenance category.');
    if (!action.description.trim() || action.description.trim().length > 500) throw new Error('Enter a request description of 1 to 500 characters.');
    return addNotification({
      ...state,
      stage: 'maintenance',
      maintenanceCategory: action.category,
      maintenanceDescription: action.description.trim(),
      maintenanceStatus: 'submitted'
    }, 'Maintenance request recorded locally', 'No work order was sent to a maintenance team.');
  }

  if (action.type === 'complete_maintenance_request') {
    if (state.stage !== 'maintenance' || state.maintenanceStatus !== 'submitted') throw new Error('There is no open request to complete.');
    return addNotification({ ...state, maintenanceStatus: 'completed', stage: 'renewal' }, 'Maintenance status updated', 'No vendor was contacted and no work order was completed.');
  }

  if (action.type === 'respond_to_renewal') {
    if (state.stage !== 'renewal') throw new Error('The renewal response is not available at this step.');
    const stage = action.decision === 'accepted' ? 'complete' : 'move_out';
    const message = action.decision === 'accepted'
      ? 'The renewal was recorded locally; a real renewal requires the approved lease provider.'
      : 'The move-out steps are now available in this local workflow.';
    return addNotification({ ...state, renewalDecision: action.decision, stage }, `Renewal ${action.decision}`, message);
  }

  if (action.type === 'submit_move_out_notice') {
    if (state.stage !== 'move_out') throw new Error('Move-out notice is not available at this step.');
    if (!action.noticeDate) throw new Error('Choose a sample move-out date.');
    return addNotification({ ...state, moveOutNoticeDate: action.noticeDate }, 'Move-out date recorded locally', 'No official move-out notice was sent.');
  }

  if (action.type === 'toggle_move_out_checklist') {
    if (state.stage !== 'move_out' || !state.moveOutNoticeDate) throw new Error('Record the sample move-out notice first.');
    const moveOutChecklist = { ...state.moveOutChecklist, [action.key]: !state.moveOutChecklist[action.key] };
    const allComplete = TENANT_MOVE_OUT_TASKS.every((task) => moveOutChecklist[task.key]);
    const nextState = { ...state, moveOutChecklist, stage: allComplete ? 'deposit_disposition' as const : 'move_out' as const };
    if (allComplete) return addNotification(nextState, 'Move-out checklist complete', 'Review the deposit disposition details.');
    return nextState;
  }

  if (action.type === 'finalize_deposit_disposition') {
    if (state.stage !== 'deposit_disposition') throw new Error('Complete the move-out checklist first.');
    const amounts = [state.securityDepositAmount, action.refundAmount, action.retainedAmount];
    if (amounts.some((amount) => !Number.isFinite(amount) || amount < 0)) throw new Error('Disposition amounts must be non-negative.');
    if (Math.round((action.refundAmount + action.retainedAmount) * 100) !== Math.round(state.securityDepositAmount * 100)) {
      throw new Error('Refund and retained amounts must reconcile to the informational deposit.');
    }
    return addNotification({
      ...state,
      depositRefundAmount: action.refundAmount,
      depositRetainedAmount: action.retainedAmount,
      stage: 'complete'
    }, 'Deposit disposition recorded locally', `Recorded refund amount: $${action.refundAmount.toFixed(2)}; retained amount: $${action.retainedAmount.toFixed(2)}. No money was moved.`);
  }

  return state;
}