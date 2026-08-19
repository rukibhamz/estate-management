import { requireUser } from "@/lib/guard";
import { evaluateAlerts } from "@/server/alerts";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { actionRunAlerts } from "@/app/actions";

export default async function AlertsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  await requireUser();
  const { projectId } = await params;
  const alerts = await evaluateAlerts(projectId);

  return (
    <>
      <PageHeader
        eyebrow="Watch"
        title="Alerts"
        description="Overdue milestones, budget overruns, and stale progress (7 days)."
        actions={
          <form action={actionRunAlerts.bind(null, projectId)}>
            <Button type="submit" variant="secondary">
              Re-evaluate
            </Button>
          </form>
        }
      />
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-body-md text-ink-muted">No alerts.</p>
            </CardBody>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id}>
              <CardBody className="flex items-center justify-between">
                <div>
                  <Badge status={alert.type} />
                  <p className="mt-2 font-mono text-mono-data text-ink-muted">
                    {alert.recordType} {alert.recordId}
                  </p>
                </div>
                <p className="text-body-md text-ink-muted">{alert.triggeredAt.toISOString()}</p>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
