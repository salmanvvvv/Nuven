import * as THREE from "three";
import { COPY } from "../content";
import { hud, text } from "../draw";
import { mockup, type MockKind } from "../mockups";
import type { RC } from "../types";
import { clamp, k, lerp, rng } from "../util";

/** Glow margin around each card, as a fraction of the plane size. */
const MARGIN = 0.18;

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// Card = texture (with depth-of-field blur) + rounded corners + white border + outer glow.
const FRAG = /* glsl */ `
uniform sampler2D map;
uniform float uBlur, uOpacity, uAspect, uGlow;
varying vec2 vUv;

float sdRound(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

vec3 blurTex(vec2 uv) {
  if (uBlur < 0.0005) return texture2D(map, uv).rgb;
  vec3 c = vec3(0.0);
  const int TAPS = 16;
  for (int i = 0; i < TAPS; i++) {
    float a = float(i) * 2.39996;
    float r = sqrt((float(i) + 0.5) / float(TAPS));
    c += texture2D(map, uv + vec2(cos(a), sin(a) * uAspect) * r * uBlur).rgb;
  }
  return c / float(TAPS);
}

void main() {
  float m = ${MARGIN.toFixed(3)};
  vec2 cuv = (vUv - m) / (1.0 - 2.0 * m);
  // card space centred, x scaled by aspect so corners are round
  vec2 p = (cuv - 0.5) * vec2(uAspect, 1.0);
  float d = sdRound(p, vec2(0.5 * uAspect, 0.5), 0.045);
  float px = fwidth(d) + uBlur * 2.0;
  float inside = 1.0 - smoothstep(-px, px, d);
  vec3 col = blurTex(clamp(cuv, 0.0, 1.0));
  // luminous border
  float border = 1.0 - smoothstep(0.0, 0.006 + uBlur * 2.0, abs(d + 0.002));
  col = mix(col, vec3(1.0), border * 0.85);
  float glow = exp(-max(d, 0.0) * 18.0) * (1.0 - inside) * uGlow;
  float a = max(inside, max(border * 0.9, glow * 0.55));
  vec3 outc = inside > 0.001 ? col : vec3(1.0);
  gl_FragColor = vec4(outc, a * uOpacity);
}`;

interface Card {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  home: THREE.Vector3;
  rot: THREE.Euler;
  delay: number;
  phase: number;
  w: number;
  h: number;
}

let world: { scene: THREE.Scene; camera: THREE.PerspectiveCamera; cards: Card[] } | null = null;

const LAYOUT: { kind: MockKind; w: number; x: number; y: number; z: number; mobile?: boolean }[] = [
  { kind: "landing", w: 4.6, x: -0.6, y: 0.35, z: 0 },
  { kind: "dashboard", w: 4.0, x: 3.9, y: 1.6, z: -3.5 },
  { kind: "shop", w: 3.8, x: -4.6, y: -1.4, z: -2.5 },
  { kind: "mobile", w: 1.5, x: 2.5, y: -1.6, z: 1.6, mobile: true },
  { kind: "chart", w: 2.8, x: -3.4, y: 2.3, z: -6 },
  { kind: "studio", w: 4.2, x: 5.6, y: -2.1, z: -8 },
  { kind: "form", w: 2.4, x: -6.6, y: 1.2, z: -9 },
  { kind: "pricing", w: 3.6, x: 0.8, y: 3.4, z: -11 },
  { kind: "profile", w: 2.6, x: -1.8, y: -3.2, z: -7 },
];

function build(rc: RC) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(rc.portrait ? 62 : 40, rc.W / rc.H, 0.1, 100);
  const R = rng(33);
  const cards: Card[] = LAYOUT.map((l, i) => {
    const aspect = l.mobile ? 400 / 820 : 16 / 10;
    const tw = l.mobile ? 400 : 960;
    const th = Math.round(tw / aspect);
    const tex = new THREE.CanvasTexture(mockup(l.kind, tw, th));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const w = l.w;
    const h = l.w / aspect;
    const geo = new THREE.PlaneGeometry(w / (1 - 2 * MARGIN), h / (1 - 2 * MARGIN));
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: { map: { value: tex }, uBlur: { value: 0 }, uOpacity: { value: 1 }, uAspect: { value: aspect }, uGlow: { value: 1 } },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    // fwidth needs the derivatives extension on WebGL1; three enables it in WebGL2
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    const sx = rc.portrait ? 0.55 : 1;
    const sy = rc.portrait ? 1.6 : 1;
    return {
      mesh,
      home: new THREE.Vector3(l.x * sx, l.y * sy, l.z),
      rot: new THREE.Euler((R() - 0.5) * 0.3, (R() - 0.5) * 0.7 - l.x * 0.04, (R() - 0.5) * 0.08),
      delay: i * 0.07,
      phase: R() * 6.28,
      w,
      h,
    };
  });
  return { scene, camera, cards };
}

