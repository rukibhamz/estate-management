import Link from "next/link";
import { authSession } from "@/lib/guard";
import { getInviteByToken } from "@/server/organizations";
import { acceptOrganizationInviteAction } from "@/app/actions";
import { AuthFrame } from "@/components/AuthFrame";
import { Button } from "@/components/ui/Button";
import { TENANT_ROLE_LABELS } from "@/core/tenant";

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <AuthFrame title="Invalid invite" subtitle="This invite link is missing a token.">
        <Link href="/login" className="text-body-md text-forest-ink underline">
          Sign in
        </Link>
      </AuthFrame>
    );
  }

  const invite = await getInviteByToken(token);
  if (!invite) {
    return (
      <AuthFrame title="Invite expired" subtitle="Ask your admin to send a new invitation.">
        <Link href="/login" className="text-body-md text-forest-ink underline">
          Sign in
        </Link>
      </AuthFrame>
    );
  }

  const session = await authSession();

  return (
    <AuthFrame
      title={`Join ${invite.organization.name}`}
      subtitle={`You were invited as ${TENANT_ROLE_LABELS[invite.role]}.`}
    >
      {session?.user ? (
        <form action={acceptOrganizationInviteAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <p className="text-body-md text-ink-muted">
            Signed in as <span className="font-medium text-ink">{session.user.email}</span>
          </p>
          <Button type="submit" className="w-full">
            Accept invite
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-body-md text-ink-muted">
            Sign in or create an account with <span className="font-mono">{invite.email}</span> to join.
          </p>
          <Link href={`/login?callbackUrl=${encodeURIComponent(`/accept-invite?token=${token}`)}`}>
            <Button className="w-full">Sign in</Button>
          </Link>
          <Link
            href={`/register?email=${encodeURIComponent(invite.email)}`}
            className="block text-center text-body-md text-forest-ink underline"
          >
            Create account
          </Link>
        </div>
      )}
    </AuthFrame>
  );
}
