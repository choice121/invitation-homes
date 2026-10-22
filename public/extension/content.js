// Universal content extractor for Invitation Homes Property Importer
// Powered by shared-extractors.js for Zillow, Realtor, Redfin, Apartments.com, Opendoor, Progress, and Invitation Homes
(function () {
  'use strict';

  function extractListing() {
    const host = window.location.hostname.toLowerCase();
    const url = window.location.href;
    let extracted = null;

    try {
      if (host.includes('zillow.com') && typeof window.extractZillow === 'function') {
        extracted = window.extractZillow();
      } else if (host.includes('realtor.com') && typeof window.extractRealtor === 'function') {
        extracted = window.extractRealtor();
      } else if (host.includes('redfin.com') && typeof window.extractRedfin === 'function') {
        extracted = window.extractRedfin();
      } else if (host.includes('apartments.com') && typeof window.extractApartments === 'function') {
        extracted = window.extractApartments();
      } else if (host.includes('opendoor.com') && typeof window.extractOpendoor === 'function') {
        extracted = window.extractOpendoor();
      } else if (host.includes('rentprogress.com') && typeof window.extractProgressResidential === 'function') {
        extracted = window.extractProgressResidential();
      } else if (host.includes('invitationhomes.com') && typeof window.extractInvitationHomes === 'function') {
        extracted = window.extractInvitationHomes();
      } else if (typeof window.extractFromJsonLd === 'function') {
        extracted = window.extractFromJsonLd();
      }
    } catch (e) {
      console.warn('[IH Importer] Extractor error, falling back to heuristics:', e);
    }

    if (!extracted || !extracted.address) {
      extracted = fallbackDomExtract();
    }

    // Ensure standardized fields for staging
    return {
      sourceUrl: url,
      sourcePlatform: detectPlatform(host),
      title: extracted.title || extracted.address || document.title,
      address: extracted.address || document.title.split('|')[0].trim(),
      city: extracted.city || 'Atlanta',
      state: extracted.state || 'GA',
      zipCode: extracted.zipCode || extracted.zip || '30303',
      market: extracted.market || 'Atlanta',
      monthlyRent: Number(extracted.monthlyRent || extracted.rent || extracted.price) || 2400,
      securityDeposit: Number(extracted.securityDeposit || extracted.monthlyRent || extracted.rent) || 2400,
      bedrooms: Number(extracted.bedrooms || extracted.beds) || 3,
      bathrooms: Number(extracted.bathrooms || extracted.baths) || 2,
      squareFeet: Number(extracted.squareFeet || extracted.sqft) || 1800,
      petFriendly: extracted.petFriendly !== undefined ? Boolean(extracted.petFriendly) : true,
      smartHome: extracted.smartHome !== undefined ? Boolean(extracted.smartHome) : true,
      images: Array.isArray(extracted.images) && extracted.images.length > 0
        ? extracted.images
        : Array.isArray(extracted.original_image_urls)
          ? extracted.original_image_urls
          : [],
      featuredImage: (extracted.images && extracted.images[0]) || (extracted.original_image_urls && extracted.original_image_urls[0]) || '',
      description: extracted.description || `Extracted listing from ${host}`
    };
  }

  function detectPlatform(host) {
    if (host.includes('zillow')) return 'Zillow';
    if (host.includes('realtor')) return 'Realtor.com';
    if (host.includes('redfin')) return 'Redfin';
    if (host.includes('apartments')) return 'Apartments.com';
    if (host.includes('rentprogress')) return 'Progress Residential';
    if (host.includes('opendoor')) return 'Opendoor';
    if (host.includes('invitationhomes')) return 'Invitation Homes';
    return 'Web Portal';
  }

  function fallbackDomExtract() {
    let title = document.title || '';
    let address = '';
    let rent = 0;
    let beds = 3;
    let baths = 2;
    let sqft = 1800;
    let images = [];
    let description = '';

    // 1. JSON-LD structured data
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of jsonLdScripts) {
      try {
        const parsed = JSON.parse(script.textContent || '{}');
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          if (item['@type'] === 'SingleFamilyResidence' || item['@type'] === 'Apartment' || item['@type'] === 'RealEstateListing' || item.offers) {
            if (item.name) title = item.name;
            if (item.description) description = item.description;
            if (item.address) {
              address = typeof item.address === 'string' ? item.address : `${item.address.streetAddress || ''}, ${item.address.addressLocality || ''}, ${item.address.addressRegion || ''}`;
            }
            if (item.numberOfBedrooms) beds = Number(item.numberOfBedrooms);
            if (item.numberOfBathroomsTotal) baths = Number(item.numberOfBathroomsTotal);
            if (item.floorSize?.value) sqft = Number(item.floorSize.value);
            if (item.offers?.price) rent = Number(item.offers.price);
            if (item.image) {
              if (Array.isArray(item.image)) images = item.image;
              else if (typeof item.image === 'string') images = [item.image];
            }
          }
        }
      } catch (e) {}
    }

    if (!address) {
      const h1 = document.querySelector('h1')?.textContent?.trim() || '';
      if (h1 && /\d+/.test(h1)) address = h1;
      else address = document.title.split('|')[0].trim();
    }

    if (!rent) {
      const priceText = document.body.innerText.match(/\$\s?([1-9][0-9]{2,3}(?:,[0-9]{3})?)(?:\s?\/(?:mo|month))?/i);
      if (priceText) rent = parseInt(priceText[1].replace(/,/g, ''), 10);
    }

    if (images.length === 0) {
      document.querySelectorAll('img[src*="photo"], img[src*="zillowstatic"], img[src*="rdcpix"]').forEach((img) => {
        const src = img.src;
        if (src && !images.includes(src) && images.length < 12) images.push(src);
      });
    }

    return { title, address, monthlyRent: rent, bedrooms: beds, bathrooms: baths, squareFeet: sqft, images, description };
  }

  // Chrome runtime listener
  if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'EXTRACT_LISTING') {
        const data = extractListing();
        sendResponse({ success: true, data });
      }
      return true;
    });
  }
})();
