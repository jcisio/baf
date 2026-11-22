# BAF website and release

## Website

The BAF website is static and available in [English](https://dev.jcisio.com/baf/) and [French](https://dev.jcisio.com/baf/fr.html). Each homepage describes the extension, shows an English-to-French example, and gives manual Chrome installation instructions. Both download buttons link to the same selected version's public GitHub Release ZIP. The website identifies the extension as independent and unofficial.

The privacy policy is available in [English](https://dev.jcisio.com/baf/privacy.html) and [French](https://dev.jcisio.com/baf/privacy-fr.html). Both versions describe first-use consent, local storage of the consent choice, active-tab checks, on-device lesson processing, Chrome's language-model download, and standard hosting logs. The public privacy contact is `dev@jcisio.com`.

Each page declares its language. A language link in the header opens the same page in the other language. Installation and privacy navigation stay in the selected language.

Every page has a localized footer link to the public GitHub source repository. The download buttons on the homepages point to the installable release ZIP.

## Layout and color

- Keep the homepage compact. The site content is at most 53 rem wide with side gutters, body text defaults to 16 CSS pixels, and the homepage heading is at most 2.75 rem. Stack the hero columns on narrow screens.
- Use Beast Academy reds from its published website for the badge, links, download button, keyboard focus, and translation example. Use `#ed1940` for the accent, `#d50033` for actions, and `#a60126` for deeper red surfaces. Maintain at least 4.5:1 contrast for regular text.
- All four pages must have no horizontal scrollbar when the viewport is wider than 1400 CSS pixels. Address overflow at its source so content remains visible.
- All pages share one stylesheet. Deployment appends a content hash to the stylesheet URL so browsers can fetch the latest CSS after a page reload.

## Build and publish releases

The version in `extension/manifest.json` determines the release version. Use a matching three-part tag such as `v0.1.1`. Pushing the tag triggers **Build extension release**. The same workflow can run manually for an existing tag. If the release already exists, the workflow verifies that its ZIP contains the same files as the new build and reuses it.

The release job checks out the exact tag, checks the manifest version, installs the locked npm dependencies, runs the tests, and builds the extension. It validates the ZIP and attaches `beast-academy-en-francais-<version>.zip` to the matching GitHub Release with `manifest.json` at the archive root.

## Deploy the website

After the release job succeeds, **Deploy BAF website** publishes the site. It can also run manually with an existing GitHub Release tag for website-only changes. The deploy job verifies the public GitHub asset, renders the selected version and download URL into both homepages, and adds the stylesheet content hash to all four pages.

GitHub Actions uses the `dev` environment to connect to `jcisio.com` with the `BAF_DEPLOY_KEY` secret and the pinned host key in `BAF_SSH_KNOWN_HOSTS`. The release workflow passes the deployment secret by name to the reusable job, where the environment supplies its value. The key invokes a restricted receiver that accepts only `index.html`, `fr.html`, `privacy.html`, `privacy-fr.html`, and `site.css`. It stages and validates the upload before installing the files under `/home/hainam/dev.jcisio.com/baf`, with the English homepage installed last. The GitHub Release remains the source for downloads.

## Verification

- Run the release workflow and check that the tag matches the ZIP's root manifest and that GitHub serves the asset without sign-in. The [v0.1.1 release run](https://github.com/jcisio/baf/actions/runs/45065877452) used the manual trigger for the initial tag.
- Confirm that the deploy run succeeds and serves the exact staged files over HTTPS. Verification uses bounded requests so an unresponsive site cannot hold the deployment slot indefinitely. Check that both download links point to the matching GitHub Release and all pages reference the expected stylesheet hash.
- On each homepage and privacy page, use the language switch to visit its counterpart. Verify that the installation and privacy links stay in the selected language and that the footer opens the BAF source repository on GitHub.
- For layout changes, verify that all four pages remain readable and that each document's scroll width equals its viewport width above 1400 CSS pixels.
