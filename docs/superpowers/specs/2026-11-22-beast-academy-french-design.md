# French translation for Beast Academy

## What the learner does

On a Beast Academy classroom page, clicking the Chrome extension icon starts translation. If Chrome requires a separate gesture to prepare the language model, the popup shows **Préparer la traduction**. Hovering over a supported block of English shows a French tooltip nearby. Clicking the block pins the tooltip. A close button or Escape dismisses it. Keyboard focus on an extension-provided translation target shows the tooltip, and Enter pins it.

The extension keeps the original English, illustrations, and lesson layout visible. Translation targets sit over readable text regions. If a region is already interactive, the extension uses an adjacent translation target so the site control retains its click behavior.

## What it reads

The extension uses visible page text where available. For illustrated book pages and exercise instructions rendered as pixels, it uses the visible tab capture and runs bundled Tesseract.js English OCR on the device. It uses the OCR bounding boxes to place hover targets, grouping nearby lines when they appear to belong to the same speech bubble or instruction block. Scrolling or changing the page invalidates targets from the prior view. The learner can scan the newly visible area from the same extension button.

Video, narration, and read-aloud audio are outside this version.

## Where processing happens

This is a Chrome Manifest V3 extension. It uses temporary active-tab access after a user gesture and checks that the page is a Beast Academy classroom page before reading or capturing it. It captures the visible tab, crops to the lesson area locally, and keeps captures and results in memory for the active view.

Chrome's built-in Translator API translates English into French on supported desktop installations. Chrome may need an initial language model download. The extension displays a French status message while preparing the model and an explanation if translation is unavailable or the scan finds no readable text. The extension sends neither captured pixels nor lesson text to a remote service.

## How to verify it

- On page 33 of **More Than 20, Part 1**, hover over a visible bubble, confirm that the French matches the English in that bubble, and click to pin it. Verify keyboard pinning and dismissal.
- Scroll to a different set of bubbles and scan again. Confirm that targets follow the newly visible text and old targets disappear.
- On the same lesson's exercise instructions, confirm that hovering over the counting prompt shows its French translation. Check that lesson controls still respond to clicks.
- Check that the extension reports an unavailable translation model clearly and that activating it on another site captures nothing.
