// // lib/embeddings.ts
// import OpenAI from "openai";
// import pdfParse from "pdf-parse";
// import { supabaseAdmin } from "./supabase";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// // 文本分块
// function chunkText(text: string, maxChars = 500): string[] {
//  const chunks: string[] = [];
//  const sentences = text.split(/(?<=[。！？.!?\n])/);
//  let current = "";

//  for (const sentence of sentences) {
//  if ((current + sentence).length <= maxChars) {
//  current += sentence;
//  } else {
//  if (current.trim()) chunks.push(current.trim());
//  current = sentence;
//  }
//  }
//  if (current.trim()) chunks.push(current.trim());
//  return chunks;
// }

// // 处理单个文档
// export async function processDocument(
//  documentId: string,
//  filePath: string
// ): Promise<void> {
//  // 1. 下载 PDF
//  const { data: fileData } = await supabaseAdmin.storage
//  .from("documents")
//  .download(filePath);

//  if (!fileData) throw new Error("文件下载失败");

//  // 2. 提取文本
//  const buffer = await fileData.arrayBuffer();
//  const pdfData = await pdfParse(Buffer.from(buffer));
//  const text = pdfData.text;

//  // 3. 分块
//  const chunks = chunkText(text);

//  // 4. 批量生成向量
//  for (let i = 0; i < chunks.length; i++) {
//  const chunk = chunks[i];
//  if (chunk.length < 20) continue;

//  const embedding = await openai.embeddings.create({
//  model: "text-embedding-3-small",
//  input: chunk,
//  });

//  await supabaseAdmin.from("document_chunks").insert({
//  document_id: documentId,
//  content: chunk,
//  chunk_index: i,
//  embedding: embedding.data[0].embedding,
//  });
//  }

//  // 5. 更新文档状态
//  await supabaseAdmin
//  .from("documents")
//  .update({ status: "ready" })
//  .eq("id", documentId);
// }
