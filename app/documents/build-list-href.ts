export function buildListHref(
  q: string | undefined,
  status: string | undefined,
  page: number
): string {
  const p = new URLSearchParams()
  if (page > 1) p.set("page", String(page))
  if (q) p.set("q", q)
  if (status) p.set("status", status)
  const s = p.toString()
  return s ? `/documents?${s}` : "/documents"
}
