import { collectRegions } from './regions.mjs'

const scan = document.querySelector('#scan')
const status = document.querySelector('#status')
const consent = document.querySelector('#consent')
const allow = document.querySelector('#allow')
const cancel = document.querySelector('#cancel')
const consentKey = 'allow-local-lesson-translation'
const firefox = globalThis.location?.protocol === 'moz-extension:'
const languages = { sourceLanguage: 'en', targetLanguage: 'fr' }

class ScanError extends Error {}

function isClassroom(value) {
  const url = new URL(value ?? 'about:blank')
  return url.protocol === 'https:'
    && ['beastacademy.com', 'www.beastacademy.com'].includes(url.hostname)
    && ['/school/classroom/', '/demo/school/classroom/'].some(path => url.pathname.startsWith(path))
}

async function capture(tab, view) {
  const [active] = await chrome.tabs.query({ active: true, windowId: tab.windowId })
  if (active?.id !== tab.id || active.url !== tab.url) {
    throw new ScanError('Revenez à la leçon puis relancez la traduction.')
  }
  const screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' })
  const [current] = await chrome.tabs.query({ active: true, windowId: tab.windowId })
  if (current?.id !== tab.id || current.url !== tab.url) {
    throw new ScanError('Revenez à la leçon puis relancez la traduction.')
  }

  const image = new Image()
  image.src = screenshot
  await image.decode()
  const ratioX = image.width / view.width
  const ratioY = image.height / view.height
  const left = Math.floor(view.area.left * ratioX)
  const top = Math.floor(view.area.top * ratioY)
  const width = Math.ceil(view.area.right * ratioX) - left
  const height = Math.ceil(view.area.bottom * ratioY) - top
  const scale = Math.min(1, 2300 / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  canvas.getContext('2d').drawImage(image, left, top, width, height, 0, 0, canvas.width, canvas.height)
  return {
    canvas,
    left: left / ratioX,
    top: top / ratioY,
    scaleX: ratioX * canvas.width / width,
    scaleY: ratioY * canvas.height / height,
  }
}

async function readImage(image) {
  const worker = await Tesseract.createWorker('eng', 1, {
    workerPath: chrome.runtime.getURL('ocr/worker.min.js'),
    corePath: chrome.runtime.getURL('ocr/tesseract-core-lstm.wasm.js'),
    langPath: chrome.runtime.getURL('ocr'),
    workerBlobURL: false,
    cacheMethod: 'none',
  })
  try {
    await worker.setParameters({ tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT })
    const { data } = await worker.recognize(image.canvas, {}, { text: false, blocks: true })
    return data.blocks ?? []
  } finally {
    await worker.terminate()
  }
}

async function translatePage(tab, fromClick = false) {
  scan.hidden = true
  status.textContent = 'Préparation du modèle de traduction…'
  let translator
  try {
    try {
      if (firefox) {
        const { createBergamotTranslator } = await import('./bergamot.mjs')
        translator = await createBergamotTranslator()
      } else {
        translator = await Translator.create({
          ...languages,
          monitor(monitor) {
            monitor.addEventListener('downloadprogress', ({ loaded }) => {
              status.textContent = `Téléchargement du modèle… ${Math.round(loaded * 100)} %`
            })
          },
        })
      }
    } catch (error) {
      if (!firefox && !fromClick && error.name === 'NotAllowedError') {
        status.textContent = 'Chrome demande un clic pour préparer le modèle anglais-français.'
        scan.hidden = false
        scan.focus()
        return
      }
      console.warn(error)
      throw new ScanError(firefox
        ? 'Impossible de charger le moteur de traduction local de Firefox. Rouvrez le panneau puis réessayez.'
        : 'Le modèle anglais-français est indisponible. Vérifiez votre connexion ou les paramètres de Chrome, puis réessayez.')
    }

    status.textContent = 'Lecture du texte visible…'
    const [{ documentId }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js'],
    })
    const send = (type, payload) => chrome.tabs.sendMessage(tab.id, { type, ...payload }, { documentId })
    const view = await send('prepare')
    if (!view) throw new ScanError('Ouvrez la leçon puis réessayez.')
    const image = await capture(tab, view)
    let blocks
    try {
      blocks = await readImage(image)
    } catch (error) {
      console.error(error)
      throw new ScanError('La lecture du texte dans les images a échoué. Réessayez.')
    }

    const regions = collectRegions(blocks, view.text, image)
    if (!regions.length) throw new ScanError('Aucun texte lisible. Faites défiler ou zoomez, puis réessayez.')

    status.textContent = 'Traduction en français…'
    const translations = new Map()
    const results = []
    for (const region of regions) {
      if (!translations.has(region.text)) {
        translations.set(region.text, await translator.translate(region.text))
      }
      const french = translations.get(region.text)?.trim()
      if (french) results.push({ ...region, french })
    }
    if (!results.length) throw new ScanError('Aucune traduction trouvée. Réessayez.')
    if (!await send('display', { scanId: view.id, regions: results })) {
      throw new ScanError('La leçon a changé pendant la lecture. Relancez la traduction.')
    }

    window.close()
  } catch (error) {
    console.warn(error)
    status.textContent = error instanceof ScanError
      ? error.message
      : 'La traduction a échoué. Rouvrez la leçon puis réessayez.'
  } finally {
    await translator?.destroy()
  }
}

async function start(fromModelButton = false) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!isClassroom(tab?.url)) {
    status.textContent = 'Ouvrez une leçon Beast Academy pour utiliser la traduction.'
  } else if (!firefox && !globalThis.Translator) {
    status.textContent = 'La traduction locale nécessite une version récente de Chrome sur ordinateur.'
  } else {
    await translatePage(tab, fromModelButton)
  }
}

scan.addEventListener('click', () => start(true))
allow.addEventListener('click', async () => {
  localStorage.setItem(consentKey, 'yes')
  consent.hidden = true
  status.hidden = false
  await start()
})
cancel.addEventListener('click', () => window.close())

if (localStorage.getItem(consentKey) === 'yes') {
  await start()
} else {
  status.hidden = true
  consent.hidden = false
  allow.focus()
}
