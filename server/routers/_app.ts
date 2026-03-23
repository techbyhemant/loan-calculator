import { router } from "@/server/trpc";
import { loansRouter } from "./loans";
import { partPaymentsRouter } from "./partPayments";
import { userRouter } from "./user";

export const appRouter = router({
  loans: loansRouter,
  partPayments: partPaymentsRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
