"use client";

import { Card, CardBody } from "./ui/Card";
import { BrandLogo } from "./BrandLogo";
import { PublicLayout } from "./PublicLayout";
import type { ReactNode } from "react";

export function AuthFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <PublicLayout>
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <BrandLogo showName markClassName="h-10 w-10" nameClassName="text-headline-md font-semibold text-ink" />
          </div>
          <Card>
            <CardBody>
              <h1 className="text-headline-md text-ink">{title}</h1>
              <p className="mb-6 mt-1 text-body-md text-ink-muted">{subtitle}</p>
              {children}
            </CardBody>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
