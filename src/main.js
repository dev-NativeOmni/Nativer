import {
  personalInfo as defaultPersonalInfo,
  translations as defaultTranslations,
  experiences as defaultExperiences,
  services as defaultServices,
  projects as defaultProjects
} from './data/projects.js';

const STORAGE_DATA_KEY = 'nativer_cms_data_v1';
const SESSION_KEY = 'nativer_cms_session_v1';

const defaultData = {
  personalInfo: defaultPersonalInfo,
  translations: defaultTranslations,
  experiences: defaultExperiences,
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
let currentLang = localStorage.getItem('nativer_lang') || 'en';
let currentMode = localStorage.getItem('nativer_mode_ed') || 'light';
let latestGithubRepos = null;
let cmsBooted = false;

document.addEventListener('DOMContentLoaded', () => {
  runIntroPreloader();
  setupModeToggle();
  setupLanguageSwitcher();
  setupCvDropdownAndModal();
  setupRouting();
  applyPersonalInfo();
  applyLanguage(currentLang);
  setupCopyEmail();
  setupQuickInquiry();
  setupLazyCms();
  syncPublicGithubRepos();

  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

/* 1. Intro Preloader (N + Native) */
function runIntroPreloader() {
  const preloader = document.getElementById('intro-preloader');
  if (!preloader) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    preloader.remove();
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => preloader.classList.add('animate'));
  });

  setTimeout(() => {
    preloader.classList.add('exit');
  }, 2150);

  setTimeout(() => {
    preloader.remove();
  }, 3000);
}

