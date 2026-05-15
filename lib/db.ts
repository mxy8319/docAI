/**
 * 数据库操作 API
 * 基于 Supabase PostgreSQL + pgvector
 * ⚠️ 此文件只能用于 Server Component / API Route / Server Action
 */

import { supabaseAdmin } from "./supabase-admin"
import type {
  Document,
  DocumentChunk,
  ChatSession,
  ChatMessage,
  SearchResult,
  HybridSearchResult,
  DocumentInsert,
  ChunkInsert,
  MessageInsert,
  Citation,
  DocumentStatus,
} from "./database.types"

// =============================================
// 文档操作
// =============================================

/**
 * 创建文档记录
 */
export async function createDocument(data: DocumentInsert): Promise<Document> {
  const { data: doc, error } = await supabaseAdmin
    .from("documents")
    .insert({
      user_id: data.user_id,
      storage_bucket: data.storage_bucket || "documents",
      file_name: data.file_name,
      file_path: data.file_path,
      file_size: data.file_size,
      mime_type: data.mime_type || "application/pdf",
      checksum_sha256: data.checksum_sha256,
      source_type: data.source_type || "upload",
      source_url: data.source_url,
      source_title: data.source_title,
      source_author: data.source_author,
      source_published_date: data.source_published_date,
      status: data.status || "processing",
      current_step: data.current_step,
      progress: data.progress ?? 0,
      page_count: data.page_count,
      chunk_count: data.chunk_count ?? 0,
      parser_name: data.parser_name,
      parser_version: data.parser_version,
      chunk_strategy: data.chunk_strategy,
      embedding_model: data.embedding_model || "text-embedding-3-small",
      embedding_dimensions: data.embedding_dimensions || 1536,
      metadata: data.metadata || {},
    })
    .select()
    .single()

  if (error) {
    throw new Error(`创建文档记录失败: ${error.message}`)
  }

  return doc as Document
}

/**
 * 获取用户文档列表
 */
export async function getDocuments(userId: string): Promise<Document[]> {
  const { data, error } = await supabaseAdmin
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`查询文档列表失败: ${error.message}`)
  }

  return (data || []) as Document[]
}

/**
 * 获取单个文档
 */
export async function getDocument(documentId: string): Promise<Document | null> {
  const { data, error } = await supabaseAdmin
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(`查询文档失败: ${error.message}`)
  }

  return data as Document
}

/**
 * 读取向量块全文（校验块所属文档属于该用户）
 */
export async function getDocumentChunkByIdForUser(
  chunkId: string,
  userId: string
): Promise<{
  content: string
  page_number: number | null
  file_name: string
  document_id: string
} | null> {
  const { data: chunk, error } = await supabaseAdmin
    .from("document_chunks")
    .select("id, content, page_number, document_id")
    .eq("id", chunkId)
    .maybeSingle()

  if (error || !chunk) return null

  const doc = await getDocument(chunk.document_id as string)
  if (!doc || doc.user_id !== userId) return null

  return {
    content: chunk.content as string,
    page_number: chunk.page_number as number | null,
    file_name: doc.file_name,
    document_id: doc.id,
  }
}

/**
 * 获取用户文档列表（分页）
 */
function escapeIlikePattern(raw: string): string {
  return raw.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")
}

