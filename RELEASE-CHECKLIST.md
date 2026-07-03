# Release checklist

Verify before each release.

## Code & docs

- [x] `index.html` version matches changelog (v1.2.0)
- [x] `README.md` and `README.zh-CN.md` are up to date
- [x] `docs/en/` and `docs/zh/` reflect current features (incl. restore secrets)
- [x] Screenshots present under `docs/screenshots/` (regenerate: `npm run screenshots`)
- [x] `examples/` use fictional data only
- [x] `LICENSE` is Apache-2.0

## Security

- [x] No real `.env`, keys, or production configs in the repo
- [x] `.gitignore` covers `.env` and secrets
- [x] Default off: persistence and restore secrets

## GitHub

- [x] Issue templates available (`.github/ISSUE_TEMPLATE_*.md`)
- [ ] Repo description and topics set on GitHub

## Deploy

- [x] `vercel.json` security headers configured
- [ ] Live site opens `index.html` (verify after Vercel deploy)
- [x] Mask / restore smoke test passed (`npm test`)

## Ship

- [ ] Tag (e.g. `v1.2.0`)
- [ ] GitHub Release with notes
- [ ] Optional: update Vercel production

[中文](RELEASE-CHECKLIST.zh-CN.md)
