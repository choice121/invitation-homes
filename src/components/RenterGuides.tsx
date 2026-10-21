import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { OfficialFooter, OfficialHeader } from './OfficialSiteChrome';

type GuideItem = {
  title: string;
  body: string;
};

type GuidePage = {
  title: string;
  intro: string;
  sections?: GuideItem[];
  checklist?: string[];
  steps?: GuideItem[];
  fees?: { category: string; amount: string; details: string }[];
};

const pages: Record<string, GuidePage> = {
  '/qualify': {
    title: 'Qualification requirements',
    intro: 'Review the general requirements used when evaluating rental applications. Requirements can vary to comply with local laws.',
    sections: [
      { title: 'Income', body: 'Applicants generally need combined gross monthly income of at least three times the monthly rent. Income must be documented and verified.' },
      { title: 'Occupancy', body: 'The standard occupancy guideline is two people per bedroom, plus one additional person. Local law takes precedence where it differs.' },
      { title: 'Application requirements', body: 'Each adult applicant must complete an application, provide valid government-issued photo identification, and complete the applicable screening process.' },
      { title: 'Finance and credit', body: 'Applications are reviewed using established screening criteria. A favorable credit history and no open bankruptcies are part of the published general guidelines.' },
      { title: 'Leasing history and background', body: 'Applicants are subject to rental-history and criminal-background review. The published general guideline excludes felony convictions within the past six years, subject to applicable law.' },
      { title: 'Animals and pets', body: 'Pet policies, restrictions, deposits, and monthly charges depend on the home and local requirements. Check the property listing and fee guide for details.' }
    ]
  },
  '/before-you-apply': {
    title: 'Before you apply',
    intro: 'A little preparation can help you avoid delays and understand the costs and documents involved before applying.',
    checklist: [
      'Confirm your household meets the published income and screening guidelines.',
      'Have valid U.S. government-issued photo identification ready for each adult applicant.',
      'Gather income and rental-history information; additional documents may be requested during review.',
      'Review the application fee, security deposit, and any market-specific move-in charges.',
      'Check the home’s availability date, pet policy, and listing disclosures before you begin.'
    ],
    sections: [
      { title: 'Documents to apply', body: 'Be ready to provide identity and income documentation when requested. Submit original, unaltered records through the application workflow; do not email sensitive documents.' },
      { title: 'Deposit and move-in charges', body: 'A security deposit of at least one month’s rent is a common baseline. Prorated rent and other charges may apply depending on the home, screening results, location, and lease start date.' },
      { title: 'Home search tips', body: 'Create a profile to save homes and searches. Review listing availability carefully, and use the official home-search experience to confirm current details.' },
      { title: 'Avoid rental scams', body: 'Pay leasing funds only through official Invitation Homes channels. Employees will not ask for your password or request payment by wire transfer or peer-to-peer payment apps.' }
    ]
  },
  '/how-to-apply': {
    title: 'Application process',
    intro: 'Applications are completed online. Homes are leased in the order applications are received, so review the steps and timing before you begin.',
    steps: [
      { title: 'Find a home and apply', body: 'Choose a listing and select Apply Now. Confirm whether it is available now or is a Coming Soon home, since the next steps differ.' },
      { title: 'Create your account and submit the fee', body: 'Create an application account and pay the non-refundable application fee, which is up to $55 per applicant over 18 and may vary by location.' },
      { title: 'Complete and submit the application', body: 'Follow the online steps and provide requested income, identity, and screening information. Eligible applicants may be able to use electronic income verification; supporting documents may still be requested.' },
      { title: 'Receive a decision', body: 'The official site says applicants are typically contacted within two business days. Keep an eye on messages and respond promptly if additional information is needed.' },
      { title: 'Confirm, sign, and prepare to move', body: 'After approval, the required deposit or holding agreement depends on availability status. Follow the deadlines in your official approval notice and lease documents.' }
    ],
    sections: [
      { title: 'Available homes', body: 'For an available home, approval is followed by the security-deposit and lease-signing process. The move-in timing is coordinated with the leasing team.' },
      { title: 'Coming Soon homes', body: 'A Coming Soon home may require a holding agreement and fee after approval. Availability dates can change; rely on the current listing and written notice.' },
      { title: 'Application frequently asked questions', body: 'Processing time, screening results, transfers, and document requests depend on the application. Contact the leasing team for case-specific questions.' }
    ]
  },
  '/fees': {
    title: 'Leasing fees guide',
    intro: 'These are common fee categories and representative published amounts. Charges and availability can vary by location, property, screening result, and lease terms; confirm the current total with the listing and leasing team.',
    fees: [
      { category: 'Application fee', amount: 'Up to $55 per adult applicant', details: 'Non-refundable; may vary by location.' },
      { category: 'Security deposit', amount: 'At least one month’s rent', details: 'May vary based on screening results and local requirements.' },
      { category: 'Coming Soon holding fee', amount: '$500 on applicable homes', details: 'The published guide describes a 48-hour approval deadline; confirm current terms for the specific property.' },
      { category: 'Smart Home service', amount: '$30 monthly; $40 with video doorbell', details: 'Published amounts may vary by location and service availability.' },
      { category: 'Air filter delivery', amount: '$9.95 monthly on eligible homes', details: 'Applies to homes with an HVAC system; local availability may vary.' },
      { category: 'Utility management', amount: '$9.95 service charge where available', details: 'Water, sewer, and trash usage may be billed separately.' },
      { category: 'Pet charges', amount: 'Up to $325 initial per pet; up to $40 monthly per pet', details: 'Rules, deposits, and charges depend on local law and property policy.' },
      { category: 'Pool maintenance', amount: '$120 monthly when applicable', details: 'Only applies to homes with a pool, subject to the lease.' },
      { category: 'HOA or municipal violation administration', amount: '$35 per notice', details: 'As described in the lease and applicable local requirements.' }
    ],
    sections: [
      { title: 'Lease Easy bundle', body: 'Some homes include optional or required service bundles. Check the listing and lease breakdown to see which services apply to the home you are considering.' },
      { title: 'Late fees and other charges', body: 'Late, HOA, municipal, and other charges are governed by the lease and local law. Review the current lease documents for the exact terms.' }
    ]
  }
};

