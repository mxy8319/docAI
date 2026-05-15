-- =============================================
-- DocAI Supabase schema
-- PostgreSQL: structured data, permissions, document metadata, chunk provenance.
-- pgvector: semantic vector retrieval.
-- Supabase Storage: original document files.
-- =============================================

-- Extensions
create extension if not exists vector with schema extensions;
create extension if not exists pg_trgm with schema extensions;
set search_path = public, extensions;

-- =============================================
-- Storage bucket: original document bodies
-- =============================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  52428800,
  array['application/pdf', 'application/x-pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- =============================================
-- Documents: structured metadata for files stored in Supabase Storage
-- =============================================
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Storage identity. file_path is the object name inside the documents bucket:
  -- {user_id}/{uuid}-{safe_file_name}.pdf
  storage_bucket text not null default 'documents',
  file_path text not null,
  file_name text not null,
  file_size bigint,
  mime_type text not null default 'application/pdf',
  checksum_sha256 text,

  -- Source metadata shown in search results and citations.
  source_type text not null default 'upload' check (source_type in ('upload', 'api', 'sync')),
  source_url text,
  source_title text,
  source_author text,
  source_published_date date,

  -- Processing lifecycle.
  status text not null default 'uploading' check (status in ('uploading', 'processing', 'ready', 'failed')),
  current_step text,
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  page_count int check (page_count is null or page_count >= 0),
  chunk_count int not null default 0 check (chunk_count >= 0),
  error_message text,

  -- Parser and embedding model metadata.
  parser_name text,
  parser_version text,
  chunk_strategy text,
  embedding_model text not null default 'text-embedding-3-small',
  embedding_dimensions int not null default 1536,

  metadata jsonb not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint documents_storage_bucket_check check (storage_bucket = 'documents'),
  constraint documents_file_path_user_prefix_check check (file_path like user_id::text || '/%')
);

create index if not exists idx_documents_user_id on public.documents(user_id);
create index if not exists idx_documents_status on public.documents(status);
create index if not exists idx_documents_created_at on public.documents(created_at desc);
create index if not exists idx_documents_source_type on public.documents(source_type);

-- =============================================
-- Document chunks: text, source location, and pgvector embedding
-- =============================================
create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,

  -- Text and order inside the document.
  content text not null,
  chunk_index int not null check (chunk_index >= 0),
  token_count int check (token_count is null or token_count >= 0),

  -- Source provenance. page_number is kept for existing app code and usually
  -- equals page_start.
  page_number int check (page_number is null or page_number >= 1),
  page_start int check (page_start is null or page_start >= 1),
  page_end int check (page_end is null or page_end >= 1),
  paragraph_index int check (paragraph_index is null or paragraph_index >= 0),
  char_start int check (char_start is null or char_start >= 0),
  char_end int check (char_end is null or char_end >= 0),
  section_title text,

  -- Optional PDF coordinate data for future citation highlighting.
  -- Expected shape:
  -- [{"page": 1, "x": 72, "y": 120, "width": 420, "height": 180}]
  bbox jsonb not null default '[]',

  -- pgvector. 1536 dimensions match text-embedding-3-small.
  embedding vector(1536),
  embedding_model text not null default 'text-embedding-3-small',
  embedding_dimensions int not null default 1536,

  metadata jsonb not null default '{}',

  created_at timestamptz not null default now(),

  constraint document_chunks_page_range_check check (
    page_start is null
    or page_end is null
    or page_end >= page_start
  ),
  constraint document_chunks_char_range_check check (
    char_start is null
    or char_end is null
    or char_end >= char_start
  ),
  constraint document_chunks_unique_index unique (document_id, chunk_index)
);

create index if not exists idx_chunks_document_id on public.document_chunks(document_id);
create index if not exists idx_chunks_document_page on public.document_chunks(document_id, page_start, page_end);
create index if not exists idx_chunks_embedding on public.document_chunks
  using hnsw (embedding vector_cosine_ops);
create index if not exists idx_chunks_content_trgm on public.document_chunks
  using gin (content gin_trgm_ops);
create index if not exists idx_chunks_bbox_gin on public.document_chunks
  using gin (bbox);

