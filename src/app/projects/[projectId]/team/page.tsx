import { requireUser } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { actionChangeRole, actionInvite, actionRemoveMember, actionTransfer, actionArchiveProject } from "@/app/actions";
import { PROJECT_ROLES } from "@/core/permissions";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const user = await requireUser();
  const { projectId } = await params;
  const members = await prisma.projectMembership.findMany({
    where: { projectId, status: { in: ["ACTIVE", "PENDING"] } },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <Card className="mb-8 max-w-xl">
        <CardBody>
          <form action={actionInvite.bind(null, projectId)} className="space-y-3">
            <Field label="Email">
              <Input name="email" type="email" required />
            </Field>
            <Field label="Role">
              <Select name="role" defaultValue="VIEWER">
                {PROJECT_ROLES.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </Select>
            </Field>
            <Button type="submit">Invite</Button>
          </form>
        </CardBody>
      </Card>
      <div className="space-y-3">
        {members.map((member) => (
          <Card key={member.id}>
            <CardBody className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-body-lg">{member.user?.name ?? member.invitedEmail}</p>
                <p className="font-mono text-mono-data text-ink-muted">{member.user?.email ?? member.invitedEmail}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge status={member.status} />
                <form action={actionChangeRole.bind(null, projectId, member.id)} className="flex gap-2">
                  <Select name="role" defaultValue={member.role} className="w-auto">
                    {PROJECT_ROLES.map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                  </Select>
                  <Button size="sm" variant="secondary" type="submit">
                    Role
                  </Button>
                </form>
                {member.userId ? (
                  <form action={actionTransfer.bind(null, projectId)}>
                    <input type="hidden" name="userId" value={member.userId} />
                    <Button size="sm" variant="ghost" type="submit">
                      Make owner
                    </Button>
                  </form>
                ) : null}
                <form action={actionRemoveMember.bind(null, projectId, member.id)}>
                  <Button size="sm" variant="danger" type="submit">
                    Remove
                  </Button>
                </form>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      <form action={actionArchiveProject.bind(null, projectId)} className="mt-10">
        <Button variant="danger" type="submit">
          Archive project
        </Button>
      </form>
    </>
  );
}
