import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { AdoptionForm } from "./adoption-form";

export default async function NewAdoptionListingPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto flex w-full min-h-[calc(100vh-65px)] max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Post an adoptable pet</h1>
      <Card>
        <AdoptionForm ownerId={user.id} />
      </Card>
    </main>
  );
}
