import { initThreeScene } from './three-scene.js';
import {
  personalInfo as defaultPersonalInfo,
  translations as defaultTranslations,
  services as defaultServices,
  projects as defaultProjects
} from './data/projects.js';
import { loadMergedData, initCms } from './cms.js';

const defaultData = {
  personalInfo: defaultPersonalInfo,
  translations: defaultTranslations,
  services: defaultServices,
  projects: defaultProjects
};

let liveData = loadMergedData(defaultData);

// SVG Icons for services
const serviceIcons = {
  code: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
  mobile: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg>`,
  rocket: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>`,
  shield: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>`
};

const highlightIcons = [
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"></path></svg>`,
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path></svg>`,
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>`,
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>`
];

let currentLang = localStorage.getItem('nativer_lang') || 'en';
let currentCategory = 'all';

document.addEventListener('DOMContentLoaded', () => {
  initThreeScene();
  renderTechStrip();
  setupLanguageSwitcher();
  applyPersonalInfo();
  applyLanguage(currentLang);
  setupProjectFilters();
  setupHeaderScroll();
  setupMobileMenu();
  setupCvModal();
  setupCopyEmail();
  setupRevealObserver();

  initCms({
    defaults: defaultData,
    getLiveData: () => liveData,
    setLiveData: (next) => { liveData = next; },
    onDataChange: () => {
      renderTechStrip();
      applyPersonalInfo();
      applyLanguage(currentLang);
    }
  });

  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

function applyPersonalInfo() {
  const pi = liveData.personalInfo;
  document.querySelectorAll('[data-info="name"]').forEach(el => {
    el.textContent = pi.name;
  });
  document.querySelectorAll('[data-info="brandTitle"]').forEach(el => {
    el.textContent = pi.brandTitle;
  });
  document.querySelectorAll('[data-info="location"]').forEach(el => {
    el.textContent = pi.location;
  });
  document.querySelectorAll('[data-info="email"]').forEach(el => {
    el.textContent = pi.email;
    if (el.tagName === 'A') el.href = `mailto:${pi.email}`;
  });
  document.querySelectorAll('[data-info="github"]').forEach(el => {
    const clean = pi.social.github.replace(/^https?:\/\//, '');
    el.textContent = clean;
    if (el.tagName === 'A') el.href = pi.social.github;
  });
  document.querySelectorAll('[data-info="brandName"]').forEach(el => {
    el.innerHTML = `${pi.firstName} <span class="brand-highlight">${pi.lastName || ''}</span>`;
  });
  document.querySelectorAll('[data-info="footerBrandName"]').forEach(el => {
    el.innerHTML = `${pi.firstName} <span style="color: var(--accent-blue);">${pi.lastName || ''}</span>`;
  });
}

function renderTechStrip() {
  const container = document.getElementById('tech-strip');
  const { personalInfo } = liveData;
  if (!container || !personalInfo.techLogos) return;

  container.innerHTML = personalInfo.techLogos.map(t => `
    <span class="tech-pill">
      <span class="tech-dot" style="background-color: ${t.color};"></span>
      <span>${t.name}</span>
    </span>
  `).join('');
}

function renderHighlights() {
  const container = document.getElementById('highlights-grid');
  if (!container) return;

  const list = liveData.translations[currentLang].highlights;
  container.innerHTML = list.map((text, idx) => `
    <div class="highlight-item">
      <div class="highlight-icon">${highlightIcons[idx % highlightIcons.length]}</div>
      <span>${text}</span>
    </div>
  `).join('');
}

function renderServices() {
  const container = document.getElementById('services-grid');
  if (!container) return;

  container.innerHTML = liveData.services.map((s, idx) => {
    const title = currentLang === 'id' ? s.titleId : s.titleEn;
    const desc = currentLang === 'id' ? s.descId : s.descEn;
    return `
      <div class="service-card reveal" style="transition-delay: ${idx * 60}ms;">
        <div class="service-icon">
          ${serviceIcons[s.icon] || serviceIcons.code}
        </div>
        <h3 class="service-title">${title}</h3>
        <p class="service-desc">${desc}</p>
      </div>
    `;
  }).join('');

  setupRevealObserver();
}

function renderProjects(category = 'all') {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  const filtered = category === 'all'
    ? liveData.projects
    : liveData.projects.filter(p => p.category === category);

  container.innerHTML = filtered.map((p, idx) => {
    const desc = currentLang === 'id' ? p.descId : p.descEn;
    return `
      <article class="project-card reveal" style="transition-delay: ${idx * 60}ms;">
        <div class="project-thumb-box">
          <span class="project-badge-pill">${p.badge}</span>
          <img src="${p.image}" alt="${p.title}" class="project-thumb" loading="lazy" />
        </div>
        <div class="project-body">
          <div>
            <h3 class="project-title">${p.title}</h3>
            <div class="project-tech-line">${p.techSubtitle}</div>
            <p class="project-desc">${desc}</p>
          </div>

          <div class="project-links">
            <a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer" class="project-action-link" title="Source Code">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </a>
            <a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="project-action-link" style="color: var(--accent-blue);" title="Live Demo">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              <span>Live Demo</span>
            </a>
          </div>
        </div>
      </article>
    `;
  }).join('');

  setupRevealObserver();
}

function setupLanguageSwitcher() {
  const buttons = document.querySelectorAll('.lang-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      if (lang && lang !== currentLang) {
        currentLang = lang;
        localStorage.setItem('nativer_lang', lang);
        applyLanguage(lang);
      }
    });
  });
}

function applyLanguage(lang) {
  document.documentElement.lang = lang;

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });

  const dict = liveData.translations[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  renderHighlights();
  renderServices();
  renderProjects(currentCategory);
}

function setupProjectFilters() {
  const filterButtons = document.querySelectorAll('.filter-pill');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category') || 'all';
      renderProjects(currentCategory);
    });
  });
}

function setupHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function setupMobileMenu() {
  const toggle = document.getElementById('mobile-toggle');
  const drawer = document.getElementById('mobile-drawer');
  if (!toggle || !drawer) return;

  toggle.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function setupCvModal() {
  const openBtn = document.getElementById('btn-cv-download');
  const modal = document.getElementById('cv-modal');
  const closeBtn = document.getElementById('cv-close-btn');
  const printBtn = document.getElementById('cv-print-btn');

  if (!openBtn || !modal) return;

  const openModal = () => {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  };

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  };

  openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

function setupCopyEmail() {
  const btn = document.getElementById('copy-email-btn');
  const toast = document.getElementById('toast-notice');

  if (btn) {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(liveData.personalInfo.email);
        if (toast) {
          toast.textContent = liveData.translations[currentLang].toastCopied;
          toast.classList.add('show');
          setTimeout(() => {
            toast.classList.remove('show');
          }, 2500);
        }
      } catch (err) {
        console.error('Failed to copy email:', err);
      }
    });
  }
}

let revealObserver;
function setupRevealObserver() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
  }

  document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    revealObserver.observe(el);
  });
}
