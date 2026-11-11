import * as THREE from 'three';

/**
 * Three.js Dynamic Ambient Atmosphere & Stardust Engine
 * Provides subtle interactive 3D starry galaxy and mouse depth parallax
 * while maintaining a clean, premium developer aesthetic.
 */
export function initThreeScene() {
  const container = document.getElementById('three-canvas-container');
  if (!container) return;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 30);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0); // Transparent background
  container.appendChild(renderer.domElement);

  // Mouse & Scroll Tracking
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let scrollY = window.scrollY;
  let targetScrollY = window.scrollY;

  // 1. Interactive Stardust / Particle Field
  const particleCount = 650;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorPalette = [
    new THREE.Color(0x60a5fa), // Soft sky blue
    new THREE.Color(0x93c5fd), // Ice blue
    new THREE.Color(0x38bdf8), // Cyan
    new THREE.Color(0xffffff)  // Pure starlight white
  ];

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 90;
    positions[i3 + 1] = (Math.random() - 0.5) * 80;
    positions[i3 + 2] = (Math.random() - 0.5) * 50;

    const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i3] = randomColor.r;
    colors[i3 + 1] = randomColor.g;
    colors[i3 + 2] = randomColor.b;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Particle Circular Texture
  const createCircleTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(147, 197, 253, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.65,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    map: createCircleTexture(),
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const starField = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(starField);

  // Mouse Listener
  const onMouseMove = (event) => {
    mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
  };

  // Scroll Listener
  const onScroll = () => {
    targetScrollY = window.scrollY;
  };

  // Resize Listener
  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onWindowResize);

  // Animation Loop
  let clock = new THREE.Clock();

  const animate = () => {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Smooth Lerping
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;
    scrollY += (targetScrollY - scrollY) * 0.05;

    // Gentle Galaxy Rotation
    starField.rotation.y = elapsedTime * 0.015 + mouse.x * 0.15;
    starField.rotation.x = Math.sin(elapsedTime * 0.01) * 0.08 - mouse.y * 0.1;

    // Camera Drift based on mouse & scroll
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = maxScroll > 0 ? scrollY / maxScroll : 0;

    camera.position.y = -scrollProgress * 15 + mouse.y * 1.2;
    camera.position.x = mouse.x * 1.5;
    camera.lookAt(0, -scrollProgress * 15, 0);

    renderer.render(scene, camera);
  };

  animate();
}
