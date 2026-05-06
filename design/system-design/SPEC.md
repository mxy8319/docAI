# DocAI 技术实施规范 SPEC v1.0

---

## 📋 总览

| 项目 | 说明 |
|------|------|
| **目标** | 6 天完成可演示的 RAG 知识库 MVP |
| **代码量目标** | 1500 行左右 |
| **技术栈** | Next.js 14 + TypeScript + Prisma + PGVector |
| **验收标准** | 上传 PDF → 提问 → 回答带引用 → 点击跳转到对应页码 |

---

## 🚀 实施路线图（6 天）

---

### 📅 Day 1: 项目基础脚手架

**目标**：项目能跑起来，数据库能连接，登录能用。

| 序号 | 任务 | 输出文件 | 验收标准 |
|------|------|---------|---------|
| 1.1 | 初始化 Next.js 14 项目 | `package.json` | `pnpm dev` 能启动，访问 localhost:3000 |
| 1.2 | TypeScript + ESLint 配置 | `tsconfig.json` | 零类型错误 |
| 1.3 | TailwindCSS 配置 | `tailwind.config.ts` | 样式能正常工作 |
| 1.4 | Prisma + PGVector 配置 | `prisma/schema.prisma` | `npx prisma db push` 能执行成功 |
| 1.5 | Auth.js 集成 | `lib/auth.ts` | 能登录 / 登出 |
| 1.6 | 布局基础框架 | `app/layout.tsx` | 导航栏、侧边栏基本布局 |

**Day 1 交付物验证**：
- [ ] 开发服务器正常启动
- [ ] 数据库连接成功，表创建完成
- [ ] 用户能正常登录登出
- [ ] 页面布局完整

---

### 📅 Day 2: 文档解析与向量化

**目标**：上传 PDF，后台自动解析分块向量化入库。

| 序号 | 任务 | 输出文件 | 验收标准 |
|------|------|---------|---------|
| 2.1 | 拖拽上传组件 | `components/upload-dropzone.tsx` | 支持拖放 PDF 文件，显示进度 |
| 2.2 | PDF 文本提取 | `lib/parser/pdf.ts` | 输入 PDF Buffer → 输出带页码的文本数组 |
| 2.3 | 智能分块算法 | `lib/parser/chunker.ts` | 输入长文本 → 输出 512 token 的 chunks |
| 2.4 | OpenAI 向量化封装 | `lib/rag/embedding.ts` | 输入文本 → 输出 1536 维向量 |
| 2.5 | Chunk 批量入库 | `lib/parser/index.ts` | chunks + vectors 批量写入 Postgres |

**Day 2 交付物验证**：
- [ ] 上传一个 10 页 PDF
- [ ] 数据库 Document 表新增记录
- [ ] Chunk 表生成 ~ N 条记录，每条带有 vector、page_num
- [ ] 上传过程无内存溢出

---

### 📅 Day 3: RAG 检索引擎

**目标**：用户提问题能召回最相关的 5 个 chunks。

| 序号 | 任务 | 输出文件 | 验收标准 |
|------|------|---------|---------|
| 3.1 | PGVector 相似度检索 | `lib/rag/retriever.ts` | 问题转向量 → SQL 查询最近邻 |
| 3.2 | 权限过滤 | `lib/rag/retriever.ts` | 只能检索到当前用户自己的文档 |
| 3.3 | RAG Prompt 模板 | `lib/rag/prompt.ts` | 严格的 Prompt 约束，防止幻觉 |
| 3.4 | Vercel AI SDK 集成 | `lib/rag/llm.ts` | 流式调用 OpenAI |
| 3.5 | Chat API 接口 | `app/api/chat/route.ts` | 标准的 OpenAI 兼容接口 |

**Day 3 交付物验证**：
- [ ] curl 调用 /api/chat 能返回流式响应
- [ ] 回答中包含原文引用标记
- [ ] 超出范围的问题回答"我不知道"
- [ ] 响应首字 < 2 秒

---

### 📅 Day 4: 对话交互界面

**目标**：漂亮的聊天界面，流式打字机效果。

