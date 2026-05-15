# DocAI - 个人智能文档知识库

> Next.js 14 + Supabase + pgvector + OpenAI + RAG 全栈应用  
> 上传 PDF → 自动切块与向量化 → 基于个人知识库的问答与可溯源引用

实现细节与路径以 **`SPEC.md`**、**`lib/README.md`**、**`lib/schema.sql`** 为准；本文做产品与架构级说明（与仓库同步，**v2**）。

---

## 产品定位

个人智能文档知识库：把 **可选中文字的 PDF** 变成可语义检索、可多轮对话的知识片段，并在回答中给出 **可点击的引用角标** 与 **右侧出处预览**（文件名、页码、原文或检索片段）。

### 一句话价值

> 登录后上传 PDF → 等待处理完成 → 在对话里提问 → AI 只依据库内片段作答，并标明 **[1] / 【1】** 等引用 → 点角标或「参考片段」即可查看对应原文脉络。

---

## 产品说明（与实现对齐）v2

### 1. 核心技术架构

#### 1.1 RAG 数据流（当前仓库）

```text
用户上传 PDF（/api/upload）
    ↓
1. 文档解析与入库准备
   ├─ Supabase Storage：原始文件（documents bucket）
   ├─ Postgres：documents 元数据与处理状态（uploading → processing → ready / failed）
   └─ 解析：pdf-parse 按页抽取文本（扫描件/纯图 PDF 效果差，需产品提示）
    ↓
2. 分块与向量化（lib/embeddings.ts）
   ├─ 策略：page-paragraph-sentence-v1（字符上限与重叠见源码常量）
   ├─ 嵌入：OpenAI text-embedding-3-small → 1536 维
   └─ 写入：document_chunks（含页码、chunk_index、向量列等）
    ↓
3. 存储层（Supabase / Postgres）
   ├─ pgvector：HNSW 索引上的向量相似检索
   ├─ 业务表：documents、document_chunks、chat_sessions、chat_messages
   ├─ RLS：用户仅能访问自己的文档与会话
   └─ service_role：可信服务端流水线写库（禁止暴露到浏览器）
    ↓
4. 检索与生成（/api/chat + lib/db.ts + lib/rag-chat.ts）
   ├─ 用户最新问题 → 嵌入 → semanticSearch（TopK / 阈值可由环境变量配置）
   ├─ 将命中片段拼进系统提示（仅允许使用片段内信息）
   ├─ Vercel AI SDK 流式输出（streamText → UIMessage stream）
   └─ 引用：metadata.custom.ragCitations + 正文角标校验（collectValidatedCitations）
    ↓
用户得到：流式答案 + 可点的引用 + 右侧「出处预览」（文本，非整页 PDF 阅读器）
```

**说明**：`lib/db.ts` 中已具备 **hybrid_search**（向量 + 全文）能力，**当前对话接口默认仅走语义检索**；是否默认开启混合检索属于产品迭代决策。

---

#### 1.2 技术栈（当前选型）

| 层级             | 技术选型                                                                     |
| ---------------- | ---------------------------------------------------------------------------- |
| **全栈框架**     | Next.js 14（App Router）+ TypeScript                                         |
| **样式与组件**   | Tailwind CSS + Radix UI 片段 + 自研布局；对话区以 **assistant-ui** 为主      |
| **用户认证**     | **Supabase Auth**（OAuth 等由 Supabase 项目配置；`middleware` 保护 `/chat`） |
| **LLM / 流式**   | `ai` + `@ai-sdk/openai`                                                      |
| **嵌入模型**     | OpenAI **text-embedding-3-small**（1536 维）                                 |
| **数据库与向量** | **Supabase Postgres** + **pgvector**（无 Prisma；DDL 见 `lib/schema.sql`）   |
| **文件存储**     | **Supabase Storage**（`documents` bucket）                                   |
| **PDF 解析**     | **pdf-parse**（非 PDF.js）                                                   |
| **部署**         | Vercel（注意 `maxDuration` 与套餐、环境变量、`packageManager: pnpm@9.15.9`） |

---

### 2. 能力清单

#### 2.1 用户与权限（已实现方向）

| 能力       | 说明                                                 |
| ---------- | ---------------------------------------------------- |
| 登录与会话 | Supabase Auth + Cookie；`/chat` 需登录               |
| 数据隔离   | 文档、分块、会话、消息均与用户绑定；RLS + 服务端校验 |

**未作为本文硬性承诺**：「微信扫码」「免费额度」「上传配额计费」等需按你实际 Supabase / 商业方案单独写 PRD。

---

#### 2.2 文档与索引（已实现方向）

| 能力       | 说明                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 上传       | `POST /api/upload`；当前路由内对单文件有 **体积上限（代码级，见 `app/api/upload/route.ts`）**                                     |
| 格式       | **以 PDF 为主**（与 Storage MIME 及解析链一致）；**不**在本文宣称 TXT/MD 已全链路接入（若产品上支持，需改代码与 SPEC 后再改本文） |
| 进度与状态 | `documents.status`、`progress` 等字段支撑列表与 UI 反馈（具体交互以 `app/chat` 为准）                                             |
| 预览       | 侧栏 **文档列表 / 对话 Tab**；引用侧为 **文本出处预览**（`DocPreview`），非内置 PDF 翻页阅读器                                    |

---

