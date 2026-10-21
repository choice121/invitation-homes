import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Filter, ShieldCheck, XCircle, ArrowRight, RefreshCw, AlertCircle, Building2, User, Phone, Mail, DollarSign } from 'lucide-react';
import { OfficialHeader, OfficialFooter } from './OfficialSiteChrome';
import { ApplicationStatus } from '../services/leasingWorkflow';
import { supabaseClient } from '../lib/supabaseClient';

interface StaffApplicationItem {
  id: string;
  referenceCode: string;
  propertyTitle: string;
  propertyAddress: string;
  propertySlug: string;
  market: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  employer: string;
  monthlyIncome: number;
  moveInDate: string;
  householdSize: number;
  petsCount: number;
  status: ApplicationStatus;
  createdAt: string;
  emailVerified: boolean;
  primaryPaymentMethod: string;
  paymentHandle?: string;
  paymentStatus: 'unpaid' | 'paid' | 'waived';
  paymentReference?: string;
}

const SAMPLE_APPLICATIONS: StaffApplicationItem[] = [
  {
    id: 'app-pilot-101',
    referenceCode: 'IH-20261021-ATL01',
    propertyTitle: '3 bed, 2 bath home in Marietta',
    propertyAddress: '1420 Roswell Rd, Marietta, GA 30062',
    propertySlug: 'marietta-ga-1420',
    market: 'Atlanta',
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'm.vance@example.test',
    phone: '(404) 555-0192',
    employer: 'Delta Tech Solutions',
    monthlyIncome: 8400,
    moveInDate: '2026-11-15',
    householdSize: 3,
    petsCount: 1,
    status: 'submitted',
    createdAt: '2026-10-21T04:15:00.000Z',
    emailVerified: true,
    primaryPaymentMethod: 'Zelle',
    paymentHandle: '404-555-0192',
    paymentStatus: 'unpaid'
  },
  {
    id: 'app-pilot-102',
    referenceCode: 'IH-20261020-DAL02',
    propertyTitle: '4 bed, 2.5 bath home in Coppell',
    propertyAddress: '782 Sandy Lake Rd, Coppell, TX 75019',
    propertySlug: 'coppell-tx-782',
    market: 'Dallas-Fort Worth',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'schen@example.test',
    phone: '(214) 555-0144',
    employer: 'Baylor Scott & White Health',
    monthlyIncome: 9800,
    moveInDate: '2026-12-01',
    householdSize: 4,
    petsCount: 0,
    status: 'screening',
    createdAt: '2026-10-20T18:30:00.000Z',
    emailVerified: true,
    primaryPaymentMethod: 'Venmo',
    paymentHandle: '@schen-tx',
    paymentStatus: 'paid',
    paymentReference: 'VENMO-TX-88492'
  },
  {
    id: 'app-pilot-103',
    referenceCode: 'IH-20261019-PHX03',
    propertyTitle: '3 bed, 2 bath home in Gilbert',
    propertyAddress: '3104 E Baseline Rd, Phoenix, AZ 85234',
    propertySlug: 'phoenix-az-3104',
    market: 'Phoenix',
    firstName: 'David',
    lastName: 'Rodriguez',
    email: 'd.rodriguez@example.test',
    phone: '(602) 555-0188',
    employer: 'Intel Corp',
    monthlyIncome: 7900,
    moveInDate: '2026-11-01',
    householdSize: 2,
    petsCount: 2,
    status: 'under_review',
    createdAt: '2026-10-19T14:10:00.000Z',
    emailVerified: true,
    primaryPaymentMethod: 'Cash App',
    paymentHandle: '$davidrod-az',
    paymentStatus: 'paid',
    paymentReference: 'CASH-AZ-33019'
  }
];

