# AGENTS.md

本仓库是一个 Codex 架构问答笔记站点。站点使用 Docusaurus，结构参考 `luochang212/DL-Demos` 的 `website/` 子项目。

默认研究对象是 `openai/codex` 代码库。除非用户明确要求扩展到其他项目或产品文档，否则所有架构判断、源码引用和伪代码都必须回到该代码库验证。

## 项目结构

- `website/`：Docusaurus 站点源码。
- `website/docs/intro.mdx`：首页。
- `website/docs/qa-notes.mdx`：问答索引页。
- `website/docs/qa/`：每个问答一个独立章节。
- `website/src/components/ResearchQuestion.tsx`：问答章节的交互组件。
- `website/src/components/ResearchQuestion.module.css`：问答组件样式。
- `website/src/css/custom.css`：站点全局样式。
- `website/sidebars.js`：侧边栏配置。
- `website/docusaurus.config.js`：Docusaurus 配置。

## 开发命令

在 `website/` 目录下运行：

```bash
npm install
npm run start
npm run build
```

修改站点结构、MDX、组件或样式后，至少运行：

```bash
cd website
npm run build
```

构建通过才算完成。`node --localstorage-file` 相关 experimental warning 可以忽略，只要 Docusaurus build 成功即可。

## 本地环境

本仓库允许使用 `.env` 保存本地私有配置。

- `.env`：本地私有文件，不提交。
- `.env.example`：提交到仓库，只保留字段结构。

`.env` 应至少包含：

```bash
CODEX_SOURCE_DIR=
```

`CODEX_SOURCE_DIR` 指向本机可用的 `openai/codex` 源码仓库。涉及 Codex 源码判断时，优先从这个路径核对源码；不要把该本机绝对路径写进文档正文或提交内容。

提交身份不要放在 `.env` 中。需要避免 Git 自动使用带本机 hostname 的邮箱时，应设置本仓库的 local git config，例如 `git config user.name ...` 和 `git config user.email ...`。提交后必须检查 commit metadata。

不要把本机用户名、hostname、本机绝对路径、私人邮箱写进提交元数据或文档正文。

## 内容定位

这个项目不是源码目录索引，也不是普通博客。它的目标是把用户提出的关键问题整理成可持续扩展的研究型章节。

每个问答章节必须同时做到两件事：

1. **讲清楚架构判断**：问题背后的取舍、张力、边界和系统设计含义。
2. **触达到底层代码**：直接呈现能支撑判断的关键源码切片，或者写带出处的伪代码。

不要只告诉读者“去读某某文件”。如果选择引用源码解释，就必须保证引用的源码信息浓度足够高。

## 问答章节规范

每个问答是一个独立章节，放在：

```text
website/docs/qa/<topic>.mdx
```

并在 `website/sidebars.js` 中加入对应条目。

章节应该包含：

- 原始问题：保留用户原话。
- 主题抽象：把问题提升成一个可研究的架构主题。
- 当前结论：基于源码阅读后的实质判断。
- 架构张力：说明为什么这个问题不是简单的是/否。
- 关键源码切片：直接展示高信息密度源码或注明出处的伪代码。
- 结论：回到原始问题，指出是否存在误解，以及正确的心智模型。

## 标题规则

标题必须是自然、通顺、有信息量的中文问题或判断句。不要写生硬翻译腔。

不好的例子：

```text
Codex 的架构选择到底在换什么？
```

更好的例子：

```text
Codex 为什么要付出这些架构复杂度？
```

Docusaurus 的 frontmatter `title` 会自动渲染页面顶部标题。不要在 MDX 正文或组件里重复渲染同一个 H1。

## 源码引用原则

这是本项目最重要的写作标准。

### 必须直接呈现关键源码

不要只列路径让读者自己去读。读者打开章节时，应该能直接看到支撑判断的核心代码。

可以引用源码块，也可以写伪代码，但伪代码必须明确注明出处，例如：

```text
出处：根据 codex-rs/core/src/session/turn.rs::run_turn 改写的伪代码。
```

### 只引用高信息密度代码

源码引用必须支撑一个明确判断。低信息量代码不要引用。

高信息密度代码通常具备以下特征：

- 能展示关键状态字段。
- 能展示分支策略，例如 full injection vs diff injection。
- 能展示核心生命周期，例如 turn loop、compaction install、history replacement。
- 能展示边界判断，例如 trusted/untrusted、baseline 是否存在、是否显式 mention。

低信息量代码包括：

- 纯样板。
- 只转发调用的包装函数。
- 长错误处理。
- 单纯类型 import。
- 与章节判断没有直接关系的目录或文件列表。

### 路径是出处，不是内容

可以保留源码路径，但路径只是证据出处，不是正文主体。

不要写成：

```text
请阅读 core/src/session/turn.rs
```

应该写成：

````mdx
出处：`codex-rs/core/src/session/turn.rs::run_turn`

```rust
let first_step_context = sess.capture_step_context(...).await;
...
```
````

## 判断文案原则

不要为了前端显示硬凑字段。尤其是“核心判断”“为什么重要”这类文案，必须来自实际问题和源码事实。

如果某个字段在当前问题下没有实质内容，就改字段名、删掉该展示块，或者把内容合并到正文。不要为了卡片对称写空泛话。

避免这类流于形式的表达：

```text
这决定了系统的稳定性、可扩展性和可维护性。
```

应该写成更具体的判断：

```text
这里真正的风险不是模型能否看到更多上下文，而是 baseline 丢失后是否会错误地继续做 diff，导致模型拿到不完整运行时状态。
```

## 前端与交互原则

交互和设计必须服务理解，不要为了炫技增加信息噪声。

- 每个问答章节可以使用交互组件，但交互组件不能遮蔽核心内容。
- 关键源码切片必须在页面正文中直接可读，不应只藏在交互 tab 里。
- 卡片、标签页、折叠块要帮助读者区分“判断、机制、证据、追问”。
- 不要为了布局对称把内容切成无意义的两栏。
- 如果一个章节需要更自由的结构，可以绕过 `ResearchQuestion` 组件，直接写 MDX。

## 语言风格

使用中文。要求：

- 直接、准确、具体。
- 允许指出用户问题中的错误认知，但要说明为什么。
- 优先解释取舍，而不是堆工程名词。
- 不要写宣传腔。
- 不要把“复杂度”“可扩展性”“稳定性”当万能词，必须落到具体机制。

## 当前重要主题

当前已有章节：

- `website/docs/qa/context-collection.mdx`
- `website/docs/qa/prompt-cache-compaction.mdx`

后续新增章节时，优先保持“一个问题，一个章节，一个明确源码证据链”。

## 工作流约定

修改内容时：

1. 先确认用户最新反馈，避免继续沿用旧方向。
2. 如果修改已有章节，先阅读该章节当前内容。
3. 如果涉及 Codex 源码判断，应优先从 `.env` 的 `CODEX_SOURCE_DIR` 指向的源码仓库核对源码，不要凭记忆写；不要把本机绝对路径写进文档。
4. 使用 `apply_patch` 修改文件。
5. 修改后运行 `cd website && npm run build`。
6. 最终回复说明改了哪些文件，以及构建是否通过。

## 不要做的事

- 不要把每个源码路径都列出来。
- 不要把问答写成目录扫描。
- 不要写重复标题。
- 不要为了组件布局硬凑“核心判断 / 为什么重要”。
- 不要引用信息量低的源码。
- 不要把伪代码伪装成原始源码。
- 不要改动 `website/node_modules/`、`website/build/`、`website/.docusaurus/`。
