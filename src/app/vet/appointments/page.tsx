import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Shell } from "@/components/shell";
import { LeftSidebar } from "@/components/left-sidebar";
import { CancelButton } from "./cancel-button";

const STATUS_VARIANT = {
  confirmed: "success",
  cancelled: "muted",
  completed: "default",
} as const;

export default async function MyAppointmentsPage() {
  const user = await requireUser();

  const appointments = await prisma.appointment.findMany({
    where: { ownerId: user.id },
    orderBy: { scheduledAt: "desc" },
    include: { pet: true, vet: true },
  });

  return (
    <Shell left={<LeftSidebar />}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My appointments</h1>
          <Link href="/vet" className="text-sm text-primary underline">
            Book another
          </Link>
        </div>

        {appointments.length === 0 && <EmptyState>No appointments booked yet.</EmptyState>}

        <div className="flex flex-col gap-3">
          {appointments.map((appt) => (
            <Card key={appt.id} className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{appt.vet.clinicName}</p>
                  <Badge variant={STATUS_VARIANT[appt.status as keyof typeof STATUS_VARIANT] ?? "default"}>
                    {appt.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted">
                  {appt.pet.name} · {appt.reason}
                </p>
                <p className="text-sm text-muted">
                  {appt.scheduledAt.toLocaleDateString()} at{" "}
                  {appt.scheduledAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {appt.status === "confirmed" && <CancelButton id={appt.id} />}
            </Card>
          ))}
        </div>
      </div>
    </Shell>
  );
}
