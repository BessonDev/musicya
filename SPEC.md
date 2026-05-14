# Musicya App - SDD Specification

## 1. Project Overview

**Project**: musicya-app  
**Type**: Web Application (SPA)  
**Purpose**: Download music in MP3 format with metadata from streaming APIs  
**Target Users**: Users who want to download music for offline listening

## 2. Technical Stack

| Component | Technology |
|-----------|------------|
| Framework | Vite + React SPA |
| State Management | Zustand |
| Routing | React Router v7 |
| UI Components | Shadcn/ui + Tailwind CSS |
| Audio Playback | Howler.js |
| Metadata Writing | id3-writer + Web Workers |
| Search API | SYNK Radio |
| Metadata Fallback | MusicBrainz |

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         UI Layer                            │
│  ┌─────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Header  │  │   Main      │  │      Sidebar            │  │
│  │ Search  │  │   Results   │  │   (optional)            │  │
│  └─────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                      State Layer (Zustand)                   │
│  ┌────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ searchStore│  │ playerStore │  │  downloadStore       │  │
│  └────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                      Service Layer                           │
│  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ SearchAPI   │  │ DownloadService │  │ MetadataService │  │
│  │ (SYNK)      │  │ (quality audio) │  │ (ID3 writer)    │  │
│  └─────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    External APIs                             │
│         SYNK Radio          │        MusicBrainz            │
└─────────────────────────────┴───────────────────────────────┘
```

## 4. Functional Requirements

### 4.1 Búsqueda de Música

#### Requirement: Búsqueda por artista, título o álbum

El sistema DEBE permitir al usuario buscar música introduciendo texto que puede corresponderse con el nombre del artista, título de la canción, o nombre del álbum.

- **Input**: Campo de texto con debounce de 300ms
- **Trigger**: El usuario escribe y después de 300ms de inactividad se ejecuta la búsqueda
- **API**: SYNK Radio search endpoint

#### Requirement: Visualización de resultados

El sistema DEBE mostrar los resultados de búsqueda en un formato consistente:

- **Thumbnail**: Imagen del álbum (50x50px mínimo)
- **Título**: Nombre de la canción
- **Artista**: Nombre del artista
- **Duración**: Duración en formato mm:ss
- **Paginación**: Scroll infinito o botones de paginación

#### Requirement: Historial de búsquedas

El sistema DEBE guardar las últimas 10 búsquedas en localStorage:

- **Almacenamiento**: localStorage con clave `musicya-search-history`
- **Formato**: Array de strings (términos de búsqueda)
- **UI**: Mostrar historial al hacer click en el campo de búsqueda
- **Acción**: Click en elemento del historial ejecuta esa búsqueda

#### Scenario: Búsqueda exitosa

- **GIVEN** El usuario tiene conexión a internet
- **WHEN** El usuario escribe "Coldplay" en el campo de búsqueda y espera 300ms
- **THEN** Se muestran máximo 20 resultados con thumbnail, título, artista y duración
- **AND** El historial se actualiza con "Coldplay" al inicio del array

#### Scenario: Búsqueda sin resultados

- **GIVEN** El usuario escribe un término que no retorna resultados
- **WHEN** La API retorna un array vacío
- **THEN** Se muestra mensaje "No se encontraron resultados para '[término]'"

#### Scenario: Error de conexión

- **GIVEN** Sin conexión a internet o API no disponible
- **WHEN** La llamada a la API falla
- **THEN** Se muestra mensaje de error "Error de conexión. Intenta de nuevo."

---

### 4.2 Reproducción de Preview

#### Requirement: Player mini en cada resultado

El sistema DEBE incluir un control de reproducción en línea para cada resultado de búsqueda.

- **UI**: Icono de play/pause junto a cada resultado
- **Posición**: Izquierda del título de la canción
- **Estado inicial**: Icono de play

#### Requirement: Control de reproducción

El sistema DEBE permitir reproducir y pausar el preview de audio.

- **Play**: Inicia la reproducción del audio
- **Pause**: Detiene la reproducción
- **Un único audio**: Solo un preview puede reproducirse a la vez (al reproducir otro, el actual se detiene)

#### Requirement: Barra de progreso

El sistema DEBE mostrar el progreso de reproducción del audio.

- **Visualización**: Barra horizontal que se llena según avanza el tiempo
- **Clickeable**: El usuario puede hacer click en cualquier punto para mover la posición
- **Actualización**: Actualización cada 100ms durante reproducción

#### Requirement: Control de volumen

El sistema DEBE permitir ajustar el volumen del preview.

- **Rango**: 0% a 100%
- **UI**: Slider o icono con niveles
- **Default**: 70%

#### Scenario: Reproducir un preview

- **GIVEN** Un resultado de búsqueda con audio disponible
- **WHEN** El usuario hace click en el icono de play
- **THEN** El audio comienza a reproducirse
- **AND** El icono cambia a pause
- **AND** La barra de progreso comienza a llenarse

#### Scenario: Cambiar de preview mientras reproduce

- **GIVEN** Un preview reproduciéndose actualmente
- **WHEN** El usuario hace click en play de otro resultado
- **THEN** El primer audio se detiene
- **AND** El nuevo audio comienza a reproducirse
- **AND** El icono del anterior vuelve a play
- **AND** El nuevo icono muestra pause

#### Scenario: Error al cargar preview

- **GIVEN** El audio no está disponible o falla la carga
- **WHEN** Howler.js dispara evento de error
- **THEN** Se muestra tooltip "Preview no disponible"
- **AND** El icono permanece deshabilitado

---

### 4.3 Descarga con Calidad

#### Requirement: Selector de calidad

El sistema DEBE permitir al usuario elegir la calidad del archivo a descargar.

- **Opciones**: 192 kbps, 256 kbps, 320 kbps
- **UI**: Dropdown o grupo de radio buttons
- **Default**: 320 kbps
- **Persistencia**: Guardar preferencia en localStorage

#### Requirement: Proceso de descarga

El sistema DEBE descargar el archivo de audio en la calidad seleccionada.

- **Nombre del archivo**: "Artista - Título.mp3" (sanitizar caracteres especiales)
- **Formato**: MP3
- **Origen**: URL del audio de SYNK Radio API

#### Requirement: Progress de descarga

El sistema DEBE mostrar el progreso de la descarga.

- **Visualización**: Barra de progreso con porcentaje
- **Update**: Actualización cada 500ms
- **States**: idle, downloading, completed, error

#### Scenario: Descarga exitosa

- **GIVEN** El usuario seleccionó calidad y hace click en descargar
- **WHEN** La descarga completa exitosamente
- **THEN** El navegador inicia la descarga del archivo
- **AND** El nombre del archivo es "Artista - Título.mp3"
- **AND** Se muestra toast "Descarga completada"

#### Scenario: Descarga interrumpida

- **GIVEN** La descarga está en progreso
- **WHEN** Se perde la conexión o el usuario cancela
- **THEN** Se muestra mensaje "Descarga interrumpida"
- **AND** Los archivos parciales se limpian

#### Scenario: Sin audio disponible para descarga

- **GIVEN** El resultado no tiene audio disponible
- **WHEN** El usuario hace click en descargar
- **THEN** Se muestra mensaje "Audio no disponible para descarga"

---

### 4.4 Metadatos ID3

#### Requirement: Escritura de metadatos

El sistema DEBE escribir tags ID3 en el archivo MP3 descargado.

- **Tags requeridos**: título, artista, álbum, año, género, número de pista
- **Library**: id3-writer
- **Procesamiento**: Web Worker (no bloquear UI)

#### Requirement: Cover art embebido

El sistema DEBE incluir la carátula del álbum en los metadatos.

- **Fuente**: URL de cover de SYNK Radio API o MusicBrainz fallback
- **Formato**: JPEG/PNG
- **Tamaño**: Original preservado
- **Position**: ID3 front cover

#### Scenario: Metadatos escritos correctamente

- **GIVEN** Audio descargado y metadata disponible
- **WHEN** El Web Worker termina de escribir los tags
- **THEN** El archivo MP3 contiene: título, artista, álbum, año, género, track number, y cover art

#### Scenario: Cover art no disponible

- **GIVEN** La API no retorna cover art
- **WHEN** Se intenta obtener la carátula
- **THEN** Se usa MusicBrainz como fallback
- **AND** Si ninguna fuente tiene cover, se omite el campo

#### Scenario: Error en Web Worker

- **GIVEN** El Web Worker falla al escribir metadatos
- **WHEN** El worker reporta error
- **THEN** Se muestra warning "No se pudieron escribir metadatos"
- **AND** El archivo se descarga sin tags ID3

---

## 5. Non-Functional Requirements

### 5.1 Bundle Size

- **Requisito**: El bundle de la aplicación DEBE ser menor a 200KB gzipped
- **Exclusión**: Libraries externas (Howler.js, React, etc.)
- **Optimización**: Code splitting, lazy loading de componentes no esenciales

### 5.2 Performance

| Métrica | Requisito |
|---------|-----------|
| Tiempo de respuesta búsqueda | < 2 segundos |
| Tiempo de carga del preview | < 1 segundo |
| Time to Interactive (TTI) | < 3 segundos |

### 5.3 UI/UX Requirements

- **Theme**: Dark mode por defecto
- **Diseño**: Minimalista, sin elementos innecesarios
- **Responsive**: Mobile-first con breakpoints en 640px, 768px, 1024px

### 5.4 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 6. Edge Cases

| Edge Case | Manejo |
|-----------|--------|
| Búsqueda con caracteres especiales | Sanitizar input, escapar caracteres dangerous |
| Resultados con caracteres no ASCII | Soporte UTF-8 completo en títulos y artistas |
| Audio con duración 0 o inválida | Mostrar "--:--" y deshabilitar preview |
| Cover art muy grande (>5MB) | Redimensionar a máximo 1000x1000px |
| API de SYNK no disponible | Mostrar error, opción de reintentar |
| Rate limiting de API | Implementar retry con backoff exponencial |
| Descarga cancelada por usuario | Limpiar recursos, mostrar estado idle |
| Nombre de archivo demasiado largo | Truncar a 200 caracteres máximo |
| Metadatos con caracteres inválidos para ID3 | Limpiar caracteres no permitidos |

---

## 7. Acceptance Criteria

### Búsqueda

- [ ] El debounce de 300ms funciona correctamente
- [ ] La búsqueda retorna resultados de artista, título y álbum
- [ ] Los resultados muestran thumbnail, título, artista, duración
- [ ] El historial guarda las últimas 10 búsquedas
- [ ] El historial es accesible y funcional
- [ ] Manejo de errores de red funciona

### Reproducción

- [ ] Cada resultado tiene control de play/pause
- [ ] Solo un audio reproduce a la vez
- [ ] La barra de progreso se actualiza y es clickeable
- [ ] El control de volumen funciona (0-100%)
- [ ] Los errores de carga muestran feedback apropiado

### Descarga

- [ ] El selector de calidad muestra las 3 opciones
- [ ] La preferencia se guarda en localStorage
- [ ] La barra de progreso muestra el avance
- [ ] El archivo se nombra correctamente como "Artista - Título.mp3"
- [ ] La descarga inicia automáticamente al completarse

### Metadatos

- [ ] Los tags ID3 se escriben correctamente (título, artista, álbum, año, género, track)
- [ ] El cover art se embebe cuando está disponible
- [ ] El procesamiento no bloquea la UI (Web Worker)
- [ ] El fallback a MusicBrainz funciona cuando SYNK no tiene cover
- [ ] Los errores de escritura muestran warning pero permiten descarga

---

## 8. Component Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Search input + logo
│   │   ├── MainContent.tsx     # Results grid/list
│   │   └── Sidebar.tsx         # Optional: filters
│   ├── search/
│   │   ├── SearchInput.tsx     # Input con debounce
│   │   ├── SearchResults.tsx   # Results container
│   │   ├── ResultCard.tsx      # Individual result
│   │   └── SearchHistory.tsx   # Historial dropdown
│   ├── player/
│   │   ├── MiniPlayer.tsx      # Inline play button
│   │   ├── ProgressBar.tsx     # Audio progress
│   │   └── VolumeControl.tsx   # Volume slider
│   ├── download/
│   │   ├── QualitySelector.tsx # 192/256/320 kbps
│   │   ├── DownloadButton.tsx  # Trigger download
│   │   └── ProgressIndicator.tsx
│   └── ui/                     # Shadcn components
├── stores/
│   ├── useSearchStore.ts       # Zustand: búsqueda
│   ├── usePlayerStore.ts       # Zustand: reproducción
│   └── useDownloadStore.ts     # Zustand: descarga
├── services/
│   ├── synkApi.ts              # SYNK Radio API
│   ├── musicBrainzApi.ts       # MusicBrainz fallback
│   ├── downloadService.ts      # Audio download
│   └── metadataService.ts      # ID3 writer
├── workers/
│   └── metadataWorker.ts       # Web Worker para ID3
├── hooks/
│   ├── useDebounce.ts
│   ├── useAudioPlayer.ts
│   └── useLocalStorage.ts
├── types/
│   └── index.ts                # TypeScript interfaces
└── App.tsx
```

---

## 9. API Contracts

### SYNK Radio - Search

```
GET /search?q={query}
Response: {
  results: [{
    id: string,
    title: string,
    artist: string,
    album: string,
    duration: number, // segundos
    preview_url: string,
    cover_url: string,
    year: number,
    genre: string
  }]
}
```

### SYNK Radio - Download

```
GET /download/{trackId}?quality={192|256|320}
Response: Binary MP3 stream
```

### MusicBrainz - Cover Art

```
GET /ws/2/release/?query=artist:{artist}+recording:{title}&fmt=json
Response: {
  releases: [{
    id: string,
    images: [{ image_url, front }]
  }]
}
```