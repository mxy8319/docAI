// lib/storage.ts
import { supabaseAdmin } from "./supabase-admin";

export const DOCUMENTS_BUCKET = "documents";

function sanitizeFileName(fileName: string): string {
  const baseName = fileName.replace(/\.pdf$/i, "").trim();
  const safeName = baseName
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return safeName || "document";
}

/**
 * 生成用户隔离的 Storage 路径
 */
export function createDocumentFilePath(userId: string, fileName: string): string {
  return `${userId}/${crypto.randomUUID()}-${sanitizeFileName(fileName)}.pdf`;
}

/**
 * 上传 PDF 到 Storage
 */
export async function uploadFile(
  userId: string,
  fileName: string,
  fileBuffer: ArrayBuffer,
  options: {
    filePath?: string;
    contentType?: string;
  } = {}
): Promise<{ filePath: string }> {
  const filePath = options.filePath || createDocumentFilePath(userId, fileName);

  const { error } = await supabaseAdmin.storage
    .from(DOCUMENTS_BUCKET)
    .upload(filePath, fileBuffer, {
      contentType: options.contentType || "application/pdf",
      upsert: false,
    });

  if (error) {
    throw new Error(`文件上传失败: ${error.message}`);
  }

  return { filePath };
}

/**
 * 下载 Storage 文件
 */
export async function downloadFile(filePath: string): Promise<Blob> {
  const { data, error } = await supabaseAdmin.storage.from(DOCUMENTS_BUCKET).download(filePath);

  if (error || !data) {
    throw new Error(`文件下载失败: ${error?.message || "未知错误"}`);
  }

  return data;
}

/**
 * 获取文件公开 URL（用于预览）
 * 注意：私有文件需要通过服务端中转
 */
export async function getSignedUrl(filePath: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(filePath, expiresIn);

  if (error || !data) {
    throw new Error(`生成访问链接失败: ${error?.message || "未知错误"}`);
  }

  return data.signedUrl;
}

/**
 * 删除 Storage 文件
 */
export async function deleteFile(filePath: string): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(DOCUMENTS_BUCKET).remove([filePath]);

  if (error) {
    throw new Error(`文件删除失败: ${error.message}`);
  }
}
