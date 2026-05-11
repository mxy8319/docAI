// lib/embeddings.ts
import { embedMany } from "ai";
import { createHash } from "node:crypto";

import {
  deleteDocumentChunks,
  insertChunksInBatches,
  updateDocument,
  updateDocumentProcessingState,
} from "./db";
import { downloadFile } from "./storage";
import type { ChunkInsert } from "./database.types";
import {
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL,
  openai,
  openaiConnectTimeoutMs,
} from "./openai-provider";

const CHUNK_STRATEGY = "page-paragraph-sentence-v1";
const PARSER_NAME = "pdf-parse";
const MAX_CHUNK_CHARS = 1800;
const CHUNK_OVERLAP_CHARS = 150;
const MIN_CHUNK_CHARS = 20;
const INSERT_BATCH_SIZE = 50;
/** 每批调用 embedding API 的文本条数（OpenAI 单请求上限 2048；拆小批减轻单次请求时间与网关超时风险） */
const EMBEDDING_API_BATCH_SIZE = 128;

interface ParsedPage {
  pageNumber: number;
  text: string;
  charStart: number;
}

interface TextChunk {
  content: string;
  chunkIndex: number;
  pageNumber: number;
  paragraphIndex: number;
  charStart: number;
  charEnd: number;
}

function normalizeText(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function countApproxTokens(text: string): number {
  // A lightweight estimate good enough for progress/debug metadata.
  return Math.ceil(text.length / 4);
}

function splitLongText(text: string, maxChars = MAX_CHUNK_CHARS): string[] {
  if (text.length <= maxChars) return [text];

  const sentences = text
    .split(/(?<=[。！？.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length <= 1) {
    const chunks: string[] = [];

    for (let start = 0; start < text.length; start += maxChars - CHUNK_OVERLAP_CHARS) {
      chunks.push(text.slice(start, start + maxChars).trim());
    }

    return chunks.filter(Boolean);
  }

  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}` : sentence;

    if (next.length <= maxChars) {
      current = next;
      continue;
    }

    if (current) chunks.push(current);
    current = sentence;
  }

  if (current) chunks.push(current);

  return chunks;
}

function chunkParsedPages(pages: ParsedPage[]): TextChunk[] {
  const chunks: TextChunk[] = [];
  let chunkIndex = 0;

  for (const page of pages) {
    const paragraphs = page.text
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length >= MIN_CHUNK_CHARS);

    let searchFrom = 0;

    paragraphs.forEach((paragraph, paragraphIndex) => {
      const paragraphStart = page.text.indexOf(paragraph, searchFrom);
      const safeParagraphStart = paragraphStart >= 0 ? paragraphStart : searchFrom;
      searchFrom = safeParagraphStart + paragraph.length;

      let localSearchFrom = safeParagraphStart;

      for (const part of splitLongText(paragraph)) {
        if (part.length < MIN_CHUNK_CHARS) continue;

        const localStart = page.text.indexOf(part, localSearchFrom);
        const safeLocalStart = localStart >= 0 ? localStart : localSearchFrom;
        const charStart = page.charStart + safeLocalStart;
        const charEnd = charStart + part.length;

        chunks.push({
          content: part,
          chunkIndex,
          pageNumber: page.pageNumber,
          paragraphIndex,
          charStart,
          charEnd,
        });

        chunkIndex += 1;
        localSearchFrom = Math.max(
          safeLocalStart + part.length - CHUNK_OVERLAP_CHARS,
          safeLocalStart
        );
      }
    });
  }

  return chunks;
}

async function parsePdf(buffer: Buffer): Promise<{
  pages: ParsedPage[];
  pageCount: number;
  title?: string;
  author?: string;
}> {
  const PDFParse = (await import("pdf-parse")).PDFParse;
  const parser = new PDFParse({ data: buffer });

  try {
    const info = await parser.getInfo({ parsePageInfo: true });
    const text = await parser.getText({
      pageJoiner: "",
      lineEnforce: true,
    });

    let cursor = 0;
    const pages = text.pages
      .map((page) => {
        const normalizedText = normalizeText(page.text);
        const parsedPage: ParsedPage = {
          pageNumber: page.num,
          text: normalizedText,
          charStart: cursor,
        };

        cursor += normalizedText.length + 1;
        return parsedPage;
      })
      .filter((page) => page.text.length > 0);

    return {
      pages,
      pageCount: info.total || text.total || pages.length,
      title: typeof info.info?.Title === "string" ? info.info.Title : undefined,
      author: typeof info.info?.Author === "string" ? info.info.Author : undefined,
    };
  } finally {
    await parser.destroy();
  }
}

async function embedChunks(chunks: TextChunk[]): Promise<number[][]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("缺少 OPENAI_API_KEY，无法生成 OpenAI Embedding");
  }

  const embeddings: number[][] = [];

  try {
    for (let offset = 0; offset < chunks.length; offset += EMBEDDING_API_BATCH_SIZE) {
      const slice = chunks.slice(offset, offset + EMBEDDING_API_BATCH_SIZE);
      const result = await embedMany({
        model: openai.embedding(EMBEDDING_MODEL),
        values: slice.map((chunk) => chunk.content),
        maxParallelCalls: 2,
        maxRetries: 2,
      });
      embeddings.push(...result.embeddings);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const baseUrl = process.env.OPENAI_BASE_URL?.trim();

    if (message.includes("ENOTFOUND") || message.includes("getaddrinfo")) {
      throw new Error(
        `无法解析 Embedding API 的主机名（DNS ENOTFOUND）。请检查 OPENAI_BASE_URL${
          baseUrl ? `（当前: ${baseUrl}）` : ""
        } 是否拼写正确、该域名是否仍提供解析；若应直连 OpenAI，可删除 OPENAI_BASE_URL 使用默认 https://api.openai.com/v1。详情: ${message}`
      );
    }

    if (
      message.includes("Connect Timeout") ||
      message.includes("Connect Timeout Error") ||
      message.includes("Cannot connect to API")
    ) {
      throw new Error(
        `OpenAI Embedding 建连超时（本进程 connect≈${openaiConnectTimeoutMs}ms）。请在 .env.local 中为 Node 配置代理，例如：HTTPS_PROXY=http://127.0.0.1:7890 或 OPENAI_HTTPS_PROXY=…（Clash HTTP 端口以本机为准），保存后重启 pnpm dev；也可提高 OPENAI_CONNECT_TIMEOUT_MS、设 OPENAI_PREFER_IPV4=1。详情: ${message}`
      );
    }

    throw new Error(`OpenAI Embedding 生成失败: ${message}`);
  }

  const invalidEmbedding = embeddings.find(
    (embedding) => embedding.length !== EMBEDDING_DIMENSIONS
  );

  if (invalidEmbedding) {
    throw new Error(
      `Embedding 维度不匹配：期望 ${EMBEDDING_DIMENSIONS}，实际 ${invalidEmbedding.length}`
    );
  }

  return embeddings;
}

