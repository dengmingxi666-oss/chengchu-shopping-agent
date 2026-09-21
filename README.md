# 澄初 · 有据导购

第 8 题「商品智能导购助手」演示。品牌和六款商品来自虚构考试材料。支持文字咨询、少量追问、商品对比、预算取舍、规则依据及 JSON 导出。

## 运行状态

- GitHub Pages 发布的是**规则演示**，不调用大模型。
- 源码包含火山方舟适配器；真实模型调用尚未验证。接口测试中的模型响应是模拟数据。
- 38 项规则与接口检查已经在原项目通过；本仓库在每次部署前重新执行。
- 不提供诊断、库存、支付，也不承诺资料未提供的优惠和渠道政策。

## GitHub Pages 发布

在仓库 Settings → Pages → Build and deployment 中，选择 Source 为 **GitHub Actions**。随后进入 Actions，运行 **Test and deploy shopping assistant**；后续推送 main 会自动测试和部署。

正式地址以成功的 GitHub Actions 部署页面显示为准。仅上传源码不代表网站已经发布。

GitHub Pages 是静态托管，不能运行本项目的模型服务端，也不能安全保存和调用方舟密钥。不要把密钥写入网页、提交记录或构建产物。

## 本机运行模型适配版

需要 Node.js 22 或更高版本，无第三方运行时依赖。

```sh
npm start
```

打开 http://127.0.0.1:8765/ 。本机配置入口 http://127.0.0.1:8765/settings 可验证方舟 API Key 与模型 ID，验证通过才保存到本机忽略文件。该配置不会自动同步到 GitHub Pages。

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
