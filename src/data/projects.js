/**
 * DATA PROYEK PORTFOLIO
 * 
 * Silakan tambahkan atau ubah data proyek Anda di sini.
 * Setiap proyek otomatis ditampilkan di web dengan link GitHub & Live Demo.
 */

export const personalInfo = {
  name: "Alif Dev", // Ganti dengan nama Anda
  role: "Creative Developer & Full-Stack Builder",
  bio: "Membangun pengalaman web interaktif, performan tinggi, dan modern dengan fokus pada WebGL, Three.js, dan arsitektur aplikasi mutakhir.",
  location: "Indonesia",
  status: "Tersedia untuk proyek freelance & kolaborasi",
  githubUsername: "native-coder", // Ganti dengan username GitHub Anda
  social: {
    github: "https://github.com/",
    linkedin: "https://linkedin.com/",
    twitter: "https://x.com/",
    email: "kontak@domainkamu.com"
  },
  stats: [
    { label: "Proyek di-Deploy", value: "12+" },
    { label: "Total Kontribusi", value: "480+" },
    { label: "Teknologi", value: "10+" },
    { label: "Pengalaman", value: "3+ Thn" }
  ]
};

export const skills = [
  { name: "Three.js / WebGL", category: "Creative", level: 90, icon: "cube" },
  { name: "JavaScript / TypeScript", category: "Frontend", level: 95, icon: "code" },
  { name: "React / Next.js", category: "Frontend", level: 90, icon: "react" },
  { name: "Tailwind / Modern CSS", category: "Frontend", level: 92, icon: "brush" },
  { name: "Node.js / Express", category: "Backend", level: 85, icon: "server" },
  { name: "Git & GitHub Actions", category: "DevOps", level: 88, icon: "git" },
  { name: "REST / GraphQL API", category: "Backend", level: 86, icon: "network" },
  { name: "Vite & Performance", category: "Tools", level: 90, icon: "zap" }
];

export const projects = [
  {
    id: "project-1",
    title: "CyberSphere 3D Visualizer",
    description: "Aplikasi visualisasi data spasial 3D interaktif berbasis Three.js dan WebGL dengan kontrol kamera dinamis serta efek pasca-pemrosesan bloom shaders.",
    category: "3d",
    featured: true,
    tags: ["Three.js", "WebGL", "Vite", "GLSL Shaders"],
    githubUrl: "https://github.com/",
    liveUrl: "https://github.com/",
    accentColor: "#38bdf8", // Sky blue neon
    stats: { stars: 24, forks: 6 }
  },
  {
    id: "project-2",
    title: "NeuroCommerce Dashboard",
    description: "Dashboard analitik e-commerce real-time dengan grafik interaktif, manajemen inventaris kilat, dan integrasi API pembayaran modern.",
    category: "web",
    featured: true,
    tags: ["React", "TypeScript", "Tailwind CSS", "Recharts"],
    githubUrl: "https://github.com/",
    liveUrl: "https://github.com/",
    accentColor: "#a855f7", // Purple neon
    stats: { stars: 38, forks: 12 }
  },
  {
    id: "project-3",
    title: "DevPulse - GitHub Action Monitor",
    description: "Aplikasi pemantau status CI/CD workflow GitHub terpusat dengan notifikasi real-time, visualisasi build history, dan error diagnostics.",
    category: "tools",
    featured: true,
    tags: ["JavaScript", "GitHub API", "Node.js", "WebSocket"],
    githubUrl: "https://github.com/",
    liveUrl: "https://github.com/",
    accentColor: "#10b981", // Emerald neon
    stats: { stars: 45, forks: 9 }
  },
  {
    id: "project-4",
    title: "Aura Audio Reactive 3D Canvas",
    description: "Eksperimen audio visualizer Web Audio API yang memetakan spektrum frekuensi suara ke partikel 3D secara dinamis 60 FPS.",
    category: "3d",
    featured: false,
    tags: ["Three.js", "Web Audio API", "Canvas", "CSS Grid"],
    githubUrl: "https://github.com/",
    liveUrl: "https://github.com/",
    accentColor: "#f43f5e", // Rose neon
    stats: { stars: 19, forks: 4 }
  },
  {
    id: "project-5",
    title: "PromptCraft AI Hub",
    description: "Interface modern untuk kurasi dan pengujian prompt generative AI dengan manajemen template, caching lokal, dan export cepat.",
    category: "web",
    featured: false,
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Zustand"],
    githubUrl: "https://github.com/",
    liveUrl: "https://github.com/",
    accentColor: "#f59e0b", // Amber neon
    stats: { stars: 52, forks: 15 }
  },
  {
    id: "project-6",
    title: "FastCLI Git Release Helper",
    description: "Alat CLI otomatis untuk membuat release tag semver, changelog otomatis dari commit git, dan upload binary ke GitHub Releases.",
    category: "tools",
    featured: false,
    tags: ["Node.js", "CLI", "Git Automation", "Shell"],
    githubUrl: "https://github.com/",
    liveUrl: "https://github.com/",
    accentColor: "#06b6d4", // Cyan neon
    stats: { stars: 29, forks: 8 }
  }
];
