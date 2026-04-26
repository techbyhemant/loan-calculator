import {
  pgTable,
  text,
  timestamp,
  boolean,
  numeric,
  integer,
  uuid,
  varchar,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

// ── Auth tables (required by @auth/drizzle-adapter) ──────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  plan: varchar("plan", { length: 10 }).default("free").notNull(), // "free" | "pro"
  planExpiry: timestamp("plan_expiry", { mode: "date" }),
  razorpayCustomerId: text("razorpay_customer_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
    index("idx_accounts_user").on(account.userId),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: text("session_token").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => [index("idx_sessions_user").on(session.userId)],
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ],
);

// ── Loan table ───────────────────────────────────────────────

export const loans = pgTable(
  "loans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: varchar("type", { length: 30 }).notNull().default("personal"),
    lender: text("lender").default(""),
    originalAmount: numeric("original_amount", {
      precision: 15,
      scale: 2,
    }).notNull(),
    currentOutstanding: numeric("current_outstanding", {
      precision: 15,
      scale: 2,
    }).notNull(),
    interestRate: numeric("interest_rate", {
      precision: 5,
      scale: 2,
    }).notNull(),
    emiAmount: numeric("emi_amount", { precision: 12, scale: 2 }).notNull(),
    emiDate: integer("emi_date").default(1),
    startDate: timestamp("start_date", { mode: "date" }).notNull(),
    tenureMonths: integer("tenure_months").notNull(),
    rateType: varchar("rate_type", { length: 10 }).default("floating"),
    prepaymentPenalty: numeric("prepayment_penalty", {
      precision: 4,
      scale: 2,
    }).default("0"),
    moratoriumEndDate: timestamp("moratorium_end_date", { mode: "date" }),
    isActive: boolean("is_active").default(true).notNull(),
    notes: text("notes").default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // The dashboard's hot path: WHERE user_id = ? AND is_active = true
    // ORDER BY created_at DESC. One composite index covers both filter and
    // sort so Postgres skips a separate sort step.
    index("idx_loans_user_active_created").on(
      table.userId,
      table.isActive,
      table.createdAt,
    ),
  ],
);

// ── Part Payments table ──────────────────────────────────────

export const partPayments = pgTable(
  "part_payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    loanId: uuid("loan_id")
      .notNull()
      .references(() => loans.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
    date: timestamp("date", { mode: "date" }).notNull(),
    reduceType: varchar("reduce_type", { length: 10 }).notNull(), // "emi" | "tenure"
    interestSaved: numeric("interest_saved", {
      precision: 15,
      scale: 2,
    }).default("0"),
    monthsReduced: integer("months_reduced").default(0),
    note: text("note").default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_part_payments_user").on(table.userId),
    index("idx_part_payments_loan").on(table.loanId),
  ],
);

// ── Credit Cards table ───────────────────────────────────────

export const creditCards = pgTable(
  "credit_cards",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    bank: text("bank").notNull(),
    last4Digits: varchar("last_4_digits", { length: 4 }),
    creditLimit: numeric("credit_limit", {
      precision: 15,
      scale: 2,
    }).notNull(),
    outstanding: numeric("outstanding", { precision: 15, scale: 2 })
      .default("0")
      .notNull(),
    monthlyInterestRate: numeric("monthly_interest_rate", {
      precision: 6,
      scale: 4,
    })
      .default("0.035")
      .notNull(),
    minimumDuePercent: numeric("minimum_due_percent", {
      precision: 4,
      scale: 2,
    })
      .default("0.05")
      .notNull(),
    billingDate: integer("billing_date").default(1),
    dueDate: integer("due_date").default(21),
    lastStatementBalance: numeric("last_statement_balance", {
      precision: 15,
      scale: 2,
    }),
    isActive: boolean("is_active").default(true).notNull(),
    notes: text("notes").default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_credit_cards_user_active").on(table.userId, table.isActive),
  ],
);
