import { NextResponse } from "next/server";
import { authSession, requireCapability } from "@/lib/guard";
import { listProjectAlerts } from "@/server/alerts";
import { DomainError } from "@/core/errors";

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const session = await authSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { projectId } = await context.params;
  try {
    await requireCapability(session.user.id, projectId, "project.read");
    const payload = await listProjectAlerts(projectId);
    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Unable to load alerts" }, { status: 500 });
  }
}
