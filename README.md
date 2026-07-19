# Codex Notebook

Codex Notebook 是一个使用 Docusaurus 搭建的 Codex 架构问答笔记站点，框架结构参考 `luochang212/DL-Demos`：

- 研究对象：`openai/codex`
- 站点源码位于 `website/`
- 文档入口位于 `website/docs/intro.mdx`
- 问答索引位于 `website/docs/qa-notes.mdx`
- 每个问答章节位于 `website/docs/qa/`
- 侧边栏配置位于 `website/sidebars.js`
- 站点配置位于 `website/docusaurus.config.js`

## 本地运行

```bash
cd website
npm install
npm run start
```

## 构建

```bash
cd website
npm run build
```

## 记录格式

每个问题都会保留：

- 原始问题
- 调研主题
- 为什么重要
- 当前判断
- 代码入口
- 后续追问
