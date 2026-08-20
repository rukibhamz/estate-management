import Link from "next/link";
import { requireUser } from "@/lib/guard";
import { listProjects } from "@/server/projects";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await listProjects(user.id);

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Link href="/projects/new">
          <Button>New project</Button>
        </Link>
      </div>
      {projects.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-body-lg text-ink-muted">No projects yet. Create one to start inventory.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="h-full transition hover:shadow-modal">
                <CardBody>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-headline-md text-ink">{project.name}</h2>
                    <Badge status={project.status} />
                  </div>
                  <p className="mt-2 text-body-md text-ink-muted">
                    {project.organization.name} · {project.location ?? "No location"}
                  </p>
                  <p className="mt-4 font-mono text-mono-data text-ink-muted">
                    {project._count.units} units · {project._count.lands} land · {project._count.sales} sales
                  </p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
