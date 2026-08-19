import { requireUser } from "@/lib/guard";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return children;
}
