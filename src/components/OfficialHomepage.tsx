import { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Wrench } from 'lucide-react';
import { OfficialFooter, OfficialHeader } from './OfficialSiteChrome';
import { SearchIcon } from './InvitationIcons';

const markets = [
  { name: 'Atlanta', homes: 810, group: 'South', slug: 'atlanta-georgia' },
  { name: 'Austin', homes: 5, group: 'South', slug: 'austin-texas' },
  { name: 'Carolinas', homes: 434, group: 'South', slug: 'charlotte-north-carolina' },
  { name: 'Chicago', homes: 70, group: 'Midwest', slug: 'chicago-illinois' },
  { name: 'Dallas', homes: 335, group: 'South', slug: 'dallas-texas' },
  { name: 'Denver', homes: 209, group: 'West', slug: 'denver-colorado' },
  { name: 'Houston', homes: 155, group: 'South', slug: 'houston-texas' },
  { name: 'Jacksonville', homes: 130, group: 'South', slug: 'jacksonville-florida' },
  { name: 'Las Vegas', homes: 141, group: 'West', slug: 'las-vegas-nevada' },
  { name: 'Minneapolis', homes: 62, group: 'Midwest', slug: 'minneapolis-minnesota' },
  { name: 'Northern California', homes: 95, group: 'West', slug: 'sacramento-california' },
  { name: 'Orlando', homes: 368, group: 'South', slug: 'orlando-florida' },
  { name: 'Phoenix', homes: 494, group: 'West', slug: 'phoenix-arizona' },
  { name: 'Salt Lake City', homes: 11, group: 'West', slug: 'salt-lake-city-utah' },
  { name: 'San Antonio', homes: null, group: 'South', slug: 'san-antonio-texas' },
  { name: 'Seattle', homes: 139, group: 'West', slug: 'seattle-washington' },
  { name: 'South Florida/Miami', homes: 339, group: 'South', slug: 'miami-florida' },
  { name: 'Southern California', homes: 98, group: 'West', slug: 'los-angeles-california' },
  { name: 'Tampa', homes: 584, group: 'South', slug: 'tampa-florida' },
  { name: 'Nashville', homes: 80, group: 'South', slug: 'nashville-tennessee' }
];

const pillars = [
  {
    title: 'More value',
    points: ['Updated homes', 'Smart Home technology', 'High-speed internet and streaming apps'],
    image: 'https://images.ctfassets.net/lb8pxg8729el/6pej8fzJpko7GeIKHjnYvf/8d88deee2974036859b4a4ba6bbe696a/Home_Page__More_value_2.jpg'
  },
  {
    title: 'More simplicity',
    points: ['Self-guided tours', 'Online application & payments', 'Intuitive mobile apps'],
    image: 'https://images.ctfassets.net/lb8pxg8729el/3C0DnDdcICuAtjvZrRv8Ya/990eb8ef3862152a840cdbb75f19b662/Home_Page__Seamless_1.jpg'
  },
  {
    title: 'More flexibility',
    points: ['Live in a dream neighborhood', 'Flexible lease length (12 to 24 months)', 'Bring up to 3 pets'],
    image: 'https://images.ctfassets.net/lb8pxg8729el/7c0bFEpqFYSm48ptOQpqpU/72f1eaea87929e8f3906867394658e29/Home_Page__Flexibility_2.jpg'
  },
  {
    title: 'More Genuine CARE™',
    points: ['Friendly, skilled professionals', 'Service built on Genuine CARE', 'Home maintenance, handled'],
    image: 'https://images.ctfassets.net/lb8pxg8729el/4qk51PK0dpnmxugLggAVOQ/55b8be349310f0448a843331932ca083/Home_Page__Pros_2.jpg'
  }
];

const services = [
  {
    title: 'ProCare™ service',
    subtitle: 'Resident-friendly, proactive service.',
    description: 'As a valued resident, you’ll get the VIP treatment with proactive maintenance visits and 24/7 emergency services available throughout the lease.',
    href: '/procare'
  },
  {
    title: 'Lease Easy™ bundle',
    subtitle: '3 great services in 1 easy bundle.',
    description: 'Smart Home Technology with keyless access and temperature control, Air Filter Delivery, and Utility Management all come standard for a small monthly fee.',
    href: '/lease-easy'
  },
  {
    title: 'Pet-friendly homes',
    subtitle: 'Welcoming spaces for your pets.',
    description: 'Your furry friends are going to love your new home, yard, and neighborhood. Up to 3 pets are welcome. Additional deposits and fees may apply.',
    href: '/pet-friendly-homes-for-lease'
  },
  {
    title: 'Add-on services',
    subtitle: 'Lawn care & pest control discounts just for being a resident.',
    description: 'Take it easy with TaskEasy and let the pros handle lawn care. Our partnership with Terminix can help protect your home from pests.',
    href: '/offers'
  }
];

