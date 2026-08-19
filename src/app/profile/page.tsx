import { requireUser } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { AuthenticatedShell } from "@/components/AuthenticatedShell";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { actionUpdateProfile } from "@/app/actions";

export default async function ProfilePage() {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });

  return (
    <AuthenticatedShell>
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
    </AuthenticatedShell>
  );
}
