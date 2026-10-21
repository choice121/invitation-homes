import { useEffect, useState } from 'react';
import { AlertTriangle, Bell, Check, ChevronRight, RotateCcw } from 'lucide-react';
import { SAMPLE_PROPERTIES } from '../data/properties';
import { PropertyListing } from '../types/rental';
import { getPropertyBySlug } from '../services/propertyRepository';
import {
  createTenantWorkflowState,
  TENANT_MOVE_IN_TASKS,
  TENANT_MOVE_OUT_TASKS,
  TenantWorkflowAction,
  TenantWorkflowState,
  TenantWorkflowStage,
  reduceTenantWorkflowState
} from '../services/tenantWorkflow';
import { OfficialFooter, OfficialHeader } from './OfficialSiteChrome';

const stages: { id: TenantWorkflowStage; label: string }[] = [
  { id: 'application', label: 'Application' },
  { id: 'screening', label: 'Screening' },
  { id: 'holding', label: 'Hold' },
  { id: 'lease', label: 'Lease' },
  { id: 'deposit', label: 'Deposit' },
  { id: 'move_in', label: 'Move-in' },
  { id: 'residency', label: 'Residency' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'renewal', label: 'Renewal' },
  { id: 'move_out', label: 'Move-out' },
  { id: 'deposit_disposition', label: 'Deposit return' },
  { id: 'complete', label: 'Complete' }
];

