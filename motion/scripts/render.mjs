/**
 * npm run render — full pipeline:
 *   1. vite build                  → build/nuven-motion.js
 *      node scripts/audio.mjs      → assets/audio/{music,sfx}.wav (vertical soundtrack)
 *   2. hyperframes render (16:9)   → renders/master-16x9.mp4   (lossless-ish master)
 *   3. hyperframes render (9:16)   → renders/master-9x16.mp4
 *   4. scripts/export.mjs          → out/* and ../public/video/*
 *
 * Flags: --only=h | --only=v (one format), --skip-render (re-export existing masters).
 * The Chromium HyperFrames uses defaults to the preinstalled Playwright one.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const flags = process.argv.slice(2);
const only = flags.find((f) => f.startsWith("--only="))?.split("=")[1];
const skip = flags.includes("--skip-render");

const shell = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const env = { ...process.env };
if (!env.HYPERFRAMES_BROWSER_PATH && existsSync(shell)) env.HYPERFRAMES_BROWSER_PATH = shell;
const run = (cmd) => {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { cwd: root, stdio: "inherit", env });
};

run("npx vite build");
run("node scripts/audio.mjs"); // soundtrack for the vertical cut
if (!skip) {
  if (only !== "v") run("npx hyperframes render . -q delivery -f 30 -o renders/master-16x9.mp4 --quiet");
  if (only !== "h") run("npx hyperframes render vertical -q delivery -f 30 -o renders/master-9x16.mp4 --quiet");
}
run("node scripts/export.mjs");
