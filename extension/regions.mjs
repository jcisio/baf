function width(rect) {
  return rect.right - rect.left
}

function height(rect) {
  return rect.bottom - rect.top
}

function overlap(a, b) {
  const x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
  const y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
  return x * y / Math.min(width(a) * height(a), width(b) * height(b))
}

function fitsBelow(group, line) {
  const previous = group.last
  const gap = line.top - previous.bottom
  const scale = Math.max(height(line), height(previous))
  const sharedWidth = Math.min(line.right, previous.right) - Math.max(line.left, previous.left)
  const centers = Math.abs(line.left + line.right - previous.left - previous.right) / 2
  return gap >= -scale * 0.35 && gap <= scale * 0.85
    && sharedWidth >= Math.min(width(line), width(previous)) * 0.45
    && centers <= Math.max(width(line), width(previous)) * 0.35
    && height(line) / height(previous) >= 0.55 && height(line) / height(previous) <= 1.8
}

export function collectRegions(blocks, visibleText, image) {
  const lines = blocks.flatMap(block => block.paragraphs.flatMap(paragraph => paragraph.lines))
    .map(({ bbox, text, confidence }) => ({
      text: text.trim().replace(/\s+/g, ' '),
      left: image.left + bbox.x0 / image.scaleX,
      top: image.top + bbox.y0 / image.scaleY,
      right: image.left + bbox.x1 / image.scaleX,
      bottom: image.top + bbox.y1 / image.scaleY,
      confidence,
    }))
    .filter(line => /[A-Za-z]{2}/.test(line.text) && line.confidence >= 42
      && width(line) >= 8 && height(line) >= 8
      && !visibleText.some(region => overlap(line, region) > 0.6))
    .sort((a, b) => a.top - b.top || a.left - b.left)

  const groups = []
  for (const line of lines) {
    const match = groups.filter(group => fitsBelow(group, line))
      .sort((a, b) => b.last.bottom - a.last.bottom)[0]
    if (match) {
      match.text += ' ' + line.text
      match.left = Math.min(match.left, line.left)
      match.right = Math.max(match.right, line.right)
      match.bottom = Math.max(match.bottom, line.bottom)
      match.last = line
    } else {
      groups.push({ ...line, last: line })
    }
  }
  return [...visibleText, ...groups.map(({ last, confidence, ...region }) => region)]
}
