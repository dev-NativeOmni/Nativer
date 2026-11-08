import * as THREE from 'three';

/**
 * Three.js Interactive 3D Background & Hero Visualization
 * Features:
 * - Dynamic Starfield / Particle Wave system with mouse responsiveness
 * - Futuristic Wireframe Gyro Core (Icosahedron & Rings) with glowing vertices
 * - Scroll-linked camera movement & 3D parallax
 */
export function initThreeScene() {
  const container = document.getElementById('three-canvas-container');
  if (!container) return;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060814, 0.0018);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 35);

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

  // 1. STARFIELD / FLOATING PARTICLES
  const particleCount = 1800;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const scales = new Float32Array(particleCount);

  const colorPalette = [
    new THREE.Color(0x38bdf8), // Sky blue neon
    new THREE.Color(0x818cf8), // Indigo neon
    new THREE.Color(0xa855f7), // Purple neon
    new THREE.Color(0x2dd4bf)  // Teal neon
  ];

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 160;
    positions[i3 + 1] = (Math.random() - 0.5) * 160;
    positions[i3 + 2] = (Math.random() - 0.5) * 120;

    const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i3] = randomColor.r;
    colors[i3 + 1] = randomColor.g;
    colors[i3 + 2] = randomColor.b;

    scales[i] = Math.random() * 2.0 + 0.5;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

  // Custom particle texture generated programmatically
  const createCircleTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    map: createCircleTexture(),
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const starField = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(starField);

  // 2. HERO CYBERNETIC 3D ARTIFACT (Located to the right of the Hero section)
  const heroArtifactGroup = new THREE.Group();
  heroArtifactGroup.position.set(12, 1, 0); // Positioned slightly to the right
  scene.add(heroArtifactGroup);

  // Outer Glowing Wireframe Icosahedron
  const outerGeom = new THREE.IcosahedronGeometry(7.5, 1);
  const outerWireframe = new THREE.WireframeGeometry(outerGeom);
  const outerLineMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending
  });
  const outerMesh = new THREE.LineSegments(outerWireframe, outerLineMat);
  heroArtifactGroup.add(outerMesh);

  // Vertices Points
  const vertexPointsMat = new THREE.PointsMaterial({
    color: 0x67e8f9,
    size: 0.9,
    transparent: true,
    opacity: 0.9,
    map: createCircleTexture(),
    blending: THREE.AdditiveBlending
  });
  const vertexPoints = new THREE.Points(outerGeom, vertexPointsMat);
  heroArtifactGroup.add(vertexPoints);

  // Inner Core Polyhedron
  const innerGeom = new THREE.OctahedronGeometry(4, 0);
  const innerMat = new THREE.MeshPhongMaterial({
    color: 0x1e1b4b,
    emissive: 0x6366f1,
    emissiveIntensity: 0.5,
    shininess: 90,
    wireframe: true,
    transparent: true,
    opacity: 0.8
  });
  const innerMesh = new THREE.Mesh(innerGeom, innerMat);
  heroArtifactGroup.add(innerMesh);

  // Orbiting Rings
  const ringGroup = new THREE.Group();
  heroArtifactGroup.add(ringGroup);

  const ringGeom = new THREE.TorusGeometry(10.5, 0.08, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });
  const ring1 = new THREE.Mesh(ringGeom, ringMat);
  ring1.rotation.x = Math.PI / 3;
  ringGroup.add(ring1);

  const ringGeom2 = new THREE.TorusGeometry(12, 0.06, 16, 100);
  const ringMat2 = new THREE.MeshBasicMaterial({
    color: 0x2dd4bf,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
  });
  const ring2 = new THREE.Mesh(ringGeom2, ringMat2);
  ring2.rotation.y = Math.PI / 3.5;
  ringGroup.add(ring2);

  // Ambient & Directional Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0x38bdf8, 3, 50);
  pointLight1.position.set(10, 15, 20);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xa855f7, 3, 50);
  pointLight2.position.set(-15, -10, 10);
  scene.add(pointLight2);

  // Responsive adjustments for mobile screens
  const adjustForScreenSize = () => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      heroArtifactGroup.position.set(0, 4, -8);
      heroArtifactGroup.scale.set(0.65, 0.65, 0.65);
    } else {
      heroArtifactGroup.position.set(13, 0.5, 0);
      heroArtifactGroup.scale.set(1, 1, 1);
    }
  };
  adjustForScreenSize();

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
    adjustForScreenSize();
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onWindowResize);

  // Animation Loop
  let clock = new THREE.Clock();

  const animate = () => {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Smooth Lerping for Mouse & Scroll
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;
    scrollY += (targetScrollY - scrollY) * 0.06;

    // Starfield gentle rotation & subtle breathing
    starField.rotation.y = elapsedTime * 0.03 + mouse.x * 0.2;
    starField.rotation.x = Math.sin(elapsedTime * 0.02) * 0.1 - mouse.y * 0.1;

    // Hero 3D Artifact rotation & pulse
    heroArtifactGroup.rotation.y = elapsedTime * 0.25 + mouse.x * 0.8;
    heroArtifactGroup.rotation.x = elapsedTime * 0.15 - mouse.y * 0.6;
    
    // Core pulsing animation
    const scalePulse = 1 + Math.sin(elapsedTime * 2.5) * 0.08;
    innerMesh.scale.set(scalePulse, scalePulse, scalePulse);
    innerMesh.rotation.y = -elapsedTime * 0.6;
    innerMesh.rotation.z = elapsedTime * 0.4;

    // Rings rotation
    ring1.rotation.z = elapsedTime * 0.4;
    ring2.rotation.x = -elapsedTime * 0.3;

    // Scroll-linked camera motion (gives dynamic depth as user scrolls down)
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = maxScroll > 0 ? scrollY / maxScroll : 0;

    // Camera travels subtly down & angles as you scroll through portfolio
    camera.position.y = -scrollProgress * 25 + mouse.y * 2;
    camera.position.x = mouse.x * 3;
    camera.lookAt(0, -scrollProgress * 25, 0);

    renderer.render(scene, camera);
  };

  animate();
}
