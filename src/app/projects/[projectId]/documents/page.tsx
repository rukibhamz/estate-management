import { requireUser } from "@/lib/guard";
import { listDocuments } from "@/server/documents";
import { signedDownloadPath } from "@/lib/storage";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { actionUploadDocument } from "@/app/actions";
import { prisma } from "@/lib/prisma";

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const user = await requireUser();
  const { projectId } = await params;
  const [docs, units] = await Promise.all([
    listDocuments(user.id, projectId),
    prisma.unit.findMany({ where: { projectId }, select: { id: true, unitRef: true } }),
  ]);

  return (
    <>
      <Card className="mb-8 max-w-xl">
        <CardBody>
          <form action={actionUploadDocument.bind(null, projectId)} className="space-y-3">
            <Field label="Linked type">
              <Select name="linkedType" defaultValue="UNIT">
                {["ESTATE", "LAND", "DEVELOPMENT", "PHASE", "UNIT", "SALE", "PAYMENT", "PROGRESS_UPDATE", "PROJECT"].map(
                  (t) => (
                    <option key={t}>{t}</option>
                  ),
                )}
              </Select>
            </Field>
            <Field label="Linked record">
              <Select name="linkedId">
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.unitRef}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Description">
              <Textarea name="description" />
            </Field>
            <Field label="File">
              <Input name="file" type="file" required />
            </Field>
            <Button type="submit">Upload</Button>
          </form>
        </CardBody>
      </Card>
      <div className="space-y-3">
        {docs.map((doc) => (
          <Card key={doc.id}>
            <CardBody className="flex items-center justify-between gap-4">
              <div>
                <p className="text-body-lg">{doc.description ?? doc.fileKey}</p>
                <p className="font-mono text-mono-data text-ink-muted">
                  {doc.linkedType} · {doc.category}
                </p>
              </div>
              <a className="text-body-md font-medium text-forest underline" href={signedDownloadPath(doc.fileKey)}>
                Download
              </a>
            </CardBody>
          </Card>
        ))}
      </div>
    </>
  );
}
