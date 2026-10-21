import { PresetSite } from '../types';

export const PRESET_SITES: PresetSite[] = [
  {
    id: 'invitation-homes',
    name: 'Invitation Homes (Single-Family Rental Leader)',
    category: 'Real Estate / PropTech',
    url: 'https://www.invitationhomes.com/',
    description: 'Premier single-family home leasing platform with location search, lease pillars, 16 US markets, and Smart Home tech.',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Houses for Rent | Invitation Homes</title>
  <meta name="description" content="The nation’s premier home leasing company, provides professionally managed, updated homes for rent in desirable neighborhoods for a more inviting life.">
  <link rel="icon" href="https://www.invitationhomes.com/favicon.png">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap">
  <style>
    :root {
      --primary: #04a54f;
      --primary-dark: #0b763c;
      --lime: #9fcc3b;
      --dark: #231f20;
      --cream: #fbfbf9;
      --gray-light: #f3f4f6;
      --gray-border: #e5e7eb;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #231f20;
      background: #ffffff;
      -webkit-font-smoothing: antialiased;
    }
  </style>
</head>
<body>
  <!-- Top Utility Bar -->
  <div style="background: #231f20; color: #d1d5db; font-size: 0.75rem; padding: 0.5rem 2rem; display: flex; justify-content: flex-end; align-items: center; gap: 1.5rem;">
    <a href="#pay-rent" style="color: inherit; text-decoration: none; display: flex; items-center; gap: 0.25rem;">
      <span style="color: #9fcc3b;">●</span> Pay Rent
    </a>
    <a href="#maintenance" style="color: inherit; text-decoration: none;">Maintenance</a>
    <a href="#help" style="color: inherit; text-decoration: none;">Help Center</a>
    <a href="#contact" style="color: inherit; text-decoration: none;">Contact Us</a>
    <a href="#login" style="color: #ffffff; font-weight: 600; text-decoration: none; background: #374151; padding: 0.25rem 0.75rem; border-radius: 9999px;">
      Login / Sign up
    </a>
  </div>

  <!-- Main Navigation Header -->
  <header style="background: #ffffff; border-bottom: 1px solid #e5e7eb; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 50;">
    <div style="display: flex; align-items: center; gap: 2rem;">
      <!-- Logo SVG Mockup -->
      <a href="/" style="display: flex; align-items: center; gap: 0.5rem; text-decoration: none; color: #231f20;">
        <div style="width: 2.25rem; height: 2.25rem; background: linear-gradient(135deg, #04a54f, #9fcc3b); border-radius: 0.375rem; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 1.125rem;">
          IH
        </div>
        <div>
          <span style="font-size: 1.25rem; font-weight: 800; letter-spacing: -0.03em; color: #231f20; display: block; line-height: 1;">invitation</span>
          <span style="font-size: 0.85rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #04a54f; display: block; line-height: 1; margin-top: 2px;">homes</span>
        </div>
      </a>

      <!-- Navigation Links -->
      <nav style="display: flex; gap: 1.75rem; font-size: 0.9375rem; font-weight: 600; color: #374151;">
        <a href="#find-home" style="color: #04a54f; text-decoration: none; display: flex; align-items: center; gap: 0.25rem;">
          Find your home ▾
        </a>
        <a href="#our-difference" style="color: inherit; text-decoration: none;">Our difference ▾</a>
        <a href="#resources" style="color: inherit; text-decoration: none;">Resources ▾</a>
        <a href="#about" style="color: inherit; text-decoration: none;">About ▾</a>
      </nav>
    </div>

    <!-- Quick Action -->
    <div style="display: flex; align-items: center; gap: 1rem;">
      <a href="#saved-homes" style="font-size: 0.875rem; color: #4b5563; text-decoration: none; font-weight: 600;">Saved Homes (0)</a>
      <a href="#apply" style="background: #04a54f; color: white; padding: 0.625rem 1.25rem; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 0.875rem; box-shadow: 0 4px 6px -1px rgba(4, 165, 79, 0.2);">
        Apply Now
      </a>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero" style="position: relative; background: linear-gradient(rgba(35, 31, 32, 0.45), rgba(35, 31, 32, 0.65)), url('https://images.ctfassets.net/lb8pxg8729el/1jZH5tiQ6VHPXwwgIA1swI/2972ba86931bd5760c9314ba2e2fc8eb/02-1867_Tohoqua_Blvd.jpg') center/cover no-repeat; padding: 6.5rem 2rem; color: #ffffff; text-align: center;">
    <div style="max-width: 56rem; margin: 0 auto;">
      <div style="display: inline-block; background: rgba(4, 165, 79, 0.85); backdrop-filter: blur(4px); color: #ffffff; padding: 0.35rem 1rem; border-radius: 9999px; font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1.25rem;">
        America's #1 Home Leasing Company
      </div>
      <h1 style="font-size: 3.75rem; font-weight: 800; line-height: 1.05; letter-spacing: -0.03em; margin: 0 0 1.25rem 0;">
        Live freer. Lease a house.
      </h1>
      <p style="font-size: 1.25rem; color: #f3f4f6; max-width: 38rem; margin: 0 auto 2.5rem; line-height: 1.5; font-weight: 500;">
        Updated single-family rental homes in top neighborhoods with fenced yards, Smart Home tech, and pet-friendly policies.
      </p>

      <!-- Search Bar Box -->
      <div style="background: #ffffff; border-radius: 1rem; padding: 0.75rem; max-width: 48rem; margin: 0 auto; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3); display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
        <div style="flex: 1; min-width: 260px; display: flex; align-items: center; padding: 0.5rem 0.75rem; background: #f9fafb; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
          <span style="color: #04a54f; font-size: 1.25rem; margin-right: 0.5rem;">📍</span>
          <input
            type="text"
            placeholder="Search by city, street, or zip code*"
            style="width: 100%; border: none; background: transparent; font-size: 0.9375rem; color: #111827; outline: none;"
          />
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <select style="border: 1px solid #e5e7eb; background: #f9fafb; padding: 0.625rem 0.875rem; border-radius: 0.5rem; font-size: 0.875rem; color: #374151; font-weight: 500; outline: none;">
            <option>Any Beds</option>
            <option>2+ Beds</option>
            <option>3+ Beds</option>
            <option>4+ Beds</option>
          </select>
          <select style="border: 1px solid #e5e7eb; background: #f9fafb; padding: 0.625rem 0.875rem; border-radius: 0.5rem; font-size: 0.875rem; color: #374151; font-weight: 500; outline: none;">
            <option>Max Price</option>
            <option>$2,000/mo</option>
            <option>$2,500/mo</option>
            <option>$3,500/mo</option>
            <option>$5,000/mo</option>
          </select>
          <button style="background: #04a54f; hover:background: #0b763c; color: #ffffff; border: none; padding: 0.75rem 1.75rem; border-radius: 0.5rem; font-weight: 700; font-size: 0.9375rem; cursor: pointer; display: flex; align-items: center; gap: 0.375rem;">
            Search Homes
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- Value Pillars: A lease that comes with more -->
  <section class="pillars" style="padding: 5rem 2rem; max-width: 76rem; margin: 0 auto;">
    <div style="text-align: center; max-width: 44rem; margin: 0 auto 3.5rem;">
      <span style="color: #04a54f; font-weight: 700; font-size: 0.875rem; letter-spacing: 0.05em; text-transform: uppercase;">The Invitation Homes Difference</span>
      <h2 style="font-size: 2.5rem; font-weight: 800; letter-spacing: -0.03em; color: #231f20; margin: 0.5rem 0 1rem;">
        A lease that comes with more
      </h2>
      <p style="color: #4b5563; font-size: 1.125rem; line-height: 1.6;">
        From Smart Home convenience to dedicated ProCare service technicians, leasing with us gives you genuine peace of mind.
      </p>
    </div>

    <!-- 4 Cards Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.75rem;">
      <!-- Card 1 -->
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <img
          src="https://images.ctfassets.net/lb8pxg8729el/6pej8fzJpko7GeIKHjnYvf/8d88deee2974036859b4a4ba6bbe696a/Home_Page__More_value_2.jpg"
          alt="More value"
          style="width: 100%; height: 200px; object-fit: cover;"
        />
        <div style="padding: 1.5rem;">
          <h3 style="font-size: 1.25rem; font-weight: 800; color: #231f20; margin: 0 0 0.75rem;">More value</h3>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.875rem; color: #4b5563; display: flex; flex-direction: column; gap: 0.5rem;">
            <li style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: #04a54f; font-weight: bold;">✓</span> Updated modern kitchens & baths</li>
            <li style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: #04a54f; font-weight: bold;">✓</span> Smart Home locks & thermostats</li>
            <li style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: #04a54f; font-weight: bold;">✓</span> High-speed internet & streaming apps</li>
          </ul>
        </div>
      </div>

      <!-- Card 2 -->
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <img
          src="https://images.ctfassets.net/lb8pxg8729el/3C0DnDdcICuAtjvZrRv8Ya/990eb8ef3862152a840cdbb75f19b662/Home_Page__Seamless_1.jpg"
          alt="More simplicity"
          style="width: 100%; height: 200px; object-fit: cover;"
        />
        <div style="padding: 1.5rem;">
          <h3 style="font-size: 1.25rem; font-weight: 800; color: #231f20; margin: 0 0 0.75rem;">More simplicity</h3>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.875rem; color: #4b5563; display: flex; flex-direction: column; gap: 0.5rem;">
            <li style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: #04a54f; font-weight: bold;">✓</span> Self-guided home tours anytime</li>
            <li style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: #04a54f; font-weight: bold;">✓</span> Seamless online application & signing</li>
            <li style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: #04a54f; font-weight: bold;">✓</span> 1-click rent payments via mobile app</li>
          </ul>
        </div>
      </div>

      <!-- Card 3 -->
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <img
          src="https://images.ctfassets.net/lb8pxg8729el/7c0bFEpqFYSm48ptOQpqpU/72f1eaea87929e8f3906867394658e29/Home_Page__Flexibility_2.jpg"
          alt="More flexibility"
          style="width: 100%; height: 200px; object-fit: cover;"
        />
        <div style="padding: 1.5rem;">
          <h3 style="font-size: 1.25rem; font-weight: 800; color: #231f20; margin: 0 0 0.75rem;">More flexibility</h3>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.875rem; color: #4b5563; display: flex; flex-direction: column; gap: 0.5rem;">
            <li style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: #04a54f; font-weight: bold;">✓</span> Fenced private yards for children & pets</li>
            <li style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: #04a54f; font-weight: bold;">✓</span> Pet friendly: up to 3 pets, no weight limit</li>
            <li style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: #04a54f; font-weight: bold;">✓</span> Seamless transfers across 16 US markets</li>
          </ul>
        </div>
      </div>

      <!-- Card 4 -->
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <img
          src="https://images.ctfassets.net/lb8pxg8729el/4qk51PK0dpnmxugLggAVOQ/55b8be349310f0448a843331932ca083/Home_Page__Pros_2.jpg"
          alt="More Genuine CARE"
          style="width: 100%; height: 200px; object-fit: cover;"
        />
        <div style="padding: 1.5rem;">
          <h3 style="font-size: 1.25rem; font-weight: 800; color: #231f20; margin: 0 0 0.75rem;">More Genuine CARE™</h3>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.875rem; color: #4b5563; display: flex; flex-direction: column; gap: 0.5rem;">
            <li style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: #04a54f; font-weight: bold;">✓</span> Dedicated local property management</li>
            <li style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: #04a54f; font-weight: bold;">✓</span> In-house ProCare certified pros</li>
            <li style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: #04a54f; font-weight: bold;">✓</span> 24/7 emergency repair dispatch</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- Quote Banner Section -->
  <section class="banner" style="background: #0b763c; color: white; padding: 4.5rem 2rem; text-align: center;">
    <div style="max-width: 52rem; margin: 0 auto;">
      <h2 style="font-size: 2.25rem; font-weight: 800; line-height: 1.2; margin: 0 0 1.25rem 0;">
        "There’s the old way to rent a home, then there’s our way."
      </h2>
      <p style="font-size: 1.125rem; line-height: 1.6; color: #e8f5e3; margin: 0 auto 2rem; max-width: 44rem;">
        At Invitation Homes, we offer pet-friendly, yard-having homes for rent with Smart Home technology in awesome neighborhoods across the country. Live in a great house without the headache and long-term commitment of owning. Some might call that entitled. We call it smart.
      </p>
      <button style="background: #9fcc3b; color: #231f20; border: none; padding: 0.875rem 2rem; border-radius: 9999px; font-weight: 800; font-size: 1rem; cursor: pointer;">
        Explore Neighborhoods
      </button>
    </div>
  </section>

  <!-- Top Markets Grid -->
  <section class="markets" style="padding: 5rem 2rem; max-width: 76rem; margin: 0 auto;">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <span style="color: #04a54f; font-weight: 700; font-size: 0.875rem; text-transform: uppercase;">Explore Locations</span>
        <h2 style="font-size: 2.25rem; font-weight: 800; color: #231f20; margin: 0.25rem 0 0;">
          Discover homes in 16 premier markets
        </h2>
      </div>
      <a href="#all-markets" style="color: #04a54f; font-weight: 700; text-decoration: none; font-size: 0.9375rem;">
        View all available markets →
      </a>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.25rem;">
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem; text-align: center;">
        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🍑</div>
        <h3 style="font-size: 1.125rem; font-weight: 700; margin: 0 0 0.25rem; color: #231f20;">Atlanta</h3>
        <p style="font-size: 0.8125rem; color: #6b7280; margin: 0;">1,240+ homes available</p>
      </div>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem; text-align: center;">
        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🎸</div>
        <h3 style="font-size: 1.125rem; font-weight: 700; margin: 0 0 0.25rem; color: #231f20;">Austin</h3>
        <p style="font-size: 0.8125rem; color: #6b7280; margin: 0;">480+ homes available</p>
      </div>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem; text-align: center;">
        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🌲</div>
        <h3 style="font-size: 1.125rem; font-weight: 700; margin: 0 0 0.25rem; color: #231f20;">Carolinas</h3>
        <p style="font-size: 0.8125rem; color: #6b7280; margin: 0;">950+ homes available</p>
      </div>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem; text-align: center;">
        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🏙️</div>
        <h3 style="font-size: 1.125rem; font-weight: 700; margin: 0 0 0.25rem; color: #231f20;">Chicago</h3>
        <p style="font-size: 0.8125rem; color: #6b7280; margin: 0;">620+ homes available</p>
      </div>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem; text-align: center;">
        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🤠</div>
        <h3 style="font-size: 1.125rem; font-weight: 700; margin: 0 0 0.25rem; color: #231f20;">Dallas-Fort Worth</h3>
        <p style="font-size: 0.8125rem; color: #6b7280; margin: 0;">1,520+ homes available</p>
      </div>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem; text-align: center;">
        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🏔️</div>
        <h3 style="font-size: 1.125rem; font-weight: 700; margin: 0 0 0.25rem; color: #231f20;">Denver</h3>
        <p style="font-size: 0.8125rem; color: #6b7280; margin: 0;">390+ homes available</p>
      </div>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem; text-align: center;">
        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🚀</div>
        <h3 style="font-size: 1.125rem; font-weight: 700; margin: 0 0 0.25rem; color: #231f20;">Houston</h3>
        <p style="font-size: 0.8125rem; color: #6b7280; margin: 0;">740+ homes available</p>
      </div>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem; text-align: center;">
        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">☀️</div>
        <h3 style="font-size: 1.125rem; font-weight: 700; margin: 0 0 0.25rem; color: #231f20;">Phoenix</h3>
        <p style="font-size: 0.8125rem; color: #6b7280; margin: 0;">1,180+ homes available</p>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer style="background: #231f20; color: #9ca3af; padding: 4rem 2rem 2rem; font-size: 0.875rem;">
    <div style="max-width: 76rem; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 3rem; margin-bottom: 3rem;">
      <div>
        <div style="font-weight: 800; font-size: 1.25rem; color: #ffffff; margin-bottom: 1rem;">Invitation Homes</div>
        <p style="line-height: 1.6; font-size: 0.8125rem;">
          The nation's premier home leasing company, providing professionally managed, updated homes for rent in desirable neighborhoods.
        </p>
      </div>
      <div>
        <h4 style="color: #ffffff; font-size: 0.9375rem; font-weight: 700; margin: 0 0 1rem;">Find your home</h4>
        <ul style="list-style: none; padding: 0; margin: 0; line-height: 2;">
          <li><a href="#" style="color: inherit; text-decoration: none;">Search locations</a></li>
          <li><a href="#" style="color: inherit; text-decoration: none;">Rental communities</a></li>
          <li><a href="#" style="color: inherit; text-decoration: none;">Qualification requirements</a></li>
          <li><a href="#" style="color: inherit; text-decoration: none;">Leasing fees</a></li>
        </ul>
      </div>
      <div>
        <h4 style="color: #ffffff; font-size: 0.9375rem; font-weight: 700; margin: 0 0 1rem;">Our difference</h4>
        <ul style="list-style: none; padding: 0; margin: 0; line-height: 2;">
          <li><a href="#" style="color: inherit; text-decoration: none;">Why Invitation Homes</a></li>
          <li><a href="#" style="color: inherit; text-decoration: none;">ProCare maintenance</a></li>
          <li><a href="#" style="color: inherit; text-decoration: none;">Smart Home technology</a></li>
          <li><a href="#" style="color: inherit; text-decoration: none;">Pet friendly living</a></li>
        </ul>
      </div>
      <div>
        <h4 style="color: #ffffff; font-size: 0.9375rem; font-weight: 700; margin: 0 0 1rem;">Resident portal</h4>
        <ul style="list-style: none; padding: 0; margin: 0; line-height: 2;">
          <li><a href="#" style="color: inherit; text-decoration: none;">Pay rent online</a></li>
          <li><a href="#" style="color: inherit; text-decoration: none;">Request maintenance</a></li>
          <li><a href="#" style="color: inherit; text-decoration: none;">Help Center</a></li>
          <li><a href="#" style="color: inherit; text-decoration: none;">Contact customer care</a></li>
        </ul>
      </div>
    </div>
    <div style="max-width: 76rem; margin: 0 auto; border-top: 1px solid #374151; padding-top: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; font-size: 0.75rem;">
      <p style="margin: 0;">© 2026 Invitation Homes Inc. All rights reserved. Equal Housing Opportunity.</p>
      <div style="display: flex; gap: 1.5rem;">
        <a href="#" style="color: inherit; text-decoration: none;">Privacy Policy</a>
        <a href="#" style="color: inherit; text-decoration: none;">Terms of Use</a>
        <a href="#" style="color: inherit; text-decoration: none;">Fraud Prevention</a>
      </div>
    </div>
  </footer>
</body>
</html>`
  },
  {
    id: 'saas-apex',
    name: 'Apex AI Platform (Modern Dark SaaS)',
    category: 'SaaS & Marketing',
    url: 'https://apex-platform.example.com',
    description: 'Modern developer-first dark mode landing page with hero, metric cards, feature grid, and pricing.',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Apex Cloud - High Performance Serverless Infrastructure</title>
  <meta name="description" content="Deploy modern web apps globally with instant cold starts and sub-millisecond routing.">
</head>
<body style="background-color: #0b0f19; color: #f1f5f9; font-family: system-ui, sans-serif;">
  <header style="border-bottom: 1px solid #1e293b; padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center;">
    <span style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">ApexCloud</span>
    <nav style="display: flex; gap: 1.5rem; font-size: 0.875rem; color: #94a3b8;">
      <a href="#features" style="color: inherit;">Features</a>
      <a href="#pricing" style="color: inherit;">Pricing</a>
    </nav>
    <button style="background: #3b82f6; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; border: none;">Deploy Now</button>
  </header>
  <section class="hero" style="padding: 5rem 2rem; text-align: center;">
    <h1 style="font-size: 3rem; font-weight: 800; color: white;">Build at the speed of thought.</h1>
    <p style="color: #94a3b8; font-size: 1.25rem;">Instant compute with zero configuration.</p>
  </section>
</body>
</html>`
  },
  {
    id: 'studio-creative',
    name: 'Atelier Monochrome (Minimalist Portfolio)',
    category: 'Creative Portfolio',
    url: 'https://atelier-studio.example.com',
    description: 'Clean editorial portfolio with high-contrast typography, project showcases, and minimal navigation.',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Atelier Studio — Architecture & Spatial Design</title>
</head>
<body style="background: #fafaf9; color: #1c1917; font-family: sans-serif; padding: 2rem;">
  <header><h1>ATELIER / NORD</h1></header>
  <section><p>We sculpt spatial clarity and enduring environments.</p></section>
</body>
</html>`
  }
];
