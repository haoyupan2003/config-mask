# Screenshots

UI captures for documentation. Regenerate after UI changes:

```bash
npm install
npx playwright install chromium
npm run screenshots
```

| Path | Language | Used in |
|------|----------|---------|
| `en/` | English UI | [intro-article.md](../en/intro-article.md) |
| `zh/` | 中文 UI | [intro-article.md](../zh/intro-article.md) |

| File | Scene |
|------|-------|
| `01-initial` | Empty tool |
| `02-input` | Nginx sample pasted |
| `03-desensitized` | Masked output |
| `04-mapping-panel` | Sessions modal |
| `05-persist-enabled` | Persistence on |
| `06-env-desensitized` | Env file masked |
| `07-restored` | After restore |
| `08-restore-secrets-warn` | Restore secrets confirmation |
