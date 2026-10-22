import { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getPropertyBySlug } from '../services/propertyRepository';
import { APPLICATION_TERMS, APPLICATION_TERMS_VERSION } from '../services/applicationTerms';
import { PropertyListing } from '../types/rental';
import { OfficialFooter, OfficialHeader } from './OfficialSiteChrome';

interface ApplicationFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentAddress: string;
  employer: string;
  monthlyHouseholdIncome: string;
  desiredMoveInDate: string;
  householdSize: string;
  petsCount: string;
  primaryPaymentMethod: string;
  paymentHandle: string;
  termsAccepted: boolean;
  website: string;
}

const initialValues: ApplicationFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  currentAddress: '',
  employer: '',
  monthlyHouseholdIncome: '',
  desiredMoveInDate: '',
  householdSize: '1',
  petsCount: '0',
  primaryPaymentMethod: 'Zelle',
  paymentHandle: '',
  termsAccepted: false,
  website: ''
};

export function ApplicationIntakePage({ propertySlug }: { propertySlug: string }) {
  const [property, setProperty] = useState<PropertyListing | null>(null);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [form, setForm] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [referenceCode, setReferenceCode] = useState('');
  const submissionKey = useRef(crypto.randomUUID());

  useEffect(() => {
    let active = true;
    getPropertyBySlug(propertySlug)
      .then((listing) => { if (active) setProperty(listing); })
      .catch(() => { if (active) setProperty(null); })
      .finally(() => { if (active) setLoadingProperty(false); });
    return () => { active = false; };
  }, [propertySlug]);

  function update<K extends keyof ApplicationFormValues>(key: K, value: ApplicationFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
          website: form.website
        })
      });
      const result = await response.json().catch(() => ({})) as { error?: string; referenceCode?: string };
      if (!response.ok) throw new Error(result.error || 'We could not submit your application. Please try again.');
      setReferenceCode(result.referenceCode || '');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'We could not submit your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <OfficialHeader />
      <main className="min-h-[70vh] bg-white">
        <section className="border-b border-[#dfe5dc] bg-[#f3f6f1] px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-[1040px]">
            <a href={property ? `/houses-for-rent/${property.id}` : '/search/houses-for-rent'} className="inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-[#168241]"><ArrowLeft size={16} />Back to property</a>
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-[#168241]">Rental application</p>
            <h1 className="mt-2 text-3xl font-semibold">Apply for a home</h1>
            {property && <p className="mt-2 text-sm text-[#555]">{property.address}, {property.city}, {property.state} {property.zipCode}</p>}
          </div>
        </section>

        <div className="mx-auto grid max-w-[1040px] gap-10 px-4 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            {loadingProperty && <p role="status" className="text-sm text-[#555]">Loading property details...</p>}
            {!loadingProperty && !property && <div role="alert" className="border-l-4 border-[#a33] bg-[#fff2f2] p-4 text-sm">This property is unavailable for application. Return to search to choose a currently listed home.</div>}
            {property && referenceCode && (
              <section aria-live="polite" className="rounded border-l-4 border-[#168241] bg-[#f3f6f1] p-6 shadow-sm">
                <div className="flex items-center gap-2.5 text-[#168241]">
                  <CheckCircle2 size={26} />
                  <h2 className="text-xl font-bold text-[#231f20]">Application Draft Created!</h2>
                </div>
                <p className="mt-2 text-sm text-[#555]">
                  We saved your application and sent a secure verification link to <strong>{form.email}</strong>. Confirm the link within 30 minutes to complete submission.
                </p>

                <div className="mt-5 rounded border border-[#dfe3db] bg-white p-4 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between border-b border-[#f0f0ee] pb-2">
                    <span className="text-[#666]">Application Reference:</span>
                    <strong className="font-mono text-base text-[#168241]">{referenceCode}</strong>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#f0f0ee] py-2">
                    <span className="text-[#666]">Standard Application Fee:</span>
                    <strong className="text-[#231f20]">$50.00</strong>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#f0f0ee] py-2">
                    <span className="text-[#666]">Fee Payment Status:</span>
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Unpaid — Awaiting Coordination</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[#666]">Indicated Payment Service:</span>
                    <strong className="text-[#231f20]">{form.primaryPaymentMethod} {form.paymentHandle ? `(${form.paymentHandle})` : ''}</strong>
                  </div>
                </div>

                <div className="mt-5 space-y-2 rounded bg-white/70 p-4 text-xs text-[#555] border border-[#e5e8e2]">
                  <p className="font-semibold text-[#231f20]">What happens next?</p>
                  <p>1. <strong>Email Verification</strong>: Click the verification link sent to your inbox to officially verify your contact information.</p>
                  <p>2. <strong>Fee Coordination</strong>: An Invitation Homes leasing coordinator will reach out using your preferred method (<strong>{form.primaryPaymentMethod}</strong>) to confirm the $50 application fee.</p>
                  <p>3. <strong>Background & Screening</strong>: Once fee payment is verified, your screening will be activated immediately.</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="/tenant/portal" className="inline-flex min-h-11 items-center justify-center rounded bg-[#168241] px-5 text-sm font-semibold text-white hover:bg-[#0b763c]">
                    Go to Resident Portal
                  </a>
                  <a href="/search/houses-for-rent" className="inline-flex min-h-11 items-center justify-center rounded border border-[#168241] px-5 text-sm font-semibold text-[#168241] hover:bg-neutral-50">
                    Return to Home Search
                  </a>
                </div>
              </section>
            )}

            {property && !referenceCode && <form onSubmit={submit} className="space-y-8">
              <section>
                <h2 className="text-lg font-semibold">Applicant details</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold">First name<input required maxLength={100} autoComplete="given-name" value={form.firstName} onChange={(event) => update('firstName', event.target.value)} className="mt-1 min-h-11 w-full border border-[#cfcfcf] px-3 font-normal" /></label>
                  <label className="text-sm font-semibold">Last name<input required maxLength={100} autoComplete="family-name" value={form.lastName} onChange={(event) => update('lastName', event.target.value)} className="mt-1 min-h-11 w-full border border-[#cfcfcf] px-3 font-normal" /></label>
                  <label className="text-sm font-semibold">Email<input required type="email" maxLength={254} autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} className="mt-1 min-h-11 w-full border border-[#cfcfcf] px-3 font-normal" /></label>
                  <label className="text-sm font-semibold">Phone<input required type="tel" maxLength={32} autoComplete="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} className="mt-1 min-h-11 w-full border border-[#cfcfcf] px-3 font-normal" /></label>
                  <label className="text-sm font-semibold sm:col-span-2">Current address<input required maxLength={500} autoComplete="street-address" value={form.currentAddress} onChange={(event) => update('currentAddress', event.target.value)} className="mt-1 min-h-11 w-full border border-[#cfcfcf] px-3 font-normal" /></label>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold">Household and move-in</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold">Employer<input required maxLength={200} autoComplete="organization" value={form.employer} onChange={(event) => update('employer', event.target.value)} className="mt-1 min-h-11 w-full border border-[#cfcfcf] px-3 font-normal" /></label>
                  <label className="text-sm font-semibold">Monthly household income<input required type="number" min="0" step="0.01" inputMode="decimal" value={form.monthlyHouseholdIncome} onChange={(event) => update('monthlyHouseholdIncome', event.target.value)} className="mt-1 min-h-11 w-full border border-[#cfcfcf] px-3 font-normal" /></label>
                  <label className="text-sm font-semibold">Preferred move-in date<input required type="date" value={form.desiredMoveInDate} onChange={(event) => update('desiredMoveInDate', event.target.value)} className="mt-1 min-h-11 w-full border border-[#cfcfcf] px-3 font-normal" /></label>
                  <label className="text-sm font-semibold">Household size<input required type="number" min="1" max="20" step="1" value={form.householdSize} onChange={(event) => update('householdSize', event.target.value)} className="mt-1 min-h-11 w-full border border-[#cfcfcf] px-3 font-normal" /></label>
                  <label className="text-sm font-semibold">Number of pets<input required type="number" min="0" max="10" step="1" value={form.petsCount} onChange={(event) => update('petsCount', event.target.value)} className="mt-1 min-h-11 w-full border border-[#cfcfcf] px-3 font-normal" /></label>
                </div>
              </section>

              <section className="rounded border border-[#dfe3db] bg-[#f9faf8] p-5">
                <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                  <h2 className="text-base font-semibold text-[#231f20]">Application Fee & Payment Coordination</h2>
                  <span className="w-fit rounded bg-[#168241]/10 px-2.5 py-0.5 text-xs font-bold text-[#168241]">$50.00 / Applicant</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-[#666]">
                  A $50 application fee is required to activate background and credit screening. No payment is charged right now. Choose your preferred service, and our leasing team will contact you to coordinate verification.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold">
                    Preferred Payment Service
                    <select
                      value={form.primaryPaymentMethod}
                      onChange={(event) => update('primaryPaymentMethod', event.target.value)}
                      className="mt-1 min-h-11 w-full border border-[#cfcfcf] bg-white px-3 font-normal"
                    >
                      <option value="Zelle">Zelle</option>
                      <option value="Venmo">Venmo</option>
                      <option value="Cash App">Cash App</option>
                      <option value="Apple Pay">Apple Pay</option>
                      <option value="PayPal">PayPal</option>
                      <option value="Credit / Debit Card">Credit / Debit Card</option>
                      <option value="Bank Transfer (ACH)">Bank Transfer (ACH)</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold">
                    Payment Handle / Tag (Optional)
                    <input
                      maxLength={100}
                      placeholder="e.g. $cashtag, @venmo, or phone"
                      value={form.paymentHandle}
                      onChange={(event) => update('paymentHandle', event.target.value)}
                      className="mt-1 min-h-11 w-full border border-[#cfcfcf] bg-white px-3 font-normal"
                    />
                  </label>
                </div>
              </section>

              <div className="hidden" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update('website', event.target.value)} /></label></div>
              <details className="border-y border-[#dedede] py-3">
                <summary className="cursor-pointer text-sm font-semibold">Application terms, version {APPLICATION_TERMS_VERSION}</summary>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-5 text-[#555]">{APPLICATION_TERMS.map((term) => <li key={term}>{term}</li>)}</ul>
              </details>
              <label className="flex items-start gap-3 text-sm leading-6"><input required type="checkbox" checked={form.termsAccepted} onChange={(event) => update('termsAccepted', event.target.checked)} className="mt-1 h-4 w-4 accent-[#168241]" /><span>I have read and agree to the application terms above.</span></label>
              <p className="text-xs leading-5 text-[#666]">Do not enter Social Security numbers or upload identity documents here. Screening and document collection are not enabled in this application flow.</p>
              {error && <p role="alert" className="border-l-4 border-[#a33] bg-[#fff2f2] p-3 text-sm text-[#822]">{error}</p>}
              <button type="submit" disabled={submitting || loadingProperty} className="min-h-12 bg-[#168241] px-6 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit application'}</button>
            </form>}
          </div>

          <aside className="h-fit border-t-2 border-[#168241] bg-[#f5f6f3] p-5">
            <h2 className="text-base font-semibold">Before you submit</h2>
            <ul className="mt-3 space-y-3 text-sm leading-5 text-[#555]">
              <li>Check your property details and preferred move-in date.</li>
              <li>Verify your email within 30 minutes to complete submission.</li>
              <li>After verification, your reference number will identify your application.</li>
              <li>Application review and screening are not performed by this form.</li>
            </ul>
            {property && <p className="mt-5 border-t border-[#d8ddd5] pt-4 text-sm font-semibold">Advertised rent: ${property.monthlyRent.toLocaleString()}/month</p>}
          </aside>
        </div>
      </main>
      <OfficialFooter />
    </>
  );
}
