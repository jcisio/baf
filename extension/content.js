(() => {
  if (globalThis.beastAcademyFrench) return
  globalThis.beastAcademyFrench = true

  const interactive = 'a[href], button, input, select, textarea, summary, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"]), [contenteditable]'
  const ignored = 'script, style, noscript, template, [aria-hidden="true"], [inert], footer'
  let view
  let overlay

  function clip(rect, width = innerWidth, height = innerHeight) {
    return {
      left: Math.max(0, rect.left),
      top: Math.max(0, rect.top),
      right: Math.min(width, rect.right),
      bottom: Math.min(height, rect.bottom),
    }
  }

  function center(rect) {
    return [(rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2]
  }

  function targetAt(rect) {
    return document.elementFromPoint(...center(rect))
  }

  function visibleText() {
    const text = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    const range = document.createRange()
    while (walker.nextNode()) {
      const node = walker.currentNode
      const parent = node.parentElement
      const value = node.textContent.trim().replace(/\s+/g, ' ')
      if (!/[a-z]{2}/i.test(value) || value.length > 1800 || parent.closest(ignored)) continue
      if (getComputedStyle(parent).visibility !== 'visible') continue
      range.selectNodeContents(node)
      const rect = clip(range.getBoundingClientRect())
      if (rect.right - rect.left < 8 || rect.bottom - rect.top < 8) continue
      const target = targetAt(rect)
      if (target && (parent.contains(target) || target.contains(parent))) {
        text.push({ ...rect, text: value })
      }
    }
    return text
  }

  function screenshotArea() {
    // The book and instructions can include artwork without readable DOM text.
    // If a large dialog surface is present, scan its pixels instead of the background.
    for (const element of document.querySelectorAll('[role="dialog"], dialog[open], img[src*="book-modal.svg"]')) {
      const rect = clip(element.getBoundingClientRect())
      if (rect.right - rect.left < innerWidth * .45 || rect.bottom - rect.top < innerHeight * .4) continue
      const target = targetAt(rect)
      if (target && (element.contains(target) || target.contains(element) || element.parentElement.contains(target))) {
        return rect
      }
    }
    return { left: 0, top: 0, right: innerWidth, bottom: innerHeight }
  }

  function clear() {
    overlay?.controller.abort()
    overlay?.host.remove()
    overlay = undefined
    view = undefined
  }

  function classroom() {
    return location.protocol === 'https:'
      && ['beastacademy.com', 'www.beastacademy.com'].includes(location.hostname)
      && location.pathname.startsWith('/school/classroom/')
  }

  function prepare() {
    clear()
    view = {
      id: crypto.randomUUID(),
      url: location.href,
      width: innerWidth,
      height: innerHeight,
      area: screenshotArea(),
      text: visibleText(),
    }
    return view
  }

  function show(regions) {
    const controller = new AbortController()
    const listener = { signal: controller.signal, capture: true }
    const host = document.createElement('div')
    const shadow = host.attachShadow({ mode: 'closed' })
    const styles = new CSSStyleSheet()
    styles.replaceSync(`
      :host { all: initial; position: fixed; inset: 0; z-index: 2147483647; pointer-events: none; }
      button { font: inherit; cursor: pointer; }
      .target {
        position: fixed; padding: 0; margin: 0; border: 0; color: #fff;
        background: transparent; pointer-events: none; border-radius: 5px;
      }
      .target:focus-visible { outline: 3px solid #6644ad; outline-offset: 2px; }
      .badge {
        pointer-events: auto; background: #503889; font: 700 11px/1 system-ui, sans-serif;
        box-shadow: 0 1px 4px #21183a80;
      }
      .tooltip {
        box-sizing: border-box; position: fixed; color: #fff; background: #2d2050;
        padding: 10px 36px 10px 13px; border: 1px solid #c6b0fa; border-radius: 9px;
        width: max-content; max-width: min(360px, calc(100vw - 16px));
        max-height: calc(100vh - 16px); overflow: auto; overflow-wrap: anywhere;
        box-shadow: 0 5px 20px #24183755; font: 15px/1.4 system-ui, sans-serif;
      }
      .tooltip.pinned { pointer-events: auto; }
      .close {
        position: absolute; right: 5px; top: 5px; padding: 2px 6px; border: 0;
        border-radius: 4px; color: inherit; background: transparent; pointer-events: auto;
      }
      .close:hover, .close:focus-visible { background: #60468f; }
      [hidden] { display: none; }
    `)
    shadow.adoptedStyleSheets = [styles]
    const tooltip = document.createElement('div')
    tooltip.className = 'tooltip'
    tooltip.lang = 'fr'
    tooltip.hidden = true
    const french = document.createElement('span')
    french.setAttribute('role', 'status')
    french.setAttribute('aria-live', 'polite')
    const close = document.createElement('button')
    close.className = 'close'
    close.setAttribute('aria-label', 'Fermer la traduction')
    close.textContent = '×'
    tooltip.append(french, close)

    let current
    let pinned = false

    function dismiss() {
      current = undefined
      pinned = false
      tooltip.hidden = true
      french.textContent = ''
    }

    function display(region, pin) {
      if (current === region && pinned === pin) return
      current = region
      pinned = pin
      tooltip.classList.toggle('pinned', pin)
      close.hidden = !pin
      french.textContent = region.french
      tooltip.hidden = false
      const margin = 8
      const left = Math.max(margin, Math.min(region.left, innerWidth - tooltip.offsetWidth - margin))
      const below = region.bottom + margin
      const above = region.top - tooltip.offsetHeight - margin
      const top = below + tooltip.offsetHeight <= innerHeight - margin ? below : Math.max(margin, above)
      tooltip.style.left = left + 'px'
      tooltip.style.top = top + 'px'
    }

    function pin(region) {
      if (pinned && current === region) dismiss()
      else display(region, true)
    }

    const hits = []
    for (const region of regions) {
      const target = targetAt(region)
      if (!target) continue
      const button = document.createElement('button')
      const badge = Boolean(target.closest(interactive))
      button.className = badge ? 'target badge' : 'target'
      button.setAttribute('aria-label', 'Traduire : ' + region.text)
      if (badge) {
        button.textContent = 'FR'
        button.style.left = Math.min(innerWidth - 24, Math.max(0, region.right + 2)) + 'px'
        button.style.top = Math.min(innerHeight - 19, Math.max(0, region.top)) + 'px'
        button.style.width = '23px'
        button.style.height = '18px'
        button.addEventListener('pointerenter', () => { if (!pinned) display(region, false) })
        button.addEventListener('pointerleave', () => { if (!pinned) dismiss() })
      } else {
        Object.assign(button.style, {
          left: region.left + 'px',
          top: region.top + 'px',
          width: region.right - region.left + 'px',
          height: region.bottom - region.top + 'px',
        })
        hits.push({ region, target })
      }
      button.addEventListener('focus', () => { if (!pinned) display(region, false) })
      button.addEventListener('blur', () => { if (!pinned) dismiss() })
      button.addEventListener('click', event => {
        event.stopPropagation()
        pin(region)
      })
      shadow.append(button)
    }
    shadow.append(tooltip)
    document.documentElement.append(host)
    overlay = { controller, host }

    function hit(event) {
      const { clientX: x, clientY: y, target } = event
      return hits.find(({ region, target: original }) => (
        x >= region.left - 4 && x <= region.right + 4
        && y >= region.top - 4 && y <= region.bottom + 4
        && (target === original || original.contains(target) || target.contains(original))
      ))?.region
    }

    close.addEventListener('click', dismiss)
    document.addEventListener('pointermove', event => {
      if (pinned || event.composedPath().includes(host)) return
      const region = hit(event)
      if (region) display(region, false)
      else dismiss()
    }, listener)
    document.documentElement.addEventListener('pointerleave', () => {
      if (!pinned) dismiss()
    }, { signal: controller.signal })
    document.addEventListener('click', event => {
      if (event.composedPath().includes(host)) return
      const region = hit(event)
      if (region && !event.target.closest(interactive)) {
        pin(region)
      } else {
        dismiss()
        // Opening or closing a lesson panel can change the pixels without scrolling.
        if (event.target.closest(interactive + ', img, svg, canvas')) clear()
      }
    }, listener)
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !current) return
      event.preventDefault()
      event.stopImmediatePropagation()
      dismiss()
    }, listener)
  }

  window.addEventListener('resize', clear)
  window.addEventListener('scroll', event => {
    if (!overlay || !event.composedPath().includes(overlay.host)) clear()
  }, { capture: true })
  window.navigation?.addEventListener('currententrychange', clear)
  chrome.runtime.onMessage.addListener((message, sender, reply) => {
    if (sender.id !== chrome.runtime.id || !classroom()) return
    if (message.type === 'prepare') {
      reply(prepare())
    } else if (message.type === 'display') {
      const matches = view?.id === message.scanId && view.url === location.href
        && view.width === innerWidth && view.height === innerHeight
      if (matches) show(message.regions)
      reply(Boolean(matches))
    }
  })
})()
