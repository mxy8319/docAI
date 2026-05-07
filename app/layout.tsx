import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocAI - 智能文档知识库",
  description: "基于 AI 的文档问答助手，让你的文档会说话",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">{children}</body>
    </html>
  );
}
