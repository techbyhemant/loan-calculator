/**
 * Indian Finance Event Calendar
 *
 * Pre-schedules blog posts for predictable finance events.
 * The scheduler checks this daily and queues posts 2-3 days before each event.
 */

export interface FinanceEvent {
  name: string;
  /** Month (1-12) and day (1-31). If day is 0, it means "any time in this month" */
  month: number;
  day: number;
  /** How many days before the event to publish the preparatory post */
  publishDaysBefore: number;
  /** Blog topic to generate */
  topic: {
    title: string;
    slug: string;
    seoKeyword: string;
    category: string;
    relatedCalculator: string;
    description: string;
  };
  /** Does this topic need to be regenerated every year? */
  recurring: boolean;
}

export const FINANCE_CALENDAR: FinanceEvent[] = [
  // ─── RBI MPC Meetings (6 per year) ────────────────
  // Dates for 2026 — update annually
  {
    name: "RBI MPC Feb 2026",
    month: 2, day: 7,
    publishDaysBefore: 2,
    recurring: true,
    topic: {
      title: "RBI MPC February 2026: Will Repo Rate Be Cut Again? EMI Impact Analysis",
      slug: "rbi-mpc-february-2026-repo-rate-emi-impact",
      seoKeyword: "RBI MPC February 2026 repo rate",
      category: "RBI Policy",
      relatedCalculator: "/rbi-rates",
      description: "Analysis of expected RBI MPC decision and its impact on your home loan EMI. We calculate the exact EMI change for different loan amounts.",
    },
  },
  {
    name: "RBI MPC Apr 2026",
    month: 4, day: 9,
    publishDaysBefore: 2,
    recurring: true,
    topic: {
      title: "RBI MPC April 2026: Rate Decision and Your EMI — What to Expect",
      slug: "rbi-mpc-april-2026-rate-decision-emi",
      seoKeyword: "RBI MPC April 2026",
      category: "RBI Policy",
      relatedCalculator: "/rbi-rates",
      description: "Pre-MPC analysis: what a rate cut, hold, or hike means for your floating rate EMI. Calculated for ₹30L, ₹50L, and ₹75L home loans.",
    },
  },
  {
    name: "RBI MPC Jun 2026",
    month: 6, day: 6,
    publishDaysBefore: 2,
    recurring: true,
    topic: {
      title: "RBI MPC June 2026: Repo Rate Outlook and Home Loan EMI Calculator",
      slug: "rbi-mpc-june-2026-repo-rate-outlook",
      seoKeyword: "RBI MPC June 2026 repo rate",
      category: "RBI Policy",
      relatedCalculator: "/rbi-rates",
      description: "June 2026 MPC preview with EMI impact scenarios for all loan amounts.",
    },
  },
  {
    name: "RBI MPC Aug 2026",
    month: 8, day: 8,
    publishDaysBefore: 2,
    recurring: true,
    topic: {
      title: "RBI MPC August 2026: Rate Decision Impact on Your Loan EMI",
      slug: "rbi-mpc-august-2026-rate-impact",
      seoKeyword: "RBI MPC August 2026",
      category: "RBI Policy",
      relatedCalculator: "/rbi-rates",
      description: "August MPC analysis with calculated EMI impact for home, car, and personal loans.",
    },
  },
  {
    name: "RBI MPC Oct 2026",
    month: 10, day: 9,
    publishDaysBefore: 2,
    recurring: true,
    topic: {
      title: "RBI October 2026 Policy: Will Rates Change Before Diwali?",
      slug: "rbi-october-2026-policy-diwali-rates",
      seoKeyword: "RBI October 2026 policy rate",
      category: "RBI Policy",
      relatedCalculator: "/rbi-rates",
      description: "Pre-Diwali rate decision analysis and its impact on festive season home loan offers.",
    },
  },
  {
    name: "RBI MPC Dec 2026",
    month: 12, day: 6,
    publishDaysBefore: 2,
    recurring: true,
    topic: {
      title: "RBI December 2026 MPC: Year-End Rate Decision and 2027 Outlook",
      slug: "rbi-december-2026-mpc-year-end",
      seoKeyword: "RBI December 2026 MPC repo rate",
      category: "RBI Policy",
      relatedCalculator: "/rbi-rates",
      description: "Final MPC of 2026: rate decision analysis plus 2027 outlook for borrowers.",
    },
  },

  // ─── Tax Season ────────────────────────────────────
  {
    name: "Tax saving deadline approaching",
    month: 1, day: 15,
    publishDaysBefore: 0,
    recurring: true,
    topic: {
      title: "Last 75 Days to Save Tax: Home Loan + 80C + 80E Deduction Checklist",
      slug: "tax-saving-deadline-80c-24b-80e-checklist",
      seoKeyword: "tax saving deadline 80C home loan",
      category: "Tax Benefits",
      relatedCalculator: "/calculators/tax-benefit",
      description: "Complete checklist of tax deductions available on home loans, education loans, and investments before March 31. Calculate your exact savings.",
    },
  },
  {
    name: "Last week tax saving rush",
    month: 3, day: 20,
    publishDaysBefore: 0,
    recurring: true,
    topic: {
      title: "10 Days Left: Maximum Tax Saving With Your Home Loan Before March 31",
      slug: "last-days-tax-saving-home-loan-march",
      seoKeyword: "last date tax saving home loan March",
      category: "Tax Benefits",
      relatedCalculator: "/calculators/tax-benefit",
      description: "Final countdown: maximize your Section 80C and 24(b) claims before the deadline. Part payment strategy to boost deductions.",
    },
  },
  {
    name: "New financial year planning",
    month: 4, day: 1,
    publishDaysBefore: 0,
    recurring: true,
    topic: {
      title: "New Financial Year Loan Strategy: What to Do With Your EMIs in FY 2026-27",
      slug: "new-financial-year-loan-strategy-fy-2026-27",
      seoKeyword: "new financial year loan strategy",
      category: "Debt Strategy",
      relatedCalculator: "/calculators/multi-loan-planner",
      description: "April reset: review your loan portfolio, recalculate tax benefits under new regime, and plan part payments for maximum interest savings.",
    },
  },
  {
    name: "ITR filing season",
    month: 7, day: 1,
    publishDaysBefore: 0,
    recurring: true,
    topic: {
      title: "Filing ITR? Don't Miss These Home Loan and Education Loan Tax Claims",
      slug: "itr-filing-home-loan-education-loan-claims",
      seoKeyword: "ITR filing home loan tax benefit claim",
      category: "Tax Benefits",
      relatedCalculator: "/calculators/tax-benefit",
      description: "Step-by-step guide to claiming Section 24(b), 80C, and 80E deductions while filing your income tax return. Common mistakes that cost borrowers thousands.",
    },
  },

  // ─── Union Budget ──────────────────────────────────
  {
    name: "Union Budget",
    month: 2, day: 1,
    publishDaysBefore: 3,
    recurring: true,
    topic: {
      title: "Union Budget 2026: What Home Loan and Education Loan Borrowers Should Watch",
      slug: "union-budget-2026-home-loan-education-loan",
      seoKeyword: "Union Budget 2026 home loan tax benefit",
      category: "Policy",
      relatedCalculator: "/calculators/tax-benefit",
      description: "Pre-budget analysis: potential changes to Section 80C limits, 24(b) deduction, stamp duty benefits, and education loan 80E that could affect your EMI planning.",
    },
  },

  // ─── Festival Season ───────────────────────────────
  {
    name: "Diwali EMI offers",
    month: 10, day: 15,
    publishDaysBefore: 5,
    recurring: true,
    topic: {
      title: "Diwali 2026 No-Cost EMI Offers: What's the Real Cost? We Calculated",
      slug: "diwali-2026-no-cost-emi-real-cost",
      seoKeyword: "Diwali no cost EMI offers real cost",
      category: "Consumer Finance",
      relatedCalculator: "/calculators/consumer-emi-true-cost",
      description: "Festive season EMI deals look free but aren't. We calculate the true cost of popular Diwali offers on electronics, appliances, and phones.",
    },
  },
  {
    name: "Year-end bonus allocation",
    month: 11, day: 1,
    publishDaysBefore: 0,
    recurring: true,
    topic: {
      title: "Got Your Diwali Bonus? Here's the Smartest Way to Use It on Your Loans",
      slug: "diwali-bonus-best-use-loan-prepayment",
      seoKeyword: "Diwali bonus loan prepayment or invest",
      category: "Debt Strategy",
      relatedCalculator: "/calculators/sip-vs-prepayment",
      description: "₹1L bonus: prepay home loan, clear credit card, or invest in SIP? We run all three scenarios with exact numbers for your situation.",
    },
  },

  // ─── Year-End ──────────────────────────────────────
  {
    name: "Year-end financial review",
    month: 12, day: 20,
    publishDaysBefore: 0,
    recurring: true,
    topic: {
      title: "2026 Year-End Loan Review: 5 Things Every Borrower Must Check Before January",
      slug: "year-end-2026-loan-review-checklist",
      seoKeyword: "year end loan review checklist",
      category: "Debt Strategy",
      relatedCalculator: "/dashboard",
      description: "Annual checklist: verify outstanding balance, check if bank passed rate cuts, calculate interest paid for tax claims, and set 2027 debt-free goals.",
    },
  },
];

/**
 * Returns events that should trigger blog posts today.
 * Checks if today is within the publish window for any upcoming event.
 */
export function getEventsForToday(today: Date = new Date()): FinanceEvent[] {
  const month = today.getMonth() + 1;
  const day = today.getDate();

  return FINANCE_CALENDAR.filter((event) => {
    const eventDate = new Date(today.getFullYear(), event.month - 1, event.day);
    const publishDate = new Date(eventDate);
    publishDate.setDate(publishDate.getDate() - event.publishDaysBefore);

    const publishMonth = publishDate.getMonth() + 1;
    const publishDay = publishDate.getDate();

    return month === publishMonth && day === publishDay;
  });
}

/**
 * Returns all events in the next N days for preview/planning.
 */
export function getUpcomingEvents(days: number = 30, today: Date = new Date()): FinanceEvent[] {
  const upcoming: FinanceEvent[] = [];

  for (let i = 0; i <= days; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() + i);
    const events = getEventsForToday(checkDate);
    upcoming.push(...events);
  }

  return upcoming;
}