export async function getDocumentsPaginated(
  userId: string,
  options: {
    page?: number
    pageSize?: number
    status?: DocumentStatus
    /** Case-insensitive substring match on `file_name` */
    search?: string
  } = {}
): Promise<{
  documents: Document[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}> {
  const { page = 1, pageSize = 10, status, search } = options
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabaseAdmin.from("documents").select("*", { count: "exact" }).eq("user_id", userId)

  if (status) {
    query = query.eq("status", status)
  }

  const q = search?.trim()
  if (q) {
    query = query.ilike("file_name", `%${escapeIlikePattern(q)}%`)
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(`查询文档列表失败: ${error.message}`)
  }

  const total = count || 0

  return {
    documents: (data || []) as Document[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * 更新文档状态
 */
export async function updateDocumentStatus(
  documentId: string,
  status: DocumentStatus,
  errorMessage?: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("documents")
    .update({
      status,
      error_message: errorMessage,
    })
    .eq("id", documentId)

  if (error) {
    throw new Error(`更新文档状态失败: ${error.message}`)
  }
}

/**
 * 更新文档处理进度
 */
export async function updateDocumentProcessingState(
  documentId: string,
  updates: Partial<{
    status: DocumentStatus
    current_step: string | null
    progress: number
    page_count: number
    chunk_count: number
    error_message: string | null
    checksum_sha256: string
    source_title: string
    source_author: string
    parser_name: string
    parser_version: string
    chunk_strategy: string
    embedding_model: string
    embedding_dimensions: number
    metadata: Record<string, any>
  }>
): Promise<void> {
  const { error } = await supabaseAdmin.from("documents").update(updates).eq("id", documentId)

  if (error) {
    throw new Error(`更新文档处理状态失败: ${error.message}`)
  }
}

/**
 * 更新文档元信息
 */
export async function updateDocument(
  documentId: string,
  updates: Partial<{
    file_name: string
    source_title: string
    source_author: string
    source_published_date: string
    status: DocumentStatus
    current_step: string | null
    progress: number
    page_count: number
    chunk_count: number
    error_message: string | null
    checksum_sha256: string
    parser_name: string
    parser_version: string
    chunk_strategy: string
    embedding_model: string
    embedding_dimensions: number
    metadata: Record<string, any>
  }>
): Promise<void> {
  const { error } = await supabaseAdmin.from("documents").update(updates).eq("id", documentId)

  if (error) {
    throw new Error(`更新文档失败: ${error.message}`)
  }
}

/**
 * 删除文档（会级联删除向量块）
 */
export async function deleteDocument(documentId: string): Promise<void> {
  // 先获取文件路径
  const doc = await getDocument(documentId)
  if (!doc) return

  // 删除文档记录（向量块会级联删除）
  const { error: docError } = await supabaseAdmin.from("documents").delete().eq("id", documentId)

  if (docError) {
    throw new Error(`删除文档失败: ${docError.message}`)
  }

  // 删除 Storage 文件
  if (doc.file_path) {
    const { error: storageError } = await supabaseAdmin.storage
      .from("documents")
      .remove([doc.file_path])

    if (storageError) {
      console.error(`Storage 文件删除失败: ${storageError.message}`)
    }
  }
}

// =============================================
// 向量块操作
// =============================================

/**
 * 批量插入向量块
 */
export async function insertChunks(chunks: ChunkInsert[]): Promise<void> {
  if (chunks.length === 0) return

  const { error } = await supabaseAdmin.from("document_chunks").insert(
    chunks.map((c) => ({
      document_id: c.document_id,
      content: c.content,
      chunk_index: c.chunk_index,
      token_count: c.token_count ?? null,
      page_number: c.page_number ?? null,
      page_start: c.page_start ?? c.page_number ?? null,
      page_end: c.page_end ?? c.page_start ?? c.page_number ?? null,
      paragraph_index: c.paragraph_index ?? null,
      char_start: c.char_start ?? null,
      char_end: c.char_end ?? null,
      section_title: c.section_title ?? null,
      bbox: c.bbox || [],
      embedding: c.embedding,
      embedding_model: c.embedding_model || "text-embedding-3-small",
      embedding_dimensions: c.embedding_dimensions || 1536,
      metadata: c.metadata || {},
    }))
  )

  if (error) {
    throw new Error(`插入向量块失败: ${error.message}`)
  }
}

/**
 * 逐条插入向量块（大批量时避免超时）
 */
export async function insertChunksInBatches(chunks: ChunkInsert[], batchSize = 100): Promise<void> {
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize)
    await insertChunks(batch)
  }
}

/**
 * 获取文档的所有向量块
 */
export async function getDocumentChunks(documentId: string): Promise<DocumentChunk[]> {
  const { data, error } = await supabaseAdmin
    .from("document_chunks")
    .select("*")
    .eq("document_id", documentId)
    .order("chunk_index", { ascending: true })

  if (error) {
    throw new Error(`查询向量块失败: ${error.message}`)
  }

  return (data || []) as DocumentChunk[]
}

/**
 * 获取向量块数量
 */
export async function getChunkCount(documentId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from("document_chunks")
    .select("*", { count: "exact", head: true })
    .eq("document_id", documentId)

  if (error) {
    throw new Error(`查询向量块数量失败: ${error.message}`)
  }

  return count || 0
}

/**
 * 删除文档的所有向量块
 */
export async function deleteDocumentChunks(documentId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("document_chunks")
    .delete()
    .eq("document_id", documentId)

  if (error) {
    throw new Error(`删除向量块失败: ${error.message}`)
  }
}

// =============================================
// 向量搜索
// =============================================

/**
 * 向量语义搜索（使用 search_chunks 函数）
 */
export async function semanticSearch(
  queryEmbedding: number[],
  userId: string,
  options: {
    threshold?: number
    topK?: number
  } = {}
): Promise<SearchResult[]> {
  const { threshold = 0.7, topK = 5 } = options

  const { data, error } = await supabaseAdmin.rpc("search_chunks", {
    query_embedding: queryEmbedding,
    p_user_id: userId,
    match_threshold: threshold,
    match_count: topK,
  })

  if (error) {
    throw new Error(`向量搜索失败: ${error.message}`)
  }

  return (data || []) as SearchResult[]
}

/**
 * 关键词全文搜索
 */
export async function keywordSearch(
  query: string,
  userId: string,
  topK = 10
): Promise<SearchResult[]> {
  const { data, error } = await supabaseAdmin.rpc("keyword_search", {
    search_query: query,
    p_user_id: userId,
    match_count: topK,
  })

  if (error) {
    throw new Error(`关键词搜索失败: ${error.message}`)
  }

  return (data || []) as SearchResult[]
}

/**
 * 混合搜索（向量 + 关键词）
 */
export async function hybridSearch(
  queryEmbedding: number[],
  query: string,
  userId: string,
  options: {
    threshold?: number
    topK?: number
    vectorWeight?: number
    keywordWeight?: number
  } = {}
): Promise<HybridSearchResult[]> {
  const { threshold = 0.6, topK = 5, vectorWeight = 0.7, keywordWeight = 0.3 } = options

  const { data, error } = await supabaseAdmin.rpc("hybrid_search", {
    query_embedding: queryEmbedding,
    search_query: query,
    p_user_id: userId,
    match_threshold: threshold,
    match_count: topK,
    vector_weight: vectorWeight,
    keyword_weight: keywordWeight,
  })

  if (error) {
    throw new Error(`混合搜索失败: ${error.message}`)
  }

  return (data || []) as HybridSearchResult[]
}

/**
 * 将搜索结果转换为引用格式
 */
export function resultsToCitations(results: SearchResult[]): Citation[] {
  return results.map((r) => ({
    chunk_id: r.chunk_id,
    document_id: r.document_id,
    file_name: r.file_name,
    page_number: r.page_number ?? null,
    paragraph_index: r.paragraph_index ?? null,
    content_snippet: r.content.length > 200 ? r.content.slice(0, 200) + "..." : r.content,
    source_title: r.source_title ?? null,
    source_author: r.source_author ?? null,
    similarity: r.similarity,
  }))
}

// =============================================
// 对话会话操作
// =============================================

/**
 * 创建新会话
 */
export async function createSession(userId: string, title?: string): Promise<ChatSession> {
  const { data, error } = await supabaseAdmin
    .from("chat_sessions")
    .insert({ user_id: userId, title: title || "新对话" })
    .select()
    .single()

  if (error) {
    throw new Error(`创建会话失败: ${error.message}`)
  }

  return data as ChatSession
}

/**
 * 获取用户会话列表
 */
export async function getSessions(userId: string): Promise<ChatSession[]> {
  const { data, error } = await supabaseAdmin
    .from("chat_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error) {
    throw new Error(`查询会话列表失败: ${error.message}`)
  }

  return (data || []) as ChatSession[]
}

/**
 * 获取单个会话
 */
export async function getSession(sessionId: string): Promise<ChatSession | null> {
  const { data, error } = await supabaseAdmin
    .from("chat_sessions")
    .select("*")
    .eq("id", sessionId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(`查询会话失败: ${error.message}`)
  }

  return data as ChatSession
}

/**
 * 更新会话标题
 */
export async function updateSessionTitle(sessionId: string, title: string): Promise<void> {
  const { error } = await supabaseAdmin.from("chat_sessions").update({ title }).eq("id", sessionId)

  if (error) {
    throw new Error(`更新会话标题失败: ${error.message}`)
  }
}

export async function setSessionArchived(sessionId: string, archived: boolean): Promise<void> {
  const { error } = await supabaseAdmin
    .from("chat_sessions")
    .update({ is_archived: archived, updated_at: new Date().toISOString() })
    .eq("id", sessionId)

  if (error) {
    throw new Error(`更新会话归档状态失败: ${error.message}`)
  }
}

export async function updateChatMessage(
  sessionId: string,
  messageId: string,
  patch: { content?: string; metadata?: Record<string, unknown> }
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("chat_messages")
    .update({
      ...(patch.content !== undefined ? { content: patch.content } : {}),
      ...(patch.metadata !== undefined ? { metadata: patch.metadata } : {}),
    })
    .eq("id", messageId)
    .eq("session_id", sessionId)

  if (error) {
    throw new Error(`更新消息失败: ${error.message}`)
  }
}

/**
 * 删除会话（会级联删除消息）
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const { error } = await supabaseAdmin.from("chat_sessions").delete().eq("id", sessionId)

  if (error) {
    throw new Error(`删除会话失败: ${error.message}`)
  }
}

/**
 * 更新会话的最后活跃时间
 */
export async function touchSession(sessionId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("chat_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", sessionId)

  if (error) {
    console.error(`更新会话活跃时间失败: ${error.message}`)
  }
}

// =============================================
// 对话消息操作
// =============================================

/**
 * 保存消息
 */
export async function saveMessage(data: MessageInsert): Promise<ChatMessage> {
  const row: Record<string, unknown> = {
    session_id: data.session_id,
    role: data.role,
    content: data.content,
    citations: data.citations || [],
    metadata: data.metadata || {},
  }
  if (data.id) {
    row.id = data.id
  }

  const { data: msg, error } = await supabaseAdmin
    .from("chat_messages")
    .insert(row)
    .select()
    .single()

  if (error) {
    throw new Error(`保存消息失败: ${error.message}`)
  }

  return msg as ChatMessage
}

/**
 * 获取会话消息列表
 */
export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabaseAdmin
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error(`查询消息列表失败: ${error.message}`)
  }

  return (data || []) as ChatMessage[]
}

