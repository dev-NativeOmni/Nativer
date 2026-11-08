/**
 * DATA PORTOFOLIO & PROYEK GITHUB RESMI
 * Profil: dev-NativeOmni (Native Omni)
 */

export const personalInfo = {
  name: "Native Omni",
  brandName: "NativeOmni",
  role: "Full-Stack Software Engineer & Creative Builder",
  bio: "Software engineer berfokus pada pengembangan sistem manajemen pendidikan terpadu, aplikasi web modern berkinerja tinggi, serta eksplorasi antarmuka kreatif 3D WebGL.",
  location: "Solo (SOC), Indonesia",
  status: "Tersedia untuk proyek & kolaborasi rekayasa web",
  githubUsername: "dev-NativeOmni",
  avatarUrl: "https://avatars.githubusercontent.com/u/290612262?v=4",
  social: {
    github: "https://github.com/dev-NativeOmni",
    linkedin: "https://github.com/dev-NativeOmni",
    email: "nativeomni@gmail.com"
  },
  stats: [
    { label: "Repositori GitHub", value: "11+" },
    { label: "Modul Sistem", value: "35+" },
    { label: "Tech Stack", value: "8+" },
    { label: "Tes Terotomasi", value: "250+" }
  ]
};

export const skills = [
  { name: "Laravel 12 / PHP 8.2+", category: "Backend", level: 94, icon: "server" },
  { name: "Next.js / React 19", category: "Frontend", level: 92, icon: "react" },
  { name: "Tailwind CSS v4 / Modern CSS", category: "Frontend", level: 95, icon: "brush" },
  { name: "TypeScript / JavaScript", category: "Frontend", level: 90, icon: "code" },
  { name: "Three.js / WebGL 3D", category: "Creative", level: 86, icon: "cube" },
  { name: "MySQL / MariaDB / SQLite", category: "Database", level: 88, icon: "database" },
  { name: "Firebase (Firestore & Hosting)", category: "Cloud", level: 85, icon: "cloud" },
  { name: "Vite 6 / Automated Testing (PHPUnit)", category: "DevOps", level: 89, icon: "zap" }
];

