# Before sending Nginx configs to an AI, I built a masking tool

> One-click mask, one-click restore. Single HTML file, zero deps, works offline — all data stays on your machine.

## Background

I was debugging an Nginx issue and wanted an AI to help. But the config contained:

```nginx
server_name api.qlinyun.com;
proxy_pass http://172.16.200.173:8093;
ssl_certificate_key /www/server/panel/vhost/cert/api.qlinyun.com/privkey.pem;
DB_PASSWORD=MyS3cret#Pass_2026;
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE;
```

Real domains, private IPs, key paths, DB passwords, AWS keys — sending that raw is handing production secrets to a black box.

Manual redaction? 100+ lines, 30+ sensitive spots, 10 minutes of work — then map AI suggestions back by hand. Too much friction.

So I built **config-mask**: a single-file offline tool for masking configs before you share them.

![Initial UI](../screenshots/en/01-initial.png)

## Core idea: don't redact everything

Most tools fall into two extremes:

1. **All irreversible** — IPs, domains, paths, passwords become `***`; you can't map AI advice back to your real config.
2. **All reversible** — passwords and keys stay in a mapping table; DevTools can read them. Fake masking.

config-mask uses **reversible + irreversible layers** (IPs/domains/paths restore by default; passwords/keys show as `[KEY_PERM]` and do not restore by default). See [Design notes](INSIGHTS.md).

| Type | Examples | Restorable by default | Placeholder |
|------|----------|----------------------|-------------|
| IP / domain / port / path / service | `10.0.0.5` `api.example.com` `:8080` | Yes | `[IP_01.A3F9]` `[DOMAIN_01.A3F9]` |
| Password / key / AK·SK / token | `DB_PASSWORD=xxx` `-----BEGIN RSA PRIVATE KEY-----` | No (optional) | `[KEY_PERM]` |

## Mask and restore in three steps

### Step 1: Paste original config

Paste Nginx / Baota / YAML / env / key material on the left:

![Paste input](../screenshots/en/02-input.png)

### Step 2: Click "Mask →"

The right pane shows highlighted placeholders — cyan for reversible, red for `[KEY_PERM]`:

![Masked output](../screenshots/en/03-desensitized.png)

### Step 3: Share and restore

Copy the masked config for AI or teammates. Structure stays readable:

```nginx
upstream [UPSTREAM_01.ELFV]{
	server localhost:[PORT_03.ELFV];
}
...
```

After AI suggestions, paste masked text back → click "← Restore" → original config returns:

![Restored](../screenshots/en/07-restored.png)

## Design details

Session IDs on placeholders, highlight implementation, persistence tradeoffs — see [Design notes](INSIGHTS.md).

## Other features

### Public domain allowlist

`github.com`, `google.com`, `aliyun.com`, etc. — 40+ public domains are left as-is.

### File extension filter

`index.html`, `enable-php-74.conf`, `php.ini` won't be mistaken for domains.

### Nginx directive paths

Full paths after `include`, `root`, `ssl_certificate`, etc. are matched as one `[PATH_xx]` unit.

### Optional persistence

Off by default (safest). Enable to keep mappings in localStorage across reloads:

![Persistence toggle](../screenshots/en/05-persist-enabled.png)

### Restore secrets (optional, off by default)

When enabled, passwords and keys are stored in the mapping table so `[KEY_PERM]` can be restored. A warning appears first — clear localStorage when finished:

![Restore secrets warning](../screenshots/en/08-restore-secrets-warn.png)

### Mapping session panel

View history, activate a session, or delete one:

![Mapping panel](../screenshots/en/04-mapping-panel.png)

## Example: env file

Input:

```env
DB_HOST=10.0.0.5
DB_PASSWORD=MyS3cret#Pass_2026
ALIYUN_ACCESS_KEY_ID=LTAI4GxYJkqVXmNp2sT3uHw
GITHUB_TOKEN=ghp_abcdef1234567890abcdefghijklmnopqrstuvwxyz
```

Masked:

```env
DB_HOST=[IP_01.A3F9]
DB_PASSWORD=[KEY_PERM]
ALIYUN_ACCESS_KEY_ID=[KEY_PERM]
GITHUB_TOKEN=[KEY_PERM]
```

![Env masked](../screenshots/en/06-env-desensitized.png)

- `DB_HOST` IP is reversible
- Passwords and tokens are `[KEY_PERM]` by default — not restorable
- With **Restore secrets** on, they can be restored (stored in mappings / localStorage)
- Domains and ports in URLs are reversible

## Security

- Zero network requests, zero third-party deps, works offline
- Persistence and restore secrets are off by default
- `[KEY_PERM]` is not stored unless you explicitly enable restore secrets

## Deploy online

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## Who it's for

- **Ops / SRE** — share Nginx/Baota configs with AI or peers
- **Backend devs** — discuss Docker Compose / env files safely
- **Technical writers** — real config examples without secrets
- **Maintainers** — ask reporters to mask configs in issues

## Limitations

- No IPv6 masking yet
- No cross-device restore (mappings are local)
- No team-wide mapping service (by design)
- Password detection uses 60+ keyword patterns only

## Links

- GitHub: [https://github.com/your-username/config-mask](https://github.com/your-username/config-mask)
- Live demo: [your Vercel URL]

Issues, PRs, and stars welcome. Roadmap: [Design notes · Future](INSIGHTS.md#6-future-direction).

## Closing

Pitfalls and rule evolution: [Design notes](INSIGHTS.md). If this helps, consider starring the repo.

[中文](../zh/intro-article.md)
