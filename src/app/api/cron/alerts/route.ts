import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateAlerts } from "@/server/alerts";

export async function GET() {
  const projects = await prisma.project.findMany({ where: { status: "ACTIVE" }, select: { id: true } });
  for (const project of projects) {
    await evaluateAlerts(project.id);
  }
  return NextResponse.json({ ok: true, projects: projects.length });
}
