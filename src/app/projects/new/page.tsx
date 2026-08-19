import { actionCreateProject } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";

export default function NewProjectPage() {
  return (
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
  );
}
