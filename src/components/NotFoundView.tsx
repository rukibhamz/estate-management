"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { MapPinOff } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { Card, CardBody } from "./ui/Card";
import { cn } from "@/lib/cn";

function ActionLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full px-5 text-body-md font-medium transition-colors",
        variant === "primary" && "bg-forest text-white hover:bg-forest-dark",
        variant === "secondary" && "btn-secondary",
      )}
    >
      {children}
    </Link>
  );
}

export function NotFoundView() {
  const { data: session } = useSession();
  const signedIn = Boolean(session?.user);
  const isPlatformAdmin = Boolean(session?.user?.isPlatformAdmin);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex justify-center text-forest-ink">
          <BrandLogo stacked showName markClassName="h-12 w-12" nameClassName="mt-0 text-headline-md text-ink" />
        </div>
        <Card>
          <CardBody className="flex flex-col items-center py-10 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-forest-soft text-forest-ink">
              <MapPinOff size={28} className="stroke-current" />
            </div>
            <p className="font-mono text-mono-data text-ink-muted">404</p>
            <h1 className="mt-2 text-headline-lg text-ink">Page not found</h1>
            <p className="mt-2 max-w-sm text-body-md text-ink-muted">
              This page doesn&apos;t exist, or you don&apos;t have permission to view it.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {signedIn ? (
                <>
                  <ActionLink href="/projects">Go to projects</ActionLink>
                  {isPlatformAdmin ? (
                    <ActionLink href="/admin" variant="secondary">
                      Platform admin
                    </ActionLink>
                  ) : null}
                </>
              ) : (
                <>
                  <ActionLink href="/login">Sign in</ActionLink>
                  <ActionLink href="/" variant="secondary">
                    Back to home
                  </ActionLink>
                </>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
