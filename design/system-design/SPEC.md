# DocAI 技术实施规范 SPEC v2.1

> 与当前仓库对齐（Next.js 14 + Supabase + pgvector + Vercel AI SDK + assistant-ui）。  
> **v2.1**：增加「**@ 文档范围**」问答宪法（未指定不得提问；检索限定范围）。  
> 若实现变更，请同步更新本文件与 `lib/README.md`、`lib/schema.sql`。

---

## 总览

| 项目         | 说明                                                                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **产品目标** | 个人文档知识库：上传 PDF → 解析切块向量化 → 对话式 RAG 问答 → 回答中带可点击引用与出处预览                                                                 |
| **技术栈**   | Next.js 14（App Router）+ TypeScript + Tailwind CSS + Supabase（Auth / Postgres / Storage）+ pgvector + OpenAI（嵌入 + 对话）                              |
| **AI 集成**  | `ai` + `@ai-sdk/openai` 流式对话；`@assistant-ui/react` + `@assistant-ui/react-ai-sdk` 聊天 UI；消息持久化走 Supabase 线程适配器                           |
| **包管理**   | `pnpm@9.15.9`（`packageManager` 已写入 `package.json`，与 `pnpm-lock.yaml` 一致，避免 CI frozen install 与 patch 校验冲突）                                |
| **验收主线** | 登录 → **文档库**（`/documents`）→ **对话**（`/chat`）须在 **`@` 指定文档范围** 后方可提问 → 检索与生成仅在该范围内 → 角标与出处预览 |

---

## @ 文档范围（问答宪法）

> **原则**：问答必须绑定**当前用户**知识库中的**明确文档集合**；未绑定则**不得提问**（前端禁止发送 + 服务端拒绝）。OpenAI 侧除对话模型外，**向量检索 / 上下文拼装**必须落在同一文档集合内，禁止隐式全库检索。

### 产品行为

| 项 | 说明 |
| --- | --- |
| **触发方式** | 用户在输入中使用 **`@`** 提及文档：支持 **`@文件名`**（模糊匹配 `documents.file_name`，在用户文档内唯一或可消歧）、及/或 **`@文档短 ID`**（与文档库展示一致，如 `DOC-XXXXXXXX` 映射到 `documents.id`）。可 **`@` 多个文档** 以扩大范围。 |
| **未指定** | **不允许发送**本条用户消息：Composer 发送按钮禁用或点击后提示；若绕过前端调用 **`POST /api/chat`**，服务端须 **`400`** 并返回明确错误（如「未指定文档范围」），**不得**调用嵌入检索与流式补全。 |
| **文档状态** | 仅 **`documents.status = ready`** 且归属当前用户的文档可进入范围；`uploading` / `processing` / `failed` 不得被选入或须在解析后自动从范围剔除。 |
| **消歧** | 多个文件同名或 `@` 前缀不唯一时：UI 须弹出候选列表由用户确认后再锁定范围；未确认前视为**未指定**。 |
| **多轮** | 每条用户消息发送前须具备**有效范围**（实现二选一，须在实现与 UI 中写死其一并在本文同步）：**(A)** 每条消息正文内须含至少一组可解析的 `@`；或 **(B)** 允许「会话级锁定范围」：首条带 `@` 成功后锁定 `document_id[]`，后续消息可省略 `@` 直至用户点击「清除范围」或变更 `@`。默认推荐 **(B)** 以降低摩擦，但**首条**仍必须含 `@`。 |

### 检索与 API（与 OpenAI / DB 对齐）

| 项 | 说明 |
| --- | --- |
| **向量检索** | `semanticSearch`（及未来的 `hybrid_search`）必须增加 **`document_id` 白名单**（`WHERE document_id = ANY($ids)` 或等价），**仅**在 `@` 解析得到的 UUID 集合内做相似度检索；`topK`、阈值仍在该子集上生效。 |
| **空范围** | 解析结果为空或全部非 `ready` → 等同未指定，**不调用** OpenAI 嵌入检索与 `streamText`。 |
| **请求载荷** | 推荐在 `POST /api/chat` 的 JSON 中显式携带 **`documentIds: string[]`**（或由服务端从最后一条用户消息的结构化「提及」中解析），与 UI 展示一致，便于审计与回放。 |
| **Prompt / 上下文** | `buildRagContextBlock` 仅使用上述检索结果；系统提示中须写明「仅允许使用下列文档片段」，并列出文档名 / id，防止模型引用范围外内容。 |

