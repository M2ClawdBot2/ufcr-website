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

// ========== EAGLE FLY-ACROSS ==========
const eagleImg = document.querySelector('.eagle-img');
if (eagleImg) {
  gsap.to(eagleImg, {
    x: () => window.innerWidth + 600,
    y: -20,
    rotation: 0,
    ease: 'power1.inOut',
    scrollTrigger: {
      trigger: '.eagle-transition',
      start: 'top 90%',
      end: 'top 40%',
      scrub: 0.2,
    }
  });

  // Subtle wing bob (y only, no rotation)
  gsap.to(eagleImg, {
    marginTop: '-12px',
    yoyo: true,
    repeat: -1,
    duration: 0.6,
    ease: 'sine.inOut',
  });
}

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

// ========== COUNTER + PROGRESS BAR (SCROLL-LINKED) ==========
const statNumber = document.querySelector('.stat-number');
const progressFill = document.querySelector('.progress-fill');
const progressGlow = document.querySelector('.progress-glow');
const progressTrack = document.querySelector('.progress-track');

if (statNumber && progressFill && progressTrack) {
  const target = parseInt(statNumber.getAttribute('data-target')) || 10000000;
  let hasBroken = false;

  // Scroll-linked timeline
  const counterTL = gsap.timeline({
    scrollTrigger: {
      trigger: '#featured',
      start: 'top 90%',
      end: 'center center',
      scrub: 0.3,  // directly tied to scroll speed
    }
  });

  // Animate progress bar fill from 0 to 105% (overflows!)
  counterTL.to(progressFill, {
    width: '105%',
    duration: 1,
    ease: 'none',
  }, 0);

  // Glow intensifies
  counterTL.to(progressGlow, {
    width: '105%',
    boxShadow: '0 0 40px rgba(250,70,22,0.5), 0 0 80px rgba(255,45,45,0.3)',
    duration: 1,
    ease: 'none',
  }, 0);

  // Counter number
  const counterObj = { val: 0 };
  counterTL.to(counterObj, {
    val: target,
    duration: 1,
    ease: 'none',
    onUpdate: () => {
      const val = Math.floor(counterObj.val);
      if (val >= 1000000) {
        statNumber.textContent = (val / 1000000).toFixed(1).replace('.0', '') + 'M+';
      } else if (val >= 100000) {
        statNumber.textContent = Math.floor(val / 1000).toLocaleString() + 'K+';
      } else if (val >= 1000) {
        statNumber.textContent = Math.floor(val / 1000) + 'K+';
      } else {
        statNumber.textContent = val.toLocaleString();
      }

      // Break effect at 90%+
      const pct = val / target;
      if (pct > 0.85 && !hasBroken) {
        hasBroken = true;
        progressTrack.classList.add('broken');
        
        // Cracks appear
        gsap.to('.progress-crack', {
          opacity: 1,
          duration: 0.2,
          stagger: 0.05,
        });

        // Explosion flash
        gsap.to('.progress-explosion', {
          opacity: 1,
          scale: 1.5,
          duration: 0.3,
          ease: 'power2.out',
          onComplete: () => {
            gsap.to('.progress-explosion', { opacity: 0, duration: 0.5 });
          }
        });

        // Shards fly out
        document.querySelectorAll('.shard').forEach((shard, i) => {
          gsap.to(shard, {
            opacity: 1,
            x: 30 + Math.random() * 80,
            y: (Math.random() - 0.5) * 120,
            rotation: Math.random() * 360,
            scale: 0,
            duration: 0.8 + Math.random() * 0.4,
            ease: 'power2.out',
            delay: i * 0.03,
          });
        });
      }

      // Reset break if scrolling back up
      if (pct < 0.8 && hasBroken) {
        hasBroken = false;
        progressTrack.classList.remove('broken');
        gsap.to('.progress-crack', { opacity: 0, duration: 0.2 });
        document.querySelectorAll('.shard').forEach(shard => {
          gsap.set(shard, { opacity: 0, x: 0, y: 0, rotation: 0, scale: 1 });
        });
      }
    }
  }, 0);
}

// ========== BLOG STAMP REVEAL ==========
const blogStampHandle = document.querySelector('.blog-stamp-handle');
if (blogStampHandle) {
  const stampTL = gsap.timeline({
    scrollTrigger: {
      trigger: '.blog-section',
      start: 'top 80%',
      end: 'center center',
      scrub: 0.4,
    }
  });

  // Stamp handle moves down from above into frame
  stampTL.to('.blog-stamp-handle', {
    top: '35%',
    duration: 0.5,
    ease: 'none',
  }, 0);

  // At 50% — stamp slams down fast (the press moment)
  stampTL.to('.blog-stamp-handle', {
    top: '42%',
    duration: 0.1,
    ease: 'power4.in',
  }, 0.5);

  // Imprint appears on slam
  stampTL.to('.blog-stamp-imprint', {
    opacity: 1,
    duration: 0.05,
  }, 0.58);

  // Paper shake on impact
  stampTL.to('.blog-section', {
    x: -3,
    duration: 0.02,
  }, 0.58);
  stampTL.to('.blog-section', {
    x: 3,
    duration: 0.02,
  }, 0.60);
  stampTL.to('.blog-section', {
    x: -1,
    duration: 0.02,
  }, 0.62);
  stampTL.to('.blog-section', {
    x: 0,
    duration: 0.02,
  }, 0.64);

  // Stamp lifts back up and exits
  stampTL.to('.blog-stamp-handle', {
    top: '-300px',
    duration: 0.3,
    ease: 'power2.in',
  }, 0.65);

  // Content fades in after stamp leaves
  stampTL.to('.blog-reveal-content .blog-desc', {
    opacity: 1,
    y: 0,
    duration: 0.15,
  }, 0.8);

  stampTL.to('.blog-reveal-content .blog-cta', {
    opacity: 1,
    y: 0,
    duration: 0.15,
  }, 0.85);
}

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