| 序号 | 任务 | 输出文件 | 验收标准 |
|------|------|---------|---------|
| 4.1 | assistant-ui 集成 | `app/documents/[id]/page.tsx` | 布局：左侧预览，右侧聊天 |
| 4.2 | 聊天消息组件 | `components/chat-message.tsx` | 用户 / AI 消息气泡样式 |
| 4.3 | 流式输出渲染 | `components/chat.tsx` | 打字机效果流畅 |
| 4.4 | 文档列表页 | `app/page.tsx` | 显示用户所有上传的文档 |
| 4.5 | 自动摘要生成 | `lib/rag/summary.ts` | 上传完自动生成文档摘要 |

**Day 4 交付物验证**：
- [ ] 左右分栏布局正确
- [ ] 打字机流式输出正常
- [ ] 消息气泡样式美观
- [ ] 文档列表能增删

---

### 📅 Day 5: 引用溯源（灵魂功能）

**目标**：点击引用，左侧 PDF 预览自动跳转到对应页码并高亮。

| 序号 | 任务 | 输出文件 | 验收标准 |
|------|------|---------|---------|
| 5.1 | PDF 预览组件 | `components/pdf-preview.tsx` | 渲染 PDF、支持页码跳转 |
| 5.2 | 引用卡片组件 | `components/citation-card.tsx` | 显示来源 + 页码，可点击 |
| 5.3 | 页码跳转联动 | `app/documents/[id]/page.tsx` | 点击引用 → 左侧跳转到对应页 |
| 5.4 | 上下文高亮 | `components/pdf-preview.tsx` | 高亮显示引用的原文内容 |
| 5.5 | 多轮上下文支持 | `lib/rag/retriever.ts` | 对话历史带入下一轮 |

**Day 5 交付物验证**：
- [ ] PDF 清晰渲染，翻页流畅
- [ ] 点击引用卡片立刻跳转到对应页码
- [ ] 对应内容有高亮标记
- [ ] 连续 5 轮对话上下文正常

---

### 📅 Day 6: 打磨与上线

**目标**：体验优化，可演示版本。

| 序号 | 任务 | 说明 |
|------|------|------|
| 6.1 | Loading / Empty 状态 | 所有页面的边缘情况处理 |
| 6.2 | 错误提示优化 | 友好的错误信息和重试按钮 |
| 6.3 | 移动端适配 | 响应式布局（可选） |
| 6.4 | Vercel 部署 | 配置环境变量，一键部署 |
| 6.5 | 演示用例准备 | 准备 2-3 个示例 PDF 用于演示 |

---

## 🏗️ 完整文件结构 Spec

```
docAI/
├── 📁 app/                            # Next.js App Router
│   ├── 📁 (auth)/
│   │   └── login/page.tsx             # 登录页
│   ├── 📁 (dashboard)/
│   │   ├── layout.tsx                 # 主布局：导航 + 侧边栏
│   │   ├── page.tsx                   # 首页 - 我的文档列表
│   │   └── documents/
│   │       └── [id]/page.tsx          # 对话页 - 左侧预览 + 右侧聊天
│   └── 📁 api/
│       ├── auth/[...nextauth]         # Auth.js
│       ├── upload/route.ts            # 文档上传接口
│       ├── parse/route.ts             # 解析向量化接口
│       └── chat/route.ts              # 对话接口
│
├── 📁 components/                      # 可复用组件
│   ├── upload-dropzone.tsx            # 拖拽上传区域
│   ├── pdf-preview.tsx                # PDF 预览 + 页码跳转 + 高亮
│   ├── chat-message.tsx               # 单条消息 + 引用卡片
│   ├── citation-card.tsx              # 引用来源卡片
│   └── ui/                            # shadcn/ui 基础组件
│
├── 📁 lib/                             # 核心业务逻辑
│   ├── 📁 rag/
│   │   ├── embedding.ts               # OpenAI Embedding 封装
│   │   ├── retriever.ts               # PGVector 相似度检索
│   │   ├── prompt.ts                  # RAG System Prompt 模板
│   │   └── llm.ts                     # Vercel AI SDK 封装
│   │
│   ├── 📁 parser/
│   │   ├── pdf.ts                     # PDF.js 提取文本 + 页码
│   │   └── chunker.ts                 # 智能分块算法
│   │
│   ├── auth.ts                        # Auth.js 配置
│   └── db.ts                          # Prisma Client 单例
│
├── 📁 prisma/
│   └── schema.prisma                  # 数据库 Schema
│
├── .env.example                        # 环境变量模板
├── package.json
└── SPEC.md                             # 本文件
```

