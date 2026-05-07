// // lib/search.ts
// import OpenAI from "openai";
// import { supabaseAdmin } from "./supabase";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// export interface SearchResult {
//  id: string;
//  documentId: string;
//  content: string;
//  chunkIndex: number;
//  metadata: Record<string, any>;
//  similarity: number;
// }

// export async function semanticSearch(
//  query: string,
//  userId: string,
//  topK = 5,
//  threshold = 0.7
// ): Promise<SearchResult[]> {
//  // 1. Query 转向量
//  const embedding = await openai.embeddings.create({
//  model: "text-embedding-3-small",
//  input: query,
//  });

//  // 2. pgvector 检索
//  const { data, error } = await supabaseAdmin.rpc("match_chunks", {
//  query_embedding: embedding.data[0].embedding,
//  match_threshold: threshold,
//  match_count: topK,
//  p_user_id: userId,
//  });

//  if (error) throw new Error(`检索失败: ${error.message}`);
//  return data || [];
// }
