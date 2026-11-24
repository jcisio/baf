import { createHash } from 'node:crypto'
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'

// Mozilla Remote Settings translations-models, English → French, version 2.0.
const modelBase = 'https://firefox-settings-attachments.cdn.mozilla.net/main-workspace/translations-models/'
const modelFiles = [
  ['model', 'model.enfr.intgemm.alphas.bin', 'e0d7f3ee-163a-4b0a-8e44-8b208b39477d.bin',
    '6322e296d4fecfe395a8d5723da4ec37ecbe6d7613bb1dfcf4b28e2a47498b68'],
  ['lex', 'lex.50.50.enfr.s2t.bin', '293d1823-ff05-48c9-837b-cff8fd33f197.bin',
    '2585ed98d3af0bc949865aedeb390493d591f56870814376e73e4144c41ed059'],
  ['vocab', 'vocab.enfr.spm', 'c7c1bcf3-71f6-425a-a6ed-403bd9a0a759.spm',
    '783abf3abe075afdf8d85d233994bef2c3a064e935ab1bed946820aff6ac002a'],
]
const bergamotSource = 'https://github.com/browsermt/bergamot-translator/tree/8cc5d0495479c9ec56eafafd6bcd7fb5b929ca98'
const licenseUrl = 'https://raw.githubusercontent.com/browsermt/bergamot-translator/8cc5d0495479c9ec56eafafd6bcd7fb5b929ca98/LICENSE'

async function download(url, target, sha256) {
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) })
  if (!response.ok) throw new Error(`Could not download ${url} (HTTP ${response.status}).`)
  const data = new Uint8Array(await response.arrayBuffer())
  if (createHash('sha256').update(data).digest('hex') !== sha256) {
    throw new Error(`Unexpected SHA-256 for ${url}.`)
  }
  await writeFile(target, data)
}

export async function bundleBergamot(output) {
  const directory = new URL('bergamot/', output)
  const dependency = new URL('../node_modules/@browsermt/bergamot-translator/', import.meta.url)
  await mkdir(directory, { recursive: true })
  const registry = await Promise.all(modelFiles.map(async ([part, name, attachment, sha256]) => {
    await download(modelBase + attachment, new URL(name, directory), sha256)
    return [part, { name: `bergamot/${name}`, expectedSha256Hash: sha256 }]
  }))

  await Promise.all([
    cp(new URL('translator.js', dependency), new URL('translator.js', directory)),
    cp(new URL('worker/', dependency), new URL('worker/', directory), { recursive: true }),
    cp(new URL('../firefox/bergamot.mjs', import.meta.url), new URL('bergamot.mjs', output)),
    download(licenseUrl, new URL('MPL-2.0.txt', directory),
      '1f256ecad192880510e84ad60474eab7589218784b9a50bc7ceee34c2b91f1d5'),
    writeFile(new URL('models.json', directory), JSON.stringify({ enfr: Object.fromEntries(registry) })),
    writeFile(new URL('sources.txt', directory), [
      `Bergamot 0.4.9 (MPL-2.0): ${bergamotSource}`,
      'English–French model 2.0 (MPL-2.0): https://github.com/mozilla/translations',
      'Model records: https://firefox.settings.services.mozilla.com/v1/buckets/main/collections/translations-models/records?fromLang=en&toLang=fr',
      '',
    ].join('\n')),
  ])

  const manifestPath = new URL('manifest.json', output)
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  delete manifest.minimum_chrome_version
  manifest.browser_specific_settings = {
    gecko: {
      id: 'baf@jcisio.com',
      strict_min_version: '153.0',
      data_collection_permissions: { required: ['none'] },
    },
  }
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
}
