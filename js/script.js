// ============================================================
// Hassan Shot It — site interactivity
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- Year in footer ----
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Nav: solid background on scroll ----
  const nav = document.getElementById('siteNav');
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- Scroll progress bar ----
  const scrollProgress = document.getElementById('scrollProgress');
  if (scrollProgress) {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollProgress.style.width = pct + '%';
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
  }

  // ---- Scrollspy: highlight nav link for section in view ----
  const spySections = ['work', 'about', 'services', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const spyLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (spySections.length && 'IntersectionObserver' in window) {
    const setActive = (id) => {
      spyLinks.forEach(link => {
        link.classList.toggle('active-link', link.getAttribute('href') === '#' + id);
      });
    };
    const spyIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { threshold: 0, rootMargin: '-45% 0px -50% 0px' });
    spySections.forEach(sec => spyIo.observe(sec));
  }

  // ---- Mobile nav toggle ----
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });
  // close mobile menu after tapping a link
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // ---- Back to top ----
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- Portfolio filtering ----
  const filterBtns = document.querySelectorAll('.filter-btn');
  const gridItems = document.querySelectorAll('.grid-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      gridItems.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('filtered-out', !match);
      });
    });
  });

  // ---- Reveal on scroll ----
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  // ---- Reel play button ----
  const reelVideo = document.getElementById('reelVideo');
  const reelPlay = document.getElementById('reelPlay');
  if (reelVideo && reelPlay) {
    reelPlay.addEventListener('click', () => {
      reelVideo.play();
    });
    reelVideo.addEventListener('play', () => reelPlay.classList.add('hidden'));
    reelVideo.addEventListener('pause', () => reelPlay.classList.remove('hidden'));
  }

  // ---- Custom cursor (desktop / fine-pointer only) ----
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');

  if (isFinePointer && cursorDot && cursorRing) {
    document.documentElement.classList.add('has-cursor');

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let ringX = mouseX, ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    };
    requestAnimationFrame(animateRing);

    const hoverTargets = document.querySelectorAll('a, button, .grid-item, .reel-frame');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
    });

    // ---- Magnetic buttons ----
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${relX * 0.25}px, ${relY * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });

    // ---- Grid item tilt ----
    document.querySelectorAll('.grid-item').forEach(item => {
      item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        item.style.transition = 'none';
        item.style.transform = `rotateY(${px * 10}deg) rotateX(${py * -10}deg)`;
      });
      item.addEventListener('mouseleave', () => {
        item.style.transition = '';
        item.style.transform = '';
      });
    });

    // ---- Hero cursor spotlight ----
    const heroEl = document.querySelector('.hero');
    const heroSpotlight = document.getElementById('heroSpotlight');
    if (heroEl && heroSpotlight) {
      heroEl.addEventListener('mousemove', (e) => {
        const rect = heroEl.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        heroSpotlight.style.setProperty('--spot-x', x + '%');
        heroSpotlight.style.setProperty('--spot-y', y + '%');
      });
    }

    // ---- Service card cursor spotlight ----
    document.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--spot-x', x + '%');
        card.style.setProperty('--spot-y', y + '%');
      });
    });
  }

  // ---- Text scramble on hero tagline ----
  const scrambleEl = document.querySelector('.scramble');
  if (scrambleEl) {
    const finalText = scrambleEl.dataset.text || scrambleEl.textContent.trim();
    const chars = '!<>-_\\/[]{}—=+*^?#________';
    let frame = 0;
    const totalFrames = 34;

    const runScramble = () => {
      const interval = setInterval(() => {
        let output = '';
        const revealCount = Math.floor((frame / totalFrames) * finalText.length);
        for (let i = 0; i < finalText.length; i++) {
          if (finalText[i] === ' ') { output += ' '; continue; }
          if (i < revealCount) {
            output += finalText[i];
          } else {
            output += chars[Math.floor(Math.random() * chars.length)];
          }
        }
        scrambleEl.textContent = output;
        frame++;
        if (frame > totalFrames) {
          scrambleEl.textContent = finalText;
          clearInterval(interval);
        }
      }, 28);
    };
    setTimeout(runScramble, 500);
  }

  // ---- Stat counters ----
  const statNums = document.querySelectorAll('.stat-num');
  if (statNums.length && 'IntersectionObserver' in window) {
    const statIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        const duration = 1200;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        };
        requestAnimationFrame(tick);
        statIo.unobserve(el);
      });
    }, { threshold: 0.4 });
    statNums.forEach(el => statIo.observe(el));
  }

  // ---- Lightbox ----
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  if (lightbox && lightboxImg) {
    let currentIndex = -1;

    const visibleItems = () =>
      Array.from(gridItems).filter(item => !item.classList.contains('filtered-out'));

    const renderLightbox = () => {
      const items = visibleItems();
      const item = items[currentIndex];
      if (!item) return;
      const img = item.querySelector('img');
      const captionEl = item.querySelector('figcaption');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.innerHTML = captionEl ? captionEl.innerHTML : '';
    };

    const openLightbox = (item) => {
      const items = visibleItems();
      currentIndex = items.indexOf(item);
      if (currentIndex === -1) return;
      renderLightbox();
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    const step = (dir) => {
      const items = visibleItems();
      if (!items.length) return;
      currentIndex = (currentIndex + dir + items.length) % items.length;
      renderLightbox();
    };

    gridItems.forEach(item => {
      item.addEventListener('click', () => openLightbox(item));
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => step(-1));
    lightboxNext.addEventListener('click', () => step(1));

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });

    // re-close if the active filter changes and hides the open image
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (lightbox.classList.contains('open')) closeLightbox();
      });
    });
  }

  // ---- Contact form -> mailto ----
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const subject = form.subject.value;
      const message = form.message.value.trim();

      const mailSubject = encodeURIComponent(`${subject} — inquiry from ${name}`);
      const mailBody = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nType: ${subject}\n\nMessage:\n${message}`
      );

      window.location.href = `mailto:hassanshotit@gmail.com?subject=${mailSubject}&body=${mailBody}`;
    });
  }

});
