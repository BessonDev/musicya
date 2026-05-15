<p align="center">
  <img src="public/favicon.svg" alt="Musicya Logo" width="80" />
</p>

<h1 align="center">Musicya</h1>

<p align="center">
  <strong>Busca y descarga canciones completas en MP3 con metadatos incluidos.</strong>
  <br />
  App web full-stack: React + TypeScript frontend, Python/FastAPI backend con yt-dlp.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/react-^18.x-%236366f1?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/typescript-~5.6-%233178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/vite-^6.x-%23646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/python-3.12-%233776AB?logo=python" alt="Python" />
  <img src="https://img.shields.io/badge/fastapi-0.115-%23009688?logo=fastapi" alt="FastAPI" />
  <br />
  <img src="https://img.shields.io/badge/vitest-^4.x-6E9F18?logo=vitest" alt="Vitest" />
  <img src="https://img.shields.io/badge/docker-compose-%232496ED?logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
</p>

<img width="1897" height="1077" alt="music-ya1" src="https://github.com/user-attachments/assets/4dbf0f08-f298-4a47-a715-27cb94fedae7" />


---

## ✨ Características

- **Búsqueda inteligente** — Encuentra canciones por artista, título o álbum vía iTunes API (proxy por backend).
- **Preview de 30s** — Reproduce fragmentos con Howler.js antes de descargar.
- **Canciones completas** — Descarga la canción completa desde YouTube vía yt-dlp.
- **Calidad seleccionable** — Elige entre 128 o 320 kbps.
- **Metadatos ID3** — Los archivos descargados incluyen título, artista, álbum, año, género y carátula embebida.
- **Interfaz oscura** — Diseño minimalista y moderno con Tailwind CSS.
- **Responsive** — Adaptado a mobile, tablet y desktop.
- **Dockerizado** — Listo para deploy en Dokploy o cualquier VPS con Docker.

## 🚀 Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, TypeScript |
| Build | Vite 6 |
| Estado | Zustand 5 |
| UI | Tailwind CSS 3 |
| Audio | Howler.js |
| Backend | Python 3.12, FastAPI |
| Descargas | yt-dlp + FFmpeg + JS challenge solver |
| Metadatos | mutagen (ID3v2.3) |
| Proxy API | httpx (async iTunes client) |
| Deploy | Docker Compose + Nginx |
| Testing | Vitest + jsdom (frontend) |

## 📦 Instalación y desarrollo local

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

