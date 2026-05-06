import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ========================================================================
        // Forest Theme - Material Design 3 森林主题色彩系统
        // ========================================================================

        // ==================== Surface 层级 - 这是高级感的核心 ====================
        // MD3 提出的全新概念：从亮到暗 7 个层级，替代传统的白色卡片
        // 使用原则：越在上层的元素，背景色越深
        surface: {
          DEFAULT: "#f8faf9",    // ✅ 整个页面的最底层背景
          dim: "#d8dada",        // ✅ 禁用状态、遮罩层
          bright: "#f8faf9",     // ✅ 高亮表面
        },
        "surface-container": {
          lowest: "#ffffff",     // ✅ 最白 - 弹窗、卡片（最顶层）
          low: "#f2f4f3",        // ✅ 输入框背景、按钮常态
          DEFAULT: "#eceeed",    // ✅ 鼠标 hover 状态
          high: "#e6e9e8",       // ✅ 按钮点击、active 状态
          highest: "#e1e3e2",    // ✅ 最深 - 分割线、边框
        },
        "on-surface": {
          DEFAULT: "#191c1c",    // ✅ 主要正文文字（最常用）
          variant: "#414844",    // ✅ 次要文字、说明文字
        },
        "inverse-surface": "#2e3131",    // ✅ 深色模式表面
        "inverse-on-surface": "#eff1f0", // ✅ 深色模式文字

        // ==================== 轮廓和边框 ====================
        outline: {
          DEFAULT: "#717973",    // ✅ 输入框边框、实线边框
          variant: "#c1c8c2",    // ✅ 卡片边框、分割线
        },
        "surface-tint": "#3f6653",      // ✅ 表面着色

        // ==================== Primary 主色 - 森林绿 ====================
        primary: {
          DEFAULT: "#012d1d",    // ✅ 主按钮背景、强调色（核心品牌色）
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#006c48",        // ✅ 次要按钮
          600: "#16a34a",
          700: "#15803d",
          800: "#012d1d",
          900: "#14532d",
          950: "#052e16",
        },
        "on-primary": "#ffffff",        // ✅ 按钮上的文字颜色
        "primary-container": {
          DEFAULT: "#1b4332",    // ✅ 强调容器背景
        },
        "on-primary-container": "#86af99", // ✅ 容器内的文字
        "inverse-primary": "#a5d0b9",    // ✅ 深色模式主色

        // ==================== Secondary 辅助色 ====================
        secondary: {
          DEFAULT: "#006c48",    // ✅ 次要按钮背景
        },
        "on-secondary": "#ffffff",       // ✅ 次要按钮文字
        "secondary-container": "#92f7c3",// ✅ AI 消息气泡背景！
        "on-secondary-container": "#00734d", // ✅ AI 消息文字

        // ==================== Tertiary 第三色 ====================
        tertiary: {
          DEFAULT: "#002d1a",    // ✅ 用户消息气泡背景！
        },
        "on-tertiary": "#ffffff",        // ✅ 用户消息文字！
        "tertiary-container": "#1a432e", // ✅ 引用卡片高亮背景
        "on-tertiary-container": "#84b095", // ✅ 引用卡片文字

        // ==================== Fixed 颜色变体（内部用） ====================
        "primary-fixed": {
          DEFAULT: "#c1ecd4",
          dim: "#a5d0b9",
        },
        "on-primary-fixed": {
          DEFAULT: "#002114",
          variant: "#274e3d",
        },
        "secondary-fixed": {
          DEFAULT: "#92f7c3",
          dim: "#75daa8",
        },
        "on-secondary-fixed": {
          DEFAULT: "#002113",
          variant: "#005235",
        },
        "tertiary-fixed": {
          DEFAULT: "#c0edd0",
          dim: "#a4d1b4",
        },
        "on-tertiary-fixed": {
          DEFAULT: "#002112",
          variant: "#264f39",
        },

        // ==================== Error 错误色 ====================
        error: {
          DEFAULT: "#ba1a1a",    // ✅ 错误提示、删除按钮
        },
        "on-error": "#ffffff",           // ✅ 错误按钮文字
        "error-container": "#ffdad6",    // ✅ 错误提示气泡背景
        "on-error-container": "#93000a", // ✅ 错误提示文字

        // ==================== Background 背景 ====================
        background: "#f8faf9",           // ✅ 全局背景色
        "on-background": "#191c1c",      // ✅ 全局默认文字色
        "surface-variant": "#e1e3e2",    // ✅ 变体表面
      },

      // ========================================================================
      // 字号系统 - 7 个标准层级
      // ========================================================================
      fontSize: {
        // 大标题 - 登录页大标题
        "headline-xl": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        // 页面标题 - 欢迎页标题
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" }],
        // 卡片标题
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        // AI 消息正文
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        // 用户消息、按钮文字
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        // 按钮标签、文档名称
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "600" }],
        // 辅助文字、时间、状态
        "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "500" }],
      },

      // ========================================================================
      // 圆角系统 - MD3 大圆角风格
      // ========================================================================
      borderRadius: {
        "2xl": "1.5rem",    // ✅ 消息气泡
        xl: "1.5rem",       // ✅ 大按钮、卡片
        lg: "1rem",         // ✅ 输入框、小按钮
        md: "0.75rem",      // ✅ 引用卡片
        sm: "0.5rem",       // ✅ 小型元素
      },

      // ========================================================================
      // 字重
      // ========================================================================
      fontWeight: {
        bold: "700",        // ✅ 标题
        semibold: "600",    // ✅ 按钮、标签
        medium: "500",      // ✅ 辅助文字
        regular: "400",     // ✅ 正文
      },

      // ========================================================================
      // 字体系列 - Manrope 专为 UI 设计的现代字体
      // ========================================================================
      fontFamily: {
        sans: ["Manrope", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
