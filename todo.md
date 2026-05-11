# DocAI MVP TODO / Data Design

## 1. MVP 核心流程

1. 用户使用 Supabase Auth 登录。
2. 用户上传 PDF。
3. 文档本体保存到 Supabase Storage。
4. PostgreSQL 保存文档元数据、处理状态、权限归属。
5. Worker / API 解析 PDF：
   - 提取文本
   - 绑定页码
   - 分块
   - 记录 chunk 来源信息
6. 使用 OpenAI Embedding 将每个 chunk 转成向量。
7. 向量写入 PostgreSQL + pgvector。
8. 用户提问时（`/api/chat` + `lib/rag-chat.ts`）：
   - 问题转 embedding（`embed` + `text-embedding-3-small`，与入库一致）
   - 在 pgvector 中检索相似 chunks（`semanticSearch` → RPC `search_chunks`，按 `user_id` 隔离）
   - 将 chunks 和来源信息写入 system prompt，再与历史消息一并交给 LLM（`streamText` + `OPENAI_CHAT_MODEL`）
   - LLM 流式生成答案；角标 `[1]` 等形式引用片段编号
   - `collectValidatedCitations` 在 `onFinish` 中校验角标是否落在检索结果范围内（超范围编号忽略；开发环境打日志）

## 2. 数据分层设计

### Supabase Auth

用途：用户身份、登录态、权限根。

数据来源：

- Supabase `auth.users`

核心原则：

- 业务表中的 `user_id` 统一引用 `auth.users.id`
- RLS 使用 `auth.uid() = user_id`
- 不再单独维护 Auth.js 用户 ID

### Supabase Storage

用途：保存文档本体，不保存向量，不保存结构化业务数据。

Bucket：

- `documents`
- private bucket
- 单文件限制：1MB
- MIME：`application/pdf` / `application/x-pdf`

路径规范：

```text
documents/{user_id}/{uuid}-{safe_file_name}.pdf
```

示例：

```text
documents/2b7...9e/8f1...aa-annual-report.pdf
```

Storage 只负责：

- 原始 PDF 文件

不建议放：

- chunk 文本
- embedding
- 用户权限数据
- 对话数据

### PostgreSQL

用途：结构化数据、权限、状态、来源、对话、引用。

MVP 表：

- `documents`
- `document_chunks`
- `chat_sessions`
- `chat_messages`

PostgreSQL 负责：

- 用户文档列表
- 文档处理状态
- 文档元数据
- chunk 文本
- chunk 来源定位
- 对话记录
- 引用信息
- RLS 权限

### pgvector

用途：向量检索。

实现方式：

- pgvector 扩展装在 Supabase PostgreSQL 中
- `document_chunks.embedding vector(1536)`
- 当前默认对应 `text-embedding-3-small`

注意：

- 如果改用 `text-embedding-3-large` 且使用 3072 维，需要同步修改 schema 中的 `vector(1536)`。
- MVP 建议先用 `text-embedding-3-small`，成本低，速度快，够做文档问答。

## 3. 表设计

### documents

文档级元数据，一条记录对应一个上传文档。

核心字段：

- `id`: 文档 ID
- `user_id`: 所属用户，引用 `auth.users.id`
- `file_name`: 原始文件名
- `file_path`: Storage object path
- `file_size`: 文件大小
- `mime_type`: 文件 MIME
- `source_type`: 来源，MVP 为 `upload`
- `source_url`: 如果未来支持网页/API 同步，用于保存原始 URL
- `source_title`: 搜索或引用时展示的标题
- `source_author`: 来源作者或机构
- `source_published_date`: 发布日期
- `status`: `uploading` / `processing` / `ready` / `failed`
- `page_count`: 页数
- `error_message`: 失败原因
- `metadata`: 扩展字段
- `created_at`
- `updated_at`

`metadata` 建议结构：

```json
{
  "storage_path": "user_id/file.pdf",
  "uploaded_at": "2026-05-09T00:00:00.000Z",
  "parser": "pdf-parse",
  "language": "zh-CN",
  "checksum": "sha256..."
}
```

### document_chunks

chunk 级数据，一条记录对应一个可检索文本块。

核心字段：

- `id`: chunk ID
- `document_id`: 所属文档
- `content`: chunk 文本
- `chunk_index`: 文档内 chunk 顺序
- `page_number`: chunk 起始页码
- `paragraph_index`: 段落序号
- `char_start`: 在解析文本中的起始字符位置
- `char_end`: 在解析文本中的结束字符位置
- `embedding`: pgvector 向量
- `metadata`: 来源定位和解析信息
- `created_at`

`metadata` 建议结构：

