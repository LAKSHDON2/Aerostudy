/**
 * PWA icon generator — zero dependencies.
 *
 * The app logo is a simple polygon rocket (same path as the favicon in
 * index.html: circle disc #0a1224 + rocket #7cc4ff on a 64×64 viewBox).
 * This script rasterizes it at the sizes PWA manifests need and writes
 * real PNGs (hand-rolled encoder via node:zlib) into public/icons/.
 *
 * Run:  npm run icons
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'icons')

// Rocket outline from the favicon SVG path (M32 12 L38 34 ... Z)
const ROCKET = [
  [32, 12], [38, 34], [54, 44], [54, 50], [36, 42], [34, 52],
  [40, 58], [40, 61], [32, 57], [24, 61], [24, 58], [30, 52],
  [28, 42], [10, 50], [10, 44], [26, 34],
]

const DISK = { cx: 32, cy: 32, r: 30 }
const COL_ROCKET = [124, 196, 255] // #7cc4ff
const COL_DISK = [10, 18, 36] // #0a1224
const COL_PAGE = [7, 12, 24] // #070c18
const COL_ERROR = [226, 82, 100]

function pointInPolygon(px, py, pts) {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]
    const [xj, yj] = pts[j]
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

/** Transform rocket points: scale k about the polygon's bbox center, re-centered at (32,32). */
function rocketTransformed(k) {
  const xs = ROCKET.map((p) => p[0])
  const ys = ROCKET.map((p) => p[1])
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2
  return ROCKET.map(([x, y]) => [32 + (x - cx) * k, 32 + (y - cy) * k])
}

/** RGBA pixel raster of the logo at size×size. mode: 'disc' | 'square' */
function raster(size, mode, rocketScale) {
  const px = new Uint8Array(size * size * 4)
  const rocket = rocketTransformed(rocketScale)
  const scale = 64 / size
  const SS = 3 // 3×3 supersampling
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const u = (x + (sx + 0.5) / SS) * scale
          const v = (y + (sy + 0.5) / SS) * scale
          let cr = 0, cg = 0, cb = 0, ca = 0
          if (pointInPolygon(u, v, rocket)) {
            cr = COL_ROCKET[0]; cg = COL_ROCKET[1]; cb = COL_ROCKET[2]; ca = 255
          } else if (mode === 'disc') {
            const dx = u - DISK.cx, dy = v - DISK.cy
            if (dx * dx + dy * dy <= DISK.r * DISK.r) {
              cr = COL_DISK[0]; cg = COL_DISK[1]; cb = COL_DISK[2]; ca = 255
            }
          } else {
            cr = COL_PAGE[0]; cg = COL_PAGE[1]; cb = COL_PAGE[2]; ca = 255
          }
          // Straight-alpha accumulate
          r += cr; g += cg; b += cb; a += ca
        }
      }
      const n = SS * SS
      const o = (y * size + x) * 4
      px[o] = Math.round(r / n)
      px[o + 1] = Math.round(g / n)
      px[o + 2] = Math.round(b / n)
      px[o + 3] = Math.round(a / n)
    }
  }
  return px
}

// ── Minimal PNG encoder (RGBA, 8-bit, filter 0) ────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const out = Buffer.alloc(8 + data.length + 4)
  out.writeUInt32BE(data.length, 0)
  out.write(type, 4, 'ascii')
  Buffer.from(data).copy(out, 8)
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, 'ascii'), Buffer.from(data)])), 8 + data.length)
  return out
}

function encodePng(size, rgba) {
  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0 // filter: none
    Buffer.from(rgba.buffer, y * stride, stride).copy(raw, y * (stride + 1) + 1)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function writeIcon(name, size, mode, rocketScale) {
  const png = encodePng(size, raster(size, mode, rocketScale))
  const file = join(outDir, name)
  writeFileSync(file, png)
  // Read back + verify signature and IHDR dims
  const back = readFileSync(file)
  const sigOk = back[0] === 0x89 && back[1] === 0x50 && back[2] === 0x4e && back[3] === 0x47
  const w = back.readUInt32BE(16)
  const h = back.readUInt32BE(20)
  if (!sigOk || w !== size || h !== size) throw new Error(`${name}: verification failed (${sigOk}, ${w}x${h})`)
  console.log(`✓ ${name} — ${w}x${h}, ${(back.length / 1024).toFixed(1)} KB`)
}

mkdirSync(outDir, { recursive: true })
writeIcon('pwa-192.png', 192, 'disc', 1.0)
writeIcon('pwa-512.png', 512, 'disc', 1.0)
writeIcon('pwa-maskable-512.png', 512, 'square', 0.62)
writeIcon('apple-touch-icon.png', 180, 'square', 0.82)
console.log('Icons written to public/icons/')
