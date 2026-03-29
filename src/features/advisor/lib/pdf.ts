function asciiSanitize(value: string): string {
  return value.replace(/[^\x20-\x7E]/g, ' ')
}

function escapePdfText(value: string): string {
  return asciiSanitize(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length
}

function wrapLine(text: string, max = 90): string[] {
  const clean = asciiSanitize(text).trim()
  if (!clean) return ['']
  if (clean.length <= max) return [clean]

  const words = clean.split(/\s+/)
  const lines: string[] = []
  let current = ''

  words.forEach(word => {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= max) {
      current = candidate
      return
    }
    if (current) lines.push(current)
    current = word
  })

  if (current) lines.push(current)
  return lines
}

interface PdfSection {
  heading: string
  lines: string[]
}

interface DownloadPdfInput {
  fileName: string
  title: string
  sections: PdfSection[]
}

function buildPdfContent(title: string, sections: PdfSection[]): string {
  const lines: string[] = []
  lines.push(...wrapLine(title, 72))
  lines.push('')

  sections.forEach(section => {
    lines.push(...wrapLine(section.heading, 76))
    section.lines.forEach(line => {
      wrapLine(`- ${line}`, 88).forEach(wrapped => lines.push(wrapped))
    })
    lines.push('')
  })

  const limited = lines.slice(0, 44)
  const operators: string[] = ['BT', '/F1 11 Tf', '50 795 Td']

  limited.forEach((line, index) => {
    if (index > 0) operators.push('0 -16 Td')
    operators.push(`(${escapePdfText(line)}) Tj`)
  })

  operators.push('ET')
  return operators.join('\n')
}

function createPdfBlob(title: string, sections: PdfSection[]): Blob {
  const stream = buildPdfContent(title, sections)
  const streamLength = byteLength(stream)

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    '2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
    `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}\nendstream\nendobj`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]

  objects.forEach(object => {
    offsets.push(byteLength(pdf))
    pdf += `${object}\n`
  })

  const xrefOffset = byteLength(pdf)
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  offsets.slice(1).forEach(offset => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return new Blob([pdf], { type: 'application/pdf' })
}

export function downloadPdf(input: DownloadPdfInput) {
  const blob = createPdfBlob(input.title, input.sections)
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = input.fileName.endsWith('.pdf')
    ? input.fileName
    : `${input.fileName}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}
