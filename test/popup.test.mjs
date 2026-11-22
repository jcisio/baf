import assert from 'node:assert/strict'
import test from 'node:test'

async function openPopup(t, { accepted = false, url } = {}) {
  const calls = []
  const elements = Object.fromEntries(['scan', 'status', 'consent', 'allow', 'cancel'].map(id => [
    id,
    {
      hidden: id === 'scan' || id === 'consent',
      focus() {},
      addEventListener(_, handler) { this.click = handler },
    },
  ]))
  const globals = {
    document: { querySelector: selector => elements[selector.slice(1)] },
    window: { close: () => calls.push('close') },
    localStorage: {
      getItem: () => accepted ? 'yes' : null,
      setItem: (_, value) => calls.push(['store-consent', value]),
    },
    chrome: {
      tabs: {
        query: async () => {
          calls.push('read-active-tab')
          return [{ url }]
        },
      },
    },
    Translator: {
      async create() {
        calls.push('prepare-model')
        throw new DOMException('Model setup requires a click', 'NotAllowedError')
      },
    },
  }

  for (const [name, value] of Object.entries(globals)) {
    const original = Object.getOwnPropertyDescriptor(globalThis, name)
    Object.defineProperty(globalThis, name, { value, configurable: true })
    t.after(() => original
      ? Object.defineProperty(globalThis, name, original)
      : delete globalThis[name])
  }

  await import(`../extension/popup.mjs?${encodeURIComponent(t.name)}`)
  return { calls, ...elements }
}

test('canceling the first-use notice closes the popup without accessing the tab', async t => {
  const popup = await openPopup(t)
  assert.equal(popup.consent.hidden, false)
  assert.deepEqual(popup.calls, [])
  await popup.cancel.click()
  assert.deepEqual(popup.calls, ['close'])
})

test('accepting consent enables the guest classroom and model setup', async t => {
  const popup = await openPopup(t, { url: 'https://beastacademy.com/demo/school/classroom/1/7/1511/1' })
  await popup.allow.click()
  assert.deepEqual(popup.calls, [['store-consent', 'yes'], 'read-active-tab', 'prepare-model'])
  assert.equal(popup.consent.hidden, true)
  assert.equal(popup.scan.hidden, false)
})

test('saved consent skips the notice but does not prepare OCR on another website', async t => {
  const popup = await openPopup(t, { accepted: true, url: 'https://example.com/school/classroom/1' })
  assert.equal(popup.consent.hidden, true)
  assert.deepEqual(popup.calls, ['read-active-tab'])
  assert.match(popup.status.textContent, /Ouvrez une leçon Beast Academy/)
})