/* 2. View Transitions Router (#/, #/about, #/projects/<id>) */
function setupRouting() {
  const handleHash = () => {
    const rawHash = window.location.hash || '#/';
    const path = rawHash.replace(/^#/, '') || '/';

    const switchDom = () => {
      const viewWork = document.getElementById('view-work');
      const viewAbout = document.getElementById('view-about');
      const viewCase = document.getElementById('view-case');

      [viewWork, viewAbout, viewCase].forEach(v => {
        if (!v) return;
        v.hidden = true;
        v.classList.remove('active');
      });

      document.querySelectorAll('[data-route]').forEach(link => {
        const r = link.getAttribute('data-route');
        if (link.classList.contains('ed-nav-pill')) {
          link.classList.toggle('active', (r === '/' && (path === '/' || path.startsWith('/projects/'))) || r === path);
        }
      });

      if (path === '/about') {
        if (viewAbout) {
          viewAbout.hidden = false;
          viewAbout.classList.add('active');
        }
      } else if (path.startsWith('/projects/')) {
        const slug = decodeURIComponent(path.replace('/projects/', ''));
        const proj = (liveData.projects || []).find(
          p => p.id === slug || (p.repoName && p.repoName.toLowerCase() === slug.toLowerCase())
        );
        if (proj && viewCase) {
          renderCaseStudyView(proj);
          viewCase.hidden = false;
          viewCase.classList.add('active');
        } else if (viewWork) {
          viewWork.hidden = false;
          viewWork.classList.add('active');
        }
      } else if (viewWork) {
        viewWork.hidden = false;
        viewWork.classList.add('active');
      }

      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(switchDom);
    } else {
      switchDom();
    }
  };

  window.addEventListener('hashchange', handleHash);
  handleHash();
}

/* 3. GitHub Public Repositories Sync */
async function syncPublicGithubRepos() {
  const username = liveData.personalInfo?.githubUsername || 'dev-NativeOmni';
  const cacheKey = `nativer_gh_public_${username}`;
  const cacheTtlMs = 10 * 60 * 1000;

  const applyRepos = (repos) => {
    if (!Array.isArray(repos) || !repos.length) return;
    const activeRepos = repos.filter(r => !r.fork && !r.archived);
    latestGithubRepos = activeRepos;

    const curatedList = liveData.projects || [];
    const merged = activeRepos.map(repo => {
      const lower = repo.name.toLowerCase();
      const match = curatedList.find(p =>
        (p.repoName && p.repoName.toLowerCase() === lower) ||
        (p.githubUrl && p.githubUrl.toLowerCase().endsWith(`/${lower}`))
      );
      const updatedYear = repo.updated_at ? new Date(repo.updated_at).getFullYear() : new Date().getFullYear();

      if (match) {
        return {
          ...match,
          githubUrl: repo.html_url || match.githubUrl,
          liveUrl: (repo.homepage && repo.homepage.trim()) ? repo.homepage : match.liveUrl,
          year: match.year || String(updatedYear),
          stars: repo.stargazers_count || 0
        };
      }

      const lang = repo.language || 'Web';
      return {
        id: repo.name.toLowerCase(),
        repoName: repo.name,
        title: repo.name,
        year: String(updatedYear),
        clientEn: 'Open Source',
        clientId: 'Open Source',
        category: 'web',
        image: './assets/images/project-nativer.svg',
        techSubtitle: `${lang} / GitHub Public Repo`,
        descEn: repo.description || `Public repository ${repo.name} maintained by ${username}.`,
        descId: repo.description || `Repositori publik ${repo.name} oleh ${username} di GitHub.`,
        githubUrl: repo.html_url,
        liveUrl: (repo.homepage && repo.homepage.trim()) ? repo.homepage : repo.html_url,
        badge: 'Public Repo',
        featuresEn: [`Primary language: ${lang}`, 'Publicly available on GitHub'],
        featuresId: [`Bahasa utama: ${lang}`, 'Tersedia publik di GitHub']
      };
    });

    if (merged.length) {
      liveData.projects = merged;
      renderExperienceRows();
      renderProjects();
      renderCvContent();
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

/* 4. Lazy CMS Loader */
async function bootCms(triggerClick = false) {
  if (cmsBooted) return;
  cmsBooted = true;
  const { initCms } = await import('./cms.js');
  initCms({
    defaults: defaultData,
    getLiveData: () => liveData,
    setLiveData: (next) => { liveData = next; },
    onDataChange: () => {
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
  const onFirst = () => {
    trigger.removeEventListener('click', onFirst);
    bootCms(true);
  };
  trigger.addEventListener('click', onFirst);
}

/* 5. Personal Info & Editorial Hero Copy */
function applyPersonalInfo() {
  const pi = liveData.personalInfo;
  const roleLabel = liveData.translations?.[currentLang]?.heroRole || 'Junior Software Engineer';
  document.title = `${pi.name} | ${roleLabel}`;

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
  document.querySelectorAll('[data-info="emailHref"]').forEach(el => {
    if (el.tagName === 'A') el.href = `mailto:${pi.email}`;
  });
  document.querySelectorAll('[data-info="github"]').forEach(el => {
    const clean = pi.social.github.replace(/^https?:\/\//, '');
    el.textContent = clean;
    if (el.tagName === 'A') el.href = pi.social.github;
  });
  document.querySelectorAll('[data-info="githubHref"]').forEach(el => {
    if (el.tagName === 'A') el.href = pi.social.github;
  });
}

function renderHeroHeadline() {
  const el = document.getElementById('ed-hero-headline');
  if (!el) return;
  const name = liveData.personalInfo.name || 'Ghazeef';
  if (currentLang === 'id') {
    el.innerHTML = `Saya ${name}, membangun<br />apa yang Anda klik dan<br />seluruh sistem di baliknya.`;
  } else {
    el.innerHTML = `I'm ${name}, I build what<br />you click<br />and everything behind it.`;
  }
}

function renderExperienceRows() {
  const container = document.getElementById('ed-exp-list');
  if (!container) return;

  const isId = currentLang === 'id';
  const repoCount = Array.isArray(latestGithubRepos)
    ? latestGithubRepos.length
    : (liveData.projects?.length || 4);

  const rows = [
    {
      org: isId ? 'Sistem Sekolah & Web' : 'School & Web Systems',
      role: liveData.translations?.[currentLang]?.heroRole || 'Junior Software Engineer',
      country: 'Indonesia',
      year: '2024–2026'
    },
    {
      org: 'Independent & Open Source',
      role: isId ? 'Pengembang Full-Stack' : 'Full-Stack Builder',
      country: 'Solo (SOC)',
      year: '2023–2026'
    },
    {
      org: `github.com/${liveData.personalInfo.githubUsername || 'dev-NativeOmni'}`,
      role: isId ? 'Repositori Publik' : 'Public Repositories',
      country: '',
      year: `${repoCount} Live`
    }
  ];

  container.innerHTML = rows.map(r => `
    <div class="ed-leader-row">
      <span class="ed-leader-org">${r.org}</span>
      <span>·</span>
      <span class="ed-leader-role">${r.role}</span>
      <span class="ed-leader-dots"></span>
      ${r.country ? `<span class="ed-leader-meta ed-leader-country">${r.country}</span>` : ''}
      <span class="ed-leader-meta">${r.year}</span>
    </div>
  `).join('');
}

/* 6. Bespoke Live Looping Motion Graphics inside 3:2 Cards */
function buildMotionStageHtml(proj) {
  const key = (proj.repoName || proj.id || '').toLowerCase();

  if (key.includes('deathroll')) {
    return `
      <div class="ed-work-stage">
        <div class="motion-window">
          <div class="motion-top-bar">
            <span class="motion-live-pill"><span class="motion-dot-ember"></span> web-audio-synth</span>
            <span>SQLite CMS</span>
          </div>
          <div class="synth-bars" aria-hidden="true">
            <span class="synth-bar"></span><span class="synth-bar"></span><span class="synth-bar"></span>
            <span class="synth-bar"></span><span class="synth-bar"></span><span class="synth-bar"></span>
            <span class="synth-bar"></span><span class="synth-bar"></span><span class="synth-bar"></span>
            <span class="synth-bar"></span><span class="synth-bar"></span><span class="synth-bar"></span>
          </div>
          <div class="motion-footer-row">
            <span>deathrollofficial.web.app</span>
            <span class="motion-Action-chip">▶ Playing</span>
          </div>
        </div>
      </div>
    `;
  }

  if (key.includes('mysch')) {
    return `
      <div class="ed-work-stage">
        <div class="motion-window">
          <div class="motion-top-bar">
            <span class="motion-live-pill"><span class="motion-dot-spark"></span> mysch · jurnal-guru</span>
            <span>3-Tap Flow</span>
          </div>
          <div class="mysch-steps" aria-hidden="true">
            <div class="mysch-step-row">
              <span>01 · Auto-detect class schedule</span>
              <span class="mysch-check">✓ 07:15</span>
            </div>
            <div class="mysch-step-row">
              <span>02 · Client photo compression</span>
              <span class="mysch-check">✓ 68 KB</span>
            </div>
            <div class="mysch-step-row">
              <span>03 · Sync tenant Firestore</span>
              <span class="mysch-check">✓ Saved</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (key.includes('nativer')) {
    return `
      <div class="ed-work-stage bg-drafting-grid">
        <div class="motion-window">
          <div class="motion-top-bar">
            <span class="motion-live-pill"><span class="motion-dot-spark"></span> native.web.id</span>
            <span>Vite 6 · CMS</span>
          </div>
          <div class="builder-lines" aria-hidden="true">
            <div class="builder-bar" style="width: 68%;"></div>
            <div class="builder-bar" style="width: 90%;"></div>
            <div class="builder-grid-2">
              <div class="builder-box">GitHub Sync</div>
              <div class="builder-box">SHA-256 CMS</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="ed-work-stage bg-drafting-grid">
      <div class="motion-window">
        <div class="motion-top-bar">
          <span class="motion-live-pill"><span class="motion-dot-ember"></span> ${proj.repoName || proj.title}</span>
          <span>SSR Pipeline</span>
        </div>
        <div class="pipe-diagram" aria-hidden="true">
          <div class="pipe-node">Request</div>
          <div class="pipe-track"><span class="pipe-packet"></span></div>
          <div class="pipe-node">Blade / Core</div>
          <div class="pipe-track"><span class="pipe-packet"></span></div>
          <div class="pipe-node">View</div>
        </div>
        <div class="motion-footer-row">
          <span>${proj.techSubtitle}</span>
          <span>200 OK</span>
        </div>
      </div>
    </div>
  `;
}

function renderProjects() {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  const isId = currentLang === 'id';
  container.innerHTML = (liveData.projects || []).map(p => {
    const client = isId ? (p.clientId || p.badge) : (p.clientEn || p.badge);
    const year = p.year || '2026';
    const slug = encodeURIComponent(p.repoName || p.id);

    return `
      <a href="#/projects/${slug}" class="ed-work-card">
        ${buildMotionStageHtml(p)}
        <div class="ed-work-caption">
          <h2 class="ed-work-title">${p.title}</h2>
          <span class="ed-work-meta">${client} · ${year}</span>
        </div>
      </a>
    `;
  }).join('');
}

/* 7. Full Case Study View (#/projects/<slug>) */
function renderCaseStudyView(proj) {
  const container = document.getElementById('case-study-container');
  if (!container) return;

  const isId = currentLang === 'id';
  const desc = isId ? proj.descId : proj.descEn;
  const cs = isId ? proj.caseStudyId : proj.caseStudyEn;
  const features = (isId ? proj.featuresId : proj.featuresEn) || [];
  const client = isId ? (proj.clientId || 'Open Source') : (proj.clientEn || 'Open Source');
  const stackParts = (proj.techSubtitle || 'Web / Cloud').split('/').map(s => s.trim());

  const nodeA = stackParts[0] || 'Client UI';
  const nodeB = stackParts[1] || 'Application Core';
  const nodeC = stackParts[2] || stackParts[1] || 'Persistence & Deploy';

  container.innerHTML = `
    <div class="ed-case-top">
      <div>
        <span class="ed-mono-eyebrow">Case study</span>
        <h1 class="ed-case-title">${proj.title}</h1>
      </div>

      <dl class="ed-case-dl">
        <div class="ed-case-dl-row">
          <dt>${isId ? 'Tipe' : 'Scope'}</dt>
          <dd>${client}</dd>
        </div>
        <div class="ed-case-dl-row">
          <dt>${isId ? 'Tahun' : 'Year'}</dt>
          <dd>${proj.year || '2026'}</dd>
        </div>
        <div class="ed-case-dl-row">
          <dt>Stack</dt>
          <dd>${proj.techSubtitle}</dd>
        </div>
        <div class="ed-case-dl-row">
          <dt>Repository</dt>
          <dd>${proj.repoName || proj.id}</dd>
        </div>
        <div class="ed-case-dl-row">
          <dt>Status</dt>
          <dd><span class="motion-live-pill"><span class="motion-dot-spark"></span> Public</span></dd>
        </div>
      </dl>
    </div>

    <figure class="ed-case-figure">
      <div class="ed-diagram-canvas bg-drafting-grid">
        <div class="ed-arch-flow">
          <div class="ed-arch-box">
            <span class="ed-arch-tag">01 · Interface</span>
            <span class="ed-arch-name">${nodeA}</span>
          </div>
          <span class="ed-arch-connector">───▶</span>
          <div class="ed-arch-box">
            <span class="ed-arch-tag">02 · Runtime</span>
            <span class="ed-arch-name">${nodeB}</span>
          </div>
          <span class="ed-arch-connector">───▶</span>
          <div class="ed-arch-box">
            <span class="ed-arch-tag">03 · Storage / Edge</span>
            <span class="ed-arch-name">${nodeC}</span>
          </div>
        </div>
      </div>
      <figcaption class="ed-fig-caption">
        <span>${isId ? 'Alur arsitektur sistem utama' : 'High-level system architecture flow'}</span>
        <span>fig. 01</span>
      </figcaption>
    </figure>

    <div class="ed-case-sections">
      <div class="ed-case-row">
        <h2 class="ed-case-h2">${isId ? 'Ringkasan' : 'Overview'}</h2>
        <div class="ed-case-prose">
          <p>${desc}</p>
          ${features.length ? `<ul class="ed-case-list">${features.map(f => `<li>${f}</li>`).join('')}</ul>` : ''}
        </div>
      </div>

      ${cs ? `
        <div class="ed-case-row">
          <h2 class="ed-case-h2">${isId ? 'Tantangan' : 'Challenge'}</h2>
          <div class="ed-case-prose"><p>${cs.problem}</p></div>
        </div>
        <div class="ed-case-row">
          <h2 class="ed-case-h2">${isId ? 'Arsitektur' : 'Architecture'}</h2>
          <div class="ed-case-prose"><p>${cs.solution}</p></div>
        </div>
        <div class="ed-case-row">
          <h2 class="ed-case-h2">${isId ? 'Hasil & Dampak' : 'Outcome'}</h2>
          <div class="ed-case-prose"><p>${cs.impact}</p></div>
        </div>
      ` : ''}
    </div>

    <div class="ed-case-ctas">
      <a href="#/" class="ed-pill-btn ed-pill-solid">← ${isId ? 'Kembali ke Karya' : 'Back to Work'}</a>
      <a href="${proj.githubUrl}" target="_blank" rel="noopener noreferrer" class="ed-pill-btn ed-pill-outline">
        <span>GitHub Repository</span>
        <span>↗</span>
      </a>
      ${proj.liveUrl && proj.liveUrl !== proj.githubUrl ? `
        <a href="${proj.liveUrl}" target="_blank" rel="noopener noreferrer" class="ed-pill-btn ed-pill-outline">
          <span>Live Demo</span>
          <span>↗</span>
        </a>
      ` : ''}
      <a href="mailto:${liveData.personalInfo.email}?subject=${encodeURIComponent(`Inquiry about ${proj.title}`)}" class="ed-pill-btn ed-pill-outline">
        <span>${isId ? 'Diskusikan proyek serupa' : 'Email me about it'}</span>
        <span>↗</span>
      </a>
    </div>
  `;
}

/* 8. About Page Helpers & CV Modal */
function renderAboutDetails() {
  const extraEl = document.getElementById('ed-about-extra');
  if (extraEl) {
    extraEl.textContent = currentLang === 'id'
      ? 'Dari antarmuka pengguna yang bersih hingga arsitektur database, pengujian otomatis, dan pipeline CI/CD di belakangnya — saya senang membangun perangkat lunak yang cepat, tenang, dan mudah dirawat.'
      : 'From clean interfaces down to database schemas, automated tests, and CI/CD pipelines behind the scenes — I enjoy building software that feels calm, fast, and dependable.';
  }

  const stackContainer = document.getElementById('tech-strip');
  if (stackContainer && liveData.personalInfo.techLogos) {
    stackContainer.innerHTML = liveData.personalInfo.techLogos
      .map(t => `<span class="ed-stack-chip">${t.name}</span>`)
      .join('');
  }

  const highlightsContainer = document.getElementById('highlights-grid');
  if (highlightsContainer) {
    const list = liveData.translations[currentLang].highlights || [];
    highlightsContainer.innerHTML = list.map((text, idx) => `
      <div class="ed-principle-card">
        <span class="ed-principle-num">0${idx + 1}</span>
        <span class="ed-principle-text">${text}</span>
      </div>
    `).join('');
  }
}

function renderCvContent(langOverride = currentLang) {
  const container = document.getElementById('cv-printable');
  if (!container) return;

  const pi = liveData.personalInfo;
  const isId = langOverride === 'id';
  const roleText = liveData.translations?.[langOverride]?.heroRole || 'Junior Software Engineer';
  const stackTitle = isId ? 'Stack Teknis Utama' : 'Core Technical Stack';
  const projTitle = isId ? 'Repositori Publik & Karya Pilihan' : 'Selected Public Repositories';

  const cvTitleEl = document.getElementById('cv-modal-title');
  if (cvTitleEl) {
    cvTitleEl.textContent = isId
      ? `Daftar Riwayat Hidup — ${pi.name}`
      : `Curriculum Vitae — ${pi.name}`;
  }

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
      <p><strong>Frontend &amp; UI:</strong> Tailwind CSS v4, Modern CSS, Alpine.js, Vite 6</p>
      <p><strong>Database &amp; Cloud:</strong> MySQL / MariaDB, SQLite, Firebase Firestore, Cloudflare Pages, GitHub Actions</p>
      <p><strong>${isId ? 'Pengujian &amp; Kualitas' : 'Testing &amp; Quality'}:</strong> PHPUnit (250+ Automated Test Suites), ESLint, CI/CD</p>
    </div>
    <div class="cv-section-block">
      <h4>${projTitle}</h4>
      <ul>${projectItems}</ul>
    </div>
  `;
}

/* 9. Mode, Language, CV Dropdown & Contact Handlers */
function setupModeToggle() {
  const applyMode = (mode) => {
    document.documentElement.setAttribute('data-mode', mode);
  };
  applyMode(currentMode);

  document.getElementById('mode-toggle')?.addEventListener('click', () => {
    currentMode = currentMode === 'light' ? 'dark' : 'light';
    localStorage.setItem('nativer_mode_ed', currentMode);
    applyMode(currentMode);
  });
}

function setupLanguageSwitcher() {
  document.querySelectorAll('.ed-lang-btn').forEach(btn => {
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

  document.querySelectorAll('.ed-lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });

  const dict = liveData.translations[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) el.setAttribute('placeholder', dict[key]);
  });

  renderHeroHeadline();
  renderExperienceRows();
  renderProjects();
  renderAboutDetails();
  renderCvContent(lang);

  // If currently viewing a case study, re-render it in the selected language
  const rawHash = window.location.hash || '#/';
  if (rawHash.startsWith('#/projects/')) {
    const slug = decodeURIComponent(rawHash.replace('#/projects/', ''));
    const proj = (liveData.projects || []).find(
      p => p.id === slug || (p.repoName && p.repoName.toLowerCase() === slug.toLowerCase())
    );
    if (proj) renderCaseStudyView(proj);
  }
}

function setupCvDropdownAndModal() {
  const dropdown = document.getElementById('cv-dropdown');
  const triggerBtn = document.getElementById('cv-dropdown-btn');
  const modal = document.getElementById('cv-modal');
  const closeBtn = document.getElementById('cv-close-btn');
  const printBtn = document.getElementById('cv-print-btn');
  const footerCvBtn = document.getElementById('footer-cv-btn');

  const openCvModal = (lang = currentLang) => {
    renderCvContent(lang);
    modal?.classList.add('open');
    modal?.setAttribute('aria-hidden', 'false');
    dropdown?.classList.remove('open');
    triggerBtn?.setAttribute('aria-expanded', 'false');
  };

  const closeCvModal = () => {
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden', 'true');
  };

  triggerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown?.classList.toggle('open');
    triggerBtn.setAttribute('aria-expanded', String(Boolean(isOpen)));
  });

  document.querySelectorAll('[data-cv-lang]').forEach(item => {
    item.addEventListener('click', () => {
      const cvLang = item.getAttribute('data-cv-lang') || currentLang;
      openCvModal(cvLang);
    });
  });

  footerCvBtn?.addEventListener('click', () => openCvModal(currentLang));
  closeBtn?.addEventListener('click', closeCvModal);
  printBtn?.addEventListener('click', () => window.print());

  document.addEventListener('click', (e) => {
    if (dropdown && !dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
      triggerBtn?.setAttribute('aria-expanded', 'false');
    }
    if (e.target === modal) closeCvModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdown?.classList.remove('open');
      if (modal?.classList.contains('open')) closeCvModal();
    }
  });
}

function showToast(message) {
  const toast = document.getElementById('toast-notice');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function setupCopyEmail() {
  document.getElementById('copy-email-btn')?.addEventListener('click', async () => {
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
    if (form.hasAttribute('hidden')) {
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
      // Fallback to mailto:
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
