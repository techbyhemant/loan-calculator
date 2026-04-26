import { createServerCaller } from "@/lib/trpc/server";
import CreditCardsClient from "./CreditCardsClient";

export default async function CreditCardsPage() {
  const trpc = await createServerCaller();
  // Run both queries in parallel — same connection, no waterfall
  const [initialCards, initialStats] = await Promise.all([
    trpc.creditCards.getAll(),
    trpc.creditCards.getStats(),
  ]);
  return (
    <CreditCardsClient
      initialCards={initialCards}
      initialStats={initialStats}
    />
  );
}
