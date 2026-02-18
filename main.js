/* ========================================
   UFCR — Main JavaScript
   GSAP + ScrollTrigger Animations
   ======================================== */

gsap.registerPlugin(ScrollTrigger);

// ========== NAV ==========
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 80);
});

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// ========== HERO ANIMATIONS ==========
const heroTL = gsap.timeline({ delay: 0.3 });

heroTL
  .to('.hero-word', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power3.out'
  })
  .to('.hero-sub', {
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out'
  }, '-=0.3')
  .to('.hero-cta', {
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out'
  }, '-=0.4');

// Hero parallax
gsap.to('.hero-bg', {
  yPercent: 30,
  ease: 'none',
  scrollTrigger: {
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true
  }
});

// ========== SCROLL ANIMATIONS ==========

// Slide up + fade in
gsap.utils.toArray('.anim-up').forEach(el => {
  gsap.from(el, {
    y: 50,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      once: true
    }
  });
});

// Cards stagger
gsap.utils.toArray('.cards-grid, .events-grid').forEach(grid => {
  const cards = grid.querySelectorAll('.anim-card');
  if (cards.length) {
    gsap.set(cards, { y: 80, opacity: 0 });
    ScrollTrigger.create({
      trigger: grid,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(cards, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out'
        });
      }
    });
  }
});

// Photos stagger
const photoItems = gsap.utils.toArray('.anim-photo');
gsap.from(photoItems, {
  scale: 0.8,
  opacity: 0,
  duration: 0.7,
  stagger: 0.08,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '.photo-grid',
    start: 'top 80%',
    once: true
  }
});

// ========== LIGHTBOX ==========
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
let currentPhotoIndex = 0;
const photoSrcs = [];

document.querySelectorAll('.photo-item').forEach((item, i) => {
  const img = item.querySelector('img');
  photoSrcs.push(img.src);
  item.addEventListener('click', () => {
    currentPhotoIndex = i;
    lightboxImg.src = photoSrcs[i];
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.querySelector('.lightbox-prev').addEventListener('click', (e) => {
  e.stopPropagation();
  currentPhotoIndex = (currentPhotoIndex - 1 + photoSrcs.length) % photoSrcs.length;
  lightboxImg.src = photoSrcs[currentPhotoIndex];
});

document.querySelector('.lightbox-next').addEventListener('click', (e) => {
  e.stopPropagation();
  currentPhotoIndex = (currentPhotoIndex + 1) % photoSrcs.length;
  lightboxImg.src = photoSrcs[currentPhotoIndex];
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') document.querySelector('.lightbox-prev').click();
  if (e.key === 'ArrowRight') document.querySelector('.lightbox-next').click();
});

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

// ========== COUNTER ANIMATION ==========
document.querySelectorAll('.stat-number').forEach(counter => {
  const target = parseInt(counter.getAttribute('data-target'));
  if (!target) return;
  
  gsap.fromTo(counter, 
    { innerText: 0 },
    {
      innerText: target,
      duration: 3,
      ease: 'power2.out',
      snap: { innerText: 1 },
      scrollTrigger: {
        trigger: counter,
        start: 'top 85%',
        once: true
      },
      onUpdate: function() {
        const val = Math.floor(this.targets()[0].innerText || 0);
        if (val >= 1000000) {
          counter.textContent = (val / 1000000).toFixed(1).replace('.0', '') + 'M+';
        } else if (val >= 100000) {
          counter.textContent = Math.floor(val / 1000) + 'K+';
        } else {
          counter.textContent = val.toLocaleString();
        }
      }
    }
  );
});

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