/** Soft, out-of-focus waves of light on black (rendered small, scaled up). */
let waveCanvas: HTMLCanvasElement | null = null;
export function lightWaves(rc: RC, lt: number, alpha: number) {
  const { g, W, H } = rc;
  const sw = Math.round(W / 6);
  const sh = Math.round(H / 6);
  if (!waveCanvas) {
    waveCanvas = document.createElement("canvas");
    waveCanvas.width = sw;
    waveCanvas.height = sh;
  }
  const w = waveCanvas.getContext("2d")!;
  w.clearRect(0, 0, sw, sh);
  w.filter = `blur(${(sh / 26).toFixed(1)}px)`;
  w.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    w.beginPath();
    for (let x = -10; x <= sw + 10; x += 4) {
      const y = sh * (0.5 + (i - 1) * 0.18) + Math.sin(x * 0.03 + lt * (0.9 + i * 0.3) + i * 2) * sh * 0.12 + Math.sin(x * 0.011 - lt * 0.6) * sh * 0.08;
      if (x === -10) w.moveTo(x, y);
      else w.lineTo(x, y);
    }
    w.strokeStyle = `rgba(255,255,255,${0.32 - i * 0.08})`;
    w.lineWidth = sh * (0.05 + i * 0.03);
    w.stroke();
  }
  w.filter = "none";
  g.save();
  g.globalAlpha *= alpha;
  g.imageSmoothingQuality = "high";
  g.drawImage(waveCanvas, 0, 0, W, H);
  g.restore();
}

const tmp = new THREE.Vector3();

/**
 * Scene 4b (11–13 s): website and UI cards float in 3D depth with luminous
 * white borders; the camera dollies through them while focus racks from the
 * front card to the ones behind.
 */
export function drawCards(rc: RC, lt: number, opts: { hud?: boolean } = {}) {
  const { g, W, H, u } = rc;
  if (!world) world = build(rc);
  const { scene, camera, cards } = world;

  g.fillStyle = "#000";
  g.fillRect(0, 0, W, H);
  lightWaves(rc, lt + 11, 1);

  const camZ = lerp(10.5, 6.6, k(lt, -0.4, 2.4, "power1.inOut"));
  camera.position.set(Math.sin(lt * 0.35) * 0.9, Math.cos(lt * 0.3) * 0.35, camZ);
  camera.lookAt(0, 0, -4);
  camera.rotation.z += Math.sin(lt * 0.5) * 0.02;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();

  // rack focus: from the front card to the cards behind
  const focus = lerp(camZ - 0.2, camZ + 6.5, k(lt, 0.5, 1.6, "power2.inOut"));

  for (const c of cards) {
    const e = k(lt, -0.45 + c.delay, 0.55 + c.delay, "expo.out");
    const fly = (1 - e) * 26;
    c.mesh.position.set(c.home.x, c.home.y + Math.sin(lt * 1.1 + c.phase) * 0.12, c.home.z - fly);
    c.mesh.rotation.set(c.rot.x + Math.sin(lt * 0.7 + c.phase) * 0.05, c.rot.y + (1 - e) * 0.6, c.rot.z);
    tmp.copy(c.mesh.position);
    const dist = camera.position.distanceTo(tmp);
    c.mesh.renderOrder = -Math.round(dist * 100);
    const blur = clamp(Math.abs(dist - focus) * 0.0035, 0, 0.016);
    c.mesh.material.uniforms.uBlur.value = blur;
    c.mesh.material.uniforms.uOpacity.value = clamp(e * 1.4) * clamp((dist - 0.8) / 1.5);
    c.mesh.material.uniforms.uGlow.value = 1 - blur * 30;
  }

  rc.three.paint(g, scene, camera);

  const capA = k(lt, 0.3, 0.9) * (1 - k(lt, 1.85, 2.05));
  const pad = (rc.portrait ? 56 : 64) * u;
  text(g, COPY.cardsCaption, pad, H - pad - 44 * u, { size: 22 * u, weight: 500, track: 0.32, alpha: capA * 0.9 });
  if (opts.hud !== false) hud(rc, 1, 3);
}
