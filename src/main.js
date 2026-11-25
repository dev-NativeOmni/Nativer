import { initThreeScene } from './three-scene.js';
import {
  personalInfo as defaultPersonalInfo,
  translations as defaultTranslations,
  services as defaultServices,
  projects as defaultProjects
} from './data/projects.js';

const STORAGE_DATA_KEY = 'nativer_cms_data_v1';
const SESSION_KEY = 'nativer_cms_session_v1';

const defaultData = {
  personalInfo: defaultPersonalInfo,
  translations: defaultTranslations,
  services: defaultServices,
  projects: defaultProjects
};

function loadMergedData(defaults) {
  const merged = JSON.parse(JSON.stringify(defaults));
  try {
    const raw = localStorage.getItem(STORAGE_DATA_KEY);
    if (!raw) return merged;
    const saved = JSON.parse(raw);

    if (saved.personalInfo) {
      merged.personalInfo = {
        ...merged.personalInfo,
        ...saved.personalInfo,
        social: {
          ...merged.personalInfo.social,
          ...(saved.personalInfo.social || {})
        }
      };
    }
    if (saved.translations) {
      if (saved.translations.en) {
        merged.translations.en = { ...merged.translations.en, ...saved.translations.en };
      }
      if (saved.translations.id) {
        merged.translations.id = { ...merged.translations.id, ...saved.translations.id };
      }
    }
    if (Array.isArray(saved.services)) merged.services = saved.services;
    if (Array.isArray(saved.projects)) merged.projects = saved.projects;
  } catch (err) {
    console.warn('Failed to parse local overrides, using defaults.', err);
  }
  return merged;
}

let liveData = loadMergedData(defaultData);

const highlightIcons = [
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"></path></svg>`,
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path></svg>`,
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>`,
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>`
];

let currentLang = localStorage.getItem('nativer_lang') || 'en';
let currentMode = localStorage.getItem('nativer_mode') || 'dark';
let cmsBooted = false;

document.addEventListener('DOMContentLoaded', () => {
  runIntroPreloader();
  initThreeScene();
  setupModeToggle();
  renderTechStrip();
  setupLanguageSwitcher();
  applyPersonalInfo();
  applyLanguage(currentLang);
  setupHeaderScroll();
  setupScrollEnhancements();
  setupScrollSpy();
  setupMobileMenu();
  setupCvModal();
  setupProjectModal();
  setupCopyEmail();
  setupQuickInquiry();
  setupRevealObserver();
  setupLazyCms();
  renderGithubStats();
  syncPublicGithubRepos();

  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

function runIntroPreloader() {
  const preloader = document.getElementById('intro-preloader');
  const wordmark = document.getElementById('intro-wordmark');
  if (!preloader) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const alreadySeen = sessionStorage.getItem('nativer_intro_seen') === '1';

  if (prefersReduced || alreadySeen) {
    preloader.remove();
    document.body.classList.add('hero-ready');
    return;
  }

  sessionStorage.setItem('nativer_intro_seen', '1');
  const label = (liveData.personalInfo?.name || 'NATIVE OMNI').toUpperCase();
  if (wordmark) {
    wordmark.innerHTML = Array.from(label).map((ch, idx) => (
      ch === ' '
        ? '<span class="intro-char-space"></span>'
        : `<span class="intro-char" style="--ci:${idx}">${ch}</span>`
    )).join('');
  }

  requestAnimationFrame(() => preloader.classList.add('animate'));

  setTimeout(() => {
    preloader.classList.add('exit');
    document.body.classList.add('hero-ready');
  }, 1150);

  setTimeout(() => {
    preloader.remove();
  }, 1750);
}

async function syncPublicGithubRepos() {
  const username = liveData.personalInfo?.githubUsername || 'dev-NativeOmni';
  const cacheKey = `nativer_gh_public_${username}`;
  const cacheTtlMs = 10 * 60 * 1000;

  const applyRepos = (repos) => {
    if (!Array.isArray(repos) || !repos.length) return;
    const curatedList = liveData.projects || [];
    const merged = repos
      .filter(r => !r.fork && !r.archived)
      .map(repo => {
        const lower = repo.name.toLowerCase();
        const match = curatedList.find(p =>
          (p.repoName && p.repoName.toLowerCase() === lower) ||
          (p.githubUrl && p.githubUrl.toLowerCase().endsWith(`/${lower}`))
        );
        if (match) {
          return {
            ...match,
            githubUrl: repo.html_url || match.githubUrl,
            liveUrl: (repo.homepage && repo.homepage.trim()) ? repo.homepage : match.liveUrl,
            badge: repo.stargazers_count > 0 ? `${match.badge} • ★ ${repo.stargazers_count}` : match.badge
          };
        }

        const lang = repo.language || 'Web';
        return {
          id: `gh-${repo.id}`,
          repoName: repo.name,
          title: repo.name,
          category: 'web',
          image: './assets/images/project-nativer.svg',
          techSubtitle: `${lang} / GitHub Public Repo`,
          descEn: repo.description || `Public repository ${repo.name} maintained by ${username}.`,
          descId: repo.description || `Repositori publik ${repo.name} oleh ${username} di GitHub.`,
          githubUrl: repo.html_url,
          liveUrl: (repo.homepage && repo.homepage.trim()) ? repo.homepage : repo.html_url,
          badge: repo.stargazers_count > 0 ? `Public • ★ ${repo.stargazers_count}` : 'Public Repo',
          featuresEn: [`Primary language: ${lang}`, 'Publicly available on GitHub'],
          featuresId: [`Bahasa utama: ${lang}`, 'Tersedia publik di GitHub']
        };
      });

    if (merged.length) {
      liveData.projects = merged;
      renderProjects();
      renderCvContent();
      renderGithubStats(repos.filter(r => !r.fork && !r.archived));
    }
  };

  try {
    const cachedRaw = sessionStorage.getItem(cacheKey);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (Date.now() - cached.ts < cacheTtlMs) {
        applyRepos(cached.repos);
        return;
      }
    }

    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?type=public&sort=updated&per_page=30`,
      { headers: { Accept: 'application/vnd.github+json' } }
    );
    if (!res.ok) return;
    const repos = await res.json();
    if (Array.isArray(repos)) {
      sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), repos }));
      applyRepos(repos);
    }
  } catch (err) {
    console.warn('GitHub public repo sync skipped:', err);
  }
}

