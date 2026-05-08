// lib/database.types.ts

// =============================================
// 文档状态
// =============================================
export type DocumentStatus = "uploading" | "processing" | "ready" | "failed";

// =============================================
// 来源类型
// =============================================
export type SourceType = "upload" | "api" | "sync";

// =============================================
// 文档元数据表
// =============================================
export interface Document {
 id: string;
 user_id: string;
 file_name: string;
 file_path: string;
 file_size: number | null;
 mime_type: string;
 source_type: SourceType;
 source_url: string | null;
 source_title: string | null;
 source_author: string | null;
 source_published_date: string | null;
 status: DocumentStatus;
 page_count: number | null;
 error_message: string | null;
 metadata: Record<string, any>;
 created_at: string;
 updated_at: string;
}

// =============================================
// 向量块表
// =============================================
export interface DocumentChunk {
 id: string;
 document_id: string;
 content: string;
 chunk_index: number;
 page_number: number | null;
 paragraph_index: number | null;
 char_start: number | null;
 char_end: number | null;
 embedding: number[] | null;
 metadata: Record<string, any>;
 created_at: string;
}

// =============================================
// 对话会话表
// =============================================
export interface ChatSession {
 id: string;
 user_id: string;
 title: string | null;
 created_at: string;
 updated_at: string;
}

// =============================================
// 对话消息表
// =============================================
export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
 id: string;
 session_id: string;
 role: MessageRole;
 content: string;
 citations: Citation[];
 metadata: Record<string, any>;
 created_at: string;
}

// =============================================
// 引用来源（用于 citations 字段）
// =============================================
export interface Citation {
 chunk_id: string;
 document_id: string;
 file_name: string;
 page_number: number | null;
 paragraph_index: number | null;
 content_snippet: string;
 source_title: string | null;
 source_author: string | null;
 similarity: number;
}

// =============================================
// 搜索结果
// =============================================
export interface SearchResult {
 chunk_id: string;
 content: string;
 chunk_index: number;
 page_number: number | null;
 paragraph_index: number | null;
 document_id: string;
 file_name: string;
 file_path: string;
 source_title: string | null;
 source_author: string | null;
 source_url: string | null;
 similarity: number;
}

// =============================================
// 混合搜索结果
// =============================================
export interface HybridSearchResult {
 chunk_id: string;
 content: string;
 chunk_index: number;
 page_number: number | null;
 document_id: string;
 file_name: string;
 source_title: string | null;
 vector_score: number;
 keyword_score: number;
 combined_score: number;
}

// =============================================
// 向量块插入（批量）
// =============================================
export interface ChunkInsert {
 document_id: string;
 content: string;
 chunk_index: number;
 page_number?: number | null;
 paragraph_index?: number | null;
 char_start?: number | null;
 char_end?: number | null;
 embedding: number[];
 metadata?: Record<string, any>;
}

// =============================================
// 文档插入
// =============================================
export interface DocumentInsert {
 user_id: string;
 file_name: string;
 file_path: string;
 file_size?: number;
 mime_type?: string;
 source_type?: SourceType;
 source_url?: string;
 source_title?: string;
 source_author?: string;
 source_published_date?: string;
 status?: DocumentStatus;
 page_count?: number;
 metadata?: Record<string, any>;
}

// =============================================
// 消息插入
// =============================================
export interface MessageInsert {
 session_id: string;
 role: MessageRole;
 content: string;
 citations?: Citation[];
 metadata?: Record<string, any>;
}
