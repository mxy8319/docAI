"use client";

import { useState } from "react";

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
  const [input, setInput] = useState("");
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

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
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
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="h-16 border-b border-gray-200 bg-white flex items-center px-6 justify-between">
        <div className="font-semibold text-gray-800 text-lg">DocAI</div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm text-gray-600">U</span>
          </div>
          <span className="text-sm text-gray-600">退出</span>
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
              <div className="text-4xl mb-2">📤</div>
              <p className="text-gray-600 text-sm">拖拽或点击上传文档</p>
              <p className="text-gray-400 text-xs mt-1">PDF / TXT / MD，最大 50 页</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-sm font-medium text-gray-500 mb-3">我的文档</div>
            <div className="space-y-1">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-lg hover:bg-gray-100 cursor-pointer border-l-4 border-transparent"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">📄</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-700 truncate">
                        {doc.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {doc.pages} 页 ·{" "}
                        {doc.status === "done" && "✅ 解析完成"}
                        {doc.status === "parsing" && "⚙️ 解析中..."}
                        {doc.status === "pending" && "⏳ 等待处理"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-2xl px-5 py-4 ${
                      message.role === "user"
                        ? "bg-gray-800 text-white rounded-2xl rounded-br-md"
                        : "bg-white text-gray-700 rounded-2xl rounded-bl-md border border-gray-200"
                    }`}
                  >
                    <p className="leading-relaxed">{message.content}</p>

                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-xs font-medium text-gray-500 mb-2">引用来源</div>
                        {message.citations.map((citation, index) => (
                          <div
                            key={index}
                            className="bg-primary-50 border border-primary-200 rounded-lg p-3 text-primary-800 text-sm cursor-pointer hover:bg-primary-100 transition-colors"
                          >
                            📄 {citation.document} · 第 {citation.page} 页
                            <p className="text-xs mt-1 text-primary-700 opacity-80">
                              {citation.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 bg-white p-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-gray-50 rounded-xl flex items-end px-4">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入您的问题..."
                  className="flex-1 bg-transparent py-4 outline-none text-gray-700 resize-none max-h-32 min-h-[56px]"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="mb-3 w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  ➤
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">
                Enter 发送，Shift + Enter 换行
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
