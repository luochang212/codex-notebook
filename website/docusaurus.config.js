import { themes as prismThemes } from 'prism-react-renderer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Codex 问答笔记',
  tagline: '把关键问题整理成可继续深挖的 Codex 架构研究主题',
  favicon: 'img/logo.svg',

  url: 'https://luochang212.github.io',
  baseUrl: '/codex-notebook/',

  onBrokenLinks: 'throw',

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css',
      type: 'text/css',
      crossorigin: 'anonymous',
    },
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themes: ['@docusaurus/theme-mermaid'],

  plugins: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['zh', 'en'],
        indexBlog: false,
        highlightSearchTermsOnTargetPage: true,
        docsRouteBasePath: '/',
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/og-image.jpg',
      metadata: [
        {
          name: 'keywords',
          content:
            'Codex, OpenAI Codex, coding agent, agent runtime, architecture, context management, compaction, prompt cache',
        },
        {
          name: 'description',
          content:
            'Codex 问答笔记针对 openai/codex 代码库，把关键问题整理成可继续深挖的架构研究主题，覆盖上下文管理、压缩、缓存、工具治理和运行时边界。',
        },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      navbar: {
        title: 'Codex Notebook',
        logo: {
          alt: 'Codex Notebook Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            href: 'https://github.com/openai/codex',
            label: 'Codex',
            position: 'right',
          },
        ],
      },

      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} Codex Notebook. Built with Docusaurus.`,
      },

      mermaid: {
        theme: {
          light: 'neutral',
          dark: 'dark',
        },
      },

      prism: {
        theme: prismThemes.nightOwl,
        darkTheme: prismThemes.nightOwl,
        additionalLanguages: ['rust', 'bash', 'json', 'toml'],
        magicComments: [
          {
            className: 'theme-code-block-highlighted-line',
            line: 'highlight-next-line',
            block: { start: 'highlight-start', end: 'highlight-end' },
          },
          {
            className: 'code-block-key-line',
            line: 'key-line',
            block: { start: 'key-start', end: 'key-end' },
          },
        ],
      },

      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 4,
      },
    }),

  headTags: [
    {
      tagName: 'script',
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Codex 问答笔记',
        url: 'https://luochang212.github.io/codex-notebook/',
        description: '针对 openai/codex 代码库的架构与实现问题研究型问答笔记',
      }),
    },
  ],
};

export default config;
