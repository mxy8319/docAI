"use client";

interface UploadProps {
  onUpload?: (files: FileList) => void;
}

export function Upload({ onUpload }: UploadProps) {
  const handleClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.txt,.md";
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0 && onUpload) {
        onUpload(files);
      }
    };
    input.click();
  };

  return (
    <div 
      onClick={handleClick}
      className="border-2 border-dashed border-outline/40 rounded-xl bg-surface-container-low p-6 text-center cursor-pointer hover:bg-surface-container hover:border-primary transition-all duration-200 group"
    >
      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <p className="text-label-md text-on-surface">拖拽或点击上传文档</p>
      <p className="text-label-sm text-on-surface-variant mt-1">PDF / TXT / MD，最大 50 页</p>
    </div>
  );
}