/**
 * 处理单个文档：
 * 1. 从 Supabase Storage 下载 PDF
 * 2. 提取文本并绑定页码
 * 3. 分块并记录来源信息
 * 4. 使用 text-embedding-3-small 生成 1536 维向量
 * 5. 写入 document_chunks.embedding(pgvector)
 */
export async function processDocument(documentId: string, filePath: string): Promise<void> {
  try {
    await updateDocumentProcessingState(documentId, {
      status: "processing",
      current_step: "downloading",
      progress: 10,
      error_message: null,
      parser_name: PARSER_NAME,
      chunk_strategy: CHUNK_STRATEGY,
      embedding_model: EMBEDDING_MODEL,
      embedding_dimensions: EMBEDDING_DIMENSIONS,
    });

    const file = await downloadFile(filePath);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const checksum = createHash("sha256").update(buffer).digest("hex");

    await updateDocumentProcessingState(documentId, {
      current_step: "parsing",
      progress: 25,
      checksum_sha256: checksum,
    });

    const parsed = await parsePdf(buffer);
    const chunks = chunkParsedPages(parsed.pages);

    if (chunks.length === 0) {
      throw new Error("PDF 未解析出可用于向量化的文本内容");
    }

    await updateDocumentProcessingState(documentId, {
      current_step: "embedding",
      progress: 55,
      page_count: parsed.pageCount,
      chunk_count: chunks.length,
      source_title: parsed.title,
      source_author: parsed.author,
    });

    const embeddings = await embedChunks(chunks);

    await updateDocumentProcessingState(documentId, {
      current_step: "writing_chunks",
      progress: 80,
    });

    await deleteDocumentChunks(documentId);

    const rows: ChunkInsert[] = chunks.map((chunk, index) => ({
      document_id: documentId,
      content: chunk.content,
      chunk_index: chunk.chunkIndex,
      token_count: countApproxTokens(chunk.content),
      page_number: chunk.pageNumber,
      page_start: chunk.pageNumber,
      page_end: chunk.pageNumber,
      paragraph_index: chunk.paragraphIndex,
      char_start: chunk.charStart,
      char_end: chunk.charEnd,
      embedding: embeddings[index],
      embedding_model: EMBEDDING_MODEL,
      embedding_dimensions: EMBEDDING_DIMENSIONS,
      metadata: {
        chunk_strategy: CHUNK_STRATEGY,
      },
    }));

    await insertChunksInBatches(rows, INSERT_BATCH_SIZE);

    await updateDocument(documentId, {
      source_title: parsed.title,
      source_author: parsed.author,
      page_count: parsed.pageCount,
      chunk_count: rows.length,
      current_step: "ready",
      progress: 100,
      status: "ready",
      error_message: null,
      checksum_sha256: checksum,
      parser_name: PARSER_NAME,
      chunk_strategy: CHUNK_STRATEGY,
      embedding_model: EMBEDDING_MODEL,
      embedding_dimensions: EMBEDDING_DIMENSIONS,
      metadata: {
        processed_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "文档处理失败";

    await updateDocumentProcessingState(documentId, {
      status: "failed",
      current_step: "failed",
      error_message: message,
    });

    throw error;
  }
}
