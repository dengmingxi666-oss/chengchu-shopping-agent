## 澄初智能导购助手｜项目说明

本项目面向个人护理商品咨询场景，帮助顾客通过少量对话获得符合需求和预算的商品建议。支持需求追问、商品推荐与对比、预算取舍，以及不适和未知政策场景的处理。

## 技术路线

采用“模型理解需求 + 程序执行规则”的方案：

用户输入 → DeepSeek 提取需求 → 更新对话状态 → 检查业务规则 → 筛选商品并计算价格 → 输出建议与依据

前端使用 HTML、CSS 和 JavaScript，服务端使用 Node.js。将题目手册中的六款商品和业务要求整理成结构化知识表，推荐依据均来自手册。由于资料规模较小，当前不使用向量数据库。

## 模型配置

模型服务： DeepSeek 官方 API。

当前模型： deepseek-flash。

调用方式： 服务端调用 Chat Completions 接口，关闭思考模式，要求返回 JSON。

模型职责： 提取品类、肤质、预算、敏感倾向和当前不适等信息，并保留用户原话作为证据。

密钥管理： 通过本机配置页填写，保存在服务端配置文件中，不写入网页或 GitHub 仓库。

目前本机版本已接通真实模型，商品推荐、预算冲突和不适处理三个场景验证通过；GitHub Pages 版本提供规则演示。

## 设计思路

少量追问。 信息不足时，每轮最多提出两个必要问题，不猜测用户情况。

推荐有据。 商品名称、特点和价格从知识表读取；总价与预算差额由程序计算。

安全优先。 用户明确表示当前不适时停止护肤品推荐，不诊断、不承诺治疗效果。

尊重选择。 超出预算时说明差额和单件取舍，不强推组合；未知优惠和渠道政策转门店确认。

便于验收。 页面展示需求状态、商品信息和规则依据，支持导出对话记录；模型调用失败时明确提示。

项目的核心是让模型负责理解自然语言，让程序负责事实、价格和业务边界，形成可解释、可测试的导购流程。

## 运行状态

- GitHub Pages 发布的是**规则演示**，不调用大模型。
- 源码包含 DeepSeek 和火山方舟适配器。本机 DeepSeek 已完成三个真实调用验证：洁面推荐、预算冲突、当前不适处理。自动化接口测试使用模拟响应，GitHub Pages 仍为规则模式。
- 38 项规则与接口检查已经在原项目通过；本仓库在每次部署前重新执行。
- 不提供诊断、库存、支付，也不承诺资料未提供的优惠和渠道政策。

## GitHub Pages 发布

在仓库 Settings → Pages → Build and deployment 中，选择 Source 为 **GitHub Actions**。随后进入 Actions，运行 **Test and deploy shopping assistant**；后续推送 main 会自动测试和部署。

正式地址以成功的 GitHub Actions 部署页面显示为准。仅上传源码不代表网站已经发布。

GitHub Pages 是静态托管，不能运行本项目的模型服务端，也不能安全保存和调用方舟密钥。不要把密钥写入网页、提交记录或构建产物。

## 本机运行模型适配版

需要 Node.js 22 或更高版本，无第三方运行时依赖。

```sh
npm run start:local
```

打开 http://127.0.0.1:8765/ 。本机配置入口 http://127.0.0.1:8765/settings 可验证方舟 API Key 与模型 ID，验证通过才保存到本机忽略文件。该配置不会自动同步到 GitHub Pages。

DeepSeek 版本运行 `node work/config-server-deepseek.mjs`，打开 http://127.0.0.1:8766/ ，在 http://127.0.0.1:8766/settings 配置自己的密钥。密钥不会包含在源码中；配置文件已加入忽略列表。

```sh
npm test
npm run build
```

静态站点生成到 `_site/`；测试记录生成到 `outputs/自测记录_v2.json`。程序只在页面当前会话保留需求状态，导出内容由使用者决定是否分享。

## 技术路线

用户输入 → 需求解析 → 原话证据与状态更新 → 安全/政策路由 → 必要追问或目录筛选 → 程序算价 → 输出核验。

模型模式把自然语言转成结构化需求；模型不决定价格、创造商品或承诺政策。六个 SKU 使用结构化知识表，无向量数据库；金额由程序计算。当前不适优先于推荐，规则未覆盖时明确转人工。

| 文件 | 职责 |
| --- | --- |
| `work/site/dist/knowledge.js` | 商品事实、手册来源与规则 |
| `work/site/dist/agent.js` | 状态、筛选、安全条件、报价与校验 |
| `work/site/dist/ui.js` | 对话、产品卡片、依据和记录导出 |
| `work/site/runtime.mjs` | 服务端模型适配、结构校验、失败处理 |
| `work/config-server.mjs` | 本机网页与模型配置服务 |
| `build-pages.mjs` | 构建明确标记的静态规则演示 |

## 自测示例

输入：我是干皮，没有不适，不敏感，想要简单护理组合，预算300元。

预期：P101 169 元 + P202 259 元 = 428 元，超预算 128 元；展示预算内单件取舍，不虚构折扣。

输入：最近脸在刺痛，想试试果酸。

预期：停止护肤品推荐，说明不能诊断，建议暂停刺激性尝试并咨询专业人士。

## 参考项目

设计调研借鉴 [NVIDIA Retail Shopping Assistant](https://github.com/NVIDIA-AI-Blueprints/retail-shopping-assistant)、[SalesGPT](https://github.com/filip-michalsky/SalesGPT)、[ShoppingGPT](https://github.com/Hoanganhvu123/ShoppingGPT)。没有复制其实现代码或安装其依赖，具体阅读位置与固定提交见 [RESEARCH.md](work/site/RESEARCH.md)。

部署依据：[GitHub Pages 说明](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)、[自定义部署工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。


## Render 模型服务部署

使用 Web Service，启动命令 `npm start`，在 Render Environment 配置 `DEEPSEEK_API_KEY` 和 `DEEPSEEK_MODEL=deepseek-flash`。服务监听 `0.0.0.0` 和平台 `PORT`。完整步骤见 [RENDER.md](RENDER.md)。
