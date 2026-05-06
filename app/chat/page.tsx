"use client";

import { useState } from "react";
import { Header } from "./components/Header";
import { Upload } from "./components/Upload";
import { HistoryList } from "./components/HistoryList";
import { Chat } from "./components/Chat";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: {
    document: string;
    page: number;
    text: string;
  }[];
}

interface Document {
  id: string;
  name: string;
  pages: number;
  status: "pending" | "parsing" | "done" | "error";
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "你好！我是 DocAI 助手。请上传文档后开始提问吧！",
    },
  ]);

  const [documents] = useState<Document[]>([
    {
      id: "1",
      name: "产品需求文档.pdf",
      pages: 15,
      status: "done",
    },
    {
      id: "2",
      name: "技术方案说明.md",
      pages: 8,
      status: "parsing",
    },
  ]);

  const [selectedDocId, setSelectedDocId] = useState<string>("1");

  const user = {
    name: "User",
    image: null,
  };

  const handleSend = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "这个文档的核心功能是提供一个基于 RAG 技术的智能文档问答系统。主要包括：文档上传、智能解析、向量化存储、语义检索和 AI 问答等功能模块。",
      citations: [
        {
          document: "产品需求文档.pdf",
          page: 5,
          text: "核心功能模块包括文档上传、智能解析、向量化存储、语义检索、AI 问答等...",
        },
      ],
    };

    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleUpload = (files: FileList) => {
    console.log("上传文件:", files);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header user={user} />

      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden md:flex md:w-72 border-r border-outline/20 bg-surface-container-lowest flex-col shrink-0">
          <div className="p-4 border-b border-outline/20">
            <Upload onUpload={handleUpload} />
          </div>

          <HistoryList 
            documents={documents} 
            selectedId={selectedDocId}
            onSelect={setSelectedDocId}
          />
        </aside>

        <Chat 
          messages={messages} 
          onSend={handleSend}
          userAvatar={user.image}
        />
      </div>
    </div>
  );
}
