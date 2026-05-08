-- =============================================
-- 1. 用户表（使用 Supabase Auth，不需要自己建表）
-- auth.users 由 Supabase 自动管理
-- =============================================

-- =============================================
-- 2. 文档元数据表（核心：来源信息）
-- =============================================
create table public.documents (
 -- 主键
 id uuid primary key default gen_random_uuid(),
 
 -- 用户关联（Supabase Auth 用户ID）
 user_id uuid not null references auth.users(id) on delete cascade,
 
 -- 文件基本信息
 file_name text not null, -- 原始文件名：报告.pdf
 file_path text not null, -- Storage 路径：user_id/uuid.pdf
 file_size bigint, -- 文件大小（字节）
 mime_type text default 'application/pdf',
 
 -- 来源信息（搜索结果展示用）
 source_type text default 'upload', -- 来源类型：upload / api / sync
 source_url text, -- 原始链接（如果是从网页抓取）
 source_title text, -- 来源标题：2024年度报告
 source_author text, -- 作者/发布机构
 source_published_date date, -- 发布日期
 
 -- 文档处理状态
 status text not null default 'uploading', -- uploading / processing / ready / failed
 page_count int, -- 总页数
 error_message text, -- 错误信息
 
 -- 元数据（可扩展）
 metadata jsonb default '{}', -- 自定义字段：tags, category 等
 
 -- 时间戳
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

-- 索引
create index idx_documents_user_id on public.documents(user_id);
create index idx_documents_status on public.documents(status);
create index idx_documents_created_at on public.documents(created_at desc);

-- =============================================
-- 3. 向量块表（pgvector + 来源定位）
-- =============================================
create table public.document_chunks (
 -- 主键
 id uuid primary key default gen_random_uuid(),
 
 -- 文档关联
 document_id uuid not null references public.documents(id) on delete cascade,
 
 -- 文本内容
 content text not null, -- 文本片段
 
 -- 来源定位（核心：搜索结果指向原文位置）
 chunk_index int not null, -- 块序号：第几块
 page_number int, -- 所在页码：第 5 页
 paragraph_index int, -- 段落序号
 char_start int, -- 字符起始位置
 char_end int, -- 字符结束位置
 
 -- 向量（1536 维，text-embedding-3-small）
 embedding vector(1536),
 
 -- 块元数据
 metadata jsonb default '{}', -- 可扩展：标题层级、表格标记等
 
 -- 时间戳
 created_at timestamptz not null default now()
);

-- 向量索引（HNSW，性能更好）
create index idx_chunks_embedding on public.document_chunks
 using hnsw (embedding vector_cosine_ops);

-- 文档关联索引
create index idx_chunks_document_id on public.document_chunks(document_id);

-- =============================================
-- 4. 对话会话表
-- =============================================
create table public.chat_sessions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text, -- 会话标题：关于财务报告的讨论
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create index idx_sessions_user_id on public.chat_sessions(user_id, updated_at desc);

-- =============================================
-- 5. 对话消息表（含引用来源）
-- =============================================
create table public.chat_messages (
 id uuid primary key default gen_random_uuid(),
 session_id uuid not null references public.chat_sessions(id) on delete cascade,
 
 -- 消息角色和内容
 role text not null check (role in ('user', 'assistant', 'system')),
 content text not null,
 
 -- 引用来源（核心：AI 回答引用了哪些文档块）
 citations jsonb default '[]', -- 格式见下方说明
 
 -- 其他元数据
 metadata jsonb default '{}', -- tokens, model 等
 
 created_at timestamptz not null default now()
);

create index idx_messages_session_id on public.chat_messages(session_id, created_at);

-- =============================================
-- 6. RLS 策略
-- =============================================
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

-- Documents: 用户只能操作自己的文档
create policy "Users manage own documents"
 on public.documents for all
 using (auth.uid() = user_id)
 with check (auth.uid() = user_id);

-- Chunks: 用户只能查询自己文档的向量
create policy "Users read own chunks"
 on public.document_chunks for select
 using (
 document_id in (
 select id from public.documents where user_id = auth.uid()
 )
 );

-- Chunks: 只有服务端能写入向量
create policy "Service role manages chunks"
 on public.document_chunks for all
 using (auth.role() = 'service_role');

-- Sessions: 用户只能操作自己的会话
create policy "Users manage own sessions"
 on public.chat_sessions for all
 using (auth.uid() = user_id)
 with check (auth.uid() = user_id);

-- Messages: 用户只能操作自己会话的消息
create policy "Users manage own messages"
 on public.chat_messages for all
 using (
 session_id in (
 select id from public.chat_sessions where user_id = auth.uid()
 )
 );

-- =============================================
-- 7. 向量搜索函数（返回完整来源信息）
-- =============================================
create or replace function public.search_chunks(
 query_embedding vector(1536),
 p_user_id uuid,
 match_threshold float default 0.7,
 match_count int default 5
)
returns table (
 -- 块信息
 chunk_id uuid,
 content text,
 chunk_index int,
 page_number int,
 paragraph_index int,
 
 -- 来源定位
 document_id uuid,
 file_name text,
 file_path text,
 source_title text,
 source_author text,
 source_url text,
 
 -- 相似度
 similarity float
)
language plpgsql
security definer
as $$
begin
 return query
 select
 dc.id as chunk_id,
 dc.content,
 dc.chunk_index,
 dc.page_number,
 dc.paragraph_index,
 
 d.id as document_id,
 d.file_name,
 d.file_path,
 d.source_title,
 d.source_author,
 d.source_url,
 
 1 - (dc.embedding <=> query_embedding) as similarity
 from public.document_chunks dc
 join public.documents d on d.id = dc.document_id
 where d.user_id = p_user_id
 and 1 - (dc.embedding <=> query_embedding) > match_threshold
 order by dc.embedding <=> query_embedding
 limit match_count;
end;
$$;

-- =============================================
-- 8. 更新时间触发器
-- =============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
 new.updated_at = now();
 return new;
end;
$$ language plpgsql;

create trigger set_documents_updated_at
 before update on public.documents
 for each row execute function public.handle_updated_at();

create trigger set_sessions_updated_at
 before update on public.chat_sessions
 for each row execute function public.handle_updated_at();