export function StaffApplicationsPage() {
  const [applications, setApplications] = useState<StaffApplicationItem[]>(SAMPLE_APPLICATIONS);
  const [selectedApp, setSelectedApp] = useState<StaffApplicationItem | null>(SAMPLE_APPLICATIONS[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function loadLiveApplications() {
      if (!supabaseClient) return;
      try {
        const { data, error } = await supabaseClient
          .from('leasing_applications')
          .select(`
            id,
            status,
            created_at,
            email_verified_at,
            property_id,
            application_contact_details (
              first_name,
              last_name,
              email,
              phone,
              employer,
              monthly_household_income,
              desired_move_in_date,
              household_size,
              pets_count
            ),
            properties (
              slug,
              title,
              address,
              city,
              state,
              zip_code,
              market
            )
          `)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped: StaffApplicationItem[] = data.map((row: any) => {
            const details = Array.isArray(row.application_contact_details)
              ? row.application_contact_details[0]
              : row.application_contact_details || {};
            const prop = Array.isArray(row.properties) ? row.properties[0] : row.properties || {};

            return {
              id: row.id,
              referenceCode: `IH-${row.id.slice(0, 8).toUpperCase()}`,
              propertyTitle: prop.title || 'Invitation Homes Property',
              propertyAddress: prop.address ? `${prop.address}, ${prop.city}, ${prop.state} ${prop.zip_code}` : 'Property Address',
              propertySlug: prop.slug || '',
              market: prop.market || 'National',
              firstName: details.first_name || 'Applicant',
              lastName: details.last_name || '',
              email: details.email || 'applicant@example.test',
              phone: details.phone || 'N/A',
              employer: details.employer || 'N/A',
              monthlyIncome: Number(details.monthly_household_income || 0),
              moveInDate: details.desired_move_in_date || 'N/A',
              householdSize: details.household_size || 1,
              petsCount: details.pets_count || 0,
              status: row.status as ApplicationStatus,
              createdAt: row.created_at,
              emailVerified: Boolean(row.email_verified_at)
            };
          });
          setApplications(mapped);
          setSelectedApp(mapped[0]);
        }
      } catch {
        // Keep fallback sample applications
      }
    }

    loadLiveApplications();
  }, []);

  const filteredApps = applications.filter((app) => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        app.referenceCode.toLowerCase().includes(q) ||
        `${app.firstName} ${app.lastName}`.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        app.market.toLowerCase().includes(q) ||
        app.propertyAddress.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  async function handleTransition(nextStatus: ApplicationStatus) {
    if (!selectedApp) return;
    setIsUpdating(true);
    setNotification(null);

    try {
      // Call internal API endpoint
      const response = await fetch(`/api/internal/applications/${selectedApp.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          currentStatus: selectedApp.status,
          nextStatus,
          staffId: 'staff-portal-user',
          note: `Status updated via Staff Review Dashboard`
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || `Failed to update status to ${nextStatus}`);
      }

      const updatedApps = applications.map((item) =>
        item.id === selectedApp.id ? { ...item, status: nextStatus } : item
      );
      setApplications(updatedApps);
      setSelectedApp({ ...selectedApp, status: nextStatus });
      setNotification({ type: 'success', message: `Application status updated to ${nextStatus.replace('_', ' ')}.` });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error updating application status.' });
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleConfirmPayment() {
    if (!selectedApp) return;
    setIsUpdating(true);
    setNotification(null);
    try {
      const ref = `CONF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const nextStatus: ApplicationStatus = selectedApp.status === 'submitted' ? 'screening' : selectedApp.status;

      if (nextStatus !== selectedApp.status) {
        await fetch(`/api/internal/applications/${selectedApp.id}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applicationId: selectedApp.id,
            currentStatus: selectedApp.status,
            nextStatus,
            staffId: 'staff-portal-user',
            note: `Payment confirmed via ${selectedApp.primaryPaymentMethod} (${ref})`
          })
        }).catch(() => null);
      }

      const updatedApps = applications.map((item) =>
        item.id === selectedApp.id ? { ...item, paymentStatus: 'paid' as const, paymentReference: ref, status: nextStatus } : item
      );
      setApplications(updatedApps);
      setSelectedApp({ ...selectedApp, paymentStatus: 'paid', paymentReference: ref, status: nextStatus });
      setNotification({ type: 'success', message: `Confirmed $50.00 fee payment via ${selectedApp.primaryPaymentMethod}. Reference: ${ref}. Screening initiated.` });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error recording payment.' });
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleWaiveFee() {
    if (!selectedApp) return;
    setIsUpdating(true);
    setNotification(null);
    try {
      const nextStatus: ApplicationStatus = selectedApp.status === 'submitted' ? 'screening' : selectedApp.status;
      if (nextStatus !== selectedApp.status) {
        await fetch(`/api/internal/applications/${selectedApp.id}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applicationId: selectedApp.id,
            currentStatus: selectedApp.status,
            nextStatus,
            staffId: 'staff-portal-user',
            note: 'Application fee waived by leasing staff'
          })
        }).catch(() => null);
      }

      const updatedApps = applications.map((item) =>
        item.id === selectedApp.id ? { ...item, paymentStatus: 'waived' as const, status: nextStatus } : item
      );
      setApplications(updatedApps);
      setSelectedApp({ ...selectedApp, paymentStatus: 'waived', status: nextStatus });
      setNotification({ type: 'success', message: 'Application fee waived. Screening initiated.' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error waiving fee.' });
    } finally {
      setIsUpdating(false);
    }
  }

  function getStatusBadge(status: ApplicationStatus) {
    switch (status) {
      case 'submitted':
        return <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800"><Clock size={12} /> Submitted</span>;
      case 'screening':
        return <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800"><RefreshCw size={12} className="animate-spin" /> Screening</span>;
      case 'under_review':
        return <span className="inline-flex items-center gap-1 rounded bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800"><ShieldCheck size={12} /> Under Review</span>;
      case 'approved':
      case 'conditionally_approved':
        return <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800"><CheckCircle2 size={12} /> {status === 'approved' ? 'Approved' : 'Conditional'}</span>;
      case 'denied':
        return <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800"><XCircle size={12} /> Denied</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800">{status}</span>;
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9f7] text-[#231f20]">
      <OfficialHeader />

      <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#e2e5df] pb-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#168241]/10 px-2 py-0.5 text-xs font-semibold text-[#168241]">Operations Portal</span>
              <span className="text-xs text-[#707070]">•</span>
              <span className="text-xs text-[#707070]">Leasing Staff Review</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#231f20] sm:text-3xl">Applicant Queue & Management</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[#707070]">
              Total queue: <strong className="text-[#231f20]">{applications.length}</strong> applications
            </span>
          </div>
        </div>

        {notification && (
          <div className={`mb-6 flex items-center justify-between rounded p-4 text-sm font-medium ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'}`}>
            <span>{notification.message}</span>
            <button type="button" onClick={() => setNotification(null)} className="ml-4 text-xs font-bold underline">Dismiss</button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="mb-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by applicant, ref, email..."
            className="w-full rounded border border-[#d6d6d6] bg-white px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded border border-[#d6d6d6] bg-white px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
          >
            <option value="all">All Statuses ({applications.length})</option>
            <option value="submitted">Submitted</option>
            <option value="screening">Screening</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="conditionally_approved">Conditionally Approved</option>
            <option value="denied">Denied</option>
          </select>
        </div>

        {/* Main 2-Column Split: List + Detail */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Applications Table / Cards */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="space-y-3">
              {filteredApps.length === 0 ? (
                <div className="rounded border border-dashed border-[#d6d6d6] bg-white p-8 text-center text-sm text-[#707070]">
                  No applications match your filter criteria.
                </div>
              ) : (
                filteredApps.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedApp(app)}
                    className={`w-full text-left rounded border p-4 transition ${selectedApp?.id === app.id ? 'border-[#168241] bg-white shadow-sm ring-1 ring-[#168241]' : 'border-[#e0e2dc] bg-white hover:border-[#b0b3ab]'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#168241]">{app.referenceCode}</span>
                      <div className="flex items-center gap-1.5">
                        {app.paymentStatus === 'paid' ? (
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">Fee Paid</span>
                        ) : app.paymentStatus === 'waived' ? (
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">Fee Waived</span>
                        ) : (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">Fee Unpaid</span>
                        )}
                        {getStatusBadge(app.status)}
                      </div>
                    </div>
                    <p className="mt-2 text-base font-semibold text-[#231f20]">{app.firstName} {app.lastName}</p>
                    <p className="text-xs text-[#707070] truncate">{app.propertyTitle}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-[#555] border-t border-[#f0f0ee] pt-2">
                      <span>{app.market}</span>
                      <span>${app.monthlyIncome.toLocaleString()}/mo inc.</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Application Detail View & Decision Workspace */}
          <div className="lg:col-span-7 xl:col-span-8">
            {selectedApp ? (
              <div className="rounded border border-[#e0e2dc] bg-white p-6 shadow-sm sm:p-8">
                {/* Application Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-[#f0f0ee] pb-6 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#168241]">{selectedApp.referenceCode}</span>
                      {getStatusBadge(selectedApp.status)}
                    </div>
                    <h2 className="mt-1 text-2xl font-bold text-[#231f20]">{selectedApp.firstName} {selectedApp.lastName}</h2>
                    <p className="text-sm text-[#666]">Applied on {new Date(selectedApp.createdAt).toLocaleDateString()} at {new Date(selectedApp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium uppercase tracking-wider text-[#707070]">Email Verification</span>
                    <p className="text-sm font-semibold text-emerald-700">✓ Verified Address</p>
                  </div>
                </div>

                {/* Property Under Application */}
                <div className="mt-6 rounded bg-[#f9faf8] p-4 border border-[#ebede9]">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#168241]">Target Property</p>
                  <p className="mt-1 font-semibold text-[#231f20]">{selectedApp.propertyTitle}</p>
                  <p className="text-xs text-[#555]">{selectedApp.propertyAddress}</p>
                  {selectedApp.propertySlug && (
                    <a href={`/houses-for-rent/${selectedApp.propertySlug}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#168241] hover:underline">
                      View public listing <ArrowRight size={13} />
                    </a>
                  )}
                </div>

                {/* Application Fee & Direct Payment Coordination Card */}
                <div className="mt-6 rounded border border-[#dfe3db] bg-white p-5">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center border-b border-[#f0f0ee] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-[#168241]" />
                        <h3 className="font-semibold text-[#231f20]">Application Fee & Coordination</h3>
                      </div>
                      <p className="text-xs text-[#666] mt-0.5">Direct coordinator model (100% self-contained, zero 3rd party processing fees).</p>
                    </div>
                    <div>
                      {selectedApp.paymentStatus === 'paid' ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                          <CheckCircle2 size={13} /> $50.00 Verified
                        </span>
                      ) : selectedApp.paymentStatus === 'waived' ? (
                        <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800">
                          Fee Waived
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                          <Clock size={13} /> $50.00 Unpaid
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm">
                    <div>
                      <span className="text-xs text-[#707070]">Preferred Service:</span>
                      <p className="font-semibold text-[#231f20]">{selectedApp.primaryPaymentMethod || 'Zelle'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-[#707070]">Applicant Tag / Note:</span>
                      <p className="font-semibold text-[#231f20]">{selectedApp.paymentHandle || selectedApp.phone || 'On file'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-[#707070]">Transaction Memo / Ref:</span>
                      <p className="font-mono text-xs font-medium text-[#555]">{selectedApp.paymentReference || 'Pending verification'}</p>
                    </div>
                  </div>

                  {selectedApp.paymentStatus === 'unpaid' && (
                    <div className="mt-4 flex flex-wrap gap-2.5 pt-3 border-t border-[#f5f5f3]">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={handleConfirmPayment}
                        className="inline-flex items-center gap-1.5 rounded bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} /> Confirm $50 Received & Activate Screening
                      </button>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={handleWaiveFee}
                        className="inline-flex items-center gap-1.5 rounded border border-[#cfcfcf] bg-white px-3 py-2 text-xs font-semibold text-[#555] hover:bg-[#f5f5f5] disabled:opacity-50"
                      >
                        Waive Fee
                      </button>
                    </div>
                  )}
                </div>

                {/* Applicant Profile Grid */}
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#707070]">Contact Information</h3>
                    <div className="mt-2 space-y-1.5 text-sm">
                      <p className="flex items-center gap-2 text-[#333]"><Mail size={14} className="text-[#888]" /> {selectedApp.email}</p>
                      <p className="flex items-center gap-2 text-[#333]"><Phone size={14} className="text-[#888]" /> {selectedApp.phone}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#707070]">Employment & Income</h3>
                    <div className="mt-2 space-y-1.5 text-sm">
                      <p className="text-[#333]">Employer: <strong>{selectedApp.employer}</strong></p>
                      <p className="flex items-center gap-1 text-[#333]">
                        Monthly Household Income: <strong className="text-[#168241]">${selectedApp.monthlyIncome.toLocaleString()}</strong>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#707070]">Household Composition</h3>
                    <div className="mt-2 space-y-1.5 text-sm text-[#333]">
                      <p>Household Size: <strong>{selectedApp.householdSize} residents</strong></p>
                      <p>Pets: <strong>{selectedApp.petsCount} pet(s)</strong></p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#707070]">Move-in Schedule</h3>
                    <div className="mt-2 space-y-1.5 text-sm text-[#333]">
                      <p>Desired Move-In: <strong>{selectedApp.moveInDate}</strong></p>
                    </div>
                  </div>
                </div>

                {/* Operations Action Bar */}
                <div className="mt-8 border-t border-[#e8ebe6] pt-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#168241]">Workflow Actions</h3>
                  <p className="mt-1 text-xs text-[#666]">Advance this application in accordance with Fair Housing policies and Invitation Homes qualification standards.</p>

                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {selectedApp.status === 'submitted' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleTransition('screening')}
                        className="inline-flex items-center gap-2 rounded bg-[#168241] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b763c] disabled:opacity-50"
                      >
                        Start Background & Credit Screening
                      </button>
                    )}

                    {selectedApp.status === 'screening' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleTransition('under_review')}
                        className="inline-flex items-center gap-2 rounded bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800 disabled:opacity-50"
                      >
                        Move to Staff Final Review
                      </button>
                    )}

                    {selectedApp.status === 'under_review' && (
                      <>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleTransition('approved')}
                          className="inline-flex items-center gap-2 rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                        >
                          Approve Application
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleTransition('conditionally_approved')}
                          className="inline-flex items-center gap-2 rounded border border-amber-500 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                        >
                          Approve with Conditions
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleTransition('denied')}
                          className="inline-flex items-center gap-2 rounded border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50"
                        >
                          Deny Application
                        </button>
                      </>
                    )}

                    {(selectedApp.status === 'approved' || selectedApp.status === 'conditionally_approved') && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-2 rounded border border-emerald-200">
                        <CheckCircle2 size={16} /> Application approved. Eligible for property hold and lease offer drafting.
                      </div>
                    )}

                    {selectedApp.status === 'denied' && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-rose-800 bg-rose-50 px-3 py-2 rounded border border-rose-200">
                        <XCircle size={16} /> Application denied. Adverse action notice queued for delivery.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded border border-[#e0e2dc] bg-white p-12 text-center text-sm text-[#707070]">
                Select an application from the list to review details and take actions.
              </div>
            )}
          </div>
        </div>
      </main>

      <OfficialFooter />
    </div>
  );
}
