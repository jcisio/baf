import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const copy = (from, to) => cp(new URL(from, root), new URL(to, root), { recursive: true })

// Tesseract ships browser CDN defaults even when callers supply local asset paths.
// Match the pinned bundles so a dependency update cannot silently restore them.
async function bundleOcr(name, replacements) {
  let source = await readFile(new URL(`node_modules/tesseract.js/dist/${name}`, root), 'utf8')
  for (const [remoteDefault, localDefault] of replacements) {
    if (!source.includes(remoteDefault)) throw new Error(`Review the OCR fallback paths in ${name}.`)
    source = source.replace(remoteDefault, localDefault)
  }
  if (source.includes('cdn.jsdelivr.net')) throw new Error(`Unexpected CDN fallback in ${name}.`)
  await writeFile(new URL(`dist/ocr/${name}`, root), source)
}

await copy('extension/', 'dist/')
await mkdir(new URL('dist/ocr/', root), { recursive: true })
await Promise.all([
  bundleOcr('tesseract.min.js', [
    ['"https://cdn.jsdelivr.net/npm/tesseract.js@v".concat(c,"/dist/worker.min.js")', '"./ocr/worker.min.js"'],
  ]),
  bundleOcr('worker.min.js', [
    ['"https://cdn.jsdelivr.net/npm/@tesseract.js-data/".concat(i,m?"/4.0.0_best_int":"/4.0.0")', '"."'],
    ['"https://cdn.jsdelivr.net/npm/tesseract.js-core@v".concat(h.substring(1))', '"./tesseract-core-lstm.wasm.js"'],
  ]),
  copy('node_modules/tesseract.js/dist/worker.min.js.LICENSE.txt', 'dist/ocr/worker.min.js.LICENSE.txt'),
  copy('node_modules/tesseract.js/dist/tesseract.min.js.LICENSE.txt', 'dist/ocr/tesseract.min.js.LICENSE.txt'),
  copy('node_modules/tesseract.js/LICENSE.md', 'dist/ocr/tesseract-license.md'),
  copy('node_modules/tesseract.js-core/LICENSE', 'dist/ocr/tesseract-core-license'),
  copy('node_modules/tesseract.js-core/tesseract-core-lstm.wasm.js', 'dist/ocr/tesseract-core-lstm.wasm.js'),
  copy('node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz', 'dist/ocr/eng.traineddata.gz'),
])
