# Beast Academy en français

A browser extension for reading visible Beast Academy classroom text in French. It uses page text and on-device OCR of book illustrations and exercise instructions. Chrome translates locally with its built-in English–French model, which it may download on first use. A Firefox prototype uses bundled Bergamot and an English–French model.

[Extension website](https://dev.jcisio.com/baf/) · [GitHub Releases](https://github.com/jcisio/baf/releases) · [Privacy policy](https://dev.jcisio.com/baf/privacy.html)

## Install in Chrome

[Install from the Chrome Web Store](https://chrome.google.com/webstore/detail/cokhncjonhniclmcofefijjigechjnlm) by choosing **Add to Chrome**. Use desktop Chrome 138 or newer on a device that supports its Translator API.

### Manual installation

Download and extract the extension ZIP from [GitHub Releases](https://github.com/jcisio/baf/releases), or run `npm ci` and `npm run build` to build into `dist/`.

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**, choose **Load unpacked**, and select the folder containing `manifest.json`.

## Try the Firefox prototype

Use desktop Firefox 153 or newer. Download and extract the `-firefox.zip` asset from a [GitHub Release](https://github.com/jcisio/baf/releases) that includes it, or run `npm ci` and `npm run build:firefox` to download and verify the model and build the package in `dist-firefox/`.

1. Open `about:debugging#/runtime/this-firefox`.
2. Choose **Load Temporary Add-on** and select the package's `manifest.json`. Load it again after restarting Firefox.
3. Open the [guest demo lesson](https://beastacademy.com/demo/school/classroom/1/7/1511/1) and click **Beast Academy en français** in the extensions menu.

## Use the extension

1. Open a Beast Academy classroom lesson or its book section and click the extension icon. On first use, review the privacy notice and choose **Allow and translate** to start. If Chrome asks for a click to prepare the language model, choose **Préparer la traduction**. Keep the popup open until the scan finishes.
2. Hover over text to see French. Click to pin the translation. Press Escape or click × to close it. Tab to focus a translation target and Enter to pin it. A small **FR** button appears beside text that belongs to a site control.
3. Scan again after scrolling or changing pages. Zoom in if the OCR misses small or stylized lettering.

The extension uses temporary access to the active Beast Academy tab and processes the visible capture in memory. Book images and lesson text stay on your device. Video and audio are outside this version.

Run `npm test` to check OCR region positioning, grouping, and duplicate handling.

## Release a version

Update the version in `extension/manifest.json`, commit it, and push a matching tag. GitHub Actions verifies the version, runs the shared tests, and builds and checks both ZIPs. The same release contains the Chrome asset `beast-academy-en-francais-<version>.zip` and the unsigned Firefox asset `beast-academy-en-francais-<version>-firefox.zip`. To rerun the pipeline for a tag that includes both builds, run **Build extension release** from the repository’s Actions tab and enter the tag.

After publishing the release, the workflow deploys the website to [dev.jcisio.com/baf](https://dev.jcisio.com/baf/) with the Chrome ZIP linked under manual installation. To redeploy a published release or update the website independently, run **Deploy BAF website** from the Actions tab and enter the release tag.
