"use client";

import { useState } from "react";

interface UploadProps {
  onUpload?: (files: File[]) => void;
}

const MAX_FILE_SIZE = 1 *1024 * 1024;

function isPdf(file: File) {
  return file.name.toLowerCase().endsWith(".pdf");
}

export function Upload({ onUpload }: UploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = async (selectedFiles: FileList | File[]) => {
    const files = Array.from(selectedFiles);
    if (files.length === 0) return;

    if (isUploading) return;

    setIsUploading(true);

    const uploadedFiles: File[] = [];
    const failedFiles: string[] = [];

    try {
      for (const file of files) {
        if (!isPdf(file)) {
          failedFiles.push(`${file.name}: 仅支持 PDF 文件`);
          continue;
        }

        if (file.size > MAX_FILE_SIZE) {
          failedFiles.push(`${file.name}: 文件不能超过 1MB`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = errorText || "上传失败";

          try {
            const error = JSON.parse(errorText) as { error?: string };
            errorMessage = error.error || errorMessage;
          } catch {
            // API routes may return plain text during unexpected failures.
          }

          failedFiles.push(`${file.name}: ${errorMessage}`);
          continue;
        }

        uploadedFiles.push(file);
      }

      if (uploadedFiles.length > 0) {
        onUpload?.(uploadedFiles);
      }

      if (failedFiles.length > 0) {
        alert(failedFiles.join("\n"));
      }
    } catch (error) {
      console.error("上传错误:", error);
      alert("上传过程中出现错误");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = async () => {
    if (isUploading) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf";
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) await uploadFiles(files);
    };
    input.click();
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    await uploadFiles(event.dataTransfer.files);
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      className="border-2 border-dashed border-outline/40 rounded-xl bg-surface-container-low p-6 text-center cursor-pointer hover:bg-surface-container hover:border-primary transition-all duration-200 group"
    >
      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        {isUploading ? (
          <svg className="w-6 h-6 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        )}
      </div>
      <p className="text-label-md text-on-surface">
        {isUploading ? "上传中..." : "拖拽或点击上传文档"}
      </p>
      <p className="text-label-sm text-on-surface-variant mt-1">PDF，最大 1MB</p>
    </div>
  );
}
