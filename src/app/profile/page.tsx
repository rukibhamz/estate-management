import { requireUser } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { actionUpdateProfile } from "@/app/actions";

export default async function ProfilePage() {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });

  return (
    <AppShell userName={sessionUser.name ?? "User"}>
      <PageHeader eyebrow="Account" title="Profile" />
      <Card className="max-w-lg">
        <CardBody>
          <form action={actionUpdateProfile} className="space-y-3">
            <Field label="Name">
              <Input name="name" defaultValue={user?.name} required />
            </Field>
            <Field label="Current password">
              <Input name="currentPassword" type="password" />
            </Field>
            <Field label="New password">
              <Input name="password" type="password" />
            </Field>
            <Button type="submit">Save</Button>
          </form>
        </CardBody>
      </Card>
    </AppShell>
  );
}
