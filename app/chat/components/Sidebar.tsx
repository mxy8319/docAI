"use client";

import { Upload } from "./Upload";
import { ThreadList } from "@/components/assistant-ui/thread-list";

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-72 border-r border-outline/20 bg-surface-container-lowest flex-col shrink-0">
      <div className="p-4 border-b border-outline/20">
        <Upload onUpload={() => {}} />
      </div>
      <div className="flex-1 overflow-y-auto">
        <ThreadList />
      </div>
    </aside>
  );
}