### 实现落点（指引）

| 层级 | 建议 |
| --- | --- |
| **`lib/db.ts`** | 为 `semanticSearch` / `hybridSearch` 增加必选或默认强制的 **`documentIds: string[]`** 过滤；无 `documentIds` 时 Chat 路径不得执行全表向量检索。 |
| **`app/api/chat/route.ts`** | 在校验用户后、**`embed` 之前**解析并校验 `documentIds`（或从 `messages` 解析 `@`）；不通过则 `400`。 |
| **`lib/rag-chat.ts`** | 系统提示与上下文块须体现「当前绑定文档」；可与 `collectValidatedCitations` 协同，保证引用 chunk 属于绑定文档。 |
| **Composer / Thread** | `@` 自动补全数据源：`getDocuments` 或分页接口的用户 `ready` 文档；发送前校验范围非空。 |
| **持久化（可选）** | `chat_sessions.metadata` 或首条用户消息 `metadata` 中记录 `activeDocumentIds`，供多轮 (B) 方案读取。 |

### 验收（@ 范围）

- [ ] 未带有效 `@` / 未传有效 `documentIds` 时无法发送或 API 返回 400，且**无** OpenAI 计费型检索调用。
- [ ] 指定单文档时，检索结果 chunk 的 `document_id` 均属于该文档。
- [ ] 指定多文档时，检索结果仅落在并集内；引用角标仍与检索序号一致。
- [ ] 非 `ready` 文档不可被绑定；错误路径有可读提示。
- [ ] 与 RLS 一致：不得通过篡改 `documentIds` 访问他人文档。

---

## 文档库页面（PDF 列表表格）

> **目标**：将原 `/chat` 左侧栏中的「文档列表」独立为 **`/documents`** 表格页；数据与权限与现有一致，不重复造数据源。

### 产品行为

| 项 | 说明 |
| --- | --- |
| **路由** | `app/documents/page.tsx`（路径 **`/documents`**，需登录） |
| **数据** | 基于 **`documents` 表**、当前登录用户；复用 / 扩展 **`lib/db.ts`** 中 **`getDocuments` / `getDocumentsPaginated`**；表格页须服务端分页。 |
| **名称搜索** | 对 **`file_name`** 使用 **`ilike`** 模糊匹配；在 `getDocumentsPaginated` 增加可选 `search` 并保持用户隔离。 |
| **分页** | **`page` + `pageSize`**，返回 **`total` / `totalPages`**。 |
| **状态列** | **`documents.status`**：`uploading` / `processing` / `ready` / `failed`；可展示 **`progress`**、**`current_step`**、**`error_message`**（失败时）。 |
| **`/chat` 侧栏** | 不承载全量文档列表；**`@` 选文**与文档发现以 **`/documents`** 与 Composer 补全为主（见「@ 文档范围」）。 |

### 中间件

- **`/documents`**（及子路径）与 **`/chat`** 一并纳入 **`middleware.ts` 的 `matcher`**：未登录 → **`/login`**。

### 验收（文档库）

- 仅展示当前用户的 PDF 文档行；名称搜索与分页正确；状态映射清晰；与 `/chat` 导航互通。

---

## 与 v1 草稿的主要差异（历史说明）

| v1 假设                                | 当前实现                                                                                                                               |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Prisma + 自建 `DATABASE_URL`           | **无 Prisma**；使用 **Supabase JS**（`@supabase/ssr` + `@supabase/supabase-js`）与 `lib/schema.sql` 管理表与 RLS                       |
| NextAuth                               | **Supabase Auth**（`middleware.ts` 保护 `/chat`、`/documents`，`/auth/callback` 交换会话）                                             |
| `lib/rag/*`、`lib/parser/*` 拆分文件名 | 逻辑集中在 **`lib/embeddings.ts`**（解析+切块+嵌入+入库）、**`lib/db.ts`**（检索与业务写）、**`lib/rag-chat.ts`**（Prompt 与引用校验） |
| 左侧 PDF 渲染 + 页内高亮               | 当前为 **文本出处预览**（`DocPreview` + `CitationPreviewContext`）；`document_chunks.bbox` 在 schema 中预留，高亮非 MVP 必达项         |
| 固定「6 天日程」                       | 以 **模块与路径** 描述为准；排期由项目自行管理                                                                                         |
| Chat 左侧承载全量文档列表              | **迁至 `/documents` 表格页**；`/chat` 专注对话与预览（见「文档库页面」）                                                               |

