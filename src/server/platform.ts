import { prisma } from "@/lib/prisma";
import { ForbiddenError, NotFoundError, DomainError } from "@/core/errors";
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_STATUSES, type SubscriptionPlan, type SubscriptionStatus } from "@/core/billing";

export async function isPlatformAdmin(userId: string) {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPlatformAdmin: true },
  });
  return Boolean(row?.isPlatformAdmin);
}

export async function requirePlatformAdmin(userId: string) {
  if (!(await isPlatformAdmin(userId))) {
    throw new ForbiddenError("Only a platform super admin can do that.");
  }
}

export async function ensureTrialSubscription(userId: string) {
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  if (existing) return existing;
  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + 14);
  return prisma.subscription.create({
    data: {
      userId,
      plan: "TRIAL",
      status: "TRIALING",
      seats: 1,
      currentPeriodEnd: periodEnd,
    },
  });
}

export async function getPlatformOverview(actorId: string) {
  await requirePlatformAdmin(actorId);
  const [users, projects, activeSubs, trialSubs, canceled, latestUsers] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.count({ where: { status: "TRIALING" } }),
    prisma.subscription.count({ where: { status: "CANCELED" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { subscription: true, _count: { select: { memberships: true, ownedProjects: true } } },
    }),
  ]);
  return { users, projects, activeSubs, trialSubs, canceled, latestUsers };
}

export async function listPlatformUsers(actorId: string, query?: string) {
  await requirePlatformAdmin(actorId);
  const q = query?.trim();
  return prisma.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q } },
            { name: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      subscription: true,
      _count: { select: { memberships: true, ownedProjects: true } },
    },
  });
}

export async function listSubscriptions(actorId: string) {
  await requirePlatformAdmin(actorId);
  return prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
  });
}

export async function setPlatformAdmin(actorId: string, userId: string, next: boolean) {
  await requirePlatformAdmin(actorId);
  if (actorId === userId && !next) {
    throw new ForbiddenError("You cannot remove your own super admin access.");
  }
  if (!next) {
    const remaining = await prisma.user.count({
      where: { isPlatformAdmin: true, id: { not: userId } },
    });
    if (remaining < 1) {
      throw new ForbiddenError("At least one platform super admin must remain.");
    }
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError();
  return prisma.user.update({
    where: { id: userId },
    data: { isPlatformAdmin: next },
  });
}

export async function updateSubscription(
  actorId: string,
  userId: string,
  input: { plan: SubscriptionPlan; status: SubscriptionStatus; seats?: number; notes?: string },
) {
  await requirePlatformAdmin(actorId);
  if (!SUBSCRIPTION_PLANS.includes(input.plan)) throw new DomainError("Invalid plan", "BAD_PLAN");
  if (!SUBSCRIPTION_STATUSES.includes(input.status)) throw new DomainError("Invalid status", "BAD_STATUS");
  const seats = Math.max(1, input.seats ?? 1);
  await ensureTrialSubscription(userId);
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  return prisma.subscription.update({
    where: { userId },
    data: {
      plan: input.plan,
      status: input.status,
      seats,
      notes: input.notes?.trim() || null,
      currentPeriodEnd: input.status === "CANCELED" ? new Date() : periodEnd,
    },
  });
}
