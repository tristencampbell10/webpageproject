/**
 * script.js - Client-side JavaScript for Webpage Project
 * Handles navigation, contact form submission, alerts, and media modal interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Mobile Navigation Toggle ---
  const mobileToggle = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });
  }

  // --- Contact Form Submission Handler ---
  const contactForm = document.getElementById('contactForm');
  const alertSuccess = document.getElementById('contactSuccessAlert');
  const alertError = document.getElementById('contactErrorAlert');
  const submitBtn = document.getElementById('contactSubmitBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Reset alert states
      if (alertSuccess) alertSuccess.style.display = 'none';
      if (alertError) alertError.style.display = 'none';

      // Read form values
      const firstName = (document.getElementById('firstName')?.value || '').trim();
      const lastName = (document.getElementById('lastName')?.value || '').trim();
      const email = (document.getElementById('email')?.value || '').trim();
      const reason = (document.getElementById('reason')?.value || '').trim();
      const message = (document.getElementById('message')?.value || '').trim();

      // Client-side Validation
      if (!firstName || !lastName || !email || !reason || !message) {
        showError('Please fill out all required fields before submitting.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showError('Please provide a valid email address.');
        return;
      }

      // Prepare payload
      const payload = {
        firstName,
        lastName,
        email,
        reason,
        message,
      };

      // Set loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Sending Message...';
      }

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.status === 201) {
          // Success
          showSuccess(`Thank you, ${data.firstName}! Your message has been received (ID: ${data.id.substring(0, 8)}). Tristen will review it shortly.`);
          contactForm.reset();
        } else {
          // Server returned error (e.g. 400 or 500)
          showError(data.error || 'Unable to submit your message. Please try again.');
        }
      } catch (err) {
        console.error('Contact submission error:', err);
        showError('Network or server storage error. Please check your connection and try again.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = 'Send Message';
        }
      }
    });
  }

  function showSuccess(msg) {
    if (alertSuccess) {
      alertSuccess.textContent = msg;
      alertSuccess.style.display = 'block';
    }
  }

  function showError(msg) {
    if (alertError) {
      alertError.textContent = msg;
      alertError.style.display = 'block';
    }
  }

  // --- Lightbox Modal for Media Page ---
  const lightbox = document.getElementById('mediaLightbox');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxMediaContainer = document.getElementById('lightboxMedia');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxCaption = document.getElementById('lightboxCaption');

  // Handle media card clicks
  const mediaCards = document.querySelectorAll('.media-gallery-card');

  // Media category filtering buttons
  const filterBtns = document.querySelectorAll('.media-filter-btn');
  if (filterBtns.length > 0) {
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const selectedCategory = btn.dataset.category;
        mediaCards.forEach((card) => {
          const cardCategory = card.dataset.category;
          if (selectedCategory === 'all' || cardCategory === selectedCategory) {
            card.classList.remove('filter-hidden');
          } else {
            card.classList.add('filter-hidden');
          }
        });
      });
    });
  }

  mediaCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      // If user clicked an external link inside a social card, let it open
      if (e.target.closest('a') || e.target.closest('iframe')) return;

      const mediaType = card.dataset.type;
      const mediaSrc = card.dataset.src;
      const title = card.dataset.title || '';
      const caption = card.dataset.caption || '';

      if (lightbox && lightboxMediaContainer) {
        lightboxMediaContainer.innerHTML = '';

        if (mediaType === 'image') {
          const img = document.createElement('img');
          img.src = mediaSrc;
          img.alt = title;
          lightboxMediaContainer.appendChild(img);
        } else if (mediaType === 'video') {
          const vid = document.createElement('video');
          vid.src = mediaSrc;
          vid.controls = true;
          vid.autoplay = true;
          lightboxMediaContainer.appendChild(vid);
        } else if (mediaType === 'hudl') {
          const iframe = document.createElement('iframe');
          iframe.src = mediaSrc;
          iframe.style.width = '100%';
          iframe.style.height = '420px';
          iframe.style.border = 'none';
          iframe.style.borderRadius = '12px';
          iframe.setAttribute('allowfullscreen', 'true');
          lightboxMediaContainer.appendChild(iframe);
        } else if (mediaType === 'embed') {
          const embedBox = card.querySelector('.social-embed-box');
          if (embedBox) {
            lightboxMediaContainer.appendChild(embedBox.cloneNode(true));
          }
        }

        if (lightboxTitle) lightboxTitle.textContent = title;
        if (lightboxCaption) lightboxCaption.textContent = caption;

        lightbox.style.display = 'flex';
      }
    });
  });

  if (lightboxClose && lightbox) {
    lightboxClose.addEventListener('click', () => {
      lightbox.style.display = 'none';
      if (lightboxMediaContainer) {
        // Stop video playback if open
        const vid = lightboxMediaContainer.querySelector('video');
        if (vid) vid.pause();
        const iframe = lightboxMediaContainer.querySelector('iframe');
        if (iframe) iframe.src = '';
        lightboxMediaContainer.innerHTML = '';
      }
    });

    // Close on clicking backdrop
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.style.display = 'none';
        if (lightboxMediaContainer) {
          const vid = lightboxMediaContainer.querySelector('video');
          if (vid) vid.pause();
          const iframe = lightboxMediaContainer.querySelector('iframe');
          if (iframe) iframe.src = '';
          lightboxMediaContainer.innerHTML = '';
        }
      }
    });
  }
});
