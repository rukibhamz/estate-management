"use client";

import { Card, CardBody } from "./ui/Card";
import { BrandLogo } from "./BrandLogo";
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-forest-ink">
          <BrandLogo
            stacked
            showName
            markClassName="h-10 w-10"
            nameClassName="mt-0 text-headline-md font-semibold text-ink"
          />
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
  );
}