> Requiere [yt-dlp](https://github.com/yt-dlp/yt-dlp) y [FFmpeg](https://ffmpeg.org/) instalados en el sistema.
>
> **Windows:**
> ```bash
> winget install yt-dlp.yt-dlp
> winget install ffmpeg
> ```
>
> **Linux/macOS:**
> ```bash
> # Ubuntu/Debian
> sudo apt install yt-dlp ffmpeg
> # macOS
> brew install yt-dlp ffmpeg
> ```

### Frontend

```bash
npm install
npm run dev
```

La app estará disponible en `http://localhost:5173`. El frontend proxy automáticamente `/api` al backend en `localhost:8000`.

## 🐳 Deploy con Dokploy

### 1. Push a GitHub

```bash
git push origin main
```

### 2. Conectar en Dokploy

1. Crear un nuevo proyecto en Dokploy
2. Conectar el repositorio de GitHub
3. Seleccionar **Docker Compose** como tipo de deploy
4. Dokploy usa el `docker-compose.yml` del repositorio

Esto construye:
- **backend**: Python/FastAPI con yt-dlp + FFmpeg
- **frontend**: Multi-stage Dockerfile que buildea Vite y sirve con Nginx

La app queda accesible en el puerto `80`.

### Cookies de YouTube (necesarias)

YouTube bloquea yt-dlp automáticamente. Para descargar, el backend necesita cookies de una sesión logueada en YouTube.

**1. Exportar cookies desde el navegador**

Instalá una extensión como [cookies.txt](https://chrome.google.com/webstore/detail/cookies-txt/njabckikapfpffapmjgojcnbfjonfjfg) (Chrome) o [cookies.txt](https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/) (Firefox), andá a `youtube.com` logueado, y exportá las cookies. Guardalas como `cookies.txt` en la raíz del proyecto.

**2. Generar el base64**

```bash
# PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("cookies.txt"))

# Linux/macOS
base64 -w0 cookies.txt
```

**3. Setear en Dokploy**

Agregá la variable de entorno en tu servicio backend:

```
COOKIES_B64 = <el string base64>
```

**4. Actualizar cuando expiren**

Las cookies de sesión expiran. Cuando deje de funcionar, repetí los pasos 1-3 y reiniciá el stack en Dokploy.

### Alternativa: deploy manual con Docker Compose

```bash
# Build y levantar todo
docker compose up -d

# Ver logs
docker compose logs -f

# Detener
docker compose down
```

## 📋 Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Compilar frontend para producción |
| `npm run preview` | Vista previa del build |
| `npm test` | Ejecutar tests unitarios |
| `npm run test:watch` | Tests en modo watch |

## 🏗️ Estructura

```
musicya-app/
├── backend/                  # API Python/FastAPI
│   ├── main.py               # App entry point + CORS
│   ├── Dockerfile            # Python 3.12-slim + yt-dlp + ffmpeg
│   ├── requirements.txt
│   ├── routes/
│   │   ├── search.py         # GET /api/search (proxy iTunes)
│   │   └── download.py       # POST /api/download (yt-dlp + FFmpeg + tags)
│   ├── services/
│   │   ├── downloader.py     # yt-dlp + YouTube API + cookies + FFmpeg
│   │   └── metadata.py       # mutagen ID3 tags (incluye APIC cover)
│   └── models/
│       └── schemas.py        # Pydantic request/response models
├── src/                      # Frontend React
│   ├── components/
│   │   ├── search/           # Input, resultados, tarjetas
│   │   ├── player/           # Reproductor, controles
│   │   └── download/         # Selector calidad, botón descarga
│   ├── hooks/                # useAudioPlayer, useDebounce
│   ├── pages/                # HomePage
│   ├── services/             # synkApi, downloadService, normalizer
│   ├── stores/               # Zustand stores (search, player, download)
│   ├── types/                # Interfaces TypeScript
│   └── test/                 # Setup de tests
├── public/
│   ├── favicon.svg           # Icono de la app
│   ├── robots.txt            # Configuración de crawlers
│   └── sitemap.xml           # Mapa del sitio
├── nginx/
│   └── default.conf          # Nginx: proxy API + SPA fallback + caché
├── Dockerfile                # Multi-stage: build Vite + servir con Nginx
├── docker-compose.yml        # Backend + Frontend
└── .dockerignore
```

## 🔄 Pipeline de descarga

```
Frontend busca → Backend proxy iTunes API → resultados
Click "Descargar" → Backend recibe artista + título + calidad
  → YouTube Data API v3 search
  → yt-dlp con cookies + JS challenge solver (ejs:github)
  → FFmpeg transcodifica a MP3 (128/320 kbps)
  → mutagen escribe metadatos ID3 (título, artista, álbum, año, género, carátula)
  → Response del MP3 completo al frontend
Frontend → trigger download del archivo
```

## 🧪 Tests

```bash
npm test
```

Cobertura actual: **19 tests** (API, stores de búsqueda, stores de reproductor).

## 🔮 Roadmap

- [x] Búsqueda por artista/título/álbum
- [x] Preview de audio (30s)
- [x] Descarga con calidad seleccionable
- [x] Metadatos ID3 + carátula embebida
- [x] Backend Python/FastAPI con yt-dlp
- [x] Canciones completas (no solo previews)
- [x] Deploy Docker Compose + Dokploy
- [ ] Modo offline / Service Worker
- [ ] Historial de descargas persistente
- [ ] Playlists y descarga por lote

## 📄 Licencia

MIT © 2026