function loadSavedState(requestedProperty: string): TenantWorkflowState {
  try {
    const saved = sessionStorage.getItem('invitation-homes-tenant-workflow');
    if (saved) {
      const parsed = JSON.parse(saved) as TenantWorkflowState;
      if (parsed.version === 2 && parsed.propertySlug) return parsed;
    }
  } catch {
    // Storage can be unavailable in private browsing; the flow still works in memory.
  }
  const propertySlug = SAMPLE_PROPERTIES.find((home) => home.id === requestedProperty)?.id || requestedProperty || SAMPLE_PROPERTIES[0].id;
  return createTenantWorkflowState(propertySlug);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function isStageComplete(stage: TenantWorkflowStage, flow: TenantWorkflowState): boolean {
  if (stage === 'application') return flow.applicationStatus !== 'draft';
  if (stage === 'screening') return flow.screeningComplete;
  if (stage === 'holding') return flow.holdingStepComplete;
  if (stage === 'lease') return flow.leaseReviewComplete;
  if (stage === 'deposit') return flow.depositStepComplete;
  if (stage === 'move_in') return TENANT_MOVE_IN_TASKS.every((task) => flow.checklist[task.key]);
  if (stage === 'residency') return flow.maintenanceStatus !== 'none';
  if (stage === 'maintenance') return flow.maintenanceStatus === 'completed';
  if (stage === 'renewal') return flow.renewalDecision !== 'pending';
  if (stage === 'move_out') return Boolean(flow.moveOutNoticeDate) && TENANT_MOVE_OUT_TASKS.every((task) => flow.moveOutChecklist[task.key]);
  if (stage === 'deposit_disposition') return flow.depositRefundAmount !== null;
  return false;
}

function LocalModeNotice() {
  return (
    <div role="note" className="flex gap-3 border border-[#d9b55d] bg-[#fff7df] p-4 text-sm leading-6 text-[#493b18]">
      <AlertTriangle size={20} className="mt-0.5 shrink-0" />
      <p><strong>LOCAL-ONLY MODE.</strong> This workflow saves progress in this browser tab. It does not submit an application to Invitation Homes, contact a screening provider, reserve a home, charge or refund money, create or sign a legal lease, submit a maintenance order, send a renewal/move-out notice, or send email/SMS. Do not enter sensitive or payment information.</p>
    </div>
  );
}

function ApplicantStep({ flow, onDispatch, onError }: {
  flow: TenantWorkflowState;
  onDispatch: (action: TenantWorkflowAction) => void;
  onError: (error: string) => void;
}) {
  return (
    <section aria-labelledby="step-title">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#168241]">Step 1</p>
      <h2 id="step-title" className="mt-2 text-2xl font-semibold">Application details</h2>
      <p className="mt-2 text-sm leading-6 text-[#555]">Enter non-sensitive information to preview the application flow. Progress remains in this browser tab and can be cleared at any time.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">Applicant name
          <input autoComplete="name" value={flow.applicantName} onChange={(event) => onDispatch({ type: 'update_applicant', applicantName: event.target.value, applicantEmail: flow.applicantEmail, moveInDate: flow.moveInDate })} className="mt-1 min-h-11 w-full border border-[#cfcfcf] px-3 font-normal" placeholder="Jordan Example" />
        </label>
        <label className="text-sm font-semibold">Email
          <input type="email" autoComplete="email" value={flow.applicantEmail} onChange={(event) => onDispatch({ type: 'update_applicant', applicantName: flow.applicantName, applicantEmail: event.target.value, moveInDate: flow.moveInDate })} className="mt-1 min-h-11 w-full border border-[#cfcfcf] px-3 font-normal" placeholder="you@example.com" />
        </label>
        <label className="text-sm font-semibold sm:col-span-2">Preferred move-in date
          <input type="date" value={flow.moveInDate} onChange={(event) => onDispatch({ type: 'update_applicant', applicantName: flow.applicantName, applicantEmail: flow.applicantEmail, moveInDate: event.target.value })} className="mt-1 min-h-11 w-full border border-[#cfcfcf] px-3 font-normal sm:max-w-xs" />
        </label>
      </div>
      <p className="mt-4 text-xs leading-5 text-[#666]">Do not enter identity documents, Social Security numbers, income records, or payment details in this local-only workflow.</p>
      <button type="button" onClick={() => onDispatch({ type: 'submit_application' })} className="mt-6 inline-flex min-h-12 items-center gap-2 bg-[#168241] px-5 text-sm font-semibold text-white">Continue application<ChevronRight size={16} /></button>
    </section>
  );
}

function ScreeningStep({ onDispatch }: { onDispatch: (action: TenantWorkflowAction) => void }) {
  return (
    <section aria-labelledby="step-title">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#168241]">Step 2</p>
      <h2 id="step-title" className="mt-2 text-2xl font-semibold">Screening status</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#555]">A real screening requires the approved applicant authorization, screening provider, and review process. This local workflow only records that the screening step was reviewed.</p>
      <div className="mt-5 border-l-4 border-[#168241] bg-[#f3f6f1] p-4 text-sm leading-6">No credit report, background check, identity verification, or rental-history check is run. No eligibility decision is made.</div>
      <button type="button" onClick={() => onDispatch({ type: 'complete_screening' })} className="mt-6 min-h-12 bg-[#168241] px-5 text-sm font-semibold text-white">Continue</button>
    </section>
  );
}

function HoldingStep({ flow, onDispatch }: { flow: TenantWorkflowState; onDispatch: (action: TenantWorkflowAction) => void }) {
  return (
    <section aria-labelledby="step-title">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#168241]">Step 3</p>
      <h2 id="step-title" className="mt-2 text-2xl font-semibold">Holding terms</h2>
      <p className="mt-2 text-sm leading-6 text-[#555]">The published fee guide describes a $500 holding fee for applicable Coming Soon homes. This is informational only; the workflow does not verify eligibility, create a reservation, or charge the fee.</p>
      <div className="mt-5 grid gap-3 border-y border-[#dedede] py-4 sm:grid-cols-2">
        <div><p className="text-xs text-[#666]">Illustrative holding amount</p><p className="mt-1 text-xl font-semibold">$500</p></div>
        <div><p className="text-xs text-[#666]">Online charge</p><p className="mt-1 text-xl font-semibold">Not connected</p></div>
      </div>
      <label className="mt-5 flex items-start gap-3 text-sm leading-6"><input type="checkbox" checked={flow.holdingTermsAccepted} onChange={() => onDispatch({ type: 'accept_holding_terms' })} className="mt-1 accent-[#168241]" />I have reviewed the informational terms and understand that accepting here does not reserve this home or create a payment obligation.</label>
      <button type="button" disabled={!flow.holdingTermsAccepted} onClick={() => onDispatch({ type: 'complete_holding_step' })} className="mt-6 min-h-12 bg-[#168241] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Continue</button>
    </section>
  );
}

function LeaseStep({ flow, onDispatch, property }: {
  flow: TenantWorkflowState;
  onDispatch: (action: TenantWorkflowAction) => void;
  property: PropertyListing;
}) {
  return (
    <section aria-labelledby="step-title">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#168241]">Step 4</p>
      <h2 id="step-title" className="mt-2 text-2xl font-semibold">Lease summary</h2>
      <p className="mt-2 text-sm leading-6 text-[#555]">This informational summary is not a property-specific lease, offer, or legal document. An actual lease must be generated from approved terms and executed through the authorized signing process.</p>
      <dl className="mt-5 divide-y divide-[#dedede] border-y border-[#dedede] text-sm">
        <div className="flex justify-between gap-4 py-3"><dt className="text-[#666]">Property</dt><dd className="text-right font-medium">{property.address}, {property.city}</dd></div>
        <div className="flex justify-between gap-4 py-3"><dt className="text-[#666]">Example term</dt><dd className="font-medium">12 months</dd></div>
        <div className="flex justify-between gap-4 py-3"><dt className="text-[#666]">Advertised monthly rent</dt><dd className="font-medium">{formatCurrency(property.monthlyRent)}</dd></div>
        <div className="flex justify-between gap-4 py-3"><dt className="text-[#666]">Preferred move-in</dt><dd className="font-medium">{flow.moveInDate || 'Not selected'}</dd></div>
      </dl>
      <button type="button" onClick={() => onDispatch({ type: 'complete_lease_review' })} className="mt-5 min-h-12 bg-[#168241] px-5 text-sm font-semibold text-white">Continue to deposit information</button>
    </section>
  );
}

function DepositStep({ property, onDispatch }: { property: PropertyListing; onDispatch: (action: TenantWorkflowAction) => void }) {
  const deposit = property.securityDeposit ?? property.monthlyRent;
  return (
    <section aria-labelledby="step-title">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#168241]">Step 5</p>
      <h2 id="step-title" className="mt-2 text-2xl font-semibold">Security deposit and move-in funds</h2>
      <p className="mt-2 text-sm leading-6 text-[#555]">The listing’s deposit value is informational only. Actual amounts, due dates, credits, handling, and refund rules come from the approved property-specific lease and market policy.</p>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-y border-[#dedede] py-5">
        <div><p className="text-xs text-[#666]">Listed security deposit</p><p className="mt-1 text-2xl font-semibold">{formatCurrency(deposit)}</p></div>
        <p className="text-sm font-semibold text-[#168241]">Online payment: not connected</p>
      </div>
      <button type="button" onClick={() => onDispatch({ type: 'complete_deposit_step', amount: deposit })} className="mt-6 min-h-12 bg-[#168241] px-5 text-sm font-semibold text-white">Continue</button>
    </section>
  );
}

function MoveInStep({ flow, onDispatch, complete }: {
  flow: TenantWorkflowState;
  onDispatch: (action: TenantWorkflowAction) => void;
  complete: boolean;
}) {
  return (
    <section aria-labelledby="step-title">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#168241]">{complete ? 'Journey complete' : 'Step 6'}</p>
      <h2 id="step-title" className="mt-2 text-2xl font-semibold">{complete ? 'Resident journey complete' : 'Move-in preparation'}</h2>
      <p className="mt-2 text-sm leading-6 text-[#555]">Review the move-in checklist. Actual utility setup, home condition, access, and resident account activation are not available in local-only mode.</p>
      <ul className="mt-5 divide-y divide-[#dedede] border-y border-[#dedede]">
        {TENANT_MOVE_IN_TASKS.map((task) => <li key={task.key} className="flex min-h-14 items-center gap-3 py-3">
          <input type="checkbox" checked={Boolean(flow.checklist[task.key])} onChange={() => onDispatch({ type: 'toggle_checklist', key: task.key })} className="h-5 w-5 accent-[#168241]" />
          <span className="text-sm">{task.label}</span>
        </li>)}
      </ul>
      {complete && <p className="mt-5 border-l-4 border-[#168241] bg-[#f3f6f1] p-4 text-sm leading-6">This browser session contains the completed workflow state. No resident account or lease record was created on a server.</p>}
    </section>
  );
}

function ResidencyStep({ onDispatch }: { onDispatch: (action: TenantWorkflowAction) => void }) {
  const [category, setCategory] = useState('plumbing');
  const [description, setDescription] = useState('');
  return (
    <section aria-labelledby="step-title">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#168241]">Resident services</p>
      <h2 id="step-title" className="mt-2 text-2xl font-semibold">Request maintenance</h2>
      <p className="mt-2 text-sm leading-6 text-[#555]">This request is saved only in this browser and is not sent to a maintenance team. Do not include sensitive information.</p>
      <label className="mt-5 block max-w-md text-sm font-semibold">Category
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 min-h-11 w-full border border-[#cfcfcf] bg-white px-3 font-normal">
          <option value="plumbing">Plumbing</option><option value="heating_cooling">Heating and cooling</option><option value="electrical">Electrical</option><option value="appliance">Appliance</option><option value="other">Other</option>
        </select>
      </label>
      <label className="mt-4 block text-sm font-semibold">Describe the issue
        <textarea value={description} maxLength={500} onChange={(event) => setDescription(event.target.value)} rows={4} className="mt-1 w-full border border-[#cfcfcf] p-3 font-normal" placeholder="Briefly describe the issue" />
      </label>
      <p className="mt-1 text-right text-xs text-[#777]">{description.length}/500</p>
      <button type="button" onClick={() => onDispatch({ type: 'submit_maintenance_request', category, description })} className="mt-4 min-h-11 bg-[#168241] px-5 text-sm font-semibold text-white">Save request locally</button>
    </section>
  );
}

function MaintenanceStep({ flow, onDispatch }: { flow: TenantWorkflowState; onDispatch: (action: TenantWorkflowAction) => void }) {
  return (
    <section aria-labelledby="step-title">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#168241]">Resident services</p>
      <h2 id="step-title" className="mt-2 text-2xl font-semibold">Maintenance request status</h2>
      <dl className="mt-5 divide-y divide-[#dedede] border-y border-[#dedede] text-sm">
        <div className="flex justify-between gap-4 py-3"><dt className="text-[#666]">Request</dt><dd className="font-medium capitalize">{flow.maintenanceCategory.replaceAll('_', ' ')}</dd></div>
        <div className="flex justify-between gap-4 py-3"><dt className="text-[#666]">Status</dt><dd className="font-medium capitalize">{flow.maintenanceStatus}</dd></div>
        <div className="py-3"><dt className="text-[#666]">Description</dt><dd className="mt-1 font-medium">{flow.maintenanceDescription}</dd></div>
      </dl>
      <p className="mt-4 text-sm leading-6 text-[#555]">A live service request requires the authorized maintenance system and emergency dispatch rules. This record exists only in this browser.</p>
      <button type="button" onClick={() => onDispatch({ type: 'complete_maintenance_request' })} className="mt-5 min-h-11 bg-[#168241] px-5 text-sm font-semibold text-white">Continue workflow</button>
    </section>
  );
}

function RenewalStep({ onDispatch }: { onDispatch: (action: TenantWorkflowAction) => void }) {
  return (
    <section aria-labelledby="step-title">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#168241]">Lease renewal</p>
      <h2 id="step-title" className="mt-2 text-2xl font-semibold">Review renewal options</h2>
      <p className="mt-2 text-sm leading-6 text-[#555]">A real renewal offer requires the approved rent, term, notices, and deadline for the lease and market. No binding offer is available here.</p>
      <div className="mt-5 border-y border-[#dedede] py-4">
        <p className="text-sm font-semibold">Renewal response</p>
        <p className="mt-2 text-sm text-[#666]">Choose a path to continue. Declining continues to move-out and deposit disposition; accepting completes this journey.</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={() => onDispatch({ type: 'respond_to_renewal', decision: 'accepted' })} className="min-h-11 bg-[#168241] px-5 text-sm font-semibold text-white">Record accept</button>
        <button type="button" onClick={() => onDispatch({ type: 'respond_to_renewal', decision: 'declined' })} className="min-h-11 border border-[#555] px-5 text-sm font-semibold">Record decline and continue to move-out</button>
      </div>
    </section>
  );
}

function MoveOutStep({ flow, onDispatch }: { flow: TenantWorkflowState; onDispatch: (action: TenantWorkflowAction) => void }) {
  return (
    <section aria-labelledby="step-title">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#168241]">Move-out</p>
      <h2 id="step-title" className="mt-2 text-2xl font-semibold">Notice and move-out checklist</h2>
      <p className="mt-2 text-sm leading-6 text-[#555]">Required notice period, accepted delivery methods, inspection rules, and deposit deadlines are controlled by the applicable lease and local requirements. This does not send an official notice.</p>
      <label className="mt-5 block max-w-sm text-sm font-semibold">Planned move-out date
        <input type="date" value={flow.moveOutNoticeDate} onChange={(event) => onDispatch({ type: 'submit_move_out_notice', noticeDate: event.target.value })} className="mt-1 min-h-11 w-full border border-[#cfcfcf] px-3 font-normal" />
      </label>
      <ul className="mt-5 divide-y divide-[#dedede] border-y border-[#dedede]">
        {TENANT_MOVE_OUT_TASKS.map((task) => <li key={task.key} className="flex min-h-14 items-center gap-3 py-3">
          <input type="checkbox" checked={Boolean(flow.moveOutChecklist[task.key])} disabled={!flow.moveOutNoticeDate} onChange={() => onDispatch({ type: 'toggle_move_out_checklist', key: task.key })} className="h-5 w-5 accent-[#168241] disabled:opacity-40" />
          <span className="text-sm">{task.label}</span>
        </li>)}
      </ul>
      {flow.moveOutChecklist.forwarding && <p className="mt-3 text-xs leading-5 text-[#666]">No forwarding address was collected or stored.</p>}
    </section>
  );
}

function DepositDispositionStep({ flow, onDispatch }: { flow: TenantWorkflowState; onDispatch: (action: TenantWorkflowAction) => void }) {
  const [refundAmount, setRefundAmount] = useState(String(flow.securityDepositAmount));
  const [retainedAmount, setRetainedAmount] = useState('0');
  const numericRefund = Number(refundAmount);
  const numericRetained = Number(retainedAmount);
  const reconciles = Math.round((numericRefund + numericRetained) * 100) === Math.round(flow.securityDepositAmount * 100);
  return (
    <section aria-labelledby="step-title">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#168241]">Security deposit</p>
      <h2 id="step-title" className="mt-2 text-2xl font-semibold">Deposit disposition</h2>
      <p className="mt-2 text-sm leading-6 text-[#555]">A real disposition needs a compliant, itemized review and timely written notice. No charges or refunds are assessed or issued in this workflow.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <label className="text-sm font-semibold">Original deposit<input readOnly value={formatCurrency(flow.securityDepositAmount)} className="mt-1 min-h-11 w-full border border-[#cfcfcf] bg-[#f5f5f5] px-3 font-normal" /></label>
        <label className="text-sm font-semibold">Sample refund<input type="number" min="0" step="0.01" value={refundAmount} onChange={(event) => setRefundAmount(event.target.value)} className="mt-1 min-h-11 w-full border border-[#cfcfcf] px-3 font-normal" /></label>
        <label className="text-sm font-semibold">Sample retained<input type="number" min="0" step="0.01" value={retainedAmount} onChange={(event) => setRetainedAmount(event.target.value)} className="mt-1 min-h-11 w-full border border-[#cfcfcf] px-3 font-normal" /></label>
      </div>
      <p aria-live="polite" className={`mt-3 text-sm ${reconciles ? 'text-[#168241]' : 'text-[#8a4b00]'}`}>
        {reconciles ? 'Amounts reconcile to the original deposit.' : 'Refund and retained amounts must equal the original deposit.'}
      </p>
      <button type="button" disabled={!reconciles} onClick={() => onDispatch({ type: 'finalize_deposit_disposition', refundAmount: numericRefund, retainedAmount: numericRetained })} className="mt-5 min-h-11 bg-[#168241] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Complete local disposition</button>
    </section>
  );
}

function JourneyCompleteStep() {
  return (
    <section aria-labelledby="step-title">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#168241]">Journey complete</p>
      <h2 id="step-title" className="mt-2 text-2xl font-semibold">Tenant workflow complete</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#555]">The workflow state is saved in this browser tab only. No server account, application, screening file, payment, lease, maintenance order, renewal, or legal notice was created.</p>
    </section>
  );
}

export function TenantWorkflowPortal() {
  const requestedProperty = new URLSearchParams(window.location.search).get('property') ?? '';
  const [flow, setFlow] = useState(() => loadSavedState(requestedProperty));
  const [error, setError] = useState('');
  const [storageWarning, setStorageWarning] = useState(false);
  const [property, setProperty] = useState<PropertyListing | null>(() => SAMPLE_PROPERTIES.find((home) => home.id === flow.propertySlug) ?? null);
  const [propertyLoading, setPropertyLoading] = useState(!SAMPLE_PROPERTIES.some((home) => home.id === flow.propertySlug));
  const [propertyError, setPropertyError] = useState('');
  const stageIndex = stages.findIndex((stage) => stage.id === flow.stage);

  useEffect(() => {
    let active = true;
    const fixture = SAMPLE_PROPERTIES.find((home) => home.id === flow.propertySlug);
    if (fixture) {
      setProperty(fixture);
      setPropertyLoading(false);
      setPropertyError('');
      return () => { active = false; };
    }

    setPropertyLoading(true);
    getPropertyBySlug(flow.propertySlug)
      .then((listing) => {
        if (!active) return;
        setProperty(listing);
        setPropertyError(listing ? '' : 'This property is not available in the current listing source.');
      })
      .catch(() => {
        if (active) {
          setProperty(null);
          setPropertyError('Property details could not be loaded.');
        }
      })
      .finally(() => { if (active) setPropertyLoading(false); });

    return () => { active = false; };
  }, [flow.propertySlug]);

  useEffect(() => {
    try {
      sessionStorage.setItem('invitation-homes-tenant-workflow', JSON.stringify(flow));
      setStorageWarning(false);
    } catch {
      setStorageWarning(true);
    }
  }, [flow]);

  function dispatch(action: TenantWorkflowAction) {
    try {
      setFlow((current) => reduceTenantWorkflowState(current, action));
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'This step could not be completed.');
    }
  }

  function resetFlow() {
    try {
      sessionStorage.removeItem('invitation-homes-tenant-workflow');
    } catch {
      setStorageWarning(true);
    }
    setFlow(createTenantWorkflowState(property?.id ?? SAMPLE_PROPERTIES[0].id));
    setError('');
  }

  function selectProperty(nextProperty: PropertyListing) {
    setProperty(nextProperty);
    setPropertyLoading(false);
    setPropertyError('');
    setFlow(createTenantWorkflowState(nextProperty.id));
    setError('');
    const url = new URL(window.location.href);
    url.searchParams.set('property', nextProperty.id);
    window.history.replaceState(null, '', url);
  }

  if (propertyLoading) {
    return <><OfficialHeader /><main className="mx-auto min-h-[60vh] max-w-[1200px] px-4 py-12 sm:px-8" aria-live="polite">Loading property details...</main><OfficialFooter /></>;
  }

  if (!property) {
    return <><OfficialHeader /><main className="mx-auto min-h-[60vh] max-w-[1200px] px-4 py-12 sm:px-8"><h1 className="text-2xl font-semibold">Tenant workflow unavailable</h1><p className="mt-3 text-sm text-[#555]">{propertyError || 'Select a currently available property to continue.'}</p><a href="/search/houses-for-rent" className="mt-5 inline-flex min-h-11 items-center bg-[#168241] px-5 text-sm font-semibold text-white">Search homes</a></main><OfficialFooter /></>;
  }

  return (
    <>
      <OfficialHeader />
      <main className="min-h-[70vh] bg-white">
        <section className="border-b border-[#dfe5dc] bg-[#f3f6f1] px-4 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto max-w-[1200px]">
            <p className="text-xs font-bold uppercase tracking-wide text-[#168241]">Tenant workflow · Local-only mode</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <div><h1 className="text-3xl font-semibold">Tenant application and resident services</h1><p className="mt-2 text-sm text-[#555]">Application, screening, holding, lease, move-in, residency, renewal, and move-out workflow.</p></div>
              <button type="button" onClick={resetFlow} className="inline-flex min-h-10 items-center gap-2 border border-[#999] px-3 text-sm font-semibold"><RotateCcw size={15} />Clear local workflow</button>
            </div>
          </div>
        </section>
        <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-8 sm:py-8">
          <LocalModeNotice />
          {storageWarning && <p role="status" className="mt-3 text-sm text-[#7a4a00]">Session storage is unavailable; progress will remain only until this page is closed.</p>}
          <div className="mt-6 overflow-x-auto pb-2">
            <ol aria-label="Tenant workflow steps" className="flex min-w-[1120px] items-center">
              {stages.map((stage, index) => {
                const completeStep = isStageComplete(stage.id, flow);
                const activeStep = index === stageIndex;
                return <li key={stage.id} aria-current={activeStep ? 'step' : undefined} className="flex flex-1 items-center last:flex-none">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${completeStep ? 'border-[#168241] bg-[#168241] text-white' : activeStep ? 'border-[#168241] text-[#168241]' : 'border-[#cfcfcf] text-[#666]'}`}>{completeStep ? <Check size={15} /> : index + 1}</span>
                    <span className={`text-xs font-semibold ${activeStep ? 'text-[#168241]' : 'text-[#555]'}`}>{stage.label}</span>
                  </div>
                  {index < stages.length - 1 && <span aria-hidden="true" className="mx-3 h-px flex-1 bg-[#d7d7d7]" />}
                </li>;
              })}
            </ol>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0 border-t-2 border-[#168241] pt-6">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[#dedede] pb-4">
                <div><p className="text-xs text-[#666]">Selected property</p><h2 className="mt-1 text-base font-semibold">{property.address}, {property.city}, {property.state}</h2></div>
                <label className="text-xs font-semibold text-[#555]">Change property
                  <select value={property.id} onChange={(event) => {
                    const next = SAMPLE_PROPERTIES.find((home) => home.id === event.target.value);
                    if (next) selectProperty(next);
                  }} className="mt-1 block min-h-10 max-w-full border border-[#cfcfcf] bg-white px-2 text-sm font-normal">
                    {SAMPLE_PROPERTIES.map((home) => <option key={home.id} value={home.id}>{home.address}, {home.city}</option>)}
                  </select>
                </label>
              </div>
              {error && <p role="alert" className="mb-5 border-l-4 border-[#a33] bg-[#fff2f2] p-3 text-sm text-[#822]">{error}</p>}
              {flow.stage === 'application' && <ApplicantStep flow={flow} onDispatch={dispatch} onError={setError} />}
              {flow.stage === 'screening' && <ScreeningStep onDispatch={dispatch} />}
              {flow.stage === 'holding' && <HoldingStep flow={flow} onDispatch={dispatch} />}
              {flow.stage === 'lease' && <LeaseStep flow={flow} onDispatch={dispatch} property={property} />}
              {flow.stage === 'deposit' && <DepositStep property={property} onDispatch={dispatch} />}
              {flow.stage === 'move_in' && <MoveInStep flow={flow} onDispatch={dispatch} complete={false} />}
              {flow.stage === 'residency' && <ResidencyStep onDispatch={dispatch} />}
              {flow.stage === 'maintenance' && <MaintenanceStep flow={flow} onDispatch={dispatch} />}
              {flow.stage === 'renewal' && <RenewalStep onDispatch={dispatch} />}
              {flow.stage === 'move_out' && <MoveOutStep flow={flow} onDispatch={dispatch} />}
              {flow.stage === 'deposit_disposition' && <DepositDispositionStep flow={flow} onDispatch={dispatch} />}
              {flow.stage === 'complete' && <JourneyCompleteStep />}
            </div>

            <aside className="space-y-6">
              <section className="border border-[#dedede] p-4">
                <h2 className="text-sm font-semibold">Application status</h2>
                <dl className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between gap-3"><dt className="text-[#666]">Status</dt><dd className="font-semibold capitalize">{flow.applicationStatus.replaceAll('_', ' ')}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-[#666]">Monthly rent</dt><dd className="font-semibold">{formatCurrency(property.monthlyRent)}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-[#666]">Applicant</dt><dd className="max-w-[170px] truncate font-semibold">{flow.applicantName || 'Not started'}</dd></div>
                </dl>
              </section>
              <section className="border border-[#dedede] p-4">
                <div className="flex items-center gap-2"><Bell size={16} className="text-[#168241]" /><h2 className="text-sm font-semibold">Activity and notifications</h2></div>
                {flow.notifications.length ? <ol className="mt-3 space-y-4">
                  {flow.notifications.map((notice) => <li key={notice.id} className="border-l-2 border-[#cfe0ca] pl-3">
                    <p className="text-xs font-semibold">{notice.title}</p><p className="mt-1 text-xs leading-5 text-[#666]">{notice.message}</p><time className="mt-1 block text-[10px] text-[#888]">{new Date(notice.createdAt).toLocaleString()}</time>
                  </li>)}
                </ol> : <p className="mt-3 text-xs leading-5 text-[#666]">Milestone updates will appear here. No email or SMS is sent.</p>}
              </section>
              <p className="text-xs leading-5 text-[#777]">Workflow state is stored in this browser tab only. Clear it at any time.</p>
            </aside>
          </div>
        </div>
      </main>
      <OfficialFooter />
    </>
  );
}
