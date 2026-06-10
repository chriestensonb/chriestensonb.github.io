import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";

const canvas = document.querySelector("#singularity-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(0, 0.35, 7.2);

const group = new THREE.Group();
scene.add(group);

const particleCount = 5200;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const palette = [
  new THREE.Color("#66e5ff"),
  new THREE.Color("#8df7b0"),
  new THREE.Color("#ffc86b"),
  new THREE.Color("#ff7ea8"),
];

for (let i = 0; i < particleCount; i += 1) {
  const u = Math.random() * Math.PI * 2;
  const v = Math.random() * Math.PI * 2;
  const pinch = Math.sin(v);
  const radius = 1.18 + 0.72 * Math.cos(v);
  const fold = 0.28 * Math.sin(3 * u + 1.7 * v);
  const crease = 1 - 0.58 * Math.exp(-Math.abs(Math.sin(u)) * 8);

  const x = (radius * Math.cos(u) + fold) * crease;
  const y = 0.92 * pinch + 0.18 * Math.sin(2 * u);
  const z = radius * Math.sin(u) * (0.72 + 0.28 * Math.cos(v));

  positions[i * 3] = x * 1.55;
  positions[i * 3 + 1] = y * 1.08;
  positions[i * 3 + 2] = z * 1.2;

  const color = palette[i % palette.length].clone();
  color.lerp(new THREE.Color("#ffffff"), Math.random() * 0.18);
  colors[i * 3] = color.r;
  colors[i * 3 + 1] = color.g;
  colors[i * 3 + 2] = color.b;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
  size: 0.018,
  vertexColors: true,
  transparent: true,
  opacity: 0.82,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

const points = new THREE.Points(geometry, material);
group.add(points);

const ringGeometry = new THREE.TorusKnotGeometry(1.55, 0.009, 180, 8, 2, 3);
const ringMaterial = new THREE.MeshBasicMaterial({
  color: "#66e5ff",
  transparent: true,
  opacity: 0.22,
});
const ring = new THREE.Mesh(ringGeometry, ringMaterial);
ring.scale.set(1.45, 0.9, 1.05);
group.add(ring);

const resize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

window.addEventListener("resize", resize);
resize();

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pointer = { x: 0, y: 0 };

window.addEventListener("pointermove", (event) => {
  pointer.x = (event.clientX / window.innerWidth - 0.5) * 0.22;
  pointer.y = (event.clientY / window.innerHeight - 0.5) * 0.16;
});

const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();
  group.rotation.y = t * 0.075 + pointer.x;
  group.rotation.x = -0.12 + Math.sin(t * 0.23) * 0.06 + pointer.y;
  ring.rotation.z = t * 0.08;
  points.material.size = 0.016 + Math.sin(t * 0.7) * 0.002;
  renderer.render(scene, camera);

  if (!prefersReduced) {
    window.requestAnimationFrame(animate);
  }
}

animate();

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
  });
});
