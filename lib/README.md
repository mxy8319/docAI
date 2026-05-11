# `lib/` 说明

服务端与共享逻辑集中在这里。**含密钥、服务角色或 OpenAI 调用的模块只能在 Server Component、Route Handler、Server Action 中引用**（见各文件注释）。

---

## 数据与存储

| 文件 | 做什么 |
|------|--------|
| **`database.types.ts`** | 与业务相关的 TypeScript 类型：文档、分块、会话、消息、引用 `Citation`、检索结果等。与表结构对齐，供 `db.ts` 与应用层共用。 |
| **`schema.sql`** | Supabase / Postgres 的 DDL 与策略说明：表、`pgvector`、`pg_trgm`、Storage bucket、RPC（如混合检索）等。部署或迁移时对照执行。 |
| **`db.ts`** | 通过 **`supabaseAdmin`** 访问数据库：文档 CRUD、分块写入、向量/混合搜索 `semanticSearch`、`resultsToCitations`、聊天会话与消息读写等。**仅服务端。** |
| **`storage.ts`** | Supabase Storage：文档 bucket 路径规则、`uploadFile` / `downloadFile` 等，与 `documents` 表里的 `file_path` 配合使用。**仅服务端。** |

---

## Supabase 客户端

| 文件 | 做什么 |
|------|--------|
| **`supabase.ts`** | 浏览器端 **`createBrowserClient`**（anon key + RLS），给需要在客户端直连 Supabase 的代码用。 |
| **`supabase-server.ts`** | 服务端 **`createServerClient`**（读 Cookie），给 Server Actions、Server Components、`app/api` 里需要「当前登录用户」的场景用。 |
| **`supabase-admin.ts`** | **`service_role`** 客户端，绕过 RLS；仅用于可信服务端逻辑（如 `db.ts`、后台任务）。**切勿暴露到客户端。** |
| **`supabase-middleware.ts`** | Next **`middleware`** 里刷新会话：`updateSession(request)`，保持登录态 Cookie 与 Supabase 同步。 |

---

## AI 与 RAG

| 文件 | 做什么 |
|------|--------|
| **`openai-provider.ts`** | `@ai-sdk/openai` 的 `createOpenAI` 实例、**嵌入/对话模型名**、超时与可选 **HTTP(S) 代理**（undici），供 `embeddings.ts`、`app/api/chat` 等统一使用。 |
| **`embeddings.ts`** | 上传后的 **PDF 解析 → 切块 → `embedMany` → 写入 `document_chunks`**；含处理状态更新、从 Storage 拉文件等流水线。**仅服务端。** |
| **`rag-chat.ts`** | RAG **系统提示与上下文拼装**：`getLatestUserQueryText`、`buildRagContextBlock`、`buildRagSystemPrompt`、`collectValidatedCitations` 等，供 `/api/chat` 使用。 |
| **`rag-citations-metadata.ts`** | 从消息的 **`metadata` / `metadata.custom`** 读出 `ragCitations`（与 assistant-ui 合并元数据的方式一致），供引用角标与预览 UI 使用。 |
| **`remark-citation-ref-links.ts`** | Remark 插件：把正文里的 **`[1]`、`[2]`** 转成指向 `#cite-n` 的链接，便于 Markdown 层再渲染成可点击引用。 |

---

## 其它

| 文件 | 做什么 |
|------|--------|
| **`utils.ts`** | 通用小工具：如 **`cn()`**（`clsx` + `tailwind-merge`），给组件 className 合并用。 |
| **`search.ts`** | 历史草稿（整文件注释掉），早期直连 OpenAI + RPC 的示例；**当前检索以 `db.ts` 为准**。可删或日后清理。 |

---

## 依赖关系（简图）

```text
app/api/*, app/*/actions/*, Server Components
        │
        ├─► supabase-server / supabase-admin
        │
        ├─► db.ts ─────────► database.types + schema 中的表/RPC
        ├─► storage.ts ───► Supabase Storage（documents）
        ├─► embeddings.ts ─► db + storage + openai-provider
        └─► openai-provider + rag-chat + …
```

客户端组件如需 Supabase：用 **`supabase.ts`**；涉及用户隔离的写操作仍应优先走 **Server Action / API + `db.ts`**。
