/**
 * DULCE COMPARTIR - JavaScript Principal
 * Manejo de navegación, tema, galería, formularios y accesibilidad
 */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ===== PANTALLA DE CARGA ===== */
  const loading = $('#loading');
  if (loading) {
    window.addEventListener('load', () => loading.classList.add('hidden'));
    setTimeout(() => loading.classList.add('hidden'), 2000);
  }

  /* ===== NAVEGACIÓN MÓVIL ===== */
  const navbar = $('#navbar');
  const menuToggle = $('#menuToggle');
  const navMenu = $('#navMenu');
  const navLinks = $$('.nav-link');

  function closeMobileMenu() {
    menuToggle?.classList.remove('active');
    navMenu?.classList.remove('active');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }

  menuToggle?.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true';
    menuToggle.setAttribute('aria-expanded', expanded);

    // Trap focus inside menu when open
    if (expanded === 'true') {
      const firstLink = navMenu?.querySelector('.nav-link');
      firstLink?.focus();
    }
  });

  // Cerrar menú al hacer clic en un enlace
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (navMenu?.classList.contains('active') && !e.target.closest('.nav-container')) {
      closeMobileMenu();
    }
  });

  // Cerrar menú con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu?.classList.contains('active')) {
      closeMobileMenu();
      menuToggle?.focus();
    }
  });

  /* ===== BOTÓN VOLVER ARRIBA ===== */
  const heroSection = $('#hero');
  const backToTop = $('#backToTop');

  const heroObserver = new IntersectionObserver(
    ([entry]) => { backToTop?.classList.toggle('visible', !entry.isIntersecting); },
    { threshold: 0 }
  );
  if (heroSection) heroObserver.observe(heroSection);

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ===== SCROLL: SOMBRA NAVBAR + ENLACE ACTIVO ===== */
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const current = window.scrollY;
        navbar?.classList.toggle('scrolled', current > 50);

        // Sección activa
        const sections = $$('section[id]');
        const activeSection = sections.reduce((acc, section) => {
          const top = section.offsetTop - 150;
          return current >= top ? section : acc;
        }, null);

        if (activeSection) {
          navLinks.forEach(l => {
            const isActive = l.getAttribute('href') === `#${activeSection.id}`;
            l.classList.toggle('active', isActive);
            if (isActive) {
              l.setAttribute('aria-current', 'section');
            } else {
              l.removeAttribute('aria-current');
            }
          });
        }

        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ===== CAMBIO DE TEMA CLARO/OSCURO ===== */
  const themeToggle = $('#themeToggle');
  const html = document.documentElement;

  // Detectar preferencia del sistema
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
  html.setAttribute('data-theme', savedTheme);

  function updateThemeButton(theme) {
    if (!themeToggle) return;
    const label = theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro';
    themeToggle.setAttribute('aria-label', label);
  }

  updateThemeButton(savedTheme);

  themeToggle?.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeButton(next);
  });

  /* ===== ANIMACIÓN SCROLL REVEAL ===== */
  const observeReveal = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observeReveal.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  $$('.section-header, .nosotros-grid, .contacto-grid, .productos-grid, .faq-grid, .newsletter-content').forEach(el => {
    el.classList.add('reveal');
    observeReveal.observe(el);
  });

  /* ===== CONTADORES ANIMADOS ===== */
  const counters = $$('.hero-stat-number');
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10);
          animateCounter(el, target);
          countObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach(c => countObserver.observe(c));

  function animateCounter(el, target) {
    let current = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = current + (target >= 1000 ? '+' : '');
    }, 25);
  }

  /* ===== FILTROS DE GALERÍA ===== */
  const filterBtns = $$('.filter-btn');
  const galleryItems = $$('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const filter = btn.getAttribute('data-filter');
      galleryItems.forEach(item => {
        const match = filter === 'all' || item.getAttribute('data-category') === filter;
        item.style.display = match ? 'block' : 'none';
        if (match) {
          item.style.animation = 'fadeIn 0.4s ease';
        }
      });
    });
  });

  /* ===== LIGHTBOX ===== */
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  const lightboxClose = $('.lightbox-close');
  const lightboxPrev = $('.lightbox-prev');
  const lightboxNext = $('.lightbox-next');
  let lightboxImages = [];
  let lightboxIndex = 0;
  let lastFocusedElement = null;

  $$('.gallery-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      lastFocusedElement = item;
      lightboxImages = $$('.gallery-item')
        .filter(i => i.style.display !== 'none')
        .map(i => i.getAttribute('href'));
      const href = item.getAttribute('href');
      lightboxIndex = lightboxImages.indexOf(href);
      openLightbox(href);
    });
  });

  function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose?.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastFocusedElement?.focus();
  }

  function navigateLightbox(dir) {
    lightboxIndex = (lightboxIndex + dir + lightboxImages.length) % lightboxImages.length;
    lightboxImg.src = lightboxImages[lightboxIndex];
  }

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxPrev?.addEventListener('click', () => navigateLightbox(-1));
  lightboxNext?.addEventListener('click', () => navigateLightbox(1));

  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Navegación con teclado en lightbox
  document.addEventListener('keydown', (e) => {
    if (!lightbox?.classList.contains('active')) return;

    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);

    // Trap focus inside lightbox
    if (e.key === 'Tab') {
      const focusable = [lightboxClose, lightboxPrev, lightboxNext];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  });

  /* ===== ACCORDION FAQ ===== */
  $$('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isActive = item.classList.contains('active');
      const answerId = btn.getAttribute('aria-controls');

      // Cerrar todos los items
      $$('.faq-item').forEach(i => {
        i.classList.remove('active');
        const q = i.querySelector('.faq-question');
        q?.setAttribute('aria-expanded', 'false');
      });

      // Abrir el clickeado si no estaba activo
      if (!isActive) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ===== FORMULARIO DE CONTACTO ===== */
  const contactoForm = $('#contactoForm');
  const formMessage = $('#formMessage');

  contactoForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = $('#nombre').value.trim();
    const telefono = $('#telefono').value.trim();
    const correo = $('#correo').value.trim();
    const evento = $('#evento').value;
    const fecha = $('#fecha').value;
    const personas = $('#personas').value;
    const mensaje = $('#mensaje').value.trim();

    if (!nombre || !telefono || !correo || !evento || !fecha || !personas || !mensaje) {
      formMessage.textContent = 'Por favor completa todos los campos.';
      formMessage.className = 'form-message error';
      return;
    }

    formMessage.innerHTML = '<i class="fas fa-check-circle" aria-hidden="true"></i> ¡Gracias por tu solicitud! Te contactaremos pronto.';
    formMessage.className = 'form-message success';
    contactoForm.reset();
    setTimeout(() => {
      formMessage.textContent = '';
      formMessage.className = 'form-message';
    }, 5000);
  });

  /* ===== FORMULARIO NEWSLETTER ===== */
  const newsletterForm = $('#newsletterForm');
  const newsletterMessage = $('#newsletterMessage');

  newsletterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#newsletterEmail').value.trim();
    if (!email || !email.includes('@')) {
      newsletterMessage.textContent = 'Por favor ingresa un correo válido.';
      return;
    }
    newsletterMessage.innerHTML = '<i class="fas fa-check-circle" aria-hidden="true"></i> ¡Suscripción exitosa! Gracias por unirte.';
    newsletterForm.reset();
    setTimeout(() => { newsletterMessage.textContent = ''; }, 4000);
  });

  /* ===== ANIMACIÓN FADE IN (INYECTADA) ===== */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  /* ===== SCROLL SUAVE PARA ENLACES ANCLA ===== */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = navbar?.offsetHeight || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
});
