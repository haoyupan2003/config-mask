# 把 Nginx 配置发给 AI 排错前，我做了个脱敏小工具

> 一行命令脱敏，一键还原原文。纯前端单文件 HTML，零依赖、断网可用、所有数据只在本机。

## 写在前面

最近在排查一个 Nginx 配置问题，想发给 AI 帮我看看。但打开配置一看：

```nginx
server_name api.qlinyun.com;
proxy_pass http://172.16.200.173:8093;
ssl_certificate_key /www/server/panel/vhost/cert/api.qlinyun.com/privkey.pem;
DB_PASSWORD=MyS3cret#Pass_2026;
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE;
```

真实域名、内网 IP、私钥路径、数据库密码、AWS AccessKey —— 全在配置里。直接发出去等于把生产环境的钥匙塞给一个黑盒模型。

手动改？配置 100 多行，IP 域名端口路径密钥加起来 30 多处，一个个改下来 10 分钟，改完了 AI 给建议我又得改回去对照原配置。这种摩擦感太重了。

于是花了一个周末做了 **config-mask** —— 一个纯前端单文件 HTML 工具，专门解决"配置分享前的脱敏"问题。

![工具初始界面](../screenshots/zh/01-initial.png)

## 核心思路：脱敏不是把所有东西都涂黑

市面上的脱敏工具大多有两种极端：

1. **全部不可逆** —— IP / 域名 / 路径 / 密码都替换成 `***`，AI 给的建议完全没法对照原文映射回去
2. **全部可逆** —— 密码、私钥也存了映射表，等于"假脱敏"，浏览器开发者工具就能查到

config-mask 采用**可逆 + 不可逆分层**（IP / 域名 / 路径默认可还原；密码 / 私钥 / AK·SK 默认显示为 `[KEY_PERM]` 且不可还原）。设计原理见 [设计见解](INSIGHTS.md)。

| 类型 | 例子 | 默认可还原 | 占位符 |
|---|---|---|---|
| IP / 域名 / 端口 / 路径 / 服务名 | `10.0.0.5` `api.example.com` `:8080` | 是 | `[IP_01.A3F9]` `[DOMAIN_01.A3F9]` |
| 密码 / 私钥 / AK·SK / Token | `DB_PASSWORD=xxx` `-----BEGIN RSA PRIVATE KEY-----` | 否（可选开启） | `[KEY_PERM]` |

## 三步完成脱敏 + 还原

### 第一步：粘贴原配置

左侧 textarea 粘贴你的 Nginx / 宝塔 / YAML / env / 私钥类配置：

![粘贴原配置](../screenshots/zh/02-input.png)

### 第二步：点击「脱敏 →」

右侧立即显示带高亮的脱敏结果。**占位符以青色 / 红色高亮**，一眼能看出哪些是可逆项（青）、哪些是不可逆项（红）：

![脱敏完成](../screenshots/zh/03-desensitized.png)

可逆项为青色，`[KEY_PERM]` 为红色（不可逆）。

### 第三步：分享 + 还原

把脱敏后的配置复制发给 AI。AI 看到的就是干净的占位符结构：

```nginx
upstream [UPSTREAM_01.ELFV]{
	server localhost:[PORT_03.ELFV];
}

server
{
    listen [PORT_01.ELFV];
	listen [PORT_02.ELFV] ssl http2;
    server_name [DOMAIN_01.ELFV] [DOMAIN_02.ELFV];
    index index.php index.html index.htm default.php default.htm default.html;
    root [PATH_01.ELFV];
    include [PATH_02.ELFV];
    
    location / {
  		 proxy_pass http://[UPSTREAM_02.ELFV];
  		 ...
```

AI 完全能看懂结构（`upstream` `server` `listen` `proxy_pass` 这些 Nginx 关键字都保留），但拿不到真实数据。

AI 给出建议后，把脱敏文本粘回右侧 → 点「← 还原」→ 一秒恢复原始配置：

![还原成功](../screenshots/zh/07-restored.png)

## 设计细节

占位符带会话 ID、高亮实现、持久化权衡等，见 [设计见解](INSIGHTS.md)。

## 还有哪些贴心设计

### 公共域名白名单

