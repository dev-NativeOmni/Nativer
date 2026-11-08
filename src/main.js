import { initThreeScene } from './three-scene.js';
import { personalInfo, skills, projects } from './data/projects.js';

// SVG Icons
const icons = {
  github: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,
  external: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`,
  folder: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
  star: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  gitFork: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><circle cx="18" cy="6" r="3"></circle><path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"></path><path d="M12 12v3"></path></svg>`
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Three.js Scene
  initThreeScene();

  // 2. Populate Personal Info
  setupPersonalInfo();

  // 3. Render Projects & Filter Logic
  renderProjects(projects);
  setupProjectFilters();

  // 4. Render Skills
  renderSkills();

  // 5. Generate Visual GitHub Activity Matrix
  generateGitHubMatrix();

  // 6. Interactive Cursor Glow
  setupCursorGlow();

  // 7. Scroll Animation Observers
  setupScrollObservers();

  // 8. Copy Email Action
  setupCopyEmail();

  // 9. Current Year
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

/**
 * Injects personal data into DOM
 */
function setupPersonalInfo() {
  const brandEl = document.getElementById('nav-brand-name');
  if (brandEl) brandEl.textContent = `${personalInfo.name.split(' ')[0]}.dev`;

  const footerName = document.getElementById('footer-name');
  if (footerName) footerName.textContent = personalInfo.name;

  const statusEl = document.getElementById('hero-status');
  if (statusEl) statusEl.textContent = personalInfo.status;

  const bioEl = document.getElementById('hero-bio');
  if (bioEl) bioEl.textContent = personalInfo.bio;

  // GitHub Links
  const ghProfileBtn = document.getElementById('gh-profile-btn');
  if (ghProfileBtn) ghProfileBtn.href = personalInfo.social.github;

  const navGhLink = document.getElementById('nav-gh-link');
  if (navGhLink) navGhLink.href = personalInfo.social.github;

  const contactGhLink = document.getElementById('contact-gh-link');
  if (contactGhLink) contactGhLink.href = personalInfo.social.github;

  // Stats
  const statsContainer = document.getElementById('hero-stats-container');
  if (statsContainer && personalInfo.stats) {
    statsContainer.innerHTML = personalInfo.stats.map(s => `
      <div class="stat-item">
        <span class="stat-value">${s.value}</span>
        <span class="stat-label">${s.label}</span>
      </div>
    `).join('');
  }
}

/**
 * Renders project cards
 */
function renderProjects(items) {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  grid.innerHTML = items.map(p => `
    <article class="project-card fade-up" style="--card-accent: ${p.accentColor || '#38bdf8'};">
      <div>
        <div class="project-header">
          <div class="project-folder-icon">
            ${icons.folder}
          </div>
          <div class="project-links">
            <a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer" class="icon-link" title="Source Code di GitHub" aria-label="GitHub Repository">
              ${icons.github}
            </a>
            <a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="icon-link" title="Live Demo Deployment" aria-label="Live Demo">
              ${icons.external}
            </a>
          </div>
        </div>

        <span class="project-badge">${p.category.toUpperCase()}</span>
        <h3 class="project-title">${p.title}</h3>
        <p class="project-desc">${p.description}</p>
      </div>

      <div>
        <div class="project-tags">
          ${p.tags.map(t => `<span class="tag-pill">${t}</span>`).join('')}
        </div>

        <div class="project-footer">
          <span style="color: ${p.accentColor || '#38bdf8'}; font-weight: 600;">● Active Deploy</span>
          <div class="project-stat-counts">
            <span class="stat-badge" title="Stars">${icons.star} ${p.stats?.stars || 0}</span>
            <span class="stat-badge" title="Forks">${icons.gitFork} ${p.stats?.forks || 0}</span>
          </div>
        </div>
      </div>
    </article>
  `).join('');

  // Re-observe newly rendered cards for fade-in
  observeFadeElements();
}

/**
 * Filter projects by category
 */
function setupProjectFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-category');
      if (category === 'all') {
        renderProjects(projects);
      } else {
        const filtered = projects.filter(p => p.category === category);
        renderProjects(filtered);
      }
    });
  });
}

/**
 * Renders skills & animated bars
 */
function renderSkills() {
  const grid = document.getElementById('skills-grid');
  if (!grid) return;

  grid.innerHTML = skills.map(s => `
    <div class="skill-card fade-up">
      <div class="skill-header">
        <span class="skill-name">${s.name}</span>
        <span class="skill-pct">${s.level}%</span>
      </div>
      <div class="skill-bar-track">
        <div class="skill-bar-fill" data-level="${s.level}"></div>
      </div>
    </div>
  `).join('');
}

/**
 * Generates an aesthetic GitHub commit activity square matrix
 */
function generateGitHubMatrix() {
  const grid = document.getElementById('commits-grid');
  if (!grid) return;

  const totalSquares = 16 * 7; // 16 columns x 7 days
  let html = '';
  
  for (let i = 0; i < totalSquares; i++) {
    const rand = Math.random();
    let levelClass = '';
    if (rand > 0.82) levelClass = 'lvl-4';
    else if (rand > 0.65) levelClass = 'lvl-3';
    else if (rand > 0.45) levelClass = 'lvl-2';
    else if (rand > 0.25) levelClass = 'lvl-1';

    html += `<div class="gh-square ${levelClass}"></div>`;
  }

  grid.innerHTML = html;
}

/**
 * Smooth cursor glow follower
 */
function setupCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let glowX = mouseX;
  let glowY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  const renderCursor = () => {
    glowX += (mouseX - glowX) * 0.15;
    glowY += (mouseY - glowY) * 0.15;
    glow.style.left = `${glowX}px`;
    glow.style.top = `${glowY}px`;
    requestAnimationFrame(renderCursor);
  };

  renderCursor();
}

/**
 * Scroll reveal animations
 */
function setupScrollObservers() {
  observeFadeElements();

  // Skill bars fill trigger
  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fillBars = entry.target.querySelectorAll('.skill-bar-fill');
        fillBars.forEach(bar => {
          const target = bar.getAttribute('data-level');
          bar.style.width = `${target}%`;
        });
      }
    });
  }, { threshold: 0.2 });

  const skillsSection = document.getElementById('tentang');
  if (skillsSection) skillsObserver.observe(skillsSection);
}

function observeFadeElements() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

/**
 * Copy Email button functionality
 */
function setupCopyEmail() {
  const copyBtn = document.getElementById('copy-email-btn');
  const toast = document.getElementById('toast-notice');

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(personalInfo.social.email);
        if (toast) {
          toast.classList.add('show');
          setTimeout(() => {
            toast.classList.remove('show');
          }, 2500);
        }
      } catch (err) {
        console.error('Gagal menyalin:', err);
      }
    });
  }
}
