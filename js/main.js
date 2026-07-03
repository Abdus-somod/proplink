/* ─── PROPLINK MAIN JS ───────────────────────────────────────────────── */

// ── PAGE ROUTING ──────────────────────────────────────────────────────
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link[data-page]');

function showPage(pageId) {
  pages.forEach(p => p.classList.remove('active'));
  navLinks.forEach(l => l.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  document.querySelectorAll(`[data-page="${pageId}"]`).forEach(l => l.classList.add('active'));
  history.pushState({}, '', '#' + pageId);
  triggerReveal();
}

document.querySelectorAll('[data-page]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    showPage(el.dataset.page);
    closeMobileMenu();
  });
});

// Handle hash on load
const initialPage = window.location.hash.replace('#', '') || 'home';
showPage(initialPage);

// ── NAVBAR SCROLL ─────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  triggerReveal();
});

// ── MOBILE MENU ───────────────────────────────────────────────────────
const mobileMenu = document.getElementById('mobileMenu');
document.getElementById('hamburger').addEventListener('click', () => {
  mobileMenu.classList.add('open');
});
function closeMobileMenu() { mobileMenu.classList.remove('open'); }
document.getElementById('mobileClose').addEventListener('click', closeMobileMenu);

// ── REVEAL ON SCROLL ──────────────────────────────────────────────────
function triggerReveal() {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) el.classList.add('visible');
  });
}
window.addEventListener('scroll', triggerReveal, { passive: true });
setTimeout(triggerReveal, 100);

// ── TOAST ─────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = '';
  const icon = document.createElement('span');
  icon.textContent = type === 'success' ? '✓' : '✕';
  icon.style.cssText = `width:22px;height:22px;border-radius:50%;background:${type==='success'?'#22c55e':'#ef4444'};color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0`;
  const text = document.createElement('span');
  text.textContent = msg;
  text.style.fontSize = '0.9rem';
  toast.appendChild(icon); toast.appendChild(text);
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ── BOOKING FORM → GOOGLE SHEETS ──────────────────────────────────────
// IMPORTANT: Replace SHEET_URL below with your Google Apps Script Web App URL
// Setup: Google Sheets → Extensions → Apps Script → paste doPost() code → Deploy as Web App
const SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

async function submitToSheets(formData) {
  const payload = {};
  formData.forEach((v, k) => payload[k] = v);
  payload.timestamp = new Date().toISOString();
  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return true;
  } catch (e) {
    console.error('Sheet error:', e);
    return false;
  }
}

// Booking form
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = bookingForm.querySelector('.form-submit');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> Submitting...';
    btn.disabled = true;
    const data = new FormData(bookingForm);
    // If no sheet URL configured, simulate success
    let ok;
    if (SHEET_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
      await new Promise(r => setTimeout(r, 1500));
      ok = true;
    } else {
      ok = await submitToSheets(data);
    }
    btn.innerHTML = originalHTML; btn.disabled = false;
    if (ok) {
      bookingForm.reset();
      document.getElementById('bookingSuccess').style.display = 'block';
      showToast('Booking request submitted successfully!', 'success');
      bookingForm.style.display = 'none';
    } else {
      showToast('Something went wrong. Please try again.', 'error');
    }
  });
}

// Contact form
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = contactForm.querySelector('.form-submit');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> Sending...';
    btn.disabled = true;
    await new Promise(r => setTimeout(r, 1500));
    btn.innerHTML = originalHTML; btn.disabled = false;
    contactForm.reset();
    document.getElementById('contactSuccess').style.display = 'block';
    showToast('Message sent! We\'ll respond within 24 hours.', 'success');
    contactForm.style.display = 'none';
  });
}

// ── SEARCH ───────────────────────────────────────────────────────────
document.getElementById('searchBtn')?.addEventListener('click', () => {
  const loc = document.getElementById('searchLocation')?.value;
  const type = document.getElementById('searchType')?.value;
  const budget = document.getElementById('searchBudget')?.value;
  showToast(`Searching ${type || 'properties'} near ${loc || 'your location'}…`, 'success');
});

// ── COUNTER ANIMATION ─────────────────────────────────────────────────
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const duration = 1800;
  const step = (target / duration) * 16;
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { el.textContent = target.toLocaleString() + suffix; clearInterval(timer); return; }
    el.textContent = Math.floor(start).toLocaleString() + suffix;
  }, 16);
}

const countersAnimated = new Set();
function checkCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    if (countersAnimated.has(el)) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 50) {
      countersAnimated.add(el);
      const target = parseInt(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      animateCounter(el, target, suffix);
    }
  });
}
window.addEventListener('scroll', checkCounters, { passive: true });
setTimeout(checkCounters, 500);

// ── LISTING CARD CLICK ────────────────────────────────────────────────
document.querySelectorAll('.listing-card').forEach(card => {
  card.addEventListener('click', () => {
    showPage('book');
    showToast('Property selected. Complete your booking below.', 'success');
  });
});

// ── SMOOTH TRANSITIONS ────────────────────────────────────────────────
document.querySelectorAll('[data-goto]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    showPage(el.dataset.goto);
  });
});
