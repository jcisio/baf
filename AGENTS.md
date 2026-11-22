# Repository instructions

## Maintain the specs

Update the applicable spec in the same change as every code, UI, configuration, build, or deployment change. Record the resulting behavior, relevant constraints, and how to verify it. Keep verified results distinct from planned work. Extend an existing spec when it covers the area.

- [Extension spec](docs/specs/2026-11-22-beast-academy-french-design.md) covers scanning, OCR, translation, tooltips, compatibility, privacy, and Store preparation.
- [Website and release spec](docs/specs/2026-11-22-baf-website-and-release-design.md) covers the public site, responsive layout, GitHub Releases, and SSH deployment.

## Implement and verify

- State material assumptions and define how to verify multi-step changes. Make the smallest change that meets the request and preserve surrounding behavior.
- Keep the extension scoped to Beast Academy classroom pages. Keep OCR, translation, and lesson content on-device. Chrome can download its language model.
- Run `npm test` and `npm run build` for extension changes. Add tests for observable regressions that the existing suite would miss.
- Keep English and French website copy in sync. For a site layout change, check all four public pages in a browser. Verify that none scrolls horizontally above 1400 CSS pixels.
- For a release or deploy change, verify the matching GitHub Release, the ZIP's root manifest, or the public website files as applicable.
- Record reproducible tooling friction in `~/paper-cuts.md`.

## Work with Git and deployment

- Stay on the current branch. When asked to commit, use a concise subject under 50 characters. Keep commits unsigned and omit attribution trailers.
- Keep credentials, `node_modules/`, generated `dist/`, and local build ZIPs out of Git. The installable ZIP belongs in GitHub Releases.
- Match release tags to the version in `extension/manifest.json`. Use **Deploy BAF website** with an existing release tag for website-only deployments.
- Omit personal SSH aliases and hosting provider names from public documentation.
- Keep the deployment key scoped to the BAF receiver. Never print or commit private keys or tokens. Never post Gerrit comments.
