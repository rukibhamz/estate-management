import { AuthFrame } from "@/components/AuthFrame";
import { actionRegister } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import Link from "next/link";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthFrame title="Create account" subtitle="Register your company or work as an individual">
      <form action={actionRegister} className="space-y-4">
        <Field label="Your name">
          <Input name="name" required />
        </Field>
        <Field label="Email">
          <Input name="email" type="email" required defaultValue={email} />
        </Field>
        <Field label="Password">
          <Input name="password" type="password" minLength={8} required />
        </Field>
        <Field label="Account type">
          <Select name="organizationType" defaultValue="COMPANY">
            <option value="COMPANY">Company / team</option>
            <option value="INDIVIDUAL">Individual</option>
          </Select>
        </Field>
        <Field label="Organization name">
          <Input name="organizationName" required placeholder="Company name or your name" />
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
