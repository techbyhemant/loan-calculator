import { router } from "@/server/trpc";
import { loansRouter } from "./loans";
import { partPaymentsRouter } from "./partPayments";
import { userRouter } from "./user";
import { creditCardsRouter } from "./creditCards";
import { loanRateHistoryRouter } from "./loanRateHistory";

export const appRouter = router({
  loans: loansRouter,
  partPayments: partPaymentsRouter,
  user: userRouter,
  creditCards: creditCardsRouter,
  loanRateHistory: loanRateHistoryRouter,
});

export type AppRouter = typeof appRouter;