/**
 * 删除会话的所有消息
 */
export async function deleteSessionMessages(sessionId: string): Promise<void> {
  const { error } = await supabaseAdmin.from("chat_messages").delete().eq("session_id", sessionId)

  if (error) {
    throw new Error(`删除消息失败: ${error.message}`)
  }
}

/**
 * 获取消息数量
 */
export async function getMessageCount(sessionId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)

  if (error) {
    throw new Error(`查询消息数量失败: ${error.message}`)
  }

  return count || 0
}

// =============================================
// 组合操作（事务性）
// =============================================

/**
 * 删除文档及其所有关联数据
 */
export async function deleteDocumentCompletely(documentId: string): Promise<void> {
  // 1. 获取文档信息
  const doc = await getDocument(documentId)
  if (!doc) return

  // 2. 删除向量块
  await deleteDocumentChunks(documentId)

  // 3. 删除文档记录
  await supabaseAdmin.from("documents").delete().eq("id", documentId)

  // 4. 删除 Storage 文件
  if (doc.file_path) {
    await supabaseAdmin.storage.from("documents").remove([doc.file_path])
  }
}

/**
 * 创建会话并保存首条用户消息
 */
export async function createSessionWithMessage(
  userId: string,
  firstMessage: string,
  title?: string
): Promise<ChatSession> {
  // 1. 创建会话
  const session = await createSession(userId, title || generateSessionTitle(firstMessage))

  // 2. 保存首条消息
  await saveMessage({
    session_id: session.id,
    role: "user",
    content: firstMessage,
  })

  return session
}

