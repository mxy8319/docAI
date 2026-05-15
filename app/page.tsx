import Link from "next/link"
import { Link2, ShieldCheck, TreePine, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#eef7f2] text-[#1b4332]">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#c8e6d9]/80 bg-white/80 px-6 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#1b4332] text-white shadow-sm">
            <TreePine className="size-5" aria-hidden />
          </div>
          <div className="text-left leading-tight">
            <span className="block text-label-md font-bold tracking-tight">DocAI</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5c7268]">
              智能文档
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-xl border border-[#c8e6d9] bg-white px-4 py-2 text-label-sm font-medium text-[#1b4332] transition-colors hover:bg-[#f4fbf7]"
          >
            登录
          </Link>
          <Link
            href="/login"
            className="rounded-xl bg-[#1b4332] px-4 py-2 text-label-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f2e22]"
          >
            开始使用
          </Link>
        </div>
      </header>

      <main
        className="flex flex-1 flex-col items-center px-6 py-14 sm:py-20"
        style={{
          backgroundColor: "#f1f6f3",
          backgroundImage: "radial-gradient(circle, #c5d9ce 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <div className="mb-8 flex size-20 items-center justify-center rounded-2xl bg-[#1b4332] text-white shadow-[0_12px_40px_rgba(27,67,50,0.25)]">
            <TreePine className="size-10" aria-hidden />
          </div>
          <h1 className="text-balance text-headline-lg font-bold tracking-tight text-[#1b4332] sm:text-[2.25rem] sm:leading-tight">
            让你的文档会说话
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-body-md leading-relaxed text-[#5c7268]">
            基于 RAG 的智能问答：上传 PDF，在对话里提问，回答附带可点击引用与原文预览。
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-[#1b4332] px-8 py-3 text-label-sm font-semibold text-white shadow-md transition-colors hover:bg-[#0f2e22]"
            >
              免费开始使用
            </Link>
            <Link
              href="/chat"
              className="rounded-xl border border-[#c8e6d9] bg-white/90 px-8 py-3 text-label-sm font-semibold text-[#1b4332] shadow-sm transition-colors hover:bg-white"
            >
              体验对话
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 grid w-full max-w-4xl grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            {
              icon: Zap,
              title: "秒级响应",
              desc: "流式输出，边生成边阅读",
            },
            {
              icon: Link2,
              title: "引用溯源",
              desc: "角标跳转出处与页码",
            },
            {
              icon: ShieldCheck,
              title: "有据可依",
              desc: "提示词约束，减少空编",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-[#c8e6d9] bg-white/90 p-6 text-center shadow-[0_8px_30px_rgba(27,67,50,0.06)]"
            >
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-[#e8f5ef] text-[#1b4332]">
                <Icon className="size-6" aria-hidden />
              </div>
              <h3 className="text-label-md font-semibold text-[#1b4332]">{title}</h3>
              <p className="mt-2 text-label-sm leading-relaxed text-[#5c7268]">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="flex h-14 shrink-0 items-center justify-center border-t border-[#c8e6d9]/80 bg-white/70 text-label-sm text-[#7a9084] backdrop-blur-sm">
        DocAI © 2026
      </footer>
    </div>
  )
}
