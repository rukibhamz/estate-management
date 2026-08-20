import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("Password123!", 12);
  const roles = [
    ["owner@estateflow.dev", "Ada Owner", "OWNER_ADMIN"],
    ["pm@estateflow.dev", "Bola PM", "PROJECT_MANAGER"],
    ["im@estateflow.dev", "Chidi Inventory", "INVENTORY_MANAGER"],
    ["site@estateflow.dev", "Dami Site", "SITE_MANAGER"],
    ["view@estateflow.dev", "Efe Viewer", "VIEWER"],
  ] as const;

  const users = [];
  for (const [email, name] of roles) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name, passwordHash },
    });
    users.push(user);
  }

  const admin = await prisma.user.upsert({
    where: { email: "admin@estateflow.dev" },
    update: { isPlatformAdmin: true },
    create: {
      email: "admin@estateflow.dev",
      name: "Platform Admin",
      passwordHash,
      isPlatformAdmin: true,
    },
  });

  const [owner, pm, im, site, viewer] = users;

  const project = await prisma.project.upsert({
    where: { id: "seed-project-1" },
    update: {},
    create: {
      id: "seed-project-1",
      ownerId: owner.id,
      name: "Lekki Waterside",
      location: "Lekki, Lagos",
      description: "Seeded demonstration estate for local development.",
    },
  });

  for (const [index, role] of roles.map((r) => r[2]).entries()) {
    const existing = await prisma.projectMembership.findFirst({
      where: { projectId: project.id, userId: users[index].id },
    });
    if (!existing) {
      await prisma.projectMembership.create({
        data: { projectId: project.id, userId: users[index].id, role, status: "ACTIVE" },
      });
    }
  }

  const estate = await prisma.estate.upsert({
    where: { id: "seed-estate-1" },
    update: {},
    create: {
      id: "seed-estate-1",
      projectId: project.id,
      name: "Phase 1 Waterfront",
      location: "Lekki",
    },
  });

  const land = await prisma.land.upsert({
    where: { id: "seed-land-1" },
    update: {},
    create: {
      id: "seed-land-1",
      projectId: project.id,
      estateId: estate.id,
      location: "Plot A",
      size: "2400.00",
      status: "UNDER_DEVELOPMENT",
    },
  });

  const development = await prisma.development.upsert({
    where: { id: "seed-dev-1" },
    update: {},
    create: {
      id: "seed-dev-1",
      projectId: project.id,
      estateId: estate.id,
      name: "Terrace Block A",
      plannedUnitCount: 12,
      approvedBudget: "80000000.00",
      status: "IN_PROGRESS",
      progressPct: 33,
    },
  });

  await prisma.developmentLand.upsert({
    where: { developmentId_landId: { developmentId: development.id, landId: land.id } },
    update: {},
    create: { developmentId: development.id, landId: land.id, projectId: project.id },
  });

  const phaseSpecs = [
    { id: "seed-phase-1", name: "Foundations", weight: 1, progressPct: 100 },
    { id: "seed-phase-2", name: "Structure", weight: 2, progressPct: 50 },
    { id: "seed-phase-3", name: "Finishes", weight: 3, progressPct: 0 },
  ];
  for (const spec of phaseSpecs) {
    await prisma.phase.upsert({
      where: { id: spec.id },
      update: {},
      create: {
        ...spec,
        projectId: project.id,
        developmentId: development.id,
        budget: "20000000.00",
      },
    });
  }

  await prisma.milestone.upsert({
    where: { id: "seed-ms-overdue" },
    update: {},
    create: {
      id: "seed-ms-overdue",
      projectId: project.id,
      phaseId: "seed-phase-3",
      description: "Roofing complete",
      status: "PENDING",
      targetDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  const unit = await prisma.unit.upsert({
    where: { projectId_unitRef: { projectId: project.id, unitRef: "LWA-001" } },
    update: {},
    create: {
      projectId: project.id,
      estateId: estate.id,
      developmentId: development.id,
      landId: land.id,
      unitRef: "LWA-001",
      type: "3-bed terrace",
      status: "AVAILABLE",
    },
  });

  const buyer = await prisma.buyerContact.upsert({
    where: { id: "seed-buyer-1" },
    update: {},
    create: {
      id: "seed-buyer-1",
      projectId: project.id,
      name: "Ngozi Okonkwo",
      phone: "+2348000000000",
      email: "ngozi@example.com",
    },
  });

  await prisma.saleAllocation.upsert({
    where: { id: "seed-sale-1" },
    update: {},
    create: {
      id: "seed-sale-1",
      projectId: project.id,
      assetType: "UNIT",
      unitId: unit.id,
      buyerId: buyer.id,
      agreedValue: "45000000.00",
      totalPaid: "15000000.00",
      paymentStatus: "PART_PAYMENT",
      commercialStatus: "ALLOCATED",
    },
  });

  const payDays = [1, 2, 3, 4];
  for (const [index, weekday] of payDays.entries()) {
    const date = new Date();
    const current = date.getDay() || 7;
    date.setDate(date.getDate() - (current - weekday));
    date.setHours(10 + index, 15, 0, 0);
    await prisma.paymentRecord.upsert({
      where: { id: `seed-pay-${index + 1}` },
      update: { amount: String(3_000_000 * (index + 1)), paymentDate: date },
      create: {
        id: `seed-pay-${index + 1}`,
        projectId: project.id,
        saleId: "seed-sale-1",
        amount: String(3_000_000 * (index + 1)),
        paymentDate: date,
        method: "transfer",
        recordedBy: owner.id,
        editableUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  }

  await prisma.spendRecord.upsert({
    where: { id: "seed-spend-1" },
    update: {},
    create: {
      id: "seed-spend-1",
      projectId: project.id,
      developmentId: development.id,
      amount: "18000000.00",
      date: new Date(),
      category: "Construction",
      createdBy: owner.id,
    },
  });
  await prisma.spendRecord.upsert({
    where: { id: "seed-spend-2" },
    update: {},
    create: {
      id: "seed-spend-2",
      projectId: project.id,
      developmentId: development.id,
      amount: "4200000.00",
      date: new Date(),
      category: "Consultants",
      createdBy: owner.id,
    },
  });

  await prisma.systemBranding.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      appName: "EstateFlow",
      colorPrimary: "#1F6B4A",
      colorCanvas: "#F4EDE3",
      colorInk: "#1F1B16",
    },
  });

  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 14);

  for (const user of users) {
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        plan: user.id === owner.id ? "PROFESSIONAL" : "TRIAL",
        status: user.id === owner.id ? "ACTIVE" : "TRIALING",
        seats: user.id === owner.id ? 8 : 1,
        currentPeriodEnd: user.id === owner.id ? periodEnd : trialEnd,
      },
    });
  }
  await prisma.subscription.upsert({
    where: { userId: admin.id },
    update: { plan: "ENTERPRISE", status: "ACTIVE", seats: 50, currentPeriodEnd: periodEnd },
    create: {
      userId: admin.id,
      plan: "ENTERPRISE",
      status: "ACTIVE",
      seats: 50,
      currentPeriodEnd: periodEnd,
    },
  });

  console.log("Seed complete.");
  console.log("Project owner: owner@estateflow.dev / Password123!");
  console.log("Platform admin: admin@estateflow.dev / Password123!");
  console.log({ owner: owner.email, pm: pm.email, im: im.email, site: site.email, viewer: viewer.email, admin: admin.email });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
