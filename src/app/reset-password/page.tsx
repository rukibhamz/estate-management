import { AuthFrame } from "@/components/AuthFrame";
import { actionResetPassword } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <AuthFrame title="Set a new password" subtitle="Token expires in one hour">
      <form action={actionResetPassword} className="space-y-4">
        <input type="hidden" name="token" defaultValue={token} />
        <Field label="New password">
          <Input name="password" type="password" minLength={8} required />
        </Field>
        <Button type="submit" className="w-full">
          Update password
        </Button>
      </form>
    </AuthFrame>
  );
}
