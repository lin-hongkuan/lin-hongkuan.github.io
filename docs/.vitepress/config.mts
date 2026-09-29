import { defineConfig } from 'vitepress'

// 导入主题的配置
import { blogTheme } from './blog-theme'

// 如果使用 GitHub/Gitee Pages 等公共平台部署
// 通常需要修改 base 路径，通常为“/仓库名/”
// 如果项目名已经为 name.github.io 域名，则不需要修改！
// const base = process.env.GITHUB_ACTIONS === 'true'
//   ? '/vitepress-blog-sugar-template/'
//   : '/'

// Vitepress 默认配置
// 详见文档：https://vitepress.dev/reference/site-config
export default defineConfig({
  // 继承博客主题(@sugarat/theme)
  extends: blogTheme,
  // base,
  lang: 'zh-cn',
  title: '@linhk/blog',
  description: 'linhongkuan的个人博客',
  lastUpdated: true,
  markdown: {
    math: true
  },
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['script', {}, `window.MathJax = { tex: { inlineMath: [['\\(', '\\)']], displayMath: [['\\[', '\\]']] }, startup: { typeset: false } };`],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js', async: '' }]
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern'
        }
      }
    }
  },
  themeConfig: {
    // 展示 2,3 级标题在目录中
    outline: {
      level: [2, 3],
      label: '目录'
    },
    // 默认文案修改
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '相关文章',
    lastUpdatedText: '上次更新于',

    // 设置logo
    logo: '/logo.png',
    // editLink: {
    //   pattern:
    //     'https://github.com/ATQQ/sugar-blog/tree/master/packages/blogpress/:path',
    //   text: '去 GitHub 上编辑内容'
    // },
    nav: [
      { text: '首页', link: '/' },
      { text: '关于作者', link: 'https://lin-hongkuan.github.io/' }
    ],
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/lin-hongkuan'
      }
    ],
    sidebar: {
      '/cwm/': [
        {
          text: 'Code World Model 学习手册',
          collapsed: false,
          items: [
            { text: '专题长文', link: '/cwm/' },
            { text: '前往官方论文', link: 'https://arxiv.org/abs/2608.25927' },
            { text: '前往官方仓库', link: 'https://github.com/buaacyw/code-world-model' }
          ]
        }
      ],
      '/world-agent/': [
        {
          text: 'World Agent 论文导读',
          collapsed: false,
          items: [
            { text: '中文导读长文', link: '/world-agent/' },
            { text: '原论文 PDF', link: 'https://arxiv.org/pdf/2609.32692' },
            { text: '原论文 HTML', link: 'https://arxiv.org/html/2609.32692' },
            { text: '代码与数据', link: 'https://github.com/HCPLab-SYSU/WorldAgent-Benchmark' }
          ]
        }
      ]
    }
  }
})
