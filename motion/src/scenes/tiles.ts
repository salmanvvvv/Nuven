import * as THREE from "three";
import { COPY } from "../content";
import { glow, hud, text } from "../draw";
import type { RC } from "../types";
import { k, lerp } from "../util";

const N = 46;
const HALF = (N - 1) / 2;

interface TilesWorld {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  mesh: THREE.InstancedMesh;
  orb: THREE.Mesh;
  halo: THREE.Sprite;
  point: THREE.PointLight;
}

let world: TilesWorld | null = null;

function haloTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.2, "rgba(255,255,255,0.45)");
  gr.addColorStop(0.5, "rgba(255,255,255,0.08)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function build(rc: RC): TilesWorld {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 16, 42);
  const camera = new THREE.PerspectiveCamera(rc.portrait ? 58 : 34, rc.W / rc.H, 0.1, 200);

  const geo = new THREE.BoxGeometry(0.86, 1, 0.86);
  geo.translate(0, 0.5, 0);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.42, metalness: 0.25 });
  const mesh = new THREE.InstancedMesh(geo, mat, N * N);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const c = new THREE.Color(0.1, 0.1, 0.1);
  for (let i = 0; i < N * N; i++) mesh.setColorAt(i, c);
  scene.add(mesh);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x000000, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(8, 14, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.8);
  rim.position.set(-10, 6, -8);
  scene.add(rim);
  const point = new THREE.PointLight(0xffffff, 60, 16, 1.6);
  scene.add(point);

  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.42, 40, 24), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  scene.add(orb);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  halo.scale.set(5, 5, 1);
  scene.add(halo);

  return { scene, camera, mesh, orb, halo, point };
}

const m4 = new THREE.Matrix4();
const pos = new THREE.Vector3();
const quat = new THREE.Quaternion();
const scl = new THREE.Vector3();
const col = new THREE.Color();

function height(x: number, z: number, lt: number, amp: number) {
  const r = Math.hypot(x, z);
  const ring = 0.5 + 0.5 * Math.sin(r * 0.72 - lt * 4.4);
  const cross = Math.sin(x * 0.33 + lt * 2.1) * Math.cos(z * 0.29 - lt * 1.6);
  return 0.12 + amp * (ring * Math.exp(-r * 0.04) * 1.0 + 0.22 * cross);
}

/**
 * Scene 2 (3.2–6.05 s): the grid becomes a field of 3D tiles seen from
 * straight above; the camera tilts into perspective and orbits while a wave
 * ripples out from the light orb (the point of light from scene 1).
 */
export function drawTiles(rc: RC, lt: number) {
  const { g, W, H, u } = rc;
  if (!world) world = build(rc);
  const { scene, camera, mesh, orb, halo, point } = world;

  g.fillStyle = "#000";
  g.fillRect(0, 0, W, H);

  const amp = 2.0 * k(lt, 0.0, 1.4, "power2.out");
  for (let ix = 0; ix < N; ix++) {
    for (let iz = 0; iz < N; iz++) {
      const x = ix - HALF;
      const z = iz - HALF;
      const h = height(x, z, lt, amp);
      pos.set(x, 0, z);
      scl.set(1, Math.max(0.06, h), 1);
      m4.compose(pos, quat, scl);
      const i = ix * N + iz;
      mesh.setMatrixAt(i, m4);
      const crest = Math.max(0, (h - 0.55) / 1.9);
      const v = 0.07 + 0.75 * crest ** 1.6;
      mesh.setColorAt(i, col.setRGB(v, v, v));
    }
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  const oy = height(0, 0, lt, amp) + 1.3 + Math.sin(lt * 2.2) * 0.15;
  orb.position.set(0, oy, 0);
  halo.position.copy(orb.position);
  point.position.set(0, oy + 0.4, 0);

  // camera: top-down → perspective, slow orbit
  const tilt = k(lt, -0.1, 1.9, "power3.inOut");
  const elev = lerp(89.5, 33, tilt) * (Math.PI / 180);
  const az = (0.15 + lt * 0.22) + 0.5 * tilt;
  const dist = lerp(rc.portrait ? 40 : 30, rc.portrait ? 30 : 21, k(lt, -0.1, 2.6, "power2.out"));
  camera.position.set(Math.cos(elev) * Math.sin(az) * dist, Math.sin(elev) * dist, Math.cos(elev) * Math.cos(az) * dist);
  camera.up.set(0, 1, 0);
  camera.lookAt(0, 0.6, 0);
  camera.updateProjectionMatrix();

  rc.three.paint(g, scene, camera);

  // extra 2D glow so the orb blooms like the point of light it came from
  const p = orb.position.clone().project(camera);
  glow(g, (p.x * 0.5 + 0.5) * W, (-p.y * 0.5 + 0.5) * H, 140 * u, 0.35);

  const capA = k(lt, 0.5, 1.1) * (1 - k(lt, 2.45, 2.75));
  const pad = (rc.portrait ? 56 : 64) * u;
  text(g, COPY.tilesCaption, pad, H - pad - 44 * u, { size: 22 * u, weight: 500, track: 0.32, alpha: capA * 0.9 });
  hud(rc, 1, 1);
}
