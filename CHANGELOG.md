# Changelog

All notable changes to this project are documented in this file.

## [1.2.0] - 2026-07-03

### Added

- Single-file offline config mask / restore tool (`index.html`)
- Support for Nginx, Baota panel, YAML, env, and private-key configs
- Reversible / irreversible layered masking (`[KEY_PERM]` secrets irreversible by default)
- Session-scoped placeholders for multi-config isolation
- Optional localStorage persistence (off by default)
- Optional secret restore toggle (off by default, with security warning)
- English / 中文 UI with language switch
- textarea + backdrop dual-layer placeholder highlighting
- Example configs, docs, screenshots, and issue templates

### Security defaults

- Persistence: off
- Restore secrets: off

[1.2.0]: https://github.com/haoyupan2003/config-mask/releases/tag/v1.2.0
