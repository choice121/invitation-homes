import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  ArrowRight, 
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  MapPin,
  Calendar,
  Smartphone,
  Shield,
  Wrench,
  Clock,
  Check
} from 'lucide-react';
import { 
  InvitationLogo,
  SearchIcon,
  LocationPinIcon,
  CheckmarkIcon,
  UserAvatarIcon,
  EqualHousingIcon,
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  LinkedInIcon
} from './InvitationIcons';
import { SAMPLE_PROPERTIES } from '../data/properties';
import { PropertyListing } from '../types/rental';

interface MarketItem {
  name: string;
  state: string;
  homesCount: number;
  region: 'sunbelt' | 'west' | 'midwest';
  avgRent: string;
}

const MARKETS: MarketItem[] = [
  { name: 'Atlanta', state: 'GA', homesCount: 808, region: 'sunbelt', avgRent: '$2,150' },
  { name: 'Carolinas', state: 'NC/SC', homesCount: 432, region: 'sunbelt', avgRent: '$2,080' },
  { name: 'Dallas-Fort Worth', state: 'TX', homesCount: 335, region: 'sunbelt', avgRent: '$2,290' },
  { name: 'Houston', state: 'TX', homesCount: 154, region: 'sunbelt', avgRent: '$2,100' },
  { name: 'Jacksonville', state: 'FL', homesCount: 131, region: 'sunbelt', avgRent: '$2,050' },
  { name: 'Orlando', state: 'FL', homesCount: 366, region: 'sunbelt', avgRent: '$2,380' },
  { name: 'South Florida / Miami', state: 'FL', homesCount: 342, region: 'sunbelt', avgRent: '$3,100' },
  { name: 'Tampa', state: 'FL', homesCount: 587, region: 'sunbelt', avgRent: '$2,420' },
  { name: 'Austin', state: 'TX', homesCount: 45, region: 'sunbelt', avgRent: '$2,450' },
  { name: 'Phoenix', state: 'AZ', homesCount: 493, region: 'west', avgRent: '$2,190' },
  { name: 'Denver', state: 'CO', homesCount: 210, region: 'west', avgRent: '$2,650' },
  { name: 'Las Vegas', state: 'NV', homesCount: 139, region: 'west', avgRent: '$2,200' },
  { name: 'Seattle', state: 'WA', homesCount: 140, region: 'west', avgRent: '$2,950' },
  { name: 'Southern California', state: 'CA', homesCount: 97, region: 'west', avgRent: '$3,400' },
  { name: 'Northern California', state: 'CA', homesCount: 93, region: 'west', avgRent: '$3,250' },
  { name: 'Chicago', state: 'IL', homesCount: 70, region: 'midwest', avgRent: '$2,320' },
  { name: 'Minneapolis', state: 'MN', homesCount: 61, region: 'midwest', avgRent: '$2,180' }
];

