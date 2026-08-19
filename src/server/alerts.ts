import { prisma } from "@/lib/prisma";
import { isMilestoneOverdue, isProgressStale, STALE_PROGRESS_DAYS } from "@/core/alerts";
import { computeBudgetVariance } from "@/core/development";

export async function evaluateAlerts(projectId: string) {
  const [milestones, developments] = await Promise.all([
    prisma.milestone.findMany({ where: { projectId } }),
    prisma.development.findMany({
      where: { projectId },
      include: {
        spendRecords: true,
        progressUpdates: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
  ]);

  const upserts: Array<{ type: "MILESTONE_OVERDUE" | "BUDGET_OVERRUN" | "STALE_PROGRESS"; recordType: string; recordId: string }> = [];

  for (const milestone of milestones) {
    if (isMilestoneOverdue(milestone)) {
      upserts.push({ type: "MILESTONE_OVERDUE", recordType: "Milestone", recordId: milestone.id });
    }
  }

  for (const development of developments) {
    const spend = development.spendRecords.reduce((s, r) => s + Number(r.amount.toString()), 0);
    const variance = computeBudgetVariance(development.approvedBudget?.toString() ?? null, spend);
    if (variance.isOverrun) {
      upserts.push({ type: "BUDGET_OVERRUN", recordType: "Development", recordId: development.id });
    }
    const last = development.progressUpdates[0]?.createdAt ?? development.createdAt;
    if (isProgressStale(last, new Date(), STALE_PROGRESS_DAYS)) {
      upserts.push({ type: "STALE_PROGRESS", recordType: "Development", recordId: development.id });
    }
  }

  for (const row of upserts) {
    await prisma.notification.upsert({
      where: {
        type_recordType_recordId: {
          type: row.type,
          recordType: row.recordType,
          recordId: row.recordId,
        },
      },
      update: { triggeredAt: new Date() },
      create: { projectId, ...row },
    });
  }

  return prisma.notification.findMany({
    where: { projectId },
    orderBy: { triggeredAt: "desc" },
  });
}
