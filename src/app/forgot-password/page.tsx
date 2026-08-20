import { AuthFrame } from "@/components/AuthFrame";
import { actionRequestReset } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import Link from "next/link";

export default async function ForgotPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <AuthFrame
      title="Reset password"
      subtitle={sent ? "If that email exists, we sent a reset link." : "We'll email a one-hour reset link"}
    >
      {sent ? (
        <div className="space-y-4">
          <p className="text-body-md text-ink-muted">
            Check your inbox and spam folder. When SMTP is disabled, the link is printed in the server console.
          </p>
          <Link href="/login" className="block text-center text-body-md text-forest-ink underline">
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <form action={actionRequestReset} className="space-y-4">
            <Field label="Email">
              <Input name="email" type="email" required />
            </Field>
            <Button type="submit" className="w-full">
              Send reset link
            </Button>
          </form>
          <p className="mt-6 text-center text-body-md text-ink-muted">
            <Link href="/login" className="underline">
              Back to sign in
            </Link>
          </p>
        </>
      )}
    </AuthFrame>
  );
}
