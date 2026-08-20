"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/guard";
import { DomainError } from "@/core/errors";
import * as projects from "@/server/projects";
import * as assets from "@/server/assets";
import * as developments from "@/server/developments";
import * as sales from "@/server/sales";
import { evaluateAlerts } from "@/server/alerts";
import { uploadDocument } from "@/server/documents";
import { updateSystemBranding } from "@/server/branding";
import * as platform from "@/server/platform";
import type { CommercialStatus, LinkedType, ProjectRole, UnitStatus } from "@prisma/client";
import type { SubscriptionPlan, SubscriptionStatus } from "@/core/billing";

function formString(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function formOpt(form: FormData, key: string) {
  const value = formString(form, key);
  return value ? value : undefined;
}

async function run(fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
  } catch (error) {
    if (error instanceof DomainError) throw new Error(error.message);
    throw error;
  }
}

export async function actionRegister(form: FormData): Promise<void> {
  await run(() =>
    projects.registerUser({
      name: formString(form, "name"),
      email: formString(form, "email"),
      password: formString(form, "password"),
    }),
  );
  redirect("/login");
}

export async function actionRequestReset(form: FormData): Promise<void> {
  await projects.requestPasswordReset(formString(form, "email"));
}

export async function actionResetPassword(form: FormData): Promise<void> {
  await run(() => projects.resetPassword(formString(form, "token"), formString(form, "password")));
  redirect("/login");
}

export async function actionCreateProject(form: FormData): Promise<void> {
  const user = await requireUser();
  const project = await projects.createProject(user.id, {
    name: formString(form, "name"),
    description: formOpt(form, "description"),
    location: formOpt(form, "location"),
  });
  redirect(`/projects/${project.id}`);
}

export async function actionArchiveProject(projectId: string) {
  const user = await requireUser();
  await projects.archiveProject(user.id, projectId);
  revalidatePath("/projects");
}

export async function actionInvite(projectId: string, form: FormData): Promise<void> {
  const user = await requireUser();
  await run(() =>
    projects.inviteMember(user.id, projectId, {
      email: formString(form, "email"),
      role: formString(form, "role") as ProjectRole,
    }),
  );
  revalidatePath(`/projects/${projectId}/team`);
}

export async function actionChangeRole(projectId: string, membershipId: string, form: FormData): Promise<void> {
  const user = await requireUser();
  await run(() =>
    projects.changeMemberRole(user.id, projectId, membershipId, formString(form, "role") as ProjectRole),
  );
  revalidatePath(`/projects/${projectId}/team`);
}

export async function actionRemoveMember(projectId: string, membershipId: string): Promise<void> {
  const user = await requireUser();
  await run(() => projects.removeMember(user.id, projectId, membershipId));
  revalidatePath(`/projects/${projectId}/team`);
}

export async function actionTransfer(projectId: string, form: FormData): Promise<void> {
  const user = await requireUser();
  await run(() => projects.transferOwnership(user.id, projectId, formString(form, "userId")));
  revalidatePath(`/projects/${projectId}/team`);
}

export async function actionCreateEstate(projectId: string, form: FormData) {
  const user = await requireUser();
  await assets.createEstate(user.id, projectId, {
    name: formString(form, "name"),
    location: formOpt(form, "location"),
    description: formOpt(form, "description"),
  });
  revalidatePath(`/projects/${projectId}/inventory`);
}

export async function actionCreateLand(projectId: string, form: FormData) {
  const user = await requireUser();
  await assets.createLand(user.id, projectId, {
    estateId: formOpt(form, "estateId"),
    location: formOpt(form, "location"),
    size: formOpt(form, "size"),
    titleStatus: formOpt(form, "titleStatus"),
    notes: formOpt(form, "notes"),
  });
  revalidatePath(`/projects/${projectId}/inventory`);
}

export async function actionCreateUnit(projectId: string, form: FormData) {
  const user = await requireUser();
  await assets.createUnit(user.id, projectId, {
    unitRef: formString(form, "unitRef"),
    type: formOpt(form, "type"),
    size: formOpt(form, "size"),
    estateId: formOpt(form, "estateId"),
    buildingId: formOpt(form, "buildingId"),
  });
  revalidatePath(`/projects/${projectId}/inventory`);
}

export async function actionUnitStatus(projectId: string, unitId: string, form: FormData) {
  const user = await requireUser();
  await assets.changeUnitStatus(user.id, projectId, unitId, formString(form, "status") as UnitStatus);
  revalidatePath(`/projects/${projectId}/inventory`);
}

export async function actionCreateDevelopment(projectId: string, form: FormData) {
  const user = await requireUser();
  const landIds = form.getAll("landIds").map(String).filter(Boolean);
  await developments.createDevelopment(user.id, projectId, {
    name: formString(form, "name"),
    estateId: formOpt(form, "estateId"),
    description: formOpt(form, "description"),
    plannedUnitCount: formOpt(form, "plannedUnitCount")
      ? Number(formOpt(form, "plannedUnitCount"))
      : undefined,
    approvedBudget: formOpt(form, "approvedBudget"),
    landIds,
  });
  revalidatePath(`/projects/${projectId}/developments`);
}

export async function actionAddPhase(projectId: string, developmentId: string, form: FormData) {
  const user = await requireUser();
  await developments.addPhase(user.id, projectId, developmentId, {
    name: formString(form, "name"),
    weight: formOpt(form, "weight") ? Number(formOpt(form, "weight")) : undefined,
    budget: formOpt(form, "budget"),
    targetDate: formOpt(form, "targetDate"),
  });
  revalidatePath(`/projects/${projectId}/developments`);
}

