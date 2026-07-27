import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Shell } from "@/components/shell";
import { BookingForm } from "./booking-form";

const TIME_SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatLocalTime(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function nextDays(count: number) {
  // Weekday and day number are formatted separately on purpose: a combined
  // format string orders them by locale ("28 Tue" vs "Tue 28"), so splitting
  // one formatted string puts them in the wrong slots for some locales.
  const days: { value: string; weekday: string; day: string }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      value: formatDate(d),
      weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
      day: d.toLocaleDateString(undefined, { day: "numeric" }),
    });
  }
  return days;
}

export default async function VetBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { id } = await params;
  const { date: dateParam } = await searchParams;

  const user = await requireUser();

  const vet = await prisma.vet.findUnique({ where: { id } });
  if (!vet) {
    notFound();
  }

  const days = nextDays(7);
  const selectedDate = dateParam && days.some((d) => d.value === dateParam) ? dateParam : days[0].value;

  const dayStart = new Date(`${selectedDate}T00:00:00`);
  const dayEnd = new Date(`${selectedDate}T23:59:59`);
  const bookedAppointments = await prisma.appointment.findMany({
    where: { vetId: vet.id, status: "confirmed", scheduledAt: { gte: dayStart, lte: dayEnd } },
    select: { scheduledAt: true },
  });
  const bookedTimes = new Set(bookedAppointments.map((a) => formatLocalTime(a.scheduledAt)));
  const now = new Date();
  // Keep every slot so taken/past ones stay visible but unselectable, as in the prototype.
  const slots = TIME_SLOTS.map((t) => ({
    time: t,
    available: !bookedTimes.has(t) && new Date(`${selectedDate}T${t}:00`) > now,
  }));

  const pets = await prisma.pet.findMany({
    where: { ownerId: user.id },
    select: { id: true, name: true },
  });

  return (
    <Shell>
      <div className="flex flex-col gap-4">
        <PageHeader title="Book appointment" back="/vet" />

        <Card padded={false} className="flex gap-3 p-3.5">
          <Avatar name={vet.name} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{vet.name}</p>
            <p className="mt-0.5 truncate text-[11.5px] text-muted">
              {vet.clinicName}
              {vet.location ? ` · ${vet.location}` : ""}
            </p>
            <div className="mt-2">
              <Badge variant="warn">★ {vet.rating.toFixed(1)}</Badge>
            </div>
          </div>
        </Card>

        {pets.length === 0 ? (
          <EmptyState
            icon="pawprint"
            title="Add a pet first"
            action={
              <Link href="/pets/new">
                <Button size="sm">Add a pet</Button>
              </Link>
            }
          >
            Appointments are booked for a specific pet.
          </EmptyState>
        ) : (
          <>
            <div>
              <p className="mb-1.5 text-[12.5px] font-semibold text-muted">Date</p>
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {days.map((day) => {
                  const on = day.value === selectedDate;
                  return (
                    <Link
                      key={day.value}
                      href={`/vet/${vet.id}?date=${day.value}`}
                      className={`w-14 shrink-0 rounded-[15px] border-[1.5px] py-2.5 text-center transition-colors ${
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:bg-muted-bg"
                      }`}
                    >
                      <span className={`block text-[11px] ${on ? "opacity-80" : "text-muted"}`}>
                        {day.weekday}
                      </span>
                      <span className="mt-0.5 block text-base font-bold">{day.day}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <BookingForm vetId={vet.id} date={selectedDate} pets={pets} slots={slots} />
          </>
        )}
      </div>
    </Shell>
  );
}
