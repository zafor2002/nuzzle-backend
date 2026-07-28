import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { PasswordForm } from "./password-form";

export default async function AccountSettingsPage() {
  const user = await requireUser();
  const owner = await prisma.owner.findUniqueOrThrow({
    where: { id: user.id },
    select: { email: true, username: true, createdAt: true },
  });

  const rows = [
    { label: "Email", value: owner.email },
    { label: "Username", value: `@${owner.username}` },
    {
      label: "Joined",
      value: owner.createdAt.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    },
  ];

  return (
    <Shell>
      <PageHeader title="Account" back="/settings" />

      <Card padded={false} className="mt-1 divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 px-3.5 py-3">
            <span className="text-[12.5px] font-semibold text-muted">{row.label}</span>
            <span className="min-w-0 truncate text-sm">{row.value}</span>
          </div>
        ))}
      </Card>
      <p className="mb-4 mt-2 text-[11.5px] leading-relaxed text-muted">
        Your email and username cannot be changed here yet.
      </p>

      <h2 className="mb-2 text-[13px] font-bold text-muted">Change password</h2>
      <PasswordForm />
    </Shell>
  );
}
