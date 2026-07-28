import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/shell";
import { PageHeader } from "@/components/ui/page-header";
import { PrivacyForm } from "./privacy-form";

export default async function PrivacySettingsPage() {
  const user = await requireUser();
  const owner = await prisma.owner.findUniqueOrThrow({
    where: { id: user.id },
    select: { isPrivate: true, isAnonymous: true },
  });

  return (
    <Shell>
      <PageHeader title="Privacy" back="/settings" />
      <p className="mb-3 mt-1 text-[12.5px] leading-relaxed text-muted">
        These two are independent: going private controls <em>who</em> can see you, staying
        anonymous controls <em>what</em> they see of your identity.
      </p>
      <PrivacyForm isPrivate={owner.isPrivate} isAnonymous={owner.isAnonymous} />
    </Shell>
  );
}
