import type { PostParams } from "./types";

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform float uBarrel, uBloom, uBloomThr, uVig, uGrain, uFrame, uZoom;
uniform vec2 uCenter, uDir;
in vec2 vUv;
out vec4 outColor;

// integer hash (no sin, no visible patterns)
float hash(vec2 p) {
  uvec2 q = uvec2(ivec2(p)) * uvec2(1597334673u, 3812015801u);
  uint n = (q.x ^ q.y) * 1597334673u;
  return float(n) * (1.0 / float(0xffffffffu));
}

vec2 lens(vec2 uv, float k) {
  float asp = uRes.x / uRes.y;
  vec2 p = uv - 0.5;
  p.x *= asp;
  float r2 = dot(p, p) / (0.25 * (asp * asp + 1.0));
  p *= 1.0 + k * r2;
  p.x /= asp;
  return p + 0.5;
}

vec3 tap(vec2 uv) {
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return vec3(0.0);
  return textureLod(uTex, uv, 0.0).rgb;
}

vec3 sampleScene(vec2 uv) {
  // chromatic split grows with the lens distortion
  float ca = clamp(abs(uBarrel) * 3.0, 0.0, 1.0) * 0.018;
  if (ca < 0.0005) return tap(lens(uv, uBarrel));
  return vec3(
    tap(lens(uv, uBarrel)).r,
    tap(lens(uv, uBarrel + ca)).g,
    tap(lens(uv, uBarrel + ca * 2.0)).b
  );
}

void main() {
  vec2 uv = vUv;
  vec3 col;
  if (uZoom > 0.0005 || dot(uDir, uDir) > 0.0000001) {
    // light motion blur: radial (zoom-through) + directional (wipes)
    col = vec3(0.0);
    for (int i = 0; i < 12; i++) {
      float f = float(i) / 11.0 - 0.5;
      vec2 suv = uv + (uv - uCenter) * f * uZoom + uDir * f;
      col += sampleScene(suv);
    }
    col /= 12.0;
  } else {
    col = sampleScene(uv);
  }

  // cheap bloom from the mip chain
  if (uBloom > 0.0) {
    vec2 luv = lens(uv, uBarrel);
    vec3 b = textureLod(uTex, luv, 3.0).rgb * 0.5 + textureLod(uTex, luv, 5.0).rgb * 0.35 + textureLod(uTex, luv, 6.5).rgb * 0.25;
    b = max(b - uBloomThr, 0.0) / (1.0 - uBloomThr);
    col += b * uBloom;
  }

  // vignette
  float asp = uRes.x / uRes.y;
  vec2 v = (uv - 0.5) * vec2(asp, 1.0) / sqrt(asp * asp + 1.0) * 2.0;
  col *= mix(1.0, smoothstep(1.15, 0.25, length(v)), uVig);

  // very subtle monochrome film grain
  float n = hash(gl_FragCoord.xy + vec2(uFrame * 113.0, uFrame * 271.0)) - 0.5;
  col += n * uGrain;

  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

export function createPost(canvas: HTMLCanvasElement, W: number, H: number) {
  canvas.width = W;
  canvas.height = H;
  const gl = canvas.getContext("webgl2", { preserveDrawingBuffer: true, antialias: false, alpha: false });
  if (!gl) throw new Error("WebGL2 not available");

  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "link");
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const U = (n: string) => gl.getUniformLocation(prog, n);
  const u = {
    tex: U("uTex"),
    res: U("uRes"),
    barrel: U("uBarrel"),
    bloom: U("uBloom"),
    thr: U("uBloomThr"),
    vig: U("uVig"),
    grain: U("uGrain"),
    frame: U("uFrame"),
    zoom: U("uZoom"),
    center: U("uCenter"),
    dir: U("uDir"),
  };
  gl.uniform1i(u.tex, 0);
  gl.uniform2f(u.res, W, H);
  gl.viewport(0, 0, W, H);

  return {
    render(source: HTMLCanvasElement, p: PostParams, frame: number) {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      if (p.bloom > 0) gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, p.bloom > 0 ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
      gl.uniform1f(u.barrel, p.barrel);
      gl.uniform1f(u.bloom, p.bloom);
      gl.uniform1f(u.thr, p.bloomThreshold);
      gl.uniform1f(u.vig, p.vignette);
      gl.uniform1f(u.grain, p.grain);
      gl.uniform1f(u.frame, frame % 997);
      gl.uniform1f(u.zoom, p.zoomBlur);
      gl.uniform2f(u.center, p.center[0], 1 - p.center[1]);
      gl.uniform2f(u.dir, p.dir[0], -p.dir[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}
