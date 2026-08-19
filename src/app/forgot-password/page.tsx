import { AuthFrame } from "@/components/AuthFrame";
import { actionRequestReset } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export default function ForgotPage() {
  return (
    <AuthFrame title="Reset password" subtitle="We’ll issue a one-hour reset token">
      <form action={actionRequestReset} className="space-y-4">
        <Field label="Email">
          <Input name="email" type="email" required />
        </Field>
        <Button type="submit" className="w-full">
          Send reset link
        </Button>
      </form>
      <p className="mt-4 text-body-md text-ink-muted">
        In development, the token is returned by the action and printed in the server log. Use
        /reset-password?token=…
      </p>
    </AuthFrame>
  );
}