export const InvitationHomesApp: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [bedFilter, setBedFilter] = useState('any');
  const [maxPrice, setMaxPrice] = useState('any');
  const [activeMarketTab, setActiveMarketTab] = useState<'all' | 'sunbelt' | 'west' | 'midwest'>('sunbelt');
  const [activePillar, setActivePillar] = useState<number>(0);
  const [selectedTourProperty, setSelectedTourProperty] = useState<PropertyListing | null>(null);
  const [tourStep, setTourStep] = useState<'form' | 'confirmed'>('form');
  const [tourDate, setTourDate] = useState('Today at 3:00 PM');
  const [savedProperties, setSavedProperties] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNavDropdown, setActiveNavDropdown] = useState<string | null>(null);

  const filteredMarkets = MARKETS.filter((m) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.state.toLowerCase().includes(q);
    }
    if (activeMarketTab === 'all') return true;
    return m.region === activeMarketTab;
  });

  const filteredProperties = SAMPLE_PROPERTIES.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = p.city.toLowerCase().includes(q) || p.state.toLowerCase().includes(q) || p.zipCode.includes(q);
      if (!match) return false;
    }
    if (bedFilter !== 'any' && p.bedrooms < parseInt(bedFilter)) return false;
    if (maxPrice !== 'any' && p.monthlyRent > parseInt(maxPrice)) return false;
    return true;
  });

  const pillars = [
    {
      title: 'More value',
      subtitle: 'Updated homes with smart tech & premium finishes',
      image: 'https://images.ctfassets.net/lb8pxg8729el/6pej8fzJpko7GeIKHjnYvf/8d88deee2974036859b4a4ba6bbe696a/Home_Page__More_value_2.jpg',
      points: [
        'Updated designer kitchens with modern appliances',
        'Smart Home lock, thermostat, and leak sensor suite',
        'High-speed internet and streaming app connectivity'
      ]
    },
    {
      title: 'More simplicity',
      subtitle: 'Frictionless digital home leasing',
      image: 'https://images.ctfassets.net/lb8pxg8729el/3C0DnDdcICuAtjvZrRv8Ya/990eb8ef3862152a840cdbb75f19b662/Home_Page__Seamless_1.jpg',
      points: [
        'Self-guided smart lock tours on your schedule',
        '100% paperless digital lease application & signature',
        '1-tap rent payments and intuitive mobile management'
      ]
    },
    {
      title: 'More flexibility',
      subtitle: 'Spaces built for your entire family and pets',
      image: 'https://images.ctfassets.net/lb8pxg8729el/7c0bFEpqFYSm48ptOQpqpU/72f1eaea87929e8f3906867394658e29/Home_Page__Flexibility_2.jpg',
      points: [
        'Private fenced backyards for pets and recreation',
        'Pet-friendly: Bring up to 3 pets with no weight limits',
        'Flexible lease lengths from 12 to 24 months'
      ]
    },
    {
      title: 'More Genuine CARE™',
      subtitle: 'Dedicated local property teams',
      image: 'https://images.ctfassets.net/lb8pxg8729el/4qk51PK0dpnmxugLggAVOQ/55b8be349310f0448a843331932ca083/Home_Page__Pros_2.jpg',
      points: [
        'Full-time ProCare certified maintenance professionals',
        'Comprehensive 300-point pre-move-in home inspection',
        '24/7 emergency maintenance dispatch'
      ]
    }
  ];

  const testimonials = [
    {
      quote: "Since moving into our Invitation Homes leased property 3 years ago, we have been nothing but satisfied with the proactive service and smart home tech.",
      author: "Alice Marie C.",
      city: "Atlanta, GA"
    },
    {
      quote: "As a military family with pets, having a fenced yard and a company that truly welcomes dogs made all the difference in our relocation.",
      author: "Marcus & Elena R.",
      city: "Phoenix, AZ"
    },
    {
      quote: "Self-guided tours let us visit homes after work on our own schedule. We signed our lease online and had keys in 48 hours.",
      author: "David T.",
      city: "Dallas, TX"
    }
  ];

  return (
    <div className="w-full bg-white text-slate-900 font-sans antialiased selection:bg-[#04a54f] selection:text-white">
      {/* 1. Official Top Utility Bar */}
      <div className="bg-[#231f20] text-slate-300 text-xs py-2 px-4 sm:px-8 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-[#9fcc3b] font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9fcc3b] animate-pulse"></span>
            <span>America&apos;s Premier Home Leasing Company • NYSE: INVH</span>
          </div>

          <div className="flex items-center gap-5 text-xs font-semibold">
            <a href="#pay-rent" className="hover:text-white transition flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#9fcc3b]"></span> Pay Rent
            </a>
            <a href="#maintenance" className="hover:text-white transition hidden sm:inline">
              Maintenance
            </a>
            <a href="#resident-services" className="hover:text-white transition hidden md:inline">
              Resident Services
            </a>
            <a href="#help" className="hover:text-white transition hidden lg:inline">
              Help Center
            </a>
            <button 
              onClick={() => alert(`You have ${savedProperties.length} saved homes.`)}
              className="flex items-center gap-1 text-slate-300 hover:text-white transition"
            >
              <Heart className={`w-3.5 h-3.5 ${savedProperties.length > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
              <span>Saved ({savedProperties.length})</span>
            </button>
            <a href="#login" className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-neutral-700 transition">
              <UserAvatarIcon className="w-3.5 h-3.5 text-neutral-300" />
              <span>Resident Login</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Official Main Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20">
          <div className="flex items-center gap-10">
            {/* Official Invitation Homes Vector Brand Logo */}
            <a href="/" className="flex items-center gap-2 select-none group">
              <img 
                src="/icons/logo.svg" 
                alt="Invitation Homes" 
                className="h-9 sm:h-11 w-auto object-contain transition duration-200 group-hover:opacity-90"
              />
            </a>

            {/* Desktop Navigation Links with Dropdown Menus */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-bold text-[#231f20]">
              {/* Find your home */}
              <div 
                className="relative py-6"
                onMouseEnter={() => setActiveNavDropdown('find')}
                onMouseLeave={() => setActiveNavDropdown(null)}
              >
                <button className="flex items-center gap-1 hover:text-[#04a54f] transition py-1">
                  <span>Find your home</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
                {activeNavDropdown === 'find' && (
                  <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 py-3 px-2 z-50 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-150">
                    <a href="#search" className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#04a54f] transition">Search locations</a>
                    <a href="#communities" className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#04a54f] transition">Rental communities</a>
                    <a href="#qualification" className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#04a54f] transition">Qualification requirements</a>
                    <a href="#before-apply" className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#04a54f] transition">Before you apply</a>
                    <a href="#fees" className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#04a54f] transition">Leasing fees &amp; process</a>
                  </div>
                )}
              </div>

              {/* Our difference */}
              <div 
                className="relative py-6"
                onMouseEnter={() => setActiveNavDropdown('difference')}
                onMouseLeave={() => setActiveNavDropdown(null)}
              >
                <button className="flex items-center gap-1 hover:text-[#04a54f] transition py-1">
                  <span>Our difference</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
                {activeNavDropdown === 'difference' && (
                  <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 py-3 px-2 z-50 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-150">
                    <a href="#why-invh" className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#04a54f] transition">Why Invitation Homes</a>
                    <a href="#procare" className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#04a54f] transition">ProCare maintenance</a>
                    <a href="#smart-home" className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#04a54f] transition">Smart Home features</a>
                    <a href="#pet-friendly" className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#04a54f] transition">Pet friendly living</a>
                    <a href="#offers" className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#04a54f] transition">Resident offers &amp; perks</a>
                  </div>
                )}
              </div>

              {/* Resources */}
              <div 
                className="relative py-6"
                onMouseEnter={() => setActiveNavDropdown('resources')}
                onMouseLeave={() => setActiveNavDropdown(null)}
              >
                <button className="flex items-center gap-1 hover:text-[#04a54f] transition py-1">
                  <span>Resources</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
                {activeNavDropdown === 'resources' && (
                  <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 py-3 px-2 z-50 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-150">
                    <a href="#help-center" className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#04a54f] transition">Help Center &amp; FAQs</a>
                    <a href="#move-in" className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#04a54f] transition">Move in guide</a>
                    <a href="#renewal" className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#04a54f] transition">Lease renewal</a>
                    <a href="#move-out" className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#04a54f] transition">Move out procedures</a>
                  </div>
                )}
              </div>

              {/* About */}
              <a href="#about" className="hover:text-[#04a54f] transition">
                About
              </a>
            </nav>
          </div>

          {/* Right Header CTAs */}
          <div className="flex items-center gap-3">
            <a
              href="#search"
              className="hidden sm:inline-flex px-5 py-2.5 rounded-full border border-slate-300 hover:border-[#04a54f] text-slate-800 hover:text-[#04a54f] text-xs font-bold transition"
            >
              Browse Homes
            </a>
            <a
              href="#apply"
              className="px-6 py-2.5 rounded-full bg-[#04a54f] hover:bg-[#0b763c] text-white text-xs font-extrabold shadow-md shadow-[#04a54f]/25 transition"
            >
              Apply Now
            </a>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 py-4 px-2 space-y-2 text-sm font-bold text-slate-800 bg-white shadow-xl rounded-b-2xl">
            <a href="#search" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl hover:bg-slate-50">Find your home</a>
            <a href="#our-difference" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl hover:bg-slate-50">Our difference</a>
            <a href="#resources" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl hover:bg-slate-50">Resources</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl hover:bg-slate-50">About</a>
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <a href="#login" className="flex-1 py-2 text-center rounded-xl bg-slate-100 text-xs font-bold text-slate-800">Resident Login</a>
              <a href="#apply" className="flex-1 py-2 text-center rounded-xl bg-[#04a54f] text-xs font-bold text-white">Apply Now</a>
            </div>
          </div>
        )}
      </header>

      {/* 3. Official Hero Section */}
      <section className="relative min-h-[560px] flex items-center justify-center text-center px-4 sm:px-8 py-20 bg-neutral-900 overflow-hidden">
        {/* Background Photo from Invitation Homes Contentful CDN */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-45 scale-105 transform transition duration-1000"
          style={{ backgroundImage: `url('https://images.ctfassets.net/lb8pxg8729el/1jZH5tiQ6VHPXwwgIA1swI/2972ba86931bd5760c9314ba2e2fc8eb/02-1867_Tohoqua_Blvd.jpg')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#231f20] via-neutral-900/60 to-transparent"></div>

        <div className="relative z-10 max-w-4xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#04a54f]/90 text-white text-xs font-extrabold uppercase tracking-wider mb-5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-lime-300" />
            80,000+ Homes • 16 Premier US Metro Markets
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Live freer. <span className="text-[#9fcc3b]">Lease a house.</span>
          </h1>

          <p className="mt-4 text-base sm:text-xl text-neutral-200 max-w-2xl mx-auto font-medium leading-relaxed">
            Updated single-family rental homes in top neighborhoods with fenced backyards, Smart Home technology, and pet-friendly living.
          </p>

          {/* Interactive Search Box */}
          <div id="search" className="mt-8 bg-white p-3 sm:p-4 rounded-2xl shadow-2xl max-w-3xl mx-auto border border-slate-200 text-left">
            <div className="flex flex-col sm:flex-row gap-2.5">
              {/* City or Zip Input */}
              <div className="flex-1 flex items-center gap-2.5 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus-within:border-[#04a54f] focus-within:bg-white transition">
                <LocationPinIcon className="w-5 h-5 text-[#04a54f] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by city, street, or zip code (e.g. Atlanta, Dallas, 30301)..."
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                />
              </div>

              {/* Beds Filter */}
              <div className="flex gap-2">
                <select
                  value={bedFilter}
                  onChange={(e) => setBedFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#04a54f]"
                >
                  <option value="any">Any Beds</option>
                  <option value="3">3+ Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                  <option value="5">5+ Bedrooms</option>
                </select>

                {/* Price Filter */}
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#04a54f]"
                >
                  <option value="any">Max Price</option>
                  <option value="2200">$2,200/mo</option>
                  <option value="2600">$2,600/mo</option>
                  <option value="3200">$3,200/mo</option>
                  <option value="4500">$4,500/mo</option>
                </select>

                {/* Search Button with Official Search SVG */}
                <button 
                  onClick={() => {
                    const el = document.getElementById('featured-listings');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-[#04a54f] hover:bg-[#0b763c] text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-[#04a54f]/30 transition shrink-0"
                >
                  <SearchIcon className="w-4 h-4 text-white" />
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Popular quick links */}
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 flex-wrap px-1">
              <span className="font-semibold text-slate-400">Popular:</span>
              {['Atlanta', 'Dallas', 'Phoenix', 'Orlando', 'Tampa', 'Carolinas'].map((city) => (
                <button
                  key={city}
                  onClick={() => setSearchQuery(city)}
                  className="hover:text-[#04a54f] hover:underline"
                >
                  {city}
                </button>
              ))}
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="ml-auto text-[#04a54f] font-semibold hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. "A lease that comes with more" - 4 Value Pillars */}
      <section id="our-difference" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-[#04a54f] font-extrabold text-xs uppercase tracking-widest">
            The Invitation Homes Standard
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#231f20] mt-1 tracking-tight">
            A lease that comes with more
          </h2>
          <p className="mt-3 text-slate-600 text-base leading-relaxed">
            There’s the old way to rent a home, then there’s our way. Professionally managed, updated single-family homes with Genuine CARE™.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              onClick={() => setActivePillar(idx)}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden bg-white cursor-pointer group flex flex-col ${
                activePillar === idx
                  ? 'border-[#04a54f] ring-2 ring-[#04a54f]/20 shadow-xl'
                  : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={pillar.image}
                  alt={pillar.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-[#231f20] group-hover:text-[#04a54f] transition">
                    {pillar.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#04a54f] mt-0.5 mb-3">
                    {pillar.subtitle}
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-600">
                    {pillar.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <CheckmarkIcon className="w-4 h-4 text-[#04a54f] shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#04a54f]">
                  <span>Learn more</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Featured Rental Properties */}
      <section id="featured-listings" className="py-20 px-4 sm:px-8 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[#04a54f] font-extrabold text-xs uppercase tracking-widest">
                Move-In Ready Houses
              </span>
              <h2 className="text-3xl font-extrabold text-[#231f20] mt-1">
                Featured Single-Family Homes for Lease
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Tour privately with keyless Smart Home locks and submit an online application in minutes.
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-500">
              Showing {filteredProperties.length} available single-family homes
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProperties.map((prop) => (
              <div 
                key={prop.id} 
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    <img 
                      src={prop.featuredImage} 
                      alt={prop.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                    <div className="absolute top-3 left-3 bg-[#04a54f] text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
                      ${prop.monthlyRent.toLocaleString()}/mo
                    </div>
                    <button 
                      onClick={() => {
                        setSavedProperties(prev => 
                          prev.includes(prop.id) ? prev.filter(id => id !== prop.id) : [...prev, prop.id]
                        );
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-rose-500 backdrop-blur shadow-sm transition"
                    >
                      <Heart className={`w-4 h-4 ${savedProperties.includes(prop.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-1">
                      <span>{prop.bedrooms} Beds</span>
                      <span>•</span>
                      <span>{prop.bathrooms} Baths</span>
                      <span>•</span>
                      <span>{prop.squareFeet.toLocaleString()} sqft</span>
                    </div>

                    <h3 className="font-extrabold text-[#231f20] text-sm group-hover:text-[#04a54f] transition line-clamp-1">
                      {prop.title}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <LocationPinIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{prop.address}, {prop.city}, {prop.state}</span>
                    </p>

                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-bold text-[#04a54f] bg-emerald-50 px-2 py-0.5 rounded-full">
                        ✓ Smart Home
                      </span>
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                        ✓ Fenced Yard
                      </span>
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                        ✓ Pet Friendly
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => {
                      setSelectedTourProperty(prop);
                      setTourStep('form');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#231f20] hover:bg-[#04a54f] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Schedule Self-Guided Tour</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Authentic Invitation Homes Manifesto */}
      <section className="bg-gradient-to-r from-[#0b763c] via-[#04a54f] to-[#168241] text-white py-16 px-4 sm:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="text-[#9fcc3b] text-xs uppercase tracking-widest font-extrabold">
            Reinventing the Single-Family Lease
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mt-2 leading-snug">
            &ldquo;There’s the old way to rent a home, then there’s our way.&rdquo;
          </h2>
          <p className="mt-4 text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            At Invitation Homes, we offer pet-friendly, yard-having homes for rent with Smart Home technology in awesome neighborhoods across the country. Live in a great house without the headache and long-term commitment of owning. Some might call that entitled. <strong className="text-white">We call it smart.</strong>
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a 
              href="#search"
              className="px-7 py-3 rounded-full bg-[#9fcc3b] hover:bg-[#8ebb2f] text-[#231f20] font-extrabold text-sm shadow-lg transition"
            >
              Explore Available Neighborhoods
            </a>
            <a 
              href="#apply"
              className="px-7 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/30 backdrop-blur transition"
            >
              Learn Qualification Requirements
            </a>
          </div>
        </div>
      </section>

      {/* 7. 16 Premier US Metro Markets Directory */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-[#04a54f] font-extrabold text-xs uppercase tracking-widest">
              16 Premier Metro Hubs
            </span>
            <h2 className="text-3xl font-extrabold text-[#231f20] mt-1">
              Discover Homes in Your Preferred Location
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Select a metro area to explore available houses for rent:
            </p>
          </div>

          {/* Region Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveMarketTab('sunbelt')}
              className={`px-3.5 py-2 rounded-lg transition ${activeMarketTab === 'sunbelt' ? 'bg-white text-[#04a54f] shadow-sm font-bold' : 'hover:text-slate-900'}`}
            >
              Sunbelt Hubs
            </button>
            <button
              onClick={() => setActiveMarketTab('west')}
              className={`px-3.5 py-2 rounded-lg transition ${activeMarketTab === 'west' ? 'bg-white text-[#04a54f] shadow-sm font-bold' : 'hover:text-slate-900'}`}
            >
              West Coast &amp; Mountain
            </button>
            <button
              onClick={() => setActiveMarketTab('midwest')}
              className={`px-3.5 py-2 rounded-lg transition ${activeMarketTab === 'midwest' ? 'bg-white text-[#04a54f] shadow-sm font-bold' : 'hover:text-slate-900'}`}
            >
              Midwest
            </button>
            <button
              onClick={() => setActiveMarketTab('all')}
              className={`px-3.5 py-2 rounded-lg transition ${activeMarketTab === 'all' ? 'bg-white text-[#04a54f] shadow-sm font-bold' : 'hover:text-slate-900'}`}
            >
              All Regions ({MARKETS.length})
            </button>
          </div>
        </div>

        {/* Markets Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMarkets.map((m, idx) => (
            <div
              key={idx}
              onClick={() => {
                setSearchQuery(m.name);
                const el = document.getElementById('featured-listings');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#04a54f] hover:shadow-lg transition duration-200 group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-[#04a54f] bg-emerald-50 px-2.5 py-1 rounded-full">
                    {m.homesCount.toLocaleString()} homes
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    Avg. {m.avgRent}
                  </span>
                </div>
                <h3 className="font-extrabold text-[#231f20] text-base group-hover:text-[#04a54f] transition">
                  {m.name}, {m.state}
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 group-hover:text-[#04a54f] font-bold transition">
                <span>View listings</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. "Home-leasing, simplified" 3-Step Process */}
      <section className="py-20 px-4 sm:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[#04a54f] font-extrabold text-xs uppercase tracking-widest">
              Straightforward Process
            </span>
            <h2 className="text-3xl font-extrabold text-[#231f20] mt-1">
              Home-leasing, simplified
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Everything you need to find, apply, and move into your dream single-family rental house.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#04a54f] flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-lg font-extrabold text-[#231f20]">Before you apply</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Whether you’re new to leasing or have rented houses for years, we make finding your home smooth with transparent criteria and zero surprises.
              </p>
              <a href="#qualification" className="inline-flex items-center gap-1 text-xs font-bold text-[#04a54f] mt-4 hover:underline">
                <span>See helpful tips</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#04a54f] flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-lg font-extrabold text-[#231f20]">Qualification requirements</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                You’re on your way to worry-free leasing. Review our clear credit, income, and background qualification standards in advance.
              </p>
              <a href="#qualification" className="inline-flex items-center gap-1 text-xs font-bold text-[#04a54f] mt-4 hover:underline">
                <span>Review requirements</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#04a54f] flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-lg font-extrabold text-[#231f20]">Application process</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Apply 100% online in under 15 minutes. Secure document uploads, digital verification, and swift application status updates.
              </p>
              <a href="#apply" className="inline-flex items-center gap-1 text-xs font-bold text-[#04a54f] mt-4 hover:underline">
                <span>Learn about applying</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Real Residents Share Their Stories */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[#04a54f] font-extrabold text-xs uppercase tracking-widest">
            Resident Reviews
          </span>
          <h2 className="text-3xl font-extrabold text-[#231f20] mt-1">
            Real residents share their stories
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Discover why over 80,000 households choose to lease their single-family home with Invitation Homes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <p className="text-slate-700 text-sm italic leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-[#231f20] text-xs">{t.author}</h4>
                  <p className="text-[11px] text-slate-500">{t.city}</p>
                </div>
                <div className="flex text-amber-400 text-xs">
                  ★★★★★
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Official Authentic Footer */}
      <footer className="bg-[#231f20] text-slate-400 py-16 px-4 sm:px-8 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b border-neutral-800">
          <div className="col-span-2">
            {/* White Inverted Official Logo */}
            <div className="mb-5">
              <img 
                src="/icons/logo.svg" 
                alt="Invitation Homes" 
                className="h-9 w-auto filter brightness-0 invert" 
              />
            </div>
            <p className="text-slate-400 leading-relaxed text-xs max-w-sm mb-6">
              The nation&apos;s premier home leasing company, providing professionally managed, updated single-family homes in prime school districts and desirable neighborhoods across America.
            </p>

            {/* Official Social Vectors */}
            <div className="flex items-center gap-3">
              <a href="https://facebook.com/InvitationHomesWeb" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-neutral-800 hover:text-white hover:bg-neutral-700 transition">
                <FacebookIcon className="w-4 h-4 text-slate-300" />
              </a>
              <a href="https://instagram.com/invitationhomes" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-neutral-800 hover:text-white hover:bg-neutral-700 transition">
                <InstagramIcon className="w-4 h-4 text-slate-300" />
              </a>
              <a href="https://youtube.com/user/InvitationHomes" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-neutral-800 hover:text-white hover:bg-neutral-700 transition">
                <YouTubeIcon className="w-4 h-4 text-slate-300" />
              </a>
              <a href="https://linkedin.com/company/invitation-homes" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-neutral-800 hover:text-white hover:bg-neutral-700 transition">
                <LinkedInIcon className="w-4 h-4 text-slate-300" />
              </a>
            </div>
          </div>

          <div>
            <div className="text-white font-bold text-sm mb-4">Find your home</div>
            <ul className="space-y-2.5">
              <li><a href="#search" className="hover:text-white transition">Search locations</a></li>
              <li><a href="#communities" className="hover:text-white transition">Rental communities</a></li>
              <li><a href="#qualification" className="hover:text-white transition">Qualification guidelines</a></li>
              <li><a href="#fees" className="hover:text-white transition">Leasing fees breakdown</a></li>
              <li><a href="#map" className="hover:text-white transition">Property search map</a></li>
            </ul>
          </div>

          <div>
            <div className="text-white font-bold text-sm mb-4">Our difference</div>
            <ul className="space-y-2.5">
              <li><a href="#why-invh" className="hover:text-white transition">Why Invitation Homes</a></li>
              <li><a href="#procare" className="hover:text-white transition">ProCare maintenance</a></li>
              <li><a href="#smart-home" className="hover:text-white transition">Smart Home features</a></li>
              <li><a href="#pet-friendly" className="hover:text-white transition">Pet friendly living</a></li>
              <li><a href="#offers" className="hover:text-white transition">Resident perks &amp; offers</a></li>
            </ul>
          </div>

          <div>
            <div className="text-white font-bold text-sm mb-4">Equal Housing &amp; Legal</div>
            <div className="flex items-center gap-3 mb-4">
              <EqualHousingIcon className="w-10 h-10 text-slate-300 shrink-0" />
              <div className="text-[11px] text-slate-300 font-semibold leading-tight">
                Equal Housing<br />Opportunity
              </div>
            </div>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#privacy" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#fraud" className="hover:text-white transition">Fraud Prevention</a></li>
              <li><a href="#accessibility" className="hover:text-white transition">Accessibility</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 Invitation Homes Inc. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:text-slate-300">Privacy</a>
            <span>•</span>
            <a href="#terms" className="hover:text-slate-300">Terms</a>
            <span>•</span>
            <a href="#sitemap" className="hover:text-slate-300">Site Map</a>
          </div>
        </div>
      </footer>

      {/* Self-Guided Smart Tour Scheduler Modal */}
      {selectedTourProperty && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#04a54f]"></span>
                <h3 className="font-extrabold text-[#231f20] text-base">Schedule Self-Guided Tour</h3>
              </div>
              <button 
                onClick={() => setSelectedTourProperty(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {tourStep === 'form' ? (
              <div className="mt-4 space-y-4">
                <div className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <img 
                    src={selectedTourProperty.featuredImage} 
                    alt={selectedTourProperty.title} 
                    className="w-16 h-16 rounded-lg object-cover" 
                  />
                  <div>
                    <h4 className="font-extrabold text-[#231f20] text-xs sm:text-sm">{selectedTourProperty.title}</h4>
                    <p className="text-[11px] text-slate-500">{selectedTourProperty.address}, {selectedTourProperty.city}</p>
                    <p className="text-xs font-bold text-[#04a54f] mt-1">${selectedTourProperty.monthlyRent.toLocaleString()}/month</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Tour Time:</label>
                  <select 
                    value={tourDate} 
                    onChange={(e) => setTourDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium"
                  >
                    <option>Today at 3:00 PM</option>
                    <option>Today at 5:00 PM</option>
                    <option>Tomorrow at 10:00 AM</option>
                    <option>Tomorrow at 2:00 PM</option>
                    <option>Saturday at 11:00 AM</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name:</label>
                    <input type="text" placeholder="Alex Morgan" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number:</label>
                    <input type="tel" placeholder="(555) 000-0000" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" />
                  </div>
                </div>

                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-xs text-emerald-800">
                  <p className="font-semibold flex items-center gap-1.5">
                    <CheckmarkIcon className="w-3.5 h-3.5 text-[#04a54f]" />
                    <span>Instant Smart Lock PIN generated automatically</span>
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-1">Tour privately on your schedule without an agent present.</p>
                </div>

                <button
                  onClick={() => setTourStep('confirmed')}
                  className="w-full py-3 bg-[#04a54f] hover:bg-[#0b763c] text-white font-extrabold text-xs rounded-xl shadow-md transition"
                >
                  Confirm Self-Guided Tour
                </button>
              </div>
            ) : (
              <div className="mt-4 text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#04a54f] flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <h4 className="font-extrabold text-base text-[#231f20]">Tour Confirmed!</h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Your Smart Lock PIN code for <strong>{selectedTourProperty.address}</strong> has been sent to your phone for <strong>{tourDate}</strong>.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 font-mono text-sm font-bold text-slate-800 tracking-wider">
                  ENTRY PIN: 7824#
                </div>
                <button
                  onClick={() => setSelectedTourProperty(null)}
                  className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
