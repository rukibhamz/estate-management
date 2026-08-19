import { Card, CardBody } from "./ui/Card";

export function AuthFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        <p className="mb-6 text-center text-headline-md text-precision">EstateFlow</p>
        <Card>
          <CardBody>
            <h1 className="text-headline-md text-precision">{title}</h1>
            <p className="mb-6 mt-1 text-body-md text-ink-muted">{subtitle}</p>
            {children}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
