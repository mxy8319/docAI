"use client";

import { useState } from "react";
import { Avatar } from "./Avatar";
import { DocPreview } from "./DocPreview";

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

interface ChatProps {
  messages: Message[];
  onSend?: (content: string) => void;
  userAvatar?: string | null;
}

export function Chat({ messages, onSend, userAvatar }: ChatProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSend?.(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-3 shrink-0">
                  <svg className="w-5 h-5 text-on-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              <div
                className={`max-w-2xl px-5 py-4 ${
                  message.role === "user"
                    ? "bg-tertiary text-on-tertiary rounded-2xl rounded-br-md"
                    : "bg-secondary-container text-on-secondary-container rounded-2xl rounded-bl-md"
                }`}
              >
                <p className="text-body-lg leading-relaxed">{message.content}</p>

                {message.citations && message.citations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-outline/20">
                    <div className="text-label-sm text-on-secondary-container/70 mb-2">引用来源</div>
                    <div className="space-y-2">
                      {message.citations.map((citation, index) => (
                        <DocPreview
                          key={index}
                          document={citation.document}
                          page={citation.page}
                          text={citation.text}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {message.role === "user" && (
                <div className="ml-3 shrink-0">
                  <Avatar src={userAvatar} size="md" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-outline/20 bg-surface-container-lowest p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-surface-container rounded-2xl flex items-end px-4 border border-outline/20 focus-within:border-primary transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入您的问题..."
              className="flex-1 bg-transparent py-4 outline-none text-body-md text-on-surface placeholder:text-on-surface-variant resize-none max-h-32 min-h-[56px]"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="mb-3 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary/90 transition-colors disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-center text-label-sm text-on-surface-variant mt-2">
            Enter 发送，Shift + Enter 换行
          </p>
        </div>
      </div>
    </div>
  );
}