---

## 📊 数据库 Schema Spec

### `User` - 用户表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| email | String | 唯一索引 |
| name | String | 用户名 |
| createdAt | DateTime | 创建时间 |

### `Document` - 文档表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | String | 文件名 |
| fileKey | String | Supabase 文件 key |
| fileSize | Int | 文件大小字节 |
| pageCount | Int | 总页数 |
| status | Enum | PENDING / PARSING / DONE / ERROR |
| summary | Text? | 自动生成的摘要 |
| userId | UUID | 外键 -> User |
| createdAt | DateTime | |

### `Chunk` - 文档分块表（核心！）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| documentId | UUID | 外键 -> Document |
| content | Text | 分块文本内容 |
| pageNum | Int | 所在原文档页码 |
| startIndex | Int | 在该页的起始位置 |
| endIndex | Int | 在该页的结束位置 |
| embedding | Vector(1536) | PGVector 向量列！ |
| createdAt | DateTime | |

**索引设置**：
```prisma
// 向量相似度检索索引
index ChunkEmbeddingIndex on Chunk(embedding) using hnsw;
// 权限过滤索引
index ChunkDocumentIndex on Chunk(documentId);
```

---

## 🔑 环境变量 Spec

```env
# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# OpenAI
OPENAI_API_KEY=sk-xxx

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/docai

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

---

## ✅ 每个模块的验收标准 Checklist

### 🔹 文档解析模块
- [ ] 支持标准 PDF 文本提取
- [ ] 每个 chunk 携带精确的页码信息
- [ ] 单 chunk token 数控制在 400-600 之间
- [ ] 50 页文档解析内存 < 512MB

### 🔹 向量化模块
- [ ] 统一使用 text-embedding-3-small
- [ ] 批量接口，一次处理最多 100 个
- [ ] 错误重试机制

### 🔹 检索模块
- [ ] Top 5 召回准确率 > 80%
- [ ] 一次检索耗时 < 100ms
- [ ] 严格按用户权限过滤
- [ ] 向量距离分数可解释

### 🔹 对话模块
- [ ] 流式输出，打字机效果
- [ ] 每个答案标记引用来源
- [ ] 不知道的问题明确回答不知道
- [ ] 支持最多 10 轮对话上下文

### 🔹 引用溯源模块
- [ ] 100% 准确的页码跳转
- [ ] 原文内容可视化高亮
- [ ] 响应时间 < 50ms

---

## 🚩 关键风险点与规避

| 风险 | 概率 | 影响 | 规避方案 |
|------|------|------|---------|
| PDF 解析乱码 | 中 | 高 | MVP 只支持纯文本 PDF，扫描版提示不支持 |
| 大文档内存溢出 | 高 | 中 | MVP 限制 50 页，超过直接拒绝 |
| LLM 幻觉编造 | 高 | 高 | Prompt 三层防护 + 引用反向校验 |
| 检索不相关 | 中 | 中 | 先保证召回数量，后续优化 |
| 向量检索慢 | 低 | 中 | HNSW 索引，10 万条内没问题 |

---

## 🎯 最小可行产品边界定义

✅ **做**：
- PDF / TXT / MD 纯文本文档
- 单文档问答
- 引用溯源 + 页码跳转

❌ **MVP 不做**：
- 100 页以上大文档
- 扫描件 OCR
- 多文档跨文档问答
- 微信登录（先用 Github/Google 代替）
- BM25 混合检索
- Rerank 重排序

---

> **执行原则**：先跑通完整链路，再优化单点性能。
>
> Day 3 就要能看到：上传文档 → 提问 → 得到回答的完整流程！
