import assert from 'node:assert/strict'
import test from 'node:test'
import { collectRegions } from '../extension/regions.mjs'

const image = { left: 40, top: 30, scaleX: 2, scaleY: 2 }
const line = (text, x0, y0, x1, y1, confidence = 94) => ({
  text, bbox: { x0, y0, x1, y1 }, confidence,
})
const block = lines => ({ paragraphs: [{ lines }] })

test('maps OCR pixels to the page, joining lines within separate bubbles', () => {
  const regions = collectRegions([
    block([line('How many', 10, 20, 125, 50)]),
    block([line('dots?', 42, 55, 97, 85)]),
    block([line('Let’s count.', 175, 25, 330, 55)]),
    block([line('42', 70, 140, 108, 170), line('xx', 170, 170, 204, 194, 24)]),
  ], [], image)

  assert.deepEqual(regions, [
    { text: 'How many dots?', left: 45, top: 40, right: 102.5, bottom: 72.5 },
    { text: 'Let’s count.', left: 127.5, top: 42.5, right: 205, bottom: 57.5 },
  ])
})

test('prefers page text whenever OCR would add a duplicate target', () => {
  const dom = { text: 'Get started', left: 42, top: 38, right: 109, bottom: 58 }
  const regions = collectRegions([
    block([line('GET STARTED', 10, 20, 125, 50)]),
    block([line('Try again', 10, 100, 125, 130)]),
  ], [dom], image)

  assert.deepEqual(regions.map(region => region.text), ['Get started', 'Try again'])
})
