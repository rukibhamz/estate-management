import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { getSystemBranding } from "@/server/branding";

const SETTINGS_ID = "default";

export type EmailSettingsInput = {
  enabled: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  fromEmail?: string;
  fromName?: string;
};

export async function getEmailSettings() {
  const row = await prisma.systemEmailSettings.findUnique({ where: { id: SETTINGS_ID } });
  if (row) return row;
  return prisma.systemEmailSettings.create({
    data: { id: SETTINGS_ID, enabled: false },
  });
}

export async function updateEmailSettings(actorId: string, input: EmailSettingsInput) {
  const pass = input.smtpPass?.trim();
  return prisma.systemEmailSettings.upsert({
    where: { id: SETTINGS_ID },
    create: {
      id: SETTINGS_ID,
      enabled: input.enabled,
      smtpHost: input.smtpHost?.trim() || null,
      smtpPort: input.smtpPort ?? 587,
      smtpSecure: input.smtpSecure ?? false,
      smtpUser: input.smtpUser?.trim() || null,
      smtpPass: pass || null,
      fromEmail: input.fromEmail?.trim() || null,
      fromName: input.fromName?.trim() || null,
      updatedBy: actorId,
    },
    update: {
      enabled: input.enabled,
      smtpHost: input.smtpHost?.trim() || null,
      smtpPort: input.smtpPort ?? 587,
      smtpSecure: input.smtpSecure ?? false,
      smtpUser: input.smtpUser?.trim() || null,
      ...(pass ? { smtpPass: pass } : {}),
      fromEmail: input.fromEmail?.trim() || null,
      fromName: input.fromName?.trim() || null,
      updatedBy: actorId,
    },
  });
}

function appBaseUrl() {
  return process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? "http://localhost:3000";
}

async function fromAddress(settings: Awaited<ReturnType<typeof getEmailSettings>>) {
  const branding = await getSystemBranding();
  const email = settings.fromEmail?.trim() || settings.smtpUser?.trim() || "noreply@estateflow.local";
  const name = settings.fromName?.trim() || branding.appName;
  return { email, name: `${name} <${email}>` };
}

export async function sendAppEmail(input: { to: string; subject: string; text: string; html?: string }) {
  const settings = await getEmailSettings();
  const from = await fromAddress(settings);

  if (!settings.enabled || !settings.smtpHost) {
    console.info("[email:dev]", { to: input.to, subject: input.subject, text: input.text });
    return { delivered: false, dev: true };
  }

  const transport = nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpSecure,
    auth:
      settings.smtpUser && settings.smtpPass
        ? { user: settings.smtpUser, pass: settings.smtpPass }
        : undefined,
  });

  await transport.sendMail({
    from: from.name,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html ?? input.text.replace(/\n/g, "<br/>"),
  });

  return { delivered: true, dev: false };
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const branding = await getSystemBranding();
  const url = `${appBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  const subject = `Reset your ${branding.appName} password`;
  const text = [
    `You requested a password reset for ${branding.appName}.`,
    "",
    `Open this link within one hour:`,
    url,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  return sendAppEmail({ to: email, subject, text });
}

export async function sendOrganizationInviteEmail(input: {
  email: string;
  organizationName: string;
  role: string;
  token: string;
}) {
  const branding = await getSystemBranding();
  const url = `${appBaseUrl()}/accept-invite?token=${encodeURIComponent(input.token)}`;
  const subject = `You're invited to ${input.organizationName} on ${branding.appName}`;
  const text = [
    `You've been invited to join ${input.organizationName} as ${input.role}.`,
    "",
    `Accept the invite:`,
    url,
    "",
    "This link expires in seven days.",
  ].join("\n");

  return sendAppEmail({ to: input.email, subject, text });
}

export async function sendTestEmail(actorEmail: string) {
  return sendAppEmail({
    to: actorEmail,
    subject: "EstateFlow email test",
    text: "SMTP settings are working. Password reset and invite emails will use this configuration.",
  });
}
