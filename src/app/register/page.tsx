import { AuthFrame } from "@/components/AuthFrame";
import { actionRegister } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <AuthFrame title="Create account" subtitle="Owner/Admin of your first project">
      <form action={actionRegister} className="space-y-4">
        <Field label="Name">
          <Input name="name" required />
        </Field>
        <Field label="Email">
          <Input name="email" type="email" required />
        </Field>
        <Field label="Password">
          <Input name="password" type="password" minLength={8} required />
        </Field>
        <Button type="submit" className="w-full">
          Register
        </Button>
      </form>
      <p className="mt-6 text-center text-body-md text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </p>
    </AuthFrame>
  );
}
