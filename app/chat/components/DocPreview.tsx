interface DocPreviewProps {
  document?: string;
  page?: number;
  text?: string;
}

export default function DocPreview({ document, page, text }: DocPreviewProps) {
  return (
    <div className="bg-surface-container-low rounded-lg p-3 text-on-secondary-container text-body-md cursor-pointer hover:bg-surface-container transition-colors">
      <div className="flex items-center gap-2 text-label-md mb-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>{document}</span>
        <span className="text-on-surface-variant">· 第 {page} 页</span>
      </div>
      <p className="text-body-md text-on-surface-variant opacity-80">
        {text}
      </p>
    </div>
  );
}
