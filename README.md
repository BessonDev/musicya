<p align="center">
  <img src="public/favicon.svg" alt="Musicya Logo" width="80" />
</p>

<h1 align="center">Musicya</h1>

<p align="center">
  <strong>Busca, previsualiza y descarga música MP3 en alta calidad.</strong>
  <br />
  App web moderna construida con React + TypeScript + Vite.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/react-^18.x-%236366f1?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/typescript-~5.6-%233178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/vite-^6.x-%23646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/zustand-^5.x-%23E34F26" alt="Zustand" />
  <img src="https://img.shields.io/badge/tailwind-^3.x-%2306B6D4?logo=tailwindcss" alt="Tailwind" />
  <br />
  <img src="https://img.shields.io/badge/vitest-^4.x-6E9F18?logo=vitest" alt="Vitest" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
</p>

---

## ✨ Características

- **Búsqueda inteligente** — Encuentra canciones por artista, título o álbum vía iTunes API.
- **Preview de 30s** — Reproduce fragmentos con Howler.js antes de descargar.
- **Calidad seleccionable** — Elige entre 192, 256 o 320 kbps.
- **Metadatos ID3** — Los archivos descargados incluyen título, artista, álbum, año, género y carátula embebida.
- **Interfaz oscura** — Diseño minimalista y moderno con Tailwind CSS.
- **Responsive** — Adaptado a mobile, tablet y desktop.

## 🚀 Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, TypeScript |
| Build | Vite 6 |
| Estado | Zustand 5 |
| UI | Tailwind CSS 3 |
| Audio | Howler.js |
| API | iTunes Search (proxy Vite) |
| Testing | Vitest + jsdom |

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/musicya-app.git
cd musicya-app

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`.

## 📋 Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Compilar para producción |
| `npm run preview` | Vista previa del build |
| `npm test` | Ejecutar tests unitarios |
| `npm run test:watch` | Tests en modo watch |

## 🏗️ Estructura

```
src/
├── components/
│   ├── search/      # Input, resultados, tarjetas
│   ├── player/      # Reproductor, controles
│   └── download/    # Selector calidad, botón descarga
├── hooks/           # useAudioPlayer, useDebounce
├── pages/           # HomePage
├── services/        # synkApi, downloadService, normalizer
├── stores/          # Zustand stores (search, player, download)
├── types/           # Interfaces TypeScript
└── utils/           # Funciones helper
```

## 🧪 Tests

```bash
npm test
```

Cobertura actual: **19 tests** (API, stores de búsqueda y reproductor).

## 🔮 Roadmap

- [x] Búsqueda por artista/título/álbum
- [x] Preview de audio (30s)
- [x] Descarga con calidad seleccionable
- [x] Metadatos ID3 + carátula embebida
- [x] Tests unitarios
- [ ] Modo offline / Service Worker
- [ ] Historial de descargas persistente
- [ ] Playlists y descarga por lote

## 📄 Licencia

MIT © 2026 — [Tu Nombre]
