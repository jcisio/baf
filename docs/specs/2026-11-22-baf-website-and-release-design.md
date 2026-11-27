# BAF website and release

## Website

The BAF website is static and available in [English](https://dev.jcisio.com/baf/) and [French](https://dev.jcisio.com/baf/fr.html). Each homepage describes the extension, shows an English-to-French example, and shows side-by-side install buttons for the [Chrome Web Store](https://chrome.google.com/webstore/detail/cokhncjonhniclmcofefijjigechjnlm) and the localized Mozilla Add-ons listing. Each button shows its minimum desktop version directly underneath, Chrome 138+ or Firefox 153+. Each button and its version label wrap together when the available width is too narrow. The Chrome manual guide links to the selected Chrome ZIP and tells users to load the extracted folder. The Firefox shortcut opens the temporary installation guide, which links to the Firefox ZIP and tells users to load the extracted manifest after each restart. The website identifies the extension as independent and unofficial.

Both homepages share seven light-mode screenshots and a short, silent video recorded in desktop Chrome’s Test profile. The video uses standard playback controls and the numbered instructions and image descriptions are localized. The captures show Chrome in English. The tutorial covers adding the Store extension, pinning BAF, reviewing first-use consent, and opening a translation in the public Beast Academy demo exercise. A separate book walkthrough shows the same scrolled comic panel before and after a rescan. The extension scans visible content, so readers click BAF again after scrolling to newly visible text or changing pages. All four headers use the extension’s red icon, which also identifies the toolbar button in the written guides.

The privacy policy is available in [English](https://dev.jcisio.com/baf/privacy.html) and [French](https://dev.jcisio.com/baf/privacy-fr.html). Both versions describe first-use consent, local storage of the consent choice, active-tab checks, on-device lesson processing, Chrome's language-model download, and standard hosting logs. The public privacy contact is `dev@jcisio.com`.

Each page declares its language. A language link in the header opens the same page in the other language. Installation and privacy navigation stay in the selected language.

Every page has a localized footer link to the public GitHub source repository.

Both homepages link to the same [unofficial English–French math glossary](https://dev.jcisio.com/baf/math-glossary-en-fr.pdf). The glossary is a printable reference for math terminology and common lesson wording. All eight sections fit on two A4 landscape pages in two columns per page for printing on a single double-sided sheet. It is versioned in the website source and served as a separate PDF from the extension ZIP.

## Layout and color

- Keep the homepage compact. The site content is at most 53 rem wide with side gutters, body text defaults to 16 CSS pixels, and the homepage heading is at most 2.75 rem. Stack the hero columns on narrow screens.
- Use Beast Academy reds from its published website for the badge, links, install button, keyboard focus, and translation example. Use `#ed1940` for the accent, `#d50033` for actions, and `#a60126` for deeper red surfaces. Maintain at least 4.5:1 contrast for regular text.
- All four pages must have no horizontal scrollbar when the viewport is wider than 1400 CSS pixels. Address overflow at its source so content remains visible.
- All pages share one stylesheet. Deployment appends a content hash to the stylesheet URL so browsers can fetch the latest CSS after a page reload.

## Build and publish releases

The version in `extension/manifest.json` determines the release version. Use a matching three-part tag. Pushing the tag triggers **Build extension release**. The same workflow can run manually for an existing tag that includes both build targets. Runs for the same tag are serialized. If the release already exists and is published, the workflow compares each existing package with its new build before uploading any missing package. A mismatch fails the job.

The release job checks out the exact tag, checks the manifest version, installs the locked npm dependencies, runs the shared tests, and builds Chrome and Firefox. It checks the integrity, root manifest, version, and English OCR data of both ZIPs and checks that the Firefox package includes the Bergamot worker and translation model. It attaches both packages to the matching GitHub Release. The Chrome package is `beast-academy-en-francais-<version>.zip`, which is also the website's manual installation download. The unsigned Firefox package is `beast-academy-en-francais-<version>-firefox.zip` and supports temporary installation from its extracted manifest.

## Deploy the website

After the release job succeeds, **Deploy BAF website** publishes the site. It can also run manually with an existing GitHub Release tag for website-only changes. The deploy job verifies the public Chrome and Firefox assets and renders their version and download URLs into both homepages. Deployments with the Chrome-only tags `v0.1.1` and `v0.1.2` verify only the Chrome ZIP and omit the temporary Firefox guide and its shortcut. Both store buttons remain available. The deploy job adds the stylesheet content hash to all four pages.

The JPEG screenshots and H.264 MP4 live in `site/tutorial/`. The site icon is copied from `extension/icons/baf-48.png`. The media load from relative URLs during local previews. The deploy job embeds them as data URLs in the rendered pages so they ship in the existing deployment archive. The deploy job checks every rendered HTML file against the receiver’s 1 MiB limit before upload.

GitHub Actions uses the `dev` environment to connect to `jcisio.com` with the `BAF_DEPLOY_KEY` secret and the pinned host key in `BAF_SSH_KNOWN_HOSTS`. The release workflow passes the deployment secret by name to the reusable job, where the environment supplies its value. The key invokes a restricted receiver that accepts only the four HTML pages, `site.css`, and `math-glossary-en-fr.pdf`. It stages and validates the upload before installing the files under `/home/hainam/dev.jcisio.com/baf`, with the English homepage installed last.

## Verification

- Run the release workflow and check that both assets appear on the same release and that GitHub serves them without sign-in. Check that both root manifests match the tag and that the Firefox ZIP contains the Bergamot worker and English–French model. Rerun the workflow to check that it accepts the two matching assets. The [v0.1.1 release run](https://github.com/jcisio/baf/actions/runs/45065877452) used the manual trigger for the initial Chrome release.
- Confirm that the deploy run succeeds and serves the exact staged files over HTTPS. SSH upload and HTTPS verification use timeouts so an unresponsive connection cannot hold the deployment slot indefinitely. On each homepage, follow the Firefox shortcut, check that both download links use the selected release tag and the correct browser filenames, and verify the temporary installation and restart instructions. Check that the primary install buttons open the same Chrome Store listing and that all four pages reference the expected stylesheet hash.
- On each homepage, check that the install buttons are side by side at desktop widths, show the correct minimum version below each button, and fit on narrow screens. Check that both Firefox buttons point to the same public Mozilla Add-ons listing in their respective languages and that the listing offers an installable Firefox version.
- On each homepage and privacy page, use the language switch to visit its counterpart. Verify that the installation and privacy links stay in the selected language and that the footer opens the BAF source repository on GitHub.
- On both homepages, verify that the glossary link opens the same two-page A4 landscape PDF, labeled unofficial and with the corrected explanation of congruent figures.
- On both homepages, check that all seven tutorial screenshots load, the video plays and seeks, and the public demo link opens the exercise. In desktop Chrome, open the book from the demo, scan, scroll inside the viewer, click BAF again, and open a translation in the newly visible panel. Check that the deployment renderer embeds the same seven screenshots and video on both homepages and the extension’s own icon on all four pages.
- For layout changes, verify that all four pages remain readable and that each document's scroll width equals its viewport width above 1400 CSS pixels.

### Dual-package workflow verification on November 24, 2026

The workflow passed linting and its test, build, and archive steps ran locally with Node 24 in a clean directory. A simulated GitHub release verified creation with both packages, reuse of matching packages, upload of a missing Firefox package, and rejection of drafts and mismatches. The [v0.1.3 release run](https://github.com/jcisio/baf/actions/runs/45487515721) published both ZIPs on the same release. Both public downloads matched their GitHub SHA-256 checksums and contained a root manifest with version 0.1.3.

The website renderer verified both download URLs for v0.1.3 and produced a Chrome-only site for v0.1.2. In Chrome, both staged homepages opened the Firefox guide from its shortcut and linked to the correct ZIP for each browser. All four staged pages had no horizontal overflow at 375, 1440, and 1920 CSS pixels.

### Tutorial verification on November 24, 2026

Chrome’s Test profile installed the Store extension, opened and closed a pinned translation in the public demo exercise, and translated a newly visible speech bubble after scrolling and scanning again. Both staged homepages decoded all seven screenshots. All four staged pages had no horizontal overflow in 375, 1440, and 1920 CSS-pixel frames. The deployment renderer verified the v0.1.2 download URL, and the receiver accepted the staged archive in a local test.

After conversion to JPEG, deployment rendering again verified the v0.1.2 download URL. Both staged homepages embedded byte-identical copies of all seven JPEGs and were under 404 kB each.

The light-mode refresh recorded a fresh Store installation, exercise translation, and book rescan in Chrome’s Test profile. Both staged homepages decoded seven screenshots, played the 39-second video, and sought to the translated book panel. Chrome loaded the extension icon on all four pages and reported no horizontal overflow at 375, 1440, and 1920 CSS-pixel frame widths. Both rendered homepages were under 966 kB and the local receiver accepted the archive.
