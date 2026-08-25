import type { Config } from 'tailwindcss';

/**
 * 浅色主题色板。
 * ink  → 浅色表面（白 / 暖白阶层）
 * ivory → 深色文字（近黑炭灰阶层）
 * gold → 点缀金，收敛用于关键数字 / CTA / 激活态 / 分隔线
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#FFFFFF',
          900: '#FFFFFF',
          800: '#FAFAF8',
          700: '#F4F2ED',
          600: '#E9E6DE',
        },
        gold: {
          DEFAULT: '#C9A96E',
          light: '#D9C08A',
          dark: '#A5854C',
        },
        ivory: {
          DEFAULT: '#1A1A1A',
          dim: '#55534C',
          mute: '#8B887E',
        },
      },
      fontFamily: {
        serif: ['Georgia', '"Noto Serif SC"', '"Songti SC"', 'STSong', 'SimSun', 'serif'],
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.35em',
      },
    },
  },
  plugins: [],
};

export default config;
