"use client"

import { useRouter } from "next/navigation"
import { Upload } from "@/app/documents/components/Upload"

export function LibraryUpload() {
  const router = useRouter()
  return <Upload onUpload={() => router.refresh()} />
}
