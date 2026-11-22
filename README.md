# Beast Academy en français

A Chrome extension for reading visible Beast Academy classroom text in French. It uses page text and on-device OCR of book illustrations and exercise instructions. Chrome translates the English locally. The first use may require downloading Chrome’s English–French model.

[Extension website](https://dev.jcisio.com/baf/) · [GitHub Releases](https://github.com/jcisio/baf/releases) · [Privacy policy](https://dev.jcisio.com/baf/privacy.html)

## Load in Chrome

Download and extract the extension ZIP from [GitHub Releases](https://github.com/jcisio/baf/releases), or run `npm ci` and `npm run build` to build into `dist/`. Use desktop Chrome 138 or newer on a device that supports its Translator API.

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**, choose **Load unpacked**, and select the folder containing `manifest.json`.
3. Open a Beast Academy classroom lesson or its book section and click the extension icon to start the scan. Keep the popup open until the scan finishes. If Chrome asks for a click to prepare the language model, choose **Préparer la traduction**.
4. Hover over text to see French. Click to pin the translation. Press Escape or click × to close it. Tab to focus a translation target and Enter to pin it. A small **FR** button appears beside text that belongs to a site control.
5. Scan again after scrolling or changing pages. Zoom in if the OCR misses small or stylized lettering.

The extension uses temporary access to the active Beast Academy tab and processes the visible capture in memory. Book images and lesson text stay on your device. Video and audio are outside this version.

Run `npm test` to check OCR region positioning, grouping, and duplicate handling.

## Release a version

Update the version in `extension/manifest.json`, commit it, and push a matching tag such as `v0.1.1`. GitHub Actions verifies the version, runs the tests, and publishes the built ZIP as a release asset. To build an existing tag without a release, run **Build extension release** from the repository’s Actions tab and enter the tag.

After publishing the release, the workflow deploys the website and that same ZIP to [dev.jcisio.com/baf](https://dev.jcisio.com/baf/). To redeploy a published release or update the website independently, run **Deploy BAF website** from the Actions tab and enter the release tag.
