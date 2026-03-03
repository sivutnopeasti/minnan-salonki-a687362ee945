/* =============================================
   MINNAN SALONKI – main.js
   ============================================= */

'use strict';

/* ── Navigaatio: scroll-efekti ── */
(function initScrollHeader() {
  var header = document.getElementById('site-header');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Mobiilivalikko (hamburger) ── */
(function initMobileMenu() {
  var hamburger   = document.getElementById('hamburger');
  var mobileMenu  = document.getElementById('mobile-menu');
  var mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta');

  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    var isOpen = hamburger.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && hamburger.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });

  /* Sulje valikko klikattaessa sivun ulkopuolella */
  document.addEventListener('click', function (e) {
    if (
      hamburger.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMenu();
    }
  });
})();

/* ── Scroll-animaatiot (IntersectionObserver) ── */
(function initReveal() {
  var selectors = [
    '.service-card',
    '.benefit-item',
    '.price-group',
    '.style-card',
    '.masonry-item',
    '.meista-grid',
    '.contact-grid',
    '.cta-bar-inner',
    '.section-header'
  ];

  var elements = document.querySelectorAll(selectors.join(', '));

  elements.forEach(function (el, index) {
    el.classList.add('reveal');
    var delay = index % 4;
    if (delay > 0) {
      el.classList.add('reveal-delay-' + delay);
    }
  });

  if (!('IntersectionObserver' in window)) {
    elements.forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.10, rootMargin: '0px 0px -36px 0px' }
  );

  elements.forEach(function (el) {
    observer.observe(el);
  });
})();

/* ── Yhteydenottolomake (Formspree + validointi) ── */
(function initContactForm() {
  var form   = document.getElementById('contact-form');
  var status = document.getElementById('form-status');

  if (!form || !status) return;

  function showStatus(message, type) {
    status.textContent = message;
    status.className   = 'form-status ' + type;
    status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    if (type === 'success') {
      setTimeout(function () {
        status.textContent = '';
        status.className   = 'form-status';
      }, 7000);
    }
  }

  function validateForm(data) {
    var nimi  = (data.get('nimi') || '').trim();
    var email = (data.get('email') || '').trim();
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (nimi.length < 2) {
      return 'Kirjoita nimesi (vähintään 2 merkkiä).';
    }
    if (!emailRegex.test(email)) {
      return 'Kirjoita toimiva sähköpostiosoite.';
    }
    return null;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var data            = new FormData(form);
    var validationError = validateForm(data);

    if (validationError) {
      showStatus(validationError, 'error');
      return;
    }

    var submitBtn    = form.querySelector('button[type="submit"]');
    var originalText = submitBtn.textContent;
    submitBtn.textContent = 'Lähetetään…';
    submitBtn.disabled    = true;

    fetch(form.action, {
      method:  'POST',
      body:    data,
      headers: { 'Accept': 'application/json' }
    })
      .then(function (response) {
        if (response.ok) {
          showStatus('Viesti lähetetty. Palaamme asiaan pian.', 'success');
          form.reset();
          /* Nollaa mahdolliset validointikorostukset */
          form.querySelectorAll('input, textarea, select').forEach(function (el) {
            el.style.borderColor = '';
          });
        } else {
          return response.json().then(function (json) {
            var msg = (json.errors && json.errors.length)
              ? json.errors.map(function (err) { return err.message; }).join(', ')
              : 'Lähetys epäonnistui.';
            throw new Error(msg);
          });
        }
      })
      .catch(function (err) {
        console.error('Lomakkeen lähetys epäonnistui:', err);
        showStatus(
          'Viestin lähetys epäonnistui. Soita meille: 040 0450902.',
          'error'
        );
      })
      .finally(function () {
        submitBtn.textContent = originalText;
        submitBtn.disabled    = false;
      });
  });

  /* Reaaliaikainen kenttävalidointi */
  var requiredFields = form.querySelectorAll('[required]');
  requiredFields.forEach(function (field) {
    field.addEventListener('blur', function () {
      if (!field.value.trim()) {
        field.style.borderColor = '#C0392B';
      } else {
        field.style.borderColor = '';
      }
    });
    field.addEventListener('input', function () {
      if (field.value.trim()) {
        field.style.borderColor = '';
      }
    });
  });
})();

/* ── Sujuva ankkurivieritys ── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      var header    = document.getElementById('site-header');
      var navHeight = header ? header.offsetHeight : 72;
      var targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
})();