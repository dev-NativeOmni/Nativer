# ⚡ Web Portofolio Pribadi 3D Modern (Three.js & CSS)

Web portofolio pribadi modern dan interaktif yang dibangun menggunakan **Three.js (WebGL)**, **CSS Glassmorphism Modern**, dan **Vite**, dirancang khusus untuk memamerkan proyek-proyek Anda yang telah dibuild dan dideploy di GitHub.

---

## ✨ Fitur Utama

1. **Visualisasi 3D Three.js Interaktif:**
   - Nebula / bidang partikel bintang kosmik dinamis yang merespons pergerakan kursor mouse.
   - Inti sibernetik 3D (Icosahedron & Octahedron Core) dengan cincin gyro berputar dan denyut animasi.
   - Efek kedalaman 3D (*camera parallax drift*) yang menyatu secara mulus saat halaman di-scroll.
   - Penyesuaian performa otomatis untuk layar Retina dan mobile.

2. **Desain Glassmorphism Cyber-Dark:**
   - Palet warna obsidian modern dengan aksen neon (Cyan `#38bdf8`, Ungu `#a855f7`, Zamrud `#10b981`).
   - Kartu kaca frosted blur (`backdrop-filter: blur(14px)`) dengan efek border neon hover.
   - Kursor glow interaktif yang melacak gerakan mouse dengan interpolasi mulus.

3. **Showcase Proyek GitHub:**
   - Kartu proyek interaktif dengan tautan langsung ke **Source Code GitHub** dan **Live Demo**.
   - Tab filter kategori cepat (*Semua, 3D & Creative, Web App, Tools & CLI*).
   - Badge status deploy, bintang repositori (*stars*), dan *forks*.

4. **Matriks Aktivitas GitHub:**
   - Visualisasi commit grid seperti kontribusi GitHub.

5. **Otomatisasi Deployment GitHub Pages:**
   - Dilengkapi file workflow `.github/workflows/deploy.yml` untuk build dan deploy otomatis ke GitHub Pages setiap kali Anda push ke branch `main`.

---

## 🚀 Cara Menjalankan di Komputer Lokal

Pastikan Anda telah menginstal **Node.js** (v18+).

```bash
# 1. Jalankan development server
npm run dev
```

Buka URL lokal yang muncul di terminal (biasanya `http://localhost:3000`).

---

## 🛠️ Cara Mengubah Data & Menambahkan Proyek Anda

Semua data proyek dan profil Anda tersimpan rapi di satu file:
👉 **`src/data/projects.js`**

### 1. Mengubah Data Profil Anda:
Buka `src/data/projects.js` dan sesuaikan objek `personalInfo`:
```javascript
export const personalInfo = {
  name: "Nama Anda",
  role: "Creative Developer & Full-Stack Builder",
  bio: "Deskripsi singkat tentang keahlian dan minat Anda...",
  githubUsername: "username-github-anda",
  social: {
    github: "https://github.com/username-anda",
    linkedin: "https://linkedin.com/in/username-anda",
    email: "emailanda@gmail.com"
  },
  // ...
};
```

### 2. Menambahkan / Mengedit Proyek GitHub Anda:
Pada array `projects` di `src/data/projects.js`, tambahkan objek proyek baru:
```javascript
{
  id: "proyek-baru",
  title: "Nama Proyek Keren",
  description: "Penjelasan singkat mengenai apa yang dibuat proyek ini...",
  category: "web", // Pilihan: "3d", "web", atau "tools"
  tags: ["React", "TypeScript", "Tailwind CSS"],
  githubUrl: "https://github.com/username/nama-repo",
  liveUrl: "https://username.github.io/nama-repo/", // Atau URL Vercel/Netlify
  accentColor: "#38bdf8", // Warna aksen neon kartu
  stats: { stars: 15, forks: 3 }
}
```

---

## 🌐 Cara Deploy ke GitHub Pages

### Opsi 1: Otomatis via GitHub Actions (Sangat Direkomendasikan)
1. Buat repository baru di [GitHub](https://github.com/new).
2. Hubungkan folder ini ke repository GitHub Anda:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit modern 3d portfolio"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo-name>.git
   git push -u origin main
   ```
3. Di GitHub: buka menu **Settings** > **Pages** > pada bagian **Build and deployment**, ubah **Source** menjadi **GitHub Actions**.
4. Selesai! Web Anda akan otomatis ter-build dan online dalam 1-2 menit.

### Opsi 2: Build Manual
```bash
npm run build
```
File siap saji akan berada di folder `dist/` dan dapat Anda upload langsung ke hosting statis pilihan Anda.
