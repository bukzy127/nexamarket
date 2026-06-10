import { NextRequest, NextResponse } from "next/server";

// In-memory store for QR codes (in production, use Supabase or Firebase)
// Structure: { projectId: { dataUrl, createdAt, projectTitle } }
const qrcodeStore = new Map<string, { dataUrl: string; createdAt: number; projectTitle: string }>();

/**
 * POST /api/qrcode
 * Generate and store a QR code for a project
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, projectTitle, dataUrl } = body;

    if (!projectId || !dataUrl || !projectTitle) {
      return NextResponse.json(
        { error: "Missing required fields: projectId, projectTitle, dataUrl" },
        { status: 400 }
      );
    }

    // Store QR code
    qrcodeStore.set(String(projectId), {
      dataUrl,
      createdAt: Date.now(),
      projectTitle,
    });

    return NextResponse.json({
      success: true,
      projectId,
      storedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("QR code storage error:", error);
    return NextResponse.json(
      { error: "Failed to store QR code" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/qrcode?projectId=123
 * Retrieve a QR code for a project
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing projectId parameter" },
        { status: 400 }
      );
    }

    const qrcodeData = qrcodeStore.get(projectId);

    if (!qrcodeData) {
      return NextResponse.json(
        { error: "QR code not found for this project" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      projectId,
      dataUrl: qrcodeData.dataUrl,
      projectTitle: qrcodeData.projectTitle,
      createdAt: new Date(qrcodeData.createdAt).toISOString(),
    });
  } catch (error) {
    console.error("QR code retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve QR code" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/qrcode?projectId=123
 * Delete a QR code for a project
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing projectId parameter" },
        { status: 400 }
      );
    }

    const deleted = qrcodeStore.delete(projectId);

    if (!deleted) {
      return NextResponse.json(
        { error: "QR code not found for this project" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      projectId,
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("QR code deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete QR code" },
      { status: 500 }
    );
  }
}
