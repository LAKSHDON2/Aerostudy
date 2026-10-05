/**
 * In-browser file parsing for the Files page.
 * PPTX/DOCX are zip+xml → JSZip; PDF text → pdfjs-dist (lazy-loaded so the
 * main bundle stays lean); plain text files are read directly; images are
 * turned into data URLs for vision models.
 */

import JSZip from 'jszip'

export type FileKind = 'pptx' | 'docx' | 'pdf' | 'txt' | 'md' | 'csv' | 'image'

export const FILE_ACCEPT = '.pptx,.docx,.pdf,.txt,.md,.markdown,.csv,.tsv,.png,.jpg,.jpeg,.webp'

export function detectKind(name: string): FileKind | null {
  const ext = (name.toLowerCase().split('.').pop() ?? '').trim()
  if (ext === 'pptx' || ext === 'ppsx') return 'pptx'
  if (ext === 'docx') return 'docx'
  if (ext === 'pdf') return 'pdf'
  if (ext === 'txt' || ext === 'text') return 'txt'
  if (ext === 'md' || ext === 'markdown') return 'md'
  if (ext === 'csv' || ext === 'tsv') return 'csv'
  if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp' || ext === 'gif') return 'image'
  return null
}

/** Decode the handful of XML entities that appear inside office text runs. */
export function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, '&')
}

/** Extract slide-by-slide text from a .pptx buffer. */
export async function parsePptx(buf: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(buf)
  const slides = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => slideNum(a) - slideNum(b))
  if (slides.length === 0) throw new Error('No slides found — is this a valid .pptx?')
  const parts: string[] = []
  for (let i = 0; i < slides.length; i++) {
    const xml = await zip.files[slides[i]].async('string')
    const text = officeParagraphs(xml, /<a:t[^>]*>([^<]*)<\/a:t>/g)
    if (text) parts.push(`— Slide ${i + 1} —\n${text}`)
  }
  return parts.join('\n\n')
}

/** Extract paragraph text from a .docx buffer. */
export async function parseDocx(buf: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(buf)
  const entry = zip.files['word/document.xml']
  if (!entry) throw new Error('No document body — is this a valid .docx?')
  const xml = await entry.async('string')
  return officeParagraphs(xml, /<w:t[^>]*>([^<]*)<\/w:t>/g)
}

function slideNum(name: string): number {
  return Number(/slide(\d+)\.xml$/.exec(name)?.[1] ?? 0)
}

/** Split office XML into paragraphs; collect decoded text runs inside each. */
function officeParagraphs(xml: string, runRe: RegExp): string {
  return xml
    .split(/<\/(?:a|w):p>/)
    .map((p) => {
      const runs: string[] = []
      for (const m of p.matchAll(runRe)) runs.push(decodeXml(m[1]))
      return runs.join('').replace(/\s+/g, ' ').trim()
    })
    .filter(Boolean)
    .join('\n')
}

/** Extract text from a PDF buffer via lazily-imported pdfjs-dist. */
export async function parsePdf(buf: ArrayBuffer): Promise<{ text: string; warning?: string }> {
  const pdfjs = await import('pdfjs-dist')
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise
  let out = ''
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const tc = await page.getTextContent()
    for (const item of tc.items) {
      const it = item as { str?: string; hasEOL?: boolean }
      if (typeof it.str === 'string') out += it.str + (it.hasEOL ? '\n' : ' ')
    }
    out += '\n'
  }
  const text = out.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
  if (text.length < 40) {
    return { text, warning: 'No text layer found — this PDF may be a scan. Upload page images instead.' }
  }
  return { text }
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(new Error(`Could not read ${file.name}`))
    r.readAsDataURL(file)
  })
}

/** Orchestrate extraction for any supported file. Images have no text. */
export async function extractText(file: File): Promise<{ text: string; warning?: string }> {
  const kind = detectKind(file.name)
  switch (kind) {
    case 'pptx':
      return { text: await parsePptx(await file.arrayBuffer()) }
    case 'docx':
      return { text: await parseDocx(await file.arrayBuffer()) }
    case 'pdf':
      return parsePdf(await file.arrayBuffer())
    case 'txt':
    case 'md':
    case 'csv':
      return { text: await file.text() }
    default:
      throw new Error(`Unsupported file type: ${file.name}`)
  }
}
