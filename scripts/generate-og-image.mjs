/**
 * Genera og-image.png a partir de public/og-image.svg
 * Se ejecuta automáticamente antes de cada build (prebuild)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const svgPath = resolve(root, 'public', 'og-image.svg')
const pngPath = resolve(root, 'public', 'og-image.png')

try {
  const svg = readFileSync(svgPath)
  const png = await sharp(svg)
    .resize(1200, 630)
    .png()
    .toBuffer()

  writeFileSync(pngPath, png)
  console.log(`✓ OG image generated: ${(png.length / 1024).toFixed(1)} KB → public/og-image.png`)
} catch (err) {
  console.error('✗ Failed to generate OG image:', err.message)
  process.exit(1)
}
