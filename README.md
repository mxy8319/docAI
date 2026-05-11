<div align="center">

# 📄 DocAI

### 让你的文档会说话

## 基于 RAG 技术的智能文档问答助手

</div>

## ✨ 产品介绍

DocAI 是一款基于检索增强生成（RAG）技术的智能文档问答系统。上传文档后，即可通过自然语言与文档进行对话，获得准确答案的同时，每个引用都可溯源到原文档对应页码。

> **核心价值**：不再需要在上百页文档中反复搜索，直接问，马上得到准确答案。

---

## 🎯 核心功能

| 功能                | 说明                                          |
| ------------------- | --------------------------------------------- |
| 📤 **智能文档解析** | 支持 PDF / TXT / Markdown，自动提取文本与页码 |
| 💬 **自然语言问答** | 像聊天一样向文档提问，流式打字机输出          |
| 🔗 **引用溯源**     | 每个答案标注来源，点击跳转到对应页码          |
| 📄 **在线预览**     | 内置 PDF 预览器，直接查看原文上下文           |
| 📚 **多文档管理**   | 上传多个文档，统一管理知识库                  |

---

## 🚀 产品演示

### 完整交互流程

```
用户上传文档
    ↓
AI 自动解析分块
    ↓
向量化存储到 PGVector
    ↓
用户提问
    ↓
语义检索最相关的 5 个片段
    ↓
LLM 基于上下文生成回答
    ↓
用户点击引用 → 直接跳转到对应页码
```

---

## 🛠️ 技术栈

| 层级           | 技术选型                      |
| -------------- | ----------------------------- |
| **全栈框架**   | Next.js 14 App Router         |
| **UI 样式**    | TailwindCSS 灰色极简风格      |
| **用户认证**   | Auth.js                       |
| **LLM SDK**    | Vercel AI SDK                 |
| **嵌入模型**   | OpenAI text-embedding-3-small |
| **向量数据库** | PGVector (PostgreSQL 插件)    |
| **ORM**        | Prisma                        |
| **文件存储**   | Supabase Storage              |
| **文档解析**   | PDF.js                        |
| **部署**       | Vercel                        |

---

## 🏗️ 项目结构

```
docAI/
├── app/
│   ├── page.tsx           # 产品首页
│   ├── login/page.tsx     # 登录页
│   ├── chat/page.tsx      # 主聊天界面
│   └── layout.tsx         # 根布局
├── components/
│   ├── chat-message.tsx   # 对话消息组件
│   ├── citation-card.tsx  # 引用来源卡片
│   ├── chat-input.tsx     # 聊天输入框
│   ├── upload-dropzone.tsx # 拖拽上传
│   └── document-item.tsx  # 文档列表项
└── lib/
    ├── rag/               # RAG 核心逻辑
    ├── parser/            # 文档解析分块
    └── auth.ts            # 认证配置
```

---

## 📦 本地开发

### 环境要求

- Node.js 18+
- PostgreSQL 15+ (with pgvector)
- OpenAI API Key

### 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 访问
open http://localhost:3000
```

### 可用命令

```bash
pnpm dev        # 启动开发服务器
pnpm build      # 生产构建
pnpm lint       # ESLint 检查
pnpm format     # Prettier 格式化
pnpm typecheck  # TypeScript 类型检查
```

---

## 🎨 设计理念

### 极简灰色风格

> 弱化界面存在感，突出内容本身

- 9 级灰度色彩系统
- 无多余装饰元素
- 柔和的过渡动效
- 沉浸式对话体验

---

## 🤝 关于项目

这是一个用于展示 AI 全栈开发能力的作品集项目。完整实现了 RAG 技术栈的所有核心环节，包括：

- 前端交互体验设计
- 后端服务架构
- 向量检索引擎
- Prompt 工程化

每一个技术点都可以深入展开讨论。

---

<div align="center">

**Made with ❤️ by DocAI Team**

</div>