---

## 模块与路径（实现清单）

### 应用与路由

| 能力                                                      | 路径 / 说明                                                                                                                                                          |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 落地页                                                    | `app/page.tsx`                                                                                                                                                       |
| 登录                                                      | `app/login/*`、`app/login/actions.ts`                                                                                                                                |
| OAuth 回调                                                | `app/auth/callback/route.ts`                                                                                                                                         |
| 对话工作台 | `app/chat/page.tsx`、`ChatPageClient.tsx`、`components/workspace/WorkspacePageShell.tsx`、`DocPreview`、`CitationPreviewContext` 等 |
| PDF 文档库（表格：列表、搜索、分页、状态）                | `app/documents/page.tsx`（及同目录 `actions` 或复用 `app/chat/actions` 中列表查询，**以单一数据源为准**）                                                            |
| 会话与消息的远程读写                                      | `app/chat/actions/*`（如 `thread-remote.ts`、`sidebar.ts`、`chunk-preview.ts`）、`app/chat/supabase-remote-thread-adapter.tsx`、`app/chat/useSupabaseChatRuntime.ts` |
| 对话 API（RAG + 流式）                                    | `app/api/chat/route.ts`（`runtime: nodejs`，`maxDuration: 120`）                                                                                                     |
| 上传 API                                                  | `app/api/upload/route.ts`（`maxDuration: 60`）；成功后触发 `processDocument`                                                                                         |

### 中间件与安全

| 能力                      | 路径                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| 刷新 Supabase 会话 Cookie | `middleware.ts` → `lib/supabase-middleware.ts`                                                         |
| 受保护路由                | **`/chat`、`/documents`** 需登录；已登录访问 `/login` 重定向到 **`/chat`**（或产品指定的默认落地页） |

### 服务端核心库（`lib/`）

| 文件                           | 职责摘要                                                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schema.sql`                   | 表、索引（含 **HNSW** 向量索引、`pg_trgm`）、Storage bucket、RLS、可选 RPC（如 `hybrid_search`）                                                        |
| `database.types.ts`            | 与表对齐的 TS 类型（文档、分块、引用、会话等）                                                                                                          |
| `db.ts`                        | **仅服务端**：文档 CRUD、`document_chunks` 写入、`semanticSearch` / `hybridSearch`（当前 Chat 使用 **semantic**）、`chat_sessions` / `chat_messages` 等 |
| `storage.ts`                   | Supabase Storage `documents` bucket 路径规则与上传/下载                                                                                                 |
| `embeddings.ts`                | PDF（`pdf-parse`）→ 规范化文本 → 切块策略 **`page-paragraph-sentence-v1`** → `embedMany` → 批量写入 chunks                                            |
| `openai-provider.ts`           | `createOpenAI`、对话/嵌入模型名、超时、可选代理（undici）                                                                                               |
| `rag-chat.ts`                  | 检索结果拼上下文、系统提示、从正文中用 **`[n]` / `【n】` / `［n］`** 收集已校验引用                                                                     |
| `rag-citations-metadata.ts`    | 从消息的 `metadata.custom.ragCitations`（及兼容字段）读取引用，供 UI                                                                                    |
| `remark-citation-ref-links.ts` | Markdown 层将角标转为 `#cite-n` 链接，便于与预览联动                                                                                                    |
| `supabase*.ts`                 | 浏览器 / 服务端 / **service_role** 三类客户端边界（含密钥的模块禁止进 Client Bundle）                                                                   |

更细的依赖说明见 **`lib/README.md`**。

### 前端组件

| 区域                         | 路径                                                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| assistant-ui 线程与 Markdown | `components/assistant-ui/*`（如 `thread.tsx`、`citation-markdown-text.tsx`、`rag-source-chips.tsx`） |
| UI 基座                      | `components/ui/*`（Radix + Tailwind 约定）                                                           |

