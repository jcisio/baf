# BAF website and release

## Website

The [BAF website](https://dev.jcisio.com/baf/) is a static English-language site on `dh`. The homepage describes the extension, shows an English-to-French example, and gives manual Chrome installation instructions. Its download button links directly to the selected version's public GitHub Release ZIP. The website identifies the extension as independent and unofficial.

The [privacy page](https://dev.jcisio.com/baf/privacy.html) describes on-device lesson processing, Chrome's language-model download, and standard hosting logs. The public privacy contact is `dev@jcisio.com`.

## Layout and color

- Keep the homepage compact. The site content is at most 53 rem wide with side gutters, body text defaults to 16 CSS pixels, and the homepage heading is at most 2.75 rem. Stack the hero columns on narrow screens.
- Use Beast Academy reds from its published website for the badge, links, download button, keyboard focus, and translation example. Use `#ed1940` for the accent, `#d50033` for actions, and `#a60126` for deeper red surfaces. Maintain at least 4.5:1 contrast for regular text.
- The homepage and privacy page must have no horizontal scrollbar when the viewport is wider than 1400 CSS pixels. Address overflow at its source so content remains visible.
- Both pages share one stylesheet. Deployment appends a content hash to the stylesheet URL so browsers can fetch the latest CSS after a page reload.

## Build and publish releases

The version in `extension/manifest.json` determines the release version. Use a matching three-part tag such as `v0.1.1`. Pushing the tag triggers **Build extension release**. The same workflow can be run manually for an existing tag without a published release.

The release job checks out the exact tag, checks the manifest version, installs the locked npm dependencies, runs the tests, and builds the extension. It validates the ZIP and attaches `beast-academy-en-francais-<version>.zip` to the matching GitHub Release with `manifest.json` at the archive root.

## Deploy the website

After the release job succeeds, **Deploy BAF website** publishes the site. It can also run manually with an existing GitHub Release tag for website-only changes. The deploy job verifies the public GitHub asset, renders the selected version and download URL into the homepage, and adds the stylesheet content hash to both pages.

GitHub Actions uses the `dev` environment to connect to `jcisio.com` with the `BAF_DEPLOY_KEY` secret and the pinned host key in `BAF_SSH_KNOWN_HOSTS`. The key invokes a restricted receiver that accepts only `index.html`, `privacy.html`, and `site.css`. It stages and validates the upload before installing the files under `/home/hainam/dev.jcisio.com/baf`, with the homepage installed last. The GitHub Release remains the source for downloads.

## Verification

- Run the release workflow and check that the tag matches the ZIP's root manifest and that GitHub serves the asset without sign-in. The [v0.1.1 release run](https://github.com/jcisio/baf/actions/runs/45065877452) used the manual trigger for the initial tag.
- Confirm that the deploy run succeeds and serves the exact staged files over HTTPS. Check that the download link points to the matching GitHub Release and both pages reference the expected stylesheet hash. The [red theme deployment](https://github.com/jcisio/baf/actions/runs/45067714436) passed these checks.
- For layout changes, verify that the homepage and privacy page remain readable and that the document's scroll width equals the viewport width above 1400 CSS pixels. The current layout passed at 1401, 1440, 1920, and 2560 CSS pixels in the browser.
