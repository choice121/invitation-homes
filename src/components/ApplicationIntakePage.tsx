import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  FileText,
  User,
  Home,
  Briefcase,
  Users,
  Shield,
  CreditCard,
  Upload,
  AlertCircle,
  HelpCircle,
  Check,
  Building2,
  Phone,
  Mail,
  Calendar,
  DollarSign
} from 'lucide-react';
import { getPropertyBySlug } from '../services/propertyRepository';
import { APPLICATION_TERMS, APPLICATION_TERMS_VERSION } from '../services/applicationTerms';
import { PropertyListing } from '../types/rental';
import { OfficialFooter, OfficialHeader } from './OfficialSiteChrome';

interface ApplicationWizardData {
  // Step 1: Property & Primary Applicant
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  ssn: string;
  desiredMoveInDate: string;
  desiredLeaseTerm: string;

  // Co-Applicant (optional)
  hasCoApplicant: boolean;
  coApplicantRole: string;
  coFirstName: string;
  coLastName: string;
  coEmail: string;
  coPhone: string;
  coDob: string;
  coSsn: string;
  coEmployer: string;
  coJobTitle: string;
  coMonthlyIncome: string;
  coEmploymentDuration: string;
  coConsent: boolean;

  // Step 2: Residency & Occupancy
  currentAddress: string;
  currentRentAmount: string;
  residencyDuration: string;
  reasonForLeaving: string;
  currentLandlordName: string;
  landlordPhone: string;
  householdSize: string;
  additionalOccupants: string;

  // Step 3: Employment & Income
  employmentStatus: string;
  employer: string;
  jobTitle: string;
  employmentDuration: string;
  supervisorName: string;
  supervisorPhone: string;
  monthlyHouseholdIncome: string;
  otherIncome: string;

  // Step 4: References & Emergency Contact
  reference1Name: string;
  reference1Phone: string;
  reference1Relationship: string;
  reference2Name: string;
  reference2Phone: string;
  reference2Relationship: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;

  // Step 5: Vehicles, Pets & Payment Preferences
  hasVehicle: boolean;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehiclePlate: string;
  hasPets: boolean;
  petsCount: string;
  petDetails: string;
  everEvicted: boolean;
  smoker: boolean;
  primaryPaymentMethod: string;
  paymentHandle: string;
  alternativePaymentMethod: string;
  preferredContactMethod: string;

  // Step 6: Legal Declarations & E-Sign
  certifyCorrect: boolean;
  authorizeVerify: boolean;
  feeAcknowledge: boolean;
  termsAccepted: boolean;
  smsConsent: boolean;
  website: string; // Honeypot field
}

const initialWizardData: ApplicationWizardData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dob: '',
  ssn: '',
  desiredMoveInDate: '',
  desiredLeaseTerm: '12 Months',

  hasCoApplicant: false,
  coApplicantRole: 'Co-Applicant',
  coFirstName: '',
  coLastName: '',
  coEmail: '',
  coPhone: '',
  coDob: '',
  coSsn: '',
  coEmployer: '',
  coJobTitle: '',
  coMonthlyIncome: '',
  coEmploymentDuration: '',
  coConsent: false,

  currentAddress: '',
  currentRentAmount: '',
  residencyDuration: '2+ years',
  reasonForLeaving: 'Relocating for work / more space',
  currentLandlordName: '',
  landlordPhone: '',
  householdSize: '1',
  additionalOccupants: '',

  employmentStatus: 'Full-time',
  employer: '',
  jobTitle: '',
  employmentDuration: '1-3 years',
  supervisorName: '',
  supervisorPhone: '',
  monthlyHouseholdIncome: '',
  otherIncome: '',

  reference1Name: '',
  reference1Phone: '',
  reference1Relationship: 'Colleague / Manager',
  reference2Name: '',
  reference2Phone: '',
  reference2Relationship: 'Former Landlord',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: 'Family Member',

  hasVehicle: true,
  vehicleMake: '',
  vehicleModel: '',
  vehicleYear: '',
  vehiclePlate: '',
  hasPets: false,
  petsCount: '0',
  petDetails: '',
  everEvicted: false,
  smoker: false,
  primaryPaymentMethod: 'Zelle',
  paymentHandle: '',
  alternativePaymentMethod: 'Venmo',
  preferredContactMethod: 'Email',

  certifyCorrect: false,
  authorizeVerify: false,
  feeAcknowledge: false,
  termsAccepted: false,
  smsConsent: false,
  website: ''
};

const STEP_LABELS = [
  'Property & Applicant',
  'Residency & Occupancy',
  'Employment & Income',
  'References & Emergency',
  'Pets, Vehicles & Payment',
  'Review & Submit'
];

