import type { Config } from 'tailwindcss';

/**
 * 设计规范 v1.0 色板（参照 ArchDaily 简约现代语言，见 docs/DESIGN_SYSTEM.md）。
 * paper     → 页面基底（白 / 次级软白）
 * ink       → 近黑正文 / 灰阶次要文字
 * line      → 1px 细分割线 / 卡片描边
 * accent    → 单点缀红：关键链接 / 激活态 / 主 CTA / 重点数字（面积克制）
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#FFFFFF',
          soft: '#FAFAFA',
        },
        ink: {
          DEFAULT: '#141414',
          2: '#6B6B6B',
          3: '#9A9A9A',
        },
        line: '#E5E5E5',
        accent: {
          DEFAULT: '#E4022B',
          dark: '#B80223',
        },
      },
      fontFamily: {
        sans: [
          '"Helvetica Neue"',
          'Helvetica',
          'Inter',
          'Arial',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