---

## 仓库目录结构（节选）

```text
docAI/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── login/
│   ├── auth/callback/route.ts
│   ├── documents/
│   │   ├── layout.tsx           # 文档库壳层：侧栏、上传、退出
│   │   ├── page.tsx             # 表格：搜索、分页、状态
│   │   ├── format.ts            # 文件大小、相对时间、展示用 ID
│   │   ├── build-list-href.ts   # 列表 URL query 拼装
│   │   └── components/          # LibrarySearchBar, LibraryToolbar, DocumentsTable, …
│   ├── chat/
│   │   ├── page.tsx
│   │   ├── ChatPageClient.tsx
│   │   ├── components/
│   │   ├── actions/             # Server Actions：线程、侧栏、chunk 预览等
│   │   ├── useSupabaseChatRuntime.ts
│   │   └── supabase-remote-thread-adapter.tsx
│   └── api/
│       ├── chat/route.ts
│       └── upload/route.ts
├── components/
│   ├── workspace/               # WorkspacePageShell（与 documents / chat 共用侧栏壳）
│   ├── assistant-ui/
│   └── ui/
├── lib/
│   ├── schema.sql
│   ├── database.types.ts
│   ├── db.ts
│   ├── storage.ts
│   ├── embeddings.ts
│   ├── openai-provider.ts
│   ├── rag-chat.ts
│   ├── rag-citations-metadata.ts
│   ├── remark-citation-ref-links.ts
│   ├── supabase.ts
│   ├── supabase-server.ts
│   ├── supabase-admin.ts
│   └── supabase-middleware.ts
├── middleware.ts
├── patches/                     # pnpm patch（如 assistant-ui IME 相关）
└── package.json
```

---

## 数据库与存储（以 `lib/schema.sql` 为准）

### `documents`

业务元数据 + 处理状态（如 `uploading` / `processing` / `ready` / `failed`）、`file_path`（Storage 对象键）、`embedding_model` / `embedding_dimensions`、页数与 chunk 计数等。用户隔离：`user_id` → `auth.users`。

### `document_chunks`

`content`、`chunk_index`、`page_number` / `page_start` / `page_end`、字符范围、`embedding vector(1536)`（默认 **text-embedding-3-small**）、可选 `bbox`（JSON，预留）。

**索引要点**：`document_id`；**HNSW** 于 `embedding vector_cosine_ops`；可选 `pg_trgm` 于 `content`（支撑混合检索等扩展）。

### `chat_sessions` / `chat_messages`

多轮会话与消息；`chat_messages.citations`（jsonb）与 `metadata`（jsonb）持久化；与 assistant-ui 远程线程适配器配合。

### Storage

Bucket **`documents`**：私有读写策略与 MIME（以 schema 中 `allowed_mime_types` 为准，当前以 **PDF** 为主）。

### 权限

表上启用 **RLS**；服务端批量写库、嵌入流水线等使用 **`supabaseAdmin`（service_role）**，与「用户仅能访问自有数据」策略并存。勿将 service role 暴露到浏览器。

---

## RAG 与对话流水线

0. **范围（宪法）**：见上文「**@ 文档范围**」。`POST /api/chat` 须在解析出有效 **`documentIds`**（或等价的 `@` 解析结果）后，方可执行后续嵌入与检索。
1. **上传**：`POST /api/upload` → Storage 落文件 → `documents` 记录 → `processDocument`（异步在请求内执行至完成或失败，注意 **Vercel 超时**）。
2. **索引**：`embeddings.ts` 下载 PDF → `pdf-parse` 按页抽取 → 切块（约 **≤1800 字符/块**、重叠 **150 字符** 等常量见源码）→ `embedMany` → `insertChunksInBatches`。
3. **提问**：`POST /api/chat` 取最近用户文本 → **query embedding** → **`semanticSearch`（限定 `documentIds`）**（`RAG_TOP_K`、`RAG_MATCH_THRESHOLD` 可由环境变量覆盖）→ 拼 `buildRagContextBlock` + `buildRagSystemPrompt` → `streamText` → **UIMessageStream**。
4. **引用**：检索命中经 `resultsToCitations` 挂在 **`messageMetadata` → `custom.ragCitations`**（满足 assistant-ui 元数据合并规则）；正文角标经 `collectValidatedCitations` 与检索序号对齐。

