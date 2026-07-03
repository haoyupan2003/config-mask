# config-mask design notes

## 1. Why build this

Existing approaches:

1. **Server-side masking** (e.g. logback MaskingPatternLayout) — deploy, code changes, runtime only
2. **CLI scripts** (sed/perl) — fragile regex, easy to miss fields, needs shell skills
3. **Online tools** (e.g. regex101) — can't upload sensitive data; catch-22

**Pain point**: sharing Nginx configs with AI means manual redaction (~10 min) or leaking IPs, domains, and passwords.

**Positioning**: **offline + single file + one click + restorable** — minimize friction when sharing configs with AI, teammates, or communities.

## 2. Design principles (priority order)

### 1. Security > usability > features

- Persistence off by default
- `[KEY_PERM]` not stored by default; optional **Restore secrets** toggle with confirmation dialog
- Placeholders carry session IDs (shorter vs. safer)

### 2. Reversible + irreversible layers

Core decision. All-irreversible makes mapping AI advice back painful. All-reversible stores secrets — fake masking.

**Layers**:
- Non-secrets (IP, domain, port, path, service name) → reversible, stored
- Secrets → `[KEY_PERM]` by default, not stored
- With **Restore secrets** on → still `[KEY_PERM]` in output; originals in `permSecrets` (ordered)

By default, passwords and keys stay unrecoverable even if memory is dumped.

### 3. Single file, zero dependencies

For **auditability**. Users can read one ~40KB HTML file and trust it. No npm, no CDN fonts, no supply chain to review.

### 4. Self-describing placeholders

`[DOMAIN_01.A3F9]`:
- `DOMAIN` — type for humans and AI
- `01` — sequence number
- `A3F9` — session ID (prevents cross-session collisions)

Better than `***` or bare `[1]` `[2]`.

## 3. Technical decisions

### Why session ID suffix on placeholders?

Early format `[DOMAIN_01]` broke when two configs were masked:

```
Config 1: [DOMAIN_01] => api1.example.com
Config 2: [DOMAIN_01] => api2.example.com
```

Restoring config 1 could pick config 2's mapping.

With SID: `[DOMAIN_01.A3F9]` vs `[DOMAIN_01.XXYZ]` — unique, routed by session.

**Cost**: 4 extra chars. **Benefit**: multi-config isolation. Worth it.

### Why textarea + backdrop highlighting?

- Users must edit/paste on the right (restore flow)
- Placeholders should be color-coded

textarea can't do partial styling. Solution:
- Bottom `<pre class="output-backdrop">` — highlighted HTML, `pointer-events: none`
- Top `<textarea>` — transparent text, visible caret
- Identical font/padding/line-height

Scroll sync, live `renderBackdrop()`, copy still gets plain text from textarea.

### Why `[KEY_PERM]` is not stored by default

**Wrong**: store everything, skip `[KEY_PERM]` on restore — passwords visible in DevTools.

**Default**: `[KEY_PERM]` never enters the mapping Map.

**Optional**: **Restore secrets** after warning — `permSecrets` array, in-order restore. Toggle off clears stored secrets.

### Why persistence is off by default?

Masking is infrequent; users often one-shot. Auto-persist risks leaving mappings in localStorage for malicious same-origin scripts. Explicit opt-in is less surprising.

## 4. Rule evolution

### v1: simple regex

```js
result.replace(/(\d+\.){3}\d+/g, '[IP]')
```

Ate version numbers like `1.2.3` and malformed IPs.

### v2: lookaround assertions

Strict IPv4 regex — OK for placeholders (no conflict).

### Domain pitfalls

`([a-z]+\.)+[a-z]{2,}` matched `index.html`, `nginx.conf` as domains.

**Fix**: match first, then JS-filter file extensions via blacklist.

### Nginx directive paths

Generic path regex split `include .../php.ini` incorrectly.

**Fix**: `NGINX_PATH_DIRECTIVE_REGEX` runs first for `include`, `root`, `access_log`, `ssl_certificate`, etc.

## 5. SID vs UUID

UUID placeholders are unreadable at 36 chars. 4-char alphanumeric SID (~1.7M combos per session) is short and sufficient.

## 6. Future direction

### Cross-device restore

Export/import mapping snapshot as JSON — user must guard the file (contains reversible plaintext).

### Context-aware password detection

Today: 60+ key name keywords. Custom names like `db_pwd` may slip through. Heuristics are possible but risky.

### Team collaboration

Central mapping service conflicts with local-only design. P2P is an open question.

## 7. Advice for similar tools

1. Default to the safest persistence setting
2. Irreversible by default — optional restore only with explicit opt-in
3. Semantic placeholders beat `***`
4. Test-driven changes for regex-heavy tools
5. Single file beats `npm install` for trust

## 8. Test coverage

4 suites, 52 assertions:

| Suite | Tests |
|-------|-------|
| Masking rules (Nginx / env / keys / YAML / ports / allowlist) | 13 |
| Multi-session isolation | 5 |
| Baota Nginx regression | 13 |
| localStorage persistence | 21 |

Isolation tests cover two configs sharing placeholder numbers in different sessions.

[中文](../zh/INSIGHTS.md)
