import { AuthenticatedShell } from "@/components/AuthenticatedShell";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
