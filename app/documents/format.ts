export function formatFileSize(bytes: number | null): string {
  if (bytes == null || bytes <= 0) return "—"
  const units = ["B", "KB", "MB", "GB"]
  let v = bytes
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  const d = i === 0 ? 0 : i === 1 ? 0 : 1
  return `${v.toFixed(d)} ${units[i]}`
}

export function formatRelativeTime(iso: string): string {
  const t = new Date(iso).getTime()
  if (!Number.isFinite(t)) return ""
  const diffSec = Math.round((Date.now() - t) / 1000)
  const rtf = new Intl.RelativeTimeFormat("zh-CN", { numeric: "auto" })
  if (Math.abs(diffSec) < 60) return rtf.format(-diffSec, "second")
  const diffMin = Math.round(diffSec / 60)
  if (Math.abs(diffMin) < 60) return rtf.format(-diffMin, "minute")
  const diffHr = Math.round(diffMin / 60)
  if (Math.abs(diffHr) < 48) return rtf.format(-diffHr, "hour")
  const diffDay = Math.round(diffHr / 24)
  if (Math.abs(diffDay) < 30) return rtf.format(-diffDay, "day")
  return new Date(iso).toLocaleDateString("zh-CN")
}

export function formatDisplayDocId(id: string): string {
  const short = id.replace(/-/g, "").slice(0, 8).toUpperCase()
  return `DOC-${short}`
}