`github.com` `google.com` `aliyun.com` `cloud.tencent.com` 等 40+ 公共域名自动放行，不脱敏。这些域名出现在配置里通常是无害的（比如 NPM 源、Docker 镜像仓库），如果也脱敏反而让 AI 看不懂。

### 文件后缀智能识别

`index.html` `enable-php-74.conf` `php.ini` 这些文件名不会被误识别为域名。内置 80+ 文件后缀黑名单 + JS 过滤双重保护。

### Nginx 指令路径优先识别

```nginx
include /www/server/panel/vhost/nginx/api.example.com.conf;
```

这种指令后的完整路径会被优先整体识别为一个 `[PATH_xx]`，避免 `api.example.com.conf` 被拆散后误识别。

### 持久化开关（可选）

默认关闭（最安全，刷新即销毁）。需要跨会话还原时开启，映射存到 localStorage：

![持久化开关](../screenshots/zh/05-persist-enabled.png)

### 还原密钥（可选，默认关闭）

开启后，密码/私钥会存入映射表，`[KEY_PERM]` 也可还原。开启前会弹出安全提示，提醒用完后清理 localStorage：

![还原密钥确认](../screenshots/zh/08-restore-secrets-warn.png)

### 映射管理面板

可以查看所有历史会话，激活某个旧会话作为当前活跃会话，或删除单个会话：

![映射管理面板](../screenshots/zh/04-mapping-panel.png)

## 实战：env 文件脱敏

env 文件是另一个典型场景。一段典型的 env 配置：

```env
DB_HOST=10.0.0.5
DB_PASSWORD=MyS3cret#Pass_2026
ALIYUN_ACCESS_KEY_ID=LTAI4GxYJkqVXmNp2sT3uHw
GITHUB_TOKEN=ghp_abcdef1234567890abcdefghijklmnopqrstuvwxyz
PAYMENT_SERVICE_URL=http://payment.internal:8081
API_BASE_URL=https://api.trading.example.com
```

脱敏后：

```env
DB_HOST=[IP_01.A3F9]
DB_PASSWORD=[KEY_PERM]
ALIYUN_ACCESS_KEY_ID=[KEY_PERM]
GITHUB_TOKEN=[KEY_PERM]
PAYMENT_SERVICE_URL=http://[DOMAIN_01.A3F9]:[PORT_01.A3F9]
API_BASE_URL=https://[DOMAIN_02.A3F9]
```

![env 脱敏效果](../screenshots/zh/06-env-desensitized.png)

注意几点：
- `DB_HOST` 的 IP 是可逆的（`[IP_01]`），还原后能拿回真实 IP
- `DB_PASSWORD`、`ALIYUN_ACCESS_KEY_ID`、`GITHUB_TOKEN` 默认是 `[KEY_PERM]`，**不可还原**
- 开启「还原密钥」后，上述项也可还原（密钥会存入映射 / localStorage）
- `payment.internal` 域名是可逆的，端口 `8081` 也是可逆的

## 安全说明

- 零网络请求、零第三方依赖、断网可用
- 默认关闭持久化与还原密钥，刷新即销毁映射
- 默认情况下 `[KEY_PERM]` 不存映射；仅在你显式开启「还原密钥」时存储

## 在线部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 适合谁用

- **运维 / SRE** —— 排查 Nginx / 宝塔配置问题时发给 AI 或同事
- **后端开发** —— 把 Docker Compose / env 配置发到群里讨论时
- **技术博主** —— 写教程时分享真实配置示例（自动去除敏感信息）
- **开源项目维护者** —— 收到用户 issue 附带的配置时，让用户先用工具脱敏

## 不适合谁

- 需要 IPv6 脱敏的（暂未实现）
- 需要跨设备还原的（映射在本地 localStorage，换设备无法还原）
- 需要团队级映射服务的（违背"纯本地"原则）
- 需要复杂上下文感知密码识别的（当前靠 60+ 关键词匹配）

## 项目地址

- GitHub: [https://github.com/your-username/config-mask](https://github.com/your-username/config-mask)
- 在线 Demo: [你的 Vercel 地址]

欢迎 Issue、PR、Star。Roadmap 见 [设计见解 · 未来方向](INSIGHTS.md#六未来方向)。

## 写在最后

开发过程中踩过的坑与规则演进，见 [设计见解](INSIGHTS.md)。如果这个工具帮到了你，欢迎 Star。

[English](../en/intro-article.md)