const testimonials = [
  {
    quote: 'Since moving into our Invitation Homes leased property 3 years ago, we have been nothing but satisfied.',
    name: 'Alice Marie C.',
    city: 'Atlanta, GA'
  },
  {
    quote: 'As a military family with pets, we tend to have to move around a lot. Renting from Invitation Homes was easy, and their pet policy made it an easy decision on who to rent from.',
    name: 'Amy T.',
    city: 'Dallas, TX'
  },
  {
    quote: 'We completely loved using Invitation Homes for our rental search. Agent Carol Taylor got in touch with us right away and is very good at staying in touch throughout the process. Very friendly, nice and personable.',
    name: 'Ina G.',
    city: 'Seattle, WA'
  },
  {
    quote: 'We love leasing with Invitation Homes because our home is close to a school, is located in a safe cul-de-sac, and has a huge backyard for play and company.',
    name: 'Laura B.',
    city: 'Denver, CO'
  }
];

export function OfficialHomepage() {
  const [activeRegion, setActiveRegion] = useState('All');
  const [activeService, setActiveService] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [location, setLocation] = useState('');

  const visibleMarkets = activeRegion === 'All' ? markets : markets.filter((market) => market.group === activeRegion);

  return (
    <div className="min-h-screen overflow-hidden bg-white text-[#231f20]">
      <OfficialHeader />

      <main>
        <section className="relative flex min-h-[510px] items-center justify-center px-4 py-16 text-center sm:min-h-[570px] sm:px-8">
          <img
            src="https://images.ctfassets.net/lb8pxg8729el/1jZH5tiQ6VHPXwwgIA1swI/2972ba86931bd5760c9314ba2e2fc8eb/02-1867_Tohoqua_Blvd.jpg"
            alt="A single-family Invitation Homes rental home"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#231f20]/85 via-[#231f20]/35 to-[#231f20]/10" />
          <div className="relative z-10 mx-auto w-full max-w-5xl">
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-[60px]">Live freer. <span className="text-[#9fcc3b]">Lease a house.</span></h1>
            <form action="/search/houses-for-rent" className="mx-auto mt-8 flex max-w-4xl flex-col gap-2 bg-white p-2.5 text-left shadow-xl sm:flex-row sm:items-center sm:rounded-sm">
              <label className="flex min-h-12 flex-1 items-center gap-3 border border-[#d6d6d6] px-4 focus-within:border-[#168241]">
                <span className="sr-only">Search by city, street, or zip code</span>
                <input name="location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Search by city, street, or zip code*" className="w-full bg-transparent text-sm outline-none placeholder:text-[#666]" />
              </label>
              <button type="submit" className="flex min-h-12 items-center justify-center gap-2 bg-[#168241] px-7 text-sm font-bold text-white hover:bg-[#0b763c]">
                <SearchIcon className="h-[17px] w-[17px]" aria-hidden="true" />Search
              </button>
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-4 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
            <h2 className="text-3xl font-semibold sm:text-[40px]">A lease that comes with more</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="min-w-0">
                <img src={pillar.image} alt="" loading="lazy" className="aspect-[1.45] w-full object-cover" />
                <div className="pt-4">
                  <h3 className="text-2xl font-semibold text-[#168241]">{pillar.title}</h3>
                  <ul className="mt-3 space-y-2 text-[15px] leading-6 text-[#454545]">
                    {pillar.points.map((point) => <li key={point} className="flex gap-2"><span aria-hidden="true" className="text-[#168241]">✓</span><span>{point}</span></li>)}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[#f4f5f2] px-4 py-14 text-center sm:px-8 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-semibold leading-tight sm:text-[40px]">There’s the old way to rent a home, then there’s our way.</h2>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-[#4c4c4c] sm:text-lg">
              At Invitation Homes, we offer pet-friendly, yard-having homes for rent with Smart Home technology in awesome neighborhoods across the country. Live in a great house without the headache and long-term commitment of owning. Some might call that entitled. We call it smart.
            </p>
            <a href="/search/houses-for-rent" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 bg-[#168241] px-7 text-sm font-bold text-white hover:bg-[#0b763c]">Discover your dream home<ArrowRight size={17} /></a>
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-4 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold sm:text-[40px]">You just want to be you. We have a home for that.</h2>
            <p className="mt-3 text-base text-[#555]">Search homes for rent by region.</p>
          </div>
          <div className="mb-7 flex justify-center gap-2" role="tablist" aria-label="Market regions">
            {['All', 'West', 'South', 'Midwest'].map((region) => (
              <button key={region} type="button" role="tab" aria-selected={activeRegion === region} onClick={() => setActiveRegion(region)} className={`min-h-11 min-w-16 border-b-2 px-4 text-sm font-semibold ${activeRegion === region ? 'border-[#168241] text-[#168241]' : 'border-transparent text-[#4c4c4c] hover:text-[#168241]'}`}>
                {region}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-0 sm:grid-cols-3 lg:grid-cols-5">
            {visibleMarkets.map((market) => (
              <a key={market.slug} href={`/markets/houses-for-rent/${market.slug}`} className="flex min-h-[66px] items-center justify-between gap-2 border-b border-[#e5e5e5] py-3 text-sm hover:text-[#168241]">
                <span className="font-medium">{market.name}<span className="mt-1 block text-xs font-normal text-[#707070]">{market.homes === null ? 'View homes' : `${market.homes} homes`}</span></span>
                <ArrowRight size={15} aria-hidden="true" className="shrink-0" />
              </a>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-5">
            <p className="text-sm">Not finding what you need? View the property search map.</p>
            <a href="/search/houses-for-rent" className="inline-flex min-h-11 items-center gap-2 border border-[#168241] px-5 text-sm font-semibold text-[#168241] hover:bg-[#168241] hover:text-white">Go now<ArrowRight size={15} /></a>
          </div>
        </section>

        <section className="bg-[#f4f5f2] px-4 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-[1240px] items-center gap-8 md:grid-cols-2 md:gap-14">
            <div className="order-2 md:order-1">
              <p className="text-sm font-semibold uppercase text-[#168241]">Premier communities</p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight sm:text-[40px]">Brand-new houses for rent with high-quality amenities</h2>
              <p className="mt-4 text-base leading-7 text-[#4c4c4c]">Lease a home in 1 of our premier communities of newly built single-family homes in select locations across the country. Be among the first to lease 1 of these spacious homes and enjoy our worry-free leasing lifestyle. The houses are first come, first serve so get your application in before it’s too late!</p>
              <a href="/communities/" className="mt-6 inline-flex min-h-12 items-center gap-2 bg-[#168241] px-6 text-sm font-bold text-white hover:bg-[#0b763c]">Explore our communities<ArrowRight size={17} /></a>
            </div>
            <img src="https://images.ctfassets.net/lb8pxg8729el/1jZH5tiQ6VHPXwwgIA1swI/2972ba86931bd5760c9314ba2e2fc8eb/02-1867_Tohoqua_Blvd.jpg" alt="A newly built single-family rental home" loading="lazy" className="order-1 aspect-[1.4] w-full object-cover md:order-2" />
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-4 py-14 sm:px-8 sm:py-20">
          <div className="mb-9 text-center">
            <h2 className="text-3xl font-semibold sm:text-[40px]">Get all the home - with none of the hassle.</h2>
            <p className="mt-3 text-base text-[#555]">Home-leasing, simplified</p>
          </div>
          <div className="grid grid-cols-2 gap-2 overflow-x-auto border-b border-[#e5e5e5] sm:flex sm:justify-center sm:gap-8">
            {services.map((service, index) => (
              <button key={service.title} type="button" aria-pressed={activeService === index} onClick={() => setActiveService(index)} className={`min-h-14 border-b-2 px-2 text-left text-sm font-semibold sm:text-center ${activeService === index ? 'border-[#168241] text-[#168241]' : 'border-transparent text-[#444]'}`}>
                {service.title}
              </button>
            ))}
          </div>
          <article className="mx-auto grid max-w-5xl items-center gap-8 py-8 md:grid-cols-2 md:gap-14">
            <div className="aspect-[1.45] bg-[#f4f5f2]" style={{ backgroundImage: `url('${pillars[(activeService + 1) % pillars.length].image}')`, backgroundPosition: 'center', backgroundSize: 'cover' }} role="img" aria-label={services[activeService].title} />
            <div>
              <p className="text-sm font-semibold text-[#168241]">{services[activeService].title}</p>
              <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">{services[activeService].subtitle}</h3>
              <p className="mt-4 text-base leading-7 text-[#4c4c4c]">{services[activeService].description}</p>
              <a href={services[activeService].href} className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-[#168241] hover:underline">{activeService === 3 ? 'Save now' : 'Learn more'}<ArrowRight size={16} /></a>
            </div>
          </article>
        </section>

        <section className="bg-[#f4f5f2] px-4 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-[1240px]">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-semibold sm:text-[40px]">Home-leasing, simplified</h2>
            </div>
            <div className="grid gap-7 md:grid-cols-3">
              {[
                ['Before you apply', 'Whether you’re new to leasing or have been renting houses for years, we’ll make finding your home as smooth as possible.', 'See helpful tips', '/before-you-apply'],
                ['Qualification requirements', 'You’re on your way to a worry-free leasing lifestyle. First, let’s make sure you meet the qualification requirements.', 'See requirements', '/qualify'],
                ['Application process', 'Our application process couldn’t be easier. No, really. You can do everything online, and we’re always here to help.', 'Get started', '/how-to-apply']
              ].map(([title, body, cta, href]) => (
                <article key={title} className="border-t-2 border-[#168241] bg-white p-6 sm:p-7">
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="mt-3 min-h-20 text-sm leading-6 text-[#555]">{body}</p>
                  <a href={href} className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#168241]">{cta}<ArrowRight size={15} /></a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1240px] gap-8 px-4 py-14 sm:px-8 sm:py-20 md:grid-cols-2">
          <article className="grid gap-5 sm:grid-cols-[150px_1fr] sm:items-center">
              <div className="flex aspect-square items-center justify-center bg-[#f4f5f2] text-[#168241]"><SearchIcon className="h-11 w-11" /></div>
            <div>
              <h2 className="text-2xl font-semibold">Search with our app</h2>
              <p className="mt-3 text-sm leading-6 text-[#555]">Searching for a home to rent is easier with our app. Expertly search and apply for the homes that fit you best through our intuitive mobile app. Narrow the search to your preferred locations, swipe to view the floor plans and conveniently save your faves to your Invitation Homes profile.</p>
              <a href="/search-app" className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#168241]">Download the app<ArrowRight size={15} /></a>
            </div>
          </article>
          <article className="grid gap-5 sm:grid-cols-[150px_1fr] sm:items-center">
              <div className="flex aspect-square items-center justify-center bg-[#f4f5f2] text-[#168241]"><Wrench size={44} strokeWidth={1.3} /></div>
            <div>
              <h2 className="text-2xl font-semibold">Request maintenance on the app.</h2>
              <p className="mt-3 text-sm leading-6 text-[#555]">Our easy-to-use app is the best way to request a repair, keep up your Fridge List, get updates, and watch how-to videos. Our maintenance portal is always there for you, too.</p>
              <a href="/maintenance-app" className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#168241]">Discover more<ArrowRight size={15} /></a>
            </div>
          </article>
        </section>

        <section className="bg-[#f4f5f2] px-4 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-semibold sm:text-[40px]">Real residents share their stories.</h2>
            <p className="mt-3 text-base text-[#555]">We love hearing from you.</p>
            <figure className="mx-auto mt-8 max-w-3xl bg-white px-6 py-8 sm:px-12 sm:py-10">
              <blockquote className="text-xl leading-8 sm:text-2xl">“{testimonials[activeTestimonial].quote}”</blockquote>
              <figcaption className="mt-5 text-sm font-semibold">{testimonials[activeTestimonial].name}<span className="ml-2 font-normal text-[#666]">{testimonials[activeTestimonial].city}</span></figcaption>
            </figure>
            <div className="mt-5 flex items-center justify-center gap-5">
              <button type="button" aria-label="Previous testimonial" onClick={() => setActiveTestimonial((activeTestimonial + testimonials.length - 1) % testimonials.length)} className="flex h-11 w-11 items-center justify-center border border-[#168241] text-[#168241] hover:bg-[#168241] hover:text-white"><ChevronLeft size={18} /></button>
              <span className="text-sm text-[#555]">{activeTestimonial + 1} / {testimonials.length}</span>
              <button type="button" aria-label="Next testimonial" onClick={() => setActiveTestimonial((activeTestimonial + 1) % testimonials.length)} className="flex h-11 w-11 items-center justify-center border border-[#168241] text-[#168241] hover:bg-[#168241] hover:text-white"><ChevronRight size={18} /></button>
            </div>
          </div>
        </section>
      </main>

      <OfficialFooter />
    </div>
  );
}