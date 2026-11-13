# Netflix clone

Catálogo de series y películas con la experiencia de Netflix, construido con React 19, TypeScript y Vite. Los datos e imágenes vienen de [TMDB](https://www.themoviedb.org).

## Funcionalidades

- **Billboard** con el logo oficial del título, clasificación por edad, "% para ti" y efecto Ken Burns.
- **Filas tipo carrusel** con scroll nativo (touch, trackpad y teclado), `scroll-snap`, flechas que avanzan una página completa e indicadores de página. Variantes Top 10 (números gigantes) y pósters ("Solo en Netflix").
- **Vista previa al pasar el mouse** que crece desde la tarjeta, con acciones (reproducir, Mi lista, me gusta, más información).
- **Modal de detalles** (`<dialog>` nativo): tráiler de YouTube, duración/temporadas, elenco, géneros y títulos recomendados.
- **Secciones** Inicio, Series, Películas, Novedades populares y **Mi lista** (persistida en `localStorage`).
- **Búsqueda** con debounce y cancelación de peticiones obsoletas.
- **SEO**: título y descripción por vista, Open Graph/Twitter cards, JSON-LD, `robots.txt`, manifest PWA, favicons SVG/ICO/PNG.
- Skeletons de carga, mensajes de error amigables con reintento, `prefers-reduced-motion` y navegación por teclado.

## Requisitos

- Node.js 22.12 o superior
- Una API key de TMDB (gratuita): <https://www.themoviedb.org/settings/api>

## Puesta en marcha

```bash
cp .env.example .env.local   # y completa VITE_TMDB_API_KEY
npm install
npm run dev                  # http://localhost:5173
```

| Variable             | Descripción                                                                  |
| -------------------- | ---------------------------------------------------------------------------- |
| `VITE_TMDB_API_KEY`  | API key v3 de TMDB (obligatoria).                                            |
| `VITE_TMDB_LANGUAGE` | Idioma de títulos y sinopsis (por defecto `es-MX`).                          |
| `VITE_SITE_URL`      | URL pública sin `/` final; activa `canonical`, `og:url` y `og:image` absolutos. |

## Scripts

| Comando             | Qué hace                                  |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Servidor de desarrollo con HMR.           |
| `npm run build`     | Typecheck + build de producción en `dist`. |
| `npm run preview`   | Sirve el build de producción.             |
| `npm test`          | Tests con Vitest y Testing Library.       |
| `npm run typecheck` | Solo verificación de tipos.               |

## Despliegue

Cada push a `master` ejecuta `.github/workflows/deploy.yml`: corre los tests, compila con la ruta base de GitHub Pages y publica en <https://bue221.github.io/netflix-clone/>. Requiere el secret `VITE_TMDB_API_KEY` en el repositorio y Pages configurado con la fuente "GitHub Actions".

La key de TMDB v3 queda embebida en el bundle del navegador (así funciona la API desde el cliente), así que usa una key exclusiva para este sitio.

## Arquitectura

```
src/
  config/        variables de entorno tipadas
  domain/        modelo Title y utilidades puras (formatos, géneros)
  services/
    tmdb/        cliente HTTP (timeout, reintentos, errores tipados) y mapeadores
    catalog/     definiciones declarativas de cada sección y servicio de catálogo
  state/         Mi lista (useSyncExternalStore) y acciones de título (contexto)
  hooks/         carga asíncrona cancelable, scroll, debounce, metadatos SEO
  components/    UI (Navbar, Billboard, Row, TitleCard, DetailModal, ...)
  pages/         Browse, Search y MyList
```

Para agregar una fila o sección basta con editar `src/services/catalog/definitions.ts`; los componentes no cambian.

> Proyecto de estudio sin fines comerciales. Netflix es una marca registrada de Netflix, Inc. Este producto usa la API de TMDB pero no está avalado ni certificado por TMDB.
