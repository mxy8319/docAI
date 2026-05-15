-- 与 lib/schema.sql 中 search_chunks 对齐：为向量检索增加可选文档 id 白名单。
-- 在 Supabase SQL Editor 或迁移工具中执行（若库中仍是旧签名，请用本段整体替换函数）。

create or replace function public.search_chunks(
  query_embedding vector(1536),
  p_user_id uuid,
  match_threshold float default 0.7,
  match_count int default 5,
  p_document_ids uuid[] default null
)
returns table (
  chunk_id uuid,
  content text,
  chunk_index int,
  page_number int,
  paragraph_index int,
  document_id uuid,
  file_name text,
  file_path text,
  source_title text,
  source_author text,
  source_url text,
  similarity float
)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  return query
  select
    dc.id as chunk_id,
    dc.content,
    dc.chunk_index,
    coalesce(dc.page_number, dc.page_start) as page_number,
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
    and dc.embedding is not null
    and (
      p_document_ids is null
      or cardinality(p_document_ids) = 0
      or d.id = any(p_document_ids)
    )
    and 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;
