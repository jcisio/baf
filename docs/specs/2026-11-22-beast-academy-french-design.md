# French translation for Beast Academy

The current manual-install release is [v0.1.1](https://github.com/jcisio/baf/releases/tag/v0.1.1). [Website and release behavior](2026-11-22-baf-website-and-release-design.md) is specified separately.

## What the learner does

On a Beast Academy classroom page, clicking the Chrome extension icon starts translation. If Chrome requires a separate gesture to prepare the language model, the popup shows **Préparer la traduction**. Keep the popup open during scanning. It closes after placing the translation targets on the page.

Hovering over a supported block of English shows a French tooltip nearby. Clicking the block pins it. A close button or Escape dismisses it. Keyboard focus on a translation target shows the tooltip, and Enter pins it. The original English, illustrations, and lesson layout remain visible. When the text is already interactive, an adjacent **FR** button lets the site control retain its click behavior.

## What it reads

The extension reads visible document text and runs bundled Tesseract.js English OCR on a visible-tab capture. It crops to a recognized lesson dialog or book surface when available and otherwise uses the viewport. It prefers document text when OCR finds the same region and groups nearby OCR lines that appear to belong to a single text block. OCR coordinates account for the capture scale.

Scrolling, resizing, or navigating clears targets from the previous view. The learner can scan the newly visible area from the same toolbar icon.

Video, narration, and read-aloud audio are outside this version.

## Where processing happens

This Manifest V3 extension requires desktop Chrome 138 or later with the built-in Translator API available. Scans are limited to HTTPS pages under `/school/classroom/` on `beastacademy.com` or `www.beastacademy.com`. The extension uses `activeTab` and `scripting` after the user invokes it.

Chrome translates English into French on-device and may need to download the language model on first use. The extension uses bundled OCR assets and keeps the capture, text, and results in memory. It displays the current scan stage in French and reports when the model is unavailable or no readable text was found. The extension sends neither captured pixels nor lesson text to a remote service.

## Installation and Store preparation

- Unzip the release and select the folder containing `manifest.json` with **Load unpacked** in `chrome://extensions`. Local builds use `npm ci` followed by `npm run build`.
- The [Store screenshot](../../store-assets/store-screenshot.jpg) is a 1280 × 800 JPEG showing a translated comic speech bubble.
- Chrome Web Store submission remains pending. The requested **BAF** extension icon, first-use capture disclosure and consent, and removal of unused CDN fallback code from the OCR bundle are open items. Prepare reviewer instructions and a test lesson that reviewers can access for submission. The [privacy policy](https://dev.jcisio.com/baf/privacy.html) is already hosted.

## Verification

- Run `npm test` to verify OCR coordinate mapping, grouping, and suppression of duplicate regions.
- Try the toolbar with a ready Translator API and with Chrome requiring a language-model gesture. The former should start immediately, and the latter should offer **Préparer la traduction**.
- On page 33 of **More Than 20, Part 1**, hover over a visible bubble, confirm that the French matches the English in that bubble, and click to pin it. Verify keyboard pinning and dismissal.
- Scroll to a different set of bubbles and scan again. Confirm that targets follow the newly visible text and old targets disappear.
- On the same lesson's exercise instructions, confirm that hovering over the counting prompt shows its French translation. Check that lesson controls still respond to clicks.
- Check that the extension reports an unavailable translation model clearly and that activating it on another site captures nothing.
