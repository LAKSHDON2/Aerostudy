import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { decodeXml, detectKind, parseDocx, parsePptx } from '../src/services/fileParse'

describe('detectKind', () => {
  it('maps extensions to kinds', () => {
    expect(detectKind('Week4.pptx')).toBe('pptx')
    expect(detectKind('notes.docx')).toBe('docx')
    expect(detectKind('worksheet.PDF')).toBe('pdf')
    expect(detectKind('a.md')).toBe('md')
    expect(detectKind('data.csv')).toBe('csv')
    expect(detectKind('scan.jpeg')).toBe('image')
    expect(detectKind('virus.exe')).toBeNull()
  })
})

describe('decodeXml', () => {
  it('unescapes entities in office text', () => {
    expect(decodeXml('F = m &times; a &amp; g &lt; 9.81 &quot;ok&quot;')).toBe('F = m &times; a & g < 9.81 "ok"')
  })
})

async function zipOf(files: Record<string, string>): Promise<ArrayBuffer> {
  const zip = new JSZip()
  for (const [name, xml] of Object.entries(files)) zip.file(name, xml)
  return zip.generateAsync({ type: 'arraybuffer' })
}

describe('parsePptx', () => {
  it('extracts slide text in slide order with paragraphs', async () => {
    const buf = await zipOf({
      'ppt/slides/slide2.xml':
        '<p:sp><a:p><a:r><a:t>Lift equation</a:t></a:r></a:p><a:p><a:r><a:t>L = C_L q S</a:t></a:r></a:p></p:sp>',
      'ppt/slides/slide10.xml': '<a:p><a:r><a:t>Summary &amp; recap</a:t></a:r></a:p>',
      'ppt/slides/slide1.xml': '<a:p><a:r><a:t>Week 4: Aerodynamics</a:t></a:r></a:p>',
      'docProps/core.xml': '<a:t>not a slide</a:t>',
    })
    const text = await parsePptx(buf)
    const i1 = text.indexOf('Slide 1')
    const i2 = text.indexOf('Slide 2')
    const i3 = text.indexOf('Slide 3')
    expect(i1).toBeGreaterThanOrEqual(0)
    expect(i1).toBeLessThan(i2)
    expect(i2).toBeLessThan(i3)
    expect(text).toContain('Week 4: Aerodynamics')
    expect(text).toContain('L = C_L q S')
    expect(text).toContain('Summary & recap')
    expect(text).not.toContain('not a slide')
  })

  it('throws when there are no slides', async () => {
    const buf = await zipOf({ 'x.xml': '<a:t>hi</a:t>' })
    await expect(parsePptx(buf)).rejects.toThrow(/No slides/)
  })
})

describe('parseDocx', () => {
  it('extracts paragraphs with xml:space runs and entities', async () => {
    const buf = await zipOf({
      'word/document.xml':
        '<w:body>' +
        '<w:p><w:r><w:t xml:space="preserve">Reynolds number </w:t></w:r><w:r><w:t>Re = &#961;VL/&#956;</w:t></w:r></w:p>' +
        '<w:p><w:r><w:t>Second paragraph</w:t></w:r></w:p>' +
        '</w:body>',
    })
    const text = await parseDocx(buf)
    expect(text.split('\n')).toHaveLength(2)
    expect(text).toContain('Reynolds number Re = ρVL/μ')
    expect(text).toContain('Second paragraph')
  })
})
