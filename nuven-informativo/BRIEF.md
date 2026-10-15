---
workflow: faceless-explainer
flow: automation
storyboard: yes
message: "Muchos pequeños negocios siguen sin web, y cuando alguien te busca tu web es tu primera impresión — Nuven Digital la diseña a medida."
destination: website-and-social
aspect: 1920x1080
language: es-ES
audience: "Dueños de pequeños negocios y autónomos (España)"
length: 58-60s
angle: concept
---

## Intent

Vídeo informativo de 50-60 s que educa primero (≈80 %: cuántos negocios tienen o no web y por qué importa) y promociona al final (≈20 %: Nuven Digital + «Hablemos de tu proyecto»). Tono profesional, cercano y directo, sin exageraciones ni promesas milagro.

## Assets

- ../public/brand/logo-original.jpg — logo Nuven Digital (la «N» de cinta plegada; paths vectoriales en ../src/components/brand-paths.ts)
- content/datos.md — cifras verificadas con fuente (regla: ninguna cifra sin fuente en pantalla)
- content/guion.md — guion final con tiempos por escena

## Customizations

- Estilo luxury minimal monocromo: negro #000/#0A0A0A, blanco y grises, sin acentos de color. Sora, etiquetas en mayúsculas con tracking amplio.
- Motivos: rejilla fina con haz de luz, contadores, barras y anillos, la cinta de la N en transiciones y cierre, grano y viñeta sutiles.
- Gráficos: «con web» / «sin web» por etiqueta, posición, tono (blanco/gris) y tamaño, nunca solo por color.
- Voz en off es-ES, tono seguro y cercano; música instrumental minimalista/electrónica suave libre de derechos o generada; ducking, fundidos, -14 LUFS; SFX sutiles.
- Subtítulos quemados + .srt; texto en pantalla con la palabra principal resaltada.
- Versión 9:16 1080x1920 con márgenes seguros.

## Notes

- Fases con aprobación: (1) datos + guion → enseñar; (2) voz + música, ajustar tiempos a la voz real; (3) escenas + preview/check/snapshot; (4) render 16:9 y 9:16 y revisión.
- Contacto y datos propios como [PLACEHOLDER].
- Sin claves de HeyGen/ElevenLabs: voz con TTS local (Kokoro); música generada; documentar en content/creditos.md.
- MP4 H.264 16:9 < 15 MB.
