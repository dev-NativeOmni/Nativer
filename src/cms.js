/**
 * In-Browser Live Content Editor (CMS) for Native Omni Portfolio
 * - Triggered by clicking "FULL STACK DEVELOPER" in the footer (#cms-trigger)
 * - Protected by SHA-256 hashed credentials (Web Crypto API)
 * - Supports instant local persistence (localStorage), projects.js export,
 *   and direct GitHub Contents API publish to dev-NativeOmni/Nativer (main).
 */

const DEFAULT_AUTH_HASH = '87f22caa37b311c571c47b305c711497e6b24f959e82b615319a1fa822bdd145';
const STORAGE_DATA_KEY = 'nativer_cms_data_v1';
const STORAGE_AUTH_KEY = 'nativer_cms_auth_hash_v1';
const STORAGE_GH_TOKEN_KEY = 'nativer_cms_gh_pat_v1';
const SESSION_KEY = 'nativer_cms_session_v1';

const GITHUB_OWNER = 'dev-NativeOmni';
const GITHUB_REPO = 'Nativer';
const GITHUB_BRANCH = 'main';
const GITHUB_DATA_PATH = 'src/data/projects.js';

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function loadMergedData(defaults) {
  const merged = deepClone(defaults);
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
    if (Array.isArray(saved.services)) {
      merged.services = saved.services;
    }
    if (Array.isArray(saved.projects)) {
      merged.projects = saved.projects;
    }
  } catch (err) {
    console.warn('CMS: Failed to parse local overrides, using defaults.', err);
  }
  return merged;
}

function generateProjectsJsSource(data) {
  return `/**
 * DATA PORTOFOLIO RESMI NATIVE OMNI
 * Mendukung Bahasa Inggris (EN) & Bahasa Indonesia (ID)
 */

export const personalInfo = ${JSON.stringify(data.personalInfo, null, 2)};

export const translations = ${JSON.stringify(data.translations, null, 2)};

export const services = ${JSON.stringify(data.services, null, 2)};

export const projects = ${JSON.stringify(data.projects, null, 2)};
`;
}

