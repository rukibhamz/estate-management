import { requireUser } from "@/lib/guard";
import { listAudit } from "@/server/dashboard";
import { Card, CardBody } from "@/components/ui/Card";

export default async function AuditPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const user = await requireUser();
  const { projectId } = await params;
  const logs = await listAudit(user.id, projectId);

  return (
    <>
      <div className="relative ml-3 border-l border-outline-subtle/70 pl-6">
        {logs.map((log) => (
          <Card key={log.id} className="mb-4">
            <CardBody>
              <p className="text-label-sm uppercase text-ink-muted">
                {log.timestamp.toISOString()} · {log.action}
              </p>
              <p className="mt-1 text-body-lg">
                {log.recordType}{" "}
                <span className="font-mono text-mono-data text-ink-muted">{log.recordId}</span>
              </p>
              <p className="mt-2 text-body-md">
                <span className="text-critical-error line-through">
                  {log.oldValue ? JSON.stringify(log.oldValue) : "—"}
                </span>
                {" → "}
                <span className="text-success">{log.newValue ? JSON.stringify(log.newValue) : "—"}</span>
              </p>
            </CardBody>
          </Card>
        ))}
      </div>
    </>
  );
}