#### 2.3 对话与引用（已实现方向）

| 能力         | 说明                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------- |
| 流式对话     | assistant-ui + AI SDK UIMessage 流                                                                |
| 多轮与持久化 | Supabase 会话 / 消息表 + 远程线程适配器                                                           |
| 引用展示     | 角标 **[n] / 【n】**、Markdown 内链、`rag-source-chips` 等                                        |
| 引用溯源     | 点击后右侧展示 **文件名、页码、片段或拉取的原文**（`CitationPreviewContext` + chunk 预览 action） |
| 摘要         | **未**在本文列为已交付 P0；若代码中无「上传后自动生成摘要」产品能力，则属 Phase 2                 |

---

#### 2.4 Prompt 与质量（已实现方向）

| 能力       | 说明                                                                                    |
| ---------- | --------------------------------------------------------------------------------------- |
| 幻觉约束   | 系统提示要求 **仅使用检索片段**；无片段时引导模型如实说明                               |
| 引用与编号 | 角标须落在检索结果编号范围内；`collectValidatedCitations` 过滤无效编号                  |
| 元数据通路 | 引用写入 **`metadata.custom.ragCitations`**，以兼容 assistant-ui 对 metadata 的合并规则 |

---

### 3. 进阶规划（Phase 2+）

| 方向         | 说明                                                         |
| ------------ | ------------------------------------------------------------ |
| 大文档与异步 | 超长 PDF、队列化解析与嵌入，降低 Serverless 单次请求超时风险 |
| 检索增强     | 默认启用 **hybrid_search**、Rerank、调参与评测闭环           |
| 分块与 OCR   | 更细语义边界、扫描件 OCR、`bbox` 驱动的版式高亮              |
| 多格式与多库 | TXT/MD、跨文档知识库、权限细分等                             |

---

### 4. 工程难点与当前对策（摘要）

| 主题            | 现状与方向                                                |
| --------------- | --------------------------------------------------------- |
| PDF 质量        | 依赖文本层；扫描件需后续 OCR 或明确不支持                 |
| Serverless 耗时 | 上传同请求内处理至完成，受 **maxDuration** 与文件大小约束 |
| 模型幻觉        | 强约束 Prompt + 仅库内片段 + 引用编号校验                 |
| 引用体验        | 文本预览 + 页码；坐标级高亮依赖 `bbox` 与后续前端能力     |
| 检索相关性      | 调 TopK / 阈值；可选混合检索与 Rerank                     |

---

### 5. 系统架构图（逻辑）

```text
┌─────────────────────────────────────────────────────────┐
│                      浏览器（React）                       │
│  ┌──────────────────────┐    ┌──────────────────────┐   │
│  │ 侧栏：文档 / 对话 Tab │    │ assistant-ui 对话区  │   │
│  │ 上传、列表、状态      │    │ 流式 Markdown + 引用  │   │
│  └──────────────────────┘    └──────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 右侧「出处预览」：页码 + 原文/片段（DocPreview）    │   │
│  └──────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────┘
                            │ fetch / Server Actions
┌───────────────────────────▼─────────────────────────────┐
│              Next.js（Route Handlers + Server Actions）   │
│  /api/upload  /api/chat   app/chat/actions/*             │
│  lib/embeddings.ts  lib/db.ts  lib/rag-chat.ts           │
└───────────────────────────┬─────────────────────────────┘
                            │ supabase-js（anon / server / admin）
┌───────────────────────────▼─────────────────────────────┐
│                    Supabase                               │
│  Postgres + pgvector  │  Storage  │  Auth               │
│  documents / document_chunks / chat_*                   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
                      OpenAI（嵌入 + 对话）
```

---

### 6. 仓库目录结构（节选）

与 **`SPEC.md`** 一致，此处仅列入口：

- `app/chat/`：工作台页面与组件、`actions/`、`useSupabaseChatRuntime.ts`、远程线程适配器
- `app/api/chat`、`app/api/upload`
- `lib/schema.sql`、`lib/db.ts`、`lib/embeddings.ts`、`lib/rag-chat.ts`、`lib/storage.ts`、`lib/openai-provider.ts`、`supabase*.ts`
- `components/assistant-ui/`、`components/ui/`
- `middleware.ts`、`patches/`（pnpm patch）

---

### 7. 迭代节奏（建议）

具体排期由团队自定；工程上建议按 **「上传→索引→单轮问答→多轮持久化→引用 UX→检索调优→部署与观测」** 切里程碑，并与 **Vercel 超时、Supabase 配额、OpenAI 费用** 同步评估。

---

### 8. 作品集与答辩可讲的点

| 维度         | 可展开内容                                                   |
| ------------ | ------------------------------------------------------------ |
| 全栈与一体化 | Next App Router + Supabase 一条链路完成 Auth、库、存、向量   |
| RAG 闭环     | 解析 → 切块 → 嵌入 → 检索 → 流式回答 → **可校验引用**        |
| 工程边界     | RLS、service_role、服务端专用模块、metadata 与 UI 框架的衔接 |
| 可演进性     | hybrid 检索、 bbox、异步队列等清晰的后挂点                   |

---

若产品对外话术与 **「仅 PDF / 上传大小 / 是否摘要」** 等不一致，请先改 **`SPEC.md`** 与代码常量，再回改本文，避免设计文档之间漂移。
