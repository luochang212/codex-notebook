/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: '项目简介',
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
          id: 'qa-notes',
          label: '问答索引',
        },
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
      ],
    },
  ],
};

export default sidebars;
