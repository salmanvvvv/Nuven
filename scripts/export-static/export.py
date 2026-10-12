"""
Exporta la web a una carpeta estática (HTML + CSS + JS + vídeos + imágenes),
lista para subir a cualquier repositorio u hosting sin Next.js.

Uso (desde la raíz del proyecto, con `npm run build` hecho y `npm run start` en marcha):
    python3 scripts/export-static/export.py http://localhost:3000 TODO

Requiere Python 3 con beautifulsoup4.
"""

import glob
import json
import re
import shutil
import sys
import urllib.request
from pathlib import Path

from bs4 import BeautifulSoup

SERVER = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "http://localhost:3000"
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else "TODO")
ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent

PAGES = {"/": "index.html", "/aviso-legal": "aviso-legal.html", "/privacidad": "privacidad.html", "/cookies": "cookies.html"}


def fetch(path: str) -> bytes:
    with urllib.request.urlopen(SERVER + path) as r:
        return r.read()


# ---------- carpeta limpia ----------
if OUT.exists():
    shutil.rmtree(OUT)
for d in ("css", "js", "fonts", "videos", "img/projects", "img/brand"):
    (OUT / d).mkdir(parents=True, exist_ok=True)

# ---------- CSS + fuentes ----------
css_file = glob.glob(str(ROOT / ".next/static/chunks/*.css"))[0]
css = Path(css_file).read_text()


def font(m: re.Match) -> str:
    name = m.group(1)
    clean = re.sub(r"\.[a-z0-9_-]+\.woff2$", ".woff2", name)  # quita el hash de Next
    shutil.copy(ROOT / ".next/static/media" / name, OUT / "fonts" / clean)
    return f"url(../fonts/{clean})"


css = re.sub(r"url\(\.\./media/([^)]+\.woff2)\)", font, css)
css += """
/* --- versión estática: animación de aparición al hacer scroll --- */
[data-reveal]{transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1),filter .8s cubic-bezier(.16,1,.3,1)}
.rv-pre{opacity:0;transform:translateY(18px);filter:blur(6px)}
"""
(OUT / "css/styles.css").write_text(css)

# ---------- JS ----------
shutil.copy(HERE / "main.js", OUT / "js/main.js")

# ---------- recursos ----------
for f in (ROOT / "public/intro").iterdir():
    shutil.copy(f, OUT / "videos" / f.name)
for f in (ROOT / "public/projects").iterdir():
    shutil.copy(f, OUT / "img/projects" / f.name)
for f in (ROOT / "public/brand").iterdir():
    shutil.copy(f, OUT / "img/brand" / f.name)
for name in ("icon.svg", "apple-icon.png", "favicon.ico"):
    shutil.copy(ROOT / "src/app" / name, OUT / name)
(OUT / "img/og-image.png").write_bytes(fetch("/opengraph-image"))

# URL pública (la que se configuró en NEXT_PUBLIC_SITE_URL al hacer el build)
sitemap = fetch("/sitemap.xml").decode()
site_url = re.search(r"<loc>(.*?)/?</loc>", sitemap).group(1).rstrip("/")
(OUT / "sitemap.xml").write_text(
    re.sub(r"<loc>(.*?)</loc>", lambda m: "<loc>" + (m.group(1).rstrip("/") + ".html" if not m.group(1).rstrip("/") == site_url else site_url + "/") + "</loc>", sitemap)
)
(OUT / "robots.txt").write_text(fetch("/robots.txt").decode())
manifest = json.loads(fetch("/manifest.webmanifest"))
for icon in manifest.get("icons", []):
    icon["src"] = icon["src"].lstrip("/")
manifest["start_url"] = "index.html"
(OUT / "manifest.webmanifest").write_text(json.dumps(manifest, ensure_ascii=False, indent=2))


# ---------- páginas ----------
def rel_link(href: str, on_index: bool) -> str:
    if href.startswith("/#"):
        return href[1:] if on_index else "index.html" + href[1:]
    if href == "/":
        return "index.html"
    if href in PAGES:
        return PAGES[href]
    return href


for route, filename in PAGES.items():
    soup = BeautifulSoup(fetch(route).decode(), "html.parser")
    head, body = soup.head, soup.body
    on_index = filename == "index.html"

    # head: fuera todo lo de Next salvo metadatos, el script de la intro y los datos estructurados
    for tag in head.find_all(["link", "script", "style", "noscript"]):
        if tag.name == "script" and (tag.get("type") == "application/ld+json" or "intro-active" in (tag.string or "")):
            continue
        if tag.name == "link" and "canonical" in (tag.get("rel") or []):
            continue
        tag.decompose()
    for meta in head.find_all("meta", content=True):
        meta["content"] = re.sub(r"/opengraph-image(\?[^\"]*)?$", "/img/og-image.png", meta["content"])
        meta["content"] = re.sub(r"/twitter-image(\?[^\"]*)?$", "/img/og-image.png", meta["content"])
    for attrs in (
        {"rel": "icon", "href": "favicon.ico", "sizes": "any"},
        {"rel": "icon", "href": "icon.svg", "type": "image/svg+xml"},
        {"rel": "apple-touch-icon", "href": "apple-icon.png"},
        {"rel": "manifest", "href": "manifest.webmanifest"},
        {"rel": "stylesheet", "href": "css/styles.css"},
    ):
        head.append(soup.new_tag("link", attrs=attrs))
    js = soup.new_tag("script", src="js/main.js", defer="")
    head.append(js)

    # body: fuera los scripts de React/Next
    for tag in body.find_all(["script", "template", "next-route-announcer"]):
        if tag.get("type") == "application/ld+json":
            continue
        tag.decompose()

    # aparición al hacer scroll (el contenido queda visible si no hay JS)
    for t in body.find_all(style=re.compile(r"opacity:0;filter:blur\(6px\)")):
        del t["style"]
        t["data-reveal"] = ""
    # "N" del inicio
    for t in body.find_all("path", style=True):
        t["data-bar"] = "up" if "translateY(10px)" in t["style"] else "down"
        t["style"] = "transform-origin:50% 50%;transform-box:fill-box"
    mask = body.find("mask")
    if mask and mask.find("rect"):
        mask.find("rect")["width"] = "120"
        mask.find("rect")["data-ribbon-mask"] = ""
    mark = body.find("svg", attrs={"viewbox": "-6 -6 112 92"})
    if mark:
        mark.parent["id"] = "hero-tilt"
    for t in body.find_all(style="transform:scaleY(0)"):
        t["data-progress"] = "y"
    for t in body.find_all(style="transform:scaleX(0)"):
        t["data-progress"] = "x"

    # imágenes y vídeos
    for img in body.find_all("img"):
        m = re.search(r"url=%2Fprojects%2F([^&]+)", img.get("src", ""))
        if m:
            img["src"] = f"img/projects/{m.group(1)}"
            for a in ("srcset", "sizes"):
                img.attrs.pop(a, None)
    for src in body.select("video source"):
        src["src"] = "videos/" + src["src"].split("/")[-1]

    for a in soup.find_all("a", href=True):
        a["href"] = rel_link(a["href"], on_index)

    html = "<!DOCTYPE html>\n" + str(soup)
    html = html.replace(site_url + "/brand/", site_url + "/img/brand/")
    (OUT / filename).write_text(html)
    print("ok", filename)

shutil.copy(HERE / "README.md", OUT / "README.md")
print("Exportado en", OUT)
