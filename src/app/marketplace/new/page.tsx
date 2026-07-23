import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { MarketplaceForm } from "./marketplace-form";

export default async function NewMarketplaceListingPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto flex w-full min-h-[calc(100vh-65px)] max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Sell something</h1>
      <Card>
        <MarketplaceForm ownerId={user.id} />
      </Card>
    </main>
  );
}