export const projects = [
  {
    id: "tad-ims",
    title: "TAD Management System (Tahfizh, Adab, Disiplin)",
    description: "Platform tata kelola terintegrasi skala institusi untuk memonitor capaian Tahfizh Al-Qur'an (metode reguler & Ummi), pembiasaan adab harian, poin Tanse (disiplin), serta cetak rapor dan ekspor Excel streaming.",
    category: "school",
    featured: true,
    tags: ["Laravel 12", "Tailwind CSS 4", "Alpine.js", "Vite 6", "MySQL", "PHPUnit (257 Tests)"],
    githubUrl: "https://github.com/dev-NativeOmni/ims",
    liveUrl: "https://github.com/dev-NativeOmni/ims",
    accentColor: "#10b981", // Emerald neon
    stats: { stars: 0, forks: 0, label: "Enterprise Ready" }
  },
  {
    id: "deathroll-band",
    title: "DEATHROLL — Band Profile & In-Place Lightweight CMS",
    description: "Website band punk-rock Indonesia dengan estetika punk-zine kontras tinggi, audio player Web Audio Synthesizer bawaan, jadwal tur gigs, rilis diskografi album, dan in-place live admin CMS terintegrasi SQLite.",
    category: "creative",
    featured: true,
    tags: ["TypeScript", "In-Place CMS", "Web Audio Synth", "SQLite", "Tailwind"],
    githubUrl: "https://github.com/dev-NativeOmni/Deathroll",
    liveUrl: "https://github.com/dev-NativeOmni/Deathroll",
    accentColor: "#f43f5e", // Crimson red / punk neon
    stats: { stars: 0, forks: 0, label: "Live Synth CMS" }
  },
  {
    id: "mysch-jurnal",
    title: "MySch — Jurnal Harian Guru & Presensi Terpadu",
    description: "Aplikasi web Mobile-First untuk guru sekolah dengan aturan 3-ketukan kilat, deteksi jadwal mengajar otomatis, kompresi foto presensi di sisi peramban, serta multi-tenancy sekolah berbasis Token Lembaga.",
    category: "school",
    featured: true,
    tags: ["Next.js", "React", "Tailwind CSS v4", "Firebase Spark", "Firestore Multi-Tenant"],
    githubUrl: "https://github.com/dev-NativeOmni/mysch",
    liveUrl: "https://github.com/dev-NativeOmni/mysch",
    accentColor: "#38bdf8", // Sky blue neon
    stats: { stars: 0, forks: 0, label: "Mobile-First" }
  },
  {
    id: "schoop-hafizplus",
    title: "Schoop — School & Education Platform (Hafizplus 3.0)",
    description: "Platform manajemen operasional sekolah modern generasi ketiga yang mendukung portal akademik siswa, pengelolaan kurikulum tahfizh, dan portal monitoring terpusat untuk yayasan.",
    category: "school",
    featured: true,
    tags: ["PHP", "Laravel/Blade", "CSS", "Vercel Deploy"],
    githubUrl: "https://github.com/dev-NativeOmni/schoop",
    liveUrl: "https://hafizplus-school-platform.vercel.app",
    accentColor: "#a855f7", // Purple neon
    stats: { stars: 1, forks: 0, label: "Deployed on Vercel" }
  },
  {
    id: "cemara-doku",
    title: "Cemara Doku — Aplikasi Keuangan Keluarga & OCR",
    description: "Sistem pencatatan dan pelaporan keuangan rumah tangga cerdas dengan fitur pemindaian struk belanja otomatis memanfaatkan Tesseract.js OCR, Next.js 16, React 19, dan sinkronisasi cloud Firebase.",
    category: "web",
    featured: false,
    tags: ["Next.js 16", "React 19", "Tesseract.js OCR", "Firebase", "Tailwind v4"],
    githubUrl: "https://github.com/dev-NativeOmni/cemara-doku",
    liveUrl: "https://github.com/dev-NativeOmni/cemara-doku",
    accentColor: "#f59e0b", // Amber neon
    stats: { stars: 0, forks: 0, label: "Smart OCR" }
  },
  {
    id: "nativer-3d",
    title: "Nativer — 3D Cybernetic Portfolio Engine",
    description: "Mesin web portofolio pribadi modern berbasis Three.js WebGL dan CSS Glassmorphism tingkat tinggi dengan kamera parallax interaktif, respons kursor dinamis, dan integrasi katalog proyek GitHub real-time.",
    category: "creative",
    featured: false,
    tags: ["Three.js", "WebGL", "Vite 6", "CSS Glassmorphism", "GitHub Actions"],
    githubUrl: "https://github.com/dev-NativeOmni/Nativer",
    liveUrl: "https://dev-nativeomni.github.io/Nativer/",
    accentColor: "#06b6d4", // Cyan neon
    stats: { stars: 0, forks: 0, label: "Live on GH Pages" }
  },
  {
    id: "kuttab-edu",
    title: "Kuttab — Modul Informasi Kurikulum & Santri",
    description: "Aplikasi antarmuka manajemen data kurikulum dan evaluasi santri kuttab berbasis Vue dan TypeScript yang ringan dan responsif.",
    category: "school",
    featured: false,
    tags: ["Vue.js", "TypeScript", "Tailwind", "Shell"],
    githubUrl: "https://github.com/dev-NativeOmni/kuttab",
    liveUrl: "https://github.com/dev-NativeOmni/kuttab",
    accentColor: "#22c55e", // Light green
    stats: { stars: 0, forks: 0, label: "Vue TypeScript" }
  },
  {
    id: "myra-platform",
    title: "Myra — Web Utility & App Engine",
    description: "Platform utilitas web fleksibel dengan arsitektur backend yang ramping ('Easy as you go') untuk automasi alur kerja web.",
    category: "web",
    featured: false,
    tags: ["PHP", "Blade", "JavaScript", "CSS"],
    githubUrl: "https://github.com/dev-NativeOmni/myra",
    liveUrl: "https://github.com/dev-NativeOmni/myra",
    accentColor: "#ec4899", // Pink neon
    stats: { stars: 0, forks: 0, label: "PHP Engine" }
  }
];
