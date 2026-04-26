import { createServerCaller } from "@/lib/trpc/server";
import LoansListClient from "./LoansListClient";

export default async function LoansPage() {
  const trpc = await createServerCaller();
  const initialLoans = await trpc.loans.getAll();
  return <LoansListClient initialLoans={initialLoans} />;
}
