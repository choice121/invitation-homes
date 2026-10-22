import React, { useState, useEffect } from 'react';
import {
  Home,
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  Wrench,
  AlertCircle,
  Key,
  ShieldCheck,
  Send,
  Plus,
  ArrowRight,
  User,
  CheckSquare
} from 'lucide-react';
import { OfficialHeader, OfficialFooter } from './OfficialSiteChrome';
import {
  LeaseAgreement,
  PropertyInspection,
  InspectionRoomItem,
  getLeaseAgreements,
  getInspections,
  submitPropertyInspection
} from '../services/adminOperations';

export function TenantPortal() {
  const [authenticatedEmail, setAuthenticatedEmail] = useState<string>('schen@example.test');
  const [emailInput, setEmailInput] = useState('');
  const [activeTab, setActiveTab] = useState<'lease' | 'inspection' | 'payments' | 'maintenance'>('lease');
  const [activeLease, setActiveLease] = useState<LeaseAgreement | null>(null);
  const [inspections, setInspections] = useState<PropertyInspection[]>([]);
  const [isSubmittingInspection, setIsSubmittingInspection] = useState(false);
  const [inspectionSuccess, setInspectionSuccess] = useState(false);
  const [maintenanceSuccess, setMaintenanceSuccess] = useState(false);

  // Move-in inspection checklist draft state
  const [inspectionDraft, setInspectionDraft] = useState<InspectionRoomItem[]>([
    { name: 'Front Entrance & Smart Lock', condition: 'excellent', notes: 'Smart lock responds smoothly to code, door seals tightly.', photosCount: 2 },
    { name: 'Kitchen & Appliances', condition: 'excellent', notes: 'Refrigerator, oven, and microwave verified clean and fully powered.', photosCount: 3 },
    { name: 'Living Room & Windows', condition: 'good', notes: 'Blinds in working order, clean flooring.', photosCount: 1 },
    { name: 'Primary Bedroom & Bath', condition: 'excellent', notes: 'Clean shower glass, no leaks detected.', photosCount: 2 },
    { name: 'HVAC & Filter Intake', condition: 'good', notes: 'Air filter clean and intact.', photosCount: 1 },
    { name: 'Backyard & Fence', condition: 'good', notes: 'Fencing secure for family pets.', photosCount: 2 }
  ]);
  const [inspectionNotes, setInspectionNotes] = useState('');

  // Maintenance form
  const [maintenanceCategory, setMaintenanceCategory] = useState('HVAC / Climate');
  const [maintenanceDescription, setMaintenanceDescription] = useState('');
  const [maintenanceUrgency, setMaintenanceUrgency] = useState('routine');

  useEffect(() => {
    loadTenantData(authenticatedEmail);
  }, [authenticatedEmail]);

  async function loadTenantData(email: string) {
    try {
      const leases = await getLeaseAgreements(email);
      if (leases.length > 0) {
        setActiveLease(leases[0]);
      } else {
        // Fallback demo lease
        setActiveLease({
          id: 'lease-live-demo',
          propertyId: 'coppell-tx-782',
          propertyAddress: '782 Sandy Lake Rd, Coppell, TX 75019',
          tenantName: 'Sarah Chen',
          tenantEmail: email,
          monthlyRent: 2495,
          securityDeposit: 2495,
          leaseTermMonths: 12,
          startDate: '2026-12-01',
          endDate: '2027-11-30',
          status: 'countersigned',
          createdAt: new Date().toISOString()
        });
      }

      const insps = await getInspections(email);
      setInspections(insps);
    } catch (e) {
      console.warn('Error loading tenant data:', e);
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (emailInput.trim()) {
      setAuthenticatedEmail(emailInput.trim());
    }
  }

  async function handleSubmitMoveInInspection(e: React.FormEvent) {
    e.preventDefault();
    if (!activeLease) return;
    setIsSubmittingInspection(true);

    try {
      const created = await submitPropertyInspection({
        propertyId: activeLease.propertyId,
        propertyAddress: activeLease.propertyAddress,
        tenantName: activeLease.tenantName,
        tenantEmail: activeLease.tenantEmail,
        type: 'move_in',
        inspectionDate: new Date().toISOString().split('T')[0],
        checklist: inspectionDraft,
        overallCondition: 'excellent',
        notes: inspectionNotes || 'Resident pre-move-in inspection submitted digitally.'
      });

      setInspections([created, ...inspections]);
      setInspectionSuccess(true);
      setTimeout(() => setInspectionSuccess(false), 5000);
    } finally {
      setIsSubmittingInspection(false);
    }
  }

  function handleSubmitMaintenance(e: React.FormEvent) {
    e.preventDefault();
    setMaintenanceSuccess(true);
    setMaintenanceDescription('');
    setTimeout(() => setMaintenanceSuccess(false), 5000);
  }

  return (
    <div className="min-h-screen bg-[#f4f5f2] text-[#231f20] font-sans antialiased">
      <OfficialHeader />

      {/* Tenant Banner */}
      <div className="bg-[#231f20] text-white border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#9fcc3b]"></span>
                <span className="text-xs uppercase tracking-wider text-[#9fcc3b] font-semibold">
                  Resident Services Hub
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mt-1">Tenant Leasing Portal</h1>
              {activeLease && (
                <p className="text-xs text-neutral-300 mt-1">
                  Home: <strong className="text-white">{activeLease.propertyAddress}</strong> · Tenant: {activeLease.tenantName} ({authenticatedEmail})
                </p>
              )}
            </div>

            {/* Magic Link Lookup */}
            <form onSubmit={handleLogin} className="flex items-center gap-2 text-xs">
              <input
                type="email"
                placeholder="Switch verified email..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="bg-neutral-800 border border-neutral-700 px-3 py-1.5 text-white placeholder:text-neutral-500 rounded outline-none focus:border-[#9fcc3b]"
              />
              <button
                type="submit"
                className="bg-[#168241] hover:bg-[#0b763c] text-white px-3 py-1.5 font-bold rounded"
              >
                Access
              </button>
            </form>
          </div>

          {/* Tab Navigation */}
          <div className="flex overflow-x-auto border-t border-neutral-800/80 mt-6 -mb-6">
            {[
              { id: 'lease', label: 'My Lease & Move-In', icon: Home },
              { id: 'inspection', label: `Condition Inspection (${inspections.length})`, icon: CheckSquare },
              { id: 'payments', label: 'Holding Deposit & Ledger', icon: DollarSign },
              { id: 'maintenance', label: 'ProCare™ Maintenance', icon: Wrench }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
                    active
                      ? 'border-[#9fcc3b] text-[#9fcc3b] bg-white/5'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        {/* ========================================================= */}
        {/* TAB 1: LEASE & MOVE-IN                                    */}
        {/* ========================================================= */}
        {activeTab === 'lease' && activeLease && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Lease Status Card */}
              <div className="bg-white border border-[#dedede] p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#eee] pb-4">
                  <div>
                    <span className="text-xs font-bold text-[#168241] uppercase tracking-wide">
                      Digital Lease Agreement
                    </span>
                    <h2 className="text-xl font-bold text-[#231f20] mt-0.5">
                      {activeLease.propertyAddress}
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="bg-[#e8f5e9] text-[#168241] px-3 py-1 text-xs font-bold rounded uppercase">
                      {activeLease.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-[#f4f5f2] p-3 rounded">
                    <div className="text-[#666]">Monthly Rent</div>
                    <div className="text-base font-bold text-[#231f20] mt-1 tabular-nums">
                      ${activeLease.monthlyRent.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-[#f4f5f2] p-3 rounded">
                    <div className="text-[#666]">Security Deposit</div>
                    <div className="text-base font-bold text-[#231f20] mt-1 tabular-nums">
                      ${activeLease.securityDeposit.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-[#f4f5f2] p-3 rounded">
                    <div className="text-[#666]">Lease Length</div>
                    <div className="text-base font-bold text-[#231f20] mt-1">
                      {activeLease.leaseTermMonths} Months
                    </div>
                  </div>
                </div>

                <div className="text-xs text-[#555] space-y-1.5 pt-2 border-t border-[#eee]">
                  <div className="flex justify-between">
                    <span>Lease Term:</span>
                    <strong>{activeLease.startDate} to {activeLease.endDate}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Smart Home Suite:</span>
                    <strong>Included (Keyless lock, Smart thermostat)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Pet Policy:</span>
                    <strong>Up to 3 pets welcome</strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-[#168241] font-semibold flex items-center gap-1.5">
                    <ShieldCheck size={16} /> Fully Countersigned by Invitation Homes
                  </span>
                  <button
                    onClick={() => setActiveTab('inspection')}
                    className="bg-[#168241] hover:bg-[#0b763c] text-white px-4 py-2 text-xs font-bold rounded flex items-center gap-1.5"
                  >
                    <span>Proceed to Move-In Inspection</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Move-In Checklist Card */}
            <div className="space-y-6">
              <div className="bg-white border border-[#dedede] p-6 space-y-4 shadow-sm">
                <h3 className="text-base font-bold text-[#231f20] border-b border-[#eee] pb-3">
                  Move-In Preparation Steps
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#168241] mt-0.5 shrink-0" />
                    <div>
                      <strong>Application Approved & Verified</strong>
                      <p className="text-[#666]">Income verification and identification completed.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#168241] mt-0.5 shrink-0" />
                    <div>
                      <strong>Lease Agreement Signed</strong>
                      <p className="text-[#666]">Digital lease countersigned by leasing office.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#168241] mt-0.5 shrink-0" />
                    <div>
                      <strong>Holding Deposit Recorded</strong>
                      <p className="text-[#666]">Home taken off market for your scheduled move-in.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <strong>Pre-Move-In Condition Inspection</strong>
                      <p className="text-[#666]">Complete the room-by-room digital checklist.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CONDITION INSPECTIONS                              */}
        {/* ========================================================= */}
        {activeTab === 'inspection' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white border border-[#dedede] p-6 space-y-4 shadow-sm">
              <div className="border-b border-[#eee] pb-4">
                <span className="text-xs uppercase font-bold text-[#168241]">
                  Resident Verification
                </span>
                <h2 className="text-xl font-bold text-[#231f20] mt-0.5">
                  Pre-Move-In Room Condition Inspection
                </h2>
                <p className="text-xs text-[#666] mt-1">
                  Inspect each room upon taking possession and document any pre-existing marks. This protects your security deposit at move-out.
                </p>
              </div>

              {inspectionSuccess && (
                <div className="bg-[#e8f5e9] border border-[#a5d6a7] text-[#1b5e20] p-4 rounded text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Inspection checklist successfully recorded and sent to your property management team!</span>
                </div>
              )}

              <form onSubmit={handleSubmitMoveInInspection} className="space-y-4 text-xs">
                <div className="space-y-3">
                  {inspectionDraft.map((item, idx) => (
                    <div key={idx} className="border border-[#e2e2e2] p-3.5 rounded bg-[#fcfcfb] space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <strong className="text-[#231f20] text-sm">{item.name}</strong>
                        <div className="flex items-center gap-2">
                          <label className="text-[#666]">Condition:</label>
                          <select
                            value={item.condition}
                            onChange={(e) => {
                              const updated = [...inspectionDraft];
                              updated[idx].condition = e.target.value as any;
                              setInspectionDraft(updated);
                            }}
                            className="border border-[#d6d6d6] py-1 px-2 text-xs rounded outline-none focus:border-[#168241]"
                          >
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="damaged">Needs Repair</option>
                          </select>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Add specific observations or photo notes..."
                        value={item.notes}
                        onChange={(e) => {
                          const updated = [...inspectionDraft];
                          updated[idx].notes = e.target.value;
                          setInspectionDraft(updated);
                        }}
                        className="w-full border border-[#d6d6d6] p-2 text-xs rounded outline-none focus:border-[#168241]"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-[#666] font-semibold mb-1">
                    Overall Inspection Summary & Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="General observations, move-in cleanliness remarks..."
                    value={inspectionNotes}
                    onChange={(e) => setInspectionNotes(e.target.value)}
                    className="w-full border border-[#d6d6d6] p-2.5 text-xs rounded outline-none focus:border-[#168241]"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingInspection}
                    className="bg-[#168241] hover:bg-[#0b763c] text-white px-6 py-2.5 text-xs font-bold rounded shadow transition disabled:opacity-50"
                  >
                    {isSubmittingInspection ? 'Submitting...' : 'Sign & Submit Inspection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: HOLDING DEPOSITS & LEDGER                          */}
        {/* ========================================================= */}
        {activeTab === 'payments' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white border border-[#dedede] p-6 space-y-4 shadow-sm">
              <h2 className="text-xl font-bold text-[#231f20] border-b border-[#eee] pb-4">
                Resident Financial Accounting & Deposit Ledger
              </h2>
              <div className="space-y-3 text-xs">
                <div className="bg-[#f9faf7] border border-[#d5ded0] p-4 rounded flex items-center justify-between">
                  <div>
                    <strong className="text-sm text-[#231f20]">Holding Deposit Receipt</strong>
                    <div className="text-[#666]">Secures property reservation prior to lease start.</div>
                    <div className="text-[11px] text-[#888] font-mono mt-0.5">
                      Ref: HOLD-DEP-TX-782 · Verified via Staff Accounting
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-[#168241]">$2,495.00</span>
                    <span className="text-[11px] block font-semibold text-[#168241]">Verified & Credited</span>
                  </div>
                </div>

                <div className="bg-[#f9faf7] border border-[#d5ded0] p-4 rounded flex items-center justify-between">
                  <div>
                    <strong className="text-sm text-[#231f20]">Application Fee</strong>
                    <div className="text-[#666]">Standard screening verification fee.</div>
                    <div className="text-[11px] text-[#888] font-mono mt-0.5">
                      Ref: VENMO-TX-88492
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-[#231f20]">$55.00</span>
                    <span className="text-[11px] block font-semibold text-[#168241]">Paid</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: PROCARE MAINTENANCE REQUESTS                       */}
        {/* ========================================================= */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white border border-[#dedede] p-6 space-y-4 shadow-sm">
              <div className="border-b border-[#eee] pb-4">
                <span className="text-xs uppercase font-bold text-[#168241]">
                  ProCare® Service
                </span>
                <h2 className="text-xl font-bold text-[#231f20] mt-0.5">
                  Submit a Maintenance Request
                </h2>
                <p className="text-xs text-[#666] mt-1">
                  Full-time certified maintenance technicians. 24/7 dispatch available for urgent issues.
                </p>
              </div>

              {maintenanceSuccess && (
                <div className="bg-[#e8f5e9] border border-[#a5d6a7] text-[#1b5e20] p-4 rounded text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Your maintenance request has been dispatched to your local ProCare team!</span>
                </div>
              )}

              <form onSubmit={handleSubmitMaintenance} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#666] font-semibold mb-1">Issue Category</label>
                  <select
                    value={maintenanceCategory}
                    onChange={(e) => setMaintenanceCategory(e.target.value)}
                    className="w-full border border-[#d6d6d6] p-2.5 rounded outline-none focus:border-[#168241]"
                  >
                    <option value="HVAC / Climate">HVAC / Heating / Air Conditioning</option>
                    <option value="Plumbing & Water">Plumbing & Water Fixtures</option>
                    <option value="Appliances">Kitchen & Laundry Appliances</option>
                    <option value="Smart Home / Lock">Smart Home Keyless Lock / Sensor</option>
                    <option value="Electrical">Electrical & Lighting</option>
                    <option value="Exterior / Yard">Yard, Fencing & Exterior</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#666] font-semibold mb-1">Priority / Urgency</label>
                  <select
                    value={maintenanceUrgency}
                    onChange={(e) => setMaintenanceUrgency(e.target.value)}
                    className="w-full border border-[#d6d6d6] p-2.5 rounded outline-none focus:border-[#168241]"
                  >
                    <option value="routine">Routine (Next 48 business hours)</option>
                    <option value="high">High Priority (Within 24 hours)</option>
                    <option value="emergency">Emergency (Active water leak or total heat loss)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#666] font-semibold mb-1">Description of Issue *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe what is occurring, which room, and best times for technician entry..."
                    value={maintenanceDescription}
                    onChange={(e) => setMaintenanceDescription(e.target.value)}
                    className="w-full border border-[#d6d6d6] p-2.5 rounded outline-none focus:border-[#168241]"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#168241] hover:bg-[#0b763c] text-white px-6 py-2.5 text-xs font-bold rounded shadow transition"
                  >
                    Dispatch Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <OfficialFooter />
    </div>
  );
}
