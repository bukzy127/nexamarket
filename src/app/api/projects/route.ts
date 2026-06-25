import { NextResponse } from "next/server";
import { listProjects, publicProject, saveProject } from "@/lib/server/projectStore";
import type { Project } from "@/types";
import { recordActivity } from "@/lib/server/appStore";

export const runtime = "nodejs";

export async function GET() {
  try {
    const projects = await listProjects();
    return NextResponse.json({ projects: projects.map(publicProject) });
  } catch (err) {
    console.error("Unable to load projects:", err);
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

    if (
      !project?.id ||
      !project.fileUrl ||
      !project.cid ||
      !project.owner ||
      !project.price ||
      !project.previewImages?.length
    ) {
      return NextResponse.json(
        { error: "id, IPFS file metadata, owner, price, and preview images are required" },
        { status: 400 },
      );
    }

    const saved = await saveProject(project);
    await recordActivity({
      wallet: project.owner,
      type: "upload",
      projectId: project.id,
      projectTitle: project.title,
    }).catch(() => undefined);
    return NextResponse.json({ project: publicProject(saved) });
  } catch (err) {
    console.error("Unable to save project metadata:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to save project metadata" },
      { status: 500 },
    );
  }
}
