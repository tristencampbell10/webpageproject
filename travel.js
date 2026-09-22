/**
 * travel.js - Interactive features for the Travel Bucket List Showcase
 * Handles destination filtering, 3-day itinerary accordion toggles,
 * interactive travel compass spinner, photo lightbox, and bucket-list favorites.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Toast Notification Helper ---
  const toast = document.getElementById('travelToast');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // --- Destination Filter Pills ---
  const filterBtns = document.querySelectorAll('.travel-filter-btn');
  const destinationCards = document.querySelectorAll('.destination-card');
  const viewHint = document.getElementById('travelViewHint');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      let visibleCount = 0;

      destinationCards.forEach((card) => {
        if (filter === 'all' || card.dataset.destination === filter) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (viewHint) {
        if (filter === 'all') {
          viewHint.textContent = `Showing all 4 dream destinations`;
        } else {
          const name = btn.textContent.trim();
          viewHint.textContent = `Focusing on ${name}`;
        }
      }
    });
  });

  // --- 3-Day Itinerary Accordion Drawer ---
  const itineraryToggles = document.querySelectorAll('.destination-itinerary-toggle');
  itineraryToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const card = toggle.closest('.destination-card');
      const drawer = card.querySelector('.destination-itinerary-drawer');
      if (!drawer) return;

      const isOpen = drawer.classList.contains('open');
      if (isOpen) {
        drawer.classList.remove('open');
        toggle.innerHTML = '<span>🗓️</span> View 3-Day Plan';
      } else {
        drawer.classList.add('open');
        toggle.innerHTML = '<span>✕</span> Close 3-Day Plan';
      }
    });
  });

  // --- Interactive Bucket List Heart / Save Button ---
  const savedTrips = JSON.parse(localStorage.getItem('tristen_bucket_list') || '{}');
  const saveButtons = document.querySelectorAll('.destination-save-btn');

  saveButtons.forEach((btn) => {
    const dest = btn.dataset.dest;
    if (savedTrips[dest]) {
      btn.classList.add('saved');
      btn.innerHTML = '<span>❤️</span> Saved';
    }

    btn.addEventListener('click', () => {
      const isSaved = btn.classList.contains('saved');
      const cardTitle = btn.closest('.destination-card')?.querySelector('.destination-card-title')?.textContent || dest;

      if (isSaved) {
        btn.classList.remove('saved');
        btn.innerHTML = '<span>🤍</span> Save';
        delete savedTrips[dest];
        showToast(`Removed ${cardTitle} from saved favorites`);
      } else {
        btn.classList.add('saved');
        btn.innerHTML = '<span>❤️</span> Saved';
        savedTrips[dest] = true;
        showToast(`✨ Saved ${cardTitle} to your Dream Itinerary!`);
      }
      localStorage.setItem('tristen_bucket_list', JSON.stringify(savedTrips));
    });
  });

  // --- Photo Lightbox Modal ---
  const lightbox = document.getElementById('travelLightbox');
  const lightboxImg = document.getElementById('travelLightboxImg');
  const lightboxTitle = document.getElementById('travelLightboxTitle');
  const lightboxDesc = document.getElementById('travelLightboxDesc');
  const lightboxClose = document.getElementById('travelLightboxClose');

  const photoHolders = document.querySelectorAll('.destination-card-media');
  photoHolders.forEach((holder) => {
    holder.addEventListener('click', () => {
      const img = holder.querySelector('img');
      const card = holder.closest('.destination-card');
      const title = card?.querySelector('.destination-card-title')?.textContent || 'Dream Destination';
      const desc = card?.querySelector('.destination-card-desc')?.textContent || '';

      if (lightbox && lightboxImg && img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        if (lightboxTitle) lightboxTitle.textContent = title;
        if (lightboxDesc) lightboxDesc.textContent = desc;
        lightbox.classList.add('show');
      }
    });
  });

  if (lightboxClose && lightbox) {
    lightboxClose.addEventListener('click', () => {
      lightbox.classList.remove('show');
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('show');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('show')) {
        lightbox.classList.remove('show');
      }
    });
  }

  // --- Travel Compass Spinner ---
  const openCompassBtn = document.getElementById('openCompassBtn');
  const compassModal = document.getElementById('compassModal');
  const compassClose = document.getElementById('compassModalClose');
  const spinNeedleBtn = document.getElementById('spinNeedleBtn');
  const needle = document.getElementById('compassNeedle');
  const resultCard = document.getElementById('compassResultCard');
  const resultTitle = document.getElementById('compassResultTitle');
  const resultText = document.getElementById('compassResultText');
  const jumpToDestBtn = document.getElementById('jumpToDestBtn');

  const destinationsData = [
    {
      id: 'bahamas',
      name: 'The Bahamas 🇧🇸',
      angle: 45,
      angleRange: [20, 70],
      recommendation: 'The compass points to the Caribbean! Pack your snorkel and boardshorts—turquoise waters and the Exuma sandbars await!',
    },
    {
      id: 'paris',
      name: 'Paris, France 🇫🇷',
      angle: 135,
      angleRange: [110, 160],
      recommendation: 'The compass points to Europe! Get ready for the golden hour over the Eiffel Tower, the Louvre masterworks, and warm croissants.',
    },
    {
      id: 'tokyo',
      name: 'Tokyo, Japan 🇯🇵',
      angle: 225,
      angleRange: [200, 250],
      recommendation: 'The compass points to East Asia! Shibuya Crossing neon, Akihabara tech marvels, and the 200 mph Shinkansen are calling!',
    },
    {
      id: 'newyork',
      name: 'New York City 🇺🇸',
      angle: 315,
      angleRange: [290, 340],
      recommendation: 'The compass points to the Empire City! Walk the Brooklyn Bridge at twilight, see Times Square glowing, and take in the skyline.',
    },
  ];

  let selectedDest = null;
  let currentRotation = 0;
  let isSpinning = false;

  if (openCompassBtn && compassModal) {
    openCompassBtn.addEventListener('click', () => {
      compassModal.classList.add('show');
      if (resultCard) resultCard.style.display = 'none';
      if (spinNeedleBtn) {
        spinNeedleBtn.disabled = false;
        spinNeedleBtn.textContent = '🧭 Spin the Compass';
      }
    });
  }

  if (compassClose && compassModal) {
    compassClose.addEventListener('click', () => {
      compassModal.classList.remove('show');
    });

    compassModal.addEventListener('click', (e) => {
      if (e.target === compassModal) {
        compassModal.classList.remove('show');
      }
    });
  }

  if (spinNeedleBtn && needle) {
    spinNeedleBtn.addEventListener('click', () => {
      if (isSpinning) return;
      isSpinning = true;
      spinNeedleBtn.disabled = true;
      spinNeedleBtn.textContent = 'Spinning...';
      if (resultCard) resultCard.style.display = 'none';

      // Pick random destination
      const randomIndex = Math.floor(Math.random() * destinationsData.length);
      selectedDest = destinationsData[randomIndex];

      // Add 4 to 6 full rotations plus target angle
      const spins = (4 + Math.floor(Math.random() * 2)) * 360;
      currentRotation += spins + selectedDest.angle;

      needle.style.transform = `rotate(${currentRotation}deg)`;

      setTimeout(() => {
        isSpinning = false;
        spinNeedleBtn.disabled = false;
        spinNeedleBtn.textContent = 'Spin Again 🔄';

        if (resultCard && resultTitle && resultText) {
          resultTitle.textContent = `🎯 Destination Pick: ${selectedDest.name}`;
          resultText.textContent = selectedDest.recommendation;
          resultCard.style.display = 'block';
        }
      }, 3600);
    });
  }

  if (jumpToDestBtn && compassModal) {
    jumpToDestBtn.addEventListener('click', () => {
      if (!selectedDest) return;
      compassModal.classList.remove('show');

      // Reset filter to all or target
      const allFilterBtn = document.querySelector('.travel-filter-btn[data-filter="all"]');
      if (allFilterBtn) allFilterBtn.click();

      // Find target card and scroll
      const targetCard = document.querySelector(`.destination-card[data-destination="${selectedDest.id}"]`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetCard.style.outline = '4px solid #5bb2e9';
        targetCard.style.boxShadow = '0 0 35px rgba(91, 178, 233, 0.7)';
        setTimeout(() => {
          targetCard.style.outline = '';
          targetCard.style.boxShadow = '';
        }, 2500);
      }
    });
  }
});
