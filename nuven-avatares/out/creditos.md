# Créditos y licencias — «Veinte años en esta calle» · Nuven Digital

## Voz en off
- **Locución:** ElevenLabs, voz «Anna — Conversational Helpful», generada por el cliente. Se entregó como `assets/voz.mp3` y **no se ha regenerado ni editado**.
- **Tratamiento para la mezcla:** `scripts/voice-master.sh` crea una copia (`assets/audio/voz-master.wav`) con un EQ suave (corte de graves a 80 Hz, −1,5 dB en 300 Hz y +1,5 dB de presencia en 3,2 kHz) y normalización a −16 LUFS. No se recorta ni se mueve nada.
- **Licencia, a revisar:** usar voces de ElevenLabs con fines comerciales exige tener un **plan de pago** activo al generar el audio. Con el plan gratuito no se permite uso comercial. Si se generó con el plan gratuito, hay que regenerarla con un plan de pago antes de publicar el vídeo.
- **Aviso en pantalla:** el vídeo muestra «Voz generada con IA» en la tarjeta final.

## Transcripción y sincronía
- **Whisper small** de OpenAI (licencia MIT), en versión ONNX de **sherpa-onnx** (Apache 2.0), ejecutado en local: `scripts/asr_chunks.py`.
- Solo se usó para comprobar y anclar el guion a la voz. No forma parte del vídeo.

## Música de fondo
- **Origen:** composición original **generada por código** en `scripts/music.mjs`. Es síntesis propia (piano eléctrico FM, bajo, pad, arpegio, bombo, shaker y palmas), sin samples ni grabaciones de terceros.
- **Estilo:** mínima y cálida, a 92 BPM.
  - En Re menor en la calle; casi en silencio en «La razón es sencilla»; con tensión dentro del móvil.
  - Sube a Re mayor cuando llega la web, se calla en «¿Y quién me la hace?» y entra el ritmo completo en «Nuven Digital».
  - Los 1,5 s finales, tras la voz, quedan en silencio.
- **Licencia:** obra propia de Nuven Digital, libre de derechos de terceros. Se puede usar en web, redes y anuncios sin atribución.

## Efectos de sonido
- **Origen:** generados por código en el mismo `scripts/music.mjs`: pasos, campanilla de puerta, teclas, pops de interfaz, swipes, whooshes de transición, golpe y campana del logo, timbre del teléfono y un ambiente de calle muy suave.
- **Licencia:** obra propia, libre de derechos de terceros.

## Mezcla
- Ducking automático de la música bajo la voz con el carve de `/hyperframes-audio` (HyperFrames).
- La mezcla final se normaliza a −14 LUFS (pico −2 dBTP) al exportar.

## Personajes
- **Mascota de Nuven Digital** (personaje de cinta blanca, 4 poses): imagen facilitada por el cliente. `scripts/cutout.py` la recortó con fondo transparente.
- **Martín, el competidor y el cliente:** stickmans dibujados en código (SVG). Son obra propia.

## Tipografía
- **Sora** (Jonathan Barnbrook y Julián Moncada), con licencia SIL Open Font License 1.1 (`assets/fonts/OFL-Sora.txt`).

## Logotipo
- «N» de cinta plegada y wordmark de Nuven Digital: propiedad de Nuven Digital. Vectores tomados de `src/components/brand-paths.ts` de la web.

## Software
- **HyperFrames (HeyGen):** composición, previsualización y render.
- **GSAP 3** (GreenSock, licencia «Standard No Charge»): animación.
- **FFmpeg:** codificación y sonoridad.
- **Dirección:** método de Lemo-Opuscar (MIT) para el tratamiento, el sonido y la revisión.
- **Actuación:** reglas de `ANIMATION_GUIDE.md` de Claude Animation Base (MIT). No se ha usado código ni personajes de ninguno de los dos proyectos.

## Contenido ficticio
- «Ferretería Martín», «Ferretería Nova», las reseñas, las estrellas, los precios y el mapa son **ejemplos ilustrativos** y llevan esa etiqueta en pantalla.
- No aparecen marcas reales.
