#!/usr/bin/env node
/**
 * 网络自检：与 lib/openai-provider.ts 使用相同的 undici Agent / ProxyAgent / 超时逻辑。
 *
 * 用法（项目根目录）：
 *   pnpm run check:openai
 *
 * 可先在 shell 里 export HTTPS_PROXY，或依赖自动读取 .env.local（不存在的键不会覆盖当前环境变量）。
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createOpenAI } from "@ai-sdk/openai";
import { embed } from "ai";
import { Agent, fetch as undiciFetch, ProxyAgent } from "undici";

function loadEnvLocal() {
  const p = join(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  const txt = readFileSync(p, "utf8");
  for (const line of txt.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i <= 0) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

function parseTimeoutMs(v, fallback) {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) && n >= 1000 ? n : fallback;
}

loadEnvLocal();

// --- 以下与 lib/openai-provider.ts 保持同一套参数（修改时请同步两处）---
const connectMs = parseTimeoutMs(process.env.OPENAI_CONNECT_TIMEOUT_MS, 60_000);
const bodyMs = parseTimeoutMs(process.env.OPENAI_BODY_TIMEOUT_MS, 180_000);
const preferIpv4 = process.env.OPENAI_PREFER_IPV4 === "1" || process.env.OPENAI_PREFER_IPV4 === "true";
const baseOpts = {
  connectTimeout: connectMs,
  headersTimeout: bodyMs,
  bodyTimeout: bodyMs,
  ...(preferIpv4 ? { connect: { family: 4 } } : {}),
};
const proxyUri =
  process.env.HTTPS_PROXY?.trim() ||
  process.env.HTTP_PROXY?.trim() ||
  process.env.OPENAI_HTTPS_PROXY?.trim() ||
  process.env.OPENAI_HTTP_PROXY?.trim();
const dispatcher = proxyUri
  ? new ProxyAgent({ uri: proxyUri, ...baseOpts })
  : new Agent(baseOpts);

function openaiFetch(input, init) {
  return undiciFetch(input, { ...init, dispatcher });
}

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
  fetch: openaiFetch,
});

const EMBEDDING_MODEL = "text-embedding-3-small";

console.log("baseURL:", process.env.OPENAI_BASE_URL || "(默认 https://api.openai.com/v1)");
console.log(
  "proxy:",
  proxyUri || "(无 — 在 .env.local 添加 HTTPS_PROXY 或 OPENAI_HTTPS_PROXY，如 http://127.0.0.1:7890)"
);
console.log("connectTimeout:", connectMs, "ms");

try {
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ 未设置 OPENAI_API_KEY（可在 .env.local 配置）");
    process.exit(1);
  }

  const result = await embed({
    model: openai.embedding(EMBEDDING_MODEL),
    value: "ping",
    maxRetries: 1,
  });

  console.log("✅ OpenAI Embedding API 可达，向量维度:", result.embedding.length);
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  console.error("❌ 连接/调用失败:", msg);
  if (e instanceof Error && e.cause) console.error("cause:", e.cause);
  process.exit(1);
}
