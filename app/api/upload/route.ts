import { createDocument, updateDocumentStatus } from "@/lib/db"
import { processDocument } from "@/lib/embeddings"
import { createDocumentFilePath, uploadFile } from "@/lib/storage"
import { createClient } from "@/lib/supabase-server"

export const runtime = "nodejs"
export const maxDuration = 60

const MAX_FILE_SIZE = 1 * 1024 * 1024
const PDF_MIME_TYPES = new Set(["application/pdf", "application/x-pdf"])

function isPdf(file: File): boolean {
  const hasPdfName = file.name.toLowerCase().endsWith(".pdf")
  const hasPdfType = !file.type || PDF_MIME_TYPES.has(file.type)

  return hasPdfName && hasPdfType
}

function errorResponse(message: string, status: number) {
  return Response.json({ success: false, error: message }, { status })
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Upload failed"
}

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return errorResponse("Unauthorized", 401)
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return errorResponse("No file provided", 400)
    }

    if (!isPdf(file)) {
      return errorResponse("Only PDF files are allowed", 400)
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse("File too large (max 1MB)", 400)
    }

    const filePath = createDocumentFilePath(user.id, file.name)

    const document = await createDocument({
      user_id: user.id,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type || "application/pdf",
      status: "uploading",
      metadata: {
        storage_path: filePath,
        uploaded_at: new Date().toISOString(),
      },
    })

    try {
      const buffer = await file.arrayBuffer()

      await uploadFile(user.id, file.name, buffer, {
        filePath,
        contentType: file.type || "application/pdf",
      })

      console.log("File uploaded successfully:", filePath)

      await updateDocumentStatus(document.id, "processing")

      console.log(" Start Processing document:", document.id)

      await processDocument(document.id, filePath)

      console.log("End Processing document:", document.id)
    } catch (uploadError) {
      try {
        await updateDocumentStatus(document.id, "failed", getErrorMessage(uploadError))
      } catch (statusError) {
        console.error("Failed to mark document upload as failed:", statusError)
      }

      throw uploadError
    }

    return Response.json({
      success: true,
      document: {
        id: document.id,
        name: document.file_name,
        status: "ready",
        filePath,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    return errorResponse(getErrorMessage(error), 500)
  }
}
