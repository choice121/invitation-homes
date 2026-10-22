import { supabaseClient } from '../lib/supabaseClient';

export interface ManualPaymentRecord {
  id: string;
  applicationId: string;
  paymentType: 'application_fee' | 'holding_deposit' | 'first_month_rent' | 'pet_fee';
  method: 'Zelle' | 'Venmo' | 'Cash App' | 'Credit Card' | 'ACH Transfer' | 'Cashier Check' | 'Other';
  handle?: string;
  referenceCode: string;
  amount: number;
  status: 'pending' | 'verified' | 'waived' | 'refunded';
  verifiedBy: string;
  notes?: string;
  createdAt: string;
}

export interface LeaseAgreement {
  id: string;
  applicationId?: string;
  propertyId: string;
  propertyAddress: string;
  tenantName: string;
  tenantEmail: string;
  monthlyRent: number;
  securityDeposit: number;
  leaseTermMonths: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'sent_to_tenant' | 'tenant_signed' | 'countersigned' | 'active' | 'terminated';
  tenantSignedAt?: string;
  countersignedAt?: string;
  createdAt: string;
}

export interface InspectionRoomItem {
  name: string;
  condition: 'excellent' | 'good' | 'fair' | 'damaged';
  notes: string;
  photosCount: number;
}

export interface PropertyInspection {
  id: string;
  propertyId: string;
  propertyAddress: string;
  tenantName: string;
  tenantEmail: string;
  type: 'move_in' | 'move_out' | 'routine';
  inspectionDate: string;
  checklist: InspectionRoomItem[];
  overallCondition: 'excellent' | 'good' | 'fair' | 'needs_attention';
  notes?: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'signed';
  createdAt: string;
}

export interface AuditEventLog {
  id: string;
  entityType: 'application' | 'payment' | 'lease' | 'inspection' | 'listing_staging';
  entityId: string;
  action: string;
  actorRole: string;
  actorId: string;
  metadata: Record<string, any>;
  createdAt: string;
}

// In-memory seeds for smooth operation
let paymentRecordsStore: ManualPaymentRecord[] = [
  {
    id: 'pay-202610-01',
    applicationId: 'app-pilot-102',
    paymentType: 'application_fee',
    method: 'Venmo',
    handle: '@schen-tx',
    referenceCode: 'VENMO-TX-88492',
    amount: 55,
    status: 'verified',
    verifiedBy: 'Carol Taylor (Staff)',
    notes: 'Verified via Venmo business incoming transactions ledger.',
    createdAt: '2026-10-20T18:35:00.000Z'
  },
  {
    id: 'pay-202610-02',
    applicationId: 'app-pilot-103',
    paymentType: 'application_fee',
    method: 'Cash App',
    handle: '$davidrod-az',
    referenceCode: 'CASH-AZ-33019',
    amount: 55,
    status: 'verified',
    verifiedBy: 'Marcus Sterling (Staff)',
    notes: 'Confirmed payment receipt screenshot from applicant.',
    createdAt: '2026-10-19T14:15:00.000Z'
  }
];

let leaseAgreementsStore: LeaseAgreement[] = [
  {
    id: 'lease-202610-101',
    applicationId: 'app-pilot-102',
    propertyId: 'coppell-tx-782',
    propertyAddress: '782 Sandy Lake Rd, Coppell, TX 75019',
    tenantName: 'Sarah Chen',
    tenantEmail: 'schen@example.test',
    monthlyRent: 2495,
    securityDeposit: 2495,
    leaseTermMonths: 12,
    startDate: '2026-12-01',
    endDate: '2027-11-30',
    status: 'countersigned',
    tenantSignedAt: '2026-10-21T09:20:00.000Z',
    countersignedAt: '2026-10-21T11:45:00.000Z',
    createdAt: '2026-10-20T20:00:00.000Z'
  },
  {
    id: 'lease-202610-102',
    applicationId: 'app-pilot-101',
    propertyId: 'marietta-ga-1420',
    propertyAddress: '1420 Roswell Rd, Marietta, GA 30062',
    tenantName: 'Marcus Vance',
    tenantEmail: 'm.vance@example.test',
    monthlyRent: 2150,
    securityDeposit: 2150,
    leaseTermMonths: 24,
    startDate: '2026-11-15',
    endDate: '2028-11-14',
    status: 'sent_to_tenant',
    createdAt: '2026-10-21T06:00:00.000Z'
  }
];

