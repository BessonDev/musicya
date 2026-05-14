# Tasks: Musicya App - Descarga de Música MP3

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1200 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Setup + Tipos + Stores + APIs | PR 1 | Base foundation |
| 2 | UI Búsqueda + Player | PR 2 | Depende de PR 1 |
| 3 | UI Descarga + Metadatos + Testing | PR 3 | Depende de PR 2 |

---

## Phase 1: Infraestructura y Base

- [ ] 1.1 Inicializar proyecto Vite + React + TypeScript: `npm create vite@latest . --template react-ts`
- [ ] 1.2 Instalar dependencias principales: `npm install zustand react-router-dom howler id3-writer`
- [ ] 1.3 Instalar dependencias UI: `npm install -D tailwindcss postcss autoprefixer && npx shadcn-ui@latest init`
- [ ] 1.4 Configurar `tailwind.config.js` y `postcss.config.js` con paths de Shadcn
- [ ] 1.5 Crear estructura de carpetas: `src/{components,stores,services,hooks,types,utils,workers}`
- [ ] 1.6 Definir tipos en `src/types/index.ts`: Track, SearchResult, DownloadQuality, PlayerState, SearchHistory
- [ ] 1.7 Crear Zustand store para búsqueda: `src/stores/useSearchStore.ts` (query, results, history, loading)
- [ ] 1.8 Crear Zustand store para player: `src/stores/usePlayerStore.ts` (currentTrack, isPlaying, volume, progress)
- [ ] 1.9 Crear Zustand store para descarga: `src/stores/useDownloadStore.ts` (queue, current, progress, quality)

---

## Phase 2: Integración de APIs

- [ ] 2.1 Implementar `src/services/synkApi.ts`: búsqueda por query, obtención de stream URL, manejo de errores
- [ ] 2.2 Implementar `src/services/musicBrainzApi.ts`: búsqueda de metadatos, cover art, artista
- [ ] 2.3 Crear cliente HTTP base con interceptores para rate limiting (configurar delays entre requests)
- [ ] 2.4 Implementar servicio de normalización: mapear respuesta de SYNK a tipo Track interno
- [ ] 2.5 Crear cache simple en memoria para resultados de búsqueda (evitar re-fetching)

---

## Phase 3: UI - Búsqueda

- [x] 3.1 Crear componente `SearchInput.tsx` con debounce 300ms usando useDeferredValue
- [x] 3.2 Crear `SearchResults.tsx`: grid layout con ResultCard para cada track
- [x] 3.3 Crear `ResultCard.tsx`: thumbnail, título, artista, botón de preview, botón de descarga
- [x] 3.4 Implementar `SearchHistory.tsx`: dropdown con últimos 10 queries,persistencia en localStorage
- [x] 3.5 Integrar componentes en página principal `/`: SearchInput + Results + History
- [x] 3.6 Agregar estado de loading (skeleton) y empty state

---

## Phase 4: UI - Player

- [x] 4.1 Crear `MiniPlayer.tsx`: fixed bottom bar con track info, controls, progress
- [x] 4.2 Integrar Howler.js en hook `useAudioPlayer.ts`: load, play, pause, seek, volume
- [x] 4.3 Implementar `ProgressBar.tsx`: draggable seek, time display (current/total)
- [x] 4.4 Implementar `VolumeControl.tsx`: slider con mute toggle
- [x] 4.5 Asegurar solo un track reproduciéndose a la vez (cleanup on unmount)
- [x] 4.6 Conectar MiniPlayer con usePlayerStore para estado reactivo

---

## Phase 5: UI - Descarga

- [ ] 5.1 Crear `QualitySelector.tsx`: dropdown (192/256/320 kbps), persistencia de preferencia
- [ ] 5.2 Crear `DownloadButton.tsx`: iniciar descarga, deshabilitar si ya descargando
- [ ] 5.3 Implementar `DownloadProgress.tsx`: progress bar con porcentaje, velocidad
- [ ] 5.4 Crear `DownloadQueue.tsx`: lista de descargas pendientes/en progreso
- [ ] 5.5 Integrar flujo completo: calidad → fetch audio → save blob → actualizar store

---

## Phase 6: Metadatos ID3

- [ ] 6.1 Crear Web Worker `src/workers/id3Worker.ts`: procesar metadata con id3-writer
- [ ] 6.2 Implementar `src/services/metadataService.ts`: orquestar fetch de metadatos desde MusicBrainz
- [ ] 6.3 Embed cover art en tag ID3 (base64 → buffer)
- [ ] 6.4 Integrar en flow de descarga: después de fetch audio → procesar metadata → generar blob final
- [ ] 6.5 Manejar errores gracefully: si falla metadata, continuar sin tags

---

## Phase 7: Testing

- [ ] 7.1 Unit tests para Zustand stores: acciones, selectors, estado inicial
- [ ] 7.2 Unit tests para servicios API: mocking fetch, manejo de errores, rate limiting
- [ ] 7.3 Unit tests para utils: debounce, normalización de datos
- [ ] 7.4 Integration tests para flujos: búsqueda → resultados → preview → descarga
- [ ] 7.5 Test de Web Worker: verificar escritura de tags ID3

---

## Phase 8: Limpieza y Polish

- [ ] 8.1 Agregar mensajes de error toast con Shadcn
- [ ] 8.2 Optimizar imágenes: lazy load thumbnails, placeholder genérico
- [ ] 8.3 Documentar componentes complejos con JSDoc
- [ ] 8.4 Cleanup de console.logs y código commented

---

## Dependencias entre Fases

```
Phase 1 (1.1-1.9) ─────┐
                        ├──> Phase 2 (2.1-2.5) ───┐
Phase 3 (3.1-3.6) ◄─────┤                          ├──> Phase 4 (4.1-4.6)
Phase 5 (5.1-5.5) ◄────────────────────────────────┤
Phase 6 (6.1-6.5) ◄─────────────────────────────────┤
Phase 7 (7.1-7.5) ◄──────────────────────────────────┤
Phase 8 (8.1-8.4) ◄───────────────────────────────────┘
```