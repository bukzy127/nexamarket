import { NextResponse } from "next/server";
import { listProjects, saveProject } from "@/lib/server/projectStore";
import type { Project } from "@/types";

export const runtime = "nodejs";

export async function GET() {
  const projects = await listProjects();
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const project = (await req.json()) as Project;

  if (!project.id || !project.fileUrl || !project.owner || !project.price) {
    return NextResponse.json(
      { error: "id, fileUrl, owner, and price are required" },
      { status: 400 },
    );
  }

  const saved = await saveProject(project);
  return NextResponse.json({ project: saved });
}
