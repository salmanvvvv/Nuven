import * as THREE from "three";
import { BEATS } from "../config";
import { glow, hud } from "../draw";
import type { RC } from "../types";
import { k, lerp, rng } from "../util";

const COUNT = 18000;

const VERT = /* glsl */ `
attribute vec4 aSeed;
uniform float uT, uForm, uCollapse, uSize, uAlpha;
varying float vA;

void main() {
  vec4 s = aSeed;
  float t = uT;

  // 1 · flow field: particles stream through an analytic swirl
  // streams flowing left → right, bent by a smooth field
  float fx = mod((s.x - 0.5) * 30.0 + t * (3.0 + 2.5 * s.z) + 15.0, 30.0) - 15.0;
  float lane = (s.y - 0.5) * 12.0;
  vec3 flow = vec3(
    fx,
    lane + sin(fx * 0.32 + lane * 0.5 + t * 0.8) * 1.6 + sin(fx * 0.11 - t * 0.5) * 1.2,
    (s.w - 0.5) * 8.0 + cos(fx * 0.25 + lane) * 1.2
  );

  // 2 · ring, 3 · vortex collapsing to the centre (same orbit, shrinking radius)
  float ang = s.x * 6.28318 + t * (0.8 + 0.7 * s.y);
  float R = 4.3 + (s.z - 0.5) * 1.6 + sin(ang * 3.0 + t * 2.0) * 0.28;
  float c = uCollapse;
  float rr = R * pow(1.0 - c, 1.3 + s.y * 1.2);
  float spin = ang + c * c * (7.0 + 7.0 * s.z);
  vec3 ring = vec3(cos(spin) * rr, ((s.w - 0.5) * 0.7 + sin(ang * 2.0 + t) * 0.25) * (1.0 - c), sin(spin) * rr);

  float f = smoothstep(0.0, 1.0, clamp(uForm * 1.5 - s.y * 0.5, 0.0, 1.0));
  vec3 pos = mix(flow, ring, f);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (0.9 + s.w * 2.0) * uSize / -mv.z;
  vA = (0.25 + 0.75 * s.z) * uAlpha * (1.0 - 0.55 * c);
}`;

const FRAG = /* glsl */ `
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vec3(1.0), a * vA);
}`;

/** Several passes at slightly earlier times give a light motion trail. */
const TRAILS = [
  { dt: 0, alpha: 1 },
  { dt: 0.035, alpha: 0.55 },
  { dt: 0.07, alpha: 0.32 },
  { dt: 0.105, alpha: 0.18 },
  { dt: 0.14, alpha: 0.08 },
];

let world: { scene: THREE.Scene; camera: THREE.PerspectiveCamera; mats: THREE.ShaderMaterial[] } | null = null;

function build(rc: RC) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(rc.portrait ? 70 : 42, rc.W / rc.H, 0.1, 200);
  const geo = new THREE.BufferGeometry();
  const R = rng(99);
  const seeds = new Float32Array(COUNT * 4);
  for (let i = 0; i < seeds.length; i++) seeds[i] = R();
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100);
  const mats = TRAILS.map(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: { uT: { value: 0 }, uForm: { value: 0 }, uCollapse: { value: 0 }, uSize: { value: 1 }, uAlpha: { value: 1 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(geo, mat));
    return mat;
  });
  return { scene, camera, mats };
}

export const PARTICLE_FORM = (p: number) => k(p, BEATS.particleForm[0], BEATS.particleForm[1], "power2.inOut");
export const PARTICLE_COLLAPSE = (p: number) => k(p, BEATS.particleCollapse[0], BEATS.particleCollapse[1], "power3.in");

/**
 * Scene 6 (16–18.4 s): particles stream through a flow field, gather into a
 * ring, then spiral into a vortex that converges on the centre.
 */
export function drawParticles(rc: RC, p: number) {
  const { g, W, H, u, cx, cy } = rc;
  if (!world) world = build(rc);
  const { scene, camera, mats } = world;

  g.fillStyle = "#000";
  g.fillRect(0, 0, W, H);

  TRAILS.forEach((tr, i) => {
    const tp = p - tr.dt;
    const m = mats[i].uniforms;
    m.uT.value = tp + 2.0;
    m.uForm.value = PARTICLE_FORM(tp);
    m.uCollapse.value = PARTICLE_COLLAPSE(tp);
    m.uSize.value = 46 * (H / 1080);
    m.uAlpha.value = tr.alpha * 0.5 * k(p, -0.15, 0.3);
  });

  const elev = lerp(18, 58, k(p, 0.2, 1.8, "power2.inOut")) * (Math.PI / 180);
  const az = 0.3 + p * 0.35;
  const dist = lerp(rc.portrait ? 20 : 17, rc.portrait ? 14 : 11.5, k(p, 0, 2.4, "power2.inOut"));
  camera.position.set(Math.cos(elev) * Math.sin(az) * dist, Math.sin(elev) * dist, Math.cos(elev) * Math.cos(az) * dist);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();

  rc.three.paint(g, scene, camera);

  // the converging core
  const c = PARTICLE_COLLAPSE(p);
  glow(g, cx, cy, lerp(60, 380, c) * u, 0.15 + 0.75 * c);
  glow(g, cx, cy, 24 * u, c);

  hud(rc, 1 - k(p, 2.0, 2.3), 5);
}