```json
{
  "page_start": 3,
  "page_end": 4,
  "section_title": "风险因素",
  "token_count": 420,
  "embedding_model": "text-embedding-3-small",
  "chunk_strategy": "semantic-v1",
  "bbox": [
    {
      "page": 3,
      "x": 72,
      "y": 120,
      "width": 420,
      "height": 180
    }
  ]
}
```

MVP 最少需要：

- `document_id`
- `content`
- `chunk_index`
- `page_number`
- `embedding`

引用溯源需要：

- `page_number`
- `paragraph_index`
- `char_start`
- `char_end`
- `metadata.bbox`，后续做 PDF 高亮时使用

### chat_sessions

一次对话会话。

核心字段：

- `id`
- `user_id`
- `title`
- `created_at`
- `updated_at`

### chat_messages

对话消息和引用。

核心字段：

- `id`
- `session_id`
- `role`: `user` / `assistant` / `system`
- `content`
- `citations`
- `metadata`
- `created_at`

`citations` 建议结构：

```json
[
  {
    "chunk_id": "uuid",
    "document_id": "uuid",
    "file_name": "report.pdf",
    "page_number": 3,
    "paragraph_index": 2,
    "content_snippet": "原文片段...",
    "source_title": "2024 年度报告",
    "source_author": "某公司",
    "similarity": 0.82
  }
]
```

## 4. 权限设计

### PostgreSQL RLS

MVP 原则：

- 用户只能访问自己的 `documents`
- 用户只能访问自己文档下的 `document_chunks`
- 用户只能访问自己的 `chat_sessions`
- 用户只能访问自己会话下的 `chat_messages`

策略核心：

```sql
auth.uid() = user_id
```

`document_chunks` 通过 `documents.user_id` 间接鉴权。

### Storage RLS

Storage 路径第一段必须是 `user_id`：

```text
{user_id}/{file_name}
```

策略核心：

```sql
auth.uid()::text = (storage.foldername(name))[1]
```

当前上传 API 使用 service role 服务端上传，RLS 会被绕过，但保留 Storage RLS 方便未来做客户端直传。

## 5. 检索设计

### 语义检索

输入：

- 用户问题 embedding
- `user_id`
- `topK`
- `threshold`

过程：

- 在 `document_chunks.embedding` 上做 cosine similarity
- 只检索当前用户的文档 chunk

返回：

- chunk 文本
- 文档信息
- 页码
- 相似度
- 来源信息

### 关键词检索

用途：

- 补足向量检索对专有名词、数字、代码、合同条款编号的不足

实现：

- `pg_trgm`
- `keyword_search`

### 混合检索

用途：

- MVP 后期增强答案质量

公式：

```text
combined_score = vector_weight * vector_score + keyword_weight * keyword_score
```

默认：

- `vector_weight = 0.7`
- `keyword_weight = 0.3`

## 6. 文档处理状态

`documents.status`：

```text
uploading -> processing -> ready
uploading -> failed
processing -> failed
```

含义：

- `uploading`: 正在上传或刚创建记录
- `processing`: 文件已进 Storage，等待解析/向量化
- `ready`: chunks 和 embeddings 已写入，可问答
- `failed`: 上传、解析、分块或向量化失败

MVP 可以先同步处理小文件。

大文档后续需要：

- 异步任务队列
- worker 分批解析
- 批量 embedding
- 分批写入 chunks
- 进度字段或独立 job 表

## 7. 大文档后续设计

问题：

- 1000 页以上 PDF 内存压力大
- 解析耗时长
- embedding 调用需要分批
- API Route 可能超时

后续扩展：

- `document_processing_jobs`
- `document_pages`
- page-level text cache
- chunk batch insert
- embedding batch retry
- 失败重试和断点续跑

可选表：

```text
document_processing_jobs
- id
- document_id
- user_id
- status
- current_step
- progress
- error_message
- created_at
- updated_at

document_pages
- id
- document_id
- page_number
- text
- metadata
- created_at
```

## 8. MVP 验收

- 用户能 GitHub 登录。
- 用户能上传 PDF。
- PDF 原文进入 Supabase Storage。
- `documents` 产生记录，状态流正确。
- 文档解析后生成 chunks。
- chunks 保存页码和来源信息。
- embedding 写入 pgvector。
- 用户提问后能检索当前用户自己的 chunks。
- LLM 回答带引用来源。
- 点击引用能定位到文档页码。

## 9. 待解决问题

1. 大文档解析：1000 页以上内存控制、队列、分批处理。
2. 智能语义分块：标题、段落、表格、跨页内容。
3. Prompt 工程化：要求只基于引用回答。
4. 引用校验：答案与原文相关，过滤错误引用。
5. PDF 高亮：需要更精确的 bbox 坐标。
6. 微信扫码登录：后续评估微信开发者能力和免费额度。
