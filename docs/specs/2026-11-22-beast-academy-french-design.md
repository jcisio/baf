# French translation for Beast Academy

The current manual-install release is [v0.1.2](https://github.com/jcisio/baf/releases/tag/v0.1.2). [Website and release behavior](2026-11-22-baf-website-and-release-design.md) is specified separately.

## What the learner does

The toolbar icon uses the letters **BAF**. On first use, the popup explains that the extension reads visible text and captures the active lesson area on-device. **Allow and translate** saves permission locally and starts the scan. **Cancel** closes the popup without reading or capturing the tab. Later toolbar clicks on a Beast Academy classroom page start the scan automatically. If Chrome requires a separate gesture to prepare the language model, the popup shows **Préparer la traduction**. Keep the popup open during scanning. It closes after placing the translation targets on the page.

Hovering over a supported block of English shows a French tooltip nearby. Clicking the block pins it. A close button or Escape dismisses it. Keyboard focus on a translation target shows the tooltip, and Enter pins it. The original English, illustrations, and lesson layout remain visible. When the text is already interactive, an adjacent **FR** button lets the site control retain its click behavior.

## What it reads

The extension reads visible document text and runs bundled Tesseract.js English OCR on a visible-tab capture. It crops to a recognized lesson dialog or book surface when available and otherwise uses the viewport. It prefers document text when OCR finds the same region and groups nearby OCR lines that appear to belong to a single text block. OCR coordinates account for the capture scale.

Scrolling, resizing, or navigating clears targets from the previous view. The learner can scan the newly visible area from the same toolbar icon.

Video, narration, and read-aloud audio are outside this version.

## Where processing happens

This Manifest V3 extension requires desktop Chrome 138 or later with the built-in Translator API available. Scans are limited to HTTPS pages under `/school/classroom/` and the public demo's `/demo/school/classroom/` on `beastacademy.com` or `www.beastacademy.com`. The extension uses `activeTab` and `scripting` after the user invokes it.

Chrome translates English into French on-device and may need to download the language model on first use. The extension bundles the OCR worker, WebAssembly, and English recognition model. The build replaces Tesseract's CDN defaults with local asset paths and fails if those defaults change or a CDN reference remains. The extension stores consent locally and keeps the capture, lesson text, and results in memory. It displays the current scan stage in French and reports when the model is unavailable or no readable text was found. The extension sends neither captured pixels nor lesson text to a remote service.

## Installation and Store preparation

- Unzip the release and select the folder containing `manifest.json` with **Load unpacked** in `chrome://extensions`. Local builds use `npm ci` followed by `npm run build`.
- The [Store screenshot](../../store-assets/store-screenshot.jpg) is a 1280 × 800 JPEG showing a translated comic speech bubble.
- The Store package includes a 128 × 128 **BAF** icon. Reviewers can open the [guest demo lesson Delicious + &amp; −](https://beastacademy.com/demo/school/classroom/1/7/1511/1) and its book section without signing in. The [privacy policy](https://dev.jcisio.com/baf/privacy.html) covers local consent and lesson processing.
- Version 0.1.2 was submitted for Chrome Web Store review with public visibility and automatic publication after approval. The extension ID is `cokhncjonhniclmcofefijjigechjnlm`.

## Verification

- Run `npm test` to verify first-use consent and OCR coordinate mapping, grouping, and suppression of duplicate regions.
- Run `npm run build` and check the ZIP for a root manifest, the 128 × 128 icon, and the bundled OCR assets.
- Before submission, desktop Chrome confirmed first-use consent, exercise OCR, and a pinned French translation on page 18 of the guest demo book.
- Try the toolbar with a ready Translator API and with Chrome requiring a language-model gesture. The former should start immediately, and the latter should offer **Préparer la traduction**.
- On page 33 of **More Than 20, Part 1**, hover over a visible bubble, confirm that the French matches the English in that bubble, and click to pin it. Verify keyboard pinning and dismissal.
- Scroll to a different set of bubbles and scan again. Confirm that targets follow the newly visible text and old targets disappear.
- On the same lesson's exercise instructions, confirm that hovering over the counting prompt shows its French translation. Check that lesson controls still respond to clicks.
- Check that the extension reports an unavailable translation model clearly and that activating it on another site captures nothing.
