import React, { useState, useEffect } from 'react';
import {
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ExternalLink,
  Download,
  Shield,
  Layers,
  Home,
  CheckSquare,
  AlertCircle,
  Eye,
  RefreshCw,
  X,
  CreditCard,
  Building,
  Calendar,
  Send,
  User,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react';
import { OfficialHeader, OfficialFooter } from './OfficialSiteChrome';
import {
  StagedProperty,
  getStagedProperties,
  addStagedProperty,
  publishStagedProperty,
  updateStagedStatus,
  scrapePublicListingUrl
} from '../services/stagingPipeline';
import {
  ManualPaymentRecord,
  LeaseAgreement,
  PropertyInspection,
  AuditEventLog,
  getPaymentRecords,
  recordManualPayment,
  getLeaseAgreements,
  createLeaseAgreement,
  updateLeaseStatus,
  getInspections,
  reviewInspection,
  getAuditLogs,
  logAuditEvent
} from '../services/adminOperations';
import { SAMPLE_PROPERTIES } from '../data/properties';

type AdminTab = 'dashboard' | 'applications' | 'pipeline' | 'leases' | 'inspections' | 'audit';

interface StaffApplication {
  id: string;
  referenceCode: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyRent: number;
  market: string;
  applicantName: string;
  email: string;
  phone: string;
  employer: string;
  monthlyIncome: number;
  moveInDate: string;
  householdSize: number;
  petsCount: number;
  status: 'submitted' | 'under_review' | 'screening' | 'approved' | 'lease_offered' | 'rejected';
  emailVerified: boolean;
  createdAt: string;
  paymentStatus: 'unpaid' | 'paid' | 'waived';
  paymentReference?: string;
  paymentMethod?: string;
}

const INITIAL_APPLICATIONS: StaffApplication[] = [
  {
    id: 'app-pilot-101',
    referenceCode: 'IH-20261021-ATL01',
    propertyTitle: '3 bed, 2 bath home in Marietta',
    propertyAddress: '1420 Roswell Rd, Marietta, GA 30062',
    propertyRent: 2150,
    market: 'Atlanta',
    applicantName: 'Marcus Vance',
    email: 'm.vance@example.test',
    phone: '(404) 555-0192',
    employer: 'Delta Tech Solutions',
    monthlyIncome: 8400,
    moveInDate: '2026-11-15',
    householdSize: 3,
    petsCount: 1,
    status: 'submitted',
    emailVerified: true,
    createdAt: '2026-10-21T04:15:00.000Z',
    paymentStatus: 'unpaid'
  },
  {
    id: 'app-pilot-102',
    referenceCode: 'IH-20261020-DAL02',
    propertyTitle: '4 bed, 2.5 bath home in Coppell',
    propertyAddress: '782 Sandy Lake Rd, Coppell, TX 75019',
    propertyRent: 2495,
    market: 'Dallas-Fort Worth',
    applicantName: 'Sarah Chen',
    email: 'schen@example.test',
    phone: '(214) 555-0144',
    employer: 'Baylor Scott & White Health',
    monthlyIncome: 9800,
    moveInDate: '2026-12-01',
    householdSize: 4,
    petsCount: 0,
    status: 'screening',
    emailVerified: true,
    createdAt: '2026-10-20T18:30:00.000Z',
    paymentStatus: 'paid',
    paymentMethod: 'Venmo',
    paymentReference: 'VENMO-TX-88492'
  },
  {
    id: 'app-pilot-103',
    referenceCode: 'IH-20261019-PHX03',
    propertyTitle: '3 bed, 2 bath home in Gilbert',
    propertyAddress: '3104 E Baseline Rd, Phoenix, AZ 85234',
    propertyRent: 2200,
    market: 'Phoenix',
    applicantName: 'David Rodriguez',
    email: 'd.rodriguez@example.test',
    phone: '(602) 555-0188',
    employer: 'Intel Corp',
    monthlyIncome: 7900,
    moveInDate: '2026-11-01',
    householdSize: 2,
    petsCount: 2,
    status: 'approved',
    emailVerified: true,
    createdAt: '2026-10-19T14:10:00.000Z',
    paymentStatus: 'paid',
    paymentMethod: 'Cash App',
    paymentReference: 'CASH-AZ-33019'
  }
];

export function StaffPortal() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [applications, setApplications] = useState<StaffApplication[]>(INITIAL_APPLICATIONS);
  const [selectedApp, setSelectedApp] = useState<StaffApplication | null>(null);
  const [stagedListings, setStagedListings] = useState<StagedProperty[]>([]);
  const [leases, setLeases] = useState<LeaseAgreement[]>([]);
  const [inspections, setInspections] = useState<PropertyInspection[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEventLog[]>([]);

  // Filter states
  const [appStatusFilter, setAppStatusFilter] = useState('all');
  const [appSearch, setAppSearch] = useState('');

  // Modals & form state
  const [paymentModalApp, setPaymentModalApp] = useState<StaffApplication | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    method: 'Zelle' as ManualPaymentRecord['method'],
    amount: 55,
    handle: '',
    referenceCode: '',
    notes: ''
  });

  const [scrapeUrl, setScrapeUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedPreview, setScrapedPreview] = useState<Partial<StagedProperty> | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    refreshAllData();
  }, []);

  async function refreshAllData() {
    try {
      const [staged, leaseData, inspData, logs] = await Promise.all([
        getStagedProperties(),
        getLeaseAgreements(),
        getInspections(),
        getAuditLogs()
      ]);
      setStagedListings(staged);
      setLeases(leaseData);
      setInspections(inspData);
      setAuditLogs(logs);
    } catch (e) {
      console.warn('Error refreshing admin data:', e);
    }
  }

  function showNotice(msg: string) {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4500);
  }

  // Application Actions
  async function handleUpdateAppStatus(appId: string, nextStatus: StaffApplication['status']) {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: nextStatus } : a))
    );
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp({ ...selectedApp, status: nextStatus });
    }
    await logAuditEvent('application', appId, `TRANSITION_TO_${nextStatus.toUpperCase()}`, {
      nextStatus
    });
    showNotice(`Application ${appId} moved to ${nextStatus.replace('_', ' ')}.`);
  }

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentModalApp || !paymentForm.referenceCode.trim()) return;

    await recordManualPayment(paymentModalApp.id, {
      paymentType: 'application_fee',
      method: paymentForm.method,
      amount: paymentForm.amount,
      handle: paymentForm.handle || undefined,
      referenceCode: paymentForm.referenceCode.trim(),
      status: 'verified',
      verifiedBy: 'Carol Taylor (Staff)',
      notes: paymentForm.notes
    });

    setApplications((prev) =>
      prev.map((a) =>
        a.id === paymentModalApp.id
          ? {
              ...a,
              paymentStatus: 'paid',
              paymentMethod: paymentForm.method,
              paymentReference: paymentForm.referenceCode.trim()
            }
          : a
      )
    );

    if (selectedApp && selectedApp.id === paymentModalApp.id) {
      setSelectedApp({
        ...selectedApp,
        paymentStatus: 'paid',
        paymentMethod: paymentForm.method,
        paymentReference: paymentForm.referenceCode.trim()
      });
    }

    setPaymentModalApp(null);
    setPaymentForm({ method: 'Zelle', amount: 55, handle: '', referenceCode: '', notes: '' });
    showNotice(`Payment recorded successfully for ${paymentModalApp.applicantName}!`);
    refreshAllData();
  }

  // Pipeline Actions
  async function handleScrapeUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!scrapeUrl.trim()) return;
    setIsScraping(true);
    try {
      const data = await scrapePublicListingUrl(scrapeUrl.trim());
      setScrapedPreview(data);
    } catch (e: any) {
      alert('Could not extract metadata from URL: ' + e.message);
    } finally {
      setIsScraping(false);
    }
  }

  async function handleAddScrapedToStaging() {
    if (!scrapedPreview) return;
    const added = await addStagedProperty({
      sourceUrl: scrapedPreview.sourceUrl || scrapeUrl,
      sourcePlatform: scrapedPreview.sourcePlatform || 'Web Importer',
      title: scrapedPreview.title || 'Imported Property',
      address: scrapedPreview.address || 'Address',
      city: scrapedPreview.city || 'Atlanta',
      state: scrapedPreview.state || 'GA',
      zipCode: scrapedPreview.zipCode || '30303',
      market: scrapedPreview.market || 'Atlanta',
      monthlyRent: scrapedPreview.monthlyRent || 2200,
      securityDeposit: scrapedPreview.securityDeposit || 2200,
      bedrooms: scrapedPreview.bedrooms || 3,
      bathrooms: scrapedPreview.bathrooms || 2,
      squareFeet: scrapedPreview.squareFeet || 1800,
      petFriendly: Boolean(scrapedPreview.petFriendly),
      smartHome: Boolean(scrapedPreview.smartHome),
      images: scrapedPreview.images || [],
      featuredImage: scrapedPreview.featuredImage || '',
      description: scrapedPreview.description || ''
    });

    setStagedListings([added, ...stagedListings]);
    setScrapedPreview(null);
    setScrapeUrl('');
    showNotice('Listing added to Staging Queue for staff review!');
  }

  async function handlePublishListing(id: string) {
    const res = await publishStagedProperty(id);
    if (res.success) {
      setStagedListings((prev) =>
        prev.map((s) => (s.id === id ? { ...s, stagingStatus: 'published' } : s))
      );
      showNotice('Listing published to active public inventory!');
    } else {
      alert('Failed to publish: ' + res.error);
    }
  }

  async function handleRejectListing(id: string) {
    await updateStagedStatus(id, 'rejected');
    setStagedListings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, stagingStatus: 'rejected' } : s))
    );
    showNotice('Listing archived from staging review.');
  }

  // Leases Actions
  async function handleCountersignLease(leaseId: string) {
    await updateLeaseStatus(leaseId, 'countersigned');
    setLeases((prev) =>
      prev.map((l) => (l.id === leaseId ? { ...l, status: 'countersigned' } : l))
    );
    showNotice('Lease countersigned by Property Operations!');
    refreshAllData();
  }

  // Inspection Actions
  async function handleReviewInspection(inspId: string) {
    await reviewInspection(inspId, 'reviewed');
    setInspections((prev) =>
      prev.map((i) => (i.id === inspId ? { ...i, status: 'reviewed' } : i))
    );
    showNotice('Move-in inspection signed off by staff.');
    refreshAllData();
  }

  const filteredApps = applications.filter((app) => {
    if (appStatusFilter !== 'all' && app.status !== appStatusFilter) return false;
    if (appSearch.trim()) {
      const q = appSearch.toLowerCase();
      return (
        app.applicantName.toLowerCase().includes(q) ||
        app.referenceCode.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        app.propertyAddress.toLowerCase().includes(q) ||
        app.market.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f4f5f2] text-[#231f20] font-sans antialiased">
      {/* 1. Official Top Chrome */}
      <OfficialHeader />

      {/* 2. Staff Banner & Subheader */}
      <div className="bg-[#231f20] text-white border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#9fcc3b]"></span>
              <span className="text-xs uppercase tracking-wider text-[#9fcc3b] font-semibold">
                Staff Operations Portal
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mt-1">Management & Leasing Console</h1>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="bg-neutral-800 border border-neutral-700 px-3 py-1.5 rounded text-neutral-300">
              Operator: <span className="text-white font-medium">Carol Taylor</span> (Leasing Specialist)
            </div>
            <a
              href="/api/extension/download"
              download="invitation-homes-importer.zip"
              className="bg-[#168241] hover:bg-[#0b763c] text-white px-3.5 py-1.5 rounded font-semibold flex items-center gap-1.5 transition"
            >
              <Download size={14} />
              <span>Download Chrome Extension</span>
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex overflow-x-auto border-t border-neutral-800/80">
          {[
            { id: 'dashboard', label: 'Dashboard & Metrics', icon: Layers },
            { id: 'applications', label: `Applications (${applications.length})`, icon: FileText },
            { id: 'pipeline', label: `Listings Pipeline (${stagedListings.filter(s => s.stagingStatus === 'pending_review').length} staged)`, icon: Home },
            { id: 'leases', label: `Leases & Deposits (${leases.length})`, icon: DollarSign },
            { id: 'inspections', label: `Inspections (${inspections.length})`, icon: CheckSquare },
            { id: 'audit', label: 'Audit Trail', icon: Shield }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
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

      {/* Notification Toast */}
      {actionNotice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-4">
          <div className="bg-[#e8f5e9] border border-[#a5d6a7] text-[#1b5e20] px-4 py-2.5 rounded text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-neutral-500 hover:text-black">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Main Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD                                          */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#dedede] p-5">
                <div className="text-xs font-semibold text-[#777] uppercase tracking-wide">
                  Active Applications
                </div>
                <div className="text-3xl font-bold mt-2 text-[#231f20] tabular-nums">
                  {applications.length}
                </div>
                <div className="text-xs text-[#555] mt-1 flex items-center gap-1">
                  <span className="text-[#168241] font-semibold">
                    {applications.filter((a) => a.status === 'submitted').length}
                  </span>{' '}
                  awaiting review
                </div>
              </div>

              <div className="bg-white border border-[#dedede] p-5">
                <div className="text-xs font-semibold text-[#777] uppercase tracking-wide">
                  Pipeline Staged Listings
                </div>
                <div className="text-3xl font-bold mt-2 text-[#168241] tabular-nums">
                  {stagedListings.filter((s) => s.stagingStatus === 'pending_review').length}
                </div>
                <div className="text-xs text-[#555] mt-1">Ready for catalog publish</div>
              </div>

              <div className="bg-white border border-[#dedede] p-5">
                <div className="text-xs font-semibold text-[#777] uppercase tracking-wide">
                  Active Leases
                </div>
                <div className="text-3xl font-bold mt-2 text-[#231f20] tabular-nums">
                  {leases.length}
                </div>
                <div className="text-xs text-[#555] mt-1">
                  {leases.filter((l) => l.status === 'countersigned').length} countersigned
                </div>
              </div>

              <div className="bg-white border border-[#dedede] p-5">
                <div className="text-xs font-semibold text-[#777] uppercase tracking-wide">
                  Move-In Inspections
                </div>
                <div className="text-3xl font-bold mt-2 text-[#231f20] tabular-nums">
                  {inspections.length}
                </div>
                <div className="text-xs text-[#555] mt-1">100% room checklists logged</div>
              </div>
            </div>

            {/* Quick Actions & Recent Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-[#dedede] p-6">
                <div className="flex items-center justify-between border-b border-[#eee] pb-4 mb-4">
                  <h2 className="text-base font-bold text-[#231f20]">Recent Operational Activity</h2>
                  <button
                    onClick={refreshAllData}
                    className="text-xs text-[#168241] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw size={12} /> Refresh
                  </button>
                </div>
                <div className="space-y-3">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 text-xs border-b border-[#f0f0f0] pb-3">
                      <div className="w-2 h-2 rounded-full bg-[#168241] mt-1 shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#231f20]">
                            {log.action.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[#888] tabular-nums">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-[#666] mt-0.5">
                          Actor: {log.actorRole} ({log.actorId}) · Entity: {log.entityType} ({log.entityId})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#dedede] p-6 space-y-4">
                <h2 className="text-base font-bold text-[#231f20] border-b border-[#eee] pb-3">
                  Choice Integration Tools
                </h2>
                <div className="text-xs text-[#555] leading-relaxed">
                  Brought from the Choice platform into the Invitation Homes portal with verified brand rules and manual payment verification.
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('pipeline')}
                    className="w-full text-left bg-[#f4f5f2] hover:bg-[#e8eae4] border border-[#d6d6d6] p-3 rounded text-xs font-semibold flex items-center justify-between transition"
                  >
                    <span>Import Listing via Web URL</span>
                    <ArrowRight size={14} className="text-[#168241]" />
                  </button>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="w-full text-left bg-[#f4f5f2] hover:bg-[#e8eae4] border border-[#d6d6d6] p-3 rounded text-xs font-semibold flex items-center justify-between transition"
                  >
                    <span>Record Manual Zelle / Venmo Fee</span>
                    <ArrowRight size={14} className="text-[#168241]" />
                  </button>
                  <a
                    href="/tenant-workflow"
                    className="w-full text-left bg-[#f4f5f2] hover:bg-[#e8eae4] border border-[#d6d6d6] p-3 rounded text-xs font-semibold flex items-center justify-between transition"
                  >
                    <span>Open Resident Lifecycle Portal</span>
                    <ArrowRight size={14} className="text-[#168241]" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: APPLICATIONS MANAGEMENT                            */}
        {/* ========================================================= */}
        {activeTab === 'applications' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List & Filters */}
            <div className={`space-y-4 ${selectedApp ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              <div className="bg-white border border-[#dedede] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search size={15} className="absolute left-3 top-3 text-[#888]" />
                  <input
                    type="text"
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    placeholder="Search applicant, code, property..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#d6d6d6] outline-none focus:border-[#168241]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter size={14} className="text-[#666]" />
                  <select
                    value={appStatusFilter}
                    onChange={(e) => setAppStatusFilter(e.target.value)}
                    className="text-xs border border-[#d6d6d6] py-2 px-2.5 outline-none focus:border-[#168241]"
                  >
                    <option value="all">All Statuses ({applications.length})</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="screening">Screening</option>
                    <option value="approved">Approved</option>
                    <option value="lease_offered">Lease Offered</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-[#dedede] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f4f5f2] border-b border-[#dedede] text-[#666] uppercase text-[11px] font-semibold">
                    <tr>
                      <th className="py-3 px-4">Applicant</th>
                      <th className="py-3 px-4">Property</th>
                      <th className="py-3 px-4">Income Ratio</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee]">
                    {filteredApps.map((app) => {
                      const ratio = Math.round((app.monthlyIncome / app.propertyRent) * 10) / 10;
                      const ratioQualified = ratio >= 3.0;
                      const isSelected = selectedApp?.id === app.id;

                      return (
                        <tr
                          key={app.id}
                          onClick={() => setSelectedApp(app)}
                          className={`cursor-pointer hover:bg-[#f9faf7] transition ${
                            isSelected ? 'bg-[#f0f8f3] font-medium' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#231f20]">{app.applicantName}</div>
                            <div className="text-[11px] text-[#777] font-mono">{app.referenceCode}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="truncate max-w-[200px] text-[#231f20]">{app.propertyAddress}</div>
                            <div className="text-[11px] text-[#777]">
                              ${app.propertyRent.toLocaleString()}/mo · {app.market}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-mono tabular-nums font-semibold">
                              ${app.monthlyIncome.toLocaleString()}/mo
                            </div>
                            <div className={`text-[11px] font-semibold ${ratioQualified ? 'text-[#168241]' : 'text-amber-700'}`}>
                              {ratio}x rent {ratioQualified ? '✓ (Pass)' : '⚠ (<3x)'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {app.paymentStatus === 'paid' ? (
                              <div>
                                <span className="font-semibold text-[#168241]">Paid</span>
                                <span className="text-[11px] text-[#777] block font-mono">
                                  {app.paymentMethod}
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPaymentModalApp(app);
                                }}
                                className="text-xs text-[#168241] font-bold hover:underline"
                              >
                                + Record Fee
                              </button>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="capitalize font-semibold text-[#231f20]">
                              {app.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedApp(app);
                              }}
                              className="text-[#168241] hover:text-[#0b763c] font-semibold text-xs"
                            >
                              Review →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Applicant Drawer */}
            {selectedApp && (
              <div className="bg-white border border-[#dedede] p-6 space-y-6 self-start">
                <div className="flex items-center justify-between border-b border-[#eee] pb-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-wide text-[#777] font-semibold">
                      Applicant Detail
                    </span>
                    <h3 className="text-lg font-bold text-[#231f20]">{selectedApp.applicantName}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="text-[#888] hover:text-black"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Qualification card */}
                <div className="bg-[#f4f5f2] border border-[#e2e2e2] p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#666]">Reference Code:</span>
                    <span className="font-mono font-bold">{selectedApp.referenceCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666]">Property:</span>
                    <span className="font-semibold truncate max-w-[180px]">{selectedApp.propertyAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666]">Advertised Rent:</span>
                    <span className="font-bold">${selectedApp.propertyRent.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666]">Household Income:</span>
                    <span className="font-bold">${selectedApp.monthlyIncome.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666]">Income-to-Rent Ratio:</span>
                    <span className="font-bold text-[#168241]">
                      {(selectedApp.monthlyIncome / selectedApp.propertyRent).toFixed(1)}x (3.0x standard)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666]">Move-In Date:</span>
                    <span>{selectedApp.moveInDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666]">Household / Pets:</span>
                    <span>{selectedApp.householdSize} occupants · {selectedApp.petsCount} pets</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666]">Employer:</span>
                    <span>{selectedApp.employer}</span>
                  </div>
                </div>

                {/* Manual Fee Status */}
                <div className="border border-[#dedede] p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#231f20]">Application Fee ($55.00)</span>
                    <span className={`font-semibold uppercase ${selectedApp.paymentStatus === 'paid' ? 'text-[#168241]' : 'text-amber-700'}`}>
                      {selectedApp.paymentStatus}
                    </span>
                  </div>
                  {selectedApp.paymentStatus === 'paid' ? (
                    <div className="text-[#666] space-y-1">
                      <div>Method: <strong className="text-black">{selectedApp.paymentMethod}</strong></div>
                      <div>Reference ID: <strong className="font-mono text-black">{selectedApp.paymentReference}</strong></div>
                      <div className="text-[11px] text-[#888]">Staff-verified manual payment record.</div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPaymentModalApp(selectedApp)}
                      className="w-full bg-[#168241] text-white py-2 text-xs font-bold rounded hover:bg-[#0b763c]"
                    >
                      + Record Manual Payment
                    </button>
                  )}
                </div>

                {/* Status Stepper */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-[#231f20]">Advance Application State:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      disabled={selectedApp.status === 'under_review'}
                      onClick={() => handleUpdateAppStatus(selectedApp.id, 'under_review')}
                      className="border border-[#d6d6d6] py-2 font-semibold hover:border-[#168241] disabled:opacity-40"
                    >
                      Under Review
                    </button>
                    <button
                      disabled={selectedApp.status === 'screening'}
                      onClick={() => handleUpdateAppStatus(selectedApp.id, 'screening')}
                      className="border border-[#d6d6d6] py-2 font-semibold hover:border-[#168241] disabled:opacity-40"
                    >
                      To Screening
                    </button>
                    <button
                      disabled={selectedApp.status === 'approved'}
                      onClick={() => handleUpdateAppStatus(selectedApp.id, 'approved')}
                      className="bg-[#168241] text-white py-2 font-bold hover:bg-[#0b763c] disabled:opacity-40"
                    >
                      Approve Applicant
                    </button>
                    <button
                      disabled={selectedApp.status === 'lease_offered'}
                      onClick={() => handleUpdateAppStatus(selectedApp.id, 'lease_offered')}
                      className="border border-[#168241] text-[#168241] py-2 font-bold hover:bg-[#f0f8f3] disabled:opacity-40"
                    >
                      Offer Lease
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: LISTINGS PIPELINE & IMPORTER                       */}
        {/* ========================================================= */}
        {activeTab === 'pipeline' && (
          <div className="space-y-8">
            {/* Direct URL Importer & Extension Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Web Importer Box */}
              <div className="lg:col-span-2 bg-white border border-[#dedede] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#eee] pb-3">
                  <div>
                    <h2 className="text-base font-bold text-[#231f20]">Direct Listing URL Importer</h2>
                    <p className="text-xs text-[#666]">
                      Paste any public listing URL from Zillow, Realtor.com, Redfin, or Apartments.com to extract and stage.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleScrapeUrl} className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={scrapeUrl}
                    onChange={(e) => setScrapeUrl(e.target.value)}
                    placeholder="https://www.zillow.com/homedetails/... or realtor.com/..."
                    className="flex-1 border border-[#d6d6d6] px-3.5 py-2.5 text-xs outline-none focus:border-[#168241]"
                  />
                  <button
                    type="submit"
                    disabled={isScraping}
                    className="bg-[#168241] hover:bg-[#0b763c] text-white px-5 py-2.5 text-xs font-bold shrink-0 disabled:opacity-50"
                  >
                    {isScraping ? 'Extracting...' : 'Analyze Listing'}
                  </button>
                </form>

                {/* Scraped Preview Card */}
                {scrapedPreview && (
                  <div className="bg-[#f9faf7] border border-[#d5ded0] p-4 rounded space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-[#168241] uppercase">
                          Source: {scrapedPreview.sourcePlatform}
                        </span>
                        <h4 className="text-sm font-bold text-[#231f20] mt-0.5">{scrapedPreview.title}</h4>
                        <div className="text-xs text-[#666]">{scrapedPreview.address}, {scrapedPreview.city}, {scrapedPreview.state} {scrapedPreview.zipCode}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#168241] tabular-nums">
                          ${scrapedPreview.monthlyRent?.toLocaleString()}/mo
                        </div>
                        <div className="text-[11px] text-[#777]">
                          {scrapedPreview.bedrooms} bd · {scrapedPreview.bathrooms} ba · {scrapedPreview.squareFeet} sqft
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#e2e8de]">
                      <button
                        type="button"
                        onClick={() => setScrapedPreview(null)}
                        className="text-xs text-[#777] hover:text-black font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddScrapedToStaging}
                        className="bg-[#168241] hover:bg-[#0b763c] text-white px-4 py-2 text-xs font-bold rounded"
                      >
                        Add to Staging Review Queue
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Chrome Extension Card */}
              <div className="bg-white border border-[#dedede] p-6 space-y-3">
                <div className="w-10 h-10 rounded bg-[#e8f5e9] flex items-center justify-center text-[#168241]">
                  <Download size={22} />
                </div>
                <h3 className="text-sm font-bold text-[#231f20]">Chrome Browser Extension</h3>
                <p className="text-xs text-[#666] leading-relaxed">
                  Browse Zillow or Realtor.com normally and click the extension icon to instantly send listings to this staging queue with 1 click.
                </p>
                <div className="pt-2">
                  <a
                    href="/api/extension/download"
                    download="invitation-homes-importer.zip"
                    className="inline-flex items-center gap-2 bg-[#231f20] hover:bg-neutral-800 text-white px-4 py-2 text-xs font-bold rounded"
                  >
                    <Download size={14} /> Download Extension Bundle
                  </a>
                </div>
                <div className="text-[11px] text-[#888] pt-1">
                  How to load: Open <code>chrome://extensions</code>, turn on Developer mode, and click "Load unpacked".
                </div>
              </div>
            </div>

            {/* Staging Queue Table / Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#dedede] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#231f20]">
                    Staging & Review Queue ({stagedListings.length} records)
                  </h3>
                  <p className="text-xs text-[#666]">
                    Listings remain private in staging until approved and published by staff.
                  </p>
                </div>
                <button
                  onClick={refreshAllData}
                  className="text-xs text-[#168241] hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw size={12} /> Refresh Queue
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {stagedListings.map((staged) => {
                  const isPending = staged.stagingStatus === 'pending_review';
                  const isPublished = staged.stagingStatus === 'published';

                  return (
                    <article
                      key={staged.id}
                      className="bg-white border border-[#dedede] flex flex-col justify-between overflow-hidden shadow-sm"
                    >
                      <div>
                        <div className="relative aspect-[1.5] w-full bg-neutral-100">
                          <img
                            src={staged.featuredImage}
                            alt={staged.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-[#231f20]/90 text-white text-[11px] px-2.5 py-1 rounded font-semibold">
                            {staged.sourcePlatform}
                          </div>
                          <div className="absolute bottom-2 left-2 bg-white text-[#231f20] text-xs px-2.5 py-1 font-bold shadow">
                            ${staged.monthlyRent.toLocaleString()}/mo
                          </div>
                        </div>

                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-[#666]">
                              {staged.bedrooms} bd · {staged.bathrooms} ba · {staged.squareFeet} sqft
                            </span>
                            <span
                              className={`text-[11px] font-bold uppercase ${
                                isPublished
                                  ? 'text-[#168241]'
                                  : isPending
                                  ? 'text-amber-700'
                                  : 'text-neutral-500'
                              }`}
                            >
                              {staged.stagingStatus.replace('_', ' ')}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-[#231f20] line-clamp-1">{staged.title}</h4>
                          <p className="text-xs text-[#666]">
                            {staged.address}, {staged.city}, {staged.state} {staged.zipCode}
                          </p>
                          <p className="text-xs text-[#777] line-clamp-2 leading-relaxed">
                            {staged.description}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 border-t border-[#eee] bg-[#fcfcfb] flex items-center justify-between gap-2">
                        <a
                          href={staged.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-[#777] hover:text-black flex items-center gap-1"
                        >
                          <ExternalLink size={12} /> Source
                        </a>

                        {isPending && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRejectListing(staged.id)}
                              className="text-xs text-[#888] hover:text-rose-600 font-semibold px-2 py-1"
                            >
                              Archive
                            </button>
                            <button
                              onClick={() => handlePublishListing(staged.id)}
                              className="bg-[#168241] hover:bg-[#0b763c] text-white px-3 py-1.5 text-xs font-bold rounded"
                            >
                              Approve & Publish
                            </button>
                          </div>
                        )}

                        {isPublished && (
                          <span className="text-xs font-semibold text-[#168241] flex items-center gap-1">
                            <CheckCircle2 size={13} /> Live in Catalog
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: LEASES & HOLDING DEPOSITS                          */}
        {/* ========================================================= */}
        {activeTab === 'leases' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#dedede] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#231f20]">
                  Lease Agreements & Holding Deposits
                </h3>
                <p className="text-xs text-[#666]">
                  Track digital lease contracts, resident terms, and verified holding fee receipts.
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#dedede] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f4f5f2] border-b border-[#dedede] text-[#666] uppercase text-[11px] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Tenant</th>
                    <th className="py-3 px-4">Property</th>
                    <th className="py-3 px-4">Lease Term</th>
                    <th className="py-3 px-4">Rent / Deposit</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eee]">
                  {leases.map((lease) => (
                    <tr key={lease.id} className="hover:bg-[#f9faf7]">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#231f20]">{lease.tenantName}</div>
                        <div className="text-[11px] text-[#777]">{lease.tenantEmail}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-[#231f20]">{lease.propertyAddress}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold">{lease.leaseTermMonths} Months</div>
                        <div className="text-[11px] text-[#777]">
                          {lease.startDate} to {lease.endDate}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums">
                        <div>Rent: ${lease.monthlyRent.toLocaleString()}</div>
                        <div className="text-[11px] text-[#777]">
                          Deposit: ${lease.securityDeposit.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize font-semibold text-[#168241]">
                          {lease.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {lease.status !== 'countersigned' ? (
                          <button
                            onClick={() => handleCountersignLease(lease.id)}
                            className="bg-[#168241] hover:bg-[#0b763c] text-white px-3 py-1.5 rounded text-xs font-bold"
                          >
                            Countersign Lease
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-[#168241]">Executed ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: PROPERTY INSPECTIONS                               */}
        {/* ========================================================= */}
        {activeTab === 'inspections' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#dedede] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#231f20]">
                  Move-In & Condition Inspections
                </h3>
                <p className="text-xs text-[#666]">
                  Room-by-room condition checklists submitted by residents prior to key handover.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inspections.map((insp) => (
                <div key={insp.id} className="bg-white border border-[#dedede] p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#eee] pb-3">
                    <div>
                      <span className="text-[11px] uppercase tracking-wide font-bold text-[#168241]">
                        {insp.type.replace('_', ' ')} Inspection
                      </span>
                      <h4 className="text-sm font-bold text-[#231f20] mt-0.5">{insp.propertyAddress}</h4>
                      <div className="text-xs text-[#666]">
                        Tenant: {insp.tenantName} · Date: {insp.inspectionDate}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="bg-[#e8f5e9] text-[#168241] px-2.5 py-1 text-xs font-bold rounded uppercase">
                        {insp.overallCondition}
                      </span>
                    </div>
                  </div>

                  {/* Checklist items */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[#231f20]">Room Checkpoints:</div>
                    <div className="divide-y divide-[#f0f0f0] border border-[#f0f0f0] rounded text-xs">
                      {insp.checklist.map((item, idx) => (
                        <div key={idx} className="p-2.5 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-[#231f20]">{item.name}</span>
                            <span className="text-[11px] text-[#777] block">{item.notes}</span>
                          </div>
                          <div className="text-right">
                            <span className="capitalize font-semibold text-[#168241]">{item.condition}</span>
                            <span className="text-[10px] text-[#888] block">{item.photosCount} photos</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#eee]">
                    <span className="text-xs text-[#777]">
                      Status: <strong className="text-black capitalize">{insp.status}</strong>
                    </span>
                    {insp.status !== 'reviewed' && (
                      <button
                        onClick={() => handleReviewInspection(insp.id)}
                        className="bg-[#168241] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-[#0b763c]"
                      >
                        Sign-off Inspection
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: AUDIT TRAIL                                        */}
        {/* ========================================================= */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#dedede] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#231f20]">
                  System Audit Ledger
                </h3>
                <p className="text-xs text-[#666]">
                  Immutable activity history tracking every manual payment, status transition, and catalog publication.
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#dedede] overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#f4f5f2] border-b border-[#dedede] text-[#666] uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eee]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#f9faf7]">
                      <td className="py-3 px-4 text-[#777] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#168241]">
                        {log.action}
                      </td>
                      <td className="py-3 px-4">
                        {log.entityType} ({log.entityId})
                      </td>
                      <td className="py-3 px-4 text-[#555]">
                        {log.actorRole} · {log.actorId}
                      </td>
                      <td className="py-3 px-4 text-[#666] truncate max-w-xs font-sans text-[11px]">
                        {JSON.stringify(log.metadata)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Manual Payment Recording Modal */}
      {paymentModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white max-w-md w-full p-6 shadow-2xl border border-neutral-300 space-y-4">
            <div className="flex items-center justify-between border-b border-[#eee] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#231f20]">Record Manual Payment</h3>
                <p className="text-xs text-[#666] mt-0.5">
                  Applicant: <strong>{paymentModalApp.applicantName}</strong> ({paymentModalApp.referenceCode})
                </p>
              </div>
              <button
                onClick={() => setPaymentModalApp(null)}
                className="text-[#888] hover:text-black"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#666] font-semibold mb-1">Payment Method</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value as any })}
                  className="w-full border border-[#d6d6d6] py-2 px-3 outline-none focus:border-[#168241]"
                >
                  <option value="Zelle">Zelle Transfer</option>
                  <option value="Venmo">Venmo</option>
                  <option value="Cash App">Cash App</option>
                  <option value="Credit Card">Credit Card Receipt</option>
                  <option value="ACH Transfer">ACH Bank Wire</option>
                  <option value="Cashier Check">Cashier's Check</option>
                  <option value="Other">Other Verified Method</option>
                </select>
              </div>

              <div>
                <label className="block text-[#666] font-semibold mb-1">Payment Amount ($ USD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-[#d6d6d6] py-2 px-3 outline-none focus:border-[#168241]"
                />
              </div>

              <div>
                <label className="block text-[#666] font-semibold mb-1">Sender Handle / Account (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. $applicant-tag or 404-555-0192"
                  value={paymentForm.handle}
                  onChange={(e) => setPaymentForm({ ...paymentForm, handle: e.target.value })}
                  className="w-full border border-[#d6d6d6] py-2 px-3 outline-none focus:border-[#168241]"
                />
              </div>

              <div>
                <label className="block text-[#666] font-semibold mb-1">
                  Bank / Transaction Reference Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ZELLE-REF-992384 or VENMO-88492"
                  value={paymentForm.referenceCode}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceCode: e.target.value })}
                  className="w-full border border-[#d6d6d6] py-2 px-3 outline-none focus:border-[#168241] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#666] font-semibold mb-1">Staff Audit Notes</label>
                <textarea
                  rows={2}
                  placeholder="Verified incoming funds against ledger..."
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full border border-[#d6d6d6] p-2.5 outline-none focus:border-[#168241]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#eee]">
                <button
                  type="button"
                  onClick={() => setPaymentModalApp(null)}
                  className="px-4 py-2 border border-[#d6d6d6] font-semibold hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#168241] text-white px-5 py-2 font-bold hover:bg-[#0b763c]"
                >
                  Save Payment Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Footer */}
      <OfficialFooter />
    </div>
  );
}