export function initCms({ defaults, getLiveData, setLiveData, onDataChange }) {
  const trigger = document.getElementById('cms-trigger');
  if (!trigger) return;

  injectCmsUi();

  const loginBackdrop = document.getElementById('cms-login-modal');
  const loginForm = document.getElementById('cms-login-form');
  const loginUser = document.getElementById('cms-username');
  const loginPass = document.getElementById('cms-password');
  const loginError = document.getElementById('cms-login-error');
  const loginClose = document.getElementById('cms-login-close');

  const editorBackdrop = document.getElementById('cms-editor-modal');
  const editorClose = document.getElementById('cms-editor-close');
  const editorBody = document.getElementById('cms-editor-body');
  const editorSaveBtn = document.getElementById('cms-save-local');
  const editorStatus = document.getElementById('cms-editor-status');
  const floatingBar = document.getElementById('cms-floating-bar');
  const floatingOpenBtn = document.getElementById('cms-floating-open');
  const floatingLogoutBtn = document.getElementById('cms-floating-logout');

  let activeTab = 'hero';
  let draftData = deepClone(getLiveData());

  const isAuthenticated = () => sessionStorage.getItem(SESSION_KEY) === '1';

  const showStatus = (msg, isError = false) => {
    if (!editorStatus) return;
    editorStatus.textContent = msg;
    editorStatus.style.color = isError ? '#f87171' : '#34d399';
  };

  const updateFloatingBar = () => {
    if (!floatingBar) return;
    floatingBar.classList.toggle('visible', isAuthenticated());
  };

  const openLoginModal = () => {
    if (!loginBackdrop) return;
    if (loginError) loginError.textContent = '';
    if (loginPass) loginPass.value = '';
    loginBackdrop.classList.add('open');
    loginBackdrop.setAttribute('aria-hidden', 'false');
    setTimeout(() => loginUser?.focus(), 60);
  };

  const closeLoginModal = () => {
    if (!loginBackdrop) return;
    loginBackdrop.classList.remove('open');
    loginBackdrop.setAttribute('aria-hidden', 'true');
  };

  const openEditorModal = () => {
    if (!editorBackdrop) return;
    draftData = deepClone(getLiveData());
    renderEditorTab();
    showStatus('');
    editorBackdrop.classList.add('open');
    editorBackdrop.setAttribute('aria-hidden', 'false');
  };

  const closeEditorModal = () => {
    if (!editorBackdrop) return;
    editorBackdrop.classList.remove('open');
    editorBackdrop.setAttribute('aria-hidden', 'true');
  };

  trigger.addEventListener('click', () => {
    if (isAuthenticated()) {
      openEditorModal();
    } else {
      openLoginModal();
    }
  });

  loginClose?.addEventListener('click', closeLoginModal);
  loginBackdrop?.addEventListener('click', (e) => {
    if (e.target === loginBackdrop) closeLoginModal();
  });

  editorClose?.addEventListener('click', closeEditorModal);
  editorBackdrop?.addEventListener('click', (e) => {
    if (e.target === editorBackdrop) closeEditorModal();
  });

  floatingOpenBtn?.addEventListener('click', openEditorModal);
  floatingLogoutBtn?.addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    updateFloatingBar();
    closeEditorModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (loginBackdrop?.classList.contains('open')) closeLoginModal();
      if (editorBackdrop?.classList.contains('open')) closeEditorModal();
    }
  });

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = (loginUser?.value || '').trim();
    const pass = loginPass?.value || '';
    if (!user || !pass) {
      if (loginError) loginError.textContent = 'Username dan password wajib diisi.';
      return;
    }

    const inputHash = await sha256Hex(`${user}:${pass}`);
    const expectedHash = localStorage.getItem(STORAGE_AUTH_KEY) || DEFAULT_AUTH_HASH;

    if (inputHash === expectedHash) {
      sessionStorage.setItem(SESSION_KEY, '1');
      closeLoginModal();
      updateFloatingBar();
      openEditorModal();
    } else {
      if (loginError) loginError.textContent = 'Kredensial tidak valid. Silakan coba lagi.';
    }
  });

  // Tab switching
  document.querySelectorAll('.cms-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      collectCurrentTabInputs();
      activeTab = btn.getAttribute('data-cms-tab') || 'hero';
      document.querySelectorAll('.cms-tab-btn').forEach(b => {
        b.classList.toggle('active', b === btn);
      });
      renderEditorTab();
    });
  });

  editorSaveBtn?.addEventListener('click', () => {
    collectCurrentTabInputs();
    localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(draftData));
    setLiveData(deepClone(draftData));
    onDataChange();
    showStatus('Perubahan disimpan & diterapkan langsung di browser!');
  });

  function collectCurrentTabInputs() {
    if (!editorBody) return;

    if (activeTab === 'hero') {
      const val = (id) => editorBody.querySelector(`#${id}`)?.value ?? '';
      draftData.personalInfo.name = val('cms-pi-name').trim() || draftData.personalInfo.name;
      const parts = draftData.personalInfo.name.split(' ');
      draftData.personalInfo.firstName = parts[0] || draftData.personalInfo.name;
      draftData.personalInfo.lastName = parts.slice(1).join(' ');
      draftData.personalInfo.brandTitle = val('cms-pi-brand').trim();
      draftData.personalInfo.location = val('cms-pi-location').trim();
      draftData.personalInfo.email = val('cms-pi-email').trim();
      draftData.personalInfo.social.email = `mailto:${draftData.personalInfo.email}`;
      draftData.personalInfo.social.github = val('cms-pi-github').trim();

      draftData.translations.en.heroHello = val('cms-en-heroHello');
      draftData.translations.en.heroRole = val('cms-en-heroRole');
      draftData.translations.en.heroDesc = val('cms-en-heroDesc');
      draftData.translations.id.heroHello = val('cms-id-heroHello');
      draftData.translations.id.heroRole = val('cms-id-heroRole');
      draftData.translations.id.heroDesc = val('cms-id-heroDesc');

      draftData.translations.en.ctaTitle = val('cms-en-ctaTitle');
      draftData.translations.en.ctaSubtitle = val('cms-en-ctaSubtitle');
      draftData.translations.id.ctaTitle = val('cms-id-ctaTitle');
      draftData.translations.id.ctaSubtitle = val('cms-id-ctaSubtitle');
    } else if (activeTab === 'about') {
      const val = (id) => editorBody.querySelector(`#${id}`)?.value ?? '';
      draftData.translations.en.aboutTitle = val('cms-en-aboutTitle');
      draftData.translations.en.aboutBio = val('cms-en-aboutBio');
      draftData.translations.id.aboutTitle = val('cms-id-aboutTitle');
      draftData.translations.id.aboutBio = val('cms-id-aboutBio');

      draftData.translations.en.highlights = val('cms-en-highlights')
        .split('\n').map(s => s.trim()).filter(Boolean);
      draftData.translations.id.highlights = val('cms-id-highlights')
        .split('\n').map(s => s.trim()).filter(Boolean);

      draftData.services.forEach((srv, idx) => {
        srv.titleEn = val(`cms-srv-titleEn-${idx}`);
        srv.descEn = val(`cms-srv-descEn-${idx}`);
        srv.titleId = val(`cms-srv-titleId-${idx}`);
        srv.descId = val(`cms-srv-descId-${idx}`);
      });
    } else if (activeTab === 'projects') {
      draftData.projects.forEach((proj, idx) => {
        const val = (field) => editorBody.querySelector(`#cms-proj-${field}-${idx}`)?.value ?? '';
        proj.title = val('title');
        proj.category = val('category') || 'web';
        proj.badge = val('badge');
        proj.techSubtitle = val('techSubtitle');
        proj.image = val('image');
        proj.githubUrl = val('githubUrl');
        proj.liveUrl = val('liveUrl');
        proj.descEn = val('descEn');
        proj.descId = val('descId');
      });
    }
  }

  function renderEditorTab() {
    if (!editorBody) return;

    if (activeTab === 'hero') {
      const pi = draftData.personalInfo;
      const en = draftData.translations.en;
      const id = draftData.translations.id;
      editorBody.innerHTML = `
        <div class="cms-grid-2">
          <div class="cms-field">
            <label>Nama Lengkap</label>
            <input id="cms-pi-name" type="text" value="${escapeHtml(pi.name)}" />
          </div>
          <div class="cms-field">
            <label>Brand Subtitle (Header & Footer)</label>
            <input id="cms-pi-brand" type="text" value="${escapeHtml(pi.brandTitle)}" />
          </div>
          <div class="cms-field">
            <label>Lokasi</label>
            <input id="cms-pi-location" type="text" value="${escapeHtml(pi.location)}" />
          </div>
          <div class="cms-field">
            <label>Email</label>
            <input id="cms-pi-email" type="email" value="${escapeHtml(pi.email)}" />
          </div>
          <div class="cms-field cms-span-2">
            <label>GitHub Profile URL</label>
            <input id="cms-pi-github" type="url" value="${escapeHtml(pi.social.github)}" />
          </div>
        </div>

        <h4 class="cms-section-title">Hero Section (EN / ID)</h4>
        <div class="cms-grid-2">
          <div class="cms-field">
            <label>Greeting (EN)</label>
            <input id="cms-en-heroHello" type="text" value="${escapeHtml(en.heroHello)}" />
          </div>
          <div class="cms-field">
            <label>Greeting (ID)</label>
            <input id="cms-id-heroHello" type="text" value="${escapeHtml(id.heroHello)}" />
          </div>
          <div class="cms-field">
            <label>Role Title (EN)</label>
            <input id="cms-en-heroRole" type="text" value="${escapeHtml(en.heroRole)}" />
          </div>
          <div class="cms-field">
            <label>Role Title (ID)</label>
            <input id="cms-id-heroRole" type="text" value="${escapeHtml(id.heroRole)}" />
          </div>
          <div class="cms-field">
            <label>Hero Description (EN)</label>
            <textarea id="cms-en-heroDesc" rows="3">${escapeHtml(en.heroDesc)}</textarea>
          </div>
          <div class="cms-field">
            <label>Hero Description (ID)</label>
            <textarea id="cms-id-heroDesc" rows="3">${escapeHtml(id.heroDesc)}</textarea>
          </div>
        </div>

        <h4 class="cms-section-title">Contact CTA Section (EN / ID)</h4>
        <div class="cms-grid-2">
          <div class="cms-field">
            <label>CTA Title (EN)</label>
            <input id="cms-en-ctaTitle" type="text" value="${escapeHtml(en.ctaTitle)}" />
          </div>
          <div class="cms-field">
            <label>CTA Title (ID)</label>
            <input id="cms-id-ctaTitle" type="text" value="${escapeHtml(id.ctaTitle)}" />
          </div>
          <div class="cms-field">
            <label>CTA Subtitle (EN)</label>
            <textarea id="cms-en-ctaSubtitle" rows="2">${escapeHtml(en.ctaSubtitle)}</textarea>
          </div>
          <div class="cms-field">
            <label>CTA Subtitle (ID)</label>
            <textarea id="cms-id-ctaSubtitle" rows="2">${escapeHtml(id.ctaSubtitle)}</textarea>
          </div>
        </div>
      `;
    } else if (activeTab === 'about') {
      const en = draftData.translations.en;
      const id = draftData.translations.id;
      editorBody.innerHTML = `
        <h4 class="cms-section-title">About & Highlights</h4>
        <div class="cms-grid-2">
          <div class="cms-field">
            <label>About Title (EN)</label>
            <input id="cms-en-aboutTitle" type="text" value="${escapeHtml(en.aboutTitle)}" />
          </div>
          <div class="cms-field">
            <label>About Title (ID)</label>
            <input id="cms-id-aboutTitle" type="text" value="${escapeHtml(id.aboutTitle)}" />
          </div>
          <div class="cms-field">
            <label>About Bio (EN)</label>
            <textarea id="cms-en-aboutBio" rows="4">${escapeHtml(en.aboutBio)}</textarea>
          </div>
          <div class="cms-field">
            <label>About Bio (ID)</label>
            <textarea id="cms-id-aboutBio" rows="4">${escapeHtml(id.aboutBio)}</textarea>
          </div>
          <div class="cms-field">
            <label>Highlights (EN — 1 per baris)</label>
            <textarea id="cms-en-highlights" rows="4">${escapeHtml((en.highlights || []).join('\n'))}</textarea>
          </div>
          <div class="cms-field">
            <label>Highlights (ID — 1 per baris)</label>
            <textarea id="cms-id-highlights" rows="4">${escapeHtml((id.highlights || []).join('\n'))}</textarea>
          </div>
        </div>

        <h4 class="cms-section-title">Services (${draftData.services.length})</h4>
        <div class="cms-stack">
          ${draftData.services.map((s, idx) => `
            <div class="cms-card-item">
              <div class="cms-card-head">Service #${idx + 1}: ${escapeHtml(s.titleEn)}</div>
              <div class="cms-grid-2">
                <div class="cms-field">
                  <label>Title (EN)</label>
                  <input id="cms-srv-titleEn-${idx}" type="text" value="${escapeHtml(s.titleEn)}" />
                </div>
                <div class="cms-field">
                  <label>Title (ID)</label>
                  <input id="cms-srv-titleId-${idx}" type="text" value="${escapeHtml(s.titleId)}" />
                </div>
                <div class="cms-field">
                  <label>Description (EN)</label>
                  <textarea id="cms-srv-descEn-${idx}" rows="2">${escapeHtml(s.descEn)}</textarea>
                </div>
                <div class="cms-field">
                  <label>Description (ID)</label>
                  <textarea id="cms-srv-descId-${idx}" rows="2">${escapeHtml(s.descId)}</textarea>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (activeTab === 'projects') {
      editorBody.innerHTML = `
        <div class="cms-projects-toolbar">
          <span class="cms-muted">Total ${draftData.projects.length} proyek. Klik "Save & Apply" setelah mengedit.</span>
          <button type="button" class="btn btn-primary btn-sm" id="cms-add-project">+ Tambah Proyek</button>
        </div>
        <div class="cms-stack">
          ${draftData.projects.map((p, idx) => `
            <div class="cms-card-item">
              <div class="cms-card-head">
                <span>#${idx + 1} — ${escapeHtml(p.title)}</span>
                <button type="button" class="cms-btn-danger" data-delete-proj="${idx}">Hapus</button>
              </div>
              <div class="cms-grid-2">
                <div class="cms-field">
                  <label>Judul Proyek</label>
                  <input id="cms-proj-title-${idx}" type="text" value="${escapeHtml(p.title)}" />
                </div>
                <div class="cms-field">
                  <label>Kategori</label>
                  <select id="cms-proj-category-${idx}">
                    <option value="school" ${p.category === 'school' ? 'selected' : ''}>Education Systems (school)</option>
                    <option value="web" ${p.category === 'web' ? 'selected' : ''}>Web & OCR (web)</option>
                    <option value="creative" ${p.category === 'creative' ? 'selected' : ''}>3D & Creative (creative)</option>
                  </select>
                </div>
                <div class="cms-field">
                  <label>Badge</label>
                  <input id="cms-proj-badge-${idx}" type="text" value="${escapeHtml(p.badge)}" />
                </div>
                <div class="cms-field">
                  <label>Tech Stack</label>
                  <input id="cms-proj-techSubtitle-${idx}" type="text" value="${escapeHtml(p.techSubtitle)}" />
                </div>
                <div class="cms-field">
                  <label>Path Gambar</label>
                  <input id="cms-proj-image-${idx}" type="text" value="${escapeHtml(p.image)}" />
                </div>
                <div class="cms-field">
                  <label>GitHub URL</label>
                  <input id="cms-proj-githubUrl-${idx}" type="url" value="${escapeHtml(p.githubUrl)}" />
                </div>
                <div class="cms-field cms-span-2">
                  <label>Live Demo URL</label>
                  <input id="cms-proj-liveUrl-${idx}" type="url" value="${escapeHtml(p.liveUrl)}" />
                </div>
                <div class="cms-field">
                  <label>Deskripsi (EN)</label>
                  <textarea id="cms-proj-descEn-${idx}" rows="3">${escapeHtml(p.descEn)}</textarea>
                </div>
                <div class="cms-field">
                  <label>Deskripsi (ID)</label>
                  <textarea id="cms-proj-descId-${idx}" rows="3">${escapeHtml(p.descId)}</textarea>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      editorBody.querySelector('#cms-add-project')?.addEventListener('click', () => {
        collectCurrentTabInputs();
        draftData.projects.unshift({
          id: `project-${Date.now()}`,
          title: 'New Project',
          category: 'web',
          image: './assets/images/project-nativer.svg',
          techSubtitle: 'TypeScript / Vite / Modern CSS',
          descEn: 'Short English description of the project.',
          descId: 'Deskripsi singkat proyek dalam Bahasa Indonesia.',
          githubUrl: 'https://github.com/dev-NativeOmni',
          liveUrl: 'https://native.web.id',
          badge: 'New'
        });
        renderEditorTab();
      });

      editorBody.querySelectorAll('[data-delete-proj]').forEach(btn => {
        btn.addEventListener('click', () => {
          collectCurrentTabInputs();
          const idx = Number(btn.getAttribute('data-delete-proj'));
          if (!Number.isNaN(idx)) {
            draftData.projects.splice(idx, 1);
            renderEditorTab();
          }
        });
      });
    } else if (activeTab === 'publish') {
      const savedPat = localStorage.getItem(STORAGE_GH_TOKEN_KEY) || '';
      editorBody.innerHTML = `
        <div class="cms-card-item">
          <div class="cms-card-head">Publish Global ke GitHub & Cloudflare (native.web.id)</div>
          <p class="cms-muted" style="margin-bottom: 12px;">
            Simpan lokal hanya mengubah tampilan di browser ini. Untuk mempublikasikan perubahan ke semua pengunjung secara permanen, gunakan GitHub Personal Access Token (scope <code>repo</code> / <code>Contents: Read & Write</code>) untuk commit langsung ke <code>${GITHUB_OWNER}/${GITHUB_REPO}</code>.
          </p>
          <div class="cms-field">
            <label>GitHub Personal Access Token (PAT)</label>
            <input id="cms-gh-pat" type="password" placeholder="ghp_... atau github_pat_..." value="${escapeHtml(savedPat)}" />
          </div>
          <label class="cms-checkbox-row">
            <input id="cms-gh-remember" type="checkbox" ${savedPat ? 'checked' : ''} />
            <span>Simpan token di browser ini (localStorage)</span>
          </label>
          <div class="cms-actions-row">
            <button type="button" class="btn btn-primary btn-sm" id="cms-publish-github">Publish Live via GitHub</button>
            <button type="button" class="btn btn-secondary btn-sm" id="cms-download-js">Download projects.js</button>
          </div>
        </div>

        <div class="cms-card-item">
          <div class="cms-card-head">Ubah Kredensial Akses Admin</div>
          <p class="cms-muted" style="margin-bottom: 12px;">
            Kredensial disimpan sebagai hash SHA-256 di browser ini.
          </p>
          <div class="cms-grid-2">
            <div class="cms-field">
              <label>Username Baru</label>
              <input id="cms-new-user" type="text" placeholder="nativeomni" />
            </div>
            <div class="cms-field">
              <label>Password Baru</label>
              <input id="cms-new-pass" type="password" placeholder="Minimal 6 karakter" />
            </div>
          </div>
          <div class="cms-actions-row">
            <button type="button" class="btn btn-secondary btn-sm" id="cms-update-auth">Simpan Kredensial Baru</button>
            <button type="button" class="cms-btn-danger" id="cms-reset-defaults">Reset Edit Lokal ke Default</button>
          </div>
        </div>
      `;

      editorBody.querySelector('#cms-download-js')?.addEventListener('click', () => {
        const source = generateProjectsJsSource(draftData);
        const blob = new Blob([source], { type: 'application/javascript;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'projects.js';
        a.click();
        URL.revokeObjectURL(url);
        showStatus('File projects.js berhasil diunduh.');
      });

      editorBody.querySelector('#cms-publish-github')?.addEventListener('click', async () => {
        const pat = (editorBody.querySelector('#cms-gh-pat')?.value || '').trim();
        const remember = editorBody.querySelector('#cms-gh-remember')?.checked;
        if (!pat) {
          showStatus('Masukkan GitHub Personal Access Token terlebih dahulu.', true);
          return;
        }
        if (remember) {
          localStorage.setItem(STORAGE_GH_TOKEN_KEY, pat);
        } else {
          localStorage.removeItem(STORAGE_GH_TOKEN_KEY);
        }

        showStatus('Menghubungi GitHub API...');
        try {
          const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_DATA_PATH}`;
          const headers = {
            Authorization: `Bearer ${pat}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json'
          };

          const getRes = await fetch(`${apiUrl}?ref=${GITHUB_BRANCH}`, { headers });
          if (!getRes.ok) {
            throw new Error(`Gagal membaca file dari GitHub (${getRes.status})`);
          }
          const fileMeta = await getRes.json();

          const contentSource = generateProjectsJsSource(draftData);
          const putRes = await fetch(apiUrl, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              message: 'content: update portfolio via live web CMS',
              content: utf8ToBase64(contentSource),
              sha: fileMeta.sha,
              branch: GITHUB_BRANCH
            })
          });

          if (!putRes.ok) {
            const errJson = await putRes.json().catch(() => ({}));
            throw new Error(errJson.message || `GitHub API error (${putRes.status})`);
          }

          localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(draftData));
          setLiveData(deepClone(draftData));
          onDataChange();
          showStatus('Berhasil dipublish ke GitHub! Cloudflare & GitHub Pages sedang auto-deploy.');
        } catch (err) {
          showStatus(`Publish gagal: ${err.message}`, true);
        }
      });

      editorBody.querySelector('#cms-update-auth')?.addEventListener('click', async () => {
        const newUser = (editorBody.querySelector('#cms-new-user')?.value || '').trim();
        const newPass = editorBody.querySelector('#cms-new-pass')?.value || '';
        if (!newUser || newPass.length < 6) {
          showStatus('Username wajib diisi & password minimal 6 karakter.', true);
          return;
        }
        const newHash = await sha256Hex(`${newUser}:${newPass}`);
        localStorage.setItem(STORAGE_AUTH_KEY, newHash);
        showStatus(`Kredensial baru untuk "${newUser}" berhasil disimpan di browser ini.`);
      });

      editorBody.querySelector('#cms-reset-defaults')?.addEventListener('click', () => {
        localStorage.removeItem(STORAGE_DATA_KEY);
        draftData = deepClone(defaults);
        setLiveData(deepClone(defaults));
        onDataChange();
        showStatus('Data lokal direset ke versi default repository.');
      });
    }
  }

  updateFloatingBar();
}

