/**
 * Preview player for iterating on the piece: play / pause / scrub, jump to
 * scene labels, switch between 16:9 and 9:16. Keys: space = play/pause,
 * ←/→ = one frame, shift+←/→ = one second.
 */
import { T } from "./config";
import { createMotion } from "./engine";

const params = new URLSearchParams(location.search);
const vertical = params.get("format") === "v";
const [W, H] = vertical ? [1080, 1920] : [1920, 1080];

const canvas = document.getElementById("stage") as HTMLCanvasElement;
const wrap = document.getElementById("wrap")!;
const playBtn = document.getElementById("play") as HTMLButtonElement;
const scrub = document.getElementById("scrub") as HTMLInputElement;
const tc = document.getElementById("tc")!;
const format = document.getElementById("format") as HTMLSelectElement;
const labels = document.getElementById("labels")!;

wrap.classList.toggle("portrait", vertical);
format.value = vertical ? "v" : "h";
format.onchange = () => {
  params.set("format", format.value);
  location.search = params.toString();
};

const motion = createMotion(canvas, W, H);
(window as unknown as { seek: (t: number) => void }).seek = motion.seek;
scrub.max = String(motion.duration);

// the vertical cut has a soundtrack (npm run audio); keep it in sync with the clock
const tracks = vertical ? ["music", "sfx"].map((n) => new Audio(`/assets/audio/${n}.wav`)) : [];
const syncAudio = () => {
  for (const a of tracks) {
    if (Math.abs(a.currentTime - time) > 0.05) a.currentTime = time;
    if (playing && a.paused) a.play().catch(() => {});
    if (!playing && !a.paused) a.pause();
  }
};

let time = Number(params.get("t") ?? 0);
let playing = false;
let lastNow = 0;

const show = () => {
  motion.seek(time);
  scrub.value = String(time);
  tc.textContent = `${time.toFixed(2)} s · f${Math.round(time * motion.fps)}`;
};

const loop = (now: number) => {
  if (playing) {
    time += (now - lastNow) / 1000;
    if (time >= motion.duration) {
      time = 0; // loop like the website video
      for (const a of tracks) a.currentTime = 0;
    }
    show();
  }
  lastNow = now;
  requestAnimationFrame(loop);
};

const toggle = () => {
  playing = !playing;
  playBtn.textContent = playing ? "Pause" : "Play";
  syncAudio();
};
playBtn.onclick = toggle;
scrub.oninput = () => {
  time = Number(scrub.value);
  show();
  syncAudio();
};
addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    toggle();
  }
  const step = e.shiftKey ? 1 : 1 / motion.fps;
  if (e.code === "ArrowRight") time = Math.min(motion.duration, time + step);
  if (e.code === "ArrowLeft") time = Math.max(0, time - step);
  if (e.code.startsWith("Arrow")) {
    show();
    syncAudio();
  }
});

for (const [name, at] of Object.entries(T)) {
  const b = document.createElement("button");
  b.textContent = name;
  b.onclick = () => {
    time = at;
    show();
  };
  labels.append(b);
}

motion.ready.then(() => {
  show();
  requestAnimationFrame(loop);
});