const renterFlow = [
  ['Before you apply', '/before-you-apply'],
  ['Qualification requirements', '/qualify'],
  ['Application process', '/how-to-apply'],
  ['Leasing fees', '/fees']
];

function SectionList({ sections }: { sections: GuideItem[] }) {
  return (
    <div className="divide-y divide-[#dedede] border-y border-[#dedede]">
      {sections.map((section) => (
        <details key={section.title} className="group py-1">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-left text-base font-semibold marker:hidden hover:text-[#168241] [&::-webkit-details-marker]:hidden">
            {section.title}<span aria-hidden="true" className="text-xl font-normal text-[#168241] group-open:hidden">+</span><span aria-hidden="true" className="hidden text-xl font-normal text-[#168241] group-open:inline">−</span>
          </summary>
          <p className="max-w-4xl pb-5 pr-6 text-sm leading-6 text-[#555] sm:text-base">{section.body}</p>
        </details>
      ))}
    </div>
  );
}

export function RenterGuidePage({ path }: { path: string }) {
  const page = pages[path];
  if (!page) return null;

  return (
    <>
      <OfficialHeader />
      <main>
        <section className="bg-[#f3f5f1] px-4 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-[1120px]">
            <p className="text-sm text-[#666]"><a href="/">Home</a><span className="px-2">/</span>Find your home<span className="px-2">/</span>{page.title}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">{page.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[#4c4c4c] sm:text-lg">{page.intro}</p>
            <nav aria-label="Renter application guides" className="mt-7 flex flex-wrap gap-2">
              {renterFlow.map(([label, href]) => <a key={href} href={href} aria-current={href === path ? 'page' : undefined} className={`flex min-h-10 items-center border px-3 text-sm font-medium ${href === path ? 'border-[#168241] bg-white text-[#168241]' : 'border-[#d2d6d0] bg-white/60 hover:border-[#168241]'}`}>{label}</a>)}
            </nav>
          </div>
        </section>

        <div className="mx-auto grid max-w-[1120px] gap-10 px-4 py-10 sm:px-8 sm:py-14 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0">
            {page.checklist && <section className="mb-10">
              <h2 className="mb-5 text-2xl font-semibold">What you need to apply for a rental home</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {page.checklist.map((item) => <li key={item} className="flex gap-3 border border-[#e3e5e1] p-4 text-sm leading-6"><CheckCircle2 size={19} className="mt-0.5 shrink-0 text-[#168241]" />{item}</li>)}
              </ul>
            </section>}

            {page.steps && <section className="mb-10">
              <h2 className="mb-6 text-2xl font-semibold">What to expect when you apply to rent a home</h2>
              <ol className="relative space-y-0 border-l border-[#c9d9c9] pl-6 sm:pl-8">
                {page.steps.map((step, index) => <li key={step.title} className="relative pb-8 last:pb-2">
                  <span className="absolute -left-[34px] top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#168241] text-sm font-semibold text-white sm:-left-[42px]">{index + 1}</span>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#555] sm:text-base">{step.body}</p>
                </li>)}
              </ol>
            </section>}

            {page.fees && <section className="mb-10">
              <h2 className="mb-5 text-2xl font-semibold">Common fees and charges</h2>
              <div className="divide-y divide-[#dedede] border-y border-[#dedede]">
                {page.fees.map((fee) => <article key={fee.category} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(200px,0.7fr)] sm:gap-6">
                  <div><h3 className="font-semibold">{fee.category}</h3><p className="mt-1 text-sm leading-5 text-[#666]">{fee.details}</p></div>
                  <p className="text-sm font-semibold text-[#168241] sm:text-right">{fee.amount}</p>
                </article>)}
              </div>
            </section>}

            {page.sections && <section className="mb-10">
              <h2 className="mb-5 text-2xl font-semibold">{path === '/qualify' ? 'Qualification details' : path === '/fees' ? 'More about leasing costs' : path === '/how-to-apply' ? 'Application details' : 'Helpful information'}</h2>
              <SectionList sections={page.sections} />
            </section>}

            <section className="border-t border-[#dedede] py-8">
              <h2 className="text-2xl font-semibold">Ready to find your home?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#555]">Review current availability and property-specific terms before beginning an application.</p>
              <a href="/search/houses-for-rent" className="mt-5 inline-flex min-h-12 items-center gap-2 bg-[#168241] px-6 text-sm font-semibold text-white hover:bg-[#0b763c]">Search homes<ArrowRight size={16} /></a>
            </section>
          </div>

          <aside className="h-fit border-t-2 border-[#168241] bg-[#f5f6f3] p-5 lg:sticky lg:top-28">
            <h2 className="text-base font-semibold">Renter resources</h2>
            <ul className="mt-3 divide-y divide-[#deded8]">
              {renterFlow.filter(([, href]) => href !== path).map(([label, href]) => <li key={href}><a href={href} className="flex min-h-12 items-center justify-between gap-2 text-sm hover:text-[#168241]">{label}<ArrowRight size={15} /></a></li>)}
            </ul>
            <a href="/search/houses-for-rent" className="mt-5 block text-sm font-semibold text-[#168241] hover:underline">Search homes</a>
          </aside>
        </div>
      </main>
      <OfficialFooter />
    </>
  );
}