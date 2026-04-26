// Client-side text extraction for unstructured file formats.
// Lazy-loads parsers so the main bundle stays small.

export interface ExtractResult {
  text: string
  warning?: string
}

const TEXT_EXTENSIONS = new Set(['txt', 'md', 'markdown', 'html', 'htm', 'csv', 'json', 'eml', 'log', 'xml', 'yml', 'yaml', 'tsv'])

function getExt(file: File): string {
  return file.name.split('.').pop()?.toLowerCase() ?? ''
}

async function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'))
    reader.readAsText(file)
  })
}

async function extractPDF(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  // PDF.js needs a worker. Use the bundled worker via Vite ?url.
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

  const buf = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data: buf }).promise
  const out: string[] = []
  const pages = Math.min(doc.numPages, 25) // cap at 25 pages for demo
  for (let i = 1; i <= pages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map(item => ('str' in item ? item.str : ''))
      .join(' ')
    out.push(pageText)
  }
  return out.join('\n\n')
}

async function extractDOCX(file: File): Promise<string> {
  const mammoth = (await import('mammoth')).default ?? (await import('mammoth'))
  const buf = await file.arrayBuffer()
  const result = await (mammoth as { extractRawText: (opts: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }> })
    .extractRawText({ arrayBuffer: buf })
  return result.value
}

export async function extractFile(file: File): Promise<ExtractResult> {
  const ext = getExt(file)
  const sizeMB = file.size / (1024 * 1024)

  if (sizeMB > 20) {
    return { text: '', warning: `File is ${sizeMB.toFixed(1)} MB — too large. Trim to under 20 MB or paste a sample.` }
  }

  try {
    if (ext === 'pdf') {
      const text = await extractPDF(file)
      return text.trim()
        ? { text, warning: text.length < 100 ? 'Extracted text is short — PDF may be scanned/image-based. Consider OCR.' : undefined }
        : { text: '', warning: 'No text extracted from PDF — likely scanned. Use Image OCR source type instead.' }
    }
    if (ext === 'docx') {
      const text = await extractDOCX(file)
      return { text }
    }
    if (ext === 'doc') {
      return { text: '', warning: 'Legacy .doc format not supported in browser. Save as .docx and try again.' }
    }
    if (TEXT_EXTENSIONS.has(ext)) {
      return { text: await readAsText(file) }
    }
    // Unknown — try as text
    return { text: await readAsText(file), warning: `Unknown file type (.${ext}) — read as plain text.` }
  } catch (err) {
    return { text: '', warning: `Failed to extract ${file.name}: ${err instanceof Error ? err.message : String(err)}` }
  }
}

export function acceptForType(typeId: string): string {
  switch (typeId) {
    case 'PDF Document':     return '.pdf'
    case 'Word Document':    return '.doc,.docx'
    case 'Plain Text':       return '.txt,.log'
    case 'Markdown':         return '.md,.markdown'
    case 'HTML Page':        return '.html,.htm'
    case 'Email (EML)':      return '.eml,.mbox'
    case 'Audio Transcript': return '.txt,.vtt,.srt'
    case 'Image OCR':        return 'image/*'
    case 'Code Files':       return '.js,.ts,.tsx,.py,.go,.java,.cpp,.c,.cs,.rb,.rs,.php,.swift,.kt,.scala'
    default:                 return '.txt,.md,.html,.csv,.json,.eml,.log,.pdf,.docx'
  }
}
