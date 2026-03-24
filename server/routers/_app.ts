import { router } from "@/server/trpc";
import { loansRouter } from "./loans";
import { partPaymentsRouter } from "./partPayments";
import { userRouter } from "./user";
import { creditCardsRouter } from "./creditCards";

export const appRouter = router({
  loans: loansRouter,
  partPayments: partPaymentsRouter,
  user: userRouter,
  creditCards: creditCardsRouter,
});

export type AppRouter = typeof appRouter;
