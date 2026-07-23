import { prisma } from "@/lib/prisma";

const DEMO_VETS = [
  {
    name: "Dr. Amara Patel",
    clinicName: "Riverside Animal Hospital",
    location: "1.2 mi away",
    bio: "General wellness, vaccines, and dental care for dogs and cats.",
    rating: 4.9,
  },
  {
    name: "Dr. Marcus Lee",
    clinicName: "Bay Area Vet Clinic",
    location: "2.8 mi away",
    bio: "Exotic pets, surgery, and emergency care.",
    rating: 4.7,
  },
  {
    name: "Dr. Priya Nair",
    clinicName: "Sunnyvale Pet Wellness",
    location: "4.1 mi away",
    bio: "Puppy and kitten checkups, senior pet care.",
    rating: 4.8,
  },
];

export async function ensureVetsSeeded() {
  const count = await prisma.vet.count();
  if (count === 0) {
    await prisma.vet.createMany({ data: DEMO_VETS });
  }
}
