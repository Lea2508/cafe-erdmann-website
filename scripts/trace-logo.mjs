import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const ImageTracer = require('imagetracerjs')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const pngPath = path.join(root, 'public/logo-cafe-erdmann.png')
const outPath = path.join(root, 'public/logo-cafe-erdmann.svg')

const LOGO_FILL = '#364A2F'

const raw = execFileSync('python3', [
  path.join(__dirname, 'png_to_rgba.py'),
  pngPath,
]).toString()
const { width, height, data } = JSON.parse(raw)
const rgba = new Uint8ClampedArray(Buffer.from(data, 'base64'))

for (let i = 0; i < rgba.length; i += 4) {
  const r = rgba[i]
  const g = rgba[i + 1]
  const b = rgba[i + 2]
  const isGreen = g > 55 && r < 90 && b < 90 && g > r && g > b
  if (isGreen) {
    rgba[i] = 54
    rgba[i + 1] = 74
    rgba[i + 2] = 47
  } else {
    rgba[i] = 255
    rgba[i + 1] = 255
    rgba[i + 2] = 255
  }
  rgba[i + 3] = 255
}

let svg = ImageTracer.imagedataToSVG(
  { width, height, data: rgba },
  {
    ltres: 0.35,
    qtres: 0.35,
    pathomit: 0,
    colorsampling: 0,
    numberofcolors: 2,
    mincolorratio: 0,
    colorquantcycles: 1,
    scale: 2,
    linefilter: false,
    roundcoords: 2,
    viewbox: true,
    desc: false,
    lcpr: 0,
    qcpr: 0,
  },
)

svg = svg.replace(/<path[^>]*fill="rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)"[^>]*\/>/gi, '')
svg = svg.replace(/<rect[^>]*\/>/gi, '')
svg = svg.replace(
  /<path fill="[^"]*" stroke="[^"]*" stroke-width="[^"]*" opacity="[^"]*"/g,
  `<path fill="${LOGO_FILL}"`,
)

const openTag =
  `<svg viewBox="0 0 ${width * 2} ${height * 2}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cafe Erdmann">`
svg = svg.replace(/<svg[^>]*>/, openTag)

fs.writeFileSync(outPath, svg)
console.log('Wrote', outPath, `(${(svg.match(/<path/g) || []).length} paths)`)
