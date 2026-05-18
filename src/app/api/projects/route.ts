import { NextResponse } from "next/server";
import { listProjects, publicProject, saveProject } from "@/lib/server/projectStore";
import type { Project } from "@/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const projects = await listProjects();
    return NextResponse.json({ projects: projects.map(publicProject) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to load projects" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      project?: Project;
    };
    const project = body.project;

    if (!project?.id || !project.fileUrl || !project.owner || !project.price) {
      return NextResponse.json(
        { error: "id, fileUrl, owner, and price are required" },
        { status: 400 },
      );
    }

    const saved = await saveProject(project);
    return NextResponse.json({ project: publicProject(saved) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to save project metadata" },
      { status: 500 },
    );
  }
}
