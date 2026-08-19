import { AuthenticatedShell } from "@/components/AuthenticatedShell";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
