import { initThreeScene } from './three-scene.js';
import { personalInfo, services, projects } from './data/projects.js';

// SVG Icons for services
const serviceIcons = {
  code: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
  mobile: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg>`,
  rocket: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>`,
  shield: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>`
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Three.js Ambient Stardust
  initThreeScene();

  // 2. Render Hero Tech Strip
  renderTechStrip();

  // 3. Render Services (4 Cards)
  renderServices();

  // 4. Render Featured Projects (Matching reference 3-column cards)
  renderProjects();

  // 5. Header Scroll Effect
  setupHeaderScroll();

  // 6. Copy Email Action
  setupCopyEmail();

  // 7. Dynamic Footer Year
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

/**
 * Renders Core Tech Strip in Hero Section
 */
function renderTechStrip() {
  const container = document.getElementById('tech-strip');
  if (!container || !personalInfo.techLogos) return;

  container.innerHTML = personalInfo.techLogos.map(t => `
    <span class="tech-pill">
      <span class="tech-dot" style="background-color: ${t.color};"></span>
      <span>${t.name}</span>
    </span>
  `).join('');
}

/**
 * Renders Services Section (What I Can Do For You)
 */
function renderServices() {
  const container = document.getElementById('services-grid');
  if (!container) return;

  container.innerHTML = services.map(s => `
    <div class="service-card">
      <div class="service-icon">
        ${serviceIcons[s.icon] || serviceIcons.code}
      </div>
      <h3 class="service-title">${s.title}</h3>
      <p class="service-desc">${s.description}</p>
    </div>
  `).join('');
}

/**
 * Renders Featured Projects Cards Grid
 */
function renderProjects() {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  container.innerHTML = projects.map(p => `
    <article class="project-card">
      <div class="project-thumb-box">
        <img src="${p.image}" alt="${p.title}" class="project-thumb" loading="lazy" />
      </div>
      <div class="project-body">
        <div>
          <h3 class="project-title">${p.title}</h3>
          <div class="project-tech-line">${p.techSubtitle}</div>
          <p class="project-desc">${p.description}</p>
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
  `).join('');
}

/**
 * Header background blur on scroll
 */
function setupHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}

/**
 * Copy email button action
 */
function setupCopyEmail() {
  const btn = document.getElementById('copy-email-btn');
  const toast = document.getElementById('toast-notice');

  if (btn) {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(personalInfo.email);
        if (toast) {
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
