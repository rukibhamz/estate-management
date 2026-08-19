import { actionCreateProject } from "@/app/actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/guard";

export default async function NewProjectPage() {
  const user = await requireUser();
  return (
    <AppShell userName={user.name ?? user.email ?? "User"}>
      <PageHeader eyebrow="Workspace" title="New project" description="You become the Owner/Admin." />
      <Card className="max-w-xl">
        <CardBody>
          <form action={actionCreateProject} className="space-y-4">
            <Field label="Name">
              <Input name="name" required />
            </Field>
            <Field label="Location">
              <Input name="location" />
            </Field>
            <Field label="Description">
              <Textarea name="description" />
            </Field>
            <Button type="submit">Create project</Button>
          </form>
        </CardBody>
      </Card>
    </AppShell>
  );
}
