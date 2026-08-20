import type { ReactNode } from "react";

export function PublicLayout({ children }: { children: ReactNode }) {
  return <div className="bg-app min-h-screen text-ink">{children}</div>;
}
