/**
 * DATA PORTOFOLIO RESMI NATIVE OMNI
 * Sesuai Arsitektur Desain Modern Minimalist Developer
 */

export const personalInfo = {
  name: "Native Omni",
  firstName: "Native",
  lastName: "Omni",
  brandTitle: "FULL STACK DEVELOPER",
  role: "Full Stack Developer",
  tagline: "I build exceptional digital experiences for schools, businesses, and communities in Indonesia and around the world.",
  aboutTitle: "Building Solutions That Make an Impact",
  aboutBio: "I'm a passionate Full Stack Developer based in Solo (SOC), Indonesia. I specialize in architecting scalable web applications, school management platforms, and robust backend ecosystems using modern technologies. With a strong eye for clean design and a love for structured, tested code, I help institutions turn complex administrative workflows into seamless digital products.",
  location: "Solo (SOC), Indonesia",
  email: "nativeomni@gmail.com",
  phone: "+62 812-3456-7890",
  languages: "Indonesian, English",
  githubUsername: "dev-NativeOmni",
  social: {
    github: "https://github.com/dev-NativeOmni",
    linkedin: "https://github.com/dev-NativeOmni",
    email: "mailto:nativeomni@gmail.com",
    whatsapp: "https://wa.me/6281234567890"
  },
  highlights: [
    { title: "5+ Years of Experience", icon: "diamond" },
    { title: "Available for Freelance", icon: "sparkle" },
    { title: "11+ GitHub Repositories", icon: "check" },
    { title: "250+ Automated Tests", icon: "globe" }
  ],
  techLogos: [
    { name: "Laravel 12", color: "#FF2D20" },
    { name: "Next.js 16", color: "#ffffff" },
    { name: "React 19", color: "#61DAFB" },
    { name: "Tailwind CSS v4", color: "#06B6D4" },
    { name: "Three.js", color: "#ffffff" },
    { name: "TypeScript", color: "#3178C6" },
    { name: "Firebase", color: "#FFCA28" },
    { name: "MySQL", color: "#4479A1" }
  ]
};

export const services = [
  {
    id: "web-dev",
    title: "Web Development",
    icon: "code",
    description: "Custom websites and web applications built with the latest enterprise-grade technologies and frameworks."
  },
  {
    id: "responsive-design",
    title: "Responsive Design",
    icon: "mobile",
    description: "Mobile-first designs that look stunning and perform smoothly on all devices and screen sizes."
  },
  {
    id: "performance-optimization",
    title: "Performance Optimization",
    icon: "rocket",
    description: "Improve website speed, asset bundling, and server architecture for better SEO and user retention."
  },
  {
    id: "system-maintenance",
    title: "Website Maintenance",
    icon: "shield",
    description: "Ongoing support, security patching, and continuous deployment to keep your applications running reliably."
  }
];

export const projects = [
  {
    id: "tad-ims",
    title: "TAD Management System",
    category: "school",
    image: "./assets/images/project-tad.svg",
    techSubtitle: "Laravel 12 / Tailwind CSS 4 / MySQL / Alpine.js",
    description: "Platform tata kelola terintegrasi skala institusi untuk memonitor capaian Tahfizh Al-Qur'an, pembiasaan adab, poin disiplin santri, serta cetak rapor browser-native dan export streaming Excel.",
    githubUrl: "https://github.com/dev-NativeOmni/ims",
    liveUrl: "https://github.com/dev-NativeOmni/ims",
    badge: "Enterprise Ready"
  },
  {
    id: "deathroll-band",
    title: "DEATHROLL Band & CMS",
    category: "creative",
    image: "./assets/images/project-deathroll.svg",
    techSubtitle: "TypeScript / In-Place CMS / Web Audio Synth / SQLite",
    description: "Website band punk-rock Indonesia dengan estetika punk-zine kontras tinggi, audio track synth player bawaan, jadwal gigs tur, rilis diskografi album, dan in-place admin editor langsung tersimpan ke SQLite.",
    githubUrl: "https://github.com/dev-NativeOmni/Deathroll",
    liveUrl: "https://github.com/dev-NativeOmni/Deathroll",
    badge: "Interactive Audio"
  },
  {
    id: "mysch-jurnal",
    title: "MySch — Jurnal Guru",
    category: "school",
    image: "./assets/images/project-mysch.svg",
    techSubtitle: "Next.js / React 19 / Tailwind v4 / Firebase Firestore",
    description: "Aplikasi presensi dan jurnal harian guru mobile-first dengan aturan 3-ketukan instan, deteksi jadwal otomatis, kompresi foto presensi di peramban, serta multi-tenancy token lembaga.",
    githubUrl: "https://github.com/dev-NativeOmni/mysch",
    liveUrl: "https://github.com/dev-NativeOmni/mysch",
    badge: "Mobile-First"
  },
  {
    id: "schoop-hafizplus",
    title: "Schoop Platform (Hafizplus 3.0)",
    category: "school",
    image: "./assets/images/project-tad.svg",
    techSubtitle: "PHP / Laravel / Blade / Vercel Deploy",
    description: "Platform manajemen operasional sekolah generasi ketiga yang mendukung portal akademik siswa dan monitoring yayasan terpusat.",
    githubUrl: "https://github.com/dev-NativeOmni/schoop",
    liveUrl: "https://hafizplus-school-platform.vercel.app",
    badge: "Deployed on Vercel"
  },
  {
    id: "cemara-doku",
    title: "Cemara Doku — Smart Finance & OCR",
    category: "web",
    image: "./assets/images/project-mysch.svg",
    techSubtitle: "Next.js 16 / React 19 / Tesseract.js OCR / Firebase",
    description: "Sistem pencatatan keuangan keluarga cerdas dengan pemindaian struk otomatis memanfaatkan Tesseract.js OCR client-side dan sinkronisasi cloud real-time.",
    githubUrl: "https://github.com/dev-NativeOmni/cemara-doku",
    liveUrl: "https://github.com/dev-NativeOmni/cemara-doku",
    badge: "Smart OCR"
  },
  {
    id: "nativer-portfolio",
    title: "Nativer 3D Engine",
    category: "creative",
    image: "./assets/images/project-deathroll.svg",
    techSubtitle: "Three.js / WebGL / Vite 6 / Cloudflare Pages",
    description: "Web portofolio arsitektur modern berkecepatan tinggi dengan integrasi Three.js WebGL stardust, layout responsif murni, dan deployment otomatis Cloudflare Pages.",
    githubUrl: "https://github.com/dev-NativeOmni/Nativer",
    liveUrl: "https://native.web.id",
    badge: "Live on native.web.id"
  }
];
