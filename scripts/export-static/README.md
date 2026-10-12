# Nuven Digital (versión estática)

Esta carpeta contiene **toda la web** lista para publicar: HTML, CSS, JavaScript, vídeos, imágenes, fuentes e iconos. No necesita Node.js ni ningún servidor especial.

## Estructura

```
index.html            Página principal
aviso-legal.html      Páginas legales
privacidad.html
cookies.html
css/styles.css        Todos los estilos
js/main.js            Animaciones, menú móvil, FAQ, cookies y formulario
fonts/                Tipografías (Sora y Geist)
videos/               Intro (intro-*) y vídeo de fondo del inicio (hero-*)
img/projects/         Capturas de las webs del portfolio
img/brand/            Logo original
img/og-image.png      Imagen al compartir en redes
favicon.ico, icon.svg, apple-icon.png, manifest.webmanifest
robots.txt, sitemap.xml
```

## Publicar

Sube el contenido de esta carpeta tal cual a tu repositorio u hosting:

- **GitHub Pages:** sube los archivos a un repositorio y activa *Settings → Pages* sobre la rama principal.
- **Netlify o Vercel:** arrastra la carpeta o conecta el repositorio; no hace falta comando de build.
- **Hosting tradicional:** súbela por FTP a la carpeta pública (`public_html`).

Para verla en local, ábrela con un servidor sencillo (los vídeos no cargan bien abriendo el archivo con doble clic):

```bash
npx serve .
# o: python3 -m http.server
```

## Formulario de contacto

Sin servidor no se pueden enviar emails directamente. Por defecto, al enviar el formulario se abre el programa de correo del visitante con el mensaje ya escrito para `nuvenndigitaal@gmail.com`.

Para recibir los mensajes sin que el visitante tenga que hacer nada más, crea un formulario gratuito en un servicio como [Formspree](https://formspree.io) y pega su URL en `js/main.js`:

```js
const FORM_ENDPOINT = "https://formspree.io/f/tu-codigo";
```

## Dominio

Las etiquetas para buscadores y redes sociales (`canonical`, Open Graph, `sitemap.xml`) usan `https://nuvendigital.com`. Si tu dominio es otro, búscalo y reemplázalo en los archivos `.html`, `sitemap.xml` y `robots.txt`.

## Cómo se genera

Esta carpeta se genera a partir del proyecto Next.js (`src/`) con `scripts/export-static/export.py`. Si cambias textos o diseño en el proyecto, vuelve a exportar en lugar de editar estos archivos a mano.
