/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Codex 问答笔记',
    },
    {
      type: 'category',
      label: 'Codex 架构问答',
      collapsible: true,
      collapsed: false,
      link: {
        type: 'generated-index',
        title: 'Codex 架构问答',
        description:
          '把每个关键问题整理成可以继续验证、追问和扩写的研究主题。',
        slug: '/qa',
      },
      items: [
        {
          type: 'doc',
          id: 'qa/context-collection',
          label: '01. query 上下文构造',
        },
        {
          type: 'doc',
          id: 'qa/prompt-cache-compaction',
          label: '02. 缓存命中与压缩',
        },
        {
          type: 'doc',
          id: 'qa/codex-architecture-overview',
          label: '03. 整体架构与复杂度',
        },
        {
          type: 'doc',
          id: 'qa/skill-mechanism',
          label: '04. skill 发现与调用',
        },
      ],
    },
  ],
};

export default sidebars;
