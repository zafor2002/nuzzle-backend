import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Shell } from "@/components/shell";
import { LeftSidebar } from "@/components/left-sidebar";
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
  const days: { value: string; label: string }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      value: formatDate(d),
      label: d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" }),
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
  const availableTimes = TIME_SLOTS.filter((t) => {
    if (bookedTimes.has(t)) return false;
    const slotDateTime = new Date(`${selectedDate}T${t}:00`);
    return slotDateTime > now;
  });

  const pets = await prisma.pet.findMany({
    where: { ownerId: user.id },
    select: { id: true, name: true },
  });

  return (
    <Shell left={<LeftSidebar />}>
      <div className="flex flex-col gap-4">
        <Link href="/vet" className="text-sm text-muted hover:text-primary">
          &larr; All vets
        </Link>

        <Card>
          <p className="font-semibold">{vet.clinicName}</p>
          <p className="text-sm text-muted">
            {vet.name}
            {vet.location ? ` · ${vet.location}` : ""} · ⭐ {vet.rating.toFixed(1)}
          </p>
        </Card>

        {pets.length === 0 ? (
          <EmptyState>
            You need a pet profile before booking.{" "}
            <Link href="/pets/new" className="text-primary underline">
              Add a pet
            </Link>
            .
          </EmptyState>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto">
              {days.map((day) => (
                <Link
                  key={day.value}
                  href={`/vet/${vet.id}?date=${day.value}`}
                  className={`shrink-0 rounded-md border border-border px-3 py-2 text-center text-sm ${
                    day.value === selectedDate ? "bg-primary text-primary-foreground" : "bg-card"
                  }`}
                >
                  {day.label}
                </Link>
              ))}
            </div>

            <BookingForm vetId={vet.id} date={selectedDate} pets={pets} availableTimes={availableTimes} />
          </>
        )}
      </div>
    </Shell>
  );
}
