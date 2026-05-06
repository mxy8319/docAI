interface Document {
  id: string;
  name: string;
  pages: number;
  status: "pending" | "parsing" | "done" | "error";
}

interface HistoryListProps {
  documents: Document[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export function HistoryList({ documents, selectedId, onSelect }: HistoryListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="text-label-md text-on-surface-variant mb-3">我的文档</div>
      <div className="space-y-1">
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => onSelect?.(doc.id)}
            className={`
              p-3 rounded-xl cursor-pointer border-l-4 transition-all
              ${selectedId === doc.id 
                ? "bg-surface-container border-primary" 
                : "hover:bg-surface-container border-transparent"
              }
            `}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-label-md text-on-surface truncate">
                  {doc.name}
                </div>
                <div className="text-label-sm text-on-surface-variant mt-0.5 flex items-center gap-1">
                  <span>{doc.pages} 页</span>
                  <span>·</span>
                  <span className={
                    doc.status === "done" ? "text-primary" : 
                    doc.status === "parsing" ? "text-secondary" : 
                    doc.status === "error" ? "text-error" :
                    "text-on-surface-variant"
                  }>
                    {doc.status === "done" && "✅ 解析完成"}
                    {doc.status === "parsing" && "⚙️ 解析中..."}
                    {doc.status === "pending" && "⏳ 等待处理"}
                    {doc.status === "error" && "❌ 解析失败"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
