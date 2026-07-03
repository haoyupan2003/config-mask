# config-mask

配置文件脱敏 / 还原工具。纯前端单文件，双击 [`index.html`](index.html) 即用，数据不出本机。

## 快速开始

粘贴配置 → 脱敏 → 分享；需要时粘回 → 还原。

可选开关：**持久化映射**（localStorage）、**还原密钥**（存储密码/私钥以还原 `[KEY_PERM]` —— 默认关闭，开启时有安全提示）。

界面支持 English / 中文（顶部语言切换）。

## 文档

| 文档 | 内容 |
|------|------|
| [介绍文章](docs/zh/intro-article.md) | 使用教程（含截图）、功能说明 |
| [设计见解](docs/zh/INSIGHTS.md) | 设计原则、技术决策、识别规则演进 |
| [示例配置](examples/README.zh-CN.md) | 测试用样例文件 |

截图：[`docs/screenshots/zh/`](docs/screenshots/zh/) · [`docs/screenshots/en/`](docs/screenshots/en/)

详见 [CHANGELOG](CHANGELOG.md) 与 [发布清单](RELEASE-CHECKLIST.zh-CN.md)。

[English README](README.md)

## 部署

[`vercel.json`](vercel.json) 已配置，可部署到 Vercel 等静态托管。

## License

[Apache-2.0](LICENSE)
