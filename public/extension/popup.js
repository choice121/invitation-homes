document.addEventListener('DOMContentLoaded', async () => {
  const loadingEl = document.getElementById('loading');
  const contentEl = document.getElementById('content');
  const successEl = document.getElementById('success');
  const platformEl = document.getElementById('prop-platform');
  const addrEl = document.getElementById('prop-addr');
  const rentInput = document.getElementById('prop-rent-input');
  const depositInput = document.getElementById('prop-deposit-input');
  const specsEl = document.getElementById('prop-specs');
  const sqftEl = document.getElementById('prop-sqft');
  const photoContainer = document.getElementById('photo-container');
  const photoCount = document.getElementById('photo-count');
  const photoStrip = document.getElementById('photo-strip');
  const importBtn = document.getElementById('import-btn');

  let activeData = null;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('No active tab');

    chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_LISTING' }, (res) => {
      if (res?.success && res.data) {
        activeData = res.data;
        platformEl.textContent = res.data.sourcePlatform || 'Web Listing';
        addrEl.textContent = res.data.address || 'Detected Property';
        rentInput.value = res.data.monthlyRent || 2400;
        depositInput.value = res.data.securityDeposit || res.data.monthlyRent || 2400;
        specsEl.textContent = `${res.data.bedrooms || 3} bed, ${res.data.bathrooms || 2} bath`;
        sqftEl.textContent = `${(res.data.squareFeet || 1800).toLocaleString()} sq ft`;

        if (Array.isArray(res.data.images) && res.data.images.length > 0) {
          photoContainer.style.display = 'block';
          photoCount.textContent = res.data.images.length;
          photoStrip.innerHTML = '';
          res.data.images.slice(0, 5).forEach((url) => {
            const img = document.createElement('img');
            img.src = url;
            img.className = 'photo-thumb';
            photoStrip.appendChild(img);
          });
        }

        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';
      } else {
        loadingEl.textContent = 'Open a property listing page (Zillow, Realtor, Redfin, Apartments.com, etc.) to import.';
      }
    });
  } catch (e) {
    loadingEl.textContent = 'Could not read page details. Make sure you are on a supported listing tab.';
  }

  importBtn?.addEventListener('click', async () => {
    if (!activeData) return;
    importBtn.textContent = 'Saving to Staging...';
    importBtn.disabled = true;

    try {
      const targetEndpoint = 'http://localhost:3000/api/pipeline/stage';
      const response = await fetch(targetEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceUrl: activeData.sourceUrl || window.location.href,
          sourcePlatform: activeData.sourcePlatform || 'Browser Extension',
          title: activeData.title || activeData.address,
          address: activeData.address,
          city: activeData.city || 'Atlanta',
          state: activeData.state || 'GA',
          zipCode: activeData.zipCode || '30303',
          market: activeData.market || 'Atlanta',
          monthlyRent: Number(rentInput.value) || activeData.monthlyRent || 2400,
          securityDeposit: Number(depositInput.value) || Number(rentInput.value) || 2400,
          bedrooms: activeData.bedrooms || 3,
          bathrooms: activeData.bathrooms || 2,
          squareFeet: activeData.squareFeet || 1800,
          petFriendly: activeData.petFriendly !== undefined ? activeData.petFriendly : true,
          smartHome: activeData.smartHome !== undefined ? activeData.smartHome : true,
          images: activeData.images || [],
          featuredImage: (activeData.images && activeData.images[0]) || '',
          description: activeData.description || `Imported listing from ${activeData.sourcePlatform}`
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      contentEl.style.display = 'none';
      successEl.style.display = 'block';
    } catch (err) {
      alert('Failed to send to staging queue: ' + err.message + '\n\nMake sure the local server is running on http://localhost:3000.');
      importBtn.textContent = 'Retry Save';
      importBtn.disabled = false;
    }
  });
});
