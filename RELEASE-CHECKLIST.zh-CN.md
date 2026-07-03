# 开源发布清单

发布前逐项确认。

## 代码与文档

- [x] `index.html` 版本号与 CHANGELOG 一致（v1.2.0）
- [x] `README.md` 与 `README.zh-CN.md` 已更新
- [x] `docs/en/` 与 `docs/zh/` 无过时描述（含还原密钥说明）
- [x] 截图已就绪（重新生成：`npm run screenshots`）
- [x] `examples/` 样例均为虚构数据
- [x] `LICENSE` 为 Apache-2.0

## 安全

- [x] 仓库内无真实 `.env`、私钥、生产配置
- [x] `.gitignore` 已忽略敏感文件
- [x] 默认关闭 localStorage 持久化与密钥还原

## GitHub

- [x] Issue 模板可用
- [ ] 仓库 Description / Topics 已填写

## 部署

- [x] `vercel.json` 安全头配置正确
- [ ] 线上可正常打开 `index.html`（Vercel 部署后验证）
- [x] 脱敏 / 还原流程验证通过（`npm test`）

## 发布

- [ ] 打 tag（如 `v1.2.0`）
- [ ] 创建 GitHub Release
- [ ] 可选：更新 Vercel 生产部署

[English](RELEASE-CHECKLIST.md)