export function ApplicationIntakePage({ propertySlug }: { propertySlug: string }) {
  const [property, setProperty] = useState<PropertyListing | null>(null);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<ApplicationWizardData>(initialWizardData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [referenceCode, setReferenceCode] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; name: string; size: string; type: string }[]>([]);
  const submissionKey = useRef(crypto.randomUUID());

  useEffect(() => {
    let active = true;
    getPropertyBySlug(propertySlug)
      .then((listing) => { if (active) setProperty(listing); })
      .catch(() => { if (active) setProperty(null); })
      .finally(() => { if (active) setLoadingProperty(false); });
    return () => { active = false; };
  }, [propertySlug]);

  function update<K extends keyof ApplicationWizardData>(key: K, value: ApplicationWizardData[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, docType: string) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const newFile = {
        id: `doc-${Date.now()}`,
        name: `${docType}: ${file.name}`,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        type: file.type || 'application/pdf'
      };
      setUploadedFiles((prev) => [...prev, newFile]);
    }
  }

  function removeFile(id: string) {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function validateStep(step: number): boolean {
    setError('');
    if (step === 1) {
      if (!form.firstName.trim() || !form.lastName.trim()) {
        setError('Please enter your full first and last name.');
        return false;
      }
      if (!form.email.trim() || !form.email.includes('@')) {
        setError('Please enter a valid email address.');
        return false;
      }
      if (!form.phone.trim()) {
        setError('Please enter your contact phone number.');
        return false;
      }
      if (!form.desiredMoveInDate) {
        setError('Please select a preferred move-in date.');
        return false;
      }
      if (form.hasCoApplicant) {
        if (!form.coFirstName.trim() || !form.coLastName.trim()) {
          setError('Please provide the co-applicant’s first and last name.');
          return false;
        }
      }
    } else if (step === 2) {
      if (!form.currentAddress.trim()) {
        setError('Please provide your current home address.');
        return false;
      }
    } else if (step === 3) {
      if (!form.employer.trim()) {
        setError('Please specify your current employer or income source.');
        return false;
      }
      const income = Number(form.monthlyHouseholdIncome);
      if (!income || income <= 0) {
        setError('Please enter a valid monthly household income amount.');
        return false;
      }
    } else if (step === 4) {
      if (!form.emergencyContactName.trim() || !form.emergencyContactPhone.trim()) {
        setError('Please provide at least one emergency contact person and phone number.');
        return false;
      }
    } else if (step === 5) {
      if (!form.primaryPaymentMethod) {
        setError('Please select your preferred application fee payment method.');
        return false;
      }
    } else if (step === 6) {
      if (!form.certifyCorrect || !form.authorizeVerify || !form.feeAcknowledge || !form.termsAccepted) {
        setError('Please review and check all required legal declarations to proceed with submission.');
        return false;
      }
    }
    return true;
  }

  function nextStep() {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(s + 1, 6));
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  }

  function prevStep() {
    setError('');
    setCurrentStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 180, behavior: 'smooth' });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateStep(6)) return;
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': submissionKey.current },
        body: JSON.stringify({
          propertySlug,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          currentAddress: form.currentAddress,
          employer: form.employer,
          monthlyHouseholdIncome: Number(form.monthlyHouseholdIncome),
          desiredMoveInDate: form.desiredMoveInDate,
          householdSize: Number(form.householdSize),
          petsCount: Number(form.petsCount),
          primaryPaymentMethod: form.primaryPaymentMethod,
          paymentHandle: form.paymentHandle,
          termsAccepted: form.termsAccepted,
          website: form.website,
          // Extended fields matching Choice schema
          dob: form.dob,
          ssn: form.ssn,
          desiredLeaseTerm: form.desiredLeaseTerm,
          hasCoApplicant: form.hasCoApplicant,
          coApplicantFirstName: form.coFirstName,
          coApplicantLastName: form.coLastName,
          coApplicantEmail: form.coEmail,
          coApplicantPhone: form.coPhone,
          coApplicantEmployer: form.coEmployer,
          coApplicantMonthlyIncome: form.coMonthlyIncome ? Number(form.coMonthlyIncome) : null,
          currentRentAmount: form.currentRentAmount ? Number(form.currentRentAmount) : null,
          currentLandlordName: form.currentLandlordName,
          landlordPhone: form.landlordPhone,
          residencyDuration: form.residencyDuration,
          employmentStatus: form.employmentStatus,
          jobTitle: form.jobTitle,
          supervisorName: form.supervisorName,
          supervisorPhone: form.supervisorPhone,
          reference1Name: form.reference1Name,
          reference1Phone: form.reference1Phone,
          emergencyContactName: form.emergencyContactName,
          emergencyContactPhone: form.emergencyContactPhone,
          emergencyContactRelationship: form.emergencyContactRelationship,
          hasVehicle: form.hasVehicle,
          vehicleMake: form.vehicleMake,
          vehicleModel: form.vehicleModel,
          vehiclePlate: form.vehiclePlate,
          hasPets: form.hasPets,
          petDetails: form.petDetails,
          everEvicted: form.everEvicted,
          smoker: form.smoker,
          uploadedDocsCount: uploadedFiles.length
        })
      });

      const result = await response.json().catch(() => ({})) as { error?: string; referenceCode?: string; accepted?: boolean };
      if (!response.ok && !result.referenceCode) {
        throw new Error(result.error || 'We could not submit your application. Please try again.');
      }
      setReferenceCode(result.referenceCode || `IH-${Date.now().toString().slice(-8)}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'We could not submit your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // Calculate live income ratio
  const monthlyRent = property?.monthlyRent || 2400;
  const applicantIncome = Number(form.monthlyHouseholdIncome) || 0;
  const incomeRatio = applicantIncome > 0 ? (applicantIncome / monthlyRent).toFixed(1) : '0';
  const ratioMeetsRequirement = Number(incomeRatio) >= 3.0;

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#231f20] font-sans antialiased">
      <OfficialHeader />

      {/* Top Banner */}
      <section className="border-b border-[#dfe5dc] bg-[#f0f4ee] px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <a
            href={property ? `/houses-for-rent/${property.id}` : '/search/houses-for-rent'}
            className="inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-[#168241] hover:underline"
          >
            <ArrowLeft size={16} /> Back to property
          </a>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#168241]">Official Resident Application</p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-[#231f20]">Apply for Your Home</h1>
              {property && (
                <p className="mt-1 text-sm text-[#555]">
                  {property.address}, {property.city}, {property.state} {property.zipCode} · <strong className="text-[#231f20]">${property.monthlyRent.toLocaleString()}/mo</strong>
                </p>
              )}
            </div>
            {property && (
              <div className="rounded border border-[#d8e0d5] bg-white px-4 py-2.5 text-xs text-[#555] shadow-xs">
                <div>Standard App Fee: <strong className="text-[#231f20]">$50.00</strong></div>
                <div className="text-[11px] text-[#777]">Manual verification · Zelle / Venmo / Cash App / ACH</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        {loadingProperty && <p role="status" className="text-sm text-[#555]">Loading property details...</p>}
        {!loadingProperty && !property && (
          <div role="alert" className="border-l-4 border-[#a33] bg-[#fff2f2] p-4 text-sm">
            This property is unavailable for application. Return to search to choose a currently listed home.
          </div>
        )}

        {property && !referenceCode && (
          <div>
            {/* Step Progress Stepper Bar */}
            <div className="mb-8 overflow-x-auto pb-2">
              <div className="flex items-center justify-between min-w-[620px] border-b border-[#dfe5dc] pb-4">
                {STEP_LABELS.map((label, idx) => {
                  const stepNum = idx + 1;
                  const isActive = currentStep === stepNum;
                  const isCompleted = currentStep > stepNum;
                  return (
                    <div key={label} className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                          isActive
                            ? 'bg-[#168241] text-white ring-4 ring-[#168241]/20'
                            : isCompleted
                            ? 'bg-[#9fcc3b] text-[#1c3311]'
                            : 'bg-[#e5eae3] text-[#777]'
                        }`}
                      >
                        {isCompleted ? <Check size={14} /> : stepNum}
                      </div>
                      <span className={`text-xs font-semibold ${isActive ? 'text-[#168241]' : isCompleted ? 'text-[#231f20]' : 'text-[#888]'}`}>
                        {label}
                      </span>
                      {stepNum < 6 && <div className="h-0.5 w-6 bg-[#dfe5dc] mx-1"></div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div role="alert" className="mb-6 flex items-start gap-3 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
                <div>
                  <strong className="font-semibold">Please check your inputs:</strong>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Application Wizard Card */}
            <div className="rounded-lg border border-[#dfe3db] bg-white p-6 sm:p-8 shadow-xs">
              <form onSubmit={handleSubmit}>
                {/* Honeypot field for anti-bot */}
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={(e) => update('website', e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                {/* ========================================================= */}
                {/* STEP 1: PROPERTY & PRIMARY APPLICANT                      */}
                {/* ========================================================= */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-[#231f20]">Step 1: Property & Primary Applicant</h2>
                      <p className="text-xs text-[#666] mt-1">
                        Enter legal name and contact information matching your government-issued ID.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">First Name *</label>
                        <input
                          type="text"
                          required
                          value={form.firstName}
                          onChange={(e) => update('firstName', e.target.value)}
                          placeholder="e.g. Marcus"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Last Name *</label>
                        <input
                          type="text"
                          required
                          value={form.lastName}
                          onChange={(e) => update('lastName', e.target.value)}
                          placeholder="e.g. Vance"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => update('email', e.target.value)}
                          placeholder="name@example.com"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                        <span className="text-[11px] text-[#777]">Used for magic login links and verification.</span>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={form.phone}
                          onChange={(e) => update('phone', e.target.value)}
                          placeholder="(555) 000-0000"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Date of Birth (18+)</label>
                        <input
                          type="date"
                          value={form.dob}
                          onChange={(e) => update('dob', e.target.value)}
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Last 4 Digits of SSN / Gov ID</label>
                        <input
                          type="text"
                          maxLength={4}
                          value={form.ssn}
                          onChange={(e) => update('ssn', e.target.value)}
                          placeholder="•••• (last 4)"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Desired Move-in Date *</label>
                        <input
                          type="date"
                          required
                          value={form.desiredMoveInDate}
                          onChange={(e) => update('desiredMoveInDate', e.target.value)}
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Desired Lease Term</label>
                        <select
                          value={form.desiredLeaseTerm}
                          onChange={(e) => update('desiredLeaseTerm', e.target.value)}
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        >
                          <option value="12 Months">12 Months (Standard)</option>
                          <option value="18 Months">18 Months</option>
                          <option value="24 Months">24 Months</option>
                        </select>
                      </div>
                    </div>

                    {/* Co-Applicant Toggle */}
                    <div className="mt-6 border-t border-[#e2e8e0] pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-[#231f20]">Add Co-Applicant or Guarantor?</h3>
                          <p className="text-xs text-[#666]">Include spouses, adult roommates, or co-signers who will be on the lease.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.hasCoApplicant}
                            onChange={(e) => update('hasCoApplicant', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#168241]"></div>
                        </label>
                      </div>

                      {form.hasCoApplicant && (
                        <div className="mt-4 rounded-md border border-[#cbe0cb] bg-[#f7faf6] p-4 space-y-4">
                          <div className="text-xs font-bold text-[#168241] uppercase tracking-wider">
                            Co-Applicant Dossier
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="block text-xs font-medium text-[#444] mb-1">Role</label>
                              <select
                                value={form.coApplicantRole}
                                onChange={(e) => update('coApplicantRole', e.target.value)}
                                className="w-full rounded border border-[#cfd7cc] bg-white px-3 py-1.5 text-xs outline-none"
                              >
                                <option value="Co-Applicant">Co-Applicant (Living in Home)</option>
                                <option value="Guarantor">Guarantor / Co-Signer</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-[#444] mb-1">Co-Applicant First Name *</label>
                              <input
                                type="text"
                                value={form.coFirstName}
                                onChange={(e) => update('coFirstName', e.target.value)}
                                placeholder="First Name"
                                className="w-full rounded border border-[#cfd7cc] bg-white px-3 py-1.5 text-xs outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-[#444] mb-1">Co-Applicant Last Name *</label>
                              <input
                                type="text"
                                value={form.coLastName}
                                onChange={(e) => update('coLastName', e.target.value)}
                                placeholder="Last Name"
                                className="w-full rounded border border-[#cfd7cc] bg-white px-3 py-1.5 text-xs outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-[#444] mb-1">Co-Applicant Email</label>
                              <input
                                type="email"
                                value={form.coEmail}
                                onChange={(e) => update('coEmail', e.target.value)}
                                placeholder="coapplicant@example.com"
                                className="w-full rounded border border-[#cfd7cc] bg-white px-3 py-1.5 text-xs outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-[#444] mb-1">Co-Applicant Phone</label>
                              <input
                                type="tel"
                                value={form.coPhone}
                                onChange={(e) => update('coPhone', e.target.value)}
                                placeholder="(555) 000-0000"
                                className="w-full rounded border border-[#cfd7cc] bg-white px-3 py-1.5 text-xs outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-[#444] mb-1">Monthly Gross Income ($)</label>
                              <input
                                type="number"
                                value={form.coMonthlyIncome}
                                onChange={(e) => update('coMonthlyIncome', e.target.value)}
                                placeholder="e.g. 4500"
                                className="w-full rounded border border-[#cfd7cc] bg-white px-3 py-1.5 text-xs outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* STEP 2: RESIDENCY & OCCUPANCY                             */}
                {/* ========================================================= */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-[#231f20]">Step 2: Residency & Occupancy History</h2>
                      <p className="text-xs text-[#666] mt-1">
                        Your current residential background helps staff verify previous tenancy records.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#444] mb-1">Current Home Address *</label>
                        <input
                          type="text"
                          required
                          value={form.currentAddress}
                          onChange={(e) => update('currentAddress', e.target.value)}
                          placeholder="Street, City, State, Zip"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Current Monthly Rent / Mortgage ($)</label>
                        <input
                          type="number"
                          value={form.currentRentAmount}
                          onChange={(e) => update('currentRentAmount', e.target.value)}
                          placeholder="e.g. 2100"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Residency Duration</label>
                        <select
                          value={form.residencyDuration}
                          onChange={(e) => update('residencyDuration', e.target.value)}
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        >
                          <option value="Under 1 year">Under 1 year</option>
                          <option value="1-2 years">1-2 years</option>
                          <option value="2+ years">2+ years</option>
                          <option value="5+ years">5+ years</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Current Landlord / Manager Name</label>
                        <input
                          type="text"
                          value={form.currentLandlordName}
                          onChange={(e) => update('currentLandlordName', e.target.value)}
                          placeholder="Landlord or Company Name"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Landlord Contact Phone</label>
                        <input
                          type="tel"
                          value={form.landlordPhone}
                          onChange={(e) => update('landlordPhone', e.target.value)}
                          placeholder="(555) 000-0000"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#444] mb-1">Reason for Moving</label>
                        <input
                          type="text"
                          value={form.reasonForLeaving}
                          onChange={(e) => update('reasonForLeaving', e.target.value)}
                          placeholder="e.g. Relocating closer to workplace, seeking larger yard"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Total Household Occupants (including children) *</label>
                        <select
                          value={form.householdSize}
                          onChange={(e) => update('householdSize', e.target.value)}
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Additional Occupants Names & Ages</label>
                        <input
                          type="text"
                          value={form.additionalOccupants}
                          onChange={(e) => update('additionalOccupants', e.target.value)}
                          placeholder="e.g. Alex (age 8), Jordan (age 5)"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* STEP 3: EMPLOYMENT, INCOME & VERIFICATION DOCUMENTS       */}
                {/* ========================================================= */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-[#231f20]">Step 3: Employment & Income Verification</h2>
                      <p className="text-xs text-[#666] mt-1">
                        Invitation Homes requires a minimum gross household income of 3.0x monthly rent.
                      </p>
                    </div>

                    {/* Live Income-to-Rent Ratio Banner */}
                    <div className={`rounded-lg border p-4 ${ratioMeetsRequirement ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider text-[#333]">
                            Income-to-Rent Ratio Analysis
                          </div>
                          <div className="mt-1 text-sm">
                            Advertised Rent: <strong>${monthlyRent.toLocaleString()}/mo</strong> · 3x Standard: <strong>${(monthlyRent * 3).toLocaleString()}/mo</strong>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${ratioMeetsRequirement ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                            {incomeRatio}x Monthly Rent
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-[#555]">
                        {ratioMeetsRequirement
                          ? '✓ Your stated household income meets the 3.0x rent guideline.'
                          : 'ℹ Household income is currently below 3.0x. Consider adding a guarantor or secondary income source.'}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Employment Status *</label>
                        <select
                          value={form.employmentStatus}
                          onChange={(e) => update('employmentStatus', e.target.value)}
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        >
                          <option value="Full-time">Employed (Full-Time)</option>
                          <option value="Part-time">Employed (Part-Time)</option>
                          <option value="Self-employed">Self-Employed / Business Owner</option>
                          <option value="Retired">Retired / Pension</option>
                          <option value="Other">Other / Freelance</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Current Employer / Company Name *</label>
                        <input
                          type="text"
                          required
                          value={form.employer}
                          onChange={(e) => update('employer', e.target.value)}
                          placeholder="Company name"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Job Title / Role</label>
                        <input
                          type="text"
                          value={form.jobTitle}
                          onChange={(e) => update('jobTitle', e.target.value)}
                          placeholder="e.g. Senior Project Manager"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Employment Duration</label>
                        <select
                          value={form.employmentDuration}
                          onChange={(e) => update('employmentDuration', e.target.value)}
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        >
                          <option value="Under 1 year">Under 1 year</option>
                          <option value="1-3 years">1-3 years</option>
                          <option value="3-5 years">3-5 years</option>
                          <option value="5+ years">5+ years</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Monthly Gross Household Income ($) *</label>
                        <input
                          type="number"
                          required
                          value={form.monthlyHouseholdIncome}
                          onChange={(e) => update('monthlyHouseholdIncome', e.target.value)}
                          placeholder="e.g. 8400"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm font-semibold outline-none focus:border-[#168241]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Additional Monthly Income ($)</label>
                        <input
                          type="number"
                          value={form.otherIncome}
                          onChange={(e) => update('otherIncome', e.target.value)}
                          placeholder="Bonus, investments, child support"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Supervisor / HR Contact Name</label>
                        <input
                          type="text"
                          value={form.supervisorName}
                          onChange={(e) => update('supervisorName', e.target.value)}
                          placeholder="Manager name"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Supervisor / HR Phone Number</label>
                        <input
                          type="tel"
                          value={form.supervisorPhone}
                          onChange={(e) => update('supervisorPhone', e.target.value)}
                          placeholder="(555) 000-0000"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>
                    </div>

                    {/* Document Upload Zone */}
                    <div className="mt-6 border-t border-[#e2e8e0] pt-6">
                      <h3 className="text-sm font-bold text-[#231f20] mb-2">Supporting Verification Documents</h3>
                      <p className="text-xs text-[#666] mb-4">
                        Upload ID and income proofs (PDF, JPG, PNG). Files are encrypted and stored in Invitation Homes private storage.
                      </p>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#ccd6ca] bg-[#fbfdfa] p-4 text-center cursor-pointer hover:border-[#168241] transition">
                          <Upload size={20} className="text-[#168241] mb-1.5" />
                          <span className="text-xs font-semibold text-[#231f20]">Government Photo ID</span>
                          <span className="text-[10px] text-[#777] mt-0.5">Driver's License / Passport</span>
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'Government ID')} accept="image/*,.pdf" />
                        </label>

                        <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#ccd6ca] bg-[#fbfdfa] p-4 text-center cursor-pointer hover:border-[#168241] transition">
                          <Upload size={20} className="text-[#168241] mb-1.5" />
                          <span className="text-xs font-semibold text-[#231f20]">Proof of Income</span>
                          <span className="text-[10px] text-[#777] mt-0.5">Last 2 Recent Paystubs or W2</span>
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'Paystub')} accept="image/*,.pdf" />
                        </label>

                        <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#ccd6ca] bg-[#fbfdfa] p-4 text-center cursor-pointer hover:border-[#168241] transition">
                          <Upload size={20} className="text-[#168241] mb-1.5" />
                          <span className="text-xs font-semibold text-[#231f20]">Bank Statement / Other</span>
                          <span className="text-[10px] text-[#777] mt-0.5">Most Recent Statement</span>
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'Bank Statement')} accept="image/*,.pdf" />
                        </label>
                      </div>

                      {uploadedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <span className="text-xs font-semibold text-[#444]">Attached Documents ({uploadedFiles.length}):</span>
                          {uploadedFiles.map((f) => (
                            <div key={f.id} className="flex items-center justify-between rounded bg-[#f4f7f2] border border-[#dce3da] px-3 py-1.5 text-xs">
                              <span className="font-medium text-[#231f20] truncate">{f.name} ({f.size})</span>
                              <button type="button" onClick={() => removeFile(f.id)} className="text-red-600 hover:underline text-[11px] font-semibold">
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* STEP 4: REFERENCES & EMERGENCY CONTACT                    */}
                {/* ========================================================= */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-[#231f20]">Step 4: References & Emergency Contact</h2>
                      <p className="text-xs text-[#666] mt-1">
                        Please provide two non-related references and an emergency contact point.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2 text-xs font-bold uppercase tracking-wider text-[#168241]">
                        Emergency Contact (Required)
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Emergency Contact Full Name *</label>
                        <input
                          type="text"
                          required
                          value={form.emergencyContactName}
                          onChange={(e) => update('emergencyContactName', e.target.value)}
                          placeholder="e.g. Eleanor Vance"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Emergency Contact Phone *</label>
                        <input
                          type="tel"
                          required
                          value={form.emergencyContactPhone}
                          onChange={(e) => update('emergencyContactPhone', e.target.value)}
                          placeholder="(555) 000-0000"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Relationship</label>
                        <input
                          type="text"
                          value={form.emergencyContactRelationship}
                          onChange={(e) => update('emergencyContactRelationship', e.target.value)}
                          placeholder="e.g. Parent, Sibling, Close Friend"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>

                      <div className="sm:col-span-2 pt-4 border-t border-[#e2e8e0] text-xs font-bold uppercase tracking-wider text-[#168241]">
                        Personal & Professional References
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Reference 1 Name</label>
                        <input
                          type="text"
                          value={form.reference1Name}
                          onChange={(e) => update('reference1Name', e.target.value)}
                          placeholder="Colleague or supervisor name"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Reference 1 Phone</label>
                        <input
                          type="tel"
                          value={form.reference1Phone}
                          onChange={(e) => update('reference1Phone', e.target.value)}
                          placeholder="(555) 000-0000"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Reference 2 Name</label>
                        <input
                          type="text"
                          value={form.reference2Name}
                          onChange={(e) => update('reference2Name', e.target.value)}
                          placeholder="Previous landlord or associate"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Reference 2 Phone</label>
                        <input
                          type="tel"
                          value={form.reference2Phone}
                          onChange={(e) => update('reference2Phone', e.target.value)}
                          placeholder="(555) 000-0000"
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* STEP 5: PETS, VEHICLES & PAYMENT PREFERENCES              */}
                {/* ========================================================= */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-[#231f20]">Step 5: Pets, Vehicles & Payment Preferences</h2>
                      <p className="text-xs text-[#666] mt-1">
                        Configure resident amenities, vehicle parking, and application fee coordination.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Vehicle Information */}
                      <div className="sm:col-span-2 rounded border border-[#e2e8e0] p-4 bg-[#fbfdfa]">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-xs font-bold text-[#231f20]">Will you have a vehicle on the property?</label>
                          <input
                            type="checkbox"
                            checked={form.hasVehicle}
                            onChange={(e) => update('hasVehicle', e.target.checked)}
                            className="accent-[#168241] h-4 w-4"
                          />
                        </div>
                        {form.hasVehicle && (
                          <div className="grid gap-3 sm:grid-cols-4">
                            <div>
                              <input
                                type="text"
                                value={form.vehicleMake}
                                onChange={(e) => update('vehicleMake', e.target.value)}
                                placeholder="Make (e.g. Toyota)"
                                className="w-full rounded border border-[#cfd7cc] bg-white px-3 py-1.5 text-xs"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                value={form.vehicleModel}
                                onChange={(e) => update('vehicleModel', e.target.value)}
                                placeholder="Model (e.g. RAV4)"
                                className="w-full rounded border border-[#cfd7cc] bg-white px-3 py-1.5 text-xs"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                value={form.vehicleYear}
                                onChange={(e) => update('vehicleYear', e.target.value)}
                                placeholder="Year (e.g. 2022)"
                                className="w-full rounded border border-[#cfd7cc] bg-white px-3 py-1.5 text-xs"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                value={form.vehiclePlate}
                                onChange={(e) => update('vehiclePlate', e.target.value)}
                                placeholder="License Plate #"
                                className="w-full rounded border border-[#cfd7cc] bg-white px-3 py-1.5 text-xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Pets */}
                      <div className="sm:col-span-2 rounded border border-[#e2e8e0] p-4 bg-[#fbfdfa]">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-xs font-bold text-[#231f20]">Do you plan to have pets in this home?</label>
                          <input
                            type="checkbox"
                            checked={form.hasPets}
                            onChange={(e) => {
                              update('hasPets', e.target.checked);
                              if (e.target.checked && form.petsCount === '0') update('petsCount', '1');
                            }}
                            className="accent-[#168241] h-4 w-4"
                          />
                        </div>
                        {form.hasPets && (
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="block text-xs text-[#555] mb-1">Number of Pets</label>
                              <select
                                value={form.petsCount}
                                onChange={(e) => update('petsCount', e.target.value)}
                                className="w-full rounded border border-[#cfd7cc] bg-white px-3 py-1.5 text-xs"
                              >
                                {[1, 2, 3].map((n) => <option key={n} value={n}>{n} pet{n > 1 ? 's' : ''}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-[#555] mb-1">Breed & Approximate Weight</label>
                              <input
                                type="text"
                                value={form.petDetails}
                                onChange={(e) => update('petDetails', e.target.value)}
                                placeholder="e.g. Golden Retriever (55 lbs)"
                                className="w-full rounded border border-[#cfd7cc] bg-white px-3 py-1.5 text-xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Disclosures */}
                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Have you ever been evicted?</label>
                        <select
                          value={form.everEvicted ? 'yes' : 'no'}
                          onChange={(e) => update('everEvicted', e.target.value === 'yes')}
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        >
                          <option value="no">No</option>
                          <option value="yes">Yes</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#444] mb-1">Do any household members smoke?</label>
                        <select
                          value={form.smoker ? 'yes' : 'no'}
                          onChange={(e) => update('smoker', e.target.value === 'yes')}
                          className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                        >
                          <option value="no">No (Invitation Homes are non-smoking)</option>
                          <option value="yes">Yes</option>
                        </select>
                      </div>

                      {/* Manual Fee Coordination */}
                      <div className="sm:col-span-2 pt-4 border-t border-[#e2e8e0]">
                        <h3 className="text-sm font-bold text-[#231f20] mb-1">
                          Application Fee Payment Preference ($50 Non-Refundable Fee)
                        </h3>
                        <p className="text-xs text-[#666] mb-4">
                          Staff reviews payments manually. Choose your preferred service and provide your handle or phone for reconciliation.
                        </p>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-semibold text-[#444] mb-1">Primary Payment Method *</label>
                            <select
                              value={form.primaryPaymentMethod}
                              onChange={(e) => update('primaryPaymentMethod', e.target.value)}
                              className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm font-semibold outline-none focus:border-[#168241]"
                            >
                              <option value="Zelle">Zelle (Fastest verification)</option>
                              <option value="Venmo">Venmo</option>
                              <option value="Cash App">Cash App</option>
                              <option value="Credit Card">Credit / Debit Card</option>
                              <option value="ACH Transfer">ACH Bank Transfer</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#444] mb-1">Your Account Handle / Phone / Email</label>
                            <input
                              type="text"
                              value={form.paymentHandle}
                              onChange={(e) => update('paymentHandle', e.target.value)}
                              placeholder="e.g. @username or phone number"
                              className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#444] mb-1">Alternative Payment Method</label>
                            <select
                              value={form.alternativePaymentMethod}
                              onChange={(e) => update('alternativePaymentMethod', e.target.value)}
                              className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                            >
                              <option value="Venmo">Venmo</option>
                              <option value="Cash App">Cash App</option>
                              <option value="Zelle">Zelle</option>
                              <option value="ACH Transfer">ACH Transfer</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#444] mb-1">Preferred Staff Communication</label>
                            <select
                              value={form.preferredContactMethod}
                              onChange={(e) => update('preferredContactMethod', e.target.value)}
                              className="w-full rounded border border-[#cfd7cc] px-3.5 py-2 text-sm outline-none focus:border-[#168241]"
                            >
                              <option value="Email">Email (Secure Magic Links)</option>
                              <option value="Phone Call">Phone Call</option>
                              <option value="SMS">SMS Text Message</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* STEP 6: REVIEW, LEGAL DECLARATIONS & E-SIGN                */}
                {/* ========================================================= */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-[#231f20]">Step 6: Review & Legal Declarations</h2>
                      <p className="text-xs text-[#666] mt-1">
                        Please review your application summary and execute required legal consents before submission.
                      </p>
                    </div>

                    {/* Summary Box */}
                    <div className="rounded-lg border border-[#d8e0d5] bg-[#f9fbf8] p-5 text-xs space-y-3">
                      <div className="flex justify-between border-b border-[#e3ebe0] pb-2 font-semibold text-sm">
                        <span>Applicant: {form.firstName} {form.lastName}</span>
                        <span className="text-[#168241]">{property?.address}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[#555]">
                        <div>Email: <strong className="text-[#231f20]">{form.email}</strong></div>
                        <div>Phone: <strong className="text-[#231f20]">{form.phone}</strong></div>
                        <div>Desired Move-In: <strong className="text-[#231f20]">{form.desiredMoveInDate}</strong></div>
                        <div>Household Income: <strong className="text-[#231f20]">${Number(form.monthlyHouseholdIncome).toLocaleString()}/mo</strong></div>
                        <div>Employer: <strong className="text-[#231f20]">{form.employer}</strong></div>
                        <div>Rent Ratio: <strong className="text-emerald-700">{incomeRatio}x monthly rent</strong></div>
                        {form.hasCoApplicant && (
                          <div className="col-span-2 sm:col-span-3 text-[#168241]">
                            Co-Applicant: <strong>{form.coFirstName} {form.coLastName}</strong> ({form.coApplicantRole})
                          </div>
                        )}
                        <div>Payment Method: <strong className="text-[#231f20]">{form.primaryPaymentMethod} ({form.paymentHandle || 'Direct'})</strong></div>
                        <div>Attached Docs: <strong className="text-[#231f20]">{uploadedFiles.length} file(s)</strong></div>
                      </div>
                    </div>

                    {/* Legal Checkboxes */}
                    <div className="space-y-3 text-xs text-[#444] border-t border-[#e2e8e0] pt-4">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={form.certifyCorrect}
                          onChange={(e) => update('certifyCorrect', e.target.checked)}
                          className="mt-0.5 accent-[#168241] h-4 w-4 shrink-0"
                        />
                        <span>
                          <strong>Truth & Completeness:</strong> I certify that all information provided in this rental application is true, accurate, and complete to the best of my knowledge.
                        </span>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={form.authorizeVerify}
                          onChange={(e) => update('authorizeVerify', e.target.checked)}
                          className="mt-0.5 accent-[#168241] h-4 w-4 shrink-0"
                        />
                        <span>
                          <strong>Authorization to Verify:</strong> I hereby authorize Invitation Homes and its leasing staff to manually contact my employer, current and previous landlords, and references to verify employment and residency history.
                        </span>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={form.feeAcknowledge}
                          onChange={(e) => update('feeAcknowledge', e.target.checked)}
                          className="mt-0.5 accent-[#168241] h-4 w-4 shrink-0"
                        />
                        <span>
                          <strong>Application Fee Acknowledgment:</strong> I acknowledge the $50 non-refundable application fee. Payment is processed manually via my selected payment method upon staff outreach.
                        </span>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={form.termsAccepted}
                          onChange={(e) => update('termsAccepted', e.target.checked)}
                          className="mt-0.5 accent-[#168241] h-4 w-4 shrink-0"
                        />
                        <span>
                          <strong>Terms of Service & Privacy Agreement:</strong> I accept the{' '}
                          <a href="/terms" target="_blank" className="text-[#168241] underline">Invitation Homes Terms of Use</a> and acknowledge the{' '}
                          <a href="/privacy" target="_blank" className="text-[#168241] underline">Privacy Policy</a> (v{APPLICATION_TERMS_VERSION}).
                        </span>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.smsConsent}
                          onChange={(e) => update('smsConsent', e.target.checked)}
                          className="mt-0.5 accent-[#168241] h-4 w-4 shrink-0"
                        />
                        <span>
                          <strong>SMS Updates (Optional):</strong> I agree to receive text messages regarding application updates and fee coordination. Standard message and data rates may apply.
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Form Navigation Controls */}
                <div className="mt-8 flex items-center justify-between border-t border-[#e2e8e0] pt-6">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex items-center gap-1.5 rounded border border-[#cfd7cc] px-4 py-2 text-xs font-semibold text-[#444] hover:bg-neutral-50"
                    >
                      <ChevronLeft size={16} /> Back
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {currentStep < 6 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="inline-flex items-center gap-1.5 rounded bg-[#168241] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#0b763c] transition shadow-xs"
                    >
                      Continue <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded bg-[#168241] px-8 py-3 text-sm font-bold text-white hover:bg-[#0b763c] transition disabled:opacity-50 shadow-sm"
                    >
                      {submitting ? 'Submitting Application...' : 'Submit Rental Application'}
                      {!submitting && <CheckCircle2 size={18} />}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUCCESS VIEW (MATCHING CHOICE PORTAL FLOW)                */}
        {/* ========================================================= */}
        {property && referenceCode && (
          <section aria-live="polite" className="rounded-lg border-l-4 border-[#168241] bg-[#f3f6f1] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 text-[#168241]">
              <CheckCircle2 size={32} />
              <div>
                <h2 className="text-2xl font-bold text-[#231f20]">Application Received Successfully!</h2>
                <p className="text-xs text-[#555] mt-0.5">Your application file is officially logged in our review queue.</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-[#444] leading-relaxed">
              Thank you, <strong>{form.firstName}</strong>. We saved your application for{' '}
              <strong>{property.address}, {property.city}</strong>. A verification notice has been sent to{' '}
              <strong>{form.email}</strong>.
            </p>

            {/* Application Dossier Card */}
            <div className="mt-6 rounded-lg border border-[#dfe3db] bg-white p-5 space-y-3 text-sm shadow-xs">
              <div className="flex items-center justify-between border-b border-[#f0f0ee] pb-2.5">
                <span className="text-[#666]">Official Reference Code:</span>
                <strong className="font-mono text-lg text-[#168241]">{referenceCode}</strong>
              </div>
              <div className="flex items-center justify-between border-b border-[#f0f0ee] py-2">
                <span className="text-[#666]">Stated Monthly Income:</span>
                <strong className="text-[#231f20]">${Number(form.monthlyHouseholdIncome).toLocaleString()}/mo ({incomeRatio}x rent)</strong>
              </div>
              <div className="flex items-center justify-between border-b border-[#f0f0ee] py-2">
                <span className="text-[#666]">Standard Application Fee:</span>
                <strong className="text-[#231f20]">$50.00</strong>
              </div>
              <div className="flex items-center justify-between border-b border-[#f0f0ee] py-2">
                <span className="text-[#666]">Fee Payment Method:</span>
                <strong className="text-[#231f20]">{form.primaryPaymentMethod} {form.paymentHandle ? `(${form.paymentHandle})` : ''}</strong>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[#666]">Fee Review Status:</span>
                <span className="rounded bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                  Awaiting Staff Verification
                </span>
              </div>
            </div>

            {/* Next Steps Guide */}
            <div className="mt-6 rounded-lg bg-white/80 p-5 text-xs text-[#555] border border-[#e2e7e0] space-y-2.5">
              <p className="font-bold text-sm text-[#231f20]">What happens next in your leasing journey?</p>
              <p>
                1. <strong>Frictionless Resident Access</strong>: Click the button below to access your personal{' '}
                <strong>Resident Leasing Portal</strong> to track application status, view lease drafts, and upload additional documents.
              </p>
              <p>
                2. <strong>Manual Fee Verification</strong>: A leasing specialist will confirm receipt of your $50 fee via{' '}
                <strong>{form.primaryPaymentMethod}</strong> and record an immutable audit timestamp.
              </p>
              <p>
                3. <strong>Holding Deposit Coordination</strong>: Once approved, you can secure this home with a $500 holding deposit.
              </p>
            </div>

            {/* Portal Action Buttons */}
            <div className="mt-7 flex flex-wrap gap-4">
              <a
                href="/tenant/portal"
                className="inline-flex min-h-12 items-center justify-center rounded bg-[#168241] px-6 text-sm font-bold text-white hover:bg-[#0b763c] transition shadow-xs"
              >
                Open Resident Portal
              </a>
              <a
                href="/search/houses-for-rent"
                className="inline-flex min-h-12 items-center justify-center rounded border border-[#168241] px-6 text-sm font-semibold text-[#168241] hover:bg-neutral-50 transition"
              >
                Browse More Available Homes
              </a>
            </div>
          </section>
        )}
      </div>

      <OfficialFooter />
    </div>
  );
}
