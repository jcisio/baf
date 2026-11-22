import { cp, mkdir } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const copy = (from, to) => cp(new URL(from, root), new URL(to, root), { recursive: true })
await copy('extension/', 'dist/')
await mkdir(new URL('dist/ocr/', root), { recursive: true })
await Promise.all([
  copy('node_modules/tesseract.js/dist/tesseract.min.js', 'dist/ocr/tesseract.min.js'),
  copy('node_modules/tesseract.js/dist/worker.min.js', 'dist/ocr/worker.min.js'),
  copy('node_modules/tesseract.js/dist/worker.min.js.LICENSE.txt', 'dist/ocr/worker.min.js.LICENSE.txt'),
  copy('node_modules/tesseract.js/dist/tesseract.min.js.LICENSE.txt', 'dist/ocr/tesseract.min.js.LICENSE.txt'),
  copy('node_modules/tesseract.js/LICENSE.md', 'dist/ocr/tesseract-license.md'),
  copy('node_modules/tesseract.js-core/LICENSE', 'dist/ocr/tesseract-core-license'),
  copy('node_modules/tesseract.js-core/tesseract-core-lstm.wasm.js', 'dist/ocr/tesseract-core-lstm.wasm.js'),
  copy('node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz', 'dist/ocr/eng.traineddata.gz'),
])
