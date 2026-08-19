"use client";

import { signOut } from "next-auth/react";
import { Button } from "./ui/Button";

export function SignOutButton() {
  return (
    <Button variant="ghost" size="sm" type="button" onClick={() => signOut({ callbackUrl: "/login" })}>
      Sign out
    </Button>
  );
}