/**
 * 生成会话标题（取消息前30个字）
 */
function generateSessionTitle(message: string): string {
  return message.length > 30 ? message.slice(0, 30) + "..." : message
}

// =============================================
// 统计查询
// =============================================

/**
 * 获取用户文档统计
 */
export async function getUserDocumentStats(userId: string): Promise<{
  total: number
  ready: number
  processing: number
  failed: number
  totalChunks: number
}> {
  const { data: docs, error: docsError } = await supabaseAdmin
    .from("documents")
    .select("id, status")
    .eq("user_id", userId)

  if (docsError) {
    throw new Error(`查询文档统计失败: ${docsError.message}`)
  }

  const total = docs?.length || 0
  const ready = docs?.filter((d) => d.status === "ready").length || 0
  const processing = docs?.filter((d) => d.status === "processing").length || 0
  const failed = docs?.filter((d) => d.status === "failed").length || 0

  // 查询向量块总数
  const { count: totalChunks, error: chunksError } = await supabaseAdmin
    .from("document_chunks")
    .select("*", { count: "exact", head: true })
    .in("document_id", docs?.map((d) => d.id) || [])

  if (chunksError) {
    console.error(`查询向量块统计失败: ${chunksError.message}`)
  }

  return {
    total,
    ready,
    processing,
    failed,
    totalChunks: totalChunks || 0,
  }
}

/**
 * 获取用户会话统计
 */
export async function getUserChatStats(userId: string): Promise<{
  totalSessions: number
  totalMessages: number
}> {
  const { count: totalSessions, error: sessionsError } = await supabaseAdmin
    .from("chat_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  if (sessionsError) {
    throw new Error(`查询会话统计失败: ${sessionsError.message}`)
  }

  const { count: totalMessages, error: messagesError } = await supabaseAdmin
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .in(
      "session_id",
      (await getSessions(userId)).map((s) => s.id)
    )

  if (messagesError) {
    console.error(`查询消息统计失败: ${messagesError.message}`)
  }

  return {
    totalSessions: totalSessions || 0,
    totalMessages: totalMessages || 0,
  }
}
