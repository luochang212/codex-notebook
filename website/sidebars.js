/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  bookSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: '序章',
    },
    {
      type: 'category',
      label: '第一篇：循环引擎',
      collapsible: true,
      collapsed: false,
      items: [
        'qa/ch01-session-turn',
        'qa/ch02-model-call',
        'qa/ch03-tool-loop',
      ],
    },
    {
      type: 'category',
      label: '第二篇：上下文工程',
      collapsible: true,
      collapsed: false,
      items: [
        'qa/ch04-context-assembly',
        'qa/ch05-cache-compaction',
        'qa/ch06-world-state',
      ],
    },
    {
      type: 'category',
      label: '第三篇：工具与执行',
      collapsible: true,
      collapsed: false,
      items: [
        'qa/ch07-tool-system',
        'qa/ch08-exec-sandbox',
      ],
    },
    {
      type: 'category',
      label: '第四篇：安全与审批',
      collapsible: true,
      collapsed: false,
      items: [
        'qa/ch09-guardian',
      ],
    },
    {
      type: 'category',
      label: '第五篇：多 Agent',
      collapsible: true,
      collapsed: false,
      items: [
        'qa/ch10-agent-roles',
        'qa/ch11-agent-communication',
      ],
    },
    {
      type: 'category',
      label: '第六篇：扩展与配置',
      collapsible: true,
      collapsed: false,
      items: [
        'qa/ch12-skills',
        'qa/ch13-mcp-plugins',
        'qa/ch14-config-layers',
      ],
    },
    {
      type: 'category',
      label: '第七篇：设计哲学',
      collapsible: true,
      collapsed: false,
      items: [
        'qa/ch15-philosophy',
      ],
    },
  ],
};

export default sidebars;
