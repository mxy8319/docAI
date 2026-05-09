"use client";

import { useEffect, useState } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: "GitHub 登录启动失败，请稍后再试。",
  oauth_callback_failed: "登录回调处理失败，请重新登录。",
  unexpected_failure: "GitHub 用户资料获取失败，请检查 Supabase 的 GitHub Provider 配置。",
  server_error: "GitHub 登录服务暂时失败，请稍后再试。",
};

function readAuthError() {
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  return (
    hashParams.get("error_code") ||
    hashParams.get("error") ||
    searchParams.get("error_code") ||
    searchParams.get("error")
  );
}

function readErrorDescription() {
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  return hashParams.get("error_description") || searchParams.get("error_description");
}

export function LoginError() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const error = readAuthError();
    if (!error) return;

    setMessage(ERROR_MESSAGES[error] || readErrorDescription() || "登录失败，请重新尝试。");
  }, []);

  if (!message) return null;

  return (
    <div className="mb-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-label-md text-error">
      {message}
    </div>
  );
}
