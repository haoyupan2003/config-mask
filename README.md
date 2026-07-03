# config-mask

Mask and restore config files in the browser. Single HTML file — open [`index.html`](index.html), data never leaves your machine.

## Quick start

Paste config → Mask → Share. To undo, paste back → Restore.

Optional toggles: **Persist mappings** (localStorage), **Restore secrets** (store passwords/keys for `[KEY_PERM]` restore — off by default, shows a security warning).

UI: English / 中文 (top bar language switch).

## Docs

| Doc | What's inside |
|-----|---------------|
| [Introduction](docs/en/intro-article.md) | Tutorial with screenshots, feature overview |
| [Design notes](docs/en/INSIGHTS.md) | Principles, technical decisions, rule evolution |
| [Examples](examples/README.md) | Sample configs for testing |

Screenshots: [`docs/screenshots/en/`](docs/screenshots/en/) · [`docs/screenshots/zh/`](docs/screenshots/zh/)

See [CHANGELOG](CHANGELOG.md) and [release checklist](RELEASE-CHECKLIST.md).

[中文说明](README.zh-CN.md)

## Deploy

[`vercel.json`](vercel.json) is ready for Vercel or any static host.

## License

[Apache-2.0](LICENSE)
