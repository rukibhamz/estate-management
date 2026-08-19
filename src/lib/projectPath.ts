export function projectIdFromPath(pathname: string): string | undefined {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "projects" || !parts[1] || parts[1] === "new") return undefined;
  return parts[1];
}