let inspectionsStore: PropertyInspection[] = [
  {
    id: 'insp-202610-001',
    propertyId: 'coppell-tx-782',
    propertyAddress: '782 Sandy Lake Rd, Coppell, TX 75019',
    tenantName: 'Sarah Chen',
    tenantEmail: 'schen@example.test',
    type: 'move_in',
    inspectionDate: '2026-10-21',
    checklist: [
      { name: 'Front Entrance & Smart Lock', condition: 'excellent', notes: 'Smart lock keypad operating properly with fresh batteries.', photosCount: 2 },
      { name: 'Kitchen & Modern Appliances', condition: 'excellent', notes: 'Stainless refrigerator, range, and dishwasher verified clean.', photosCount: 3 },
      { name: 'Living Room & Windows', condition: 'good', notes: 'Blinds in working order, small scuff on baseboard near outlet.', photosCount: 1 },
      { name: 'Primary Bedroom & Bath', condition: 'excellent', notes: 'Plumbing fixtures tested, excellent water pressure.', photosCount: 2 },
      { name: 'HVAC & Air Filter Unit', condition: 'good', notes: 'New MERV 11 filter installed per Lease Easy standard.', photosCount: 1 },
      { name: 'Backyard & Fencing', condition: 'good', notes: 'Fully fenced enclosure intact for pets.', photosCount: 2 }
    ],
    overallCondition: 'excellent',
    notes: 'Pre-move-in inspection completed. Property ready for tenant key handover.',
    status: 'reviewed',
    createdAt: '2026-10-21T12:00:00.000Z'
  }
];

let auditLogsStore: AuditEventLog[] = [
  {
    id: 'audit-001',
    entityType: 'payment',
    entityId: 'pay-202610-01',
    action: 'RECORD_MANUAL_PAYMENT',
    actorRole: 'leasing_specialist',
    actorId: 'carol.taylor@invitationhomes.com',
    metadata: { method: 'Venmo', amount: 55, reference: 'VENMO-TX-88492' },
    createdAt: '2026-10-20T18:35:00.000Z'
  },
  {
    id: 'audit-002',
    entityType: 'application',
    entityId: 'app-pilot-102',
    action: 'STATUS_CHANGED_TO_SCREENING',
    actorRole: 'leasing_specialist',
    actorId: 'carol.taylor@invitationhomes.com',
    metadata: { previousStatus: 'submitted', newStatus: 'screening' },
    createdAt: '2026-10-20T18:40:00.000Z'
  },
  {
    id: 'audit-003',
    entityType: 'lease',
    entityId: 'lease-202610-101',
    action: 'COUNTERSIGN_LEASE',
    actorRole: 'property_manager',
    actorId: 'operations@invitationhomes.com',
    metadata: { propertySlug: 'coppell-tx-782', tenant: 'Sarah Chen' },
    createdAt: '2026-10-21T11:45:00.000Z'
  }
];

export async function logAuditEvent(
  entityType: AuditEventLog['entityType'],
  entityId: string,
  action: string,
  metadata: Record<string, any> = {},
  actorRole: string = 'staff',
  actorId: string = 'staff_console'
): Promise<AuditEventLog> {
  const event: AuditEventLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    entityType,
    entityId,
    action,
    actorRole,
    actorId,
    metadata,
    createdAt: new Date().toISOString()
  };

  auditLogsStore.unshift(event);
  if (supabaseClient) {
    try {
      await supabaseClient.from('audit_event_logs').insert({
        id: event.id,
        entity_type: event.entityType,
        entity_id: event.entityId,
        action: event.action,
        actor_role: event.actorRole,
        actor_id: event.actorId,
        metadata: event.metadata
      });
    } catch (e) {
      // In-memory fallback
    }
  }
  return event;
}

export async function getAuditLogs(): Promise<AuditEventLog[]> {
  return [...auditLogsStore];
}

