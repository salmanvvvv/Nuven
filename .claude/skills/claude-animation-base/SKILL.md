---
name: claude-animation-base
description: Hand-painted cartoon animation kit (p5.js + p5.brush) with the Clawd character, 31 acted emotions and an animation guide (storyboard, timing for the viewer, anticipation, transitions, review loop). Use when the user asks for a short hand-painted / watercolour cartoon, a character animation in that style, or wants the animation principles (timing, acting, "nothing is ever still") applied to another animation.
---

# Claude Animation Base

Vendored copy of [JohnHeibel/ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) (MIT, commit 0ac8bf2) in `kit/`. The README's 6.7 MB animated preview (`docs/emotions.webp`) is left out; the model sheets `docs/emotions.jpg` and `docs/views.jpg` are kept.

## Making a video with the kit

1. Read `kit/ANIMATION_GUIDE.md` in full before drawing anything. It holds the rules, the workflow and the engine API.
2. Copy `kit/` to a new project folder, for example `cp -r .claude/skills/claude-animation-base/kit <name>`. Never build inside the skill.
3. In that folder, run `npm install`. It needs Node, Chrome or Chromium, and ffmpeg. In cloud sessions, pass `--chrome=/opt/pw-browsers/chromium` to `render.mjs`, plus `--soft-gl` when there is no GPU.
4. Follow the guide's workflow:
   1. Write the storyboard in `src/scenes/`.
   2. Build the shots.
   3. Review contact sheets with `node render.mjs --sheet=...`.
   4. Render with `node render.mjs --clip --out=out/video.mp4`.

## Using only the principles

When the animation is built with something else (HyperFrames, GSAP, Three.js), apply the guide's sections **Timing: model the viewer**, **Alive**, **Transitions always** and **Animation principles**. Do not import the kit's code.

The guide says to do what the user asks even where it conflicts with the guide's own rules, such as no text or a hand-painted look.