async function bootCms(triggerClick = false) {
  if (cmsBooted) return;
  cmsBooted = true;
  const { initCms } = await import('./cms.js');
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
  if (triggerClick) {
    document.getElementById('cms-trigger')?.click();
  }
}

function setupLazyCms() {
  if (sessionStorage.getItem(SESSION_KEY) === '1') {
    bootCms(false);
    return;
  }

  const trigger = document.getElementById('cms-trigger');
  if (!trigger) return;

  const onFirstTriggerClick = () => {
    trigger.removeEventListener('click', onFirstTriggerClick);
    bootCms(true);
  };
  trigger.addEventListener('click', onFirstTriggerClick);
}

function applyPersonalInfo() {
  const pi = liveData.personalInfo;
  const roleLabel = liveData.translations?.[currentLang]?.heroRole || 'Full Stack Developer';
  document.title = `${pi.name} | ${roleLabel}`;

  document.querySelectorAll('[data-info="name"]').forEach(el => {
    el.textContent = pi.name;
  });
  document.querySelectorAll('.avatar-img').forEach(el => {
    el.alt = `${pi.name} - ${roleLabel}`;
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
  document.querySelectorAll('[data-info="emailHref"]').forEach(el => {
    if (el.tagName === 'A') el.href = `mailto:${pi.email}`;
  });
  document.querySelectorAll('[data-info="github"]').forEach(el => {
    const clean = pi.social.github.replace(/^https?:\/\//, '');
    el.textContent = clean;
    if (el.tagName === 'A') el.href = pi.social.github;
  });
  document.querySelectorAll('[data-info="brandName"]').forEach(el => {
    el.innerHTML = pi.lastName
      ? `${pi.firstName} <span class="brand-highlight">${pi.lastName}</span>`
      : pi.firstName;
  });
  document.querySelectorAll('[data-info="footerBrandName"]').forEach(el => {
    el.innerHTML = pi.lastName
      ? `${pi.firstName} <span style="color: var(--accent-blue);">${pi.lastName}</span>`
      : pi.firstName;
  });
}

function renderTechStrip() {
  const container = document.getElementById('tech-strip');
  const { personalInfo } = liveData;
  if (!container || !personalInfo.techLogos) return;

  const pillsHtml = personalInfo.techLogos.map(t => `
    <span class="tech-pill">
      <span class="tech-dot" style="background-color: ${t.color};"></span>
      <span>${t.name}</span>
    </span>
  `).join('');

  container.classList.add('strip-marquee-viewport');
  container.innerHTML = `
    <div class="strip-marquee-track">
      ${pillsHtml}
      ${pillsHtml}
    </div>
  `;
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

let latestGithubRepos = null;

function renderGithubStats(repos = latestGithubRepos) {
  const container = document.getElementById('gh-live-stats');
  if (!container) return;

  if (Array.isArray(repos)) latestGithubRepos = repos;
  const isId = currentLang === 'id';
  const repoCount = Array.isArray(latestGithubRepos)
    ? latestGithubRepos.length
    : (liveData.projects?.length || 0);
  const starCount = Array.isArray(latestGithubRepos)
    ? latestGithubRepos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0)
    : 1;

  let updatedText = isId ? 'Aktif' : 'Active';
  if (Array.isArray(latestGithubRepos) && latestGithubRepos.length) {
    const latestTs = latestGithubRepos
      .map(r => Date.parse(r.updated_at || ''))
      .filter(n => !Number.isNaN(n))
      .sort((a, b) => b - a)[0];
    if (latestTs) {
      updatedText = new Date(latestTs).toLocaleDateString(isId ? 'id-ID' : 'en-US', {
        month: 'short',
        year: 'numeric'
      });
    }
  }

  container.innerHTML = `
    <div class="gh-stat-cell">
      <span class="gh-stat-value">${repoCount}</span>
      <span class="gh-stat-label">${isId ? 'Repo Publik' : 'Public Repos'}</span>
    </div>
    <div class="gh-stat-cell">
      <span class="gh-stat-value">${starCount}</span>
      <span class="gh-stat-label">${isId ? 'Total Bintang' : 'GitHub Stars'}</span>
    </div>
    <div class="gh-stat-cell">
      <span class="gh-stat-value">${updatedText}</span>
      <span class="gh-stat-label">${isId ? 'Update Terakhir' : 'Last Active'}</span>
    </div>
  `;
}

function getLangDotColor(techSubtitle = '') {
  const s = techSubtitle.toLowerCase();
  if (s.includes('typescript')) return '#3178C6';
  if (s.includes('laravel') || s.includes('blade')) return '#FF2D20';
  if (s.includes('three.js') || s.includes('webgl')) return '#38BDF8';
  if (s.includes('javascript')) return '#F7DF1E';
  if (s.includes('php')) return '#777BB4';
  return '#10B981';
}

function renderProjects() {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  const detailsLabel = liveData.translations[currentLang].projectDetailsBtn || 'Details';

  container.innerHTML = liveData.projects.map((p, idx) => {
    const desc = currentLang === 'id' ? p.descId : p.descEn;
    const dotColor = getLangDotColor(p.techSubtitle);
    return `
      <article class="project-card reveal" style="transition-delay: ${idx * 60}ms;" data-project-id="${p.id}">
        <div class="project-thumb-box project-open-trigger" role="button" tabindex="0" aria-label="View details for ${p.title}">
          <span class="project-badge-pill">${p.badge}</span>
          <img src="${p.image}" alt="${p.title}" class="project-thumb" loading="lazy" />
        </div>
        <div class="project-body">
          <div>
            <h3 class="project-title project-open-trigger" role="button" tabindex="0">${p.title}</h3>
            <div class="project-tech-line">
              <span class="lang-dot" style="background-color: ${dotColor};" aria-hidden="true"></span>
              <span>${p.techSubtitle}</span>
            </div>
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
            <button type="button" class="project-action-link project-details-btn project-open-trigger">
              <span>${detailsLabel}</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  container.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
  });

  container.querySelectorAll('.project-open-trigger').forEach(el => {
    const open = () => {
      const card = el.closest('.project-card');
      const id = card?.getAttribute('data-project-id');
      const proj = liveData.projects.find(item => item.id === id);
      if (proj) openProjectModal(proj);
    };
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });

  setupRevealObserver();
}

function renderCvContent() {
  const container = document.getElementById('cv-printable');
  if (!container) return;

  const pi = liveData.personalInfo;
  const isId = currentLang === 'id';
  const roleText = isId
    ? 'Full Stack Software Engineer &amp; Arsitek Sistem Web'
    : 'Full Stack Software Engineer &amp; Web Systems Architect';
  const stackTitle = isId ? 'Stack Teknis Utama' : 'Core Technical Stack';
  const projTitle = isId ? 'Proyek Publik &amp; Sistem Produksi' : 'Public Repositories &amp; Production Systems';

  const projectItems = (liveData.projects || []).map(p => {
    const desc = isId ? p.descId : p.descEn;
    return `<li><strong>${p.title} (${p.repoName || p.id}):</strong> ${desc}</li>`;
  }).join('');

  container.innerHTML = `
    <div class="cv-head-block">
      <div>
        <h2>${pi.name}</h2>
        <p class="cv-role-text">${roleText}</p>
      </div>
      <div class="cv-contact-meta">
        <span>${pi.location}</span>
        <span>${pi.email}</span>
        <span>${pi.social.github.replace(/^https?:\/\//, '')} • native.web.id</span>
      </div>
    </div>
    <hr class="cv-divider" />
    <div class="cv-section-block">
      <h4>${stackTitle}</h4>
      <p><strong>Backend &amp; Frameworks:</strong> Laravel 12 (PHP 8.2+), Next.js 16, React 19, TypeScript, Node.js</p>
      <p><strong>Frontend &amp; Graphics:</strong> Tailwind CSS v4, Modern CSS, Three.js (WebGL), Alpine.js, Vite 6</p>
      <p><strong>Database &amp; Cloud:</strong> MySQL / MariaDB, SQLite, Firebase (Firestore &amp; Hosting), Cloudflare Pages, GitHub Actions</p>
      <p><strong>${isId ? 'Pengujian &amp; Kualitas' : 'Testing &amp; Quality'}:</strong> PHPUnit (250+ Automated Test Suites), ESLint, CI/CD Pipelines</p>
    </div>
    <div class="cv-section-block">
      <h4>${projTitle}</h4>
      <ul>${projectItems}</ul>
    </div>
  `;
}

function setupModeToggle() {
  const applyMode = (mode) => {
    document.documentElement.setAttribute('data-mode', mode);
  };
  applyMode(currentMode);

  const btn = document.getElementById('mode-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    currentMode = currentMode === 'light' ? 'dark' : 'light';
    localStorage.setItem('nativer_mode', currentMode);
    applyMode(currentMode);
  });
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

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.setAttribute('placeholder', dict[key]);
    }
  });

  const cvTitleEl = document.getElementById('cv-modal-title');
  if (cvTitleEl) {
    cvTitleEl.textContent = lang === 'id'
      ? `Daftar Riwayat Hidup — ${liveData.personalInfo.name}`
      : `Curriculum Vitae — ${liveData.personalInfo.name}`;
  }

  renderHighlights();
  renderProjects();
  renderCvContent();
  renderGithubStats();
  setupWordReveal();
}

let wordRevealObserver;
function setupWordReveal() {
  const targets = document.querySelectorAll('.section-title, .cta-title, .hero-subtitle');
  if (!targets.length) return;

  if (!wordRevealObserver) {
    wordRevealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('words-visible');
          wordRevealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
  }

  targets.forEach(el => {
    const text = (el.textContent || '').trim();
    if (!text) return;
    el.classList.remove('words-visible');
    el.classList.add('word-reveal-heading');
    const words = text.split(/\s+/);
    el.innerHTML = words
      .map((w, i) => `<span class="word-token" style="--wi:${i}">${w}</span>`)
      .join(' ');
    wordRevealObserver.observe(el);
  });
}

function setupScrollEnhancements() {
  const progressBar = document.getElementById('scroll-progress');
  const backTopBtn = document.getElementById('back-to-top');

  const onScroll = () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100)) : 0;
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (backTopBtn) backTopBtn.classList.toggle('visible', window.scrollY > 420);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

function setupScrollSpy() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          link.classList.toggle('active', href === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

  sections.forEach(sec => observer.observe(sec));
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
    renderCvContent();
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

let openProjectModal = () => {};

function setupProjectModal() {
  const modal = document.getElementById('project-modal');
  const closeBtn = document.getElementById('project-modal-close');
  if (!modal) return;

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  };

  openProjectModal = (proj) => {
    const titleEl = document.getElementById('project-modal-title');
    const badgeEl = document.getElementById('project-modal-badge');
    const imgEl = document.getElementById('project-modal-img');
    const descEl = document.getElementById('project-modal-desc');
    const caseEl = document.getElementById('project-modal-case');
    const techEl = document.getElementById('project-modal-tech');
    const featEl = document.getElementById('project-modal-features');
    const ghEl = document.getElementById('project-modal-github');
    const liveEl = document.getElementById('project-modal-live');

    if (titleEl) titleEl.textContent = proj.title;
    if (badgeEl) badgeEl.textContent = proj.badge;
    if (imgEl) {
      imgEl.src = proj.image;
      imgEl.alt = proj.title;
    }
    if (descEl) descEl.textContent = currentLang === 'id' ? proj.descId : proj.descEn;
    if (caseEl) {
      const cs = currentLang === 'id' ? proj.caseStudyId : proj.caseStudyEn;
      const dict = liveData.translations[currentLang];
      if (cs) {
        caseEl.innerHTML = `
          <div class="project-case-item">
            <span class="project-case-label">${dict.caseProblemLabel || 'Challenge'}</span>
            <p>${cs.problem}</p>
          </div>
          <div class="project-case-item">
            <span class="project-case-label">${dict.caseSolutionLabel || 'Architecture'}</span>
            <p>${cs.solution}</p>
          </div>
          <div class="project-case-item">
            <span class="project-case-label">${dict.caseImpactLabel || 'Impact'}</span>
            <p>${cs.impact}</p>
          </div>
        `;
      } else {
        caseEl.innerHTML = '';
      }
    }
    if (techEl) techEl.textContent = proj.techSubtitle;
    if (ghEl) ghEl.href = proj.githubUrl;
    if (liveEl) liveEl.href = proj.liveUrl;

    if (featEl) {
      const features = (currentLang === 'id' ? proj.featuresId : proj.featuresEn) || [
        proj.techSubtitle,
        proj.badge
      ];
      featEl.innerHTML = features.map(item => `<li>${item}</li>`).join('');
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  };

  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

function showToast(message) {
  const toast = document.getElementById('toast-notice');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

function setupCopyEmail() {
  const btn = document.getElementById('copy-email-btn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(liveData.personalInfo.email);
      showToast(liveData.translations[currentLang].toastCopied);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  });
}

function setupQuickInquiry() {
  const toggleBtn = document.getElementById('toggle-inquiry-btn');
  const form = document.getElementById('quick-inquiry-form');
  const nameInput = document.getElementById('inquiry-name');
  const emailInput = document.getElementById('inquiry-email');
  const msgInput = document.getElementById('inquiry-message');
  const copyBtn = document.getElementById('copy-inquiry-btn');
  if (!toggleBtn || !form) return;

  toggleBtn.addEventListener('click', () => {
    const isHidden = form.hasAttribute('hidden');
    if (isHidden) {
      form.removeAttribute('hidden');
      nameInput?.focus();
    } else {
      form.setAttribute('hidden', '');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const sender = (nameInput?.value || '').trim();
    const replyEmail = (emailInput?.value || '').trim();
    const msg = (msgInput?.value || '').trim();
    if (!sender || !msg) return;

    const dict = liveData.translations[currentLang];
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = dict.inquirySending || 'Sending...';
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: sender, email: replyEmail, message: msg })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          showToast(dict.inquirySentSuccess || 'Message delivered!');
          form.reset();
          form.setAttribute('hidden', '');
          return;
        }
      }
    } catch {
      // Static hosting without /api/contact falls back to mailto: below
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel || dict.inquirySendBtn;
      }
    }

    showToast(dict.inquiryFallbackMailto || 'Opening email app...');
    const subject = encodeURIComponent(`Project Inquiry from ${sender}`);
    const body = encodeURIComponent(
      `Hi ${liveData.personalInfo.name},\n\nName/Org: ${sender}${replyEmail ? `\nReply-To: ${replyEmail}` : ''}\n\n${msg}`
    );
    window.location.href = `mailto:${liveData.personalInfo.email}?subject=${subject}&body=${body}`;
  });

  copyBtn?.addEventListener('click', async () => {
    const sender = (nameInput?.value || '').trim();
    const replyEmail = (emailInput?.value || '').trim();
    const msg = (msgInput?.value || '').trim();
    if (!sender && !msg) return;
    try {
      await navigator.clipboard.writeText(
        `From: ${sender}${replyEmail ? ` (${replyEmail})` : ''}\n\n${msg}`
      );
      showToast(liveData.translations[currentLang].inquiryCopiedToast);
    } catch (err) {
      console.error('Failed to copy inquiry:', err);
    }
  });
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
