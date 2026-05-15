import { createRequire } from "module"
import path from "path"

const require = createRequire(import.meta.url)

/** 确保 webpack 能解析 Next 内置 loaders（pnpm 嵌套 node_modules 时偶发找不到）。 */
function patchResolveLoader(config) {
  try {
    const nextPkgDir = path.dirname(require.resolve("next/package.json"))
    const nextLoaders = path.join(nextPkgDir, "dist", "build", "webpack", "loaders")
    config.resolveLoader = config.resolveLoader ?? {}
    const existing = config.resolveLoader.modules
    const base = Array.isArray(existing)
      ? existing
      : existing != null
        ? [existing]
        : ["node_modules"]
    if (!base.includes(nextLoaders)) {
      config.resolveLoader.modules = [nextLoaders, ...base]
    }
  } catch {
    // 安装异常时交给 Next 默认行为
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdfjs-dist", "pdf-parse"],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false
    patchResolveLoader(config)
    return config
  },
}

export default nextConfig
