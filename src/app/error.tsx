"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-headline-md text-ink">Something went wrong</h1>
      <p className="max-w-md text-body-md text-ink-muted">
        {error.message || "An unexpected error occurred. Try again or return to your projects."}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
        <Button type="button" variant="secondary" onClick={() => (window.location.href = "/projects")}>
          Go to projects
        </Button>
      </div>
    </div>
  );
}
