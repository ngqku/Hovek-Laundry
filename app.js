/**
 * Hovek Laundry & Dry Cleaning
 * Single Page Application (SPA) Controller & Utilities
 * Pure Vanilla JavaScript ES6+
 */

(function () {
  'use strict';

  // --- Configuration & Constants ---
  // const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
  
  const WHATSAPP_PHONE_NUMBER = '254752275716'; // Kenya phone number in international format
  const DEFAULT_ROUTE = 'home';
  const VALID_ROUTES = ['home', 'how-it-works', 'about-us'];

  // --- DOM Elements ---
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link, .footer-nav-link');
  const viewContainers = document.querySelectorAll('.spa-view');
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const toastContainer = document.getElementById('toast-container');
  const primaryLeadForm = document.getElementById('primary-lead-form');
  const secondaryLeadForm = document.getElementById('secondary-lead-form');

  // --- SPA Hash Router ---
  function getRouteFromHash() {
    const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
    if (VALID_ROUTES.includes(rawHash)) {
      return rawHash;
    }
    return DEFAULT_ROUTE;
  }

  function renderView(routeId) {
    // Hide all views
    viewContainers.forEach((view) => {
      view.classList.remove('active-view');
    });

    // Show target view
    const targetView = document.getElementById(`view-${routeId}`);
    if (targetView) {
      targetView.classList.add('active-view');
    }

    // Update active nav links
    navLinks.forEach((link) => {
      const linkHref = link.getAttribute('href') || '';
      const linkRoute = linkHref.replace(/^#\/?/, '').trim();
      if (linkRoute === routeId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Close mobile drawer if open
    if (mobileDrawer && mobileDrawer.classList.contains('open')) {
      mobileDrawer.classList.remove('open');
      if (mobileToggle) {
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    }

    // Scroll to top on view change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleRoute() {
    const route = getRouteFromHash();
    renderView(route);
  }

  // --- Toast Notification Utility ---
  function showToast(title, message, type = 'success', duration = 5000) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.id = `toast-${Date.now()}`;

    const iconSvg = type === 'success'
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-content">
        <h4 class="toast-title">${title}</h4>
        <p class="toast-message">${message}</p>
      </div>
      <button class="toast-close-btn" aria-label="Close notification">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn.addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    });

    toastContainer.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto-dismiss
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }

  // --- Lead Form Handler & Validation ---
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function validatePhone(phone) {
    // Check at least 7 digits
    const digits = String(phone).replace(/\D/g, '');
    return digits.length >= 7;
  }

  async function handleFormSubmit(event, formElement, formSource) {
    event.preventDefault();

    const nameInput = formElement.querySelector('[name="name"]');
    const phoneInput = formElement.querySelector('[name="phone"]');
    const emailInput = formElement.querySelector('[name="email"]');
    const serviceSelect = formElement.querySelector('[name="service"]');
    const notesInput = formElement.querySelector('[name="notes"]');
    const submitBtn = formElement.querySelector('.btn-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');

    let isValid = true;

    // Clear previous errors
    formElement.querySelectorAll('.form-input, .form-select').forEach((el) => el.classList.remove('error'));
    formElement.querySelectorAll('.form-error-msg').forEach((el) => (el.style.display = 'none'));

    // Validate Name
    if (!nameInput || !nameInput.value.trim()) {
      if (nameInput) nameInput.classList.add('error');
      const err = formElement.querySelector('#' + (nameInput ? nameInput.id : '') + '-error');
      if (err) err.style.display = 'block';
      isValid = false;
    }

    // Validate Phone
    if (!phoneInput || !phoneInput.value.trim() || !validatePhone(phoneInput.value)) {
      if (phoneInput) phoneInput.classList.add('error');
      const err = formElement.querySelector('#' + (phoneInput ? phoneInput.id : '') + '-error');
      if (err) err.style.display = 'block';
      isValid = false;
    }

    // Validate Email
    if (!emailInput || !emailInput.value.trim() || !validateEmail(emailInput.value)) {
      if (emailInput) emailInput.classList.add('error');
      const err = formElement.querySelector('#' + (emailInput ? emailInput.id : '') + '-error');
      if (err) err.style.display = 'block';
      isValid = false;
    }

    // Validate Service
    if (serviceSelect && !serviceSelect.value) {
      serviceSelect.classList.add('error');
      const err = formElement.querySelector('#' + serviceSelect.id + '-error');
      if (err) err.style.display = 'block';
      isValid = false;
    }

    if (!isValid) {
      showToast('Please check your inputs', 'Some required fields are missing or invalid.', 'error');
      return;
    }

    // Generate Booking Ref
    const bookingRef = 'FP-' + Math.floor(100000 + Math.random() * 900000);
    const payload = {
      bookingId: bookingRef,
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      email: emailInput.value.trim(),
      service: serviceSelect ? serviceSelect.value : 'General Inquiry',
      notes: notesInput ? notesInput.value.trim() : '',
      formSource: formSource,
      timestamp: new Date().toISOString()
    };

    // UI Loading state
    submitBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (spinner) spinner.style.display = 'inline-block';

    try {
      // Save locally to persist bookings in preview
      const existingBookings = JSON.parse(localStorage.getItem('hovek_bookings') || '[]');
      existingBookings.unshift(payload);
      localStorage.setItem('hovek_bookings', JSON.stringify(existingBookings));

      // ========== GOOGLE SHEETS INTEGRATION ==========
      // 
      // try {
      //   const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
      //   const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      //     method: 'POST',
      //     mode: 'no-cors', // required for Google Apps Script Web Apps
      //     headers: {
      //       'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify(payload)
      //   });
      //   console.log('Form submitted to Google Sheets successfully');
      // } catch (networkErr) {
      //   console.warn('Google Sheets integration notice:', networkErr);
      //   
      // }
      // ===============================================

      // Success Feedback
      formElement.reset();
      showToast(
        'Pickup Scheduled Successfully!',
        `Thank you ${payload.name}! Ref #${bookingRef}. Our driver will contact you at ${payload.phone} before arrival.`,
        'success',
        6500
      );
    } catch (err) {
      console.error('Submission error:', err);
      showToast('Submission Notice', 'Your request has been recorded locally. We will contact you shortly!', 'success');
    } finally {
      // Restore Button state
      submitBtn.disabled = false;
      if (btnText) btnText.style.display = 'inline-block';
      if (spinner) spinner.style.display = 'none';
    }
  }

  // --- Quick Service Selector Buttons ---
  function setupServiceCards() {
    const serviceBtns = document.querySelectorAll('.service-select-btn');
    serviceBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const serviceValue = btn.getAttribute('data-service');
        window.location.hash = '#home';
        setTimeout(() => {
          const formCard = document.getElementById('lead-form-card');
          const serviceSelect = document.getElementById('primary-service-select');
          if (formCard && formCard.scrollIntoView) {
            formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          if (serviceSelect && serviceValue) {
            serviceSelect.value = serviceValue;
            serviceSelect.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, 100);
      });
    });
  }

  // --- FAQ Accordion ---
  function setupFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach((item) => {
      const btn = item.querySelector('.faq-question-btn');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const isActive = item.classList.contains('active');
          // Close others
          faqItems.forEach((other) => other.classList.remove('active'));
          if (!isActive) {
            item.classList.add('active');
          }
        });
      }
    });
  }

  // --- WhatsApp Float Button Interaction ---
  function setupWhatsAppButton() {
    const waBtn = document.getElementById('whatsapp-float-btn');
    if (waBtn) {
      waBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const message = encodeURIComponent('Hello Hovek! I would like to schedule a laundry & dry cleaning pickup.');
        const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${message}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      });
    }
  }

  // --- Mobile Drawer Menu ---
  function setupMobileMenu() {
    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = mobileDrawer.classList.contains('open');
        if (isOpen) {
          mobileDrawer.classList.remove('open');
          mobileToggle.setAttribute('aria-expanded', 'false');
        } else {
          mobileDrawer.classList.add('open');
          mobileToggle.setAttribute('aria-expanded', 'true');
        }
      });

      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (mobileDrawer && mobileToggle && !mobileDrawer.contains(e.target) && !mobileToggle.contains(e.target)) {
          mobileDrawer.classList.remove('open');
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      });

      // Close mobile drawer when a link is clicked
      const mobileLinks = document.querySelectorAll('.mobile-nav-link');
      mobileLinks.forEach((link) => {
        link.addEventListener('click', () => {
          if (mobileDrawer) {
            mobileDrawer.classList.remove('open');
            if (mobileToggle) {
              mobileToggle.setAttribute('aria-expanded', 'false');
            }
          }
        });
      });
    }
  }

  // --- Initialization ---
  function init() {
    // Router events
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);

    // Initial view render
    handleRoute();

    // Form Event Listeners
    if (primaryLeadForm) {
      primaryLeadForm.addEventListener('submit', (e) => handleFormSubmit(e, primaryLeadForm, 'Home Hero Form'));
    }
    if (secondaryLeadForm) {
      secondaryLeadForm.addEventListener('submit', (e) => handleFormSubmit(e, secondaryLeadForm, 'How It Works Page Form'));
    }

    // Setup Components
    setupServiceCards();
    setupFaqAccordion();
    setupWhatsAppButton();
    setupMobileMenu();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();