export async function actionPhaseProgress(projectId: string, phaseId: string, form: FormData) {
  const user = await requireUser();
  await developments.updatePhaseProgress(user.id, projectId, phaseId, Number(formString(form, "progressPct")));
  revalidatePath(`/projects/${projectId}/developments`);
}

export async function actionAddSpend(projectId: string, form: FormData) {
  const user = await requireUser();
  await developments.addSpend(user.id, projectId, {
    developmentId: formString(form, "developmentId"),
    phaseId: formOpt(form, "phaseId"),
    amount: formString(form, "amount"),
    date: formString(form, "date"),
    category: formOpt(form, "category"),
  });
  revalidatePath(`/projects/${projectId}/developments`);
}

export async function actionPropose(projectId: string, developmentId: string) {
  const user = await requireUser();
  await developments.proposeCompletion(user.id, projectId, developmentId);
  revalidatePath(`/projects/${projectId}/developments`);
}

export async function actionApprove(projectId: string, developmentId: string) {
  const user = await requireUser();
  await developments.approveCompletion(user.id, projectId, developmentId);
  revalidatePath(`/projects/${projectId}/developments`);
  revalidatePath(`/projects/${projectId}/inventory`);
}

export async function actionCreateBuyer(projectId: string, form: FormData) {
  const user = await requireUser();
  await sales.createBuyer(user.id, projectId, {
    name: formString(form, "name"),
    phone: formOpt(form, "phone"),
    email: formOpt(form, "email"),
  });
  revalidatePath(`/projects/${projectId}/sales`);
}

export async function actionCreateSale(projectId: string, form: FormData) {
  const user = await requireUser();
  await sales.createSale(user.id, projectId, {
    unitId: formOpt(form, "unitId"),
    landId: formOpt(form, "landId"),
    buyerId: formOpt(form, "buyerId"),
    agreedValue: formString(form, "agreedValue"),
    applyInventory: formString(form, "applyInventory") !== "no",
  });
  revalidatePath(`/projects/${projectId}/sales`);
}

export async function actionTransitionSale(projectId: string, saleId: string, form: FormData) {
  const user = await requireUser();
  await sales.transitionSale(
    user.id,
    projectId,
    saleId,
    formString(form, "status") as CommercialStatus,
    formOpt(form, "reason"),
  );
  revalidatePath(`/projects/${projectId}/sales`);
}

export async function actionRecordPayment(projectId: string, form: FormData): Promise<void> {
  const user = await requireUser();
  await run(() =>
    sales.recordPayment(user.id, projectId, {
      saleId: formString(form, "saleId"),
      amount: formString(form, "amount"),
      paymentDate: formString(form, "paymentDate"),
      method: formOpt(form, "method"),
      reference: formOpt(form, "reference"),
      note: formOpt(form, "note"),
    }),
  );
  revalidatePath(`/projects/${projectId}/sales`);
}

export async function actionRunAlerts(projectId: string) {
  await requireUser();
  await evaluateAlerts(projectId);
  revalidatePath(`/projects/${projectId}/alerts`);
}

export async function actionUploadDocument(projectId: string, form: FormData): Promise<void> {
  const user = await requireUser();
  const file = form.get("file") as File | null;
  if (!file) throw new Error("File required");
  const bytes = Buffer.from(await file.arrayBuffer());
  await uploadDocument(user.id, projectId, {
    linkedType: formString(form, "linkedType") as LinkedType,
    linkedId: formString(form, "linkedId"),
    description: formOpt(form, "description"),
    fileName: file.name,
    bytes,
  });
  revalidatePath(`/projects/${projectId}/documents`);
}

export async function actionUpdateProfile(form: FormData): Promise<void> {
  const user = await requireUser();
  await run(() =>
    projects.updateProfile(user.id, {
      name: formString(form, "name"),
      password: formOpt(form, "password"),
      currentPassword: formOpt(form, "currentPassword"),
    }),
  );
}

async function formImage(form: FormData, key: string) {
  const file = form.get(key);
  if (!(file instanceof File) || file.size === 0) return undefined;
  return {
    bytes: Buffer.from(await file.arrayBuffer()),
    mime: file.type,
    name: file.name,
  };
}

export async function actionUpdateBranding(form: FormData): Promise<void> {
  const user = await requireUser();
  const logo = await formImage(form, "logo");
  const favicon = await formImage(form, "favicon");
  await run(() =>
    updateSystemBranding(user.id, {
      appName: formString(form, "appName"),
      colorPrimary: formString(form, "colorPrimary"),
      colorCanvas: formString(form, "colorCanvas"),
      colorInk: formString(form, "colorInk"),
      removeLogo: form.get("removeLogo") === "1",
      removeFavicon: form.get("removeFavicon") === "1",
      logo,
      favicon,
    }),
  );
  revalidatePath("/", "layout");
  revalidatePath("/admin/branding");
  revalidatePath("/settings/branding");
}

export async function actionSetPlatformAdmin(userId: string, form: FormData): Promise<void> {
  const user = await requireUser();
  await run(() => platform.setPlatformAdmin(user.id, userId, formString(form, "next") === "1"));
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function actionUpdateSubscription(userId: string, form: FormData): Promise<void> {
  const user = await requireUser();
  await run(() =>
    platform.updateSubscription(user.id, userId, {
      plan: formString(form, "plan") as SubscriptionPlan,
      status: formString(form, "status") as SubscriptionStatus,
      seats: Number(formOpt(form, "seats") ?? "1"),
      notes: formOpt(form, "notes"),
    }),
  );
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}
