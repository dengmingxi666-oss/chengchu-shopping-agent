# Render 部署

选择 Web Service，连接本仓库 main 分支，Root Directory 留空。

| 配置 | 值 |
| --- | --- |
| Build Command | `npm install` |
| Start Command | `npm start`（已有 `yarn start` 也可以） |
| Health Check Path | `/healthz` |
| Environment: DEEPSEEK_API_KEY | 在 Render 填入自己的完整 Key |
| Environment: DEEPSEEK_MODEL | `deepseek-flash` |

保存后选择 Manual Deploy → Deploy latest commit（开启自动部署时，推送 main 会自动发布）。

启动日志应显示 `Web service listening on 0.0.0.0:10000`，实际端口以 Render 的 PORT 为准。打开 Render 的访问地址即可使用带模型服务端的页面。`/api/status` 仅返回配置状态，不返回密钥。

线上不开放 `/settings` 或 `/configure`，这些只用于本机服务。本机保存的密钥不会自动同步到 Render；请在 Render Environment 中配置。GitHub Pages 继续运行规则演示，不受此服务影响。

接口采用单进程基础限流，在反向代理下可能由多个访客共享额度，不是生产级配额系统。

## 项目内配置

本机运行 `npm start` 前，可将 `.env.example` 复制为 `.env`，填写自己的 `DEEPSEEK_API_KEY`。服务启动时自动读取项目根目录 `.env`；已有系统环境变量优先。实际 `.env` 不提交 GitHub。

Render 使用 Environment 中的同名变量，不需要上传 `.env`。更新 Key 后选择 Save and deploy。打开服务的 `/api/status` 检查 `configured` 是否为 `true`，这只表示已配置，真实调用仍需在对话页验证。
