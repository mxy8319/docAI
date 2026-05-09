import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoginError } from "./LoginError";
import { signInWithGithub } from "./actions";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:flex md:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 via-primary-600/20 to-primary-800/30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="w-24 h-24 bg-on-primary/10 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-sm">
            <svg
              className="w-14 h-14 text-on-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-headline-xl text-on-primary text-center max-w-md">
            智能文档知识管家
          </h2>
          <p className="text-body-lg text-on-primary/70 text-center mt-4 max-w-md">
            让 AI 帮助您管理、分析和检索文档知识
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <div className="md:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
              <svg
                className="w-8 h-8 text-on-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-headline-lg text-on-surface">DocAI</h1>
          </div>

          <div className="hidden md:block mb-10">
            <h1 className="text-headline-lg text-on-surface">欢迎回来</h1>
            <p className="text-body-md text-on-surface-variant mt-2">
              选择登录方式，开始管理您的文档
            </p>
          </div>

          <LoginError />

          <Card className="border-outline/20 shadow-sm">
            <CardContent className="pt-6 space-y-3">
              <form action={signInWithGithub}>
                <Button
                  variant="outline"
                  className="w-full h-14 gap-3 text-body-md border-outline/40 hover:bg-surface-container-low hover:border-outline transition-all duration-200"
                  type="submit"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  使用 GitHub 账号登录
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-label-sm text-on-surface-variant mt-6">
            登录即表示您同意我们的服务条款和隐私政策
          </p>
        </div>
      </div>
    </div>
  );
}
