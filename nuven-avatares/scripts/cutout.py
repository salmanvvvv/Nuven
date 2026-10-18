#!/usr/bin/env python3
"""Avatar sheet (2×2 poses on black) → four transparent PNG cut-outs in assets/avatars/.
Alpha from luminance, with enclosed dark areas (the eyes) kept opaque."""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
src = Image.open(ROOT / "assets/avatars/source-sheet.webp").convert("RGB")
a = np.asarray(src).astype(np.float32)
lum = a.mean(axis=2)
H, W = lum.shape
names = ["neutral", "point", "shrug", "crossed"]  # top-left, top-right, bottom-left, bottom-right
for i, name in enumerate(names):
    y0, x0 = (i // 2) * H // 2, (i % 2) * W // 2
    tile, rgb = lum[y0:y0 + H // 2, x0:x0 + W // 2], a[y0:y0 + H // 2, x0:x0 + W // 2]
    solid = tile > 40
    lab, n = ndimage.label(solid)
    sizes = ndimage.sum(solid, lab, range(1, n + 1))
    body = lab == (np.argmax(sizes) + 1)              # largest blob = the character
    body = ndimage.binary_closing(body, iterations=2)
    filled = ndimage.binary_fill_holes(body)           # eyes and tiny gaps stay opaque
    soft = np.clip((tile - 14) / 36, 0, 1)
    near = ndimage.binary_dilation(filled, iterations=3)
    alpha = np.where(filled, np.maximum(soft, ndimage.binary_erosion(filled, iterations=2)), soft * near)
    out = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    ys, xs = np.where(alpha > 0.02)
    pad = 12
    box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + pad, W // 2), min(ys.max() + pad, H // 2))
    img = Image.fromarray(out, "RGBA").crop(box)
    img.save(ROOT / f"assets/avatars/{name}.png", optimize=True)
    print(name, img.size, "feet at", box[3] - box[1])
