// lib/database.types.ts

// =============================================
// 文档状态
// =============================================
export type DocumentStatus = "uploading" | "processing" | "ready" | "failed"

// =============================================
// 来源类型
// =============================================
export type SourceType = "upload" | "api" | "sync"

// =============================================
// 文档元数据表
// =============================================
export interface Document {
  id: string
  user_id: string
  storage_bucket: string
  file_name: string
  file_path: string
  file_size: number | null
  mime_type: string
  checksum_sha256: string | null
  source_type: SourceType
  source_url: string | null
  source_title: string | null
  source_author: string | null
  source_published_date: string | null
  status: DocumentStatus
  current_step: string | null
  progress: number
  page_count: number | null
  chunk_count: number
  error_message: string | null
  parser_name: string | null
  parser_version: string | null
  chunk_strategy: string | null
  embedding_model: string
  embedding_dimensions: number
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

// =============================================
// 向量块表
// =============================================
export interface DocumentChunk {
  id: string
  document_id: string
  content: string
  chunk_index: number
  token_count: number | null
  page_number: number | null
  page_start: number | null
  page_end: number | null
  paragraph_index: number | null
  char_start: number | null
  char_end: number | null
  section_title: string | null
  bbox: Array<{
    page: number
    x: number
    y: number
    width: number
    height: number
  }>
  embedding: number[] | null
  embedding_model: string
  embedding_dimensions: number
  metadata: Record<string, any>
  created_at: string
}

// =============================================
// 对话会话表
// =============================================
export interface ChatSession {
  id: string
  user_id: string
  title: string | null
  /** Present when DB has been migrated with `lib/schema.sql` archived column. */
  is_archived?: boolean
  created_at: string
  updated_at: string
}

// =============================================
// 对话消息表
// =============================================
export type MessageRole = "user" | "assistant" | "system"

export interface ChatMessage {
  id: string
  session_id: string
  role: MessageRole
  content: string
  citations: Citation[]
  metadata: Record<string, any>
  created_at: string
}

// =============================================
// 引用来源（用于 citations 字段）
// =============================================
export interface Citation {
  chunk_id: string
  document_id: string
  file_name: string
  page_number: number | null
  paragraph_index: number | null
  content_snippet: string
  source_title: string | null
  source_author: string | null
  similarity: number
}

// =============================================
// 搜索结果
// =============================================
export interface SearchResult {
  chunk_id: string
  content: string
  chunk_index: number
  page_number: number | null
  paragraph_index: number | null
  document_id: string
  file_name: string
  file_path: string
  source_title: string | null
  source_author: string | null
  source_url: string | null
  similarity: number
}

// =============================================
// 混合搜索结果
// =============================================
export interface HybridSearchResult {
  chunk_id: string
  content: string
  chunk_index: number
  page_number: number | null
  document_id: string
  file_name: string
  source_title: string | null
  vector_score: number
  keyword_score: number
  combined_score: number
}

// =============================================
// 向量块插入（批量）
// =============================================
export interface ChunkInsert {
  document_id: string
  content: string
  chunk_index: number
  token_count?: number | null
  page_number?: number | null
  page_start?: number | null
  page_end?: number | null
  paragraph_index?: number | null
  char_start?: number | null
  char_end?: number | null
  section_title?: string | null
  bbox?: Array<{
    page: number
    x: number
    y: number
    width: number
    height: number
  }>
  embedding: number[]
  embedding_model?: string
  embedding_dimensions?: number
  metadata?: Record<string, any>
}

// =============================================
// 文档插入
// =============================================
export interface DocumentInsert {
  user_id: string
  storage_bucket?: string
  file_name: string
  file_path: string
  file_size?: number
  mime_type?: string
  checksum_sha256?: string
  source_type?: SourceType
  source_url?: string
  source_title?: string
  source_author?: string
  source_published_date?: string
  status?: DocumentStatus
  current_step?: string
  progress?: number
  page_count?: number
  chunk_count?: number
  parser_name?: string
  parser_version?: string
  chunk_strategy?: string
  embedding_model?: string
  embedding_dimensions?: number
  metadata?: Record<string, any>
}

// =============================================
// 消息插入
// =============================================
export interface MessageInsert {
  /** When set, row id matches AI SDK / assistant-ui message id for stable persistence. */
  id?: string
  session_id: string
  role: MessageRole
  content: string
  citations?: Citation[]
  metadata?: Record<string, any>
}
