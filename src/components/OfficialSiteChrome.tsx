import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const OFFICIAL_NAVIGATION = [
  {
    label: 'Find your home',
    links: [
      ['Search locations', '/search/houses-for-rent'],
      ['Rental communities', '/communities/'],
      ['Qualification requirements', '/qualify'],
      ['Before you apply', '/before-you-apply'],
      ['Application process', '/how-to-apply'],
      ['Leasing fees', '/fees']
    ]
  },
  {
    label: 'Our difference',
    links: [
      ['Why Invitation Homes', '/difference'],
      ['ProCare maintenance', '/procare'],
      ['Resident services', '/lease-easy'],
      ['Smart Home', '/smarthomes'],
      ['Pet friendly', '/pet-friendly-homes-for-lease'],
      ['Resident offers', '/offers']
    ]
  },
  {
    label: 'Resources',
    links: [
      ['Help Center', 'https://invitationhomes.zendesk.com'],
      ['Resident responsibilities', '/resident-responsibilities'],
      ['Move in', '/welcome-home'],
      ['Renewal', '/renewal-process'],
      ['Move out', '/moveoutguide'],
      ['Pool information', '/your-invitation-homes-swimming-pool'],
      ['Fraud prevention', '/fraud-prevention']
    ]
  },
  {
    label: 'About',
    links: [
      ['Our story', '/about-us'],
      ['Sustainability', '/sustainability'],
      ['Investors', 'https://www.invh.com/'],
      ['Vendors', '/vendor-partnerships'],
      ['Careers', 'https://careers.invitationhomes.com/']
    ]
  }
];

export function OfficialHeader() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="bg-[#231f20] text-white">
        <div className="mx-auto flex min-h-9 max-w-[1440px] items-center justify-end gap-5 px-4 text-[11px] sm:px-8">
          <a href="/staff/applications" className="font-semibold text-[#9fcc3b] hover:underline">Staff Review</a>
          <a href="https://invitationhomes.com/payments" className="hover:text-[#9fcc3b]">Pay my rent</a>
          <a href="/maintenance-service-requests" className="hidden hover:text-[#9fcc3b] sm:inline">Request maintenance</a>
          <a href="/faq" className="hidden hover:text-[#9fcc3b] md:inline">Help Center</a>
          <a href="/profile/login" className="hover:text-[#9fcc3b]">Login / Sign up</a>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-[#e6e6e6] bg-white">
        <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between px-4 sm:px-8">
          <a href="/" aria-label="Invitation Homes home" className="flex shrink-0 items-center">
            <img src="/icons/logo.svg" alt="Invitation Homes" className="h-10 w-auto sm:h-11" />
          </a>
          <nav aria-label="Main navigation" className="hidden h-full items-center lg:flex">
            {OFFICIAL_NAVIGATION.map((group) => (
              <div className="relative flex h-full items-center" key={group.label}>
                <button
                  type="button"
                  aria-expanded={activeMenu === group.label}
                  onClick={() => setActiveMenu(activeMenu === group.label ? null : group.label)}
                  className="flex min-h-12 items-center gap-2 px-3 text-[14px] font-semibold hover:text-[#168241]"
                >
                  {group.label}<ChevronDown aria-hidden="true" size={14} />
                </button>
                {activeMenu === group.label && (
                  <div className="absolute left-0 top-full z-50 min-w-64 border border-[#e5e5e5] bg-white py-2 shadow-lg">
                    {group.links.map(([label, href]) => (
                      <a key={href} href={href} onClick={() => setActiveMenu(null)} className="block px-5 py-2.5 text-sm hover:bg-[#f5f7f4] hover:text-[#168241]">
                        {label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-11 w-11 items-center justify-center lg:hidden"
          >
            <img src="/icons/hamburger.svg" alt="" className="h-6 w-6" />
          </button>
        </div>
        {mobileMenuOpen && (
          <nav id="mobile-navigation" aria-label="Mobile navigation" className="max-h-[calc(100dvh-112px)] overflow-y-auto border-t border-[#e6e6e6] bg-white px-4 py-2 lg:hidden">
            {OFFICIAL_NAVIGATION.map((group) => (
              <section key={group.label} className="border-b border-[#eeeeee] py-1">
                <button type="button" aria-expanded={activeMenu === group.label} onClick={() => setActiveMenu(activeMenu === group.label ? null : group.label)} className="flex min-h-12 w-full items-center justify-between py-2 text-left text-base font-semibold">
                  {group.label}<span aria-hidden="true" className="text-[#168141]">{activeMenu === group.label ? '−' : '+'}</span>
                </button>
                {activeMenu === group.label && (
                  <div className="pb-2 pl-3">
                    {group.links.map(([label, href]) => <a key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="block min-h-11 py-3 text-sm text-[#444]">{label}</a>)}
                  </div>
                )}
              </section>
            ))}
            <div className="grid grid-cols-2 gap-x-4 border-t border-[#eeeeee] py-3 text-sm">
              <a className="py-2" href="https://invitationhomes.com/payments">Pay my rent</a>
              <a className="py-2" href="/maintenance-service-requests">Request maintenance</a>
              <a className="py-2" href="/faq">Help Center</a>
              <a className="py-2" href="/profile/login">Login / Sign up</a>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}

export function OfficialFooter() {
  return (
    <footer className="bg-[#231f20] px-4 py-12 text-white sm:px-8">
      <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <img src="/icons/logo.svg" alt="Invitation Homes" className="h-9 w-auto brightness-0 invert" />
          <a href="/contact-us" className="mt-5 block text-sm text-white/75 hover:text-white">Contact Us</a>
        </div>
        {OFFICIAL_NAVIGATION.map((group) => (
          <div key={group.label}>
            <h2 className="mb-3 text-sm font-semibold">{group.label}</h2>
            <ul className="space-y-2">
              {group.links.map(([label, href]) => <li key={href}><a href={href} className="text-xs leading-5 text-white/70 hover:text-white">{label}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-9 flex max-w-[1240px] flex-col gap-4 border-t border-white/20 pt-5 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
        <span>Invitation Homes Inc. © 2026 All Rights Reserved.</span>
        <div className="flex flex-wrap gap-4"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/privacy">Do Not Sell</a><button type="button">Cookie Preference</button></div>
      </div>
    </footer>
  );
}