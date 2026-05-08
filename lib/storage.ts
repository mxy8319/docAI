// lib/storage.ts
import { supabaseAdmin } from "./supabase-admin";
import type { Document } from "./database.types";

/**
 * 上传 PDF 到 Storage
 */
export async function uploadFile(
 userId: string,
 fileName: string,
 fileBuffer: ArrayBuffer
): Promise<{ filePath: string }> {
 const filePath = `${userId}/${crypto.randomUUID()}.pdf`;

 const { data, error } = await supabaseAdmin.storage
 .from("documents")
 .upload(filePath, fileBuffer, {
 contentType: "application/pdf",
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
 const { data, error } = await supabaseAdmin.storage
 .from("documents")
 .download(filePath);

 if (error || !data) {
 throw new Error(`文件下载失败: ${error?.message || "未知错误"}`);
 }

 return data;
}

/**
 * 获取文件公开 URL（用于预览）
 * 注意：私有文件需要通过服务端中转
 */
export async function getSignedUrl(
 filePath: string,
 expiresIn = 3600
): Promise<string> {
 const { data, error } = await supabaseAdmin.storage
 .from("documents")
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
 const { error } = await supabaseAdmin.storage
 .from("documents")
 .remove([filePath]);

 if (error) {
 throw new Error(`文件删除失败: ${error.message}`);
 }
}

/**
 * 检查文件是否存在
 */
export async function fileExists(filePath: string): Promise<boolean> {
 const { data, error } = await supabaseAdmin.storage
 .from("documents")
 .list(filePath.split("/")[0], {
 searchByExtension: ".pdf",
 });

 if (error) return false;
 return data?.some((f) => f.name === filePath.split("/").pop()) ?? false;
}
