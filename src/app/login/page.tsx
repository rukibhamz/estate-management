"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { AuthFrame } from "@/components/AuthFrame";

export default function LoginPage() {
  const [error, setError] = useState("");

  async function onSubmit(form: FormData) {
    setError("");
    const result = await signIn("credentials", {
      email: String(form.get("email")),
      password: String(form.get("password")),
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid email or password");
      return;
    }
    const session = await getSession();
    window.location.href = session?.user?.isPlatformAdmin ? "/admin" : "/projects";
  }

  return (
    <AuthFrame title="Sign in" subtitle="Continue to your projects">
      <form action={onSubmit} className="space-y-4">
        <Field label="Email">
          <Input name="email" type="email" required />
        </Field>
        <Field label="Password">
          <Input name="password" type="password" required />
        </Field>
        {error ? <p className="text-body-md text-critical-error">{error}</p> : null}
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-body-md text-ink-muted">
        <Link href="/forgot-password" className="underline">
          Forgot password
        </Link>
        {" · "}
        <Link href="/register" className="underline">
          Create account
        </Link>
      </p>
    </AuthFrame>
  );
}
