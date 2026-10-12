import * as THREE from "three";

/**
 * One shared WebGL renderer for every 3D scene. Each scene renders into it and
 * the result is copied into the 2D compositing canvas, so 3D layers can be
 * masked, wiped and overlaid like any other 2D layer.
 */
export class ThreeLayer {
  readonly renderer: THREE.WebGLRenderer;
  readonly canvas: HTMLCanvasElement;

  constructor(
    readonly W: number,
    readonly H: number,
  ) {
    this.canvas = document.createElement("canvas");
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(W, H, false);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  /** Render `scene` and paint it onto the 2D context. */
  paint(g: CanvasRenderingContext2D, scene: THREE.Scene, camera: THREE.Camera, alpha = 1) {
    this.renderer.clear();
    this.renderer.render(scene, camera);
    g.save();
    g.globalAlpha *= alpha;
    g.drawImage(this.canvas, 0, 0);
    g.restore();
  }
}