function injectCmsUi() {
  if (document.getElementById('cms-login-modal')) return;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <!-- CMS Login Modal -->
    <div class="cv-modal-backdrop" id="cms-login-modal" aria-hidden="true">
      <div class="cv-modal-dialog cms-login-dialog" role="dialog" aria-modal="true" aria-labelledby="cms-login-title">
        <div class="cv-modal-header">
          <h3 id="cms-login-title">Admin Content Access</h3>
          <button type="button" class="btn btn-secondary btn-sm" id="cms-login-close">Close</button>
        </div>
        <form id="cms-login-form" class="cms-login-form">
          <p class="cms-muted">Masukkan kredensial untuk mengedit konten portofolio secara langsung.</p>
          <div class="cms-field">
            <label for="cms-username">Username</label>
            <input id="cms-username" type="text" autocomplete="username" placeholder="nativeomni" required />
          </div>
          <div class="cms-field">
            <label for="cms-password">Password</label>
            <input id="cms-password" type="password" autocomplete="current-password" placeholder="••••••••••••" required />
          </div>
          <div id="cms-login-error" class="cms-error-text"></div>
          <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">Unlock Editor</button>
        </form>
      </div>
    </div>

    <!-- CMS Live Editor Modal -->
    <div class="cv-modal-backdrop" id="cms-editor-modal" aria-hidden="true">
      <div class="cv-modal-dialog cms-editor-dialog" role="dialog" aria-modal="true" aria-labelledby="cms-editor-title">
        <div class="cv-modal-header">
          <h3 id="cms-editor-title">Live Portfolio Editor</h3>
          <div class="cv-modal-actions">
            <button type="button" class="btn btn-primary btn-sm" id="cms-save-local">Save &amp; Apply</button>
            <button type="button" class="btn btn-secondary btn-sm" id="cms-editor-close">Close</button>
          </div>
        </div>
        <div class="cms-tabs">
          <button type="button" class="cms-tab-btn active" data-cms-tab="hero">Hero &amp; Info</button>
          <button type="button" class="cms-tab-btn" data-cms-tab="about">About &amp; Services</button>
          <button type="button" class="cms-tab-btn" data-cms-tab="projects">Projects</button>
          <button type="button" class="cms-tab-btn" data-cms-tab="publish">Publish &amp; Security</button>
        </div>
        <div class="cms-editor-body" id="cms-editor-body"></div>
        <div class="cms-editor-footer">
          <span id="cms-editor-status" class="cms-status-text"></span>
        </div>
      </div>
    </div>

    <!-- Floating Edit Mode Bar -->
    <div class="cms-floating-bar" id="cms-floating-bar">
      <span class="cms-floating-badge">Edit Mode Active</span>
      <button type="button" class="btn btn-primary btn-sm" id="cms-floating-open">Open Editor</button>
      <button type="button" class="btn btn-secondary btn-sm" id="cms-floating-logout">Logout</button>
    </div>
  `;
  document.body.appendChild(wrapper);
}