-- =============================================
-- Chat sessions
-- =============================================
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_sessions_user_id on public.chat_sessions(user_id, updated_at desc);

alter table public.chat_sessions
  add column if not exists is_archived boolean not null default false;

-- =============================================
-- Chat messages: answers and citations
-- =============================================
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  citations jsonb not null default '[]',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_session_id on public.chat_messages(session_id, created_at);
create index if not exists idx_messages_citations_gin on public.chat_messages
  using gin (citations);

-- =============================================
-- RLS: PostgreSQL structured data permissions
-- =============================================
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "Users manage own documents" on public.documents;
create policy "Users manage own documents"
  on public.documents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users read own chunks" on public.document_chunks;
create policy "Users read own chunks"
  on public.document_chunks for select
  using (
    exists (
      select 1
      from public.documents
      where documents.id = document_chunks.document_id
        and documents.user_id = auth.uid()
    )
  );

drop policy if exists "Service role manages chunks" on public.document_chunks;
create policy "Service role manages chunks"
  on public.document_chunks for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Users manage own sessions" on public.chat_sessions;
create policy "Users manage own sessions"
  on public.chat_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own messages" on public.chat_messages;
create policy "Users manage own messages"
  on public.chat_messages for all
  using (
    exists (
      select 1
      from public.chat_sessions
      where chat_sessions.id = chat_messages.session_id
        and chat_sessions.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.chat_sessions
      where chat_sessions.id = chat_messages.session_id
        and chat_sessions.user_id = auth.uid()
    )
  );

-- =============================================
-- RLS: Supabase Storage original document files
-- =============================================
drop policy if exists "Users read own document files" on storage.objects;
create policy "Users read own document files"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users upload own document files" on storage.objects;
create policy "Users upload own document files"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users update own document files" on storage.objects;
create policy "Users update own document files"
  on storage.objects for update
  using (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users delete own document files" on storage.objects;
create policy "Users delete own document files"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- RPC: semantic vector search
-- =============================================
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

-- =============================================
-- RPC: keyword search
-- =============================================
create or replace function public.keyword_search(
  search_query text,
  p_user_id uuid,
  match_count int default 10
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
    similarity(dc.content, search_query) as similarity
  from public.document_chunks dc
  join public.documents d on d.id = dc.document_id
  where d.user_id = p_user_id
    and dc.content % search_query
  order by similarity(dc.content, search_query) desc, dc.created_at desc
  limit match_count;
end;
$$;

-- =============================================
-- RPC: hybrid vector + keyword search
-- =============================================
create or replace function public.hybrid_search(
  query_embedding vector(1536),
  search_query text,
  p_user_id uuid,
  match_threshold float default 0.6,
  match_count int default 5,
  vector_weight float default 0.7,
  keyword_weight float default 0.3
)
returns table (
  chunk_id uuid,
  content text,
  chunk_index int,
  page_number int,
  document_id uuid,
  file_name text,
  source_title text,
  vector_score float,
  keyword_score float,
  combined_score float
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
    d.id as document_id,
    d.file_name,
    d.source_title,
    case
      when dc.embedding is null then 0::float
      else (1 - (dc.embedding <=> query_embedding))::float
    end as vector_score,
    similarity(dc.content, search_query)::float as keyword_score,
    (
      vector_weight * case
        when dc.embedding is null then 0::float
        else (1 - (dc.embedding <=> query_embedding))::float
      end
      + keyword_weight * similarity(dc.content, search_query)::float
    )::float as combined_score
  from public.document_chunks dc
  join public.documents d on d.id = dc.document_id
  where d.user_id = p_user_id
    and (
      (
        dc.embedding is not null
        and 1 - (dc.embedding <=> query_embedding) > match_threshold
      )
      or dc.content % search_query
    )
  order by combined_score desc
  limit match_count;
end;
$$;

-- =============================================
-- Updated-at trigger
-- =============================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at
  before update on public.documents
  for each row execute function public.handle_updated_at();

drop trigger if exists set_sessions_updated_at on public.chat_sessions;
create trigger set_sessions_updated_at
  before update on public.chat_sessions
  for each row execute function public.handle_updated_at();
