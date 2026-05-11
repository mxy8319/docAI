import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-16 border-b border-gray-200 bg-white flex items-center px-6 justify-between">
        <div className="font-semibold text-gray-800 text-lg">DocAI</div>
        <Link
          href="/login"
          className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm hover:bg-gray-700 transition-colors"
        >
          开始使用
        </Link>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-6">�</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">让你的文档会说话</h1>
        <p className="text-xl text-gray-500 mb-8 max-w-xl">
          基于 RAG 技术的智能文档问答助手，上传文档即可与文档进行对话。
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
          >
            免费开始使用
          </Link>
          <Link
            href="/chat"
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-white transition-colors"
          >
            体验 Demo
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl">
          <div className="text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-700 mb-1">秒级响应</h3>
            <p className="text-sm text-gray-500">流式输出，打字机效果</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🔗</div>
            <h3 className="font-semibold text-gray-700 mb-1">引用溯源</h3>
            <p className="text-sm text-gray-500">每个答案都可溯源原文</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🛡️</div>
            <h3 className="font-semibold text-gray-700 mb-1">准确可靠</h3>
            <p className="text-sm text-gray-500">Prompt 约束减少幻觉</p>
          </div>
        </div>
      </div>

      <footer className="h-16 border-t border-gray-200 bg-white flex items-center justify-center">
        <p className="text-sm text-gray-400">DocAI © 2025</p>
      </footer>
    </div>
  )
}