---

## API 与环境变量

### 建议环境变量

```env
# Supabase（浏览器可读的 anon + URL）
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# 服务端仅
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# 可选：RAG 调参
# RAG_TOP_K=
# RAG_MATCH_THRESHOLD=

# 可选：模型覆盖（若 openai-provider 支持读取）
# 见 lib/openai-provider.ts
```

### 运行时

- **`/api/chat`**：`maxDuration = 120`（秒），实际受 **Vercel 套餐** 限制，部署前需对齐计划上限。
- **`/api/upload`**：`maxDuration = 60`；当前路由内对单文件有 **1MB** 大小校验（与 Storage bucket 上限可不同，以代码为准）。

---

## 验收检查清单（与实现对齐）

### 文档与索引

- PDF 上传后 `documents.status` 最终为 `ready`，`chunk_count` > 0（失败时为 `failed` 且有 `error_message`）
- `document_chunks` 中 `embedding` 非空，页码字段与原文一致性质检通过抽样
- 仅当前用户文档参与检索（RLS + 查询条件）

### 对话与引用

- 流式回答可完整展示，无未捕获服务端 500
- 有检索命中时，UI 可展示引用列表；角标样式与 `rag-chat` 约定一致
- 点击角标或「参考片段」可在右侧打开出处预览（文件名、页码、文本）
- 无检索命中时，模型行为符合系统提示（不编造库外事实）
- **@ 范围**：见上文「验收（@ 范围）」；与实现对齐后逐项勾选

### 认证与导航

- 未登录访问 `/chat` 或 **`/documents`** → 跳转登录
- 登录后可稳定刷新页面不断会话（Cookie 与 middleware）

### 部署

- Vercel 使用 **Corepack** 识别 `packageManager`（pnpm 9）
- 生产环境已配置上述密钥与 Supabase Auth 回调 URL（含 `/auth/callback`）

---

## MVP 边界（当前代码倾向）

**包含**

- PDF 上传与解析入库（`pdf-parse`）
- **文档库表格页**（`/documents`）：全量列表的正式入口，搜索、分页、状态展示
- 单用户隔离下的语义检索 + 流式对话
- 引用元数据与文本出处预览
- **`@` 文档范围（v2.1 宪法）**：未指定不得提问；检索限定 `documentIds`（实现后从本清单「不包含」中移除对应条）

**不包含或未作为必达**

- 扫描件 OCR
- 内置 PDF 阅读器与坐标级高亮（`bbox` 预留）
- Chat 路由默认未接 **`hybridSearch`**（`db.ts` 已具备能力；接入时须同样支持 `documentIds` 白名单）
- 上传接口当前 **1MB** 限制（与「大文档」产品表述冲突时，以代码或后续配置为准）

---

## 风险与规避

| 风险                  | 说明                                                  | 规避方向                                                                |
| --------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| 无文本层 PDF / 扫描版 | `pdf-parse` 几乎无字                                  | 产品提示「仅支持可选中文字的 PDF」；后续再接 OCR                        |
| Serverless 超时       | 大 PDF 嵌入链路过长                                   | 控制单文件大小与页数；长期可迁异步队列                                  |
| 模型幻觉              | 通用 LLM 风险                                         | 已用「仅依据检索片段」类系统提示 + 引用编号校验；持续收紧 Prompt 与评测 |
| 依赖补丁              | `@assistant-ui/react` 使用 `pnpm.patchedDependencies` | 升级该包时需重制 patch 并 **`pnpm install`** 更新锁文件               |

---

## 执行原则

1. **单一事实来源**：表结构与 RLS 以 **`lib/schema.sql`** 为准；类型以 **`database.types.ts`** 为准；模块职责以 **`lib/README.md`** 为准。
2. **边界清晰**：含 `OPENAI_API_KEY` / `SUPABASE_SERVICE_ROLE_KEY` 的代码仅在服务端运行。
3. **先链路后优化**：检索阈值、TopK、切块参数可在不改表结构的情况下迭代。
4. **问答范围**：凡涉及库内检索与对话补全的路径，须遵守「**@ 文档范围**」；不得以默认全库代替显式范围。
