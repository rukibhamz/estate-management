import { requireUser } from "@/lib/guard";
import { getEmailSettings } from "@/server/email";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { actionUpdateEmailSettings, actionSendTestEmail } from "@/app/actions";

export default async function AdminEmailPage() {
  await requireUser();
  const settings = await getEmailSettings();

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="space-y-4">
          <div>
            <h2 className="text-headline-md text-ink">SMTP settings</h2>
            <p className="mt-1 text-body-md text-ink-muted">
              Used for password reset links and organization invites. When disabled, messages are logged to the server
              console in development.
            </p>
          </div>
          <form action={actionUpdateEmailSettings} className="grid gap-4 md:grid-cols-2">
            <Field label="Email delivery">
              <Select name="enabled" defaultValue={settings.enabled ? "1" : "0"}>
                <option value="0">Disabled (log to console)</option>
                <option value="1">Enabled (send via SMTP)</option>
              </Select>
            </Field>
            <Field label="From name">
              <Input name="fromName" defaultValue={settings.fromName ?? ""} placeholder="EstateFlow" />
            </Field>
            <Field label="From email">
              <Input name="fromEmail" type="email" defaultValue={settings.fromEmail ?? ""} placeholder="noreply@yourdomain.com" />
            </Field>
            <Field label="SMTP host">
              <Input name="smtpHost" defaultValue={settings.smtpHost ?? ""} placeholder="smtp.mailgun.org" />
            </Field>
            <Field label="SMTP port">
              <Input name="smtpPort" type="number" defaultValue={settings.smtpPort} />
            </Field>
            <Field label="Security">
              <Select name="smtpSecure" defaultValue={settings.smtpSecure ? "1" : "0"}>
                <option value="0">STARTTLS (587)</option>
                <option value="1">SSL/TLS (465)</option>
              </Select>
            </Field>
            <Field label="SMTP username">
              <Input name="smtpUser" defaultValue={settings.smtpUser ?? ""} autoComplete="off" />
            </Field>
            <Field label="SMTP password">
              <Input
                name="smtpPass"
                type="password"
                placeholder={settings.smtpPass ? "•••••••• (unchanged if blank)" : "App password"}
                autoComplete="new-password"
              />
            </Field>
            <div className="md:col-span-2 flex flex-wrap gap-3">
              <Button type="submit">Save settings</Button>
            </div>
          </form>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-headline-md text-ink">Send test email</h2>
            <p className="text-body-md text-ink-muted">Delivers to your signed-in account email.</p>
          </div>
          <form action={actionSendTestEmail}>
            <Button type="submit" variant="secondary">
              Send test
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
