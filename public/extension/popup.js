document.addEventListener('DOMContentLoaded', async () => {
  const loadingEl = document.getElementById('loading');
  const contentEl = document.getElementById('content');
  const successEl = document.getElementById('success');
  const addrEl = document.getElementById('prop-addr');
  const rentEl = document.getElementById('prop-rent');
  const bedsEl = document.getElementById('prop-beds');
  const importBtn = document.getElementById('import-btn');

  let activeData = null;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('No active tab');

    chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_LISTING' }, (res) => {
      if (res?.success && res.data) {
        activeData = res.data;
        addrEl.textContent = res.data.address || 'Detected Property';
        rentEl.textContent = `$${res.data.monthlyRent}/mo`;
        bedsEl.textContent = `${res.data.bedrooms} bed, ${res.data.bathrooms} bath`;

        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';
      } else {
        loadingEl.textContent = 'Navigate to a property listing page (Zillow, Realtor, Redfin, etc.) to import.';
      }
    });
  } catch (e) {
    loadingEl.textContent = 'Could not read current page. Ensure you are on a supported property listing.';
  }

  importBtn?.addEventListener('click', async () => {
    if (!activeData) return;
    importBtn.textContent = 'Saving...';
    importBtn.disabled = true;

    try {
      // POST to Invitation Homes staging endpoint
      const targetEndpoint = window.location.origin.includes('localhost')
        ? 'http://localhost:3000/api/pipeline/stage'
        : `${window.location.origin}/api/pipeline/stage`;

      const response = await fetch(targetEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceUrl: activeData.sourceUrl,
          sourcePlatform: 'Browser Extension',
          title: activeData.title,
          address: activeData.address,
          city: activeData.city || 'Atlanta',
          state: activeData.state || 'GA',
          zipCode: activeData.zipCode || '30303',
          market: activeData.market || 'Atlanta',
          monthlyRent: activeData.monthlyRent,
          bedrooms: activeData.bedrooms,
          bathrooms: activeData.bathrooms,
          squareFeet: activeData.squareFeet,
          images: activeData.images,
          featuredImage: activeData.images[0] || '',
          description: activeData.description
        })
      });

      contentEl.style.display = 'none';
      successEl.style.display = 'block';
    } catch (err) {
      alert('Failed to send to staging queue: ' + err.message);
      importBtn.textContent = 'Retry Save';
      importBtn.disabled = false;
    }
  });
});
