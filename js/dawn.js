/**
 * DAWN – FISAT Rover Team Core Engine & Animations
 */

(function () {
  'use strict';

  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Text Animation on Headings with .split-rise
  function initTextRise() {
    var headings = document.querySelectorAll('.split-rise');
    headings.forEach(function (h) {
      var text = h.textContent.trim();
      h.setAttribute('aria-label', text);
      h.textContent = '';
      text.split('').forEach(function (char, i) {
        var span = document.createElement('span');
        span.className = 'ch';
        span.setAttribute('aria-hidden', 'true');
        span.textContent = char === ' ' ? '\u00a0' : char;
        if (!rm) {
          span.style.cssText = 'animation: rise .9s cubic-bezier(.2,.7,.2,1) ' + (i * 0.035 + 0.15) + 's both;';
        }
        h.appendChild(span);
      });
    });
  }

  // 2. Starfield Canvas Animation
  function initStarfield() {
    var cv = document.getElementById('stars');
    if (!cv) return;
    var cx = cv.getContext('2d');
    var st = [];
    var sy = window.scrollY || 0;

    function resize() {
      cv.width = cv.offsetWidth;
      cv.height = cv.offsetHeight;
      st = [];
      var count = Math.min(160, Math.floor(cv.width / 8));
      for (var i = 0; i < count; i++) {
        st.push({
          x: Math.random() * cv.width,
          y: Math.random() * cv.height * 0.85,
          r: Math.random() * 1.5 + 0.3,
          p: Math.random() * 6,
          d: Math.random() * 0.6 + 0.2
        });
      }
    }

    function draw(now) {
      cx.clearRect(0, 0, cv.width, cv.height);
      st.forEach(function (s) {
        var a = rm ? 0.7 : 0.35 + 0.65 * Math.abs(Math.sin((now / 1000) * s.d + s.p));
        cx.fillStyle = 'rgba(255, 255, 255, ' + a + ')';
        cx.beginPath();
        cx.arc(s.x, (s.y - sy * s.d * 0.25 + cv.height) % cv.height, s.r, 0, Math.PI * 2);
        cx.fill();
      });
      if (!rm) requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', function () {
      sy = window.scrollY;
    }, { passive: true });
    requestAnimationFrame(draw);
  }

  // 3. Scroll Progress and Sticky Nav
  function initScrollNav() {
    var pr = document.getElementById('prog');
    var nav = document.getElementById('nav');

    window.addEventListener('scroll', function () {
      var d = document.documentElement;
      var scrollable = d.scrollHeight - window.innerHeight;
      if (pr && scrollable > 0) {
        pr.style.width = ((window.scrollY / scrollable) * 100) + '%';
      }
      if (nav) {
        nav.classList.toggle('sc', window.scrollY > 50);
      }
    }, { passive: true });
  }

  // 4. Scroll Reveal via IntersectionObserver
  function initScrollReveal() {
    var elements = document.querySelectorAll('.rv, section:not(#top) > *, .grid > *, .stats > *');
    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
          entry.target.querySelectorAll('[data-n]').forEach(animateCounter);
        }
      });
    }, { threshold: 0.12 });

    elements.forEach(function (el) {
      el.classList.add('rv');
      io.observe(el);
    });
  }

  function animateCounter(el) {
    var target = +el.dataset.n;
    var suffix = el.dataset.s || '';
    if (rm || isNaN(target)) {
      el.textContent = target + suffix;
      return;
    }
    var startTime = null;
    function update(ts) {
      startTime = startTime || ts;
      var p = Math.min((ts - startTime) / 1600, 1);
      var current = Math.round(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = current + suffix;
      if (p < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // 5. Achievements Carousel
  function initCarousel() {
    var car = document.getElementById('car');
    if (!car) return;
    var prevBtn = document.getElementById('pv');
    var nextBtn = document.getElementById('nx');

    var getStep = function () {
      return (car.firstElementChild ? car.firstElementChild.offsetWidth : 340) + 20;
    };

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        car.scrollBy({ left: getStep(), behavior: 'smooth' });
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        car.scrollBy({ left: -getStep(), behavior: 'smooth' });
      });
    }

    var isDown = false;
    var startX = 0;
    var scrollLeft = 0;

    car.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      isDown = true;
      startX = e.clientX;
      scrollLeft = car.scrollLeft;
      car.classList.add('drag');
    });

    window.addEventListener('pointermove', function (e) {
      if (!isDown) return;
      car.scrollLeft = scrollLeft - (e.clientX - startX);
    });

    window.addEventListener('pointerup', function () {
      if (isDown) {
        isDown = false;
        car.classList.remove('drag');
      }
    });
  }

  // 6. Subsystem Details Modal
  function initSubsystemModal() {
    var modal = document.getElementById('teamModal');
    var closeBtn = document.getElementById('closeTeamModal');
    var modalTitle = document.getElementById('teamModalTitle');
    var modalDesc = document.getElementById('teamModalDesc');
    var cards = document.querySelectorAll('[data-team]');

    if (!modal || !cards.length) return;

    var subsystemData = {
      'AI and Autonomy': {
        title: 'AI & Autonomy Subsystem',
        description: 'AI and Autonomy handles real-time environment mapping, simultaneous localization, obstacle detection, and path planning using depth vision sensors and IMUs. The system autonomously detects waypoint coordinates and arrow navigational signage to traverse Mars-analogue terrains with precision and fail-safe recovery algorithms.'
      },
      'Electrical': {
        title: 'Electrical Subsystem',
        description: 'Engineered for extreme reliability under high load conditions. Features dual 25.2V high-discharge lithium batteries managed by an intelligent Battery Management System (BMS) with independent power isolation buses, transient voltage surge protection, and telemetry monitoring for all onboard computer and actuator nodes.'
      },
      'Mechanical': {
        title: 'Mechanical Subsystem',
        description: 'Designed around a rugged rocker-bogie Mars suspension architecture that maximizes ground contact across boulder-strewn surfaces. Developed custom compliant TPU wheels, precision CNC machined joints, and a high degree-of-freedom robotic manipulator capable of scientific sampling and fine payload dexterity.'
      },
      'Control': {
        title: 'Control & Telecommunications',
        description: 'High-throughput hierarchical control architecture combining NVIDIA Jetson compute for autonomous decision-making and low-latency dual-core ESP32 microcontrollers executing deterministic PID closed-loop motion control. Features redundant long-range RF and 5GHz telemetry links for flawless remote mission control.'
      }
    };

    function openModal(teamKey) {
      var data = subsystemData[teamKey];
      if (!data) return;
      if (modalTitle) modalTitle.textContent = data.title;
      if (modalDesc) modalDesc.textContent = data.description;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    cards.forEach(function (card) {
      card.addEventListener('click', function (e) {
        var key = card.getAttribute('data-team');
        if (key && subsystemData[key]) {
          e.preventDefault();
          openModal(key);
        }
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
  }

  // 7. Admin Modal
  function initAdminModal() {
    var adminTrigger = document.querySelector('.admin-btn-trigger');
    var adminModal = document.getElementById('adminModal');
    var closeAdmin = document.getElementById('closeAdminModal');

    if (!adminModal) return;

    function openAdmin() {
      adminModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeAdminModal() {
      adminModal.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (adminTrigger) {
      adminTrigger.addEventListener('click', function (e) {
        e.preventDefault();
        openAdmin();
      });
    }

    if (closeAdmin) closeAdmin.addEventListener('click', closeAdminModal);
    adminModal.addEventListener('click', function (e) {
      if (e.target === adminModal) closeAdminModal();
    });
  }

  // 8. Gallery Lightbox Modal
  function initGalleryLightbox() {
    var lightbox = document.getElementById('lightboxModal');
    var lightboxImg = document.getElementById('lightboxImg');
    var closeLightbox = document.getElementById('closeLightbox');
    var galleryImgs = document.querySelectorAll('.gallery-thumb');

    if (!lightbox || !lightboxImg) return;

    function open(src) {
      lightboxImg.src = src;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    galleryImgs.forEach(function (img) {
      img.addEventListener('click', function () {
        open(img.dataset.full || img.src);
      });
    });

    if (closeLightbox) closeLightbox.addEventListener('click', close);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target === lightboxImg) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) close();
    });
  }

  // 9. Mobile Navigation Drawer
  function initMobileNav() {
    var toggle = document.querySelector('.mobile-toggle');
    var navList = document.querySelector('nav ul');
    if (!toggle || !navList) return;

    toggle.addEventListener('click', function () {
      navList.classList.toggle('open');
      toggle.setAttribute('aria-expanded', navList.classList.contains('open'));
    });

    navList.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navList.classList.remove('open');
      });
    });
  }

  // 10. Team Category Filter (for team.html)
  function initTeamFilter() {
    var filterBtns = document.querySelectorAll('.team-filter-btn');
    var cards = document.querySelectorAll('.team-member-card');
    if (!filterBtns.length || !cards.length) return;

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var cat = btn.getAttribute('data-filter');

        cards.forEach(function (card) {
          var cardCats = card.getAttribute('data-category') || '';
          if (cat === 'all' || cardCats.toLowerCase().indexOf(cat.toLowerCase()) !== -1) {
            card.style.display = 'flex';
            setTimeout(function () { card.style.opacity = '1'; }, 10);
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // DOMContentLoaded Execution
  function init() {
    initTextRise();
    initStarfield();
    initScrollNav();
    initScrollReveal();
    initCarousel();
    initSubsystemModal();
    initAdminModal();
    initGalleryLightbox();
    initMobileNav();
    initTeamFilter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
