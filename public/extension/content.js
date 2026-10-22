// In-page content extractor for Invitation Homes Importer
(function () {
  function extractPageListing() {
    let title = document.title || '';
    let address = '';
    let rent = 0;
    let beds = 3;
    let baths = 2;
    let sqft = 1800;
    let images = [];
    let description = '';

    // 1. Try JSON-LD structured data first
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

    // 2. DOM heuristics if fields missing
    if (!address) {
      const h1 = document.querySelector('h1')?.textContent?.trim() || '';
      if (h1 && /\d+/.test(h1)) address = h1;
      else address = document.title.split('|')[0].trim();
    }

    if (!rent) {
      const priceText = document.body.innerText.match(/\$\s?([1-9][0-9]{2,3}(?:,[0-9]{3})?)(?:\s?\/(?:mo|month))?/i);
      if (priceText) {
        rent = parseInt(priceText[1].replace(/,/g, ''), 10);
      }
    }

    if (images.length === 0) {
      document.querySelectorAll('img[src*="photo"], img[src*="zillowstatic"], img[src*="rdcpix"]').forEach((img) => {
        const src = img.src;
        if (src && !images.includes(src) && images.length < 8) images.push(src);
      });
    }

    return {
      sourceUrl: window.location.href,
      title: title || address,
      address,
      monthlyRent: rent || 2400,
      bedrooms: beds || 3,
      bathrooms: baths || 2,
      squareFeet: sqft || 1800,
      images,
      description: description || `Extracted listing from ${window.location.hostname}`
    };
  }

  // Listen for messages from popup
  chrome.runtime?.onMessage?.addListener((request, sender, sendResponse) => {
    if (request.action === 'EXTRACT_LISTING') {
      const data = extractPageListing();
      sendResponse({ success: true, data });
    }
  });
})();
