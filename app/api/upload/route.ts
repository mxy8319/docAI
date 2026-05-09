import { auth } from "@/auth";
import { createDocument, updateDocumentStatus } from "@/lib/db";
import { createDocumentFilePath, uploadFile } from "@/lib/storage";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const PDF_MIME_TYPES = new Set(["application/pdf", "application/x-pdf"]);

function isPdf(file: File): boolean {
  const hasPdfName = file.name.toLowerCase().endsWith(".pdf");
  const hasPdfType = !file.type || PDF_MIME_TYPES.has(file.type);

  return hasPdfName && hasPdfType;
}

function errorResponse(message: string, status: number) {
  return Response.json({ success: false, error: message }, { status });
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Upload failed";
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return errorResponse("No file provided", 400);
    }

    if (!isPdf(file)) {
      return errorResponse("Only PDF files are allowed", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse("File too large (max 50MB)", 400);
    }

    const filePath = createDocumentFilePath(session.user.id, file.name);

    const document = await createDocument({
      user_id: session.user.id,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type || "application/pdf",
      status: "uploading",
      metadata: {
        storage_path: filePath,
        uploaded_at: new Date().toISOString(),
      },
    });

    try {
      const buffer = await file.arrayBuffer();

      await uploadFile(session.user.id, file.name, buffer, {
        filePath,
        contentType: file.type || "application/pdf",
      });

      await updateDocumentStatus(document.id, "processing");
    } catch (uploadError) {
      try {
        await updateDocumentStatus(document.id, "failed", getErrorMessage(uploadError));
      } catch (statusError) {
        console.error("Failed to mark document upload as failed:", statusError);
      }

      throw uploadError;
    }

    return Response.json({
      success: true,
      document: {
        id: document.id,
        name: document.file_name,
        status: "processing",
        filePath,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return errorResponse(getErrorMessage(error), 500);
  }
}
