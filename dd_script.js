/* ══════════════════════════════════════════
   DETAILING DADDY — dd_script.js
   Handles: Hamburger, FAQ, Forms, Reviews
   Carousel, Scroll Shadow, Image fallbacks
══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── 1. HAMBURGER MENU ─── */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }


  /* ─── 2. FAQ ACCORDION ─── */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      const answer = btn.nextElementSibling;
      const icon   = btn.querySelector('.faq-icon');

      // Close all others
      document.querySelectorAll('.faq-question').forEach(other => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          const oa = other.nextElementSibling;
          const oi = other.querySelector('.faq-icon');
          if (oa) oa.classList.remove('open');
          if (oi) oi.textContent = '+';
        }
      });

      // Toggle current
      btn.setAttribute('aria-expanded', !isOpen);
      answer.classList.toggle('open', !isOpen);
      icon.textContent = isOpen ? '+' : '×';
    });
  });


  /* ─── 3. FORM SUBMISSIONS ─── */
  function attachFormHandler(btn, fields) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const wrap = btn.closest('section') || btn.closest('.hero-form') || btn.closest('.contact-form-wrap') || document;

      // Collect inputs (exclude message textarea)
      const inputs  = wrap.querySelectorAll('input[type="text"]:not([placeholder*="Message"]), input[type="tel"], input[type="email"]');
      const selects = wrap.querySelectorAll('select');
      let valid = true;

      // Validate only required fields (message field is excluded)
      inputs.forEach(inp => {
        // Skip message field - don't validate or modify it
        if (inp.placeholder && inp.placeholder.toLowerCase().includes('message')) return;
        if (!inp.value.trim()) { highlight(inp); valid = false; }
        else                   { unhighlight(inp); }
      });
      selects.forEach(sel => {
        if (!sel.value || sel.value === '') { highlight(sel); valid = false; }
        else            { unhighlight(sel); }
      });

      if (!valid) { 
        showToast('Please fill in all required fields.', 'error'); 
        return; 
      }

      // Phone validation — find tel input
      const phoneInput = wrap.querySelector('input[type="tel"]');
      if (phoneInput) {
        const phone = phoneInput.value.replace(/\s/g, '');
        if (!/^\d{10}$/.test(phone)) {
          highlight(phoneInput);
          showToast('Please enter a valid 10-digit phone number.', 'error');
          return;
        }
      }

      // Success - redirect to thank you page immediately
      // Note: Message field and submit button are not modified/cleared
      window.location.href = 'dd_thankyou.html';
    });
  }

  function highlight(el) {
    el.style.borderColor = '#E31E24';
    el.style.boxShadow   = '0 0 0 3px rgba(227,30,36,0.15)';
  }
  function unhighlight(el) {
    el.style.borderColor = '';
    el.style.boxShadow   = '';
  }

  // Hero form submit
  const heroSubmit = document.querySelector('.hero-form .btn-full');
  if (heroSubmit) attachFormHandler(heroSubmit);

  // Contact form submit
  const contactSubmit = document.querySelector('.btn-submit-enquiry');
  if (contactSubmit) attachFormHandler(contactSubmit);


  /* ─── 4. TOAST NOTIFICATION ─── */
  function showToast(message, type = 'success') {
    const existing = document.querySelector('.dd-toast');
    if (existing) existing.remove();

    // Inject styles once
    if (!document.getElementById('dd-toast-style')) {
      const s = document.createElement('style');
      s.id = 'dd-toast-style';
      s.textContent = `
        .dd-toast {
          position: fixed; bottom: 90px; left: 50%;
          transform: translateX(-50%) translateY(16px);
          padding: 13px 28px; border-radius: 0px;
          font-family: 'Outfit', sans-serif; font-size: .93rem; font-weight: 500;
          z-index: 9999; opacity: 0;
          transition: opacity .3s, transform .3s;
          box-shadow: 0 4px 16px rgba(0,0,0,.18);
          white-space: nowrap;
        }
        .dd-toast--success { background: #2E7D32; color: #fff; }
        .dd-toast--error   { background: #c62828; color: #fff; }
        .dd-toast.visible  { opacity: 1; transform: translateX(-50%) translateY(0); }
      `;
      document.head.appendChild(s);
    }

    const t = document.createElement('div');
    t.className = `dd-toast dd-toast--${type}`;
    t.textContent = message;
    document.body.appendChild(t);
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('visible')));
    setTimeout(() => { t.classList.remove('visible'); setTimeout(() => t.remove(), 400); }, 3500);
  }


  /* ─── 5. REVIEWS SLIDER ─── */
  const slider = document.getElementById('reviewsSlider');
  const prevBtn = document.getElementById('reviewPrev');
  const nextBtn = document.getElementById('reviewNext');

  if (slider && prevBtn && nextBtn) {
    function getCardWidth() {
      // Cards are fixed at 320px
      return 320;
    }

    function getScrollAmount() {
      const cardWidth = getCardWidth();
      const gap = 24;
      return cardWidth + gap;
    }

    function getVisibleCount() {
      const w = window.innerWidth;
      if (w <= 640) return 1;
      if (w <= 960) return 2;
      return 3;
    }

    // No need to update slider width - cards are fixed at 320px
    // The container will naturally show the correct number based on its width

    nextBtn.addEventListener('click', () => {
      const scrollAmount = getScrollAmount();
      slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    prevBtn.addEventListener('click', () => {
      const scrollAmount = getScrollAmount();
      slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    // Update slider width on resize to show correct number of cards
    window.addEventListener('resize', () => {
      updateSliderWidth();
    });

    // Initialize
    updateSliderWidth();
    window.addEventListener('load', () => {
      updateSliderWidth();
    });
  }


  /* ─── 6. NAVBAR SCROLL SHADOW ─── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
      } else {
        navbar.style.boxShadow = '0 1px 8px rgba(0,0,0,0.06)';
      }
    }, { passive: true });
  }


  /* ─── 7. ACTIVE NAV LINK HIGHLIGHT ─── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => { link.style.color = ''; link.style.fontWeight = ''; });
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) { active.style.color = '#C86D1A'; active.style.fontWeight = '600'; }
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(sec => io.observe(sec));


  /* ─── 8. SMOOTH IMAGE ERROR HANDLING ─── */
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => { img.style.display = 'none'; });
    img.addEventListener('load', () => {
      const ph = img.nextElementSibling;
      if (ph && ph.classList.contains('img-placeholder-text')) {
        ph.style.display = 'none';
      }
    });
  });

});