export async function recordManualPayment(
  applicationId: string,
  data: Omit<ManualPaymentRecord, 'id' | 'applicationId' | 'createdAt'>
): Promise<ManualPaymentRecord> {
  const newRecord: ManualPaymentRecord = {
    ...data,
    id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    applicationId,
    createdAt: new Date().toISOString()
  };

  paymentRecordsStore.unshift(newRecord);

  if (supabaseClient) {
    try {
      await supabaseClient.from('manual_payment_records').insert({
        id: newRecord.id,
        application_id: newRecord.applicationId,
        payment_type: newRecord.paymentType,
        method: newRecord.method,
        handle: newRecord.handle,
        reference_code: newRecord.referenceCode,
        amount: newRecord.amount,
        status: newRecord.status,
        verified_by: newRecord.verifiedBy,
        notes: newRecord.notes
      });
    } catch (e) {
      console.warn('Supabase record payment warning:', e);
    }
  }

  await logAuditEvent('payment', newRecord.id, 'RECORD_MANUAL_PAYMENT', {
    applicationId,
    method: newRecord.method,
    amount: newRecord.amount,
    reference: newRecord.referenceCode
  });

  return newRecord;
}

export async function getPaymentRecords(applicationId?: string): Promise<ManualPaymentRecord[]> {
  if (applicationId) {
    return paymentRecordsStore.filter((p) => p.applicationId === applicationId);
  }
  return [...paymentRecordsStore];
}

export async function getLeaseAgreements(tenantEmail?: string): Promise<LeaseAgreement[]> {
  if (tenantEmail) {
    return leaseAgreementsStore.filter((l) => l.tenantEmail.toLowerCase() === tenantEmail.toLowerCase());
  }
  return [...leaseAgreementsStore];
}

export async function createLeaseAgreement(data: Omit<LeaseAgreement, 'id' | 'createdAt' | 'status'>): Promise<LeaseAgreement> {
  const newLease: LeaseAgreement = {
    ...data,
    id: `lease-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status: 'sent_to_tenant',
    createdAt: new Date().toISOString()
  };

  leaseAgreementsStore.unshift(newLease);
  await logAuditEvent('lease', newLease.id, 'CREATE_LEASE_AGREEMENT', {
    propertyAddress: newLease.propertyAddress,
    tenant: newLease.tenantName,
    rent: newLease.monthlyRent
  });

  return newLease;
}

export async function updateLeaseStatus(id: string, status: LeaseAgreement['status']): Promise<boolean> {
  const lease = leaseAgreementsStore.find((l) => l.id === id);
  if (!lease) return false;

  lease.status = status;
  if (status === 'tenant_signed') lease.tenantSignedAt = new Date().toISOString();
  if (status === 'countersigned') lease.countersignedAt = new Date().toISOString();

  await logAuditEvent('lease', id, `UPDATE_LEASE_STATUS_${status.toUpperCase()}`, {
    tenant: lease.tenantName,
    propertyAddress: lease.propertyAddress
  });
  return true;
}

export async function getInspections(tenantEmail?: string): Promise<PropertyInspection[]> {
  if (tenantEmail) {
    return inspectionsStore.filter((i) => i.tenantEmail.toLowerCase() === tenantEmail.toLowerCase());
  }
  return [...inspectionsStore];
}

export async function submitPropertyInspection(data: Omit<PropertyInspection, 'id' | 'createdAt' | 'status'>): Promise<PropertyInspection> {
  const newInsp: PropertyInspection = {
    ...data,
    id: `insp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status: 'submitted',
    createdAt: new Date().toISOString()
  };

  inspectionsStore.unshift(newInsp);
  await logAuditEvent('inspection', newInsp.id, 'SUBMIT_INSPECTION_CHECKLIST', {
    property: newInsp.propertyAddress,
    tenant: newInsp.tenantName,
    type: newInsp.type,
    itemsCount: newInsp.checklist.length
  });

  return newInsp;
}

export async function reviewInspection(id: string, status: 'reviewed' | 'signed'): Promise<boolean> {
  const insp = inspectionsStore.find((i) => i.id === id);
  if (!insp) return false;
  insp.status = status;

  await logAuditEvent('inspection', id, `INSPECTION_${status.toUpperCase()}`, {
    property: insp.propertyAddress,
    tenant: insp.tenantName
  });
  return true;
}
